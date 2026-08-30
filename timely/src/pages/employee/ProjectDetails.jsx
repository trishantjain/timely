import { getProjectById } from "@/api/projectAPI";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  ArrowLeft,
  FileText,
  FolderKanban,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

export default function EmployeeProjectDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");

  // KEEPING THE ORIGINAL WORKING API LOGIC
  const loadProject = async () => {
    try {
      const res = await getProjectById(id);

      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  if (!project) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <p className="text-sm text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-6 mx-auto lg:p-8">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* COMPACT PROJECT HEADER */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center border rounded-lg w-11 h-11 shrink-0 bg-muted">
              <FolderKanban size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Project</p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {project.name}
              </h1>

              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <div className="flex gap-6 mt-6 border-b">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tasks"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList size={17} />
          My Tasks
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText size={17} />
          Documents
        </button>
      </div>

      {/* ================= TASKS TAB ================= */}
      {activeTab === "tasks" && (
        <div className="mt-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">My Project Tasks</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              View and manage tasks assigned to you under this project.
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <button
                onClick={() => navigate(`/employee/tasks/${project._id}`)}
                className="flex items-center justify-between w-full gap-4 p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted">
                    <ClipboardList size={19} />
                  </div>

                  <div>
                    <p className="font-medium">View My Tasks</p>

                    <p className="text-sm text-muted-foreground">
                      Open and manage tasks assigned to you.
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-muted-foreground"
                />
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= DOCUMENTS TAB ================= */}
      {activeTab === "documents" && (
        <div className="mt-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Assigned Documents</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Documents and templates assigned to you for this project.
            </p>
          </div>

          {/* CURRENTLY EMPTY STATE */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex items-center justify-center border rounded-full w-11 h-11 bg-muted">
                <FileText size={20} className="text-muted-foreground" />
              </div>

              <h3 className="mt-3 font-medium">No documents assigned yet</h3>

              <p className="max-w-md mt-1 text-sm text-muted-foreground">
                When your project manager assigns a document or template, it
                will appear here.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
