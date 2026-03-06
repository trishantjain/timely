import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

export default function TaskTable({tasks}) {

  return (

    <Table>

      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>

        {tasks.map(task=>(
          <TableRow key={task.id}>

            <TableCell>{task.title}</TableCell>
            <TableCell>{task.project}</TableCell>
            <TableCell>{task.status}</TableCell>
            <TableCell>{task.dueDate}</TableCell>

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