import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

export default function TaskTable({ tasks = [] }) {

  return (

    <Table>

      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>

        {tasks.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No tasks created yet
            </TableCell>
          </TableRow>
        )}

        {tasks.map((task) => (
          <TableRow key={task.id}>

            <TableCell>{task.title}</TableCell>
            <TableCell>{task.assigned_to?.username || "Unassigned"}</TableCell>
            <TableCell>{task.status}</TableCell>
            <TableCell>{task.dueDate
              ? new Date(task.due_date).toLocaleDateString()
              : "-"}</TableCell>

            <TableCell>
              <Button size="sm">
                Mark Done
              </Button>
            </TableCell>

          </TableRow>
        ))}

      </TableBody>

    </Table>

  )
}