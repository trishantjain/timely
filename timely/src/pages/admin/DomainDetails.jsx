import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { getDomainById } from "@/api/domainAPI";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ArrowLeft, Pencil, Circle } from "lucide-react";

export default function DomainDetails() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [domain, setDomain] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const loadDomain = async () => {
        try {
            setLoading(true);

            setError("");

            const res = await getDomainById(id);

            setDomain(res.data.data);
        } catch (err) {
            console.error(err);

            setError(err.response?.data?.message || "Failed to load domain.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDomain();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-sm text-muted-foreground">
                    Loading domain information...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl p-6 mx-auto">
                <Button variant="ghost" onClick={() => navigate("/admin/domains")}>
                    <ArrowLeft size={16} />
                    Back to Domains
                </Button>

                <div className="p-6 mt-6 border rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            </div>
        );
    }

    if (!domain) {
        return null;
    }

    return (
        <div className="max-w-4xl p-6 mx-auto lg:p-8">
            {/* BACK */}

            <Button
                variant="ghost"
                className="gap-2 mb-6"
                onClick={() => navigate("/admin/domains")}
            >
                <ArrowLeft size={16} />
                Back to Domains
            </Button>

            {/* HEADER */}

            <div className="flex flex-col gap-5 pb-6 border-b sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {/* DOMAIN COLOR */}

                    <div
                        className="w-12 h-12 border rounded-xl shrink-0"
                        style={{
                            backgroundColor: domain.color,
                        }}
                    />

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{domain.name}</h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Domain Information
                        </p>
                    </div>
                </div>

                <Button>
                    <Pencil size={16} />
                    Edit Domain
                </Button>
            </div>

            {/* DOMAIN INFORMATION */}

            <div className="grid gap-5 mt-6 md:grid-cols-2">
                {/* BASIC INFORMATION */}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                                Domain Name
                            </p>

                            <p className="mt-2 text-sm font-medium">{domain.name}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                                Status
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <Circle
                                    size={10}
                                    fill={domain.isActive ? "currentColor" : "currentColor"}
                                    className={
                                        domain.isActive ? "text-green-500" : "text-muted-foreground"
                                    }
                                />

                                <p className="text-sm font-medium">
                                    {domain.isActive ? "Active" : "Inactive"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* DESCRIPTION */}

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {domain.description || "No description added."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
