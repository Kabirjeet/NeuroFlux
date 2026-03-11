import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 
                    userExists.email === email
                        ? "Email already registered"
                        : "Username already taken",
                statusCode: 400,
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt,
                },
                token,
            },
            message: "User registered successfully",
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {

        const {email,password} = req.body;

        //validate input
        if(!email || !password){
            return res.status(400).json({
                success : false,
                error : "Please provide email and password",
                statusCode : 400,
            });
        }

        // Check for user (include password for comparison)

        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(401).json({
                success : false,
                error : "Invalid credentials",
                statusCode : 401,
            });
        }

        // check password 

        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return res.status(401).json({
                success : false,
                error : "Invalid credentials",
                statusCode : 401,
            });
        }
        

        // Generate token

        const token = generateToken(user._id);

        res.status(200).json({
            success : true,
            user : {
                id : user._id,
                username : user.username,
                email : user.email,
                profileImage : user.profileImage,
            },
            token,
            message : "Login successful",
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success : true,
            data : {
                id : user._id,
                username : user.username,
                email : user.email,
                profileImage : user.profileImage,
                createdAt : user.createdAt,
                updatedAt : user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
    try {
        const {username , email , profileImage} = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                statusCode: 404
            });
        }

        if(username) user.username = username;
        if(email) user.email = email;
        if(profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success : true,
            data : {
                id : user._id,
                username : user.username,
                email : user.email,
                profileImage : user.profileImage,
            },
            message : "Profile updated successfully",
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
    try {
        const {currentPassword , newPassword} = req.body;

        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success : false,
                error : "Please provide current and new Password",
                statusCode : 400,
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
                statusCode: 404
            });
        }

        // check current password 

        const isMatch = await user.matchPassword(currentPassword);

        if(!isMatch){
            return res.status(401).json({
                success : false,
                error : "Current password is incorrect",
                statusCode : 401,
            });
        }

        // update password 

        user.password = newPassword;

        await user.save();

        res.status(200).json({
            success : true,
            message : "Password changed successfully",

        });

    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email address',
                statusCode: 400,
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent',
            });
        }

        // Generate reset token (in production, send via email)
        // For now, we'll just return success
        // In a real app, you'd use something like:
        // const resetToken = crypto.randomBytes(32).toString('hex');
        // await sendResetEmail(user.email, resetToken);

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent',
        });

    } catch (error) {
        next(error);
    }
};
