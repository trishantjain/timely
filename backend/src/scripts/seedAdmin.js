import mongoose from "mongoose"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import User from "../models/User.js"

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)

const existingAdmin = await User.findOne({ role: "admin" })

if (!existingAdmin) {

  const password = await bcrypt.hash("123456", 10)

  await User.create({
    username: "admin",
    email: "admin@test.com",
    password,
    role: "admin"
  })

  console.log("Admin created")

} else {

  console.log("Admin already exists")

}

process.exit()