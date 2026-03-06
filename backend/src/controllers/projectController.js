import Project from "../models/Project.js";

// 'CREATE PROJECT; CONTROLLER
export const createProject = async (req, res) => {

    // GETTING PROJECT DATA
    const { name, description } = req.body;

    // CREATING NEW OBJECT
    const project = new Project({
        name,
        description,
        created_by: req.user.id
    });

    // SAVING PROJECT
    await project.save()

    res.status(201).json(project)

};

// FETCHING PROJECTS
export const getProjects = async (req, res) => {

    // FETCHING PROJECTS WITH 'USER_ID'
    const projects = await Project.find({
        "members.user_id": req.user.id
    })

    res.json(projects)
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