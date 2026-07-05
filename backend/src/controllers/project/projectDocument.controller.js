import ProjectMember from '../../models/project/ProjectMember.js'
import DocumentType from "../../models/template/DocumentType.js";
import ProjectDocument from "../../models/project/ProjectDocument.js";

export const assignDocument = async (req, res) => {

    try {
        const { assignmentId, documentTypeIds } = req.body;

        // Validate Assignment
        if (!assignmentId) {
            return res.status(400).json({
                success: false,
                message: "Assignment is required."
            });
        }

        const assignment = await ProjectMember.findById(assignmentId);

        if (
            !documentTypeIds ||
            !Array.isArray(documentTypeIds) ||
            documentTypeIds.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one document."
            });
        }

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const createdDocuments = [];
        const skippedDocuments = [];


        for (const documentTypeId of documentTypeIds) {

            // Validate Document Type
            const documentType = await DocumentType.findById(documentTypeId);

            if (!documentType) {
                skippedDocuments.push({
                    documentTypeId,
                    reason: "Document type not found"
                });

                continue;
            }

            // Prevent duplicate assignment
            const exists = await ProjectDocument.findOne({
                assignment: assignmentId,
                documentType: documentTypeId
            });

            if (exists) {
                skippedDocuments.push({
                    documentTypeId,
                    reason: "Already assigned"
                });
                continue;
            }

            const projectDocument = await ProjectDocument.create({
                project: assignment.project,
                assignment: assignment._id,
                documentType: documentType._id
            });

            createdDocuments.push(projectDocument);

        }

        res.status(201).json({
            success: true,
            message: "Documents assigned successfully.",

            createdCount: createdDocuments.length,
            skippedCount: skippedDocuments.length,

            createdDocuments,
            skippedDocuments

        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

// GET DOCUMENTS OF A PROJECT ASSIGNED TO LOGGED-IN EMPLOYEE
export const getMyProjectDocuments = async (req, res) => {

    try {
        const { projectId } = req.params;

        // Verify assignment
        const assignment = await ProjectMember.findOne({
            employee: req.user.id,
            project: projectId
        });

        if (!assignment) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this project."
            });
        }

        const documents = await ProjectDocument.find({
            assignment: assignment._id
        })
            .populate("documentType", "name description estimatedDays mandatory")
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            data: documents
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}