import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent } from "@/components/ui/card";

import { Mail, User, ChevronRight } from "lucide-react";

export default function EmployeeList({ employees = [] }) {
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User size={32} className="mx-auto mb-3 text-muted-foreground" />

          <p className="text-sm text-muted-foreground">No employees found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
            "
    >
      {employees.map((employee) => (
        <Card
          key={employee._id}
          className="
                        group
                        transition-all
                        hover:shadow-md
                        hover:-translate-y-0.5
                    "
        >
          <CardContent className="p-5">
            {/* EMPLOYEE HEADER */}

            <div className="flex items-center gap-3">
              {/* AVATAR */}

              <div
                className="
                                    flex
                                    items-center
                                    justify-center
                                    w-10
                                    h-10
                                    border
                                    rounded-full
                                    bg-muted
                                    shrink-0
                                "
              >
                <User size={19} className="text-muted-foreground" />
              </div>

              {/* NAME + EMAIL */}

              <div className="min-w-0">
                <button
                  onClick={() => navigate(`/admin/employees/${employee._id}`)}
                  className="
                                        block
                                        max-w-full
                                        font-semibold
                                        text-left
                                        truncate
                                        transition-colors
                                        hover:text-primary
                                    "
                >
                  {employee.username}
                </button>

                <div
                  className="
                                        flex
                                        items-center
                                        gap-1.5
                                        mt-1
                                        text-sm
                                        text-muted-foreground
                                    "
                >
                  <Mail size={14} />

                  <span className="truncate">{employee.email}</span>
                </div>
              </div>
            </div>

            {/* EXPERTISE */}

            <div className="flex flex-wrap gap-2 mt-5">
              {employee.expertise?.length > 0 ? (
                employee.expertise.map((domain) => (
                  <Badge
                    key={domain._id}
                    style={{
                      backgroundColor: domain.color,
                      color: "white",
                    }}
                  >
                    {domain.name}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No expertise assigned
                </span>
              )}
            </div>

            {/* VIEW DETAILS */}

            <button
              onClick={() => navigate(`/admin/employees/${employee._id}`)}
              className="
                                flex
                                items-center
                                gap-1
                                mt-6
                                text-sm
                                font-medium
                                transition-colors
                                text-muted-foreground
                                hover:text-primary
                            "
            >
              View Details
              <ChevronRight
                size={16}
                className="
                                    transition-transform
                                    group-hover:translate-x-1
                                "
              />
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
