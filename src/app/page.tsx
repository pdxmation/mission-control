import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { prisma } from "../lib/prisma"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return date.toISOString().split('T')[0]
}

function priorityVariant(priority: string): "default" | "outline" | "secondary" {
  switch (priority) {
    case 'CRITICAL': return 'default'
    case 'HIGH': return 'default'
    default: return 'outline'
  }
}

export default async function MissionControl() {
  const tasks = await prisma.task.findMany({
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS')
  const backlog = tasks.filter(t => t.status === 'BACKLOG')
  const completed = tasks.filter(t => t.status === 'COMPLETED')
  const blocked = tasks.filter(t => t.status === 'BLOCKED')

  const lastUpdated = tasks.length > 0 
    ? new Date(Math.max(...tasks.map(t => t.updatedAt.getTime()))).toLocaleString('en-GB', { timeZone: 'Europe/Prague' })
    : 'No data'

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-muted-foreground mt-1">R2&apos;s task ledger — what&apos;s done, what&apos;s in progress, what&apos;s next</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Last updated: {lastUpdated}
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{inProgress.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Backlog</CardDescription>
              <CardTitle className="text-3xl text-blue-500">{backlog.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl text-green-500">{completed.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Blocked</CardDescription>
              <CardTitle className="text-3xl text-red-500">{blocked.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Task Tabs */}
        <Tabs defaultValue="in-progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="in-progress">🔥 In Progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="backlog">📋 Backlog ({backlog.length})</TabsTrigger>
            <TabsTrigger value="completed">✅ Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="blocked">🚧 Blocked ({blocked.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Currently active tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgress.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No tasks in progress</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inProgress.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{formatDate(item.startedAt)}</TableCell>
                          <TableCell>
                            <Badge variant={item.statusNote?.toLowerCase().includes("blocked") ? "destructive" : "secondary"}>
                              {item.statusNote || 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backlog">
            <Card>
              <CardHeader>
                <CardTitle>Backlog</CardTitle>
                <CardDescription>Queued tasks waiting to be started</CardDescription>
              </CardHeader>
              <CardContent>
                {backlog.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Backlog is empty</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backlog.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant={priorityVariant(item.priority)}>
                              {item.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed</CardTitle>
                <CardDescription>Finished tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {completed.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No completed tasks yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Outcome</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completed.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>{formatDate(item.completedAt)}</TableCell>
                          <TableCell className="text-muted-foreground">{item.outcome}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked">
            <Card>
              <CardHeader>
                <CardTitle>Blocked</CardTitle>
                <CardDescription>Tasks waiting on dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                {blocked.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nothing blocked! 🎉</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Blocker</TableHead>
                        <TableHead>Need</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocked.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.title}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.blocker}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{item.need}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <footer className="text-center text-muted-foreground text-sm pt-8 border-t">
          <p>Data source: <code className="bg-muted px-1 rounded">PostgreSQL</code></p>
          <p className="mt-1">Refresh the page to see latest updates</p>
        </footer>
      </div>
    </main>
  )
}
