import Project from "../models/Project.js";

// 'CREATE PROJECT; CONTROLLER
export const createProject = async (req, res) => {

    // GETTING PROJECT DATA
    const { name, description, domains } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Project name is required"
        });
    }

    if (!domains || domains.length === 0) {
        return res.status(400).json({
            message: "Please select at least one domain"
        });
    }

    // CREATING NEW OBJECT
    const project = new Project({
        name,
        description,
        domains,
        created_by: req.user.id,
        members: [
            {
                user_id: req.user.id,
                role: "admin"
            }
        ]
    });

    // SAVING PROJECT
    await project.save()

    res.status(201).json(project)

};

// FETCHING PROJECTS
export const getProjects = async (req, res) => {
    try {

        // FETCHING PROJECTS WITH 'USER_ID'
        const projects = await Project.find({
            "members.user_id": req.user.id
        })
            .populate("members.user_id", "username email")
            .populate("domains", "name color");

        res.json(projects)
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects" })
    }

}

// ADDING MEMBER TO THE PROJECT
export const addMember = async (req, res) => {

    // FETCHING DATA
    const { user_id, role } = req.body;

    // FINDING PROJECT BY 'ID' TO ADD MEMBER IN PROJECT
    const project = await Project.findById(req.params.id);

    // CHECKING IF MEMBER ALREADY EXISTS
    const exists = project.members.some(
        m => m.user_id.toString() === user_id
    );

    if (exists) {
        return res.status(400).json({ message: "User already member" });
    }

    // ADD NEW MEMBER IN THE ARRAY
    project.members.push({
        user_id,
        role
    });

    await project.save();

    res.json(project);

};

// FETCHING PROJECT BY ITS ID
export const getProjectById = async (req, res) => {

    try {
        const project = await Project.findById(req.params.id)
            .populate("created_by", "username email")
            .populate("members.user_id", "username email")
            .populate("domains", "name color");

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(project);

    } catch (err) {
        res.status(500).json({
            message: error.message
        });
    }
}