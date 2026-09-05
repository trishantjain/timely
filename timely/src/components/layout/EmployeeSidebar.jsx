import { useEffect, useMemo, useState } from "react";

import {
  ChevronDown,
  ClipboardList,
  Folder,
  FolderKanban,
  Loader2,
  LogOut,
  Menu,
  NotebookPen,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

import { getMyProjects } from "@/api/assignmentAPI";

export default function EmployeeSidebar() {
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // PROJECT LIST (for the "assigned projects" navigation section)
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      try {
        setProjectsLoading(true);

        // REUSE THE EXISTING "MY PROJECTS" API — NO NEW ENDPOINT NEEDED
        const res = await getMyProjects();

        if (isMounted) {
          setProjects(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Failed to load sidebar projects:", err);

        if (isMounted) {
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setProjectsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // CURRENTLY ACTIVE PROJECT ID, DERIVED FROM THE URL
  // Handles: /dashboard/project/:id  and  /employee/tasks/:projectId (single-segment form)
  const activeProjectId = useMemo(() => {
    const projectDetailsMatch = location.pathname.match(
      /^\/dashboard\/project\/([^/]+)/,
    );

    if (projectDetailsMatch) {
      return projectDetailsMatch[1];
    }

    const filteredTasksMatch = location.pathname.match(
      /^\/employee\/tasks\/([^/]+)$/,
    );

    if (filteredTasksMatch) {
      return filteredTasksMatch[1];
    }

    return null;
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
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

  const getProjectNavClass = (projectId) =>
    `group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
      isCollapsed ? "justify-center" : "gap-3"
    } ${
      activeProjectId === projectId
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
                  EMPLOYEE WORKSPACE
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

        <nav className="flex flex-col flex-1 px-3 pt-2 space-y-1 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={closeMobileSidebar}
            className={getNavClass("/dashboard")}
            title={isCollapsed ? "My Projects" : undefined}
          >
            <FolderKanban className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>My Projects</span>}
          </Link>

          <Link
            to="/employee/tasks"
            onClick={closeMobileSidebar}
            className={getNavClass("/employee/tasks")}
            title={isCollapsed ? "My Tasks" : undefined}
          >
            <ClipboardList className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>My Tasks</span>}
          </Link>

          <Link
            to="/employee/updates"
            onClick={closeMobileSidebar}
            className={getNavClass("/employee/updates")}
            title={isCollapsed ? "Updates" : undefined}
          >
            <NotebookPen className="h-[18px] w-[18px] flex-shrink-0" />

            {!isCollapsed && <span>Updates</span>}
          </Link>

          {/* ================= ASSIGNED PROJECTS ================= */}

          <div className="pt-3 mt-2 border-t border-border">
            {/* SECTION HEADER / COLLAPSE TOGGLE */}

            {isCollapsed ? (
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-center uppercase text-muted-foreground">
                Projects
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setProjectsOpen((prev) => !prev)}
                className="flex items-center justify-between w-full px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground"
                aria-expanded={projectsOpen}
              >
                <span>Your Projects</span>

                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    projectsOpen ? "" : "-rotate-90"
                  }`}
                />
              </button>
            )}

            {(isCollapsed || projectsOpen) && (
              <div className="space-y-1">
                {/* LOADING STATE */}

                {projectsLoading && (
                  <div
                    className={`flex items-center px-3 py-2 text-xs text-muted-foreground ${
                      isCollapsed ? "justify-center" : "gap-2"
                    }`}
                  >
                    <Loader2 className="h-3.5 w-3.5 flex-shrink-0 animate-spin" />

                    {!isCollapsed && <span>Loading projects…</span>}
                  </div>
                )}

                {/* EMPTY STATE */}

                {!projectsLoading && projects.length === 0 && !isCollapsed && (
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    No projects assigned yet.
                  </p>
                )}

                {/* PROJECT LIST */}

                {!projectsLoading &&
                  projects.map((assignment) => {
                    const project = assignment.project;

                    if (!project) return null;

                    return (
                      <Link
                        key={project._id}
                        to={`/dashboard/project/${project._id}`}
                        onClick={closeMobileSidebar}
                        className={getProjectNavClass(project._id)}
                        title={project.name}
                      >
                        <Folder className="h-4 w-4 flex-shrink-0" />

                        {!isCollapsed && (
                          <span className="truncate">{project.name}</span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            )}
          </div>
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
