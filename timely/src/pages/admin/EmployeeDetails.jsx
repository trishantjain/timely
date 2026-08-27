import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getEmployeeById } from "@/api/employeeAPI";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  User,
  Mail,
  Pencil,
  Briefcase,
  ChevronRight,
} from "lucide-react";

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading employee information...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl p-4 mx-auto sm:p-6 lg:p-8">
        <button
          onClick={() => navigate("/admin/employees")}
          className="flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </button>

        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const expertiseCount = employee.expertise?.length || 0;

  return (
    <div className="max-w-5xl p-4 mx-auto sm:p-6 lg:p-8">
      {/* BACK */}

      <button
        onClick={() => navigate("/admin/employees")}
        className="flex items-center gap-2 mb-5 text-sm transition-colors text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Employees
      </button>

      {/* EMPLOYEE HEADER */}

      <div className="overflow-hidden border shadow-sm rounded-2xl bg-card">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center min-w-0 gap-4">
            {/* AVATAR */}

            <div className="flex items-center justify-center w-12 h-12 text-base font-semibold border shrink-0 rounded-xl bg-muted/40">
              {employee.username?.charAt(0)?.toUpperCase() || (
                <User size={21} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Employee
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight truncate sm:text-3xl">
                {employee.username}
              </h1>

              <p className="mt-1 text-sm truncate text-muted-foreground">
                {employee.email}
              </p>
            </div>
          </div>

          {/* EDIT BUTTON */}

          <Button
            onClick={() => setEditOpen(true)}
            className="w-full gap-2 sm:w-auto"
          >
            <Pencil size={16} />
            Edit Employee
          </Button>
        </div>

        {/* QUICK INFO */}

        <div className="grid border-t sm:grid-cols-2">
          <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 bg-muted/40">
              <Mail size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email Address</p>

              <p className="text-sm font-medium truncate">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t sm:border-l sm:border-t-0 sm:px-6">
            <div className="flex items-center justify-center border rounded-lg h-9 w-9 bg-muted/40">
              <Briefcase size={17} />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Expertise Areas</p>

              <p className="text-sm font-semibold">
                {expertiseCount} {expertiseCount === 1 ? "Domain" : "Domains"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EMPLOYEE DETAILS */}

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        {/* BASIC INFORMATION */}

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-muted/40">
                  <User size={16} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">Basic Information</h2>

                  <p className="text-xs text-muted-foreground">
                    Employee account details
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y">
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex items-center justify-center border rounded-lg h-9 w-9 shrink-0 bg-muted/30">
                  <User size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Username</p>

                  <p className="mt-0.5 truncate text-sm font-medium">
                    {employee.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex items-center justify-center border rounded-lg h-9 w-9 shrink-0 bg-muted/30">
                  <Mail size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>

                  <p className="mt-0.5 break-all text-sm font-medium">
                    {employee.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EXPERTISE */}

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 border rounded-lg bg-muted/40">
                  <Briefcase size={16} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">Expertise</h2>

                  <p className="text-xs text-muted-foreground">
                    Assigned domains and skills
                  </p>
                </div>
              </div>

              <Badge variant="secondary" className="font-normal">
                {expertiseCount}
              </Badge>
            </div>

            {expertiseCount > 0 ? (
              <div className="divide-y">
                {employee.expertise.map((domain) => (
                  <div
                    key={domain._id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center min-w-0 gap-3">
                      <div
                        className="w-3 h-3 border rounded-full shrink-0"
                        style={{
                          backgroundColor: domain.color || undefined,
                        }}
                      />

                      <p className="text-sm font-medium truncate">
                        {domain.name}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <div className="flex items-center justify-center w-10 h-10 mx-auto border rounded-xl bg-muted/40">
                  <Briefcase size={18} className="text-muted-foreground" />
                </div>

                <h3 className="mt-3 text-sm font-medium">
                  No expertise assigned
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add expertise domains to this employee.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 mt-4"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil size={14} />
                  Edit Employee
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* EDIT DIALOG */}

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
