import mongoose from "mongoose";

const documentTypeSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    domain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    template: {
        type: String,
        default: ""
    },

    mandatory: {
        type: Boolean,
        default: true
    },

    estimatedDays: {
        type: Number,
        default: 7
    }

},
{
    timestamps: true
});

export default mongoose.model("DocumentType", documentTypeSchema);