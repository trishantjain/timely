import bcrypt from "bcrypt"
import User from "../../models/auth/User.js"
import jwt from "jsonwebtoken"

// CREATER USER CONTROLLER
export const createUser = async (req, res) => {

    const { username, email, password, role, expertise } = req.body;

    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CREATING USER OBJECT
    const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        expertise
    });

    // SAVING USER
    await user.save()

    // SENDING RESPONSE
    res.json(user)
};

// LOGIN USER CONTROLLER
export const login = async (req, res) => {

    console.time("LOGIN TOTAL");

    const { email, password } = req.body;

    console.time("Find User");

    const user = await User.findOne({ email });

    console.timeEnd("Find User");

    if (!user) {
        console.timeEnd("LOGIN TOTAL");
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    console.time("Compare Password");

    const match = await bcrypt.compare(
        password,
        user.password
    );

    console.timeEnd("Compare Password");

    if (!match) {
        console.timeEnd("LOGIN TOTAL");
        return res.status(401).json({
            message: "Invalid credentials"
        });
    }

    console.time("Generate Token");

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    console.timeEnd("Generate Token");

    console.timeEnd("LOGIN TOTAL");

    user.password = undefined;

    res.json({
        token,
        user
    });
};

export const getUsers = async (req, res) => {

    const users = await User.find({ role: "user" })
        .select("_id username email")

    res.json(users)

}