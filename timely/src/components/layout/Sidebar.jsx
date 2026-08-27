import {
  Folder,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Boxes,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(path);
  };

  const getNavClass = (path) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
      isActive(path)
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <aside className="flex flex-col w-64 h-screen px-3 py-5 border-r shrink-0 border-border bg-card text-card-foreground">
      {/* BRAND */}

      <div className="px-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-sm font-bold rounded-lg h-9 w-9 bg-primary text-primary-foreground">
            T
          </div>

          <div>
            <h1 className="text-base font-semibold tracking-wide">TIMELY AI</h1>

            <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground">
              TASK MANAGEMENT
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}

      <nav className="space-y-1">
        <Link to="/admin" className={getNavClass("/admin")}>
          <LayoutDashboard className="h-[18px] w-[18px]" />
          <span>Dashboard</span>
        </Link>

        <Link to="/admin/employees" className={getNavClass("/admin/employees")}>
          <Users className="h-[18px] w-[18px]" />
          <span>Employees</span>
        </Link>

        <Link to="/admin/projects" className={getNavClass("/admin/projects")}>
          <Folder className="h-[18px] w-[18px]" />
          <span>Projects</span>
        </Link>

        <Link to="/admin/domains" className={getNavClass("/admin/domains")}>
          <Settings className="h-[18px] w-[18px]" />
          <span>Domains</span>
        </Link>

        <Link to="/admin/workspace" className={getNavClass("/admin/workspace")}>
          <Boxes className="h-[18px] w-[18px]" />
          <span>Workspace</span>
        </Link>
      </nav>

      {/* BOTTOM */}

      <div className="pt-4 mt-auto border-t border-border">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-[18px] w-[18px]" />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
