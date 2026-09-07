import ProjectModule from "../../models/project/ProjectModule.js";

// CREATE MODULE
export const createProjectModule = async (req, res) => {
  try {
    const { name, description, color, domain } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Module name is required.",
      });
    }

    const exists = await ProjectModule.findOne({
      name: name.trim(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Module already exists.",
      });
    }

    const module = await ProjectModule.create({
      name: name.trim(),
      description,
      color,
      domain: domain || null,
      createdBy: req.user.id,
    });

    await module.populate("domain", "name color");

    res.status(201).json({
      success: true,
      data: module,
    });
  } catch (err) {
    console.error("[ProjectModule] ERROR", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE MODULE
export const updateProjectModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, domain, isActive } = req.body;

    const module = await ProjectModule.findById(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    if (name !== undefined) {
      const duplicate = await ProjectModule.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another module with this name already exists.",
        });
      }

      module.name = name.trim();
    }

    if (description !== undefined) module.description = description;
    if (color !== undefined) module.color = color;
    if (domain !== undefined) {
      module.domain = domain || null;
    }

    if (typeof isActive === "boolean") module.isActive = isActive;

    // Backfill ownership for modules created before createdBy was required.
    if (!module.createdBy) {
      module.createdBy = req.user.id;
    }

    await module.save();

    await module.populate("domain", "name color");

    res.json({
      success: true,
      data: module,
    });
  } catch (err) {
    console.error("[ProjectModule] Update Error", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DEACTIVATE MODULE (soft delete)
// Hard-deleting would orphan ComponentTemplate.projectModule references.
export const deactivateProjectModule = async (req, res) => {
  try {
    const { id } = req.params;

    const module = await ProjectModule.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    res.json({
      success: true,
      message: "Module deactivated successfully.",
      data: module,
    });
  } catch (err) {
    console.error("[ProjectModule] Deactivate Error", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET ALL MODULES
export const getProjectModules = async (req, res) => {
  try {
    const modules = await ProjectModule.find({
      // isActive: true
    })
      .populate("domain", "name color")
      .sort({
        name: 1,
      })
      .lean();

    res.json({
      success: true,
      data: modules,
    });
  } catch (err) {
    console.error("[ProjectModule] ERROR", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
