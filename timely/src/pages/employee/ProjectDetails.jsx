import { getProjectById } from "@/api/projectAPI";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";

import {
    ArrowLeft,
    FileText,
    FolderKanban,
    ClipboardList
} from "lucide-react";


export default function EmployeeProjectDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [project, setProject] = useState(null);


    const loadProject = async () => {

        try {

            const res = await getProjectById(id);

            setProject(res.data);

        }
        catch (err) {

            console.error(err);

        }

    };


    useEffect(() => {

        loadProject();

    }, []);


    if (!project) {

        return (

            <div className="flex items-center justify-center p-8 min-h-[50vh]">

                <p className="text-sm text-muted-foreground">
                    Loading project...
                </p>

            </div>

        );

    }


    return (

        <div className="max-w-6xl p-6 mx-auto lg:p-8">


            {/* NAVIGATION */}

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-6 text-sm transition-colors text-muted-foreground hover:text-foreground"
            >

                <ArrowLeft size={16} />

                Back to Projects

            </button>


            {/* PROJECT HEADER */}

            <Card className="overflow-hidden">


                <CardContent className="p-6 lg:p-8">


                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">


                        <div className="flex gap-4">


                            <div className="flex items-center justify-center w-12 h-12 border rounded-xl bg-muted shrink-0">

                                <FolderKanban size={22} />

                            </div>


                            <div>


                                <p className="mb-2 text-sm text-muted-foreground">

                                    Project

                                </p>


                                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">

                                    {project.name}

                                </h1>


                                <p className="max-w-3xl mt-3 leading-6 text-muted-foreground">

                                    {
                                        project.description ||
                                        "No project description available."
                                    }

                                </p>


                            </div>


                        </div>


                    </div>


                </CardContent>


            </Card>


            {/* PROJECT WORKSPACE */}

            <div className="grid gap-6 mt-6">


                <Card>


                    <CardContent className="p-6">


                        <div className="flex items-start gap-4">


                            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted shrink-0">

                                <FileText size={19} />

                            </div>


                            <div className="flex-1">


                                <h2 className="text-lg font-semibold">

                                    Assigned Documents

                                </h2>


                                <p className="mt-1 text-sm text-muted-foreground">

                                    Documents and templates assigned to you for this project will appear here.

                                </p>


                                {/* EMPTY STATE */}

                                <div className="flex flex-col items-center justify-center py-12 mt-5 text-center border border-dashed rounded-xl bg-muted/20">


                                    <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-background">

                                        <FileText
                                            size={21}
                                            className="text-muted-foreground"
                                        />

                                    </div>


                                    <h3 className="mt-4 font-medium">

                                        No documents assigned yet

                                    </h3>


                                    <p className="max-w-sm mt-1 text-sm text-muted-foreground">

                                        When your project manager assigns a document or template, it will appear here.

                                    </p>


                                </div>


                            </div>


                        </div>


                    </CardContent>


                </Card>


                <Card>


                    <CardContent className="p-6">


                        <div className="flex items-start gap-4">


                            <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-muted shrink-0">

                                <ClipboardList size={19} />

                            </div>


                            <div>


                                <h2 className="text-lg font-semibold">

                                    My Project Tasks

                                </h2>


                                <p className="mt-1 text-sm text-muted-foreground">

                                    View and manage tasks assigned to you under this project.

                                </p>


                                <Button
                                    variant="outline"
                                    className="mt-5"
                                    onClick={() =>
                                        navigate("/employee/tasks")
                                    }
                                >

                                    View My Tasks

                                </Button>


                            </div>


                        </div>


                    </CardContent>


                </Card>


            </div>


        </div>

    );

}