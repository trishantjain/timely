import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getProjectById } from "@/api/projectAPI";
import { addProjectComponent, assignTask, getProjectComponents } from "@/api/projectComponentAPI";
import { getProjectModules } from "@/api/projectModuleAPI";
import { getComponentsByModule } from "@/api/componentTemplateAPI";

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
import { getProjectMembers } from "@/api/projectMemberAPI";
import { getEmployees } from "@/api/employeeAPI";

export default function ProjectComponents() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);
    const [components, setComponents] = useState([]);

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

    const loadData = async () => {
        try {
            const projectRes =
                await getProjectById(id);

            const componentRes =
                await getProjectComponents(id);

            const moduleRes = await getProjectModules();

            const memberRes =
                await getProjectMembers(id);

            // const employeeRes = await getEmployees();

            console.log("MODULE RESPONSE");
            console.log(moduleRes);
            console.log(moduleRes.data);

            setProject(projectRes.data);

            setComponents(componentRes.data.data);

            console.log("PROJECT COMPONENTS");
            console.log(componentRes.data.data);

            setModules(moduleRes.data.data);
            // setEmployees(employeeRes.data.data);

            setProjectMembers(memberRes.data.data);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    const handleModuleChange = async (moduleId) => {
        setSelectedModule(moduleId);

        const res = await getComponentsByModule(moduleId);

        setTemplates(res.data.data);
    };

    const handleAddComponent = async () => {

        if (!selectedTemplate) {
            alert("Please select a component.");
            return;
        }

        try {
            await addProjectComponent({
                projectId: id,
                componentTemplateId: selectedTemplate
            });

            setOpenAddDialog(false);

            setSelectedModule("");

            setSelectedTemplate("");

            setTemplates([]);

            loadData();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to add component."
            );
        }
    };

    const handleAssignTask = async () => {

        if (!selectedProjectMember) {
            alert("Please select an employee.");
            return;
        }

        try {

            await assignTask(
                selectedTask.componentId,

                selectedTask.taskId,
                {
                    projectMemberId: selectedProjectMember,
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

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8 mx-auto max-w-7xl">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold">
                        {project.name}
                    </h1>

                    <p className="text-muted-foreground">
                        Manage Project Components
                    </p>

                </div>

                <Button onClick={() => setOpenAddDialog(true)}>
                    Add Component
                </Button>

            </div>

            <div className="mt-8 space-y-6">

                {components?.map(component => (

                    <div
                        key={component._id}
                        className="p-6 bg-white border shadow-sm rounded-xl"
                    >

                        <div className="flex justify-between">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    {component.name}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    {component.projectModule.name}
                                </p>

                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${component.status === "COMPLETED"
                                    ? "bg-green-100 text-green-700"
                                    : component.status === "IN_PROGRESS"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {component.status}
                            </span>

                        </div>

                        <div className="mt-6 space-y-3">

                            {component.tasks?.map(task => (

                                <div
                                    key={task._id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >

                                    <div>

                                        <p className="font-medium">
                                            {task.title}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {task.status}
                                        </p>

                                    </div>

                                    {
                                        task.status === "PENDING" ? (

                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedTask({
                                                        componentId: component._id,
                                                        taskId: task._id,
                                                        title: task.title
                                                    });

                                                    setSelectedProjectMember("");
                                                    setDeadline("");

                                                    setAssignDialogOpen(true);
                                                }}                                                >
                                                Assign
                                            </Button>

                                        ) : task.status === "UNDER_REVIEW" ? (

                                            <Button
                                                onClick={() =>
                                                    navigate(`/admin/reviews/${task.submissionId}`)
                                                }
                                            >
                                                Review
                                            </Button>

                                        ) : task.status === "APPROVED" ? (

                                            <Button disabled>
                                                Approved
                                            </Button>

                                        ) : (

                                            <Button
                                                variant="destructive"
                                                onClick={() =>
                                                    navigate(`/admin/reviews/${task.submissionId}`)
                                                }
                                            >
                                                Review Again
                                            </Button>

                                        )
                                    }
                                </div>

                            ))
                            }

                        </div>

                    </div>

                ))
                }

            </div>

            {/* Add Component Dialog */}
            <Dialog
                open={openAddDialog}
                onOpenChange={setOpenAddDialog}
            >

                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>
                            Add Component
                        </DialogTitle>
                    </DialogHeader>



                    <div className="space-y-5">

                        <div>

                            <label className="text-sm font-medium">
                                Module
                            </label>

                            <Select
                                value={selectedModule}
                                onValueChange={handleModuleChange}
                            >

                                <SelectTrigger>
                                    <SelectValue placeholder="Select Module" />
                                </SelectTrigger>

                                <SelectContent>
                                    {modules?.map(module => (
                                        <SelectItem
                                            key={module._id}
                                            value={module._id}
                                        >
                                            {module.name}
                                        </SelectItem>
                                    ))
                                    }
                                </SelectContent>

                            </Select>

                        </div>

                        <div>

                            <label className="text-sm font-medium">
                                Component
                            </label>

                            <Select
                                value={selectedTemplate}
                                onValueChange={setSelectedTemplate}
                            >

                                <SelectTrigger>
                                    <SelectValue placeholder="Select Component" />
                                </SelectTrigger>

                                <SelectContent>
                                    {templates?.map(template => (
                                        <SelectItem
                                            key={template._id}
                                            value={template._id}
                                        >
                                            {template.name}
                                        </SelectItem>
                                    ))
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
                            onClick={handleAddComponent}
                        >
                            Add
                        </Button>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

            {/* Assign Dialog */}
            <Dialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
            >
                <DialogContent>

                    <DialogHeader>
                        <DialogTitle>
                            Assign Task
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">

                        <div>
                            <label className="text-sm font-medium">
                                Task
                            </label>

                            <div className="p-3 mt-1 border rounded-md bg-gray-50">
                                {selectedTask?.title}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Employee
                            </label>

                            <Select
                                value={selectedProjectMember}
                                onValueChange={setSelectedProjectMember}
                            >

                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employee" />
                                </SelectTrigger>

                                <SelectContent>

                                    {projectMembers?.map(member => (

                                        <SelectItem
                                            key={member._id}
                                            value={member._id}
                                        >
                                            {member.employee.username}
                                            {" - "}
                                            {member.domain.name}
                                        </SelectItem>

                                    ))}

                                </SelectContent>

                            </Select>

                        </div>

                        <div>

                            <label className="text-sm font-medium">
                                Deadline
                            </label>

                            <input
                                type="date"
                                className="w-full p-2 mt-1 border rounded-md"
                                value={deadline}
                                onChange={(e) =>
                                    setDeadline(e.target.value)
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
                            onClick={handleAssignTask}
                        >
                            Assign
                        </Button>

                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </div>

    );

}