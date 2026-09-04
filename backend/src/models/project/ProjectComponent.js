import mongoose from "mongoose";

const projectTaskSchema = new mongoose.Schema(
  {
    // Reference to original template task
    templateTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    displayOrder: {
      type: Number,
      default: 1,
    },

    required: {
      type: Boolean,
      default: true,
    },

    submissionRule: {
      type: {
        type: String,
        enum: [
          "TEXT",
          "DOCUMENT",
          "PDF",
          "IMAGE",
          "ZIP",
          "EXCEL",
          "MULTIPLE",
          "CHECKBOX",
        ],
        default: "TEXT",
      },

      allowedExtensions: {
        type: [String],
        default: [],
      },

      maxFiles: {
        type: Number,
        default: 1,
      },

      maxFileSizeMB: {
        type: Number,
        default: 10,
      },
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },

    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "SUBMITTED",
        "UNDER_REVIEW",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    // Employees tagged on this task so they can be looped in / handed
    // information about it (e.g. "@mention" a colleague on a task).
    tags: {
      type: [
        {
          employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          message: {
            type: String,
            default: "",
            trim: true,
          },

          taggedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    _id: true,
  },
);

const projectComponentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    projectModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectModule",
      // Optional so a project can hold a lightweight, template-less
      // container (e.g. the auto-created "Manual Tasks" work item)
      // for ad-hoc admin tasks that aren't tied to a module.
      // All existing components already have this set, so this
      // relaxation is fully backward compatible.
      required: false,
      default: null,
    },

    componentTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComponentTemplate",
      // Optional for the same reason as `projectModule` above —
      // manually created work items are not snapshotted from a
      // template. Existing template-based components are unaffected.
      required: false,
      default: null,
    },

    // True only for the auto-created container that holds tasks an
    // admin adds directly to a project with no existing work items.
    isManualContainer: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    tasks: {
      type: [projectTaskSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      default: "NOT_STARTED",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

projectComponentSchema.index({
  project: 1,
  componentTemplate: 1,
});

export default mongoose.model("ProjectComponent", projectComponentSchema);
