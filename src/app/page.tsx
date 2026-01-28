import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data - in production this would come from an API/database
const inProgress = [
  { task: "GSuite integration", started: "2026-01-28", status: "Blocked", notes: "Needs OAuth credentials setup" },
  { task: "Website copy review", started: "2026-01-28", status: "Queued", notes: "Awaiting go-ahead" },
]

const backlog = [
  { task: "Content calendar", priority: "Medium", notes: "Blog/social strategy" },
  { task: "Lead gen research", priority: "Medium", notes: "Channels, tactics for Xmation" },
  { task: "SEO analysis", priority: "Medium", notes: '"AI zaměstnanec" keyword opportunities' },
  { task: "Case study template", priority: "Medium", notes: "Help get customer testimonials" },
]

const completed = [
  { task: "Telegram pairing", completed: "2026-01-28", outcome: "Connected" },
  { task: "Browser setup", completed: "2026-01-28", outcome: "Clawd profile running" },
  { task: "Xmation.ai deep dive", completed: "2026-01-28", outcome: "Full product/pricing analysis" },
  { task: "Competitor research", completed: "2026-01-28", outcome: "8 competitors analyzed" },
  { task: "Workspace setup", completed: "2026-01-28", outcome: "MISSION_CONTROL, USER.md, projects/" },
  { task: "Morning brief cron", completed: "2026-01-28", outcome: "Daily 07:45 CET → Telegram" },
]

const blocked = [
  { task: "GSuite monitoring", blocker: "No OAuth", need: "Credentials from Google Cloud Console" },
  { task: "Xmation codebase", blocker: "No access", need: "Repo location (private? org?)" },
]

export default function MissionControl() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mission Control</h1>
            <p className="text-muted-foreground mt-1">R2&apos;s task ledger — what&apos;s done, what&apos;s in progress, what&apos;s next</p>
          </div>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
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
            <TabsTrigger value="in-progress">🔥 In Progress</TabsTrigger>
            <TabsTrigger value="backlog">📋 Backlog</TabsTrigger>
            <TabsTrigger value="completed">✅ Completed</TabsTrigger>
            <TabsTrigger value="blocked">🚧 Blocked</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Currently active tasks</CardDescription>
              </CardHeader>
              <CardContent>
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
                    {inProgress.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell>{item.started}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === "Blocked" ? "destructive" : "secondary"}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backlog.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completed.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell>{item.completed}</TableCell>
                        <TableCell className="text-muted-foreground">{item.outcome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Blocker</TableHead>
                      <TableHead>Need</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocked.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.task}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{item.blocker}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.need}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
