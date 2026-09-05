import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { getProjectById } from "@/api/projectAPI";

import { useAlertDialog } from "@/components/common/ConfirmDialogContext";
import {
  addProjectComponent,
  addManualTask,
  assignTask,
  getProjectComponents,
  updateProjectComponent,
  deleteProjectComponent,
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
import { useConfirmDialog } from "@/components/common/ConfirmDialogContext";

export default function ProjectComponents() {
  const alertDialog = useAlertDialog();

  const { id } = useParams();

  const { confirm } = useConfirmDialog();

  const navigate = useNavigate();

  const location = useLocation();

  const deadlineInputRef = useRef(null);
  const quickTaskDeadlineInputRef = useRef(null);
  const manualTaskDeadlineInputRef = useRef(null);
  const taskRefs = useRef({});

  const cancelButtonClass =
    "border-[#475569] !bg-[#222e3d] text-slate-200 hover:!bg-[#2a3849] hover:text-white";

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
    description: "",
    assignedEmployee: "",
    deadline: "",
  });

  // ==========================================
  // EDIT WORK ITEM STATE
  // ==========================================

  const [editWorkItemOpen, setEditWorkItemOpen] = useState(false);

  const [editingComponent, setEditingComponent] = useState(null);

  const [savingWorkItem, setSavingWorkItem] = useState(false);

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

      const loadedComponents = componentRes.data.data || [];

      setComponents(loadedComponents);

      // All work items collapsed by default
      setCollapsedComponents((previous) => {
        const collapsedState = { ...previous };

        loadedComponents.forEach((component) => {
          // Only set default state for newly loaded components.
          // This prevents existing user expand/collapse choices
          // from being reset unnecessarily.
          if (collapsedState[component._id] === undefined) {
            collapsedState[component._id] = true;
          }
        });

        return collapsedState;
      });

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
      alertDialog("Please select a work item.");

      return;
    }

    try {
      await addProjectComponent({
        projectId: id,

        componentTemplateId: selectedTemplate,
      });

      handleCloseAddWorkItemDialog();

      await loadData();
    } catch (err) {
      console.error(err);

      alertDialog(err.response?.data?.message || "Failed to add work item.");
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
  // CLOSE ADD WORK ITEM DIALOG
  // ==========================================

  const handleCloseAddWorkItemDialog = () => {
    setOpenAddDialog(false);

    setSelectedModule("");

    setSelectedTemplate("");

    setTemplates([]);
  };

  // ==========================================
  // CLOSE MANUAL TASK DIALOG
  // ==========================================

  const handleCloseManualTaskDialog = () => {
    setManualTaskDialogOpen(false);

    setSelectedComponentForTask(null);

    setManualTask({
      title: "",
      description: "",
      assignedEmployee: "",
      deadline: "",
    });
  };

  // ==========================================
  // CLOSE CREATE COMPONENT DIALOG
  // ==========================================

  const handleCloseCreateComponentDialog = () => {
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
  };

  // ==========================================
  // CLOSE EDIT WORK ITEM DIALOG
  // ==========================================

  const handleCloseEditWorkItemDialog = () => {
    setEditWorkItemOpen(false);

    setEditingComponent(null);
  };

  // ==========================================
  // ASSIGN TASK
  // ==========================================

  const handleAssignTask = async () => {
    if (!selectedTask) {
      return;
    }

    if (!selectedProjectMember) {
      alertDialog("Please select an employee.");

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

      alertDialog(err.response?.data?.message || "Assignment failed.");
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
  // OPEN SPECIFIC TASK FROM URL
  // ==========================================

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const componentId = searchParams.get("component");
    const taskId = searchParams.get("task");

    if (!componentId || !taskId || components.length === 0) {
      return;
    }

    const componentExists = components.find(
      (component) => component._id?.toString() === componentId.toString(),
    );

    if (!componentExists) {
      return;
    }

    const taskExists = componentExists.tasks?.find(
      (task) => task._id?.toString() === taskId.toString(),
    );

    if (!taskExists) {
      return;
    }

    // Open Work Items tab
    setActiveTab("work-items");

    // Expand the required work item
    setCollapsedComponents((previous) => ({
      ...previous,
      [componentId]: false,
    }));

    // Wait for React to render the expanded task
    setTimeout(() => {
      const taskElement = taskRefs.current[taskId];

      if (taskElement) {
        taskElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Highlight the selected task temporarily
        taskElement.classList.add("ring-2", "ring-blue-400", "bg-blue-50");

        setTimeout(() => {
          taskElement.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
        }, 2500);
      }
    }, 200);
  }, [components, location.search]);

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
      alertDialog("Please select a project module.");

      return;
    }

    if (!newComponent.name.trim()) {
      alertDialog("Please enter a component name.");

      return;
    }

    const validTasks = newComponent.tasks.filter(
      (task) => task.title.trim() !== "",
    );

    if (validTasks.length === 0) {
      alertDialog("Please add at least one task.");

      return;
    }

    try {
      setCreatingComponent(true);

      const response = await createComponentTemplate({
        projectModule: newComponent.projectModule,

        name: newComponent.name.trim(),

        description: newComponent.description.trim(),

        tasks: validTasks.map((task) => ({
          title: task.title.trim(),
          description: task.description.trim(),
        })),
      });

      const createdComponent = response.data?.data;

      if (createdComponent?._id) {
        await addProjectComponent({
          projectId: id,
          componentTemplateId: createdComponent._id,
        });
      }

      await fetchComponentTemplates();

      handleCloseCreateComponentDialog();

      await loadData();

      setActiveTab("work-items");
      await fetchComponentTemplates();
      handleCloseCreateComponentDialog();
    } catch (error) {
      console.error("Error creating component:", error);

      alertDialog(
        error.response?.data?.message || "Failed to create component.",
      );
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
      alertDialog("Please enter a task title.");

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

      handleCloseManualTaskDialog();

      await loadData();
    } catch (error) {
      console.error("Error adding manual task:", error);

      alertDialog(error.response?.data?.message || "Failed to add task.");
    } finally {
      setAddingManualTask(false);
    }
  };

  const handleQuickAddManualTask = async () => {
    if (addingManualTask) {
      return;
    }

    if (!quickTaskDomainId) {
      alertDialog("Please select a domain.");

      return;
    }

    if (!quickTaskComponentId) {
      alertDialog("Please select a work item.");

      return;
    }

    if (!quickTask.title.trim()) {
      alertDialog("Please enter a task name.");

      return;
    }

    try {
      setAddingManualTask(true);

      const payload = {
        title: quickTask.title.trim(),
        description: quickTask.description.trim(),
        assignedEmployee: quickTask.assignedEmployee || null,
        deadline: quickTask.deadline || null,
      };

      console.log("Adding manual task:", {
        componentId: quickTaskComponentId,
        payload,
      });

      await addManualTask(quickTaskComponentId, payload);

      setQuickTaskComponentId("");

      setQuickTask({
        title: "",
        description: "",
        assignedEmployee: "",
        deadline: "",
      });

      await loadData();
    } catch (error) {
      console.error("Error adding manual task:", error.response?.data || error);

      alertDialog(
        error.response?.data?.message || "Failed to add manual task.",
      );
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
        return (
          component.resolvedDomainId &&
          component.resolvedDomainId.toString() === quickTaskDomainId.toString()
        );
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

  // ==========================================
  // OPEN EDIT WORK ITEM
  // ==========================================

  const handleOpenEditWorkItem = (component) => {
    setEditingComponent({
      _id: component._id,

      name: component.name || "",

      description: component.description || "",

      tasks: (component.tasks || []).map((task, index) => ({
        _id: task._id,

        templateTaskId: task.templateTaskId || null,

        title: task.title || "",

        description: task.description || "",

        displayOrder: task.displayOrder ?? index + 1,

        required: task.required ?? false,

        submissionRule: task.submissionRule || {
          type: "TEXT",
        },
      })),
    });

    setEditWorkItemOpen(true);
  };

  // ==========================================
  // UPDATE EDIT TASK
  // ==========================================

  const updateEditTask = (index, field, value) => {
    setEditingComponent((previous) => {
      const updatedTasks = [...previous.tasks];

      updatedTasks[index] = {
        ...updatedTasks[index],
        [field]: value,
      };

      return {
        ...previous,
        tasks: updatedTasks,
      };
    });
  };

  // ==========================================
  // ADD TASK IN EDIT MODE
  // ==========================================

  const addEditTask = () => {
    setEditingComponent((previous) => ({
      ...previous,

      tasks: [
        ...previous.tasks,

        {
          title: "",

          description: "",

          displayOrder: previous.tasks.length + 1,

          required: false,

          submissionRule: {
            type: "TEXT",
          },
        },
      ],
    }));
  };

  // ==========================================
  // REMOVE TASK IN EDIT MODE
  // ==========================================

  const removeEditTask = (index) => {
    setEditingComponent((previous) => ({
      ...previous,

      tasks: previous.tasks.filter((_, taskIndex) => taskIndex !== index),
    }));
  };

  // ==========================================
  // SAVE WORK ITEM
  // ==========================================

  const handleSaveWorkItem = async () => {
    if (!editingComponent) {
      return;
    }

    if (!editingComponent.name.trim()) {
      alertDialog("Please enter a work item name.");

      return;
    }

    const invalidTask = editingComponent.tasks.some(
      (task) => !task.title.trim(),
    );

    if (invalidTask) {
      alertDialog("Please enter a title for every task.");

      return;
    }

    try {
      setSavingWorkItem(true);

      await updateProjectComponent(editingComponent._id, {
        name: editingComponent.name.trim(),

        description: editingComponent.description.trim(),

        tasks: editingComponent.tasks.map((task, index) => ({
          ...task,

          title: task.title.trim(),

          description: task.description.trim(),

          displayOrder: index + 1,
        })),
      });

      setEditWorkItemOpen(false);

      setEditingComponent(null);

      await loadData();
    } catch (error) {
      console.error("Error updating work item:", error);

      alertDialog(
        error.response?.data?.message || "Failed to update work item.",
      );
    } finally {
      setSavingWorkItem(false);
    }
  };

  // ==========================================
  // DELETE WORK ITEM
  // ==========================================
  const handleDeleteWorkItem = async (component) => {
    const confirmed = await confirm({
      title: "Delete Work Item?",
      description: `Are you sure you want to delete "${component.name}"? This will delete the work item and all tasks inside this project only.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteProjectComponent(component._id);

      await loadData();
    } catch (error) {
      console.error("Error deleting work item:", error);

      alertDialog(
        error.response?.data?.message || "Failed to delete work item.",
      );
    }
  };

  // ==========================================
  // TASK SUBMISSION / REVIEW HELPERS
  // ==========================================
  const getSubmissionId = (task) => {
    if (!task) return "";

    if (typeof task.submissionId === "object") {
      return task.submissionId?._id || task.submissionId?.id || "";
    }

    return (
      task.submissionId ||
      task.submission?._id ||
      task.submission?.id ||
      task.submission ||
      ""
    );
  };

  const handleOpenSubmission = (task) => {
    const submissionId = getSubmissionId(task);

    if (!submissionId) {
      alertDialog("Submission details are not available for this task.");
      return;
    }

    navigate(`/admin/reviews/${submissionId}`);
  };

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
                Add Tasks
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
                <CardContent className="text-center py-14">
                  <ClipboardList
                    size={34}
                    className="mx-auto text-muted-foreground"
                  />

                  <h3 className="mt-3 text-base font-semibold">
                    No work items added
                  </h3>

                  <p className="max-w-md mx-auto mt-1 text-sm text-muted-foreground">
                    Add a work item to start managing tasks for this project.
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
                    Add Work Item
                  </Button>
                </CardContent>
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
                    component?.name ||
                    component?.componentTemplate?.name ||
                    "Untitled Work Item";

                  const workItemDescription =
                    component?.description ||
                    component?.componentTemplate?.description ||
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
            items-center
            justify-between
            gap-4
            bg-[#edf1f5]
            px-4
            py-3
            transition-colors
            hover:bg-[#e7ecf2]
          "
                        onClick={() => toggleComponent(component._id)}
                      >
                        {/* LEFT SIDE */}

                        <div className="flex items-center min-w-0 gap-3">
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
                            <div className="flex items-center gap-3">
                              <h3 className="truncate text-sm font-semibold text-[#1f2937]">
                                {workItemName}
                              </h3>

                              <Badge
                                variant="outline"
                                className="shrink-0 border-[#cfd6df] bg-[#f8f9fb] text-[10px]"
                              >
                                {component.tasks?.length || 0} Tasks
                              </Badge>
                            </div>

                            {workItemDescription && (
                              <p className="mt-1 truncate text-xs text-[#64748b]">
                                {workItemDescription}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* RIGHT SIDE ACTIONS */}

                        <div className="flex items-center gap-2 shrink-0">
                          {/* EDIT */}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs"
                            onClick={(event) => {
                              event.stopPropagation();

                              handleOpenEditWorkItem(component);
                            }}
                          >
                            Edit
                          </Button>

                          {/* DELETE */}

                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 text-red-600 hover:text-red-700"
                            onClick={(event) => {
                              event.stopPropagation();

                              handleDeleteWorkItem(component);
                            }}
                            aria-label={`Delete ${workItemName}`}
                          >
                            <Trash2 size={15} />
                          </Button>

                          {/* COLLAPSE ICON */}

                          <div className="flex items-center justify-center w-8 h-8 ml-1">
                            {isCollapsed ? (
                              <ChevronDown
                                size={18}
                                className="text-[#64748b]"
                              />
                            ) : (
                              <ChevronUp size={18} className="text-[#64748b]" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ======================================
                TASK LIST
            ======================================= */}

                      {!isCollapsed && (
                        <div className="border-t border-[#d7dde5] bg-[#f8f9fb]">
                          {!component.tasks || component.tasks.length === 0 ? (
                            <div className="px-6 py-6 text-center">
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
                                    ref={(element) => {
                                      if (element) {
                                        taskRefs.current[task._id] = element;
                                      }
                                    }}
                                    className="flex flex-col gap-3 px-5 py-3 transition-all duration-300 md:flex-row md:items-center md:justify-between"
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
                                            className={`text-[10px] ${getTaskStatusClass(task.status)}`}
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

                                      {(assignedEmployee || task.deadline) && (
                                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                                      )}
                                    </div>

                                    {/* TASK ACTION */}

                                    <div className="flex items-center shrink-0">
                                      {!assignedEmployee ? (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className="
        h-8
        shrink-0
        border-[#cbd5e1]
        bg-white
        px-4
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
                                          className="flex items-center h-8 px-4 text-xs font-medium shrink-0 border-amber-200 bg-amber-50 text-amber-700"
                                        >
                                          Waiting for Submission
                                        </Badge>
                                      ) : getSubmissionId(task) ? (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          className={`
        h-8
        shrink-0
        px-4
        text-xs
        font-medium
        ${getTaskStatusClass(task.status)}
        hover:opacity-80
      `}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleOpenSubmission(task);
                                          }}
                                        >
                                          {task.status === "UNDER_REVIEW"
                                            ? "Under Review"
                                            : task.status === "SUBMITTED"
                                              ? "View Submission"
                                              : task.status === "APPROVED"
                                                ? "View Approved"
                                                : task.status === "REJECTED"
                                                  ? "View Rejected"
                                                  : "View Submission"}
                                        </Button>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className={`
        flex
        h-8
        shrink-0
        items-center
        px-4
        text-xs
        font-medium
        ${getTaskStatusClass(task.status)}
      `}
                                        >
                                          {task.status || "Pending"}
                                        </Badge>
                                      )}
                                    </div>
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
                onClick={() => setOpenCreateComponent(true)}
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
                {componentTemplates.map((component) => {
                  const componentName = component?.name || "Unnamed Component";

                  const componentDescription = component?.description || "";

                  const taskCount = component?.tasks?.length || 0;

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
                          {components.length === 0 ? (
                            <SelectItem value="no-work-items" disabled>
                              No work items available
                            </SelectItem>
                          ) : (
                            components.map((component) => (
                              <SelectItem
                                key={component._id}
                                value={component._id}
                              >
                                {component.componentTemplate?.name ||
                                  component.name ||
                                  "Unnamed Work Item"}
                              </SelectItem>
                            ))
                          )}
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

                    {/* TASK DESCRIPTION */}

                    <div className="lg:col-span-12">
                      <Label className="block mb-2">Task Description</Label>

                      <Textarea
                        value={quickTask.description}
                        onChange={(event) =>
                          setQuickTask((previous) => ({
                            ...previous,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Enter task details or completion notes"
                        className="min-h-[90px] resize-none"
                      />
                    </div>

                    {/* ======================================
                                EMPLOYEE
                        ====================================== */}

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

                              const employeeId =
                                employee._id || member.employee;

                              const employeeName =
                                employee.username ||
                                employee.name ||
                                "Unknown Employee";

                              if (!employeeId) {
                                return null;
                              }

                              return (
                                <SelectItem
                                  key={employeeId}
                                  value={employeeId.toString()}
                                >
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
                        ====================================== */}

                    <div className="lg:col-span-1">
                      <Label className="block mb-2">Deadline</Label>

                      <div className="relative">
                        <Input
                          ref={quickTaskDeadlineInputRef}
                          type="date"
                          value={quickTask.deadline}
                          onChange={(event) =>
                            setQuickTask((previous) => ({
                              ...previous,
                              deadline: event.target.value,
                            }))
                          }
                          className="
        h-10
        w-full
        pr-10
        [color-scheme:light]
      "
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const input = quickTaskDeadlineInputRef.current;

                            if (!input) return;

                            if (typeof input.showPicker === "function") {
                              input.showPicker();
                            } else {
                              input.focus();
                              input.click();
                            }
                          }}
                          className="
        absolute
        right-2
        top-1/2
        flex
        h-7
        w-7
        -translate-y-1/2
        items-center
        justify-center
        rounded-md
        text-[#64748b]
        transition-colors
        hover:bg-[#e2e8f0]
        hover:text-[#1f2937]
      "
                          aria-label="Select deadline"
                        >
                          <CalendarDays size={16} />
                        </button>
                      </div>
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
                          !quickTaskDomainId ||
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
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
                      >
                        <Plus className="w-4 h-4" />

                        {addingManualTask ? "Adding..." : "Add"}
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
        <Dialog
          open={openAddDialog}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseAddWorkItemDialog();
            } else {
              setOpenAddDialog(true);
            }
          }}
        >
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
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseAddWorkItemDialog}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAddComponent}
                disabled={!selectedTemplate}
                className="
      bg-[#2563eb]
      text-white
      hover:bg-[#1d4ed8]
    "
              >
                Add Work Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ======================================
                ASSIGN TASK DIALOG
            ======================================= */}
        <Dialog
          open={assignDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseAssignDialog();
            } else {
              setAssignDialogOpen(true);
            }
          }}
        >
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
                          <SelectItem key={member._id} value={employee._id}>
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
            if (!open) {
              handleCloseManualTaskDialog();
            } else {
              setManualTaskDialogOpen(true);
            }
          }}
        >
          <DialogContent className="max-w-lg border-[#cfd6df] bg-[#f8f9fb]">
            <DialogHeader>
              <DialogTitle>Add Manual Task</DialogTitle>

              <DialogDescription>
                Add a task directly to this work item. The assigned employee
                will provide a text submission when completing the task.{" "}
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

                <div className="relative">
                  <Input
                    ref={manualTaskDeadlineInputRef}
                    type="date"
                    value={manualTask.deadline}
                    onChange={(event) =>
                      setManualTask((previous) => ({
                        ...previous,
                        deadline: event.target.value,
                      }))
                    }
                    className="pr-10 [color-scheme:light]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const input = manualTaskDeadlineInputRef.current;

                      if (!input) return;

                      if (typeof input.showPicker === "function") {
                        input.showPicker();
                      } else {
                        input.focus();
                        input.click();
                      }
                    }}
                    className="
        absolute
        right-2
        top-1/2
        flex
        h-7
        w-7
        -translate-y-1/2
        items-center
        justify-center
        rounded-md
        text-[#64748b]
        transition-colors
        hover:bg-[#e2e8f0]
        hover:text-[#1f2937]
      "
                    aria-label="Select deadline"
                  >
                    <CalendarDays size={16} />
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseManualTaskDialog}
                disabled={addingManualTask}
                className={cancelButtonClass}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleAddManualTask}
                disabled={addingManualTask || !manualTask.title.trim()}
                className="
      bg-[#2563eb]
      text-white
      hover:bg-[#1d4ed8]
    "
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
          onOpenChange={(open) => {
            if (!open) {
              handleCloseCreateComponentDialog();
            } else {
              setOpenCreateComponent(true);
            }
          }}
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
                onClick={handleCloseCreateComponentDialog}
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

        {/* ======================================
                EDIT WORK ITEM DIALOG
            ====================================== */}
        <Dialog
          open={editWorkItemOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseEditWorkItemDialog();
            } else {
              setEditWorkItemOpen(true);
            }
          }}
        >
          <DialogContent
            className="
      max-h-[90vh]
      max-w-3xl
      overflow-y-auto
      border
      border-[#334155]
      bg-[#192330]
      p-0
      text-slate-100
    "
          >
            {/* ======================================
            HEADER
    ======================================= */}

            <DialogHeader className="border-b border-[#334155] px-6 py-5">
              <DialogTitle className="text-lg font-semibold text-white">
                Edit Work Item
              </DialogTitle>

              <DialogDescription className="text-sm text-slate-400">
                Changes here affect only this project's work item.
              </DialogDescription>
            </DialogHeader>

            {editingComponent && (
              <div className="px-6 py-5 space-y-5">
                {/* ======================================
                WORK ITEM NAME
        ======================================= */}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-300">
                    Work Item Name
                  </Label>

                  <Input
                    value={editingComponent.name}
                    onChange={(event) =>
                      setEditingComponent((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Work item name"
                    className="
              h-10
              border-[#3b4b60]
              bg-[#222e3d]
              text-slate-100
              placeholder:text-slate-500
              focus:border-blue-500
              focus:ring-1
              focus:ring-blue-500
            "
                  />
                </div>

                {/* ======================================
                            DESCRIPTION
                    ======================================= */}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-300">
                    Description
                  </Label>

                  <Textarea
                    value={editingComponent.description}
                    onChange={(event) =>
                      setEditingComponent((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Work item description"
                    className="
              min-h-[90px]
              resize-none
              border-[#3b4b60]
              bg-[#222e3d]
              text-slate-100
              placeholder:text-slate-500
              focus:border-blue-500
              focus:ring-1
              focus:ring-blue-500
            "
                  />
                </div>

                {/* ======================================
                            TASK HEADER
                    ======================================= */}

                <div className="flex items-end justify-between gap-4 pt-1">
                  <div>
                    <Label className="text-sm font-semibold text-slate-200">
                      Tasks
                    </Label>

                    <p className="mt-1 text-xs text-slate-400">
                      Manage the tasks included in this work item.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEditTask}
                    className="
              h-9
              gap-2
              border-[#3b4b60]
              bg-[#222e3d]
              px-4
              text-sm
              text-slate-200
              hover:bg-[#2a3849]
              hover:text-white
            "
                  >
                    <Plus size={16} />
                    Add Task
                  </Button>
                </div>

                {/* ======================================
                          TASK LIST
                  ======================================= */}

                <div className="space-y-3">
                  {editingComponent.tasks.map((task, index) => (
                    <Card
                      key={task._id || index}
                      className="
                overflow-hidden
                border-[#3b4b60]
                bg-[#222e3d]
                shadow-none
              "
                    >
                      {/* TASK HEADER */}

                      <div
                        className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-[#3b4b60]
                  px-5
                  py-3
                "
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#dce3eb]
                      text-sm
                      font-semibold
                      text-[#334155]
                    "
                          >
                            {index + 1}
                          </div>

                          <span className="text-sm font-medium text-slate-300">
                            Task {index + 1}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEditTask(index)}
                          className="w-8 h-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete Task"
                        >
                          <Trash2 size={17} />
                        </Button>
                      </div>

                      {/* TASK FORM */}

                      <CardContent className="p-5 space-y-4">
                        {/* TASK TITLE */}

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-300">
                            Task Title
                          </Label>

                          <Input
                            value={task.title}
                            onChange={(event) =>
                              updateEditTask(index, "title", event.target.value)
                            }
                            placeholder="Enter task title"
                            className="
                      h-10
                      border-[#3b4b60]
                      bg-[#1b2634]
                      text-slate-100
                      placeholder:text-slate-500
                      focus:border-blue-500
                      focus:ring-1
                      focus:ring-blue-500
                    "
                          />
                        </div>

                        {/* TASK DESCRIPTION */}

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-slate-300">
                            Description
                          </Label>

                          <Textarea
                            value={task.description}
                            onChange={(event) =>
                              updateEditTask(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Enter task description"
                            className="
                      min-h-[80px]
                      resize-none
                      border-[#3b4b60]
                      bg-[#1b2634]
                      text-slate-100
                      placeholder:text-slate-500
                      focus:border-blue-500
                      focus:ring-1
                      focus:ring-blue-500
                    "
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================
                        FOOTER
                ======================================= */}

            <DialogFooter
              className="
        border-t
        border-[#334155]
        bg-[#192330]
        px-6
        py-4
      "
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditWorkItemDialog}
                disabled={savingWorkItem}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveWorkItem}
                disabled={savingWorkItem}
                className="
          h-10
          min-w-[145px]
          bg-[#2563eb]
          text-white
          hover:bg-[#1d4ed8]
        "
              >
                {savingWorkItem ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
