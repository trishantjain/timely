import Domain from "../models/Domain.js";

// CREATE DOMAIN
export const createDomain = async (req, res) => {
    try {
        const { name, description, color } = req.body;

        const exists = await Domain.findOne({
            name: name.trim()
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Domain already exists"
            });
        }

        const domain = await Domain.create({
            name,
            description,
            color
        });

        res.status(201).json({
            success: true,
            data: domain
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

// GET ALL DOMAINS
export const getAllDomains = async (req, res) => {
    try {
        const domains = await Domain.find({
            isActive: true
        }).sort({
            name: 1
        });

        res.json({
            success: true,
            data: domains
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });

    }
}