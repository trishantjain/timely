import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent
} from "@/components/ui/card";

import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    CircleUserRound,
    Layers,
    Users
} from "lucide-react";

import { getProjectById } from "@/api/projectAPI";
import { getEmployees } from "@/api/employeeAPI";
import { createAssignments } from "@/api/assignmentAPI";


export default function ProjectDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] =
        useState({});



    // ==========================================
    // LOAD PROJECT
    // ==========================================
    useEffect(() => {
        loadProject();
    }, []);


    const loadProject = async () => {

        try {

            const res =
                await getProjectById(id);

            const employeeRes =
                await getEmployees();


            setEmployees(
                employeeRes.data.data
            );

            setProject(
                res.data
            );


            // ==========================================
            // AUTO SELECT EMPLOYEE
            // ==========================================

            const autoSelections = {};

            res.data.domains.forEach(
                domain => {

                    const matchingEmployees =
                        employeeRes.data.data.filter(
                            employee =>
                                employee.expertise.some(
                                    exp =>
                                        exp._id ===
                                        domain._id
                                )
                        );


                    if (
                        matchingEmployees.length === 1
                    ) {

                        autoSelections[
                            domain._id
                        ] =
                            matchingEmployees[0]._id;

                    }

                }
            );


            setSelectedEmployees(
                autoSelections
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
    // CREATE ASSIGNMENTS
    // ==========================================
    const handleApproveAssignments =
        async () => {

            try {

                const assignments =
                    project.domains.map(
                        domain => ({

                            domainId:
                                domain._id,

                            employeeId:
                                selectedEmployees[
                                domain._id
                                ]

                        })
                    );


                const hasEmpty =
                    assignments.some(
                        item =>
                            !item.employeeId
                    );


                if (hasEmpty) {

                    alert(
                        "Please assign employees for all domains."
                    );

                    return;

                }


                await createAssignments({

                    projectId:
                        project._id,

                    assignments

                });


                alert(
                    "Assignments created successfully."
                );


                loadProject();

            }
            catch (err) {

                console.error(err);

            }

        };


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
    // NOT FOUND
    // ==========================================
    if (!project) {
        return (
            <div className="p-8">
                Project not found
            </div>
        );
    }


    const assignments =
        project.assignments || [];

    const assignmentsCreated =
        assignments.length > 0;


    const statusClass =
        project.status === "active"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-muted text-muted-foreground";


    return (

        <div className="p-4 mx-auto space-y-5 max-w-7xl sm:p-6 lg:p-8">


            {/* ======================================
                NAVIGATION
            ======================================= */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <button
                    onClick={() =>
                        navigate("/admin")
                    }
                    className="transition-colors hover:text-foreground"
                >
                    Projects
                </button>

                <span>/</span>

                <span className="font-medium text-foreground">

                    {project.name}

                </span>

            </div>



            {/* ======================================
                PROJECT HEADER
            ======================================= */}
            <div className="flex flex-col gap-4 pb-5 border-b sm:flex-row sm:items-start sm:justify-between">

                <div className="flex gap-3">

                    <div
                        className="flex items-center justify-center flex-shrink-0 border rounded-lg w-11 h-11 bg-muted"
                    >

                        <BriefcaseBusiness size={21} />

                    </div>


                    <div>

                        <div className="flex flex-wrap items-center gap-2">

                            <h1 className="text-2xl font-bold tracking-tight">

                                {project.name}

                            </h1>


                            <Badge
                                variant="outline"
                                className={`text-xs ${statusClass}`}
                            >

                                {project.status}

                            </Badge>

                        </div>


                        <p className="max-w-3xl mt-1.5 text-sm leading-6 text-muted-foreground">

                            {
                                project.description ||
                                "No project description provided."
                            }

                        </p>

                    </div>

                </div>


                <Button
                    variant="outline"
                    size="sm"
                    className="self-start gap-2"
                    onClick={() =>
                        navigate(-1)
                    }
                >

                    <ArrowLeft size={15} />

                    All Projects

                </Button>

            </div>



            {/* ======================================
                PROJECT OVERVIEW
            ======================================= */}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">


                <Card>

                    <CardContent className="flex items-center gap-3 p-3.5">

                        <div className="flex items-center justify-center rounded-md w-9 h-9 bg-muted">

                            <Layers size={17} />

                        </div>

                        <div>

                            <p className="text-xs text-muted-foreground">

                                Required Domains

                            </p>

                            <p className="text-lg font-semibold">

                                {project.domains?.length || 0}

                            </p>

                        </div>

                    </CardContent>

                </Card>


                <Card>

                    <CardContent className="flex items-center gap-3 p-3.5">

                        <div className="flex items-center justify-center rounded-md w-9 h-9 bg-muted">

                            <Users size={17} />

                        </div>

                        <div>

                            <p className="text-xs text-muted-foreground">

                                Assigned Employees

                            </p>

                            <p className="text-lg font-semibold">

                                {assignments.length}

                            </p>

                        </div>

                    </CardContent>

                </Card>


                <Card>

                    <CardContent className="flex items-center gap-3 p-3.5">

                        <div className="flex items-center justify-center rounded-md w-9 h-9 bg-muted">

                            <CheckCircle2 size={17} />

                        </div>

                        <div>

                            <p className="text-xs text-muted-foreground">

                                Assignment Status

                            </p>

                            <p className="text-sm font-semibold">

                                {
                                    assignmentsCreated
                                        ? "Completed"
                                        : "Pending"
                                }

                            </p>

                        </div>

                    </CardContent>

                </Card>


                <Card>

                    <CardContent className="flex items-center gap-3 p-3.5">

                        <div className="flex items-center justify-center rounded-md w-9 h-9 bg-muted">

                            <CalendarDays size={17} />

                        </div>

                        <div>

                            <p className="text-xs text-muted-foreground">

                                Created

                            </p>

                            <p className="text-sm font-semibold">

                                {
                                    project.createdAt
                                        ? new Date(
                                            project.createdAt
                                        ).toLocaleDateString()
                                        : "-"
                                }

                            </p>

                        </div>

                    </CardContent>

                </Card>

            </div>



            {/* ======================================
                TEAM ASSIGNMENT
            ======================================= */}
            <Card>

                <CardContent className="p-4 sm:p-5">


                    {/* HEADER */}

                    <div className="flex items-center justify-between pb-3 mb-1 border-b">

                        <div>

                            <h2 className="text-base font-semibold">

                                Team Assignment

                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">

                                Assign employees to project domains.

                            </p>

                        </div>


                        {assignmentsCreated && (

                            <Badge
                                variant="outline"
                                className="text-xs"
                            >

                                {assignments.length} Assigned

                            </Badge>

                        )}

                    </div>



                    {/* ASSIGNMENT LIST */}

                    <div className="divide-y">

                        {
                            project.domains?.map(
                                domain => {

                                    const assignment =
                                        assignments.find(
                                            item =>
                                                item.domain?._id ===
                                                domain._id
                                        );


                                    const matchingEmployees =
                                        employees.filter(
                                            employee =>
                                                employee.expertise?.some(
                                                    exp =>
                                                        exp._id ===
                                                        domain._id
                                                )
                                        );


                                    return (

                                        <div
                                            key={domain._id}
                                            className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                        >


                                            {/* DOMAIN */}

                                            <div className="flex items-center gap-3">

                                                <div
                                                    className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-md bg-muted"
                                                >

                                                    <Layers size={16} />

                                                </div>


                                                <div>

                                                    <p className="text-sm font-semibold">

                                                        {domain.name}

                                                    </p>

                                                    <p className="text-xs text-muted-foreground">

                                                        Required project domain

                                                    </p>

                                                </div>

                                            </div>



                                            {/* ASSIGNMENT */}

                                            <div className="w-full sm:w-72">


                                                {assignment ? (

                                                    <div
                                                        className="flex items-center justify-between gap-3 px-3 py-2 border rounded-md bg-muted/30"
                                                    >

                                                        <div className="flex items-center gap-2">

                                                            <CircleUserRound
                                                                size={16}
                                                                className="text-muted-foreground"
                                                            />

                                                            <div>

                                                                <p className="text-xs text-muted-foreground">

                                                                    Assigned Employee

                                                                </p>

                                                                <p className="text-sm font-medium">

                                                                    {
                                                                        assignment
                                                                            .employee
                                                                            ?.username ||
                                                                        "-"
                                                                    }

                                                                </p>

                                                            </div>

                                                        </div>


                                                        <CheckCircle2
                                                            size={17}
                                                            className="text-green-600"
                                                        />

                                                    </div>

                                                ) : matchingEmployees.length === 0 ? (

                                                    <div
                                                        className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md text-destructive"
                                                    >

                                                        <CircleAlert
                                                            size={16}
                                                        />

                                                        No employee available

                                                    </div>

                                                ) : matchingEmployees.length === 1 ? (

                                                    <div
                                                        className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/30"
                                                    >

                                                        <CircleUserRound
                                                            size={16}
                                                            className="text-muted-foreground"
                                                        />

                                                        <div>

                                                            <p className="text-xs text-muted-foreground">

                                                                Assigned Employee

                                                            </p>

                                                            <p className="text-sm font-medium">

                                                                {
                                                                    matchingEmployees[0]
                                                                        .username
                                                                }

                                                            </p>

                                                        </div>


                                                        <span className="ml-auto text-xs text-muted-foreground">

                                                            Auto

                                                        </span>

                                                    </div>

                                                ) : (

                                                    <select
                                                        className="w-full px-3 text-sm border rounded-md outline-none h-9 bg-background focus:ring-2 focus:ring-ring"
                                                        value={
                                                            selectedEmployees[
                                                            domain._id
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedEmployees(
                                                                prev => ({
                                                                    ...prev,

                                                                    [domain._id]:
                                                                        e.target.value
                                                                })
                                                            )
                                                        }
                                                    >

                                                        <option value="">

                                                            Select employee

                                                        </option>

                                                        {
                                                            matchingEmployees.map(
                                                                employee => (

                                                                    <option
                                                                        key={
                                                                            employee._id
                                                                        }
                                                                        value={
                                                                            employee._id
                                                                        }
                                                                    >

                                                                        {
                                                                            employee.username
                                                                        }

                                                                    </option>

                                                                )
                                                            )
                                                        }

                                                    </select>

                                                )}

                                            </div>

                                        </div>

                                    );

                                }
                            )
                        }

                    </div>



                    {/* ACTIONS */}

                    <div className="flex justify-end pt-4 mt-2 border-t">

                        {!assignmentsCreated && (

                            <Button
                                size="sm"
                                onClick={
                                    handleApproveAssignments
                                }
                            >

                                Confirm Assignments

                            </Button>

                        )}


                        {assignmentsCreated && (

                            <Button
                                size="sm"
                                onClick={() =>
                                    navigate(
                                        `/admin/project/${project._id}/components`
                                    )
                                }
                            >

                                Manage Tasks

                            </Button>

                        )}

                    </div>

                </CardContent>

            </Card>



            {/* ======================================
                PROJECT INFORMATION
            ======================================= */}

            <Card>

                <CardContent className="p-4 sm:p-5">

                    <div className="flex items-center gap-3 mb-4">

                        <div
                            className="flex items-center justify-center rounded-md w-9 h-9 bg-muted"
                        >

                            <BriefcaseBusiness
                                size={17}
                            />

                        </div>

                        <div>

                            <h2 className="text-sm font-semibold">

                                Project Information

                            </h2>

                            <p className="text-xs text-muted-foreground">

                                Additional project details

                            </p>

                        </div>

                    </div>


                    <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">

                        <div>

                            <p className="text-xs text-muted-foreground">

                                Project Name

                            </p>

                            <p className="mt-1 font-medium">

                                {project.name}

                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-muted-foreground">

                                Created By

                            </p>

                            <p className="mt-1 font-medium">

                                {
                                    project.createdBy?.username ||
                                    "-"
                                }

                            </p>

                        </div>


                        <div>

                            <p className="text-xs text-muted-foreground">
                                Created On
                            </p>

                            <p className="mt-1 font-medium">
                                {
                                    project.createdAt
                                        ? new Date(
                                            project.createdAt
                                        ).toLocaleString()
                                        : "-"
                                }
                            </p>

                        </div>

                    </div>

                </CardContent>

            </Card>

        </div>

    );

}