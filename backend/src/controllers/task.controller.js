import Task from "../models/Task.js"
import Project from "../models/Project.js"

// CREATE TASK
export const createTask = async (req, res) => {

    try {
        const { title, description, assigned_to, due_date, project_id } = req.body

        const project = await Project.findById(project_id)

        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }

        const task = new Task({

            title,
            description,
            assigned_to,
            due_date,
            project_id,
            created_by: req.user.id

        })

        await task.save()

        res.status(201).json(task)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }

};

// GET TASKS OF PROJECT
export const getProjectTasks = async (req, res) => {
    try {

        const tasks = await Task.find({
            project_id: req.params.projectId
        }).populate("assigned_to", "username email")

        res.json(tasks)

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }

}