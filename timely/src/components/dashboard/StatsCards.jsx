import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


export default function StatsCards({ stats = {}}) {
    const cards = [
        {
            label: "Active Projects",
            value: stats.projects
        },
        {
            label: "Pending Tasks",
            value: stats.pending
        },
        {
            label: "Completed",
            value: stats.completed
        },
        {
            label: "Alerts",
            value: stats.alerts
        }
    ]


    return (

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {cards.map((card) => (
                <Card key={card.label}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{card.value}</div>
                    </CardContent>
                </Card>
            ))}

        </div>

    )
}