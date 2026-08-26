import Domain from "../models/Domain.js";

// CREATE DOMAIN
export const createDomain = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        const exists = await Domain.findOne({
            name: name.trim(),
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Domain already exists",
            });
        }

        const domain = await Domain.create({
            name,
            description,
            color,
        });

        res.status(201).json({
            success: true,
            data: domain,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// GET ALL DOMAINS
export const getAllDomains = async (req, res) => {
    try {
        const domains = await Domain.find({
            // isActive: true
        })
            .sort({
                name: 1,
            })
            .lean();

        res.json({
            success: true,
            data: domains,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// UPDATE DOMAIN
export const updateDomain = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, isActive } = req.body;

        const domain = await Domain.findById(id);

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found",
            });
        }

        if (name !== undefined) {
            const duplicate = await Domain.findOne({
                name: name.trim(),
                _id: { $ne: id },
            });

            if (duplicate) {
                return res.status(400).json({
                    success: false,
                    message: "Another domain with this name already exists",
                });
            }

            domain.name = name.trim();
        }

        if (description !== undefined) domain.description = description;
        if (color !== undefined) domain.color = color;
        if (typeof isActive === "boolean") domain.isActive = isActive;

        await domain.save();

        res.json({
            success: true,
            data: domain,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// GET SINGLE DOMAIN

export const getDomainById = async (req, res) => {
    try {
        const { id } = req.params;

        const domain = await Domain.findById(id).lean();

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found",
            });
        }

        res.json({
            success: true,
            data: domain,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// DEACTIVATE DOMAIN (soft delete)
// Hard-deleting would orphan every User.expertise / ProjectMember.domain /
// DocumentType.domain reference that points at this domain's _id.
export const deactivateDomain = async (req, res) => {
    try {
        const { id } = req.params;

        const domain = await Domain.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true },
        );

        if (!domain) {
            return res.status(404).json({
                success: false,
                message: "Domain not found",
            });
        }

        res.json({
            success: true,
            message: "Domain deactivated successfully",
            data: domain,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
