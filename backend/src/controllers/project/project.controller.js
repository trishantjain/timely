import Domain from "../../models/Domain.js";
import Project from "../../models/project/Project.js";
import ProjectMember from "../../models/project/ProjectMember.js";
import ProjectModule from "../../models/project/ProjectModule.js";
import ComponentTemplate from "../../models/template/ComponentTemplate.js";
import ProjectComponent from "../../models/project/ProjectComponent.js";

// =========================================
// AUTO CREATE PROJECT WORK ITEMS
// =========================================
const createProjectWorkItemsFromDomains = async ({
  projectId,
  domainIds,
  createdBy,
}) => {
  // No domains
  if (!Array.isArray(domainIds) || domainIds.length === 0) {
    return {
      createdCount: 0,
    };
  }

  // =========================================
  // FIND ACTIVE MODULES BELONGING TO DOMAINS
  // =========================================

  const modules = await ProjectModule.find({
    domain: {
      $in: domainIds,
    },
    isActive: true,
  }).select("_id");

  const moduleIds = modules.map((module) => module._id);

  if (moduleIds.length === 0) {
    return {
      createdCount: 0,
    };
  }

  // =========================================
  // FIND ACTIVE COMPONENT TEMPLATES
  // =========================================

  const templates = await ComponentTemplate.find({
    projectModule: {
      $in: moduleIds,
    },
    isActive: true,
  }).lean();

  if (templates.length === 0) {
    return {
      createdCount: 0,
    };
  }

  // =========================================
  // CHECK ALREADY ADDED COMPONENTS
  // =========================================

  const existingComponents = await ProjectComponent.find({
    project: projectId,
    componentTemplate: {
      $in: templates.map((template) => template._id),
    },
  }).select("componentTemplate");

  const existingTemplateIds = new Set(
    existingComponents.map((component) =>
      component.componentTemplate.toString(),
    ),
  );

  // =========================================
  // CREATE ONLY MISSING WORK ITEMS
  // =========================================

  const newComponents = templates
    .filter((template) => !existingTemplateIds.has(template._id.toString()))
    .map((template) => ({
      project: projectId,
      projectModule: template.projectModule,
      componentTemplate: template._id,
      name: template.name,
      description: template.description || "",
      createdBy,
      tasks: template.tasks.map((task) => ({
        templateTaskId: task._id,
        title: task.title,
        description: task.description || "",
        displayOrder: task.displayOrder,
        required: task.required,
        submissionRule: task.submissionRule,
        assignedEmployee: null,
        deadline: null,
        status: "PENDING",
      })),
    }));

  if (newComponents.length === 0) {
    return {
      createdCount: 0,
    };
  }

  await ProjectComponent.insertMany(newComponents);

  return {
    createdCount: newComponents.length,
  };
};

// 'CREATE PROJECT; CONTROLLER
// =========================================
// CREATE PROJECT
// =========================================

export const createProject = async (req, res) => {
  try {
    const { name, description, domains } = req.body;

    // =========================================
    // VALIDATION
    // =========================================

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one domain.",
      });
    }

    // Remove duplicate domain IDs
    const uniqueDomainIds = [
      ...new Set(
        domains.filter(Boolean).map((domainId) => domainId.toString()),
      ),
    ];

    // =========================================
    // VALIDATE DOMAINS
    // =========================================

    const validDomains = await Domain.find({
      _id: {
        $in: uniqueDomainIds,
      },
      isActive: true,
    }).select("_id");

    if (validDomains.length !== uniqueDomainIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected domains are invalid or inactive.",
      });
    }

    // =========================================
    // CREATE PROJECT
    // =========================================

    const project = await Project.create({
      name: name.trim(),

      description: description || "",

      domains: uniqueDomainIds,

      created_by: req.user.id,

      members: [
        {
          user_id: req.user.id,
          role: "admin",
        },
      ],
    });

    // =========================================
    // AUTO CREATE WORK ITEMS
    // =========================================

    const result = await createProjectWorkItemsFromDomains({
      projectId: project._id,

      domainIds: uniqueDomainIds,

      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,

      message: "Project created successfully.",

      autoCreatedWorkItems: result.createdCount,

      data: project,
    });
  } catch (err) {
    console.error("createProject error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =========================================
// FETCH PROJECTS
// =========================================

export const getProjects = async (req, res) => {
  try {
    // =========================================
    // FETCH PROJECTS
    // =========================================

    const projects = await Project.find({
      "members.user_id": req.user.id,
    })
      .populate("members.user_id", "username email")
      .populate("domains", "name color")
      .lean();

    // =========================================
    // GET PROJECT IDS
    // =========================================

    const projectIds = projects.map((project) => project._id);

    // =========================================
    // GET ALL EMPLOYEE ASSIGNMENTS
    // =========================================

    const projectMembers = await ProjectMember.find({
      project: {
        $in: projectIds,
      },
    })
      .select("project employee")
      .lean();

    // =========================================
    // CREATE UNIQUE EMPLOYEE COUNT MAP
    // =========================================

    const memberCountMap = new Map();

    projectMembers.forEach((member) => {
      const projectId = member.project.toString();
      const employeeId = member.employee?.toString();

      if (!employeeId) {
        return;
      }

      if (!memberCountMap.has(projectId)) {
        memberCountMap.set(projectId, new Set());
      }

      memberCountMap.get(projectId).add(employeeId);
    });

    // =========================================
    // ADD MEMBER COUNT TO PROJECT RESPONSE
    // =========================================

    const projectsWithMemberCount = projects.map((project) => {
      const projectId = project._id.toString();

      const uniqueEmployees = memberCountMap.get(projectId)?.size || 0;

      return {
        ...project,

        memberCount: uniqueEmployees,
      };
    });

    return res.status(200).json(projectsWithMemberCount);
  } catch (error) {
    console.error("Error fetching projects:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching projects",
    });
  }
};

// ADDING MEMBER TO THE PROJECT
export const addMember = async (req, res) => {
  // FETCHING DATA
  const { user_id, role } = req.body;

  // FINDING PROJECT BY 'ID' TO ADD MEMBER IN PROJECT
  const project = await Project.findById(req.params.id);

  // CHECKING IF MEMBER ALREADY EXISTS
  const exists = project.members.some((m) => m.user_id.toString() === user_id);

  if (exists) {
    return res.status(400).json({ message: "User already member" });
  }

  // ADD NEW MEMBER IN THE ARRAY
  project.members.push({
    user_id,
    role,
  });

  await project.save();

  res.json(project);
};

// FETCHING PROJECT BY ITS ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("created_by", "username email")
      .populate("domains", "name color");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const assignments = await ProjectMember.find({
      project: project._id,
    })
      .populate("employee", "username email")
      .populate("domain", "name");

    res.json({
      ...project.toObject(),
      assignments,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ========================================
// GET PROJECT MEMBERS
// ========================================
export const getProjectMembers = async (req, res) => {
  console.log("\n================================");
  console.log("[Project] Get Project Members");
  console.log(req.params.id);
  console.log("================================");

  try {
    const members = await ProjectMember.find({
      project: req.params.id,
    })
      .populate("employee", "username email")
      .populate("domain", "name")
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
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
// UPDATE PROJECT DOMAINS
// =========================================
// =========================================
// UPDATE PROJECT DOMAINS
// =========================================

export const updateProjectDomains = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { domains } = req.body;

    // =========================================
    // VALIDATE INPUT
    // =========================================

    if (!Array.isArray(domains)) {
      return res.status(400).json({
        success: false,
        message: "Domains must be an array.",
      });
    }

    const uniqueDomainIds = [
      ...new Set(domains.filter(Boolean).map((id) => id.toString())),
    ];

    if (uniqueDomainIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one project domain.",
      });
    }

    // =========================================
    // FIND PROJECT
    // =========================================

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // =========================================
    // VALIDATE DOMAINS
    // =========================================

    const validDomains = await Domain.find({
      _id: {
        $in: uniqueDomainIds,
      },
      isActive: true,
    }).select("_id");

    if (validDomains.length !== uniqueDomainIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected domains are invalid or inactive.",
      });
    }

    // =========================================
    // FIND NEWLY ADDED DOMAINS
    // =========================================

    const oldDomainIds = project.domains.map((domainId) => domainId.toString());

    const newlyAddedDomainIds = uniqueDomainIds.filter(
      (domainId) => !oldDomainIds.includes(domainId),
    );

    // =========================================
    // UPDATE PROJECT DOMAINS
    // =========================================

    project.domains = uniqueDomainIds;

    await project.save();

    // =========================================
    // AUTO ADD WORK ITEMS FOR NEW DOMAINS ONLY
    // =========================================

    let autoCreatedWorkItems = 0;

    if (newlyAddedDomainIds.length > 0) {
      const result = await createProjectWorkItemsFromDomains({
        projectId: project._id,

        domainIds: newlyAddedDomainIds,

        createdBy: req.user.id,
      });

      autoCreatedWorkItems = result.createdCount;
    }

    // =========================================
    // RETURN UPDATED PROJECT
    // =========================================

    await project.populate("domains", "name description color isActive");

    return res.status(200).json({
      success: true,

      message: "Project domains updated successfully.",

      autoCreatedWorkItems,

      data: project,
    });
  } catch (err) {
    console.error("updateProjectDomains error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
