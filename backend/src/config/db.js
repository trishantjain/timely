import mongoose from "mongoose";

mongoose.set("debug", function (collection, method, query, doc) {
    console.log("================================");
    console.log(collection);
    console.log(method);
    console.log(query);
    console.log(doc);
    console.log("================================");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected")
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

export default connectDB