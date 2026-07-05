import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, User } from "lucide-react";

export default function EmployeeList({
    employees = []
}) {
    if (employees.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    No employees found.
                </CardContent>
            </Card>
        );
    }

    return (

        <div className="grid gap-4">

            {employees.map(employee => (

                <Card
                    key={employee._id}
                >
                    <CardContent className="p-5">

                        <div className="flex items-start justify-between">

                            <div>
                                <div className="flex items-center gap-2">

                                    <h2 className="text-lg font-semibold">
                                        {employee.username}
                                    </h2>

                                    <p className="text-muted-foreground">
                                        {employee.email}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">

                                    {employee.expertise.map(domain => (
                                        <Badge
                                            key={domain._id}
                                            style={{
                                                backgroundColor: domain.color,
                                                color: "white"
                                            }}
                                        >
                                            {domain.name}
                                        </Badge>
                                    ))}

                                </div>

                            </div>

                        </div>
                    </CardContent>

                </Card>

            ))}

            {employees.length === 0 && (

                <Card className="p-8 text-center">

                    No employees found.

                </Card>

            )}

        </div>

    );

}