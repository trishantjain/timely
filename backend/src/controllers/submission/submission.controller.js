import mongoose from "mongoose";

import Submission from "../../models/submission/Submission.js";
import SubmissionVersion from "../../models/submission/SubmissionVersion.js";
import SubmissionLog from "../../models/submission/SubmissionLog.js";

import ProjectComponent from "../../models/project/ProjectComponent.js";
import ProjectMember from "../../models/project/ProjectMember.js";

import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../../utils/cloudinaryUpload.js";

// Extensions we'll accept at all, regardless of a task's allowedExtensions
// list — a baseline denylist against obviously dangerous upload types.
const DISALLOWED_EXTENSIONS = [
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".msi",
  ".dll",
  ".js",
  ".php",
];

// ==========================================
// VALIDATE FILES AGAINST TASK RULE
// ==========================================
function validateFilesAgainstRule(task, files) {
  const rule = task.submissionRule || {};

  const requiresFiles = rule.type && rule.type !== "TEXT";

  if (requiresFiles && (!files || files.length === 0)) {
    return `This task requires a file submission (${rule.type}).`;
  }

  if (!files || files.length === 0) {
    return null;
  }

  const maxFiles = rule.maxFiles || 1;

  if (files.length > maxFiles) {
    return `Only ${maxFiles} file(s) allowed for this task.`;
  }

  const maxSizeBytes = (rule.maxFileSizeMB || 10) * 1024 * 1024;

  for (const file of files) {
    const ext = "." + file.originalname.split(".").pop().toLowerCase();

    if (DISALLOWED_EXTENSIONS.includes(ext)) {
      return `File type ${ext} is not allowed.`;
    }

    if (
      Array.isArray(rule.allowedExtensions) &&
      rule.allowedExtensions.length > 0 &&
      !rule.allowedExtensions
        .map((e) => e.toLowerCase())
        .includes(ext.replace(".", ""))
    ) {
      return `File type ${ext} is not allowed for this task. Allowed: ${rule.allowedExtensions.join(", ")}`;
    }

    if (file.size > maxSizeBytes) {
      return `File "${file.originalname}" exceeds the ${rule.maxFileSizeMB || 10}MB limit for this task.`;
    }
  }

  return null;
}

// ==========================================
// DELETE CLOUDINARY FILES
// Used if DB transaction fails after upload
// ==========================================
async function cleanupCloudinaryFiles(files) {
  if (!files || files.length === 0) {
    return;
  }

  for (const file of files) {
    try {
      if (file.publicId) {
        await deleteFileFromCloudinary(file.publicId, file.resourceType);
      }
    } catch (err) {
      console.error("[Cloudinary Cleanup Error]", err.message);
    }
  }
}

// ==========================================
// SUBMIT / RESUBMIT TASK
// ==========================================
export const submitTask = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  let uploadedCloudinaryFiles = [];

  try {
    const { projectComponentId, taskId, textSubmission } = req.body;

    const uploadedFiles = req.files || [];

    // ==========================================
    // FIND COMPONENT
    // ==========================================

    const component =
      await ProjectComponent.findById(projectComponentId).session(session);

    if (!component) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Project Component not found.",
      });
    }

    // ==========================================
    // FIND TASK
    // ==========================================

    const task = component.tasks.id(taskId);

    if (!task) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // ==========================================
    // TEXT VALIDATION
    // ==========================================

    if (
      task.submissionRule.type === "TEXT" &&
      (!textSubmission || textSubmission.trim() === "")
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Text submission is required.",
      });
    }

    // ==========================================
    // FILE VALIDATION
    // ==========================================

    const fileValidationError = validateFilesAgainstRule(task, uploadedFiles);

    if (fileValidationError) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: fileValidationError,
      });
    }

    // ==========================================
    // TASK ASSIGNMENT VALIDATION
    // ==========================================

    if (!task.assignedEmployee) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Task not assigned.",
      });
    }

    // ==========================================
    // PROJECT MEMBER VALIDATION
    // ==========================================

    const projectMember = await ProjectMember.findOne({
      project: component.project,
      employee: req.user.id,
    }).session(session);

    if (!projectMember) {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message: "You are not a member of this project.",
      });
    }

    // ==========================================
    // TASK OWNER VALIDATION
    // ==========================================

    if (task.assignedEmployee.toString() !== req.user.id.toString()) {
      await session.abortTransaction();

      return res.status(403).json({
        success: false,
        message: "Task is not assigned to you.",
      });
    }

    // ==========================================
    // FIND OR CREATE SUBMISSION
    // ==========================================

    let submission = await Submission.findOne({
      project: component.project,

      projectComponent: component._id,

      taskId,

      assignedEmployee: task.assignedEmployee,
    }).session(session);

    if (!submission) {
      const createdSubmission = await Submission.create(
        [
          {
            project: component.project,

            projectComponent: component._id,

            taskId,

            assignedEmployee: task.assignedEmployee,

            currentVersion: 0,
          },
        ],
        { session },
      );

      submission = createdSubmission[0];
    }

    // ==========================================
    // VERSION NUMBER
    // ==========================================

    const versionNo = submission.currentVersion + 1;

    // ==========================================
    // UPLOAD FILES TO CLOUDINARY
    // ==========================================

    if (uploadedFiles.length > 0) {
      uploadedCloudinaryFiles = await Promise.all(
        uploadedFiles.map(async (file) => {
          const result = await uploadFileToCloudinary(file, {
            folder: `timely/submissions/${submission._id}/version-${versionNo}`,
          });

          return {
            originalName: file.originalname,

            publicId: result.public_id,

            url: result.url,

            secureUrl: result.secure_url,

            resourceType: result.resource_type,

            mimeType: file.mimetype,

            size: file.size,
          };
        }),
      );
    }

    // ==========================================
    // CREATE FILE METADATA
    // ==========================================
    const fileMetadata = uploadedCloudinaryFiles.map((file) => ({
      originalName: file.originalName,

      publicId: file.publicId,

      url: file.url,

      secureUrl: file.secureUrl,

      resourceType: file.resourceType,

      mimeType: file.mimeType,

      size: file.size,
    }));

    // ==========================================
    // CREATE SUBMISSION VERSION
    // ==========================================

    const version = await SubmissionVersion.create(
      [
        {
          submission: submission._id,

          version: versionNo,

          textSubmission,

          files: fileMetadata,

          submittedBy: req.user.id,
        },
      ],
      { session },
    );

    // ==========================================
    // UPDATE SUBMISSION
    // ==========================================

    submission.currentVersion = versionNo;

    submission.latestSubmission = version[0]._id;

    submission.status = "UNDER_REVIEW";

    await submission.save({
      session,
    });

    // ==========================================
    // UPDATE TASK
    // ==========================================

    task.submissionId = submission._id;

    task.status = "UNDER_REVIEW";

    const anyTaskStarted = component.tasks.some((t) => t.status !== "PENDING");

    if (anyTaskStarted) {
      component.status = "IN_PROGRESS";
    }

    await component.save({
      session,
    });

    // ==========================================
    // CREATE SUBMISSION LOG
    // ==========================================

    await SubmissionLog.create(
      [
        {
          submission: submission._id,

          version: versionNo,

          action: versionNo === 1 ? "SUBMITTED" : "RESUBMITTED",

          performedBy: req.user.id,
        },
      ],
      { session },
    );

    // ==========================================
    // COMMIT TRANSACTION
    // ==========================================

    await session.commitTransaction();

    return res.status(201).json({
      success: true,

      message: "Submitted successfully.",

      data: {
        submissionId: submission._id,

        version: versionNo,

        files: fileMetadata.map((f) => ({
          originalName: f.originalName,

          size: f.size,
        })),
      },
    });
  } catch (err) {
    await session.abortTransaction();

    console.error("[Submission] Submit Error", err);

    // Delete files that were uploaded to
    // Cloudinary if the database operation failed

    await cleanupCloudinaryFiles(uploadedCloudinaryFiles);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  } finally {
    session.endSession();
  }
};

// ==========================================
// VIEW / DOWNLOAD A SUBMITTED FILE
// ==========================================
export const downloadSubmissionFile = async (req, res) => {
  try {
    const { versionId, fileIndex } = req.params;

    const version = await SubmissionVersion.findById(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Submission version not found.",
      });
    }

    const isOwner = version.submittedBy.toString() === req.user.id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this file.",
      });
    }

    const file = version.files[Number(fileIndex)];

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found on this submission.",
      });
    }

    if (!file.secureUrl) {
      return res.status(410).json({
        success: false,
        message: "File URL is not available.",
      });
    }

    return res.redirect(file.secureUrl);
  } catch (err) {
    console.error("[Submission] File View Error", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ==========================================
// REVIEW SUBMISSION
// ==========================================
export const reviewSubmission = async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const { submissionId } = req.params;

    const { reviewStatus, reviewRemark } = req.body;

    // ==========================================
    // FIND SUBMISSION
    // ==========================================

    const submission = await Submission.findById(submissionId).session(session);

    if (!submission) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
    }

    // ==========================================
    // CHECK LATEST VERSION
    // ==========================================

    const version = await SubmissionVersion.findById(
      submission.latestSubmission,
    ).session(session);

    if (!version) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Submission version not found.",
      });
    }

    // ==========================================
    // UPDATE VERSION
    //
    // Using findByIdAndUpdate instead of version.save()
    // prevents validation of old file metadata that
    // may not contain publicId/url/secureUrl.
    // ==========================================

    await SubmissionVersion.findByIdAndUpdate(
      version._id,
      {
        $set: {
          reviewStatus,
          reviewRemark: reviewRemark || "",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      },
      {
        session,
        new: true,
      },
    );

    // ==========================================
    // UPDATE SUBMISSION
    // ==========================================

    submission.status = reviewStatus;

    await submission.save({
      session,
    });

    // ==========================================
    // FIND COMPONENT
    // ==========================================

    const component = await ProjectComponent.findById(
      submission.projectComponent,
    ).session(session);

    if (!component) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Project Component not found.",
      });
    }

    // ==========================================
    // FIND TASK
    // ==========================================

    const task = component.tasks.id(submission.taskId);

    if (!task) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // ==========================================
    // UPDATE TASK STATUS
    // ==========================================

    task.status = reviewStatus;

    // ==========================================
    // UPDATE COMPONENT STATUS
    // ==========================================

    const allApproved = component.tasks.every((t) => t.status === "APPROVED");

    component.status = allApproved ? "COMPLETED" : "IN_PROGRESS";

    await component.save({
      session,
    });

    // ==========================================
    // CREATE SUBMISSION LOG
    // ==========================================

    await SubmissionLog.create(
      [
        {
          submission: submission._id,
          version: version.version,
          action: reviewStatus,
          performedBy: req.user.id,
          remarks: reviewRemark || "",
        },
      ],
      {
        session,
      },
    );

    // ==========================================
    // COMMIT
    // ==========================================

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Submission ${reviewStatus.toLowerCase()} successfully.`,
    });
  } catch (err) {
    await session.abortTransaction();

    console.error("[Submission] Review Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    session.endSession();
  }
};

// ==========================================
// GET SUBMISSION HISTORY
// ==========================================
export const getSubmissionHistory = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,

        message: "Submission not found.",
      });
    }

    const history = await SubmissionVersion.find({
      submission: submissionId,
    })
      .populate("submittedBy", "username email")
      .populate("reviewedBy", "username email")
      .sort({
        version: -1,
      });

    const component = await ProjectComponent.findById(
      submission.projectComponent,
    )
      .populate("project", "name")
      .populate("projectModule", "name");

    const task = component.tasks.id(submission.taskId);

    return res.json({
      success: true,

      submission: {
        id: submission._id,
        currentVersion: submission.currentVersion,
        status: submission.status,
      },

      project: {
        id: component.project._id,
        name: component.project.name,
      },

      component: {
        id: component._id,
        name: component.name,
      },

      module: {
        id: component.projectModule._id,
        name: component.projectModule.name,
      },

      task: {
        id: task._id,
        title: task.title,
        description: task.description,
      },

      latestSubmission: history[0] ? sanitizeVersion(history[0]) : null,

      history: history.map(sanitizeVersion),
    });
  } catch (err) {
    console.error("[Submission] Get History Error", err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

// ==========================================
// SANITIZE SUBMISSION VERSION
// ==========================================
function sanitizeVersion(versionDoc) {
  const v = versionDoc.toObject ? versionDoc.toObject() : versionDoc;

  return {
    ...v,

    files: (v.files || []).map((f, index) => ({
      index,

      originalName: f.originalName,

      mimeType: f.mimeType,

      size: f.size,

      resourceType: f.resourceType,

      previewUrl: f.secureUrl,
    })),
  };
}

// ==========================================
// GET PENDING REVIEWS
// ==========================================
export const getPendingReviews = async (req, res) => {
  try {
    const submissions = await Submission.find({
      status: "UNDER_REVIEW",
    })
      .populate("project", "name")
      .populate("projectComponent", "name")
      .populate("latestSubmission")
      .sort({
        updatedAt: -1,
      })
      .lean();

    return res.json({
      success: true,

      data: submissions,
    });
  } catch (err) {
    console.error("[Submission] Pending Reviews Error", err);

    return res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};
