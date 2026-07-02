import bcrypt from "bcrypt"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

// CREATER USER CONTROLLER
export const createUser = async (req, res) => {

    const { username, email, password, role } = req.body;

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATING USER OBJECT
    const user = new User({
        username,
        email,
        password: hashedPassword,
        role
    });

    // SAVING USER
    await user.save()

    // SENDING RESPONSE
    res.json(user)
};

// LOGIN USER CONTROLLER
export const login = async (req, res) => {
    const { email, password } = req.body;

    // FINDING USER WITH EMAIL
    const user = await User.findOne({ email });

    // RETURNING ERROR IF EMAIL NOT FOUND
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // MATCHING PASSWORD
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // CREATING TOKEN AND SENDING RESPONSE
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    //! HAVE TO VERIFY WORKING
    user.password = undefined

    res.json({ token, user });

};

export const getUsers = async (req, res) => {

  const users = await User.find({ role: "user" })
    .select("_id username email")

  res.json(users)

}