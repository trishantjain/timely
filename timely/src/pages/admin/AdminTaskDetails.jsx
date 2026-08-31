import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getTaskDetails } from "@/api/projectComponentAPI";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  User,
  Mail,
  FolderKanban,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

const statusStyles = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",

  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",

  SUBMITTED: "bg-yellow-50 text-yellow-700 border-yellow-200",

  UNDER_REVIEW: "bg-orange-50 text-orange-700 border-orange-200",

  APPROVED: "bg-green-50 text-green-700 border-green-200",

  REJECTED: "bg-red-50 text-red-700 border-red-200",

  COMPLETED: "bg-green-50 text-green-700 border-green-200",
};

const formatDate = (date) => {
  if (!date) return "No deadline";

  return new Date(date).toLocaleDateString();
};

export default function AdminTaskDetails() {
  const { componentId, taskId } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [taskData, setTaskData] = useState(null);

  const loadTask = async () => {
    try {
      setLoading(true);

      const res = await getTaskDetails(componentId, taskId);

      setTaskData(res.data.data);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Unable to load task details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [componentId, taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-muted-foreground">Loading task details...</p>
      </div>
    );
  }

  if (!taskData) {
    return <div className="p-8">Task not found.</div>;
  }

  const {
    projectId,
    projectName,
    componentId: currentComponentId,
    componentName,
    moduleName,
    task,
  } = taskData;

  const employee = task.assignedEmployee;

  const employeeName = typeof employee === "object" ? employee?.username : null;

  const employeeEmail = typeof employee === "object" ? employee?.email : null;

  const submissionId = task.submissionId?._id || task.submissionId || null;

  const handleViewSubmission = () => {
    if (!submissionId) {
      return;
    }

    navigate(`/admin/reviews/${submissionId}`);
  };

  return (
    <div className="w-full max-w-6xl p-6 mx-auto lg:p-8">
      {/* BACK */}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      {/* BREADCRUMB */}

      <div className="flex flex-wrap items-center gap-2 mb-5 text-sm text-muted-foreground">
        <button
          onClick={() => navigate(`/admin/project/${projectId}`)}
          className="hover:text-foreground"
        >
          {projectName}
        </button>

        <span>/</span>

        <span>{componentName}</span>

        <span>/</span>

        <span className="text-foreground">{task.title}</span>
      </div>

      {/* HEADER */}

      <div className="flex flex-col gap-5 pb-6 border-b md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {task.title}
            </h1>

            <Badge
              variant="outline"
              className={statusStyles[task.status] || statusStyles.PENDING}
            >
              {task.status?.replaceAll("_", " ")}
            </Badge>
          </div>

          {task.description && (
            <p className="max-w-3xl mt-3 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>

        {/* SUBMISSION BUTTON */}

        {submissionId && (
          <Button onClick={handleViewSubmission} className="gap-2 shrink-0">
            <ExternalLink size={16} />
            View Submission
          </Button>
        )}
      </div>

      {/* TASK INFORMATION */}

      <div className="grid gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* PROJECT */}

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <FolderKanban size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Project</p>

              <p className="font-semibold truncate">{projectName}</p>
            </div>
          </CardContent>
        </Card>

        {/* WORK ITEM */}

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <Layers size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Work Item</p>

              <p className="font-semibold truncate">{componentName}</p>
            </div>
          </CardContent>
        </Card>

        {/* MODULE */}

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <ClipboardList size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Module</p>

              <p className="font-semibold truncate">{moduleName}</p>
            </div>
          </CardContent>
        </Card>

        {/* ASSIGNED EMPLOYEE */}

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <User size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Assigned Employee
              </p>

              <p className="font-semibold truncate">
                {employeeName || "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* EMAIL */}

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <Mail size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Employee Email</p>

              <p className="font-semibold truncate">{employeeEmail || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {/* DEADLINE */}

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
              <Calendar size={18} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>

              <p className="font-semibold">{formatDate(task.deadline)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TASK DETAILS */}

      <div className="grid gap-6 mt-6 lg:grid-cols-2">
        {/* SUBMISSION RULE */}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <FileText size={18} />

              <h2 className="font-semibold">Submission Requirement</h2>
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Submission Type</p>

              <p className="mt-1 font-medium">
                {task.submissionRule?.type || "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SUBMISSION STATUS */}

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              {submissionId ? <CheckCircle2 size={18} /> : <Clock size={18} />}

              <h2 className="font-semibold">Submission Status</h2>
            </div>

            {submissionId ? (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  The employee has submitted work for this task.
                </p>

                <Button
                  variant="outline"
                  className="gap-2 mt-4"
                  onClick={handleViewSubmission}
                >
                  <ExternalLink size={16} />
                  Open Submission
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  No submission has been made for this task yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
