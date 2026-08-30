import { useEffect, useState } from "react";

import {
  Boxes,
  Layers,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Loader2,
  Plus,
  FolderPlus,
  Pencil,
  ChevronsUpDown,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getProjectModules, createProjectModule } from "@/api/projectModuleAPI";

import {
  getComponentTemplates,
  createComponentTemplate,
  updateComponentTemplate,
} from "@/api/componentTemplateAPI";

export default function WorkspaceManagement() {
  const [modules, setModules] = useState([]);

  const [components, setComponents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [expandedModules, setExpandedModules] = useState({});

  const [editingComponent, setEditingComponent] = useState(null);

  const [editName, setEditName] = useState("");

  const [editDescription, setEditDescription] = useState("");

  const [editModule, setEditModule] = useState("");

  const [editTasks, setEditTasks] = useState([]);

  const [savingComponent, setSavingComponent] = useState(false);

  const [showAddComponent, setShowAddComponent] = useState(false);

  const [selectedModuleId, setSelectedModuleId] = useState("");

  const [newComponentName, setNewComponentName] = useState("");

  const [newComponentDescription, setNewComponentDescription] = useState("");

  const [newComponentTasks, setNewComponentTasks] = useState([]);

  const [showAddModule, setShowAddModule] = useState(false);

  const [newModuleName, setNewModuleName] = useState("");

  const [newModuleDescription, setNewModuleDescription] = useState("");

  const [newModuleColor, setNewModuleColor] = useState("#64748b");

  const [savingModule, setSavingModule] = useState(false);

  // FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);

      const [modulesRes, componentsRes] = await Promise.all([
        getProjectModules(),
        getComponentTemplates(),
      ]);

      const modulesData = modulesRes?.data?.data || [];

      const componentsData = componentsRes?.data?.data || [];

      setModules(modulesData);

      setComponents(componentsData);

      const initialExpanded = {};

      modulesData.forEach((module) => {
        initialExpanded[module._id] = true;
      });

      setExpandedModules(initialExpanded);
    } catch (error) {
      console.error("Error fetching workspace data:", error);

      setModules([]);

      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // TOGGLE MODULE
  const toggleModule = (moduleId) => {
    setExpandedModules((previous) => ({
      ...previous,

      [moduleId]: !previous[moduleId],
    }));
  };

  // GET MODULE COMPONENTS
  const getModuleComponents = (moduleId) => {
    return components.filter((component) => {
      const componentModuleId =
        component.projectModule?._id || component.projectModule;

      return componentModuleId === moduleId;
    });
  };

  // EDIT COMPONENT
  const openEditComponent = (component) => {
    setEditingComponent(component);

    setEditName(component.name || "");

    setEditDescription(component.description || "");

    setEditModule(
      component.projectModule?._id || component.projectModule || "",
    );

    setEditTasks(component.tasks || []);
  };

  const closeEditComponent = () => {
    setEditingComponent(null);
  };

  const updateTask = (index, field, value) => {
    setEditTasks((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const addTask = () => {
    setEditTasks((previous) => [
      ...previous,
      {
        title: "",
        description: "",
        displayOrder: previous.length + 1,
        required: true,
        submissionRule: {
          type: "TEXT",
          allowedExtensions: [],
          maxFiles: 1,
          maxFileSizeMB: 10,
          templateVerification: {
            enabled: false,
          },
        },
      },
    ]);
  };

  const removeTask = (index) => {
    setEditTasks((previous) =>
      previous.filter((_, taskIndex) => taskIndex !== index),
    );
  };

  const saveComponent = async () => {
    if (!editingComponent) return;

    if (!editName.trim()) {
      alert("Component name is required.");

      return;
    }

    if (editTasks.length === 0) {
      alert("At least one task is required.");

      return;
    }

    try {
      setSavingComponent(true);

      await updateComponentTemplate(editingComponent._id, {
        name: editName.trim(),

        description: editDescription,

        projectModule: editModule,

        tasks: editTasks,
      });

      await fetchData();

      closeEditComponent();
    } catch (error) {
      console.error("Error updating component:", error);

      alert(error?.response?.data?.message || "Failed to update component.");
    } finally {
      setSavingComponent(false);
    }
  };

  // ==========================================
  // ADD MODULE
  // ==========================================

  const openAddModule = () => {
    setNewModuleName("");

    setNewModuleDescription("");

    setNewModuleColor("#64748b");

    setShowAddModule(true);
  };

  const saveNewModule = async () => {
    if (!newModuleName.trim()) {
      alert("Module name is required.");

      return;
    }

    try {
      setSavingModule(true);

      const response = await createProjectModule({
        name: newModuleName.trim(),

        description: newModuleDescription.trim(),

        color: newModuleColor,

        // Keep backend behaviour unchanged
        isActive: true,
      });

      const createdModule = response?.data?.data;

      if (createdModule?._id) {
        setModules((previous) =>
          [...previous, createdModule].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );

        setExpandedModules((previous) => ({
          ...previous,

          [createdModule._id]: true,
        }));
      } else {
        await fetchData();
      }

      setShowAddModule(false);

      setNewModuleName("");

      setNewModuleDescription("");

      setNewModuleColor("#64748b");
    } catch (error) {
      console.error("Error creating module:", error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create module.",
      );
    } finally {
      setSavingModule(false);
    }
  };

  // ==========================================
  // ADD COMPONENT
  // ==========================================

  const openAddComponent = (moduleId) => {
    setSelectedModuleId(moduleId);

    setNewComponentName("");

    setNewComponentDescription("");

    setNewComponentTasks([
      {
        title: "",
        description: "",
        displayOrder: 1,
        required: true,

        submissionRule: {
          type: "TEXT",
          allowedExtensions: [],
          maxFiles: 1,
          maxFileSizeMB: 10,
        },
      },
    ]);

    setShowAddComponent(true);
  };

  const updateNewTask = (index, field, value) => {
    setNewComponentTasks((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const addNewTask = () => {
    setNewComponentTasks((previous) => [
      ...previous,
      {
        title: "",
        description: "",
        displayOrder: previous.length + 1,
        required: true,

        submissionRule: {
          type: "TEXT",
          allowedExtensions: [],
          maxFiles: 1,
          maxFileSizeMB: 10,
        },
      },
    ]);
  };

  const removeNewTask = (index) => {
    setNewComponentTasks((previous) =>
      previous
        .filter((_, taskIndex) => taskIndex !== index)
        .map((task, taskIndex) => ({
          ...task,

          displayOrder: taskIndex + 1,
        })),
    );
  };

  const saveNewComponent = async () => {
    if (!newComponentName.trim()) {
      alert("Component name is required.");

      return;
    }

    if (newComponentTasks.length === 0) {
      alert("At least one task is required.");

      return;
    }

    if (newComponentTasks.some((task) => !task.title.trim())) {
      alert("All tasks must have a name.");

      return;
    }

    try {
      setSavingComponent(true);

      await createComponentTemplate({
        projectModule: selectedModuleId,

        name: newComponentName.trim(),

        description: newComponentDescription,

        tasks: newComponentTasks,
      });

      setShowAddComponent(false);

      await fetchData();
    } catch (error) {
      console.error("Error creating component:", error);

      alert(error?.response?.data?.message || "Failed to create component.");
    } finally {
      setSavingComponent(false);
    }
  };

  // COLLAPSE ALL MODULES
  const toggleAllModules = () => {
    const allExpanded = modules.every((module) => expandedModules[module._id]);

    const updatedState = {};

    modules.forEach((module) => {
      updatedState[module._id] = !allExpanded;
    });

    setExpandedModules(updatedState);
  };

  return (
    <div className="min-h-full bg-[#f6f7f9] p-3 sm:p-4 lg:p-5">
      {/* ======================================
                    PAGE HEADER
          ====================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#1f2937]">Workspace</h1>

          <p className="mt-0.5 text-xs text-[#64748b]">
            Manage reusable modules, components and tasks.
          </p>
        </div>
        <Button
          type="button"
          onClick={openAddModule}
          className="
    h-9
    gap-2
    rounded-lg
    bg-[#2563eb]
    px-3.5
    text-xs
    font-medium
    text-white
    shadow-sm
    hover:bg-[#1d4ed8]
  "
        >
          <FolderPlus size={15} />
          Add Module
        </Button>{" "}
      </div>

      {/* ======================================
                WORKSPACE
    ====================================== */}

      <div
        className="
    mt-4
    overflow-hidden
    rounded-xl
    border
    border-[#d7dee8]
    bg-[#f5f7fa]
    shadow-sm
  "
      >
        {/* ======================================
                  MODULE HEADER
      ====================================== */}

        <div
          className="
      flex
      items-center
      justify-between
      gap-3
      border-b
      border-[#dbe2ea]
      bg-[#eef2f6]
      px-4
      py-3
    "
        >
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-[#d7dee8]
          bg-[#e5ebf2]
          text-[#475569]
        "
            >
              <Layers size={17} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#1e293b]">Modules</h2>

              <p className="mt-0.5 text-[11px] text-[#64748b]">
                Components organized by module
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            {/* MODULE COUNT */}

            <div
              className="
          hidden
          rounded-md
          border
          border-[#d7dee8]
          bg-[#f8fafc]
          px-2.5
          py-1
          text-[11px]
          font-medium
          text-[#64748b]
          sm:block
        "
            >
              {modules.length} {modules.length === 1 ? "module" : "modules"}
            </div>

            {/* COLLAPSE / EXPAND ALL */}

            {modules.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAllModules}
                title={
                  modules.every((module) => expandedModules[module._id])
                    ? "Collapse all modules"
                    : "Expand all modules"
                }
                className="
            h-8
            gap-1.5
            border-[#cfd8e3]
            bg-[#f8fafc]
            px-2.5
            text-[11px]
            text-[#475569]
            shadow-none
            hover:bg-[#e8eef5]
            hover:text-[#1e293b]
          "
              >
                <ChevronsUpDown size={14} />

                <span className="hidden sm:inline">
                  {modules.every((module) => expandedModules[module._id])
                    ? "Collapse All"
                    : "Expand All"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* ======================================
                  LOADING
      ====================================== */}

        {loading && (
          <div
            className="
        flex
        items-center
        justify-center
        gap-2
        py-16
        text-sm
        text-[#64748b]
      "
          >
            <Loader2 size={17} className="animate-spin" />
            Loading workspace...
          </div>
        )}

        {/* ======================================
                  EMPTY STATE
      ====================================== */}

        {!loading && modules.length === 0 && (
          <div className="py-16 text-center">
            <div
              className="
          mx-auto
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-lg
          border
          border-[#d7dee8]
          bg-[#e9eef4]
          text-[#64748b]
        "
            >
              <Layers size={20} />
            </div>

            <p className="mt-3 text-sm font-medium text-[#334155]">
              No modules found
            </p>

            <p className="mt-1 text-xs text-[#64748b]">
              Create a module to start organizing your workspace.
            </p>
          </div>
        )}

        {/* ======================================
                          MODULE LIST
            ====================================== */}

        {!loading && modules.length > 0 && (
          <div className="divide-y divide-[#b9bdc2]">
            {modules.map((module) => {
              const moduleComponents = getModuleComponents(module._id);

              const isExpanded = expandedModules[module._id];

              return (
                <div key={module._id}>
                  {/* ======================================
                                MODULE ROW
                      ====================================== */}

                  <div
                    className="
                      flex
                          items-center
                          gap-3
                          border-b
                          border-[#e1e6ed]
                          bg-[#eef2f6]
                          px-4
                          py-3
                          transition-colors
                          hover:bg-[#e8edf3]
            "
                  >
                    {/* MODULE INFORMATION */}

                    <button
                      type="button"
                      onClick={() => toggleModule(module._id)}
                      className="flex items-center flex-1 min-w-0 gap-3 text-left"
                    >
                      {/* EXPAND / COLLAPSE */}

                      <div
                        className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[#94a3b8]
                  bg-[#dbe3ec]
                  text-[#334155]
                "
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>

                      {/* MODULE COLOR */}

                      <div
                        className="h-9 w-[3px] shrink-0 rounded-full"
                        style={{
                          backgroundColor: module.color || "#475569",
                        }}
                      />

                      {/* MODULE TEXT */}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="truncate text-sm font-semibold text-[#1e293b]">
                            {module.name}
                          </h3>

                          <span className="text-[11px] text-[#475569]">
                            · {moduleComponents.length}{" "}
                            {moduleComponents.length === 1
                              ? "component"
                              : "components"}
                          </span>
                        </div>

                        {module.description && (
                          <p className="mt-0.5 truncate text-[11px] text-[#526171]">
                            {module.description}
                          </p>
                        )}
                      </div>
                    </button>

                    {/* ADD COMPONENT */}

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => openAddComponent(module._id)}
                      className="
                h-9
                shrink-0
                gap-1.5
                rounded-lg
                bg-[#334155]
                px-3
                text-xs
                font-medium
                text-white
                shadow-none
                hover:bg-[#1e293b]
              "
                    >
                      <Plus size={15} />

                      <span className="hidden sm:inline">Add Component</span>

                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>

                  {/* ======================================
                    COMPONENT SECTION
          ====================================== */}

                  {isExpanded && (
                    <div
                      className="
                border-b
                border-[#d8e0e8]
                bg-[#eef2f6]
                px-4
                py-2
                sm:px-6
              "
                    >
                      {/* EMPTY COMPONENT STATE */}

                      {moduleComponents.length === 0 && (
                        <div className="py-5 pl-16 text-xs text-[#64748b]">
                          No components have been added to this module.
                        </div>
                      )}

                      {/* COMPONENT LIST */}

                      {moduleComponents.length > 0 && (
                        <div
                          className="
                    relative
                    ml-5
                    border-l
                    border-[#b9c6d4]
                    py-1
                    pl-7
                    sm:ml-8
                    sm:pl-9
                  "
                        >
                          {moduleComponents.map((component) => (
                            <div
                              key={component._id}
                              className="
                        relative
                        flex
                        min-h-[58px]
                        items-center
                        gap-3
                        border-b
                        border-[#d8e0e8]
                        bg-[#f8fafc]
                        px-3
                        py-2.5
                        transition-colors
                        last:border-b-0
                        hover:bg-white
                      "
                            >
                              {/* NESTED CONNECTOR */}

                              <div
                                className="
                          absolute
                          -left-7
                          top-1/2
                          h-px
                          w-7
                          bg-[#b9c6d4]
                          sm:-left-9
                          sm:w-9
                        "
                              />

                              {/* COMPONENT ICON */}

                              <div
                                className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-[#eef2f6]
                          bg-[#e8eef4]
                          text-[#475569]
                        "
                              >
                                <Boxes size={15} />
                              </div>

                              {/* COMPONENT INFORMATION */}

                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate text-sm font-medium text-[#334155]">
                                    {component.name}
                                  </h4>

                                  <span
                                    className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-md
                              bg-[#e2e8f0]
                              px-1.5
                              py-0.5
                              text-[10px]
                              text-[#64748b]
                            "
                                  >
                                    <ListTodo size={11} />

                                    {component.tasks?.length || 0}
                                  </span>
                                </div>

                                {/* COMPONENT DESCRIPTION - LEFT ALIGNED */}

                                {component.description && (
                                  <p
                                    className="
                              mt-0.5
                              max-w-3xl
                              truncate
                              text-left
                              text-[11px]
                              text-[#64748b]
                            "
                                  >
                                    {component.description}
                                  </p>
                                )}
                              </div>

                              {/* EDIT BUTTON */}

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditComponent(component)}
                                title="Edit component"
                                className="
                          h-8
                          w-8
                          shrink-0
                          rounded-md
                          text-[#64748b]
                          hover:bg-[#e2e8f0]
                          hover:text-[#2563eb]
                        "
                              >
                                <Pencil size={15} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======================================
                    ADD MODULE
          ====================================== */}

      <Dialog
        open={showAddModule}
        onOpenChange={(open) => {
          if (!open && !savingModule) {
            setShowAddModule(false);
          }
        }}
      >
        <DialogContent
          className="
    w-[calc(100%-2rem)]
    max-w-md
    max-h-[85vh]
    overflow-y-auto
    rounded-xl
    border
    border-[#d7dee8]
    bg-[#f6f8fb]
    p-5
    shadow-xl
  "
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#1f2937]">
              Add Module
            </DialogTitle>
          </DialogHeader>

          <div className="py-1 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#334155]">
                Module Name
              </Label>

              <Input
                placeholder="Enter module name"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                disabled={savingModule}
                className="
          h-9
          border-[#cfd8e3]
          bg-white
          text-sm
          text-[#1f2937]
          placeholder:text-[#94a3b8]
          focus-visible:ring-1
          focus-visible:ring-[#2563eb]
        "
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#334155]">
                Description
              </Label>

              <Textarea
                placeholder="Enter module description (optional)"
                value={newModuleDescription}
                onChange={(e) => setNewModuleDescription(e.target.value)}
                disabled={savingModule}
                className="
          min-h-[80px]
          border-[#cfd8e3]
          bg-white
          text-sm
          text-[#1f2937]
          placeholder:text-[#94a3b8]
          focus-visible:ring-1
          focus-visible:ring-[#2563eb]
        "
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-[#334155]">
                Module Color
              </Label>

              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newModuleColor}
                  onChange={(e) => setNewModuleColor(e.target.value)}
                  disabled={savingModule}
                  className="
            h-9
            w-12
            cursor-pointer
            rounded-md
            border
            border-[#cfd8e3]
            bg-white
            p-1
          "
                />

                <Input
                  value={newModuleColor}
                  onChange={(e) => setNewModuleColor(e.target.value)}
                  disabled={savingModule}
                  placeholder="#64748b"
                  className="
            h-9
            border-[#cfd8e3]
            bg-white
            text-sm
            text-[#1f2937]
          "
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModule(false)}
              disabled={savingModule}
              className="
        h-9
        border-[#cfd8e3]
        bg-white
        px-4
        text-xs
        text-[#475569]
        hover:bg-[#eef2f6]
      "
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={saveNewModule}
              disabled={savingModule}
              className="
        h-9
        bg-[#2563eb]
        px-4
        text-xs
        text-white
        hover:bg-[#1d4ed8]
      "
            >
              {savingModule ? "Creating..." : "Create Module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================
              ADD COMPONENT
    ====================================== */}

      <Dialog
        open={showAddComponent}
        onOpenChange={(open) => {
          if (!open && !savingComponent) {
            setShowAddComponent(false);
          }
        }}
      >
        <DialogContent
          className="
    w-[calc(100%-2rem)]
    max-w-3xl
    max-h-[88vh]
    overflow-y-auto
    rounded-xl
    border
    border-[#d7dee8]
    bg-[#f6f8fb]
    p-5
    shadow-xl
  "
        >
          {/* HEADER */}

          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-[#e2e8f0]">
              Add Component
            </DialogTitle>
          </DialogHeader>

          <div className="py-1 space-y-5">
            {/* ======================================
                      COMPONENT DETAILS
                ====================================== */}

            <div className="py-1 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_1.3fr]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#334155]">
                    Component Name
                  </Label>

                  <Input
                    value={newComponentName}
                    onChange={(e) => setNewComponentName(e.target.value)}
                    placeholder="Enter component name"
                    className="
          h-9
          border-[#cfd8e3]
          bg-white
          text-sm
          text-[#1f2937]
          placeholder:text-[#94a3b8]
        "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-[#334155]">
                    Description
                  </Label>

                  <Textarea
                    value={newComponentDescription}
                    onChange={(e) => setNewComponentDescription(e.target.value)}
                    placeholder="Optional description"
                    className="
          min-h-[80px]
          border-[#cfd8e3]
          bg-white
          text-sm
          text-[#1f2937]
          placeholder:text-[#94a3b8]
        "
                  />
                </div>
              </div>
            </div>

            {/* ======================================
                          TASKS
                ====================================== */}

            <div className="border-t border-[#28313b] pt-5">
              {/* TASK HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#e2e8f0]">
                    Tasks
                  </h3>

                  <p className="mt-1 text-xs text-[#94a3b8]">
                    Add the predefined tasks for this component.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewTask}
                  disabled={savingComponent}
                  className="
              h-8
              shrink-0
              gap-1.5
              border-[#34404d]
              bg-[#151c24]
              px-3
              text-xs
              text-[#eef2f6]
              hover:bg-[#202936]
              hover:text-white
            "
                >
                  <Plus size={14} />
                  Add Task
                </Button>
              </div>

              {/* TASK LIST */}

              <div className="mt-4 space-y-3">
                {newComponentTasks.map((task, index) => (
                  <div
                    key={index}
                    className="
                rounded-lg
                border
                border-[#2a3440]
                bg-[#151b23]
                p-4
              "
                  >
                    {/* TASK TOP */}

                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {/* TASK NUMBER */}

                        <div
                          className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-[#334155]
                      bg-[#1d2733]
                      text-xs
                      font-medium
                      text-[#93c5fd]
                    "
                        >
                          {index + 1}
                        </div>

                        <span className="text-xs font-medium text-[#eef2f6]">
                          Task {index + 1}
                        </span>
                      </div>

                      {/* REMOVE */}

                      {newComponentTasks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewTask(index)}
                          disabled={savingComponent}
                          className="
                      h-7
                      px-2
                      text-xs
                      text-[#94a3b8]
                      hover:bg-red-500/10
                      hover:text-red-400
                    "
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* TASK NAME */}

                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#94a3b8]">
                        Task Name
                      </Label>

                      <Input
                        value={task.title}
                        onChange={(e) =>
                          updateNewTask(index, "title", e.target.value)
                        }
                        placeholder="Enter task name"
                        disabled={savingComponent}
                        className="
                    h-9
                    border-[#2f3a46]
                    bg-[#0c1117]
                    text-sm
                    text-[#e2e8f0]
                    placeholder:text-[#64748b]
                    focus-visible:border-[#3b82f6]
                    focus-visible:ring-[#3b82f6]/20
                  "
                      />
                    </div>

                    {/* TASK DESCRIPTION */}

                    <div className="mt-3 space-y-1.5">
                      <Label className="text-xs text-[#94a3b8]">
                        Description
                        <span className="ml-1 text-[#64748b]">Optional</span>
                      </Label>

                      <Textarea
                        value={task.description}
                        onChange={(e) =>
                          updateNewTask(index, "description", e.target.value)
                        }
                        placeholder="Enter task description"
                        disabled={savingComponent}
                        className="
                    min-h-[70px]
                    resize-none
                    border-[#2f3a46]
                    bg-[#0c1117]
                    text-sm
                    text-[#e2e8f0]
                    placeholder:text-[#64748b]
                    focus-visible:border-[#3b82f6]
                    focus-visible:ring-[#3b82f6]/20
                  "
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ======================================
                        FOOTER
              ====================================== */}

          <DialogFooter className="gap-2 mt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddComponent(false)}
              disabled={savingComponent}
              className="
      h-9
      border-[#cfd8e3]
      bg-white
      px-4
      text-xs
      text-[#475569]
      hover:bg-[#eef2f6]
    "
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={saveNewComponent}
              disabled={savingComponent}
              className="
      h-9
      bg-[#2563eb]
      px-4
      text-xs
      text-white
      hover:bg-[#1d4ed8]
    "
            >
              {savingComponent ? "Creating..." : "Create Component"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======================================
                    EDIT COMPONENT
          ====================================== */}

      <Dialog
        open={!!editingComponent}
        onOpenChange={(open) => {
          if (!open) {
            closeEditComponent();
          }
        }}
      >
        <DialogContent
          className="
    w-[calc(100%-2rem)]
    max-w-4xl
    max-h-[88vh]
    overflow-y-auto
    rounded-xl
    border
    border-[#d7dee8]
    bg-[#f6f8fb]
    p-5
    shadow-xl
  "
        >
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* NAME */}

            <div className="space-y-2">
              <Label>Component Name</Label>

              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            {/* MODULE */}

            <div className="space-y-2">
              <Label>Module</Label>

              <Select value={editModule} onValueChange={setEditModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
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

            {/* DESCRIPTION */}

            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            {/* TASKS */}

            <div className="border-t border-[#e2e8f0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#1f2937]">
                    Tasks
                  </h3>

                  <p className="mt-0.5 text-xs text-[#64748b]">
                    Manage tasks inside this component.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTask}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Plus size={14} />
                  Add Task
                </Button>
              </div>

              <div className="space-y-3">
                {editTasks.map((task, index) => (
                  <div
                    key={task._id || index}
                    className="
    rounded-lg
    border
    border-[#d7dee8]
    bg-[#eef2f6]
    p-3
  "
                  >
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Label>Task Name</Label>

                        <Input
                          className="
    mt-1.5
    h-9
    border-[#cfd8e3]
    bg-white
    text-sm
    text-[#1f2937]
  "
                          value={task.title || ""}
                          onChange={(e) =>
                            updateTask(index, "title", e.target.value)
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="
    mt-6
    h-8
    border-[#fecaca]
    bg-white
    px-3
    text-xs
    text-[#dc2626]
    hover:bg-[#fef2f2]
  "
                        onClick={() => removeTask(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="mt-3">
                      <Label>Description</Label>

                      <Textarea
                        className="
    mt-1.5
    min-h-[70px]
    border-[#cfd8e3]
    bg-white
    text-sm
    text-[#1f2937]
  "
                        value={task.description || ""}
                        onChange={(e) =>
                          updateTask(index, "description", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 mt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditComponent}
              disabled={savingComponent}
              className="
      h-9
      border-[#cfd8e3]
      bg-white
      px-4
      text-xs
      text-[#475569]
      hover:bg-[#eef2f6]
    "
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={saveComponent}
              disabled={savingComponent}
              className="
      h-9
      bg-[#2563eb]
      px-4
      text-xs
      text-white
      hover:bg-[#1d4ed8]
    "
            >
              {savingComponent ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
