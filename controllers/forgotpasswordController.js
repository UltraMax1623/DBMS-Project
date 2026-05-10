const db = require("../db");

const forgotpassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
            });
        }

        const [rows] = await db.query(
            "SELECT user_id, role FROM login WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Patient account not found",
            });
        }

        if (rows[0].role !== "patient") {
            return res.status(403).json({
                message: "Only patients can reset password",
            });
        }

        await db.query(
            "UPDATE login SET password = ? WHERE email = ?",
            [password, email]
        );

        return res.status(200).json({
            message: "Password reset successful",
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = { forgotpassword };