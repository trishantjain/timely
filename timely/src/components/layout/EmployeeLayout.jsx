import { Outlet } from "react-router-dom";

import EmployeeSidebar from "./EmployeeSidebar";
import Navbar from "./Navbar";

export default function EmployeeLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">

            {/* SIDEBAR */}
            <EmployeeSidebar />

            {/* MAIN AREA */}
            <div className="flex flex-col flex-1 min-w-0">

                {/* FIXED TOP NAVIGATION */}
                <div className="sticky top-0 z-50 shrink-0">
                    <Navbar />
                </div>

                {/* SCROLLABLE PAGE CONTENT */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}
