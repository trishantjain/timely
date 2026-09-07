import Project from "../../models/project/Project.js";
import ProjectModule from "../../models/project/ProjectModule.js";
import ComponentTemplate from "../../models/template/ComponentTemplate.js";
import ProjectComponent from "../../models/project/ProjectComponent.js";
import User from "../../models/auth/User.js";
import ProjectMember from "../../models/project/ProjectMember.js";
import Submission from "../../models/submission/Submission.js";
import mongoose from "mongoose";

// =========================================
// ADD COMPONENT TO PROJECT (SNAPSHOT)
// =========================================
export const addProjectComponent = async (req, res) => {
  // console.log("\n========================================");
  // console.log("[ProjectComponent] Add Component");
  // console.log(req.body);
  // console.log("========================================");

  try {
    const { projectId, componentTemplateId } = req.body;

    // Validate Project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Fetch Template
    const template = await ComponentTemplate.findById(componentTemplateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Component Template not found.",
      });
    }

    // Prevent duplicate
    const exists = await ProjectComponent.findOne({
      project: projectId,
      componentTemplate: componentTemplateId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Component already added to this project.",
      });
    }

    const tasks = template.tasks.map((task) => ({
      templateTaskId: task._id,
      title: task.title,
      description: task.description,
      displayOrder: task.displayOrder,
      required: task.required,
      submissionRule: task.submissionRule,
      assignedEmployee: null,
      deadline: null,
      status: "PENDING",
      // Snapshot the template task's default subtasks the same way
      // the task itself is snapshotted from the template.
      subtasks: (task.subtasks || []).map((subtask) => ({
        templateSubtaskId: subtask._id,
        title: subtask.title,
        description: subtask.description || "",
        displayOrder: subtask.displayOrder || 1,
        completed: false,
      })),
    }));

    // Create Snapshot
    const component = await ProjectComponent.create({
      project: projectId,
      projectModule: template.projectModule,
      componentTemplate: template._id,
      name: template.name,
      description: template.description,
      tasks,
      createdBy: req.user.id,
    });

    console.log("[ProjectComponent] Snapshot Created :", component._id);

    res.status(201).json({
      success: true,
      message: "Component added successfully.",
      data: component,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// =========================================
// GET PROJECT COMPONENTS
// =========================================
export const getProjectComponents = async (req, res) => {
  try {
    const { projectId } = req.params;

    const components = await ProjectComponent.find({
      project: projectId,
    })
      // Primary module relation
      .populate({
        path: "projectModule",
        select: "name description color domain",
        populate: {
          path: "domain",
          select: "name color description isActive",
        },
      })

      // Fallback for old/existing component snapshots
      .populate({
        path: "componentTemplate",
        select: "projectModule",
        populate: {
          path: "projectModule",
          select: "name description color domain",
          populate: {
            path: "domain",
            select: "name color description isActive",
          },
        },
      })

      .populate("tasks.assignedEmployee", "username email")
      .sort({
        createdAt: 1,
      })
      .lean();

    const formattedComponents = components.map((component) => {
      // First use the project's stored module
      let projectModule = component.projectModule;

      // Fallback to component template module
      if (!projectModule && component.componentTemplate?.projectModule) {
        projectModule = component.componentTemplate.projectModule;
      }

      const domain = projectModule?.domain || null;

      return {
        ...component,

        // Explicit values for frontend filtering
        resolvedProjectModuleId: projectModule?._id?.toString() || null,

        resolvedDomainId:
          domain?._id?.toString() ||
          (typeof domain === "string" ? domain : null),

        resolvedDomain: domain || null,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedComponents,
    });
  } catch (err) {
    console.error("getProjectComponents error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// ASSIGN TASK TO EMPLOYEE
// =========================================
export const assignTaskToEmployee = async (req, res) => {
  console.log("\n========================================");
  console.log("[ProjectComponent] Assign Task");
  console.log("Params :", req.params);
  console.log("Body :", req.body);
  console.log("========================================");

  try {
    const { componentId, taskId } = req.params;
    const { projectMemberId, deadline } = req.body;

    // Validate Project Member
    const member = await ProjectMember.findById(projectMemberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Project member not found.",
      });
    }

    // console.log("\n===== PROJECT MEMBER =====");
    // console.log(member);

    // Validate Component
    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project Component not found.",
      });
    }

    // console.log("\n===== COMPONENT FOUND =====");
    // console.log("Component ID:", component._id.toString());

    console.log("\n===== TASKS IN COMPONENT =====");
    component.tasks.forEach((t, index) => {
      console.log({
        index,
        id: t._id.toString(),
        title: t.title,
        assignedEmployee: t.assignedEmployee,
        deadline: t.deadline,
        status: t.status,
      });
    });

    // Ensure member belongs to this project
    if (member.project.toString() !== component.project.toString()) {
      return res.status(400).json({
        success: false,
        message: "Project member does not belong to this project.",
      });
    }

    // console.log("\nRequested Task ID:", taskId);

    // Find Task
    const task = component.tasks.id(taskId);

    if (!task) {
      console.log("❌ Task NOT FOUND");

      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // console.log("\n===== BEFORE ASSIGNMENT =====");
    // console.log(task.toObject());

    // Assign
    task.assignedEmployee = member.employee;
    task.deadline = deadline;

    // console.log("\n===== AFTER ASSIGNMENT (BEFORE SAVE) =====");
    // console.log(task.toObject());

    await component.save();

    // console.log("\n===== SAVE COMPLETED =====");

    // Reload from MongoDB
    const updatedComponent = await ProjectComponent.findById(componentId);

    const updatedTask = updatedComponent.tasks.id(taskId);

    // console.log("\n===== TASK AFTER RELOADING FROM DB =====");

    // if (updatedTask) {
    //     console.log(updatedTask.toObject());
    // } else {
    //     console.log("❌ Task missing after reload");
    // }

    // console.log("[ProjectComponent] Task Assigned Successfully");

    return res.json({
      success: true,
      message: "Task assigned successfully.",
      data: updatedTask || task,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// GET MY TASKS
// =========================================
export const getMyTasks = async (req, res) => {
  console.log("\n========================================");
  console.log("[ProjectComponent] Get My Tasks");
  console.log("Employee :", req.user.id);
  console.log("Project :", req.query.projectId || "ALL PROJECTS");
  console.log("========================================");

  try {
    const { projectId } = req.query;

    // =========================================
    // BUILD QUERY
    //
    // A task should show up in an employee's task list if they are
    // EITHER the primary assignee OR they have been tagged on the
    // task by someone else. Previously this only matched
    // "tasks.assignedEmployee", so a tagged employee's component
    // never even got fetched from the database — the fix has to
    // happen at both the query level and the per-task filter below.
    // =========================================

    const query = {
      $or: [
        { "tasks.assignedEmployee": req.user.id },
        { "tasks.tags.employee": req.user.id },
      ],
    };

    // If projectId is provided, restrict tasks
    // only to that project.
    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      query.project = projectId;
    }

    // =========================================
    // FIND COMPONENTS
    // =========================================

    const components = await ProjectComponent.find(query)
      .populate("project", "name")
      .populate("projectModule", "name")
      .populate("tasks.assignedEmployee", "username email");

    console.log(`[ProjectComponent] Components found: ${components.length}`);

    const myTasks = [];

    // =========================================
    // EXTRACT ONLY EMPLOYEE TASKS
    // =========================================

    for (const component of components) {
      if (!component.project) {
        console.error(
          "[Get My Tasks] Project not found for component:",
          component._id.toString(),
        );

        continue;
      }

      // NOTE: projectModule can legitimately be null — the
      // auto-created "Manual Tasks" container (see
      // addManualTaskToProject) is created with projectModule: null
      // on purpose, for tasks that aren't tied to any work item.
      // Skipping the whole component whenever projectModule was
      // missing meant employees could never see a manual task
      // assigned to them through that container — so this only logs
      // now, it doesn't drop the component's tasks.
      if (!component.projectModule) {
        console.log(
          "[Get My Tasks] Component has no Project Module (likely a manual-tasks container):",
          component._id.toString(),
        );
      }

      for (const task of component.tasks) {
        // =========================================
        // EMPLOYEE CHECK
        //
        // A task belongs in this employee's list if they are the
        // primary assignee OR if they appear in the task's `tags`
        // array (i.e. someone tagged/looped them in on it).
        // =========================================

        const isAssignedToEmployee =
          task.assignedEmployee &&
          task.assignedEmployee._id.toString() === req.user.id.toString();

        const myTag = (task.tags || []).find(
          (tag) => tag.employee && tag.employee.toString() === req.user.id.toString(),
        );

        const isTaggedToEmployee = Boolean(myTag);

        // =========================================
        // PROJECT CHECK
        // Extra safety check
        // =========================================

        const belongsToRequestedProject =
          !projectId ||
          component.project._id.toString() === projectId.toString();

        if (
          (isAssignedToEmployee || isTaggedToEmployee) &&
          belongsToRequestedProject
        ) {
          myTasks.push({
            projectId: component.project._id,

            projectName: component.project.name,

            componentId: component._id,

            componentName: component.name,

            moduleId: component.projectModule?._id || null,

            moduleName: component.projectModule?.name || "Manual Tasks",

            taskId: task._id,

            taskTitle: task.title,

            taskDescription: task.description,

            deadline: task.deadline,

            status: task.status,

            submissionRule: {
              type: task.submissionRule?.type || "TEXT",
            },

            // Lets the frontend tell the two situations apart: a
            // task the employee owns vs. one they were only tagged
            // on (and therefore can view but not submit).
            isAssignee: isAssignedToEmployee,

            isTagged: isTaggedToEmployee,

            assignedEmployee: task.assignedEmployee
              ? {
                  _id: task.assignedEmployee._id,
                  username: task.assignedEmployee.username,
                  email: task.assignedEmployee.email,
                }
              : null,

            tagMessage: isTaggedToEmployee ? myTag.message || "" : undefined,
          });
        }
      }
    }

    console.log(`[ProjectComponent] ${myTasks.length} task(s) returned.`);

    return res.status(200).json({
      success: true,

      count: myTasks.length,

      data: myTasks,
    });
  } catch (err) {
    console.error("[ProjectComponent] Get My Tasks Error");

    console.error(err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// =========================================
// PROJECT-SCOPED "PENDING TASKS"
//
// A filtered operational view of the SAME task records used by
// getMyTasks above — not a new hierarchy or duplicate data. A task
// is "pending employee action" when it is in one of the statuses
// where the assignee (not a merely-tagged employee — tags are
// view-only) still has to do something: it hasn't been started/
// finished yet (PENDING/IN_PROGRESS), or it was reviewed and sent
// back for rework (REJECTED). SUBMITTED/UNDER_REVIEW are waiting on
// the admin/reviewer, and APPROVED is done, so neither belongs here.
// =========================================
const EMPLOYEE_ACTION_PENDING_STATUSES = ["PENDING", "IN_PROGRESS", "REJECTED"];

export const getProjectPendingTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    // Admins see every employee's pending-action tasks in the
    // project; an employee only ever sees their own — never another
    // employee's pending work. Frontend filtering is presentation
    // only, this is the authoritative check.
    const isAdmin = req.user.role === "admin";

    const query = { project: projectId };

    if (!isAdmin) {
      query["tasks.assignedEmployee"] = req.user.id;
    }

    const components = await ProjectComponent.find(query)
      .populate("projectModule", "name")
      .populate("tasks.assignedEmployee", "username email")
      .lean();

    const pendingTasks = [];

    for (const component of components) {
      for (const task of component.tasks || []) {
        if (!EMPLOYEE_ACTION_PENDING_STATUSES.includes(task.status)) {
          continue;
        }

        const assignedEmployeeId = task.assignedEmployee?._id?.toString();

        // Only the primary assignee has an action to take — a tagged
        // employee can view the task but can't submit for it, so it
        // is never "pending" for them.
        if (!assignedEmployeeId) {
          continue;
        }

        if (!isAdmin && assignedEmployeeId !== req.user.id.toString()) {
          continue;
        }

        pendingTasks.push({
          projectId,
          componentId: component._id,
          componentName: component.name,
          moduleId: component.projectModule?._id || null,
          moduleName: component.projectModule?.name || null,
          taskId: task._id,
          taskTitle: task.title,
          taskDescription: task.description,
          deadline: task.deadline,
          status: task.status,
          submissionRule: {
            type: task.submissionRule?.type || "TEXT",
          },
          assignedEmployee: task.assignedEmployee
            ? {
                _id: task.assignedEmployee._id,
                username: task.assignedEmployee.username,
                email: task.assignedEmployee.email,
              }
            : null,
        });
      }
    }

    // Soonest deadlines first; tasks with no deadline sort last.
    pendingTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    return res.status(200).json({
      success: true,
      count: pendingTasks.length,
      data: pendingTasks,
    });
  } catch (err) {
    console.error("[ProjectComponent] Get Project Pending Tasks Error");

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTaskDetails = async (req, res) => {
  try {
    const { componentId, taskId } = req.params;

    const component = await ProjectComponent.findById(componentId)
      .populate("project", "name")
      .populate("projectModule", "name")
      .populate("tasks.assignedEmployee", "username email")
      .populate("tasks.tags.employee", "username email")
      .populate("tasks.tags.taggedBy", "username email");

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,

      data: {
        projectId: component.project?._id || component.project,
        projectName: component.project?.name || "Project",

        componentId: component._id,
        componentName: component.name,

        moduleId: component.projectModule?._id || component.projectModule,
        moduleName: component.projectModule?.name || "No module",

        task,
      },
    });
  } catch (err) {
    console.error("getTaskDetails error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getEmployeeProjectTasks = async (req, res) => {
  try {
    const { projectId, employeeId } = req.params;

    // =========================================
    // GET EMPLOYEE
    // =========================================

    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
    })
      .select("username email expertise")
      .populate("expertise", "name color");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // =========================================
    // GET PROJECT
    // =========================================

    const project =
      await Project.findById(projectId).select("name description");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // =========================================
    // GET PROJECT COMPONENTS
    // =========================================

    const components = await ProjectComponent.find({
      project: projectId,
    })
      .populate("projectModule", "name")
      .lean();

    // =========================================
    // GET EMPLOYEE SUBMISSIONS
    // =========================================

    const submissions = await Submission.find({
      project: projectId,
      assignedEmployee: employeeId,
    }).lean();

    // =========================================
    // CREATE SUBMISSION LOOKUP
    // componentId + taskId
    // =========================================

    const submissionMap = new Map();

    submissions.forEach((submission) => {
      const key =
        `${submission.projectComponent.toString()}-` +
        `${submission.taskId.toString()}`;

      submissionMap.set(key, {
        submissionId: submission._id,
        submissionStatus: submission.status,
        latestSubmission: submission.latestSubmission,
      });
    });

    // =========================================
    // FIND TASKS ASSIGNED TO EMPLOYEE
    // =========================================

    const assignedTasks = [];

    components.forEach((component) => {
      const tasks = component.tasks || [];

      tasks.forEach((task) => {
        if (
          task.assignedEmployee &&
          task.assignedEmployee.toString() === employeeId.toString()
        ) {
          const key = `${component._id.toString()}-` + `${task._id.toString()}`;

          const submissionData = submissionMap.get(key);

          assignedTasks.push({
            componentId: component._id,
            componentName: component.name,
            moduleName: component.projectModule?.name || "No Module",
            taskId: task._id,
            taskTitle: task.title,
            taskDescription: task.description || "",
            status: task.status,
            deadline: task.deadline || null,
            submissionId: submissionData?.submissionId || null,
            submissionStatus:
              submissionData?.submissionStatus || "NOT_SUBMITTED",

            latestSubmission: submissionData?.latestSubmission || null,
          });
        }
      });
    });

    // =========================================
    // RESPONSE
    // =========================================

    return res.status(200).json({
      success: true,
      data: {
        project,
        employee,
        tasks: assignedTasks,
      },
    });
  } catch (err) {
    console.error("getEmployeeProjectTasks error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// GET DOMAIN TASK ASSIGNMENTS IN A PROJECT
// =========================================
export const getProjectDomainTasks = async (req, res) => {
  try {
    const { projectId, domainId } = req.params;

    // =========================================
    // VALIDATE PROJECT
    // =========================================

    const project = await Project.findById(projectId)
      .select("name domains")
      .populate("domains", "name color");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // =========================================
    // VALIDATE DOMAIN
    // =========================================

    const domain = project.domains.find(
      (item) => item._id.toString() === domainId.toString(),
    );

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: "Domain does not belong to this project.",
      });
    }

    // =========================================
    // GET ALL EMPLOYEES ASSIGNED TO THIS DOMAIN
    // =========================================

    const assignments = await ProjectMember.find({
      project: projectId,
      domain: domainId,
    })
      .populate("employee", "username email expertise")
      .lean();

    // Extract valid employees

    const employees = assignments
      .filter((assignment) => assignment.employee)
      .map((assignment) => assignment.employee);

    // If no employees are assigned to this domain

    if (employees.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          project: {
            _id: project._id,
            name: project.name,
          },

          domain,

          employees: [],

          tasks: [],
        },
      });
    }

    // =========================================
    // GET PROJECT COMPONENTS
    // =========================================

    const components = await ProjectComponent.find({
      project: projectId,
    })
      .populate("projectModule", "name")
      .lean();

    // =========================================
    // CREATE EMPLOYEE ID LOOKUP
    // =========================================

    const employeeMap = new Map();

    employees.forEach((employee) => {
      employeeMap.set(employee._id.toString(), {
        employee,
        tasks: [],
      });
    });

    // =========================================
    // FIND TASKS ASSIGNED TO DOMAIN EMPLOYEES
    // =========================================

    components.forEach((component) => {
      (component.tasks || []).forEach((task) => {
        if (!task.assignedEmployee) {
          return;
        }

        const employeeId = task.assignedEmployee.toString();

        const employeeData = employeeMap.get(employeeId);

        if (!employeeData) {
          return;
        }

        employeeData.tasks.push({
          componentId: component._id,

          componentName: component.name,

          moduleName: component.projectModule?.name || "No Module",

          taskId: task._id,

          taskTitle: task.title,

          taskDescription: task.description || "",

          status: task.status,

          deadline: task.deadline || null,
        });
      });
    });

    // =========================================
    // FORMAT EMPLOYEE + TASK DATA
    // =========================================

    const employeeAssignments = Array.from(employeeMap.values()).map(
      ({ employee, tasks }) => ({
        employee: {
          _id: employee._id,
          username: employee.username,
          email: employee.email,
        },

        tasks,

        taskCount: tasks.length,

        activeTaskCount: tasks.filter(
          (task) => task.status !== "COMPLETED" && task.status !== "APPROVED",
        ).length,
      }),
    );

    // =========================================
    // TOTAL TASKS
    // =========================================

    const allTasks = employeeAssignments.flatMap((item) => item.tasks);

    // =========================================
    // RESPONSE
    // =========================================

    return res.status(200).json({
      success: true,

      data: {
        project: {
          _id: project._id,
          name: project.name,
        },

        domain: {
          _id: domain._id,
          name: domain.name,
          color: domain.color,
        },

        employees: employeeAssignments,

        totalEmployees: employeeAssignments.length,

        totalTasks: allTasks.length,

        activeTasks: allTasks.filter(
          (task) => task.status !== "COMPLETED" && task.status !== "APPROVED",
        ).length,
      },
    });
  } catch (err) {
    console.error("getProjectDomainTasks error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// ADD MANUAL TASK TO PROJECT COMPONENT
// =========================================
export const addManualTask = async (req, res) => {
  try {
    const { componentId } = req.params;

    const {
      title,
      description = "",
      assignedEmployee = null,
      deadline = null,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    // Validate employee belongs to project
    if (assignedEmployee) {
      const member = await ProjectMember.findOne({
        project: component.project,
        employee: assignedEmployee,
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          message: "Employee is not assigned to this project.",
        });
      }
    }

    const nextDisplayOrder =
      component.tasks.length > 0
        ? Math.max(
            ...component.tasks.map((task) => Number(task.displayOrder) || 0),
          ) + 1
        : 1;

    component.tasks.push({
      title: title.trim(),
      description: description?.trim() || "",
      displayOrder: nextDisplayOrder,

      required: false,

      assignedEmployee: assignedEmployee || null,
      deadline: deadline || null,

      status: "PENDING",

      submissionRule: {
        type: "TEXT",
      },
    });

    await component.save();

    const newTask = component.tasks[component.tasks.length - 1];

    return res.status(201).json({
      success: true,
      message: "Manual task added successfully.",
      data: newTask,
    });
  } catch (err) {
    console.error("addManualTask error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// ADD MANUAL TASK DIRECTLY TO A PROJECT
// (no existing work item / component required)
//
// Used when a project has no tasks assigned to
// any employee yet, so the admin has no work
// item to attach a manual task to. This finds
// (or lazily creates) a single lightweight
// "Manual Tasks" container component for the
// project and adds the task there — reusing the
// exact same task shape/rules as addManualTask,
// so everything downstream (assignment, employee
// task lists, submissions) works unchanged.
// =========================================
export const addManualTaskToProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    const {
      title,
      description = "",
      assignedEmployee = null,
      deadline = null,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project is required.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Validate employee belongs to project
    if (assignedEmployee) {
      const member = await ProjectMember.findOne({
        project: projectId,
        employee: assignedEmployee,
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          message: "Employee is not assigned to this project.",
        });
      }
    }

    // =========================================
    // FIND OR CREATE THE MANUAL TASKS CONTAINER
    // =========================================

    let container = await ProjectComponent.findOne({
      project: projectId,
      isManualContainer: true,
    });

    if (!container) {
      container = await ProjectComponent.create({
        project: projectId,
        projectModule: null,
        componentTemplate: null,
        name: "Manual Tasks",
        description:
          "Ad-hoc tasks created directly by an admin, without a predefined work item.",
        tasks: [],
        isManualContainer: true,
        createdBy: req.user.id,
      });
    }

    const nextDisplayOrder =
      container.tasks.length > 0
        ? Math.max(
            ...container.tasks.map((task) => Number(task.displayOrder) || 0),
          ) + 1
        : 1;

    container.tasks.push({
      title: title.trim(),
      description: description?.trim() || "",
      displayOrder: nextDisplayOrder,

      required: false,

      assignedEmployee: assignedEmployee || null,
      deadline: deadline || null,

      status: "PENDING",

      submissionRule: {
        type: "TEXT",
      },
    });

    await container.save();

    const newTask = container.tasks[container.tasks.length - 1];

    return res.status(201).json({
      success: true,
      message: "Manual task added successfully.",
      data: {
        componentId: container._id,
        task: newTask,
      },
    });
  } catch (err) {
    console.error("addManualTaskToProject error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// ADD SUBTASK TO A PROJECT TASK
//
// Mirrors addManualTask: admin adds a project-specific subtask under
// an existing task. This never touches the predefined/template task
// definition — only this project's snapshot of it.
// =========================================
export const addSubtask = async (req, res) => {
  try {
    const { componentId, taskId } = req.params;

    const { title, description = "" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subtask title is required.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const nextDisplayOrder =
      task.subtasks.length > 0
        ? Math.max(
            ...task.subtasks.map((subtask) => Number(subtask.displayOrder) || 0),
          ) + 1
        : 1;

    task.subtasks.push({
      title: title.trim(),
      description: description?.trim() || "",
      displayOrder: nextDisplayOrder,
      completed: false,
    });

    await component.save();

    const newSubtask = task.subtasks[task.subtasks.length - 1];

    return res.status(201).json({
      success: true,
      message: "Subtask added successfully.",
      data: newSubtask,
    });
  } catch (err) {
    console.error("addSubtask error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// TOGGLE SUBTASK COMPLETION
// =========================================
export const toggleSubtaskCompletion = async (req, res) => {
  try {
    const { componentId, taskId, subtaskId } = req.params;

    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed status must be true or false.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const subtask = task.subtasks.id(subtaskId);

    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found.",
      });
    }

    // Employees may only toggle subtasks of a task assigned to them.
    if (
      req.user.role === "employee" &&
      (!task.assignedEmployee ||
        task.assignedEmployee.toString() !== req.user.id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this subtask.",
      });
    }

    subtask.completed = completed;

    await component.save();

    return res.status(200).json({
      success: true,
      message: completed
        ? "Subtask marked as completed."
        : "Subtask marked as pending.",
      data: subtask,
    });
  } catch (err) {
    console.error("toggleSubtaskCompletion error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// DELETE SUBTASK
//
// Only removes the project-specific subtask snapshot. The predefined
// template task's default subtasks are never touched.
// =========================================
export const deleteSubtask = async (req, res) => {
  try {
    const { componentId, taskId, subtaskId } = req.params;

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const subtask = task.subtasks.id(subtaskId);

    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found.",
      });
    }

    subtask.deleteOne();

    await component.save();

    return res.status(200).json({
      success: true,
      message: "Subtask deleted successfully.",
    });
  } catch (err) {
    console.error("deleteSubtask error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// UPDATE MANUAL TASK COMPLETION STATUS
// =========================================
export const updateTaskCompletion = async (req, res) => {
  try {
    const { componentId, taskId } = req.params;

    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed status must be true or false.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Employee can only update their own assigned task
    if (
      req.user.role === "employee" &&
      (!task.assignedEmployee ||
        task.assignedEmployee.toString() !== req.user.id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this task.",
      });
    }

    task.status = completed ? "COMPLETED" : "PENDING";

    await component.save();

    return res.status(200).json({
      success: true,
      message: completed
        ? "Task marked as completed."
        : "Task marked as pending.",
      data: task,
    });
  } catch (err) {
    console.error("updateTaskCompletion error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// TAG AN EMPLOYEE ON A TASK
//
// Lets anyone already involved with the task (the admin, the
// assignee, or someone previously tagged on it) loop in another
// employee so they can be handed context / information about it.
// =========================================

export const tagEmployeeOnTask = async (req, res) => {
  try {
    const { componentId, taskId } = req.params;

    const { employeeId, message } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employeeId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID.",
      });
    }

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project component not found.",
      });
    }

    const task = component.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // =========================================
    // PERMISSION CHECK
    //
    // Allowed: admins, the employee currently assigned to the task,
    // or an employee who has already been tagged on it (so the tag
    // can be passed along further).
    // =========================================

    const isAdmin = req.user.role === "admin";

    const isAssignee =
      task.assignedEmployee &&
      task.assignedEmployee.toString() === req.user.id.toString();

    const isAlreadyTagged = task.tags.some(
      (tag) => tag.employee.toString() === req.user.id.toString(),
    );

    if (!isAdmin && !isAssignee && !isAlreadyTagged) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to tag employees on this task.",
      });
    }

    // =========================================
    // VALIDATE TARGET EMPLOYEE
    // =========================================

    if (employeeId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot tag yourself.",
      });
    }

    const employee = await User.findById(employeeId);

    if (!employee || employee.role !== "employee") {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    const isProjectMember = await ProjectMember.findOne({
      project: component.project,
      employee: employeeId,
    });

    const isEmbeddedProjectMember = await Project.exists({
      _id: component.project,
      "members.user_id": employeeId,
    });

    if (!isProjectMember && !isEmbeddedProjectMember) {
      return res.status(400).json({
        success: false,
        message: "That employee is not a member of this project.",
      });
    }

    const alreadyTagged = task.tags.some(
      (tag) => tag.employee.toString() === employeeId,
    );

    if (alreadyTagged) {
      return res.status(400).json({
        success: false,
        message: "This employee is already tagged on the task.",
      });
    }

    task.tags.push({
      employee: employeeId,
      message: message || "",
      taggedBy: req.user.id,
    });

    await component.save();

    await component.populate("tasks.tags.employee", "username email");
    await component.populate("tasks.tags.taggedBy", "username email");

    const updatedTask = component.tasks.id(taskId);

    return res.status(200).json({
      success: true,
      message: `${employee.username} has been tagged on this task.`,
      data: updatedTask.tags,
    });
  } catch (err) {
    console.error("tagEmployeeOnTask error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// UPDATE PROJECT COMPONENT / WORK ITEM
// =========================================

export const updateProjectComponent = async (req, res) => {
  try {
    const { componentId } = req.params;

    const { name, description, tasks } = req.body;

    // =========================================
    // FIND COMPONENT
    // =========================================

    const component = await ProjectComponent.findById(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project work item not found.",
      });
    }

    // =========================================
    // VALIDATE NAME
    // =========================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Work item name is required.",
      });
    }

    // =========================================
    // UPDATE BASIC DETAILS
    // =========================================

    component.name = name.trim();

    component.description = description?.trim() || "";

    // =========================================
    // UPDATE TASKS
    // =========================================

    if (Array.isArray(tasks)) {
      const existingTasks = new Map(
        component.tasks.map((task) => [task._id.toString(), task]),
      );

      const updatedTasks = [];

      for (let index = 0; index < tasks.length; index++) {
        const incomingTask = tasks[index];

        if (!incomingTask.title || !incomingTask.title.trim()) {
          return res.status(400).json({
            success: false,
            message: `Task ${index + 1} title is required.`,
          });
        }

        const existingTask =
          incomingTask._id && existingTasks.get(incomingTask._id.toString());

        // =====================================
        // EXISTING TASK
        // Preserve assignment/progress/status
        // =====================================

        if (existingTask) {
          existingTask.title = incomingTask.title.trim();

          existingTask.description = incomingTask.description?.trim() || "";

          existingTask.displayOrder = incomingTask.displayOrder ?? index + 1;

          existingTask.required = incomingTask.required ?? true;

          if (incomingTask.submissionRule) {
            existingTask.submissionRule = incomingTask.submissionRule;
          }

          updatedTasks.push(existingTask);
        } else {
          // ===================================
          // NEW PROJECT-SPECIFIC TASK
          // ===================================

          updatedTasks.push({
            templateTaskId: incomingTask.templateTaskId || null,

            title: incomingTask.title.trim(),

            description: incomingTask.description?.trim() || "",

            displayOrder: incomingTask.displayOrder ?? index + 1,

            required: incomingTask.required ?? false,

            submissionRule: incomingTask.submissionRule || {
              type: "TEXT",
            },

            assignedEmployee: incomingTask.assignedEmployee || null,

            deadline: incomingTask.deadline || null,

            status: incomingTask.status || "PENDING",

            subtasks: Array.isArray(incomingTask.subtasks)
              ? incomingTask.subtasks
              : [],
          });
        }
      }

      component.tasks = updatedTasks;
    }

    await component.save();

    return res.status(200).json({
      success: true,
      message: "Work item updated successfully.",
      data: component,
    });
  } catch (err) {
    console.error("updateProjectComponent error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// DELETE PROJECT COMPONENT / WORK ITEM
// =========================================

export const deleteProjectComponent = async (req, res) => {
  try {
    const { componentId } = req.params;

    const component = await ProjectComponent.findByIdAndDelete(componentId);

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Project work item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Work item deleted successfully.",
    });
  } catch (err) {
    console.error("deleteProjectComponent error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
