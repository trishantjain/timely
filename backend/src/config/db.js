import mongoose from "mongoose";

// Verbose per-query logging is useful in development but noisy (and a
// minor info leak) in production — gate it behind NODE_ENV instead of
// always-on.
if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", function (collection, method, query, doc) {
    });
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export default connectDB;
