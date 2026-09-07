import { useCallback, useEffect, useState } from "react";

import { getProjectById } from "@/api/projectAPI";
import { getProjectModules } from "@/api/projectModuleAPI";
import { getProjectMembers } from "@/api/projectMemberAPI";
import { getComponentTemplates } from "@/api/componentTemplateAPI";
import {
  getProjectComponents,
  addProjectComponent,
  deleteProjectComponent,
  updateProjectComponent,
  assignTask,
  addManualTask,
  addManualTaskToProject,
  addSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
} from "@/api/projectComponentAPI";

// ==========================================
// SERVER-STATE HOOK
//
// Owns every piece of data that comes from the backend (project,
// project Work Packages/tasks, predefined Work Package templates,
// modules, project members) plus the mutations that touch them.
//
// UI-only state (selected domain tab, expanded/collapsed items,
// open dialogs, etc.) intentionally lives in the components that use
// it, NOT here — see ProjectWork.jsx.
// ==========================================
export default function useProjectWork(projectId) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [components, setComponents] = useState([]);
  const [componentTemplates, setComponentTemplates] = useState([]);
  const [modules, setModules] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);

      const [projectRes, componentsRes, templatesRes, modulesRes, membersRes] =
        await Promise.all([
          getProjectById(projectId),
          getProjectComponents(projectId),
          getComponentTemplates(),
          getProjectModules(),
          getProjectMembers(projectId),
        ]);

      setProject(projectRes.data);
      setComponents(componentsRes.data?.data || []);
      setComponentTemplates(templatesRes.data?.data || []);
      setModules(modulesRes.data?.data || []);
      setProjectMembers(membersRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load project work data:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Refetch only the parts that can change after a mutation, without
  // flashing the whole page back to a loading state.
  const refreshComponents = useCallback(async () => {
    const res = await getProjectComponents(projectId);
    setComponents(res.data?.data || []);
  }, [projectId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ==========================================
  // MUTATIONS
  //
  // Every mutation reuses an existing backend endpoint. None of them
  // mutate local component state directly — they always refetch the
  // project's components afterwards so the server stays the single
  // source of truth (see spec section 16/20).
  // ==========================================

  // Select (add) a predefined Work Package to the project. The
  // backend generates its default Tasks and rejects duplicates.
  const selectWorkPackage = useCallback(
    async (componentTemplateId) => {
      await addProjectComponent({ projectId, componentTemplateId });
      await refreshComponents();
    },
    [projectId, refreshComponents],
  );

  // Remove a Work Package (and all of its Tasks) from the project.
  // Only removes this project's snapshot — the predefined template
  // is untouched.
  const removeWorkPackage = useCallback(
    async (componentId) => {
      await deleteProjectComponent(componentId);
      await refreshComponents();
    },
    [refreshComponents],
  );

  // Rename/describe a Work Package, or replace its task list (used
  // for editing tasks and for deleting a single generated task).
  const saveWorkPackage = useCallback(
    async (componentId, payload) => {
      await updateProjectComponent(componentId, payload);
      await refreshComponents();
    },
    [refreshComponents],
  );

  // Remove a single generated/manual Task from a Work Package without
  // touching any other task's assignment, deadline, status or
  // subtasks (the backend preserves those for tasks it already knows
  // about — see updateProjectComponent).
  const deleteTask = useCallback(
    async (component, taskId) => {
      const remainingTasks = (component.tasks || [])
        .filter((task) => task._id !== taskId)
        .map((task, index) => ({
          _id: task._id,
          templateTaskId: task.templateTaskId || null,
          title: task.title,
          description: task.description || "",
          displayOrder: index + 1,
          required: task.required ?? false,
          submissionRule: task.submissionRule || { type: "TEXT" },
        }));

      await updateProjectComponent(component._id, {
        name: component.name,
        description: component.description || "",
        tasks: remainingTasks,
      });

      await refreshComponents();
    },
    [refreshComponents],
  );

  const assignEmployee = useCallback(
    async (componentId, taskId, { projectMemberId, deadline }) => {
      await assignTask(componentId, taskId, { projectMemberId, deadline });
      await refreshComponents();
    },
    [refreshComponents],
  );

  // Manually add a project-specific task under a Work Package.
  const addTask = useCallback(
    async (componentId, data) => {
      await addManualTask(componentId, data);
      await refreshComponents();
    },
    [refreshComponents],
  );

  // Manually add a task with no Work Package at all (used only when
  // a domain has nothing selected yet). Reuses the backend's
  // auto-created "Manual Tasks" container.
  const addTaskWithoutWorkPackage = useCallback(
    async (data) => {
      await addManualTaskToProject(projectId, data);
      await refreshComponents();
    },
    [projectId, refreshComponents],
  );

  const addTaskSubtask = useCallback(
    async (componentId, taskId, data) => {
      await addSubtask(componentId, taskId, data);
      await refreshComponents();
    },
    [refreshComponents],
  );

  const toggleSubtask = useCallback(
    async (componentId, taskId, subtaskId, completed) => {
      await toggleSubtaskCompletion(componentId, taskId, subtaskId, completed);
      await refreshComponents();
    },
    [refreshComponents],
  );

  const removeSubtask = useCallback(
    async (componentId, taskId, subtaskId) => {
      await deleteSubtask(componentId, taskId, subtaskId);
      await refreshComponents();
    },
    [refreshComponents],
  );

  return {
    loading,
    project,
    components,
    componentTemplates,
    modules,
    projectMembers,

    reload: loadAll,
    refreshComponents,

    selectWorkPackage,
    removeWorkPackage,
    saveWorkPackage,
    deleteTask,
    assignEmployee,
    addTask,
    addTaskWithoutWorkPackage,
    addTaskSubtask,
    toggleSubtask,
    removeSubtask,
  };
}
