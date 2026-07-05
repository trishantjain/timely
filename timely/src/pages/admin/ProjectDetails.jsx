import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getProjectById } from "@/api/projectAPI";
import { getEmployees } from "@/api/employeeAPI";
import { createAssignments } from "@/api/assignmentAPI";

export default function ProjectDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState({});

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {

        try {
            const res = await getProjectById(id);
            const employeeRes = await getEmployees();

            setEmployees(employeeRes.data.data);
            setProject(res.data);

            console.log(res.data);

            const autoSelections = {};

            res.data.domains.forEach(domain => {

                const matchingEmployees = employeeRes.data.data.filter(employee =>
                    employee.expertise.some(exp => exp._id === domain._id)
                );

                if (matchingEmployees.length === 1) {
                    autoSelections[domain._id] = matchingEmployees[0]._id;
                }

            });

            setSelectedEmployees(autoSelections);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }

    };

    const handleApproveAssignments = async () => {

        try {
            const assignments = project.domains.map(domain => ({

                domainId: domain._id,
                employeeId: selectedEmployees[domain._id]

            }));

            // Validation
            const hasEmpty = assignments.some(item => !item.employeeId);

            if (hasEmpty) {
                alert("Please assign employees for all domains.");
                return;
            }

            console.log({
                projectId: project._id,
                assignments
            });

            await createAssignments({
                projectId: project._id,
                assignments
            });

            alert("Assignments created successfully.");

            loadProject();

        }
        catch (err) {
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                Loading...
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8">
                Project not found
            </div>
        );
    }

    return (

        <div className="max-w-6xl p-8 mx-auto space-y-6">

            <Button
                variant="outline"
                onClick={() => navigate(-1)}
            >
                ← Back
            </Button>

            {/* <button
                onClick={() => navigate(`/admin/project/${id}/assign`)}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
                Assign Employees
            </button> */}

            <div className="p-6 bg-white border shadow-sm rounded-xl">

                <h1 className="text-3xl font-bold">
                    {project.name}
                </h1>

                <p className="mt-3 text-muted-foreground">
                    {project.description}
                </p>

                <span className="inline-block px-3 py-1 mt-4 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                    {project.status}
                </span>

            </div>

            <div className="grid gap-6 lg:grid-cols-2">

                <div className="p-6 bg-white border shadow-sm rounded-xl">

                    <h2 className="mb-4 text-xl font-semibold">
                        Required Domains
                    </h2>

                    <div className="space-y-6">
                        {project.domains.map(domain => {

                            const assignment = project.assignments?.find(
                                item => item.domain._id === domain._id
                            );

                            const matchingEmployees = employees.filter(employee =>
                                employee.expertise.some(
                                    exp => exp._id === domain._id
                                )
                            );

                            return (

                                <div
                                    key={domain._id}
                                    className="pb-5 border-b last:border-b-0"
                                >

                                    <h3 className="text-lg font-semibold">
                                        {domain.name}
                                    </h3>

                                    {assignment ? (

                                        <div className="p-3 mt-3 border rounded-lg bg-green-50">

                                            <p className="text-sm text-gray-500">
                                                Assigned Employee
                                            </p>

                                            <p className="font-medium">
                                                {assignment.employee.username}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Status : {assignment.status}
                                            </p>

                                        </div>

                                    ) : (

                                        <>
                                            {/* No Employee */}
                                            {matchingEmployees.length === 0 && (

                                                <p className="mt-3 text-sm text-red-500">
                                                    No employee available for this domain.
                                                </p>

                                            )}

                                            {/* Single Employee */}
                                            {matchingEmployees.length === 1 && (

                                                <div className="p-3 mt-3 border rounded-lg bg-green-50">

                                                    {/* <p className="text-sm text-gray-500">
                                                Auto Selected Employee
                                            </p> */}

                                                    <p className="font-medium">
                                                        {matchingEmployees[0].username}
                                                    </p>

                                                </div>

                                            )}

                                            {/* Multiple Employees */}
                                            {matchingEmployees.length > 1 && (

                                                <div className="mt-3">

                                                    <label className="block mb-2 text-sm text-gray-500">
                                                        Select Employee
                                                    </label>

                                                    <select
                                                        className="w-full p-2 border rounded-lg"
                                                        value={selectedEmployees[domain._id] || ""}
                                                        onChange={(e) =>
                                                            setSelectedEmployees(prev => ({
                                                                ...prev,
                                                                [domain._id]: e.target.value
                                                            }))
                                                        }
                                                    >

                                                        <option value="">
                                                            Select Employee
                                                        </option>

                                                        {matchingEmployees.map(employee => (
                                                            <option
                                                                key={employee._id}
                                                                value={employee._id}
                                                            >
                                                                {employee.username}
                                                            </option>
                                                        ))}

                                                    </select>

                                                </div>

                                            )}

                                        </>
                                    )}
                                </div>
                            )

                        })}

                    </div>


                    <div className="flex justify-end gap-3 mt-6">
                        {project.assignments?.length === 0 && (

                            <Button
                                onClick={handleApproveAssignments}
                            >
                                Approve Assignment
                            </Button>

                        )
                        }
                        {project.assignments?.length > 0 && (

                            <Button
                                onClick={() =>
                                    navigate(`/admin/project/${project._id}/components`)
                                }
                            >
                                Manage Components
                            </Button>

                        )
                        }
                    </div>
                </div>

                <div className="p-6 bg-white border shadow-sm rounded-xl">

                    <h2 className="mb-4 text-xl font-semibold">
                        Project Information
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">

                        <div>

                            <p className="text-sm text-muted-foreground">
                                Created By
                            </p>

                            {/* <p className="font-medium">
                                {project.created_by.username || "N/A"}
                            </p> */}

                        </div>

                        <div>

                            <p className="text-sm text-muted-foreground">
                                Created On
                            </p>

                            <p>
                                {new Date(project.createdAt).toLocaleDateString()}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-muted-foreground">
                                Last Updated
                            </p>

                            <p>
                                {new Date(project.updatedAt).toLocaleDateString()}
                            </p>

                        </div>

                    </div>

                </div>

            </div>
        </div>

    );

}