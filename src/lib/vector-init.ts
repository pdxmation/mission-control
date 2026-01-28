import { prisma } from './prisma'

const EMBEDDING_DIMENSIONS = 1536
const EMBEDDING_MODEL = 'text-embedding-ada-002'

let initialized = false

/**
 * Initialize pgvector extension and create embeddings table
 * Safe to call multiple times - only runs once per process
 */
export async function ensureVectorStore(): Promise<void> {
  if (initialized) return
  
  try {
    // Enable pgvector extension
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`)
    
    // Create embeddings table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS task_embedding (
        id TEXT PRIMARY KEY,
        task_id TEXT UNIQUE NOT NULL,
        embedding vector(${EMBEDDING_DIMENSIONS}),
        model TEXT DEFAULT '${EMBEDDING_MODEL}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    
    // Add foreign key if not exists (separate statement to handle existing tables)
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE task_embedding 
        ADD CONSTRAINT task_embedding_task_id_fkey 
        FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `)
    
    initialized = true
    console.log('✓ Vector store ready')
  } catch (error: any) {
    // Log but don't crash - pgvector might not be available
    console.warn('Vector store init warning:', error?.message || error)
  }
}
