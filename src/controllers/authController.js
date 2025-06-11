import UserModel from "../models/user.models.model.js";


const register = async (req, res) => {
    try {
        const { name, username, email, phone, password } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { phone }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email, phone, or username"
            });
        }

        // Create new user 
        const newUser = await UserModel.create({
            name,
            username,
            email,
            phone,
            password,
            isVerified: false
        });

        // Remove password from response
        newUser.password = undefined;

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        });

    } catch (error) {
        // Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                error: Object.values(error.errors).map(err => err.message)
            });
        }

        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}








const login = () => {

}





const logout = () => {

}



export {
    register,
    login,
    logout
}