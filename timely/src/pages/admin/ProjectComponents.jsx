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
import { getComponentsByModule } from "@/api/componentTemplateAPI";
import { getProjectMembers } from "@/api/projectMemberAPI";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    FolderKanban,
    Layers,
    Plus,
    UserRound,
    Users,
    ChevronDown,
    ChevronUp
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

    const [modules, setModules] = useState([]);

    const [templates, setTemplates] = useState([]);

    const [selectedModule, setSelectedModule] =
        useState("");

    const [selectedTemplate, setSelectedTemplate] =
        useState("");

    const [openAddDialog, setOpenAddDialog] =
        useState(false);

    const [projectMembers, setProjectMembers] =
        useState([]);

    const [assignDialogOpen, setAssignDialogOpen] =
        useState(false);

    const [selectedTask, setSelectedTask] =
        useState(null);

    const [
        selectedProjectMember,
        setSelectedProjectMember
    ] = useState("");

    const [deadline, setDeadline] =
        useState("");

    const [collapsedComponents, setCollapsedComponents] =
        useState({});


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


    // ==========================================
    // LOAD
    // ==========================================

    useEffect(() => {

        loadData();

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


                <Button
                    onClick={() =>
                        setOpenAddDialog(true)
                    }
                    className="self-start gap-2"
                >

                    <Plus size={17} />

                    Add Work Item

                </Button>

            </div>



            {/* ======================================
                SUMMARY
            ======================================= */}

            <div
                className="grid gap-4 sm:grid-cols-3"
            >


                <Card>

                    <CardContent
                        className="flex items-center gap-4 p-4 "
                    >

                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
                        >

                            <Layers size={19} />

                        </div>


                        <div>

                            <p
                                className="text-xs text-muted-foreground"
                            >

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
                        className="flex items-center gap-4 p-4 "
                    >

                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
                        >

                            <ClipboardList size={19} />

                        </div>


                        <div>

                            <p
                                className="text-xs text-muted-foreground"
                            >

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
                        className="flex items-center gap-4 p-4 "
                    >

                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted"
                        >

                            <Users size={19} />

                        </div>


                        <div>

                            <p
                                className="text-xs text-muted-foreground"
                            >

                                Project Members

                            </p>

                            <p className="text-lg font-semibold">

                                {projectMembers.length}

                            </p>

                        </div>

                    </CardContent>

                </Card>

            </div>



            {/* ======================================
                WORK ITEMS
            ======================================= */}

            {

                components.length === 0 ? (

                    <Card>

                        <CardContent
                            className="py-16 text-center "
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

                                            {/* ================================
                                                    WORK ITEM HEADER
                                                ================================= */}
                                            <div className="flex items-center justify-between gap-4 px-5 py-4 bg-muted/20">

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

                                                            {component.projectModule?.name || "-"}

                                                            {" • "}

                                                            {component.tasks?.length || 0} task(s)

                                                        </p>

                                                    </div>

                                                </div>


                                                {/* COLLAPSE BUTTON */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        toggleComponent(component._id)
                                                    }
                                                    title={
                                                        collapsedComponents[component._id]
                                                            ? "Expand tasks"
                                                            : "Collapse tasks"
                                                    }
                                                >
                                                    {
                                                        collapsedComponents[component._id]
                                                            ? (
                                                                <ChevronDown size={19} />
                                                            ) : (
                                                                <ChevronUp size={19} />
                                                            )
                                                    }
                                                </Button>

                                            </div>


                                            {/* ================================
            TASK LIST
        ================================= */}
                                            {
                                                !collapsedComponents[component._id] && (

                                                    <div className="divide-y">

                                                        {
                                                            component.tasks?.map(task => (

                                                                <div
                                                                    key={task._id}
                                                                    className="flex flex-col gap-3 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between hover:bg-muted/20"
                                                                >

                                                                    {/* TASK INFORMATION */}
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
                                                                                        ?.replaceAll("_", " ")
                                                                                }
                                                                            </Badge>

                                                                        </div>


                                                                        <div className="flex flex-wrap items-center mt-2 text-sm gap-x-4 gap-y-1 text-muted-foreground">

                                                                            {/* ASSIGNED EMPLOYEE */}

                                                                            <span className="flex items-center gap-1.5">

                                                                                <UserRound size={14} />

                                                                                {
                                                                                    task.assignedEmployee
                                                                                        ?.username ||
                                                                                    "Not assigned"
                                                                                }

                                                                            </span>


                                                                            {/* DEADLINE */}

                                                                            <span className="flex items-center gap-1.5">

                                                                                <CalendarDays size={14} />

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


                                                                    {/* ACTION */}
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

                                                                                        setAssignDialogOpen(true);

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

                                                            ))

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

                                                    {
                                                        template.name
                                                    }

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

                                {
                                    selectedTask?.title
                                }

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

        </div>

    );

}