// WorkspaceManagement.jsx

import { useEffect, useState } from "react";

import PageHeader from "@/components/common/PageHeader";

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

import { getProjectModules } from "@/api/projectModuleAPI";

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

  const toggleModule = (moduleId) => {
    setExpandedModules((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  };

  const getModuleComponents = (moduleId) => {
    return components.filter((component) => {
      const componentModuleId =
        component.projectModule?._id || component.projectModule;

      return componentModuleId === moduleId;
    });
  };

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
        .map((task, index) => ({
          ...task,
          displayOrder: index + 1,
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

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Workspace"
        description="Manage reusable modules, components and tasks."
        actions={
          <Button className="gap-2 shadow-sm">
            <FolderPlus size={16} />
            Add Module
          </Button>
        }
      />

      <div className="mt-6 overflow-hidden border shadow-sm rounded-2xl bg-card">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 border rounded-xl bg-muted/60">
              <Layers size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold sm:text-base">
                Modules & Components
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Organize reusable components inside project modules.
              </p>
            </div>
          </div>

          <div className="hidden rounded-lg border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground sm:block">
            {modules.length} {modules.length === 1 ? "module" : "modules"}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            Loading workspace...
          </div>
        )}

        {!loading && modules.length === 0 && (
          <div className="py-20 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-xl bg-muted/40">
              <Layers size={22} className="text-muted-foreground" />
            </div>

            <p className="mt-4 font-medium">No modules found</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a module to start organizing your workspace.
            </p>
          </div>
        )}

        {!loading && modules.length > 0 && (
          <div className="divide-y">
            {modules.map((module) => {
              const moduleComponents = getModuleComponents(module._id);

              const isExpanded = expandedModules[module._id];

              return (
                <div key={module._id} className="group">
                  <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30 sm:px-6">
                    <button
                      type="button"
                      onClick={() => toggleModule(module._id)}
                      className="flex items-center flex-1 min-w-0 gap-3 text-left"
                    >
                      <div className="flex items-center justify-center w-8 h-8 border rounded-lg shrink-0 bg-muted/40">
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>

                      <div
                        className="w-1 rounded-full h-9 shrink-0"
                        style={{
                          backgroundColor: module.color || "#64748b",
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">
                            {module.name}
                          </h3>

                          {!module.isActive && (
                            <span className="rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </div>

                        {module.description && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {module.description}
                          </p>
                        )}

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {moduleComponents.length}{" "}
                          {moduleComponents.length === 1
                            ? "component"
                            : "components"}
                        </p>
                      </div>
                    </button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1.5 px-2.5 text-xs sm:px-3"
                      onClick={() => openAddComponent(module._id)}
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Add Component</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-muted/[0.12] px-3 py-2 sm:px-6">
                      {moduleComponents.length === 0 && (
                        <div className="py-6 text-sm pl-11 text-muted-foreground">
                          No components in this module.
                        </div>
                      )}

                      {moduleComponents.length > 0 && (
                        <div className="space-y-1">
                          {moduleComponents.map((component) => (
                            <div
                              key={component._id}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-background/70"
                            >
                              <div className="flex items-center justify-center w-8 h-8 border rounded-lg shrink-0 bg-background">
                                <Boxes size={15} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-sm font-medium truncate">
                                    {component.name}
                                  </h4>

                                  {component.isActive === false && (
                                    <span className="rounded-md border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                      Inactive
                                    </span>
                                  )}
                                </div>

                                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  {component.description && (
                                    <p className="max-w-lg text-xs truncate text-muted-foreground">
                                      {component.description}
                                    </p>
                                  )}

                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <ListTodo size={12} />
                                    {component.tasks?.length || 0}{" "}
                                    {(component.tasks?.length || 0) === 1
                                      ? "task"
                                      : "tasks"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="hidden rounded-md border px-2 py-1 text-[10px] text-muted-foreground sm:inline-flex">
                                  {component.isActive === false
                                    ? "Inactive"
                                    : "Active"}
                                </span>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8"
                                  onClick={() => openEditComponent(component)}
                                  title="Edit component"
                                >
                                  <Pencil size={15} />
                                </Button>
                              </div>
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

      <Dialog open={showAddComponent} onOpenChange={setShowAddComponent}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
          </DialogHeader>

          <div className="py-1 space-y-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
              <div className="space-y-2">
                <Label>Component Name</Label>

                <Input
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  placeholder="Enter component name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>

                <Textarea
                  value={newComponentDescription}
                  onChange={(e) => setNewComponentDescription(e.target.value)}
                  placeholder="Enter component description"
                  className="min-h-[88px]"
                />
              </div>
            </div>

            <div className="pt-5 border-t">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Tasks</h3>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Add the reusable tasks for this component.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={addNewTask}
                >
                  <Plus size={15} />
                  Add Task
                </Button>
              </div>

              <div className="space-y-3">
                {newComponentTasks.map((task, index) => (
                  <div
                    key={index}
                    className="rounded-xl border bg-muted/[0.12] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center text-xs font-medium border rounded-md h-7 w-7 shrink-0 bg-background text-muted-foreground">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label>Task Name</Label>

                            <Input
                              className="mt-2"
                              value={task.title}
                              onChange={(e) =>
                                updateNewTask(index, "title", e.target.value)
                              }
                            />
                          </div>

                          {newComponentTasks.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-6 text-destructive hover:text-destructive"
                              onClick={() => removeNewTask(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div>
                          <Label>Description</Label>

                          <Textarea
                            className="mt-2 min-h-[80px]"
                            value={task.description}
                            onChange={(e) =>
                              updateNewTask(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddComponent(false)}
              disabled={savingComponent}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={saveNewComponent}
              disabled={savingComponent}
            >
              {savingComponent ? "Creating..." : "Create Component"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingComponent}
        onOpenChange={(open) => {
          if (!open) {
            closeEditComponent();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
          </DialogHeader>

          <div className="py-1 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Component Name</Label>

                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label>Description</Label>

              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[88px]"
              />
            </div>

            <div className="pt-5 border-t">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold">Tasks</h3>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Manage tasks inside this component.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTask}
                  className="gap-1.5"
                >
                  <Plus size={15} />
                  Add Task
                </Button>
              </div>

              <div className="space-y-3">
                {editTasks.map((task, index) => (
                  <div
                    key={task._id || index}
                    className="rounded-xl border bg-muted/[0.12] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center text-xs font-medium border rounded-md h-7 w-7 shrink-0 bg-background text-muted-foreground">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Label>Task Name</Label>

                            <Input
                              className="mt-2"
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
                            className="mt-6 text-destructive hover:text-destructive"
                            onClick={() => removeTask(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="mt-3">
                          <Label>Description</Label>

                          <Textarea
                            className="mt-2 min-h-[80px]"
                            value={task.description || ""}
                            onChange={(e) =>
                              updateTask(index, "description", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditComponent}
              disabled={savingComponent}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={saveComponent}
              disabled={savingComponent}
            >
              {savingComponent ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
