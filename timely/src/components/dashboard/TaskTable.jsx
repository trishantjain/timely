import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Filter } from "lucide-react"

const tasks = [
    {
        title: "Finalize API Documentation",
        description: "Complete Swagger docs for the new auth endpoints.",
        assignee: "Sarah Chen",
        due: "7/2027",
        status: { label: "In Progress", variant: "secondary" },
        update: "Justification reviewed",
    },
    {
        title: "Setup CI/CD Pipeline",
        description: "Automate build/test/deploy for staging.",
        assignee: "David Kim",
        due: "7/2027",
        status: { label: "Todo", variant: "outline" },
        update: "Templates added",
    },
    {
        title: "Implement Dark Mode Support",
        description: "Theme tokens + toggle for dashboard views.",
        assignee: "Elena Rodriguez",
        due: "7/2027",
        status: { label: "In Progress", variant: "secondary" },
        update: "CSS vars aligned",
    },
    {
        title: "Database Schema Optimization",
        description: "Index hot paths and reduce query latency.",
        assignee: "Marcus Miller",
        due: "7/2027",
        status: { label: "Todo", variant: "outline" },
        update: "Plan drafted",
    },
]

export default function TaskTable() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-semibold">Task Console</CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Tracking real-time progress and user updates.
                        </p>
                    </div>

                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[280px]">Task Details</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="min-w-[180px]">Last Update</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.title}>
                                    <TableCell>
                                        <div className="text-sm font-medium">{task.title}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            {task.description}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{task.assignee}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {task.due}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={task.status.variant}>{task.status.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {task.update}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}