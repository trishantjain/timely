import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { getProjectById } from "@/api/projectAPI";

import {
  addProjectComponent,
  addManualTask,
  assignTask,
  getProjectComponents,
} from "@/api/projectComponentAPI";

import { getProjectModules } from "@/api/projectModuleAPI";

import {
  getComponentsByModule,
  getComponentTemplates,
  createComponentTemplate,
} from "@/api/componentTemplateAPI";

import { getProjectMembers } from "@/api/projectMemberAPI";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  CalendarDays,
  ClipboardList,
  FolderKanban,
  Layers,
  Plus,
  UserRound,
  Users,
  ChevronDown,
  ChevronUp,
  Trash2,
  Boxes,
  X,
} from "lucide-react";

export default function ProjectComponents() {
  const { id } = useParams();

  const navigate = useNavigate();
  const deadlineInputRef = useRef(null);

  // ==========================================
  // STATE
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [project, setProject] = useState(null);

  const [components, setComponents] = useState([]);

  const [componentTemplates, setComponentTemplates] = useState([]);

  const [loadingComponentTemplates, setLoadingComponentTemplates] =
    useState(false);

  const [modules, setModules] = useState([]);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedProjectMember, setSelectedProjectMember] = useState("");

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [deadline, setDeadline] = useState("");

  const [collapsedComponents, setCollapsedComponents] = useState({});
  const [openCreateComponent, setOpenCreateComponent] = useState(false);

  const [activeTab, setActiveTab] = useState("work-items");

  // const [selectedEmployee, setSelectedEmployee] = useState("");

  const [quickTaskDomainId, setQuickTaskDomainId] = useState("");

  const [newComponent, setNewComponent] = useState({
    projectModule: "",
    name: "",
    description: "",
    tasks: [
      {
        title: "",
        description: "",
      },
    ],
  });

  const [creatingComponent, setCreatingComponent] = useState(false);

  // ==========================================
  // MANUAL TASK STATE
  // ==========================================

  const [manualTaskDialogOpen, setManualTaskDialogOpen] = useState(false);

  const [selectedComponentForTask, setSelectedComponentForTask] =
    useState(null);

  const [manualTask, setManualTask] = useState({
    title: "",
    description: "",
    assignedEmployee: "",
    deadline: "",
  });

  const [addingManualTask, setAddingManualTask] = useState(false);

  const [quickTaskComponentId, setQuickTaskComponentId] = useState("");

  const [quickTask, setQuickTask] = useState({
    title: "",
    assignedEmployee: "",
    deadline: "",
  });

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {
    try {
      setLoading(true);

      const projectRes = await getProjectById(id);

      const componentRes = await getProjectComponents(id);

      const moduleRes = await getProjectModules();

      const memberRes = await getProjectMembers(id);

      setProject(projectRes.data);

      setComponents(componentRes.data.data || []);

      setModules(moduleRes.data.data || []);

      setProjectMembers(memberRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MODULE CHANGE
  // ==========================================

  const handleModuleChange = async (moduleId) => {
    try {
      setSelectedModule(moduleId);

      setSelectedTemplate("");

      const res = await getComponentsByModule(moduleId);

      setTemplates(res.data.data || []);
    } catch (error) {
      console.error("Error loading work items:", error);

      setTemplates([]);
    }
  };

  // ==========================================
  // ADD WORK ITEM
  // ==========================================

  const handleAddComponent = async () => {
    if (!selectedTemplate) {
      alert("Please select a work item.");

      return;
    }

    try {
      await addProjectComponent({
        projectId: id,

        componentTemplateId: selectedTemplate,
      });

      setOpenAddDialog(false);

      setSelectedModule("");

      setSelectedTemplate("");

      setTemplates([]);

      await loadData();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to add work item.");
    }
  };

  // ==========================================
  // CLOSE ASSIGN TASK DIALOG
  // ==========================================

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);

    setSelectedTask(null);

    setSelectedProjectMember("");

    setDeadline("");
  };

  // ==========================================
  // ASSIGN TASK
  // ==========================================

  const handleAssignTask = async () => {
    if (!selectedTask) {
      return;
    }

    if (!selectedProjectMember) {
      alert("Please select an employee.");

      return;
    }

    try {
      await assignTask(selectedTask.componentId, selectedTask.taskId, {
        projectMemberId: selectedProjectMember,
        deadline,
      });

      handleCloseAssignDialog();

      await loadData();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Assignment failed.");
    }
  };

  // ==========================================
  // FETCH COMPONENT TEMPLATES
  // ==========================================

  const fetchComponentTemplates = async () => {
    try {
      setLoadingComponentTemplates(true);

      const res = await getComponentTemplates();

      setComponentTemplates(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching component templates:", error);

      setComponentTemplates([]);
    } finally {
      setLoadingComponentTemplates(false);
    }
  };

  // ==========================================
  // COMPONENT TASK HELPERS
  // ==========================================

  const addComponentTask = () => {
    setNewComponent((prev) => ({
      ...prev,

      tasks: [
        ...prev.tasks,
        {
          title: "",
          description: "",
        },
      ],
    }));
  };

  const updateComponentTask = (index, field, value) => {
    setNewComponent((prev) => {
      const updatedTasks = [...prev.tasks];

      updatedTasks[index] = {
        ...updatedTasks[index],
        [field]: value,
      };

      return {
        ...prev,
        tasks: updatedTasks,
      };
    });
  };

  const removeComponentTask = (index) => {
    if (newComponent.tasks.length === 1) {
      return;
    }

    setNewComponent((prev) => ({
      ...prev,

      tasks: prev.tasks.filter((_, taskIndex) => taskIndex !== index),
    }));
  };

  // ==========================================
  // LOAD
  // ==========================================

  useEffect(() => {
    loadData();

    fetchComponentTemplates();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-muted-foreground">Loading project work...</p>
      </div>
    );
  }

  // ==========================================
  // STATUS HELPERS
  // ==========================================

  const getComponentStatusClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "border-green-200 bg-green-50 text-green-700";

      case "IN_PROGRESS":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  const getTaskStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return "border-green-200 bg-green-50 text-green-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      case "UNDER_REVIEW":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "SUBMITTED":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";

      case "IN_PROGRESS":
        return "border-blue-200 bg-blue-50 text-blue-700";

      default:
        return "border-slate-200 bg-slate-50 text-slate-600";
    }
  };

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalTasks = components.reduce(
    (total, component) => total + (component.tasks?.length || 0),
    0,
  );

  // ==========================================
  // COLLAPSE
  // ==========================================

  const toggleComponent = (componentId) => {
    setCollapsedComponents((prev) => ({
      ...prev,

      [componentId]: !prev[componentId],
    }));
  };

  // ==========================================
  // CREATE COMPONENT
  // ==========================================
  const handleCreateComponent = async () => {
    if (!newComponent.projectModule) {
      alert("Please select a project module.");

      return;
    }

    if (!newComponent.name.trim()) {
      alert("Please enter a component name.");

      return;
    }

    const validTasks = newComponent.tasks.filter(
      (task) => task.title.trim() !== "",
    );

    if (validTasks.length === 0) {
      alert("Please add at least one task.");

      return;
    }

    try {
      setCreatingComponent(true);

      await createComponentTemplate({
        projectModule: newComponent.projectModule,

        name: newComponent.name.trim(),

        description: newComponent.description,

        tasks: validTasks,
      });

      await fetchComponentTemplates();

      setOpenCreateComponent(false);

      setNewComponent({
        projectModule: "",
        name: "",
        description: "",
        tasks: [
          {
            title: "",
            description: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error creating component:", error);

      alert(error.response?.data?.message || "Failed to create component.");
    } finally {
      setCreatingComponent(false);
    }
  };

  // ==========================================
  // ADD MANUAL TASK
  // ==========================================

  const handleAddManualTask = async () => {
    if (!selectedComponentForTask) {
      return;
    }

    if (!manualTask.title.trim()) {
      alert("Please enter a task title.");

      return;
    }

    try {
      setAddingManualTask(true);

      await addManualTask(selectedComponentForTask._id, {
        title: manualTask.title.trim(),

        description: manualTask.description.trim(),

        assignedEmployee: manualTask.assignedEmployee || null,

        deadline: manualTask.deadline || null,
      });

      setManualTaskDialogOpen(false);

      setSelectedComponentForTask(null);

      setManualTask({
        title: "",
        description: "",
        assignedEmployee: "",
        deadline: "",
      });

      await loadData();
    } catch (error) {
      console.error("Error adding manual task:", error);

      alert(error.response?.data?.message || "Failed to add task.");
    } finally {
      setAddingManualTask(false);
    }
  };

  const handleQuickAddManualTask = async () => {
    if (!quickTaskComponentId) {
      alert("Please select a work item.");

      return;
    }

    if (!quickTask.title.trim()) {
      alert("Please enter a task name.");

      return;
    }

    try {
      setAddingManualTask(true);

      await addManualTask(quickTaskComponentId, {
        title: quickTask.title.trim(),

        description: "",

        assignedEmployee: quickTask.assignedEmployee || null,

        deadline: quickTask.deadline || null,
      });

      setQuickTaskComponentId("");

      setQuickTask({
        title: "",
        assignedEmployee: "",
        deadline: "",
      });

      await loadData();
    } catch (error) {
      console.error("Error adding manual task:", error);

      alert(error.response?.data?.message || "Failed to add manual task.");
    } finally {
      setAddingManualTask(false);
    }
  };

  // ==========================================
  // PROJECT DOMAINS
  // ==========================================

  const projectDomains = Array.isArray(project?.domains) ? project.domains : [];

  // ==========================================
  // FILTER WORK ITEMS BY SELECTED DOMAIN
  // ==========================================

  const filteredManualTaskComponents = quickTaskDomainId
    ? components.filter((component) => {
        const componentDomainId =
          component?.projectModule?.domain?._id ||
          component?.projectModule?.domain ||
          "";

        return componentDomainId.toString() === quickTaskDomainId.toString();
      })
    : [];

  // ==========================================
  // FILTER EMPLOYEES BY SELECTED DOMAIN
  // ==========================================
  const filteredProjectMembers = quickTaskDomainId
    ? projectMembers.filter((member) => {
        const memberDomainId = member?.domain?._id || member?.domain || "";

        return memberDomainId.toString() === quickTaskDomainId.toString();
      })
    : projectMembers;

  return (
    <div className="min-h-full bg-[#e9edf2] text-[#1f2937]">
      <div className="p-4 mx-auto space-y-5 max-w-7xl sm:p-6 lg:p-8">
        {/* ======================================
          BREADCRUMB
      ======================================= */}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => navigate(`/admin/project/${id}`)}
            className="transition-colors hover:text-foreground"
          >
            {project?.name || "Project"}
          </button>

          <span>/</span>

          <span className="font-medium text-foreground">Project Work</span>
        </div>

        {/* ======================================
          HEADER
      ======================================= */}

        <div
          className="
          flex
          flex-col
          gap-3
          border-b
          border-[#cfd6df]
          pb-4
          md:flex-row
          md:items-center
          md:justify-between
        "
        >
          <div className="flex items-center gap-3">
            <div
              className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-[#cfd6df]
              bg-[#f8f9fb]
            "
            >
              <FolderKanban size={19} className="text-[#334155]" />
            </div>

            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Project Work
              </h1>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {project?.name || "Manage project work items and tasks"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="
              border-[#cfd6df]
              bg-[#f8f9fb]
              px-3
              py-1
              text-xs
              font-medium
            "
            >
              {components.length} Work Items
            </Badge>

            <Badge
              variant="outline"
              className="
              border-[#cfd6df]
              bg-[#f8f9fb]
              px-3
              py-1
              text-xs
              font-medium
            "
            >
              {totalTasks} Tasks
            </Badge>
          </div>
        </div>

        {/* ======================================
                PROJECT WORK TABS
            ======================================= */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* ======================================
                  TAB NAVIGATION
              ======================================= */}

          <div className="border-b border-[#cfd6df] pb-3">
            <TabsList className="h-auto gap-1 bg-[#e9eef5] p-1">
              <TabsTrigger
                value="work-items"
                className="
          gap-2
          px-4
          text-xs
          data-[state=active]:bg-white
          data-[state=active]:text-[#1f2937]
          data-[state=active]:shadow-sm
        "
              >
                <ClipboardList size={15} />
                Work Items
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {components.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="components"
                className="
          gap-2
          px-4
          text-xs
          data-[state=active]:bg-white
          data-[state=active]:text-[#1f2937]
          data-[state=active]:shadow-sm
        "
              >
                <Boxes size={15} />
                Components
              </TabsTrigger>

              <TabsTrigger
                value="manual-tasks"
                className="
          gap-2
          px-4
          text-xs
          data-[state=active]:bg-white
          data-[state=active]:text-[#1f2937]
          data-[state=active]:shadow-sm
        "
              >
                <ClipboardList size={15} />
                Manual Tasks
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ======================================
      WORK ITEMS TAB
  ======================================= */}

          <TabsContent value="work-items" className="mt-5 space-y-4">
            {/* HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1f2937]">
                  Work Items
                </h2>

                <p className="mt-1 text-sm text-[#64748b]">
                  Manage project work items and their assigned tasks.
                </p>
              </div>

              <Button
                onClick={() => setOpenAddDialog(true)}
                className="
          h-9
          shrink-0
          gap-2
          bg-[#2563eb]
          text-xs
          text-white
          hover:bg-[#1d4ed8]
        "
              >
                <Plus size={16} />
                Add Work Item
              </Button>
            </div>

            {/* WORK ITEM LIST */}

            {components.length === 0 ? (
              <Card className="border-[#d7dde5] bg-[#f8f9fb] shadow-none">
                <Select
                  value={quickTaskComponentId}
                  onValueChange={setQuickTaskComponentId}
                  disabled={!quickTaskDomainId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        quickTaskDomainId
                          ? "Select work item"
                          : "Select domain first"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {!quickTaskDomainId ? (
                      <SelectItem value="select-domain-first" disabled>
                        Select a domain first
                      </SelectItem>
                    ) : filteredManualTaskComponents.length === 0 ? (
                      <SelectItem value="no-work-items" disabled>
                        No work items available for this domain
                      </SelectItem>
                    ) : (
                      filteredManualTaskComponents.map((component) => (
                        <SelectItem key={component._id} value={component._id}>
                          {component.name ||
                            component.componentTemplate?.name ||
                            "Unnamed Work Item"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Card>
            ) : (
              /*
        IMPORTANT:

        Keep your existing complete Work Item rendering code here.

        Do not replace it with the incomplete example card from
        the previous code.
      */
              <div className="space-y-3">
                {components.map((component) => {
                  const isCollapsed = collapsedComponents[component._id];

                  const workItemName =
                    component?.componentTemplate?.name ||
                    component?.name ||
                    "Untitled Work Item";

                  const workItemDescription =
                    component?.componentTemplate?.description ||
                    component?.description ||
                    "";

                  return (
                    <Card
                      key={component._id}
                      className="overflow-hidden border-[#d7dde5] bg-[#f8f9fb] shadow-none"
                    >
                      {/* ======================================
                  WORK ITEM HEADER
              ======================================= */}

                      <div
                        className="
                  flex
                  cursor-pointer
                  items-start
                  justify-between
                  gap-4
                  bg-[#edf1f5]
                  px-4
                  py-4
                  transition-colors
                  hover:bg-[#e7ecf2]
                "
                        onClick={() =>
                          setCollapsedComponents((previous) => ({
                            ...previous,
                            [component._id]: !previous[component._id],
                          }))
                        }
                      >
                        <div className="flex items-start min-w-0 gap-3">
                          <div
                            className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#dfe6ee]
                    "
                          >
                            <Layers size={17} className="text-[#475569]" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-[#1f2937]">
                              {workItemName}
                            </h3>

                            {/* {workItemDescription && (
                              <p className="mt-1 text-left text-sm text-[#64748b]">
                                {workItemDescription}
                              </p>
                            )} */}

                            <Badge
                              variant="outline"
                              className="
                        mt-2
                        border-[#cfd6df]
                        bg-[#f8f9fb]
                        text-[10px]
                      "
                            >
                              {component.tasks?.length || 0}{" "}
                              {(component.tasks?.length || 0) === 1
                                ? "Task"
                                : "Tasks"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isCollapsed ? (
                            <ChevronDown size={18} className="text-[#64748b]" />
                          ) : (
                            <ChevronUp size={18} className="text-[#64748b]" />
                          )}
                        </div>
                      </div>

                      {/* ======================================
                  TASK LIST
              ======================================= */}

                      {!isCollapsed && (
                        <div className="border-t border-[#d7dde5] bg-[#f8f9fb]">
                          {!component.tasks || component.tasks.length === 0 ? (
                            <div className="px-6 py-8 text-center">
                              <p className="text-sm text-muted-foreground">
                                No tasks available in this work item.
                              </p>
                            </div>
                          ) : (
                            <div className="divide-y divide-[#d7dde5]">
                              {component.tasks.map((task) => {
                                const assignedEmployee =
                                  task.assignedEmployee ||
                                  task.employee ||
                                  task.projectMember?.employee;

                                return (
                                  <div
                                    key={task._id}
                                    className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between"
                                  >
                                    {/* TASK INFO */}

                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-sm font-medium text-[#1f2937]">
                                          {task.title}
                                        </h4>

                                        {task.status && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px]"
                                          >
                                            {task.status}
                                          </Badge>
                                        )}
                                      </div>

                                      {task.description && (
                                        <p className="mt-1 text-sm text-[#64748b]">
                                          {task.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        {assignedEmployee && (
                                          <div className="flex items-center gap-1.5">
                                            <UserRound size={13} />

                                            <span>
                                              {assignedEmployee.username ||
                                                assignedEmployee.name ||
                                                "Assigned"}
                                            </span>
                                          </div>
                                        )}

                                        {task.deadline && (
                                          <div className="flex items-center gap-1.5">
                                            <CalendarDays size={13} />

                                            <span>
                                              {new Date(
                                                task.deadline,
                                              ).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* TASK ACTION */}

                                    {!assignedEmployee ? (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="
      h-9
      shrink-0
      border-[#cbd5e1]
      bg-white
      text-xs
      hover:bg-[#f1f5f9]
    "
                                        onClick={(event) => {
                                          event.stopPropagation();

                                          setSelectedTask({
                                            componentId: component._id,
                                            taskId: task._id,
                                            title: task.title || "",
                                          });

                                          setSelectedProjectMember("");

                                          setDeadline("");

                                          setAssignDialogOpen(true);
                                        }}
                                      >
                                        Assign
                                      </Button>
                                    ) : task.status === "PENDING" ? (
                                      <Badge
                                        variant="outline"
                                        className="flex items-center px-4 text-xs font-medium h-9 shrink-0 border-amber-200 bg-amber-50 text-amber-700"
                                      >
                                        Waiting for Submission
                                      </Badge>
                                    ) : task.status === "UNDER_REVIEW" ? (
                                      <Badge
                                        variant="outline"
                                        className="flex items-center px-4 text-xs font-medium h-9 shrink-0 border-amber-200 bg-amber-50 text-amber-700"
                                      >
                                        Under Review
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="flex items-center px-4 text-xs font-medium h-9 shrink-0"
                                      >
                                        {task.status || "Pending"}
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ======================================
      COMPONENTS TAB
  ======================================= */}

          <TabsContent value="components" className="mt-5 space-y-4">
            {/* HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1f2937]">
                  Components
                </h2>

                <p className="mt-1 text-sm text-[#64748b]">
                  Components currently assigned to this project.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setOpenAddDialog(true)}
                className="
          h-9
          shrink-0
          gap-2
          bg-[#2563eb]
          text-xs
          text-white
          hover:bg-[#1d4ed8]
        "
              >
                <Plus size={16} />
                Add Component
              </Button>
            </div>

            {/* PROJECT ASSIGNED COMPONENTS ONLY */}

            {components.length === 0 ? (
              <Card className="border-[#d7dde5] bg-[#f8f9fb] shadow-none">
                <CardContent className="text-center py-14">
                  <Boxes size={34} className="mx-auto text-muted-foreground" />

                  <h3 className="mt-3 text-base font-semibold">
                    No components assigned
                  </h3>

                  <p className="max-w-md mx-auto mt-1 text-sm text-muted-foreground">
                    Add a component to this project to see it here.
                  </p>

                  <Button
                    type="button"
                    onClick={() => setOpenAddDialog(true)}
                    className="
              mt-5
              h-9
              gap-2
              bg-[#2563eb]
              text-xs
              text-white
              hover:bg-[#1d4ed8]
            "
                  >
                    <Plus size={16} />
                    Add Component
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {components.map((component) => {
                  const template = component.componentTemplate || component;

                  const componentName =
                    template?.name || component?.name || "Unnamed Component";

                  const componentDescription =
                    template?.description || component?.description || "";

                  const taskCount =
                    component.tasks?.length || template.tasks?.length || 0;

                  return (
                    <Card
                      key={component._id}
                      className="border-[#d7dde5] bg-[#f8f9fb] shadow-none"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#e4eaf1]
                    "
                          >
                            <Boxes size={18} className="text-[#475569]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[#1f2937]">
                              {componentName}
                            </h3>

                            {componentDescription && (
                              <p className="mt-1 text-left text-sm text-[#64748b]">
                                {componentDescription}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-3">
                              <Badge
                                variant="outline"
                                className="
                          border-[#cfd6df]
                          bg-white
                          text-[10px]
                        "
                              >
                                {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
                              </Badge>

                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Assigned to Project
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ======================================
                  MANUAL TASKS TAB
              ======================================= */}

          <TabsContent value="manual-tasks" className="mt-5 space-y-4">
            {/* HEADER */}

            <div>
              <h2 className="text-lg font-semibold text-[#1f2937]">
                Manual Tasks
              </h2>

              <p className="mt-1 text-sm text-[#64748b]">
                Add tasks manually and assign them directly to project
                employees.
              </p>
            </div>

            {/* MANUAL TASK FORM */}

            <Card className="border-[#d7dde5] bg-[#f8f9fb] shadow-none">
              <CardContent className="p-4">
                {components.length === 0 ? (
                  <div
                    className="
          rounded-lg
          border
          border-dashed
          border-[#cbd5e1]
          bg-[#f3f6f9]
          px-4
          py-6
          text-center
          text-sm
          text-[#64748b]
        "
                  >
                    Add a work item first before creating a manual task.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* ======================================
            DOMAIN
        ======================================= */}

                    <div className="lg:col-span-2">
                      <Label className="block mb-2">Domain</Label>

                      <Select
                        value={quickTaskDomainId}
                        onValueChange={(value) => {
                          setQuickTaskDomainId(value);

                          // Reset work item because domain changed
                          setQuickTaskComponentId("");

                          // Reset employee because domain changed
                          setQuickTask((previous) => ({
                            ...previous,
                            assignedEmployee: "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>

                        <SelectContent>
                          {projectDomains.length === 0 ? (
                            <SelectItem value="no-domain" disabled>
                              No domains assigned
                            </SelectItem>
                          ) : (
                            projectDomains.map((domain) => (
                              <SelectItem key={domain._id} value={domain._id}>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        domain.color || "#64748b",
                                    }}
                                  />

                                  {domain.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ======================================
            WORK ITEM
        ======================================= */}

                    <div className="lg:col-span-3">
                      <Label className="block mb-2">Work Item</Label>

                      <Select
                        value={quickTaskComponentId}
                        onValueChange={setQuickTaskComponentId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select work item" />
                        </SelectTrigger>

                        <SelectContent>
                          {components.map((component) => (
                            <SelectItem
                              key={component._id}
                              value={component._id}
                            >
                              {component.componentTemplate?.name ||
                                component.name ||
                                "Unnamed Work Item"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ======================================
            TASK NAME
        ======================================= */}

                    <div className="lg:col-span-3">
                      <Label className="block mb-2">Task Name</Label>

                      <Input
                        value={quickTask.title}
                        onChange={(event) =>
                          setQuickTask((previous) => ({
                            ...previous,
                            title: event.target.value,
                          }))
                        }
                        placeholder="Enter manual task"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();

                            handleQuickAddManualTask();
                          }
                        }}
                      />
                    </div>

                    {/* ======================================
            EMPLOYEE
        ======================================= */}

                    <div className="lg:col-span-2">
                      <Label className="block mb-2">Employee</Label>

                      <Select
                        value={quickTask.assignedEmployee}
                        onValueChange={(value) =>
                          setQuickTask((previous) => ({
                            ...previous,
                            assignedEmployee: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign employee" />
                        </SelectTrigger>

                        <SelectContent>
                          {filteredProjectMembers.length === 0 ? (
                            <SelectItem value="no-employee" disabled>
                              No employees available
                            </SelectItem>
                          ) : (
                            filteredProjectMembers.map((member) => {
                              const employee = member.employee || member;

                              const employeeId = employee._id || member._id;

                              const employeeName =
                                employee.username ||
                                employee.name ||
                                "Unknown Employee";

                              return (
                                <SelectItem key={employeeId} value={employeeId}>
                                  {employeeName}
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ======================================
                          DEADLINE
                      ======================================= */}

                    <div className="lg:col-span-1">
                      <Label className="block mb-2">Deadline</Label>

                      <Input
                        type="date"
                        value={quickTask.deadline}
                        onChange={(event) =>
                          setQuickTask((previous) => ({
                            ...previous,
                            deadline: event.target.value,
                          }))
                        }
                      />
                    </div>

                    {/* ======================================
            ADD BUTTON
        ======================================= */}

                    <div className="flex items-end lg:col-span-1">
                      <Button
                        type="button"
                        onClick={handleQuickAddManualTask}
                        disabled={
                          addingManualTask ||
                          !quickTaskComponentId ||
                          !quickTask.title.trim()
                        }
                        className="
              h-10
              w-full
              gap-2
              bg-[#2563eb]
              px-3
              text-white
              hover:bg-[#1d4ed8]
            "
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ======================================
                ADD WORK ITEM DIALOG
            ======================================= */}

        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent className="border-[#cfd6df] bg-[#f8f9fb]">
            <DialogHeader>
              <DialogTitle>Add Work Item</DialogTitle>

              <DialogDescription>
                Select a module and reusable component to add to this project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Select Module</Label>

                <Select
                  value={selectedModule}
                  onValueChange={handleModuleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project module" />
                  </SelectTrigger>

                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module._id} value={module._id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Work Item</Label>

                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                  disabled={!selectedModule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work item" />
                  </SelectTrigger>

                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                Cancel
              </Button>

              <Button
                onClick={handleAddComponent}
                className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
              >
                Add Work Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================
                ASSIGN TASK DIALOG
            ======================================= */}

        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="border-[#cfd6df] bg-[#f8f9fb]">
            <DialogHeader>
              <DialogTitle>Assign Task</DialogTitle>

              <DialogDescription>
                Assign this task to a project member.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-6">
              {/* TASK */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                  Task
                </Label>

                <Input
                  value={selectedTask?.title || ""}
                  disabled
                  className="
        h-11
        bg-[#182230]
        border-[#334155]
        text-slate-300
        opacity-100
        disabled:opacity-100
        disabled:cursor-default
      "
                />
              </div>

              {/* ASSIGN EMPLOYEE */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                  Assign To
                </Label>

                <Select
                  value={selectedProjectMember}
                  onValueChange={setSelectedProjectMember}
                >
                  <SelectTrigger
                    className="
          h-11
          bg-[#182230]
          border-[#334155]
          text-slate-200
        "
                  >
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>

                  <SelectContent>
                    {projectMembers.length === 0 ? (
                      <SelectItem value="no-employee" disabled>
                        No project members available
                      </SelectItem>
                    ) : (
                      projectMembers.map((member) => {
                        const employee = member.employee || member;

                        const employeeId = employee._id || member._id;

                        const employeeName =
                          employee.username ||
                          employee.name ||
                          "Unknown Employee";

                        return (
                          <SelectItem key={member._id} value={member._id}>
                            {employeeName}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* DEADLINE */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">
                  Deadline
                </Label>

                <div className="relative">
                  <Input
                    ref={deadlineInputRef}
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="
          h-11
          w-full
          bg-[#182230]
          border-[#334155]
          text-slate-200
          pr-12
          [color-scheme:dark]
          focus:border-blue-500
          focus:ring-1
          focus:ring-blue-500
        "
                  />

                  <button
                    type="button"
                    onClick={() => {
                      if (deadlineInputRef.current?.showPicker) {
                        deadlineInputRef.current.showPicker();
                      } else {
                        deadlineInputRef.current?.focus();
                      }
                    }}
                    className="absolute flex items-center justify-center transition-colors -translate-y-1/2 rounded-md right-3 top-1/2 h-7 w-7 text-slate-400 hover:bg-slate-700 hover:text-white"
                    aria-label="Select deadline"
                  >
                    <CalendarDays className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseAssignDialog}
                  className="
      h-11
      min-w-[100px]
      border-[#475569]
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
                  onClick={handleAssignTask}
                  disabled={!selectedProjectMember}
                  className="
      h-11
      min-w-[130px]
      bg-blue-600
      text-white
      hover:bg-blue-700
    "
                >
                  Assign Task
                </Button>
              </div>{" "}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================
          ADD MANUAL TASK DIALOG
      ======================================= */}

        <Dialog
          open={manualTaskDialogOpen}
          onOpenChange={(open) => {
            setManualTaskDialogOpen(open);

            if (!open) {
              setSelectedComponentForTask(null);

              setManualTask({
                title: "",
                description: "",
                assignedEmployee: "",
                deadline: "",
              });
            }
          }}
        >
          <DialogContent className="max-w-lg border-[#cfd6df] bg-[#f8f9fb]">
            <DialogHeader>
              <DialogTitle>Add Manual Task</DialogTitle>

              <DialogDescription>
                Add a task directly to this work item. The assigned employee can
                mark it as completed using a checkbox.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="rounded-lg border border-[#d7dde5] bg-[#eef1f5] p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Work Item
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1f2937]">
                  {selectedComponentForTask?.componentTemplate?.name ||
                    selectedComponentForTask?.name ||
                    "Selected Work Item"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Task Name</Label>

                <Input
                  value={manualTask.title}
                  onChange={(event) =>
                    setManualTask((previous) => ({
                      ...previous,

                      title: event.target.value,
                    }))
                  }
                  placeholder="Enter task name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>

                <Textarea
                  value={manualTask.description}
                  onChange={(event) =>
                    setManualTask((previous) => ({
                      ...previous,

                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional task description"
                  className="min-h-[90px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Employee</Label>

                <Select
                  value={manualTask.assignedEmployee}
                  onValueChange={(value) =>
                    setManualTask((previous) => ({
                      ...previous,

                      assignedEmployee: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>

                  <SelectContent>
                    {projectMembers.map((member) => {
                      const employee = member.employee || member;

                      const employeeId = employee._id || member._id;

                      const employeeName =
                        employee.username ||
                        employee.name ||
                        "Unknown Employee";

                      return (
                        <SelectItem key={employeeId} value={employeeId}>
                          {employeeName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Deadline</Label>

                <Input
                  type="date"
                  value={manualTask.deadline}
                  onChange={(event) =>
                    setManualTask((previous) => ({
                      ...previous,

                      deadline: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={addingManualTask}
                onClick={() => setManualTaskDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={addingManualTask || !manualTask.title.trim()}
                onClick={handleAddManualTask}
                className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
              >
                {addingManualTask ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================
          CREATE COMPONENT DIALOG
      ======================================= */}

        <Dialog
          open={openCreateComponent}
          onOpenChange={setOpenCreateComponent}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#cfd6df] bg-[#f8f9fb]">
            <DialogHeader>
              <DialogTitle>Add Component</DialogTitle>

              <DialogDescription>
                Create a reusable component and define the tasks included in it.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-5">
              <div className="space-y-2">
                <Label>Project Module</Label>

                <select
                  value={newComponent.projectModule}
                  onChange={(event) =>
                    setNewComponent((previous) => ({
                      ...previous,

                      projectModule: event.target.value,
                    }))
                  }
                  className="flex w-full h-10 px-3 py-2 text-sm bg-white border rounded-md border-input"
                >
                  <option value="">Select module</option>

                  {modules.map((module) => (
                    <option key={module._id} value={module._id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Component Name</Label>

                <Input
                  value={newComponent.name}
                  onChange={(event) =>
                    setNewComponent((previous) => ({
                      ...previous,

                      name: event.target.value,
                    }))
                  }
                  placeholder="Enter component name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>

                <Textarea
                  value={newComponent.description}
                  onChange={(event) =>
                    setNewComponent((previous) => ({
                      ...previous,

                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional component description"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Component Tasks</Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Define the tasks included in this reusable component.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={addComponentTask}
                  >
                    <Plus size={14} />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-3">
                  {newComponent.tasks.map((task, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-[#d7dde5] bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Task {index + 1}</p>

                        {newComponent.tasks.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeComponentTask(index)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-3 mt-3">
                        <Input
                          value={task.title}
                          onChange={(event) =>
                            updateComponentTask(
                              index,
                              "title",
                              event.target.value,
                            )
                          }
                          placeholder="Task title"
                        />

                        <Textarea
                          value={task.description}
                          onChange={(event) =>
                            updateComponentTask(
                              index,
                              "description",
                              event.target.value,
                            )
                          }
                          placeholder="Task description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenCreateComponent(false)}
                disabled={creatingComponent}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleCreateComponent}
                disabled={creatingComponent}
                className="bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
              >
                {creatingComponent ? "Creating..." : "Create Component"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
