import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
    { label: "Active Projects", value: 12, hint: "2 less than last week" },
    { label: "Pending Tasks", value: 48, hint: "7 due today" },
    { label: "Completed", value: 156, hint: "85% task efficiency" },
    { label: "Alerts", value: 3, hint: "Overdue assignments" },
]

export default function StatsCards() {

    return (

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {stats.map((s) => (
                <Card key={s.label}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {s.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{s.value}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                    </CardContent>
                </Card>
            ))}

        </div>

    )
}