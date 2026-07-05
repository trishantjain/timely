import { useEffect, useState } from "react";

import { getEmployees } from "@/api/employeeAPI";

import EmployeeList from "@/components/dashboard/EmployeeList";
import CreateEmployeeDialog from "@/components/dashboard/CreateEmployeeDialog";

export default function Employees() {

    const [employees, setEmployees] = useState([]);
    // const [sidebarOpen, setSidebarOpen] = useState(false);

    const fetchEmployees = async () => {

        try {
            const res = await getEmployees();
            setEmployees(res.data.data);

        } catch (err) {
            console.error(err);
        }

    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    return (

        <div className="flex w-full min-h-screen bg-muted/30">

            {/* Mobile Sidebar */}
            {/* {sidebarOpen && ( */}
{/* 
                // <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
                //     <div className="w-64 h-full bg-white">
                //         <Sidebar />
                //     </div>
                // </div> */}

            {/* // )} */}

            {/* Desktop Sidebar */}
{/* 
            <div className="hidden w-64 border-r shrink-0 bg-background lg:block">
                <Sidebar />
            </div> */}

            {/* Main */}

            <div className="flex flex-col flex-1">

                {/* <Header
                    toggleSidebar={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                /> */}

                <div className="flex-1 p-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h1 className="text-3xl font-bold">

                                Employees

                            </h1>

                            <p className="text-muted-foreground">

                                Manage your employees

                            </p>

                        </div>

                        <CreateEmployeeDialog
                            refreshEmployees={fetchEmployees}
                        />

                    </div>

                    <EmployeeList
                        employees={employees}
                    />

                </div>

            </div>

        </div>
    );

}