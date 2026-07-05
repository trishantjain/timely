import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getEmployees } from "@/api/employeeAPI";
import { getProjectById } from "@/api/projectAPI";

export default function Assignments() {

    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedAssignments, setSelectedAssignments] = useState({});

    const fetchProject = async () => {
        try {
            const res = await getProjectById(id);
            setProject(res.data);
            console.log("Project:", res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees();
            setEmployees(res.data.data);
            console.log("Fetched employees:", res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProject();
        fetchEmployees();
    }, [id]);

    return (

        <div className="space-y-6">

            <div>

                <h1 className="text-3xl font-bold">
                    Assign Employees
                </h1>

                <p className="text-gray-500">
                    Assign one employee to each project domain.
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
                // console.log(
                //     employees.map(emp => ({
                //         username: emp.username,
                //         expertise: emp.expertise
                //     }))
                // );

            <div
                key={domain._id}
                className="p-5 bg-white border rounded-lg"
            >

                <h3 className="text-lg font-semibold">
                    {domain.name}
                </h3>

                <p className="text-sm text-gray-500">
                    Select employee for this domain
                </p>

                <select
                    className="w-full p-2 mt-4 border rounded-lg"
                    value={selectedAssignments[domain._id] || ""}
                    onChange={(e) =>
                        setSelectedAssignments(prev => ({
                            ...prev,
                            [domain._id]: e.target.value
                        }))
                    }
                >

                    <option value="">
                        Select Employee
                    </option>

                    {employees
                        .filter(employee =>
                            employee.expertise.some(
                                exp => exp._id === domain._id
                            )
                        )
                        .map(employee => (

                            <option
                                key={employee._id}
                                value={employee._id}
                            >
                                {employee.username}
                            </option>

                        ))}

                </select>

            </div>

            ))}

            <pre className="p-4 bg-gray-100 rounded">
                {JSON.stringify(selectedAssignments, null, 2)}
            </pre>

        </div>

    );

}