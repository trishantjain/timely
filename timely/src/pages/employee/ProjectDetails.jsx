import { getProjectById } from "@/api/projectAPI";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EmployeeProjectDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);

    const loadProject = async () => {

        try {
            const res = await getProjectById(id);
            setProject(res.data);
        } catch (err) {
            console.error(err);
        }

    };

    useEffect(() => {
        loadProject();
    }, []);

    if (!project) {

        return (
            <div className="p-8">
                Loading...
            </div>
        );

    }

    return (

        <div className="max-w-6xl p-8 mx-auto">

            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 mb-6 border rounded-lg"
            >
                ← Back
            </button>

            <div className="p-6 bg-white border rounded-xl">

                <h1 className="text-3xl font-bold">
                    {project.name}
                </h1>

                <p className="mt-3 text-gray-500">
                    {project.description}
                </p>

            </div>

            <div className="p-6 mt-6 bg-white border rounded-xl">

                <h2 className="text-xl font-semibold">
                    Assigned Documents
                </h2>

                <p className="mt-4 text-gray-500">
                    No documents assigned yet.
                </p>

            </div>

        </div>

    );
}