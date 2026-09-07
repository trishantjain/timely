import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Boxes, ClipboardList } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlertDialog, useConfirmDialog } from "@/components/common/ConfirmDialogContext";
import { createComponentTemplate } from "@/api/componentTemplateAPI";
import { addProjectComponent } from "@/api/projectComponentAPI";

import useProjectWork from "./useProjectWork";
import ProjectWorkHeader from "./ProjectWorkHeader";
import DomainTabs from "./DomainTabs";
import DomainWorkView from "./DomainWorkView";
import TemplatesTab from "./TemplatesTab";
import AssignTaskDialog from "./dialogs/AssignTaskDialog";
import ManualTaskDialog from "./dialogs/ManualTaskDialog";
import EditWorkPackageDialog from "./dialogs/EditWorkPackageDialog";
import CreateTemplateDialog from "./dialogs/CreateTemplateDialog";
import { componentBelongsToDomain, templateBelongsToDomain, getSubmissionId } from "./workDisplayUtils";

const GENERAL_DOMAIN_ID = "__general__";

const emptyManualTask = {
  title: "",
  description: "",
  assignedEmployee: "",
  deadline: "",
};

const emptyNewTemplate = {
  projectModule: "",
  name: "",
  description: "",
  tasks: [{ title: "", description: "" }],
};

export default function ProjectWork() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const alertDialog = useAlertDialog();
  const { confirm } = useConfirmDialog();

  const {
    loading,
    project,
    components,
    componentTemplates,
    modules,
    projectMembers,
    refreshComponents,
    selectWorkPackage,
    removeWorkPackage,
    saveWorkPackage,
    deleteTask,
    assignEmployee,
    addTask,
    addTaskWithoutWorkPackage,
    addTaskSubtask,
    toggleSubtask,
    removeSubtask,
  } = useProjectWork(projectId);

  // ==========================================
  // UI-ONLY STATE (kept separate from server state)
  // ==========================================
  const [activeMainTab, setActiveMainTab] = useState("work");
  const [activeDomainId, setActiveDomainId] = useState(null);

  const [expandedWorkPackages, setExpandedWorkPackages] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const taskRefs = useRef({});

  const [busyTemplateId, setBusyTemplateId] = useState(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProjectMember, setSelectedProjectMember] = useState("");
  const [deadline, setDeadline] = useState("");

  const [manualTaskDialogOpen, setManualTaskDialogOpen] = useState(false);
  const [manualTaskComponent, setManualTaskComponent] = useState(null);
  const [manualTask, setManualTask] = useState(emptyManualTask);
  const [addingManualTask, setAddingManualTask] = useState(false);

  const [editWorkPackageOpen, setEditWorkPackageOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [savingWorkPackage, setSavingWorkPackage] = useState(false);

  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState(emptyNewTemplate);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const projectDomains = useMemo(
    () => (Array.isArray(project?.domains) ? project.domains : []),
    [project],
  );

  const generalComponents = useMemo(
    () => components.filter((component) => !component.resolvedDomainId),
    [components],
  );

  const domainTabs = useMemo(() => {
    const tabs = [...projectDomains];
    if (generalComponents.length > 0) {
      tabs.push({ _id: GENERAL_DOMAIN_ID, name: "General", color: "#64748b" });
    }
    return tabs;
  }, [projectDomains, generalComponents.length]);

  // Default to the first available domain once domains load.
  useEffect(() => {
    if (!activeDomainId && domainTabs.length > 0) {
      setActiveDomainId(domainTabs[0]._id);
    }
  }, [activeDomainId, domainTabs]);

  const activeDomainTemplates = useMemo(() => {
    if (!activeDomainId || activeDomainId === GENERAL_DOMAIN_ID) return [];
    return componentTemplates.filter((template) =>
      templateBelongsToDomain(template, activeDomainId),
    );
  }, [componentTemplates, activeDomainId]);

  const activeDomainComponents = useMemo(() => {
    if (activeDomainId === GENERAL_DOMAIN_ID) return generalComponents;
    if (!activeDomainId) return [];
    return components.filter((component) =>
      componentBelongsToDomain(component, activeDomainId),
    );
  }, [components, activeDomainId, generalComponents]);

  const totalTasks = components.reduce(
    (total, component) => total + (component.tasks?.length || 0),
    0,
  );

  // ==========================================
  // OPEN A SPECIFIC WORK PACKAGE/TASK FROM URL (?component=&task=)
  // ==========================================
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const componentId = searchParams.get("component");
    const taskId = searchParams.get("task");

    if (!componentId || !taskId || components.length === 0) return;

    const component = components.find((c) => c._id?.toString() === componentId);
    if (!component) return;

    const task = component.tasks?.find((t) => t._id?.toString() === taskId);
    if (!task) return;

    setActiveMainTab("work");
    setActiveDomainId(component.resolvedDomainId || GENERAL_DOMAIN_ID);
    setExpandedWorkPackages((prev) => ({ ...prev, [componentId]: true }));
    setExpandedTasks((prev) => ({ ...prev, [taskId]: true }));

    setTimeout(() => {
      const el = taskRefs.current[taskId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-blue-400", "bg-blue-50");
        setTimeout(() => el.classList.remove("ring-2", "ring-blue-400", "bg-blue-50"), 2500);
      }
    }, 200);
  }, [components, location.search]);

  // ==========================================
  // WORK PACKAGE SELECTOR HANDLERS
  // ==========================================
  const handleSelectTemplate = async (template) => {
    if (busyTemplateId) return;

    try {
      setBusyTemplateId(template._id);
      await selectWorkPackage(template._id);
      setExpandedWorkPackages((prev) => ({ ...prev }));
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to add Work Package.");
    } finally {
      setBusyTemplateId(null);
    }
  };

  const handleRemoveWorkPackage = async (component) => {
    const confirmed = await confirm({
      title: "Remove Work Package?",
      description: `This will remove "${component.name}" and all of its tasks from this project only. The predefined template is not affected.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      setBusyTemplateId(component.componentTemplate?._id || component.componentTemplate);
      await removeWorkPackage(component._id);
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to remove Work Package.");
    } finally {
      setBusyTemplateId(null);
    }
  };

  // ==========================================
  // TASK HANDLERS
  // ==========================================
  const handleDeleteTask = async (component, task) => {
    const confirmed = await confirm({
      title: "Delete Task?",
      description: `Are you sure you want to delete "${task.title}"? This only removes it from this project.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      await deleteTask(component, task._id);
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to delete task.");
    }
  };

  const handleOpenAssign = (component, task) => {
    setSelectedTask({ ...task, componentId: component._id });
    setSelectedProjectMember("");
    setDeadline("");
    setAssignDialogOpen(true);
  };

  const handleCloseAssign = () => {
    setAssignDialogOpen(false);
    setSelectedTask(null);
    setSelectedProjectMember("");
    setDeadline("");
  };

  const handleSubmitAssign = async () => {
    if (!selectedTask || !selectedProjectMember) {
      alertDialog("Please select an employee.");
      return;
    }

    try {
      // selectedTask carries componentId via the component it was opened from
      await assignEmployee(selectedTask.componentId, selectedTask._id, {
        projectMemberId: selectedProjectMember,
        deadline,
      });
      handleCloseAssign();
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Assignment failed.");
    }
  };

  const handleOpenSubmission = (task) => {
    const submissionId = getSubmissionId(task);
    if (!submissionId) {
      alertDialog("Submission details are not available for this task.");
      return;
    }
    navigate(`/admin/reviews/${submissionId}`);
  };

  // ==========================================
  // MANUAL TASK
  // ==========================================
  const handleOpenAddTask = (component) => {
    setManualTaskComponent(component);
    setManualTask(emptyManualTask);
    setManualTaskDialogOpen(true);
  };

  const handleCloseAddTask = () => {
    setManualTaskDialogOpen(false);
    setManualTaskComponent(null);
    setManualTask(emptyManualTask);
  };

  const handleSubmitAddTask = async () => {
    if (!manualTask.title.trim()) {
      alertDialog("Please enter a task name.");
      return;
    }

    try {
      setAddingManualTask(true);
      await addTask(manualTaskComponent._id, {
        title: manualTask.title.trim(),
        description: manualTask.description.trim(),
        assignedEmployee: manualTask.assignedEmployee || null,
        deadline: manualTask.deadline || null,
      });
      handleCloseAddTask();
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to add task.");
    } finally {
      setAddingManualTask(false);
    }
  };

  const handleAddTaskWithoutWorkPackage = async () => {
    try {
      await addTaskWithoutWorkPackage({ title: "New Task" });
      setActiveDomainId(GENERAL_DOMAIN_ID);
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to add task.");
    }
  };

  // ==========================================
  // EDIT WORK PACKAGE
  // ==========================================
  const handleOpenEditWorkPackage = (component) => {
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
        submissionRule: task.submissionRule || { type: "TEXT" },
      })),
    });
    setEditWorkPackageOpen(true);
  };

  const handleCloseEditWorkPackage = () => {
    setEditWorkPackageOpen(false);
    setEditingComponent(null);
  };

  const handleUpdateEditTask = (index, field, value) => {
    setEditingComponent((prev) => {
      const tasks = [...prev.tasks];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...prev, tasks };
    });
  };

  const handleAddEditTask = () => {
    setEditingComponent((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        { title: "", description: "", displayOrder: prev.tasks.length + 1, required: false, submissionRule: { type: "TEXT" } },
      ],
    }));
  };

  const handleRemoveEditTask = (index) => {
    setEditingComponent((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const handleSaveEditWorkPackage = async () => {
    if (!editingComponent.name.trim()) {
      alertDialog("Please enter a Work Package name.");
      return;
    }

    const invalidTask = editingComponent.tasks.some((task) => !task.title.trim());
    if (invalidTask) {
      alertDialog("Please enter a title for every task.");
      return;
    }

    try {
      setSavingWorkPackage(true);
      await saveWorkPackage(editingComponent._id, {
        name: editingComponent.name.trim(),
        description: editingComponent.description.trim(),
        tasks: editingComponent.tasks.map((task, index) => ({
          ...task,
          title: task.title.trim(),
          description: task.description.trim(),
          displayOrder: index + 1,
        })),
      });
      handleCloseEditWorkPackage();
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to update Work Package.");
    } finally {
      setSavingWorkPackage(false);
    }
  };

  // ==========================================
  // CREATE TEMPLATE
  // ==========================================
  const handleAddTemplateTask = () => {
    setNewTemplate((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { title: "", description: "" }],
    }));
  };

  const handleUpdateTemplateTask = (index, field, value) => {
    setNewTemplate((prev) => {
      const tasks = [...prev.tasks];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...prev, tasks };
    });
  };

  const handleRemoveTemplateTask = (index) => {
    if (newTemplate.tasks.length === 1) return;
    setNewTemplate((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.projectModule) {
      alertDialog("Please select a project module.");
      return;
    }
    if (!newTemplate.name.trim()) {
      alertDialog("Please enter a Work Package name.");
      return;
    }
    const validTasks = newTemplate.tasks.filter((task) => task.title.trim() !== "");
    if (validTasks.length === 0) {
      alertDialog("Please add at least one task.");
      return;
    }

    try {
      setCreatingTemplate(true);

      const response = await createComponentTemplate({
        projectModule: newTemplate.projectModule,
        name: newTemplate.name.trim(),
        description: newTemplate.description.trim(),
        tasks: validTasks.map((task) => ({
          title: task.title.trim(),
          description: task.description.trim(),
        })),
      });

      const createdTemplate = response.data?.data;
      if (createdTemplate?._id) {
        await addProjectComponent({ projectId, componentTemplateId: createdTemplate._id });
      }

      await refreshComponents();
      setCreateTemplateOpen(false);
      setNewTemplate(emptyNewTemplate);
      setActiveMainTab("work");
    } catch (error) {
      console.error(error);
      alertDialog(error.response?.data?.message || "Failed to create Work Package template.");
    } finally {
      setCreatingTemplate(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading project work...</p>
      </div>
    );
  }

  const activeDomain = domainTabs.find((d) => d._id === activeDomainId);

  const workPackageListProps = {
    projectId,
    expandedWorkPackages,
    onToggleWorkPackageExpand: (id) =>
      setExpandedWorkPackages((prev) => ({ ...prev, [id]: !prev[id] })),
    expandedTasks,
    onToggleTaskExpand: (id) => setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] })),
    onOpenAssign: (component, task) => handleOpenAssign(component, task),
    onOpenSubmission: handleOpenSubmission,
    onDeleteTask: handleDeleteTask,
    onAddSubtask: addTaskSubtask,
    onToggleSubtask: toggleSubtask,
    onDeleteSubtask: removeSubtask,
    onAddTask: handleOpenAddTask,
    onRemoveWorkPackage: handleRemoveWorkPackage,
    onEditWorkPackage: handleOpenEditWorkPackage,
    taskRefs,
  };

  return (
    <div className="min-h-full bg-[#e9edf2] text-[#1f2937]">
      <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
        <ProjectWorkHeader
          project={project}
          onBack={() => navigate(`/admin/project/${projectId}`)}
          workPackageCount={components.length}
          taskCount={totalTasks}
        />

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <div className="border-b border-[#cfd6df] pb-3">
            <TabsList className="h-auto gap-1 bg-[#e9eef5] p-1">
              <TabsTrigger value="work" className="gap-2 px-4 text-xs data-[state=active]:bg-white data-[state=active]:text-[#1f2937] data-[state=active]:shadow-sm">
                <ClipboardList size={15} />
                Work
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2 px-4 text-xs data-[state=active]:bg-white data-[state=active]:text-[#1f2937] data-[state=active]:shadow-sm">
                <Boxes size={15} />
                Templates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="work" className="mt-5 space-y-4">
            {domainTabs.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                This project has no domains configured yet. Add a domain from the
                project overview page first.
              </p>
            ) : (
              <>
                <DomainTabs
                  domains={domainTabs}
                  activeDomainId={activeDomainId}
                  onSelectDomain={setActiveDomainId}
                />

                {activeDomain && (
                  <DomainWorkView
                    domain={activeDomain}
                    domainTemplates={activeDomainTemplates}
                    projectComponentsInDomain={activeDomainComponents}
                    onSelectTemplate={handleSelectTemplate}
                    onRemoveWorkPackage={handleRemoveWorkPackage}
                    busyTemplateId={busyTemplateId}
                    onAddTaskWithoutWorkPackage={handleAddTaskWithoutWorkPackage}
                    workPackageListProps={workPackageListProps}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-5">
            <TemplatesTab
              componentTemplates={componentTemplates}
              onOpenCreateTemplate={() => setCreateTemplateOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ================= DIALOGS ================= */}

      <AssignTaskDialog
        open={assignDialogOpen}
        onClose={handleCloseAssign}
        task={selectedTask}
        projectMembers={projectMembers}
        selectedProjectMember={selectedProjectMember}
        onSelectProjectMember={setSelectedProjectMember}
        deadline={deadline}
        onChangeDeadline={setDeadline}
        onSubmit={handleSubmitAssign}
      />

      <ManualTaskDialog
        open={manualTaskDialogOpen}
        onClose={handleCloseAddTask}
        workPackageName={manualTaskComponent?.name}
        projectMembers={projectMembers}
        task={manualTask}
        onChangeTask={setManualTask}
        saving={addingManualTask}
        onSubmit={handleSubmitAddTask}
      />

      <EditWorkPackageDialog
        open={editWorkPackageOpen}
        onClose={handleCloseEditWorkPackage}
        editingComponent={editingComponent}
        onChangeField={(field, value) =>
          setEditingComponent((prev) => ({ ...prev, [field]: value }))
        }
        onUpdateTask={handleUpdateEditTask}
        onAddTask={handleAddEditTask}
        onRemoveTask={handleRemoveEditTask}
        saving={savingWorkPackage}
        onSubmit={handleSaveEditWorkPackage}
      />

      <CreateTemplateDialog
        open={createTemplateOpen}
        onClose={() => {
          setCreateTemplateOpen(false);
          setNewTemplate(emptyNewTemplate);
        }}
        modules={modules}
        newComponent={newTemplate}
        onChangeField={(field, value) => setNewTemplate((prev) => ({ ...prev, [field]: value }))}
        onAddTask={handleAddTemplateTask}
        onUpdateTask={handleUpdateTemplateTask}
        onRemoveTask={handleRemoveTemplateTask}
        saving={creatingTemplate}
        onSubmit={handleCreateTemplate}
      />
    </div>
  );
}
