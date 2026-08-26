import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getEmployeeById } from "@/api/employeeAPI";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { ArrowLeft, User, Mail, Pencil, Briefcase } from "lucide-react";

import EditEmployeeDialog from "@/components/dashboard/EditEmployeeDialog";

export default function EmployeeDetails() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [editOpen, setEditOpen] = useState(false);

    const loadEmployee = async () => {
        try {
            setLoading(true);

            setError("");

            const res = await getEmployeeById(id);

            setEmployee(res.data.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message || "Failed to load employee information.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEmployee();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-sm text-muted-foreground">
                    Loading employee information...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl p-6 mx-auto">
                <Button
                    variant="ghost"
                    className="gap-2"
                    onClick={() => navigate("/admin/employees")}
                >
                    <ArrowLeft size={16} />
                    Back to Employees
                </Button>

                <div className="p-6 mt-6 border rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            </div>
        );
    }

    if (!employee) {
        return null;
    }

    return (
        <div className="max-w-5xl p-6 mx-auto lg:p-8">
            {/* BACK BUTTON */}

            <Button
                variant="ghost"
                className="gap-2 mb-6"
                onClick={() => navigate("/admin/employees")}
            >
                <ArrowLeft size={16} />
                Back to Employees
            </Button>

            {/* HEADER */}

            <div className="flex flex-col gap-5 pb-6 border-b sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {/* AVATAR */}

                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
                        <User size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {employee.username}
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">Employee</p>
                    </div>
                </div>
                {/* EDIT BUTTON */}
                <Button onClick={() => setEditOpen(true)}>
                    <Pencil size={16} />
                    Edit Employee
                </Button>{" "}
            </div>

            {/* EMPLOYEE INFORMATION */}

            <div className="grid gap-5 mt-6 md:grid-cols-2">
                {/* BASIC INFORMATION */}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* USERNAME */}

                        <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                                Username
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <User size={16} className="text-muted-foreground" />

                                <p className="text-sm font-medium">{employee.username}</p>
                            </div>
                        </div>

                        {/* EMAIL */}

                        <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                                Email
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <Mail size={16} className="text-muted-foreground" />

                                <p className="text-sm font-medium break-all">
                                    {employee.email}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* EXPERTISE */}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Briefcase size={17} />
                            Expertise
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {employee.expertise?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {employee.expertise.map((domain) => (
                                    <Badge
                                        key={domain._id}
                                        style={{
                                            backgroundColor: domain.color,
                                            color: "white",
                                        }}
                                    >
                                        {domain.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No expertise assigned.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditEmployeeDialog
                employee={employee}
                open={editOpen}
                onOpenChange={setEditOpen}
                onUpdated={(updatedEmployee) => {

                    setEmployee(updatedEmployee);

                }}
            />
        </div>
    );
}
