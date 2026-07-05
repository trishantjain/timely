import { getEmployees } from "@/api/employeeAPI";
import { getProjectById } from "@/api/projectAPI";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Assignment() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedAssignments, setSelectedAssignments] = useState({});


    const fetchProject = async () => {
        try {
            const res = await getProjectById(id);
            setProject(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees();
            setEmployees(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProject();
        fetchEmployees();
    }, []);

    return (

        <div className="space-y-6">

            <div>
                <h1 className="text-3xl font-bold">
                    Assign Employees
                </h1>

                <p className="text-gray-500">
                    Assign employees to each project domain.
                </p>
            </div>

            {project && (

                <div className="p-6 bg-white border rounded-lg">

                    <h2 className="text-2xl font-semibold">
                        {project.name}
                    </h2>

                    <p className="mt-2 text-gray-500">
                        {project.description}
                    </p>

                </div>

            )}

            {project?.domains?.map((domain) => (

                <div
                    key={domain._id}
                    className="p-5 bg-white border rounded-lg"
                >

                    <h3 className="text-lg font-semibold">
                        {domain.name}
                    </h3>

                    <p className="text-gray-500">
                        Select employee for this domain
                    </p>

                </div>

            ))}

        </div>

    );

}