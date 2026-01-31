import OpenAI from 'openai'
import { prisma } from './prisma'
import { ensureVectorStore } from './vector-init'

const EMBEDDING_MODEL = 'text-embedding-ada-002'
const EMBEDDING_DIMENSIONS = 1536

// Lazy-load OpenAI client to avoid build-time errors
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI()
  }
  return _openai
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text')
  }
  
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Limit to ~8k chars for token limit
  })
  
  return response.data[0].embedding
}

/**
 * Build searchable text from task fields
 */
function buildTaskText(task: {
  title: string
  description?: string | null
  notes?: string | null
  outcome?: string | null
  blocker?: string | null
  need?: string | null
}): string {
  return [
    task.title,
    task.description,
    task.notes,
    task.outcome,
    task.blocker,
    task.need,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * Generate and store embedding for a task
 */
export async function embedTask(task: {
  id: string
  title: string
  description?: string | null
  notes?: string | null
  outcome?: string | null
  blocker?: string | null
  need?: string | null
}): Promise<void> {
  const text = buildTaskText(task)
  
  if (!text) {
    console.warn(`Task ${task.id} has no text to embed`)
    return
  }
  
  try {
    // Ensure table exists before writing
    await ensureVectorStore()
    
    const embedding = await generateEmbedding(text)
    const embeddingStr = `[${embedding.join(',')}]`
    const id = `emb_${task.id}`
    
    // Upsert embedding
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.task_embedding (id, task_id, embedding, updated_at)
      VALUES ($1, $2, $3::vector, NOW())
      ON CONFLICT (task_id) 
      DO UPDATE SET embedding = $3::vector, updated_at = NOW()
    `, id, task.id, embeddingStr)
    
  } catch (error) {
    // Handle foreign key violation (task was deleted before embedding completed)
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2010') {
      const meta = (error as { meta?: { code?: string } }).meta
      if (meta?.code === '23503') {
        // Task was deleted before embedding could be saved - this is expected, skip silently
        return
      }
    }
    // Log but don't fail task operations if embedding fails for other reasons
    console.error(`Failed to embed task ${task.id}:`, error)
  }
}

/**
 * Search tasks by semantic similarity
 */
export async function searchTasksBySimilarity(
  query: string,
  limit: number = 10,
  minSimilarity: number = 0.5
): Promise<Array<{ taskId: string; similarity: number }>> {
  // Ensure table exists before querying
  await ensureVectorStore()
  
  const queryEmbedding = await generateEmbedding(query)
  const embeddingStr = `[${queryEmbedding.join(',')}]`
  
  // Use template literal to properly inject the vector - pgvector needs the string directly
  const sql = `
    SELECT 
      task_id,
      1 - (embedding <=> '${embeddingStr}'::vector) as similarity
    FROM public.task_embedding
    WHERE 1 - (embedding <=> '${embeddingStr}'::vector) > ${minSimilarity}
    ORDER BY embedding <=> '${embeddingStr}'::vector
    LIMIT ${limit}
  `
  
  const results = await prisma.$queryRawUnsafe<Array<{ task_id: string; similarity: number }>>(sql)
  
  return results.map(r => ({
    taskId: r.task_id,
    similarity: Number(r.similarity),
  }))
}

/**
 * Delete embedding when task is deleted
 */
export async function deleteTaskEmbedding(taskId: string): Promise<void> {
  try {
    await prisma.$executeRawUnsafe(
      `DELETE FROM public.task_embedding WHERE task_id = $1`,
      taskId
    )
  } catch (error) {
    console.error(`Failed to delete embedding for task ${taskId}:`, error)
  }
}

/**
 * Backfill embeddings for all existing tasks
 */
export async function backfillEmbeddings(): Promise<{ success: number; failed: number }> {
  const tasks = await prisma.task.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      notes: true,
      outcome: true,
      blocker: true,
      need: true,
    },
  })
  
  let success = 0
  let failed = 0
  
  for (const task of tasks) {
    try {
      await embedTask(task)
      success++
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100))
    } catch (error) {
      failed++
      console.error(`Failed to backfill task ${task.id}`)
    }
  }
  
  return { success, failed }
}
