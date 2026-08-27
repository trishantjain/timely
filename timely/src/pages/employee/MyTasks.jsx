import { getMyTasks } from "@/api/taskAPI";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { Search, Calendar, FolderKanban, Layers } from "lucide-react";

export default function MyTasks() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadTasks = async () => {
    try {
      const res = await getMyTasks();

      console.log(res.data);

      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const statusColors = {
    PENDING: "border-border bg-muted text-muted-foreground",

    IN_PROGRESS: "border-border bg-secondary text-secondary-foreground",

    SUBMITTED: "border-border bg-secondary text-secondary-foreground",

    UNDER_REVIEW: "border-border bg-secondary text-secondary-foreground",

    APPROVED: "border-border bg-secondary text-secondary-foreground",

    REJECTED: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
        task.projectName.toLowerCase().includes(search.toLowerCase()) ||
        task.moduleName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl lg:p-8">
      <div className="flex flex-col gap-2 mb-6">
        <p className="text-sm text-muted-foreground">Employee Workspace</p>

        <h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
      </div>

      <Card className="mb-5 border-border bg-card">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-3 text-muted-foreground"
            />

            <Input
              className="pl-10 bg-background"
              placeholder="Search project, module or task"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-background md:w-[190px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-12 text-center">
              <p className="font-medium text-foreground">No tasks found</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or status filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={`${task.componentId}-${task.taskId}`}
              className="transition-colors border-border bg-card hover:bg-muted/40"
            >
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {task.taskTitle}
                    </h3>

                    <Badge
                      variant="outline"
                      className={
                        statusColors[task.status] || statusColors.PENDING
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <FolderKanban size={15} />
                      {task.projectName}
                    </div>

                    <div className="flex items-center gap-2">
                      <Layers size={15} />
                      {task.moduleName}
                    </div>

                    {task.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar size={15} />

                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() =>
                    navigate(
                      `/employee/tasks/${task.componentId}/${task.taskId}`,
                    )
                  }
                >
                  Open Task
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
