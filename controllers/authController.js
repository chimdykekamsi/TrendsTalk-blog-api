const asyncHandler = require("express-async-handler");
const User = require("../modules/userModule");
const crypto = require("crypto");

// Method POST
// Endpoint {baseurl}/auth/register
// Desc Register and authenticate new user

const registerUser = asyncHandler(
    async (req, res, next) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(400);
            throw new Error("All fields are required!");
        }

        const userAvailable = await User.findOne({ email });

        if (userAvailable) {
            res.status(400);
            throw new Error("User already registered");
        }

        const hashedPassword = crypto
            .createHash('sha256') 
            .update(password)
            .digest('hex');

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        console.log({ user });

        if (user) {
            return res.status(201)
                .json({
                    message: "Registration Successful",
                    _id: user.id,
                    email: user.email,
                    role:user.role
                });
        } else {
            res.status(400);
            throw new Error("Registration Failed");
        }
    }
);

module.exports = {
    registerUser
};
