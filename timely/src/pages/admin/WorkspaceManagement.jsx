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
    Pencil
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import {
    getProjectModules
} from "@/api/projectModuleAPI";

import {
    getComponentTemplates,
    updateComponentTemplate
} from "@/api/componentTemplateAPI";


export default function WorkspaceManagement() {

    const [modules, setModules] =
        useState([]);

    const [components, setComponents] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [expandedModules, setExpandedModules] =
        useState({});

    const [editingComponent, setEditingComponent] =
        useState(null);

    const [editName, setEditName] =
        useState("");

    const [editDescription, setEditDescription] =
        useState("");

    const [editModule, setEditModule] =
        useState("");

    const [editTasks, setEditTasks] =
        useState([]);

    const [savingComponent, setSavingComponent] =
        useState(false);


    // ==========================================
    // FETCH DATA
    // ==========================================
    const fetchData = async () => {

        try {

            setLoading(true);

            const [
                modulesRes,
                componentsRes
            ] = await Promise.all([

                getProjectModules(),

                getComponentTemplates()

            ]);


            const modulesData =
                modulesRes?.data?.data || [];

            const componentsData =
                componentsRes?.data?.data || [];


            setModules(modulesData);

            setComponents(componentsData);


            // Expand all modules initially

            const initialExpanded = {};

            modulesData.forEach((module) => {

                initialExpanded[module._id] = true;

            });

            setExpandedModules(initialExpanded);

        }
        catch (error) {

            console.error(
                "Error fetching workspace data:",
                error
            );

            setModules([]);

            setComponents([]);

        }
        finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchData();

    }, []);


    // ==========================================
    // TOGGLE MODULE
    // ==========================================
    const toggleModule = (moduleId) => {

        setExpandedModules((previous) => ({

            ...previous,

            [moduleId]:
                !previous[moduleId]

        }));

    };


    // ==========================================
    // GET COMPONENTS FOR MODULE
    // ==========================================
    const getModuleComponents = (moduleId) => {

        return components.filter((component) => {

            const componentModuleId =
                component.projectModule?._id ||
                component.projectModule;

            return componentModuleId === moduleId;

        });

    };

    const openEditComponent = (component) => {

        setEditingComponent(component);

        setEditName(component.name || "");

        setEditDescription(
            component.description || ""
        );

        setEditModule(
            component.projectModule?._id ||
            component.projectModule ||
            ""
        );

        setEditTasks(
            component.tasks || []
        );

    };


    const closeEditComponent = () => {

        setEditingComponent(null);

    };


    const updateTask = (
        index,
        field,
        value
    ) => {

        setEditTasks((previous) => {

            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                [field]: value
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
                displayOrder:
                    previous.length + 1,
                required: true,
                submissionRule: {
                    type: "TEXT",
                    allowedExtensions: [],
                    maxFiles: 1,
                    maxFileSizeMB: 10,
                    templateVerification: {
                        enabled: false
                    }
                }
            }

        ]);

    };


    const removeTask = (index) => {

        setEditTasks((previous) =>
            previous.filter(
                (_, taskIndex) =>
                    taskIndex !== index
            )
        );

    };


    const saveComponent = async () => {

        if (!editingComponent) return;

        if (!editName.trim()) {

            alert(
                "Component name is required."
            );

            return;

        }

        if (editTasks.length === 0) {

            alert(
                "At least one task is required."
            );

            return;

        }

        try {

            setSavingComponent(true);

            await updateComponentTemplate(
                editingComponent._id,
                {

                    name:
                        editName.trim(),

                    description:
                        editDescription,

                    projectModule:
                        editModule,

                    tasks:
                        editTasks

                }
            );

            await fetchData();

            closeEditComponent();

        }
        catch (error) {

            console.error(
                "Error updating component:",
                error
            );

            alert(
                error?.response?.data?.message ||
                "Failed to update component."
            );

        }
        finally {

            setSavingComponent(false);

        }

    };

    return (

        <div className="min-h-full p-4 sm:p-6 lg:p-8">

            <PageHeader
                title="Workspace"
                description="Manage reusable modules, components and their tasks."
                actions={

                    <Button className="gap-2">

                        <FolderPlus size={17} />

                        Add Module

                    </Button>

                }
            />


            {/* ======================================
                WORKSPACE HIERARCHY
            ====================================== */}

            <div className="mt-6 overflow-hidden border rounded-xl bg-card">


                {/* HEADER */}

                <div className="flex items-center justify-between p-5 border-b">

                    <div className="flex items-center gap-3">

                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">

                            <Layers size={20} />

                        </div>


                        <div>

                            <h2 className="font-semibold">

                                Modules & Components

                            </h2>

                            <p className="text-sm text-muted-foreground">

                                Components are organized inside their respective modules.

                            </p>

                        </div>

                    </div>


                    <div className="hidden text-sm text-muted-foreground sm:block">

                        {modules.length}{" "}

                        {modules.length === 1
                            ? "module"
                            : "modules"}

                    </div>

                </div>


                {/* ======================================
                    LOADING
                ====================================== */}

                {loading && (

                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">

                        <Loader2
                            size={18}
                            className="animate-spin"
                        />

                        Loading modules...

                    </div>

                )}


                {/* ======================================
                    EMPTY
                ====================================== */}

                {!loading &&
                    modules.length === 0 && (

                        <div className="py-16 text-center">

                            <Layers
                                size={36}
                                className="mx-auto mb-3 text-muted-foreground"
                            />

                            <p className="font-medium">

                                No modules found

                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">

                                Create a module to start organizing components.

                            </p>

                        </div>

                    )}


                {/* ======================================
                    MODULE LIST
                ====================================== */}

                {!loading &&
                    modules.length > 0 && (

                        <div className="divide-y">

                            {modules.map((module) => {

                                const moduleComponents =
                                    getModuleComponents(
                                        module._id
                                    );


                                const isExpanded =
                                    expandedModules[
                                    module._id
                                    ];


                                return (

                                    <div
                                        key={module._id}
                                    >


                                        {/* =====================
                                            MODULE HEADER
                                        ===================== */}

                                        <div className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/40">


                                            <button

                                                type="button"

                                                onClick={() =>
                                                    toggleModule(
                                                        module._id
                                                    )
                                                }

                                                className="flex items-center flex-1 gap-4 text-left"
                                            >


                                                {/* EXPAND ICON */}

                                                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">

                                                    {isExpanded ? (

                                                        <ChevronDown
                                                            size={18}
                                                        />

                                                    ) : (

                                                        <ChevronRight
                                                            size={18}
                                                        />

                                                    )}

                                                </div>


                                                {/* MODULE ICON */}

                                                <div

                                                    className="w-3 h-10 rounded-full"

                                                    style={{

                                                        backgroundColor:
                                                            module.color ||
                                                            "#64748b"

                                                    }}

                                                />


                                                {/* MODULE INFO */}

                                                <div>

                                                    <div className="flex items-center gap-3">

                                                        <h3 className="font-semibold">

                                                            {module.name}

                                                        </h3>


                                                        {!module.isActive && (

                                                            <span className="px-2 py-1 text-xs border rounded-md text-muted-foreground">

                                                                Inactive

                                                            </span>

                                                        )}

                                                    </div>


                                                    {module.description && (

                                                        <p className="mt-1 text-sm text-muted-foreground">

                                                            {module.description}

                                                        </p>

                                                    )}


                                                    <p className="mt-2 text-xs text-muted-foreground">

                                                        {
                                                            moduleComponents.length
                                                        }{" "}

                                                        {
                                                            moduleComponents.length === 1
                                                                ? "component"
                                                                : "components"
                                                        }

                                                    </p>

                                                </div>

                                            </button>


                                            {/* ADD COMPONENT */}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-2"
                                            >

                                                <Plus size={16} />

                                                Add Component

                                            </Button>

                                        </div>


                                        {/* =====================
                                            COMPONENTS
                                        ===================== */}

                                        {isExpanded && (

                                            <div className="bg-muted/20">

                                                {/* NO COMPONENTS */}

                                                {moduleComponents.length === 0 && (

                                                    <div className="py-6 pl-24 text-sm text-muted-foreground">
                                                        No components in this module.
                                                    </div>

                                                )}


                                                {/* COMPONENT TREE */}

                                                {moduleComponents.length > 0 && (

                                                    <div className="py-2">

                                                        {moduleComponents.map(
                                                            (component, index) => {

                                                                const isLast =
                                                                    index ===
                                                                    moduleComponents.length - 1;

                                                                return (

                                                                    <div
                                                                        key={component._id}
                                                                        className="relative flex items-center gap-3 py-3 pl-12 pr-5 ml-8 transition-colors hover:bg-muted/40"
                                                                    >

                                                                        {/* TREE CONNECTOR */}

                                                                        <div className="absolute top-0 bottom-0 left-0 w-8">

                                                                            {/* VERTICAL LINE */}

                                                                            {!isLast && (

                                                                                <div className="absolute top-0 bottom-0 border-l left-4 border-border" />

                                                                            )}

                                                                            {/* HALF VERTICAL LINE FOR LAST */}

                                                                            {isLast && (

                                                                                <div className="absolute top-0 border-l left-4 h-1/2 border-border" />

                                                                            )}

                                                                            {/* HORIZONTAL LINE */}

                                                                            <div className="absolute w-4 border-t top-1/2 left-4 border-border" />

                                                                        </div>


                                                                        {/* COMPONENT ICON */}

                                                                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-md bg-background">

                                                                            <Boxes size={16} />

                                                                        </div>


                                                                        {/* COMPONENT INFO */}

                                                                        <div className="flex-1 min-w-0">

                                                                            <div className="flex items-center gap-2">

                                                                                <h4 className="text-sm font-medium">

                                                                                    {component.name}

                                                                                </h4>

                                                                                {component.isActive === false && (

                                                                                    <span className="px-2 py-0.5 text-[11px] border rounded-md text-muted-foreground">

                                                                                        Inactive

                                                                                    </span>

                                                                                )}

                                                                            </div>


                                                                            <div className="flex items-center gap-3 mt-1">

                                                                                {component.description && (

                                                                                    <p className="text-xs truncate text-muted-foreground">

                                                                                        {component.description}

                                                                                    </p>

                                                                                )}

                                                                                <span className="flex items-center flex-shrink-0 gap-1 text-xs text-muted-foreground">

                                                                                    <ListTodo size={13} />

                                                                                    {component.tasks?.length || 0}{" "}

                                                                                    {(component.tasks?.length || 0) === 1
                                                                                        ? "task"
                                                                                        : "tasks"}

                                                                                </span>

                                                                            </div>

                                                                        </div>


                                                                        {/* STATUS + EDIT */}

                                                                        <div className="flex items-center gap-2">

                                                                            <span className="px-2 py-1 text-xs border rounded-md">

                                                                                {component.isActive === false
                                                                                    ? "Inactive"
                                                                                    : "Active"}

                                                                            </span>

                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    openEditComponent(component)
                                                                                }
                                                                                title="Edit component"
                                                                            >

                                                                                <Pencil size={16} />

                                                                            </Button>

                                                                        </div>
                                                                    </div>

                                                                );

                                                            }
                                                        )}

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
                EDIT COMPONENT DIALOG
            ====================================== */}

            <Dialog
                open={!!editingComponent}
                onOpenChange={(open) => {

                    if (!open) {
                        closeEditComponent();
                    }

                }}
            >

                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

                    <DialogHeader>

                        <DialogTitle>
                            Edit Component
                        </DialogTitle>

                    </DialogHeader>


                    <div className="space-y-5">

                        {/* NAME */}

                        <div className="space-y-2">

                            <Label>
                                Component Name
                            </Label>

                            <Input
                                value={editName}
                                onChange={(e) =>
                                    setEditName(e.target.value)
                                }
                            />

                        </div>


                        {/* MODULE */}

                        <div className="space-y-2">

                            <Label>
                                Module
                            </Label>

                            <Select
                                value={editModule}
                                onValueChange={setEditModule}
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="Select module" />

                                </SelectTrigger>

                                <SelectContent>

                                    {modules.map((module) => (

                                        <SelectItem
                                            key={module._id}
                                            value={module._id}
                                        >

                                            {module.name}

                                        </SelectItem>

                                    ))}

                                </SelectContent>

                            </Select>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="space-y-2">

                            <Label>
                                Description
                            </Label>

                            <Textarea
                                value={editDescription}
                                onChange={(e) =>
                                    setEditDescription(e.target.value)
                                }
                            />

                        </div>


                        {/* TASKS */}

                        <div className="pt-5 border-t">

                            <div className="flex items-center justify-between mb-4">

                                <div>

                                    <h3 className="font-semibold">
                                        Tasks
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        Manage tasks inside this component.
                                    </p>

                                </div>


                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTask}
                                    className="gap-2"
                                >

                                    <Plus size={16} />

                                    Add Task

                                </Button>

                            </div>


                            <div className="space-y-3">

                                {editTasks.map((task, index) => (

                                    <div
                                        key={task._id || index}
                                        className="p-4 border rounded-lg"
                                    >

                                        <div className="flex items-center gap-3">

                                            <div className="flex-1">

                                                <Label>
                                                    Task Name
                                                </Label>

                                                <Input
                                                    className="mt-2"
                                                    value={task.title || ""}
                                                    onChange={(e) =>
                                                        updateTask(
                                                            index,
                                                            "title",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                            </div>


                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="mt-6 text-destructive"
                                                onClick={() =>
                                                    removeTask(index)
                                                }
                                            >

                                                Remove

                                            </Button>

                                        </div>


                                        <div className="mt-4">

                                            <Label>
                                                Description
                                            </Label>

                                            <Textarea
                                                className="mt-2"
                                                value={
                                                    task.description || ""
                                                }
                                                onChange={(e) =>
                                                    updateTask(
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
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

                            {savingComponent
                                ? "Saving..."
                                : "Save Changes"}

                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

        </div>

    );

}