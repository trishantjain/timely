import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleUserRound,
  Layers,
  Users,
} from "lucide-react";

import { getProjectById, updateProjectDomains } from "@/api/projectAPI";
import { getDomains } from "@/api/domainAPI";
import { getEmployees } from "@/api/employeeAPI";
import { createAssignments } from "@/api/assignmentAPI";
import { useAlertDialog } from "@/components/common/ConfirmDialogContext";

export default function ProjectDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const alertDialog = useAlertDialog();

  const [assignmentError, setAssignmentError] = useState("");

  const [domainDialogError, setDomainDialogError] = useState("");

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState({});

  const [availableDomains, setAvailableDomains] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [savingDomains, setSavingDomains] = useState(false);

  const [openDomainDialog, setOpenDomainDialog] = useState(false);

  const [selectedManualTaskDomain, setSelectedManualTaskDomain] = useState("");

  // const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);

  // const [selectedDomainIds, setSelectedDomainIds] = useState([]);

  // const [isSavingDomains, setIsSavingDomains] = useState(false);

  // UI state only
  const [activeTab, setActiveTab] = useState("team");

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);

      const res = await getProjectById(id);
      const employeeRes = await getEmployees();

      const projectData = res.data;
      const employeeList = employeeRes.data?.data || [];

      setEmployees(employeeList);
      setProject(projectData);

      const employeeSelections = {};

      // ==========================================
      // FIRST: LOAD ALREADY SAVED ASSIGNMENTS
      // ==========================================

      (projectData.assignments || []).forEach((assignment) => {
        const domainId =
          typeof assignment.domain === "object"
            ? assignment.domain?._id
            : assignment.domain;

        const employeeId =
          typeof assignment.employee === "object"
            ? assignment.employee?._id
            : assignment.employee;

        if (domainId && employeeId) {
          employeeSelections[domainId.toString()] = employeeId.toString();
        }
      });

      // ==========================================
      // SECOND: AUTO SELECT EMPLOYEE ONLY
      // WHEN DOMAIN IS NOT ALREADY ASSIGNED
      // ==========================================

      projectData.domains?.forEach((domain) => {
        const domainId = domain._id.toString();

        // Do not overwrite an existing assignment
        if (employeeSelections[domainId]) {
          return;
        }

        const matchingEmployees = employeeList.filter((employee) =>
          employee.expertise?.some((exp) => {
            const expertiseId = typeof exp === "object" ? exp._id : exp;

            return expertiseId?.toString() === domainId;
          }),
        );

        if (matchingEmployees.length === 1) {
          employeeSelections[domainId] = matchingEmployees[0]._id.toString();
        }
      });

      setSelectedEmployees(employeeSelections);
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAssignments = async () => {
    try {
      setAssignmentError("");

      const assignments = project.domains.map((domain) => ({
        domainId: domain._id,
        employeeId: selectedEmployees[domain._id],
      }));

      const hasEmpty = assignments.some((item) => !item.employeeId);

      if (hasEmpty) {
        setAssignmentError("Please assign employees for all domains.");
        return;
      }

      await createAssignments({
        projectId: project._id,
        assignments,
      });

      await alertDialog({
        description: "Assignments created successfully.",
        variant: "success",
      });

      loadProject();
    } catch (err) {
      console.error(err);
      setAssignmentError(
        err.response?.data?.message || "Failed to create assignments.",
      );
    }
  };

  const getEmployeeId = (assignment) => {
    if (!assignment?.employee) return null;

    if (typeof assignment.employee === "string") {
      return assignment.employee;
    }

    return assignment.employee._id;
  };

  const getEmployeeName = (assignment) => {
    if (!assignment?.employee) {
      return "Unknown Employee";
    }

    if (typeof assignment.employee === "string") {
      const foundEmployee = employees.find(
        (employee) => employee._id === assignment.employee,
      );

      return foundEmployee?.username || "Unknown Employee";
    }

    return assignment.employee.username || "Unknown Employee";
  };

  const goToEmployeeTasks = (assignment) => {
    const employeeId = getEmployeeId(assignment);

    console.log("Employee assignment clicked:", assignment);
    console.log("Resolved employee ID:", employeeId);

    if (!employeeId) {
      console.error("Unable to find employee ID", assignment);
      return;
    }

    navigate(`/admin/project/${id}/employees/${employeeId}/tasks`);
  };

  // ==========================================
  // OPEN PROJECT DOMAINS
  // ==========================================

  const handleOpenDomainDialog = async () => {
    try {
      setOpenDomainDialog(true);

      setDomainDialogError("");

      setSelectedDomains(project?.domains?.map((domain) => domain._id) || []);

      setLoadingDomains(true);

      const res = await getDomains();

      setAvailableDomains(res.data?.data || []);
    } catch (error) {
      console.error("Failed to load domains:", error);

      setDomainDialogError(
        error.response?.data?.message || "Failed to load domains.",
      );
    } finally {
      setLoadingDomains(false);
    }
  };

  // ==========================================
  // TOGGLE DOMAIN
  // ==========================================

  const toggleProjectDomain = (domainId) => {
    setSelectedDomains((previous) =>
      previous.includes(domainId)
        ? previous.filter((id) => id !== domainId)
        : [...previous, domainId],
    );
  };

  // ==========================================
  // SAVE PROJECT DOMAINS
  // ==========================================

  const handleSaveProjectDomains = async () => {
    if (!Array.isArray(selectedDomains)) {
      console.error("selectedDomains is not an array:", selectedDomains);

      setDomainDialogError("Invalid domain selection.");
      return;
    }

    if (selectedDomains.length === 0) {
      setDomainDialogError("Please select at least one project domain.");
      return;
    }

    try {
      setSavingDomains(true);

      setDomainDialogError("");

      const payload = {
        domains: selectedDomains,
      };

      await updateProjectDomains(project._id, payload);

      await loadProject();

      setOpenDomainDialog(false);

      await alertDialog({
        description: "Project domains updated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to update project domains:", error);

      setDomainDialogError(
        error.response?.data?.message || "Failed to update project domains.",
      );
    } finally {
      setSavingDomains(false);
    }
  };

  const projectDomains = Array.isArray(project?.domains) ? project.domains : [];

  if (loading) {
    return <div className="p-6 text-sm">Loading...</div>;
  }

  if (!project) {
    return <div className="p-6 text-sm">Project not found</div>;
  }

  const assignments = project.assignments || [];

  const assignmentsCreated = assignments.length > 0;

  const statusClass =
    project.status === "active"
      ? "bg-[#eaf7ef] text-[#2f7d57] border-[#c9e8d5]"
      : "bg-[#edf1f5] text-[#64748b] border-[#dbe2ea]";

  const tabs = [
    {
      id: "team",
      label: "Team Members",
      icon: Users,
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: Layers,
    },
    {
      id: "info",
      label: "Project Info",
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="min-h-full bg-[#f6f7f9]">
      {/* ================= COMPACT PROJECT HEADER ================= */}

      <div className="bg-[#0d1218] text-[#e8edf5]">
        <div className="px-4 sm:px-5 lg:px-6">
          {/* Compact Project Header */}

          <div className="flex items-center justify-between gap-4 py-3 border-b border-[#222b36]">
            <div className="flex items-center min-w-0 gap-2 text-sm">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="flex-shrink-0 text-[#94a3b8] transition-colors hover:text-[#e8edf5]"
              >
                Projects
              </button>

              <span className="text-[#64748b]">/</span>

              <h1 className="truncate text-base font-semibold text-[#e8edf5] sm:text-lg">
                {project.name}
              </h1>

              <Badge
                variant="outline"
                className={`hidden sm:inline-flex flex-shrink-0 px-2 py-0 text-[11px] capitalize rounded-full ${statusClass}`}
              >
                {project.status}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="
                h-8
                flex-shrink-0
                gap-1.5
                px-3
                text-xs
                border-[#2a3440]
                bg-transparent
                text-[#d8e0ea]
                hover:bg-[#161d26]
                hover:text-white
              "
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">All Projects</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          {/* Mobile Status */}

          <div className="flex py-2 sm:hidden">
            <Badge
              variant="outline"
              className={`px-2 py-0 text-[11px] capitalize rounded-full ${statusClass}`}
            >
              {project.status}
            </Badge>
          </div>
        </div>

        {/* ================= COMPACT TABS ================= */}

        <div className="px-4 border-b border-[#222b36] sm:px-5 lg:px-6">
          <div className="flex gap-5 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative
                    flex
                    h-11
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    whitespace-nowrap
                    transition-colors
                    ${
                      isActive
                        ? "text-[#f1f5f9]"
                        : "text-[#94a3b8] hover:text-[#e8edf5]"
                    }
                  `}
                >
                  <Icon size={16} />

                  <span>{tab.label}</span>

                  {tab.id === "team" && assignmentsCreated && (
                    <span
                      className="
                        flex
                        items-center
                        justify-center
                        h-5
                        min-w-5
                        px-1
                        text-[10px]
                        rounded-full
                        bg-[#202a36]
                        text-[#cbd5e1]
                      "
                    >
                      {assignments.length}
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3b82f6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}

      <div className="p-3 sm:p-4 lg:p-5">
        {/* ================= TEAM MEMBERS ================= */}

        {activeTab === "team" && (
          <Card
            className="
              overflow-hidden
              border-[#d9e0e8]
              bg-white
              shadow-sm
            "
          >
            <CardContent className="p-0">
              {/* Team Header */}

              <div className="flex flex-col gap-2 px-4 py-3 border-b border-[#e2e8f0] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#1f2937]">
                    Team Assignment
                  </h2>

                  <p className="mt-0.5 text-xs text-[#64748b]">
                    Assign project domains to team members.
                  </p>
                </div>

                {assignmentsCreated && (
                  <Badge
                    variant="outline"
                    className="
                      self-start
                      px-2
                      py-0.5
                      text-[11px]
                      text-[#475569]
                      border-[#dbe2ea]
                      bg-[#f8fafc]
                      sm:self-auto
                    "
                  >
                    {assignments.length} Assigned
                  </Badge>
                )}
              </div>

              {/* Domain Rows */}

              <div className="divide-y divide-[#e5eaf0]">
                {project.domains?.map((domain) => {
                  const assignment = assignments.find((item) => {
                    const assignmentDomainId =
                      typeof item.domain === "object"
                        ? item.domain?._id
                        : item.domain;

                    return (
                      assignmentDomainId?.toString() === domain._id?.toString()
                    );
                  });

                  const matchingEmployees = employees.filter((employee) =>
                    employee.expertise?.some((exp) => exp._id === domain._id),
                  );

                  return (
                    <div
                      key={domain._id}
                      className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
                    >
                      {/* Domain */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/project/${id}/domains/${domain._id}/tasks`,
                          )
                        }
                        className="flex items-center gap-3 text-left cursor-pointer group"
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                            w-11
                            h-11
                            rounded-lg
                            bg-[#f1f4f8]
                            text-[#475569]
                            transition-colors
                            group-hover:bg-[#e8eef7]
                          "
                        >
                          <Layers size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#1f2937] transition-colors group-hover:text-[#2563eb]">
                            {domain.name}
                          </p>

                          <p className="mt-0.5 text-xs text-[#64748b]">
                            Click to manage domain tasks
                          </p>
                        </div>
                      </button>

                      {/* Assignment */}

                      <div className="w-full lg:w-[340px]">
                        {assignment ? (
                          <button
                            type="button"
                            onClick={() => goToEmployeeTasks(assignment)}
                            className="
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-3
                              px-3
                              py-2.5
                              text-left
                              border
                              rounded-lg
                              bg-[#eef8f2]
                              border-[#cce6d6]
                              cursor-pointer
                              transition-all
                              hover:bg-[#e6f5ec]
                              hover:shadow-sm
                              focus:outline-none
                              focus:ring-2
                              focus:ring-[#86c7a0]
                            "
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="
                                  flex
                                  items-center
                                  justify-center
                                  flex-shrink-0
                                  w-8
                                  h-8
                                  rounded-full
                                  bg-[#e2e8f0]
                                "
                              >
                                <CircleUserRound
                                  size={18}
                                  className="text-[#475569]"
                                />
                              </div>

                              <div>
                                <p className="text-[11px] text-[#64748b]">
                                  Assigned to
                                </p>

                                <p className="mt-0.5 text-sm font-medium text-[#1f2937]">
                                  {getEmployeeName(assignment)}
                                </p>
                              </div>
                            </div>

                            <CheckCircle2
                              size={18}
                              className="flex-shrink-0 text-[#2f9e63]"
                            />
                          </button>
                        ) : matchingEmployees.length === 0 ? (
                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              px-3
                              py-2.5
                              text-xs
                              border
                              border-red-200
                              rounded-lg
                              bg-red-50
                              text-destructive
                            "
                          >
                            <CircleAlert size={16} />
                            No employee available
                          </div>
                        ) : matchingEmployees.length === 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/project/${id}/employees/${matchingEmployees[0]._id}/tasks`,
                              )
                            }
                            className="
                              flex
                              w-full
                              items-center
                              gap-2.5
                              px-3
                              py-2.5
                              text-left
                              border
                              border-[#dbe2ea]
                              rounded-lg
                              bg-[#f8fafc]
                              cursor-pointer
                              transition-all
                              hover:bg-[#f1f5f9]
                              hover:shadow-sm
                              focus:outline-none
                              focus:ring-2
                              focus:ring-[#93c5fd]
                            "
                          >
                            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-[#e2e8f0]">
                              <CircleUserRound
                                size={18}
                                className="text-[#475569]"
                              />
                            </div>

                            <div>
                              <p className="text-[11px] text-[#64748b]">
                                Assigned to
                              </p>

                              <p className="mt-0.5 text-sm font-medium text-[#1f2937]">
                                {matchingEmployees[0].username}
                              </p>
                            </div>

                            <span className="ml-auto text-[11px] text-[#64748b]">
                              Auto
                            </span>
                          </button>
                        ) : (
                          <select
                            className="
                              w-full
                              h-10
                              px-3
                              text-sm
                              text-[#334155]
                              border
                              border-[#d6dee8]
                              rounded-lg
                              outline-none
                              cursor-pointer
                              bg-white
                              focus:ring-2
                              focus:ring-[#93c5fd]
                              focus:border-[#60a5fa]
                            "
                            value={selectedEmployees[domain._id] || ""}
                            onChange={(e) =>
                              setSelectedEmployees((prev) => ({
                                ...prev,
                                [domain._id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">Select employee</option>

                            {matchingEmployees.map((employee) => (
                              <option key={employee._id} value={employee._id}>
                                {employee.username}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}

              {assignmentError && (
                <div className="px-4 pt-3">
                  <div className="px-3 py-2 text-sm border rounded-md border-destructive/40 bg-destructive/10 text-destructive">
                    {assignmentError}
                  </div>
                </div>
              )}

              <div className="flex justify-end px-4 py-3 border-t border-[#e2e8f0] bg-[#fafbfc]">
                {!assignmentsCreated && (
                  <Button
                    size="sm"
                    onClick={handleApproveAssignments}
                    className="
                      bg-[#2563eb]
                      text-white
                      hover:bg-[#1d4ed8]
                      shadow-sm
                    "
                  >
                    Confirm Assignments
                  </Button>
                )}

                {assignmentsCreated && (
                  <Button
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/project/${project._id}/components`)
                    }
                    className="
                      bg-[#2563eb]
                      text-white
                      hover:bg-[#1d4ed8]
                      shadow-sm
                    "
                  >
                    Manage Tasks
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= TASKS ================= */}

        {activeTab === "tasks" && (
          <Card className="border-[#d9e0e8] bg-white shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[#1f2937]">
                    Project Tasks
                  </h2>

                  <p className="mt-0.5 text-xs text-[#64748b]">
                    Manage project work items, components and assigned tasks.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/admin/project/${project._id}/components`)
                  }
                  className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                >
                  Manage Tasks
                </Button>
              </div>

              <div className="grid gap-3 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={handleOpenDomainDialog}
                  className="
    flex
    items-center
    gap-3
    p-4
    text-left
    transition-all
    border
    border-[#dbe2ea]
    rounded-lg
    bg-[#fafbfc]
    hover:border-[#93c5fd]
    hover:bg-[#f8fbff]
    hover:shadow-sm
    cursor-pointer
  "
                >
                  <div
                    className="
      flex
      items-center
      justify-center
      w-10
      h-10
      rounded-lg
      bg-[#edf2f7]
      text-[#475569]
    "
                  >
                    <Layers size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#64748b]">Project Domains</p>

                    <div className="flex items-center gap-2">
                      <p className="mt-0.5 text-lg font-semibold text-[#1f2937]">
                        {project.domains?.length || 0}
                      </p>

                      <span className="text-[11px] text-[#2563eb]">Manage</span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-3 p-4 border border-[#dbe2ea] rounded-lg bg-[#fafbfc]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#edf2f7] text-[#475569]">
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-[#64748b]">Assigned Employees</p>

                    <p className="mt-0.5 text-lg font-semibold text-[#1f2937]">
                      {assignments.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-[#dbe2ea] rounded-lg bg-[#fafbfc]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#edf2f7] text-[#475569]">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-xs text-[#64748b]">Assignment Status</p>

                    <p className="mt-0.5 text-sm font-semibold text-[#1f2937]">
                      {assignmentsCreated ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ================= PROJECT INFO ================= */}

        {activeTab === "info" && (
          <div className="space-y-4">
            <Card className="border-[#d9e0e8] bg-white shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#edf2f7] text-[#475569]">
                    <BriefcaseBusiness size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#1f2937]">
                      Project Information
                    </h2>

                    <p className="text-xs text-[#64748b]">
                      General project details
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-[#64748b]">Project Name</p>

                    <p className="mt-1 text-sm font-medium text-[#1f2937]">
                      {project.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#64748b]">Status</p>

                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[11px] capitalize ${statusClass}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#64748b]">Created By</p>

                    <p className="mt-1 text-sm font-medium text-[#1f2937]">
                      {project.createdBy?.username || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#64748b]">Created On</p>

                    <p className="mt-1 text-sm font-medium text-[#1f2937]">
                      {project.createdAt
                        ? new Date(project.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#64748b]">
                      Required Domains
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#1f2937]">
                      {project.domains?.length || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-[#64748b]">
                      Assigned Employees
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#1f2937]">
                      {assignments.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#d9e0e8] bg-white shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[#1f2937]">
                  Description
                </h3>

                <p className="mt-2 text-sm leading-5 text-[#64748b]">
                  {project.description || "No project description provided."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#d9e0e8] bg-white shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#edf2f7] text-[#475569]">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-xs text-[#64748b]">Project Created</p>

                  <p className="mt-0.5 text-sm font-medium text-[#1f2937]">
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ================= UPDATE PROJECT DOMAINS DIALOG ================= */}

      <Dialog
        open={openDomainDialog}
        onOpenChange={(open) => {
          setOpenDomainDialog(open);

          if (!open) {
            setDomainDialogError("");
          }
        }}
      >
        <DialogContent
          className="
      max-w-[720px]
      border
      border-slate-700
      bg-[#141b25]
      p-0
      text-slate-100
      shadow-2xl
    "
        >
          {/* HEADER */}

          <DialogHeader className="py-6 border-b border-slate-700 px-7">
            <DialogTitle className="text-xl font-semibold text-slate-100">
              Update Project Domains
            </DialogTitle>

            <DialogDescription className="mt-1 text-sm text-slate-400">
              Select the domains that should be included in this project.
            </DialogDescription>
          </DialogHeader>

          {/* DOMAIN LIST */}

          <div className="max-h-[430px] overflow-y-auto px-7 py-5">
            {loadingDomains ? (
              <div className="py-10 text-sm text-center text-slate-400">
                Loading domains...
              </div>
            ) : availableDomains.length === 0 ? (
              <div className="py-10 text-sm text-center text-slate-400">
                No domains available.
              </div>
            ) : (
              <div className="space-y-3">
                {availableDomains.map((domain) => {
                  const isSelected = selectedDomains.includes(domain._id);

                  return (
                    <button
                      key={domain._id}
                      type="button"
                      disabled={savingDomains}
                      onClick={() => toggleProjectDomain(domain._id)}
                      className={`
                  flex
                  w-full
                  items-center
                  gap-4
                  rounded-xl
                  border
                  px-5
                  py-4
                  text-left
                  transition-all
                  duration-200

                  ${
                    isSelected
                      ? `
                        border-blue-500/60
                        bg-blue-500/10
                      `
                      : `
                        border-slate-700
                        bg-[#1b2635]
                        hover:border-slate-600
                        hover:bg-[#202d3d]
                      `
                  }
                `}
                    >
                      {/* CHECKBOX */}

                      <div
                        className={`
                    flex
                    h-5
                    w-5
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded
                    border
                    transition-colors

                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-600"
                        : "border-slate-600 bg-transparent"
                    }
                  `}
                      >
                        {isSelected && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-3.5 w-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12l4 4L19 6" />
                          </svg>
                        )}
                      </div>

                      {/* DOMAIN COLOR */}

                      <div
                        className="h-3.5 w-3.5 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: domain.color || "#64748b",
                        }}
                      />

                      {/* DOMAIN NAME */}

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[15px] font-medium ${
                            isSelected ? "text-slate-100" : "text-slate-300"
                          }`}
                        >
                          {domain.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER */}

          {domainDialogError && (
            <div className="px-7 pt-4">
              <div className="px-3 py-2 text-sm border rounded-md border-red-500/40 bg-red-500/10 text-red-400">
                {domainDialogError}
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-3 border-t border-slate-700 bg-[#111820] px-7 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDomainDialog(false)}
              disabled={savingDomains}
              className="
          min-w-[100px]
          border-slate-600
          bg-[#182230]
          text-slate-300
          hover:bg-[#223044]
          hover:text-white
        "
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSaveProjectDomains}
              disabled={savingDomains || loadingDomains}
              className="
          min-w-[150px]
          bg-blue-600
          text-white
          hover:bg-blue-700
        "
            >
              {savingDomains ? "Saving..." : "Save Domains"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
