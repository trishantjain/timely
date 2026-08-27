import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FolderKanban,
  Users,
  UserCheck,
  ChevronDown,
} from "lucide-react";

import { getEmployees } from "@/api/employeeAPI";
import { getProjectById } from "@/api/projectAPI";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Assignments() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [project, setProject] = useState(null);

  const [employees, setEmployees] = useState([]);

  const [selectedAssignments, setSelectedAssignments] = useState({});

  const fetchProject = async () => {
    try {
      const res = await getProjectById(id);

      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();

      setEmployees(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProject();

    fetchEmployees();
  }, [id]);

  return (
    <div className="max-w-5xl p-4 mx-auto sm:p-6 lg:p-8">
      {/* BACK */}

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Project
      </button>

      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 pb-6 mb-6 border-b sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Project Assignment</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Assign Employees
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Assign one employee to each project domain.
          </p>
        </div>

        <div className="flex items-center justify-center border h-11 w-11 rounded-xl bg-muted/40">
          <Users size={20} />
        </div>
      </div>

      {/* PROJECT */}

      {project && (
        <Card className="mb-6 overflow-hidden shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <div className="flex items-center justify-center border h-11 w-11 shrink-0 rounded-xl bg-muted/40">
              <FolderKanban size={21} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Current Project
              </p>

              <h2 className="mt-1 text-xl font-semibold">{project.name}</h2>

              {project.description && (
                <p className="max-w-3xl mt-2 text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DOMAIN ASSIGNMENTS */}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Domain Assignments</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select the employee responsible for each domain.
            </p>
          </div>

          <span className="rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
            {project?.domains?.length || 0}{" "}
            {project?.domains?.length === 1 ? "domain" : "domains"}
          </span>
        </div>

        <div className="overflow-hidden border shadow-sm rounded-2xl bg-card">
          {!project?.domains?.length ? (
            <div className="text-center py-14">
              <div className="flex items-center justify-center mx-auto border h-11 w-11 rounded-xl bg-muted/40">
                <Users size={20} className="text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-medium">No domains available</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Add domains to this project before assigning employees.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {project.domains.map((domain) => {
                const availableEmployees = employees.filter((employee) =>
                  employee.expertise?.some((exp) => exp._id === domain._id),
                );

                return (
                  <div
                    key={domain._id}
                    className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    {/* DOMAIN */}

                    <div className="flex items-center min-w-0 gap-3">
                      <div className="flex items-center justify-center w-10 h-10 border rounded-lg shrink-0 bg-muted/40">
                        <UserCheck size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold truncate">
                          {domain.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Select employee for this domain
                        </p>
                      </div>
                    </div>

                    {/* EMPLOYEE SELECT */}

                    <div className="w-full sm:w-[260px]">
                      <Select
                        value={selectedAssignments[domain._id] || ""}
                        onValueChange={(value) =>
                          setSelectedAssignments((prev) => ({
                            ...prev,
                            [domain._id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>

                        <SelectContent>
                          {availableEmployees.length === 0 ? (
                            <SelectItem value="no-employee" disabled>
                              No matching employees
                            </SelectItem>
                          ) : (
                            availableEmployees.map((employee) => (
                              <SelectItem
                                key={employee._id}
                                value={employee._id}
                              >
                                {employee.username}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CURRENT ASSIGNMENT DATA */}

      <Card className="mt-6 border-dashed bg-muted/[0.15]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <ChevronDown size={16} className="text-muted-foreground" />

            <p className="text-sm font-medium">Selected Assignments</p>
          </div>

          <pre className="p-3 mt-3 overflow-auto text-xs border rounded-lg max-h-52 bg-background text-muted-foreground">
            {JSON.stringify(selectedAssignments, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
