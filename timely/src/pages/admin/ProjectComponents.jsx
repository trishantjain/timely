import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent
} from "@/components/ui/card";

import { getProjectById } from "@/api/projectAPI";

import {
    addProjectComponent,
    assignTask,
    getProjectComponents
} from "@/api/projectComponentAPI";

import { getProjectModules } from "@/api/projectModuleAPI";
import {
    getComponentsByModule,
    getComponentTemplates,
    createComponentTemplate
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
    DialogFooter
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";

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
    Boxes
} from "lucide-react";


export default function ProjectComponents() {

    const { id } = useParams();

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [loading, setLoading] = useState(true);

    const [project, setProject] = useState(null);

    const [components, setComponents] = useState([]);

    const [componentTemplates, setComponentTemplates] = useState([]);

    const [loadingComponentTemplates, setLoadingComponentTemplates] = useState(false);

    const [modules, setModules] = useState([]);

    const [templates, setTemplates] = useState([]);

    const [selectedModule, setSelectedModule] = useState("");

    const [selectedTemplate, setSelectedTemplate] = useState("");

    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [projectMembers, setProjectMembers] = useState([]);

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);

    const [selectedProjectMember, setSelectedProjectMember] = useState("");

    const [deadline, setDeadline] = useState("");

    const [collapsedComponents, setCollapsedComponents] = useState({});

    const [activeTab, setActiveTab] = useState("work-items");

    const [openCreateComponent, setOpenCreateComponent] = useState(false);

    const [newComponent, setNewComponent] = useState({
        projectModule: "",
        name: "",
        description: "",
        tasks: [
            {
                title: "",
                description: ""
            }
        ]
    });

    const [creatingComponent, setCreatingComponent] = useState(false);


    // ==========================================
    // LOAD DATA
    // ==========================================
    const loadData = async () => {

        try {

            const projectRes =
                await getProjectById(id);

            const componentRes =
                await getProjectComponents(id);

            const moduleRes =
                await getProjectModules();

            const memberRes =
                await getProjectMembers(id);


            setProject(projectRes.data);

            setComponents(
                componentRes.data.data
            );

            setModules(
                moduleRes.data.data
            );

            setProjectMembers(
                memberRes.data.data
            );

        }
        catch (err) {

            console.error(err);

        }
        finally {

            setLoading(false);

        }

    };


    // ==========================================
    // MODULE CHANGE
    // ==========================================
    const handleModuleChange = async (
        moduleId
    ) => {

        setSelectedModule(moduleId);

        setSelectedTemplate("");

        const res =
            await getComponentsByModule(
                moduleId
            );

        setTemplates(
            res.data.data
        );

    };


    // ==========================================
    // ADD WORK ITEM
    // ==========================================
    const handleAddComponent = async () => {

        if (!selectedTemplate) {

            alert(
                "Please select a work item."
            );

            return;

        }

        try {

            await addProjectComponent({

                projectId: id,

                componentTemplateId:
                    selectedTemplate

            });


            setOpenAddDialog(false);

            setSelectedModule("");

            setSelectedTemplate("");

            setTemplates([]);


            loadData();

        }
        catch (err) {

            console.error(err);

            alert(

                err.response?.data?.message ||

                "Failed to add work item."

            );

        }

    };


    // ==========================================
    // ASSIGN TASK
    // ==========================================
    const handleAssignTask = async () => {

        if (!selectedProjectMember) {

            alert(
                "Please select an employee."
            );

            return;

        }

        try {

            await assignTask(

                selectedTask.componentId,

                selectedTask.taskId,

                {

                    projectMemberId:
                        selectedProjectMember,

                    deadline

                }

            );


            setAssignDialogOpen(false);


            loadData();

        }
        catch (err) {

            console.error(err);

            alert(

                err.response?.data?.message ||

                "Assignment failed."

            );

        }

    };

    const fetchComponentTemplates = async () => {

        try {
            setLoadingComponentTemplates(true);

            const res = await getComponentTemplates();

            setComponentTemplates(
                res.data?.data || []
            );
        }
        catch (error) {
            console.error(
                "Error fetching component templates:",
                error
            );

            setComponentTemplates([]);
        }
        finally {
            setLoadingComponentTemplates(false);
        }
    };

    const addComponentTask = () => {

        setNewComponent((prev) => ({
            ...prev,
            tasks: [
                ...prev.tasks,
                {
                    title: "",
                    description: ""
                }
            ]
        }));

    };

    const updateComponentTask = (
        index,
        field,
        value
    ) => {

        setNewComponent((prev) => {

            const updatedTasks =
                [...prev.tasks];

            updatedTasks[index] = {
                ...updatedTasks[index],
                [field]: value
            };

            return {
                ...prev,
                tasks: updatedTasks
            };

        });

    };

    const removeComponentTask = (index) => {

        if (newComponent.tasks.length === 1) {
            return;
        }

        setNewComponent((prev) => ({
            ...prev,
            tasks: prev.tasks.filter(
                (_, taskIndex) =>
                    taskIndex !== index
            )
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
            <div className="p-8">
                Loading...
            </div>
        );
    }

    // ==========================================
    // STATUS HELPERS
    // ==========================================
    const getComponentStatusClass = (status) => {

        switch (status) {

            case "COMPLETED":
                return "bg-green-50 text-green-700 border-green-200";

            case "IN_PROGRESS":
                return "bg-blue-50 text-blue-700 border-blue-200";

            default:
                return "bg-slate-50 text-slate-600 border-slate-200";

        }
    };


    const getTaskStatusClass = (status) => {

        switch (status) {

            case "APPROVED":
                return "bg-green-50 text-green-700 border-green-200";

            case "REJECTED":
                return "bg-red-50 text-red-700 border-red-200";

            case "UNDER_REVIEW":
                return "bg-amber-50 text-amber-700 border-amber-200";

            case "SUBMITTED":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";

            case "IN_PROGRESS":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "PENDING":
                return "bg-slate-50 text-slate-600 border-slate-200";

            default:
                return "bg-slate-50 text-slate-600 border-slate-200";

        }

    };


    const totalTasks =
        components.reduce(
            (total, component) =>
                total +
                (
                    component.tasks?.length ||
                    0
                ),
            0
        );

    const toggleComponent = (componentId) => {

        setCollapsedComponents(prev => ({
            ...prev,

            [componentId]: !prev[componentId]
        }));

    };

    const handleCreateComponent = async () => {

        if (!newComponent.projectModule) {
            alert("Please select a project module.");
            return;
        }

        if (!newComponent.name.trim()) {
            alert("Please enter a component name.");
            return;
        }

        const validTasks =
            newComponent.tasks.filter(
                (task) =>
                    task.title.trim() !== ""
            );

        if (validTasks.length === 0) {
            alert("Please add at least one task.");
            return;
        }

        try {

            setCreatingComponent(true);

            await createComponentTemplate({

                projectModule:
                    newComponent.projectModule,

                name:
                    newComponent.name.trim(),

                description:
                    newComponent.description,

                tasks:
                    validTasks

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
                        description: ""
                    }
                ]
            });

        }
        catch (error) {
            console.error(
                "Error creating component:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to create component."
            );
        }
        finally {
            setCreatingComponent(false);
        }

    };

    return (

        <div
            className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6 lg:p-8"
        >

            {/* ======================================
                BREADCRUMB
            ======================================= */}
            <div
                className="flex items-center gap-2 text-sm text-muted-foreground"
            >

                <button
                    onClick={() =>
                        navigate(`/admin/project/${id}`)
                    }
                    className="transition-colors hover:text-foreground"
                >

                    {project?.name || "Project"}

                </button>

                <span>/</span>

                <span className="text-foreground">

                    Work Items

                </span>

            </div>


            {/* ======================================
                HEADER
            ======================================= */}
            <div
                className="flex flex-col gap-5 pb-6 border-b md:flex-row md:items-start md:justify-between"
            >

                <div className="flex gap-4">

                    <div
                        className="flex items-center justify-center flex-shrink-0 w-12 h-12 border rounded-xl bg-muted"
                    >

                        <ClipboardList size={22} />

                    </div>


                    <div>

                        <h1
                            className="text-2xl font-bold tracking-tight sm:text-3xl"
                        >
                            Project Work
                        </h1>


                        <p
                            className="mt-1 text-sm text-muted-foreground"
                        >
                            Manage work items,
                            tasks and employee assignments
                            for{" "}

                            <span className="font-medium text-foreground">
                                {project?.name}
                            </span>

                        </p>

                    </div>

                </div>
            </div>


            {/* ======================================
                    PROJECT WORK TABS
                ====================================== */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >

                <div className="flex flex-col gap-4 pb-4 border-b sm:flex-row sm:items-center sm:justify-between">

                    <TabsList className="justify-start w-full h-auto gap-1 p-1 sm:w-auto">

                        <TabsTrigger
                            value="work-items"
                            className="gap-2 px-4 py-2"
                        >
                            <ClipboardList size={16} />

                            Work Items

                            <Badge
                                variant="secondary"
                                className="ml-1"
                            >
                                {components.length}
                            </Badge>

                        </TabsTrigger>


                        <TabsTrigger
                            value="components"
                            className="gap-2 px-4 py-2"
                        >
                            <Boxes size={16} />

                            Components
                        </TabsTrigger>

                    </TabsList>


                    {activeTab === "work-items" && (

                        <Button
                            onClick={() =>
                                setOpenAddDialog(true)
                            }
                            className="self-start gap-2 sm:self-auto"
                        >
                            <Plus size={17} />

                            Add Work Item
                        </Button>

                    )}


                    {/* {activeTab === "components" && (

                        <Button
                            variant="outline"
                            className="self-start gap-2 sm:self-auto"
                            onClick={() =>
                                navigate("/admin/components")
                            }
                        >
                            <Plus size={17} />
                            Manage Components
                        </Button>

                    )} */}

                </div>


                {/* ======================================
                        WORK ITEMS TAB
                    ======================================= */}
                <TabsContent
                    value="work-items"
                    className="mt-6 space-y-6"
                >

                    {/* SUMMARY */}

                    <div
                        className="grid gap-4 sm:grid-cols-3"
                    >

                        <Card>

                            <CardContent
                                className="flex items-center gap-4 p-4"
                            >

                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
                                >
                                    <Layers size={19} />
                                </div>

                                <div>

                                    <p className="text-xs text-muted-foreground">
                                        Work Items
                                    </p>

                                    <p className="text-lg font-semibold">
                                        {components.length}
                                    </p>

                                </div>

                            </CardContent>

                        </Card>


                        <Card>

                            <CardContent
                                className="flex items-center gap-4 p-4"
                            >

                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
                                >
                                    <ClipboardList size={19} />
                                </div>

                                <div>

                                    <p className="text-xs text-muted-foreground">
                                        Total Tasks
                                    </p>

                                    <p className="text-lg font-semibold">
                                        {totalTasks}
                                    </p>

                                </div>

                            </CardContent>

                        </Card>


                        <Card>

                            <CardContent
                                className="flex items-center gap-4 p-4"
                            >

                                <div
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
                                >
                                    <Users size={19} />
                                </div>

                                <div>

                                    <p className="text-xs text-muted-foreground">
                                        Project Members
                                    </p>

                                    <p className="text-lg font-semibold">
                                        {projectMembers.length}
                                    </p>

                                </div>

                            </CardContent>

                        </Card>

                    </div>


                    {/* WORK ITEMS */}

                    {
                        components.length === 0 ? (
                            <Card>
                                <CardContent
                                    className="py-16 text-center"
                                >

                                    <FolderKanban
                                        size={34}
                                        className="mx-auto mb-4 text-muted-foreground"
                                    />

                                    <h3 className="font-semibold">

                                        No work items added

                                    </h3>

                                    <p
                                        className="mt-1 text-sm text-muted-foreground"
                                    >

                                        Add a work item to start
                                        creating and assigning tasks.

                                    </p>


                                    <Button
                                        className="gap-2 mt-5"
                                        onClick={() =>
                                            setOpenAddDialog(true)
                                        }
                                    >

                                        <Plus size={16} />

                                        Add Work Item

                                    </Button>

                                </CardContent>
                            </Card>

                        ) : (

                            <div className="space-y-4">

                                {

                                    components.map(
                                        component => (

                                            <Card
                                                key={component._id}
                                                className="overflow-hidden border shadow-sm"
                                            >

                                                <CardContent className="p-0">

                                                    {/* WORK ITEM HEADER */}

                                                    <div
                                                        onClick={() =>
                                                            toggleComponent(
                                                                component._id
                                                            )
                                                        }
                                                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors cursor-pointer bg-muted/20 hover:bg-muted/40"
                                                    >

                                                        <div className="flex items-center min-w-0 gap-3">

                                                            <div
                                                                className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-muted"
                                                            >
                                                                <Layers size={18} />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <div className="flex items-center gap-2">

                                                                    <h2 className="text-lg font-semibold truncate">
                                                                        {component.name}
                                                                    </h2>

                                                                    <Badge
                                                                        variant="outline"
                                                                        className={`text-xs font-medium ${getComponentStatusClass(
                                                                            component.status
                                                                        )}`}
                                                                    >
                                                                        {component.status}
                                                                    </Badge>

                                                                </div>

                                                                <p className="mt-0.5 text-sm text-muted-foreground">

                                                                    Module:{" "}

                                                                    {
                                                                        component
                                                                            .projectModule
                                                                            ?.name || "-"
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        component.tasks
                                                                            ?.length || 0
                                                                    } task(s)

                                                                </p>

                                                            </div>

                                                        </div>


                                                        <div
                                                            className="flex items-center justify-center flex-shrink-0 w-9 h-9"
                                                        >

                                                            {
                                                                collapsedComponents[
                                                                    component._id
                                                                ]

                                                                    ? (
                                                                        <ChevronDown
                                                                            size={19}
                                                                        />
                                                                    )

                                                                    : (
                                                                        <ChevronUp
                                                                            size={19}
                                                                        />
                                                                    )
                                                            }

                                                        </div>

                                                    </div>


                                                    {/* TASK LIST */}

                                                    {
                                                        !collapsedComponents[
                                                        component._id
                                                        ] && (

                                                            <div className="divide-y">

                                                                {

                                                                    component.tasks?.map(
                                                                        task => (

                                                                            <div
                                                                                key={
                                                                                    task._id
                                                                                }
                                                                                className="flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20"
                                                                            >

                                                                                <div className="min-w-0">

                                                                                    <div className="flex flex-wrap items-center gap-2">

                                                                                        <h3 className="text-base font-semibold">
                                                                                            {task.title}
                                                                                        </h3>

                                                                                        <Badge
                                                                                            variant="outline"
                                                                                            className={`text-[11px] font-medium ${getTaskStatusClass(
                                                                                                task.status
                                                                                            )}`}
                                                                                        >

                                                                                            {
                                                                                                task.status
                                                                                                    ?.replaceAll(
                                                                                                        "_",
                                                                                                        " "
                                                                                                    )
                                                                                            }

                                                                                        </Badge>

                                                                                    </div>


                                                                                    <div className="flex flex-wrap items-center mt-2 text-sm gap-x-4 gap-y-1 text-muted-foreground">

                                                                                        <span className="flex items-center gap-1.5">

                                                                                            <UserRound
                                                                                                size={14}
                                                                                            />

                                                                                            {
                                                                                                task.assignedEmployee
                                                                                                    ?.username ||
                                                                                                "Not assigned"
                                                                                            }

                                                                                        </span>


                                                                                        <span className="flex items-center gap-1.5">
                                                                                            <CalendarDays
                                                                                                size={14}
                                                                                            />
                                                                                            {
                                                                                                task.deadline
                                                                                                    ? `Due ${new Date(
                                                                                                        task.deadline
                                                                                                    ).toLocaleDateString()}`
                                                                                                    : "No deadline"
                                                                                            }
                                                                                        </span>

                                                                                    </div>

                                                                                </div>


                                                                                <div className="flex flex-shrink-0">

                                                                                    {

                                                                                        !task.assignedEmployee ? (

                                                                                            <Button
                                                                                                variant="outline"
                                                                                                size="sm"
                                                                                                onClick={() => {

                                                                                                    setSelectedTask({
                                                                                                        componentId:
                                                                                                            component._id,

                                                                                                        taskId:
                                                                                                            task._id,

                                                                                                        title:
                                                                                                            task.title
                                                                                                    });

                                                                                                    setSelectedProjectMember("");

                                                                                                    setDeadline("");

                                                                                                    setAssignDialogOpen(
                                                                                                        true
                                                                                                    );

                                                                                                }}
                                                                                            >
                                                                                                Assign
                                                                                            </Button>

                                                                                        ) : task.status ===
                                                                                            "UNDER_REVIEW" ? (

                                                                                            <Button
                                                                                                size="sm"
                                                                                                onClick={() =>
                                                                                                    navigate(
                                                                                                        `/admin/reviews/${task.submissionId}`
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                Review
                                                                                            </Button>

                                                                                        ) : task.status ===
                                                                                            "APPROVED" ? (

                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                disabled
                                                                                            >
                                                                                                Approved
                                                                                            </Button>

                                                                                        ) : task.status ===
                                                                                            "REJECTED" ? (

                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                onClick={() =>
                                                                                                    navigate(
                                                                                                        `/admin/reviews/${task.submissionId}`
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                Review Again
                                                                                            </Button>

                                                                                        ) : (

                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className="text-xs font-medium"
                                                                                            >
                                                                                                Waiting for submission
                                                                                            </Badge>

                                                                                        )

                                                                                    }

                                                                                </div>

                                                                            </div>

                                                                        )
                                                                    )

                                                                }

                                                            </div>

                                                        )

                                                    }

                                                </CardContent>

                                            </Card>

                                        )
                                    )

                                }

                            </div>

                        )

                    }

                </TabsContent>


                {/* ======================================
                        COMPONENTS TAB
                    ======================================= */}
                <TabsContent
                    value="components"
                    className="mt-6 space-y-4"
                >

                    {/* COMPONENTS HEADER */}

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-semibold">
                                Components
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Manage components and their tasks for this project.
                            </p>

                        </div>

                        <Button
                            className="gap-2"
                            onClick={() => setOpenCreateComponent(true)}                        >
                            <Plus size={17} />

                            Add Component
                        </Button>

                    </div>


                    {/* EMPTY STATE */}

                    <Card>

                        <CardContent className="py-16 text-center">

                            <Boxes
                                size={38}
                                className="mx-auto mb-4 text-muted-foreground"
                            />

                            <h3 className="text-lg font-semibold">
                                No components added
                            </h3>

                            <p className="max-w-md mx-auto mt-2 text-sm text-muted-foreground">
                                Create a component and add tasks that can be used
                                as work items in this project.
                            </p>

                            <Button
                                className="gap-2 mt-6"
                                onClick={() => setOpenCreateComponent(true)}
                            >
                                <Plus size={17} />

                                Add Component
                            </Button>

                        </CardContent>

                    </Card>

                </TabsContent>

            </Tabs>


            {/* ======================================
                ADD WORK ITEM DIALOG
            ======================================= */}
            <Dialog
                open={openAddDialog}
                onOpenChange={
                    setOpenAddDialog
                }
            >

                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>
                            Add Work Item
                        </DialogTitle>
                    </DialogHeader>


                    <div className="space-y-5">


                        {/* MODULE */}

                        <div>

                            <label className="text-sm font-medium">
                                Select Module
                            </label>


                            <Select
                                value={selectedModule}
                                onValueChange={
                                    handleModuleChange
                                }
                            >

                                <SelectTrigger className="mt-2">
                                    <SelectValue
                                        placeholder="
                                            Select project module
                                        "
                                    />
                                </SelectTrigger>


                                <SelectContent>

                                    {

                                        modules?.map(
                                            module => (

                                                <SelectItem
                                                    key={
                                                        module._id
                                                    }
                                                    value={
                                                        module._id
                                                    }
                                                >

                                                    {
                                                        module.name
                                                    }

                                                </SelectItem>

                                            )
                                        )

                                    }

                                </SelectContent>

                            </Select>

                        </div>



                        {/* WORK ITEM */}

                        <div>

                            <label className="text-sm font-medium">
                                Select Work Item
                            </label>

                            <Select
                                value={
                                    selectedTemplate
                                }
                                onValueChange={
                                    setSelectedTemplate
                                }
                                disabled={
                                    !selectedModule
                                }
                            >

                                <SelectTrigger className="mt-2">
                                    <SelectValue
                                        placeholder="
                                            First select a module
                                        "
                                    />
                                </SelectTrigger>


                                <SelectContent>

                                    {
                                        templates?.map(
                                            template => (

                                                <SelectItem
                                                    key={
                                                        template._id
                                                    }
                                                    value={
                                                        template._id
                                                    }
                                                >
                                                    {template.name}
                                                </SelectItem>

                                            )
                                        )
                                    }

                                </SelectContent>

                            </Select>

                        </div>

                    </div>


                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setOpenAddDialog(false)
                            }
                        >
                            Cancel
                        </Button>


                        <Button
                            onClick={
                                handleAddComponent
                            }
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
                onOpenChange={
                    setAssignDialogOpen
                }
            >

                <DialogContent>

                    <DialogHeader>

                        <DialogTitle>
                            Assign Task
                        </DialogTitle>

                    </DialogHeader>


                    <div className="space-y-5">


                        {/* TASK */}

                        <div>

                            <label className="text-sm font-medium">
                                Task
                            </label>

                            <div
                                className="p-3 mt-2 border rounded-lg bg-muted/40"
                            >
                                {selectedTask?.title}
                            </div>

                        </div>



                        {/* EMPLOYEE */}

                        <div>

                            <label className="text-sm font-medium">
                                Assign To
                            </label>


                            <Select
                                value={
                                    selectedProjectMember
                                }
                                onValueChange={
                                    setSelectedProjectMember
                                }
                            >

                                <SelectTrigger className="mt-2">
                                    <SelectValue
                                        placeholder="
                                            Select employee
                                        "
                                    />
                                </SelectTrigger>


                                <SelectContent>

                                    {

                                        projectMembers?.map(
                                            member => (

                                                <SelectItem
                                                    key={
                                                        member._id
                                                    }
                                                    value={
                                                        member._id
                                                    }
                                                >

                                                    {
                                                        member.employee
                                                            ?.username
                                                    }

                                                    {" — "}

                                                    {
                                                        member.domain
                                                            ?.name
                                                    }

                                                </SelectItem>

                                            )
                                        )

                                    }

                                </SelectContent>

                            </Select>

                        </div>



                        {/* DEADLINE */}

                        <div>

                            <label className="text-sm font-medium">
                                Deadline
                            </label>

                            <input
                                type="date"
                                className="w-full h-10 px-3 mt-2 text-sm border rounded-md outline-none bg-background focus:ring-2 focus:ring-ring"
                                value={deadline}
                                onChange={(e) =>
                                    setDeadline(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>


                    <DialogFooter>

                        <Button
                            variant="outline"
                            onClick={() =>
                                setAssignDialogOpen(false)
                            }
                        >
                            Cancel
                        </Button>


                        <Button
                            onClick={
                                handleAssignTask
                            }
                        >
                            Assign Task
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

            <Dialog
                open={openCreateComponent}
                onOpenChange={setOpenCreateComponent}
            >

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

                    <DialogHeader>

                        <DialogTitle>
                            Add Component
                        </DialogTitle>

                        <DialogDescription>
                            Create a reusable component and define
                            the tasks included in it.
                        </DialogDescription>

                    </DialogHeader>


                    <div className="py-2 space-y-5">

                        {/* MODULE */}

                        <div className="space-y-2">

                            <Label>
                                Project Module
                            </Label>

                            <select
                                value={
                                    newComponent.projectModule
                                }
                                onChange={(e) =>
                                    setNewComponent((prev) => ({
                                        ...prev,
                                        projectModule:
                                            e.target.value
                                    }))
                                }
                                className="flex w-full h-10 px-3 py-2 text-sm bg-transparent border rounded-md"
                            >

                                <option value="">
                                    Select module
                                </option>

                                {modules.map((module) => (

                                    <option
                                        key={module._id}
                                        value={module._id}
                                    >
                                        {module.name}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* COMPONENT NAME */}

                        <div className="space-y-2">

                            <Label>
                                Component Name
                            </Label>

                            <Input
                                value={newComponent.name}
                                onChange={(e) =>
                                    setNewComponent((prev) => ({
                                        ...prev,
                                        name: e.target.value
                                    }))
                                }
                                placeholder="e.g. Main Power Harness"
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="space-y-2">

                            <Label>
                                Description
                            </Label>

                            <Textarea
                                value={
                                    newComponent.description
                                }
                                onChange={(e) =>
                                    setNewComponent((prev) => ({
                                        ...prev,
                                        description:
                                            e.target.value
                                    }))
                                }
                                placeholder="Describe this component..."
                                rows={3}
                            />

                        </div>


                        {/* TASKS */}

                        <div className="pt-4 border-t">

                            <div className="flex items-center justify-between mb-4">

                                <div>

                                    <Label>
                                        Tasks
                                    </Label>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Define the tasks required for this component.
                                    </p>

                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={addComponentTask}
                                >

                                    <Plus size={15} />

                                    Add Task

                                </Button>

                            </div>


                            <div className="space-y-3">

                                {newComponent.tasks.map(
                                    (task, index) => (

                                        <div
                                            key={index}
                                            className="p-4 border rounded-lg"
                                        >

                                            <div className="flex items-center justify-between mb-3">

                                                <span className="text-sm font-medium">

                                                    Task {index + 1}

                                                </span>

                                                {newComponent.tasks.length > 1 && (

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeComponentTask(index)
                                                        }
                                                    >

                                                        <Trash2
                                                            size={17}
                                                            className="text-destructive"
                                                        />

                                                    </Button>

                                                )}

                                            </div>


                                            <div className="space-y-3">

                                                <Input
                                                    value={task.title}
                                                    onChange={(e) =>
                                                        updateComponentTask(
                                                            index,
                                                            "title",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Task title"
                                                />


                                                <Textarea
                                                    value={
                                                        task.description
                                                    }
                                                    onChange={(e) =>
                                                        updateComponentTask(
                                                            index,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Task description (optional)"
                                                    rows={2}
                                                />

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>


                    <DialogFooter>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setOpenCreateComponent(false)
                            }
                            disabled={creatingComponent}
                        >
                            Cancel
                        </Button>


                        <Button
                            type="button"
                            onClick={handleCreateComponent}
                            disabled={creatingComponent}
                        >

                            {creatingComponent
                                ? "Creating..."
                                : "Create Component"}

                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

        </div>



    );

}