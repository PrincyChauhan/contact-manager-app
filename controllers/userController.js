const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = asyncHandler(async(req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword)
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })
    console.log(user);
    if (user) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
        })
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
    res.json({ message: "Register user" });
});


const loginUser = asyncHandler(async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1m" })
        res.json({ accessToken });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

const currentUser = asyncHandler(async(req, res) => {
    res.json({ message: "Current user" });
});


module.exports = { registerUser, loginUser, currentUser }