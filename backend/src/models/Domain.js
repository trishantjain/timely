import mongoose from "mongoose";

const domainSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    color: {
        type: String,
        default: "#2563eb"
    },

    isActive: {
        type: Boolean,
        default: true
    }

},
{
    timestamps: true
});

export default mongoose.model("Domain", domainSchema);