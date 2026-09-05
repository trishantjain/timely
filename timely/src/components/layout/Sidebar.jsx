import { useState } from "react";

import {
  Boxes,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const getNavClass = (path) =>
    `group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
      isCollapsed ? "justify-center" : "gap-3"
    } ${
      isActive(path)
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <>
      {/* ================= MOBILE MENU BUTTON ================= */}

      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="
      fixed
      left-2
      top-7
      z-[60]
      flex
      h-7
      w-7
      items-center
      justify-center
      rounded
      text-muted-foreground
      transition-colors
      hover:bg-accent
      hover:text-accent-foreground
      md:hidden
    "
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* ================= MOBILE OVERLAY ================= */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeMobileSidebar}
          className="
            fixed
            inset-0
            z-[60]
            bg-black/50
            md:hidden
          "
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`
          app-sidebar
          fixed
          inset-y-0
          left-0
          z-[70]
          flex
          h-screen
          flex-col
          border-r
          border-border
          bg-card
          text-card-foreground
          shadow-xl
          transition-all
          duration-300
          ease-in-out

          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}

          w-64

          md:static
          md:z-auto
          md:h-screen
          md:translate-x-0
          md:shadow-none

          ${isCollapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* ================= BRAND / HEADER ================= */}

        <div
          className={`
            flex
            items-center
            px-3
            py-4
            ${isCollapsed ? "md:justify-center" : "justify-between"}
          `}
        >
          {/* Brand */}

          <div
            className={`
              flex
              items-center
              min-w-0
              ${isCollapsed ? "md:justify-center" : "gap-3"}
            `}
          >
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-semibold tracking-wide truncate">
                  TIMELY AI
                </h1>

                <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground">
                  TASK MANAGEMENT
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="
              hidden
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
              md:flex
            "
            title={isCollapsed ? "Open Sidebar" : "Close Sidebar"}
            aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>

          {/* Mobile Close Button */}

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-accent-foreground
              md:hidden
            "
            title="Close Sidebar"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="flex-1 px-3 pt-2 space-y-1">
          <Link
            to="/admin"
            onClick={closeMobileSidebar}
            className={getNavClass("/admin")}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          <Link
            to="/admin/employees"
            onClick={closeMobileSidebar}
            className={getNavClass("/admin/employees")}
            title={isCollapsed ? "Employees" : undefined}
          >
            <Users className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Employees</span>}
          </Link>

          <Link
            to="/admin/projects"
            onClick={closeMobileSidebar}
            className={getNavClass("/admin/projects")}
            title={isCollapsed ? "Projects" : undefined}
          >
            <Folder className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Projects</span>}
          </Link>

          <Link
            to="/admin/domains"
            onClick={closeMobileSidebar}
            className={getNavClass("/admin/domains")}
            title={isCollapsed ? "Domains" : undefined}
          >
            <Settings className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Domains</span>}
          </Link>

          <Link
            to="/admin/workspace"
            onClick={closeMobileSidebar}
            className={getNavClass("/admin/workspace")}
            title={isCollapsed ? "Workspace" : undefined}
          >
            <Boxes className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Workspace</span>}
          </Link>

          <Link
            to="/admin/updates"
            onClick={closeMobileSidebar}
            className={getNavClass("/admin/updates")}
            title={isCollapsed ? "Updates" : undefined}
          >
            <NotebookPen className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Updates</span>}
          </Link>
        </nav>

        {/* ================= BOTTOM ================= */}

        <div className="px-3 py-4 mt-auto border-t border-border">
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            className={`
              flex
              w-full
              items-center
              rounded-lg
              px-3
              py-2.5
              text-sm
              font-medium
              text-muted-foreground
              transition-colors
              hover:bg-destructive/10
              hover:text-destructive
              ${isCollapsed ? "md:justify-center" : "gap-3"}
            `}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
