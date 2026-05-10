const db = require("../db");

const deleteaccount = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        const { id, role } = req.session.user;

        // =========================
        // PATIENT FLOW
        // Patient deactivates own account
        // req.body = { email, password, confirmPassword }
        // =========================
        if (role === "patient") {
            const { email, password, confirmPassword } = req.body;

            if (!email || !password || !confirmPassword) {
                return res.status(400).json({
                    message: "Please fill all fields",
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Passwords do not match",
                });
            }

            const [rows] = await db.query(
                `SELECT user_id, email, password, role, is_active
                 FROM login
                 WHERE user_id = ? AND role = 'patient'`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const user = rows[0];

            if (user.is_active === "deactive") {
                return res.status(400).json({
                    message: "Account already deactivated",
                });
            }

            if (user.email !== email || user.password !== password) {
                return res.status(400).json({
                    message: "Deletion failed",
                });
            }

            await db.query(
                `UPDATE login
                 SET is_active = 'deactive'
                 WHERE user_id = ?`,
                [id]
            );

            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Account deactivated, but logout failed",
                    });
                }

                return res.status(200).json({
                    message: "Account deactivated successfully",
                    redirect: "/index.html",
                });
            });

            return;
        }

        // =========================
        // ADMIN FLOW
        // Admin deactivates doctor/patient account
        // req.body = { targetEmail, adminPassword }
        // =========================
        if (role === "admin") {
            const { targetEmail, adminPassword } = req.body;

            if (!targetEmail || !adminPassword) {
                return res.status(400).json({
                    message: "Please fill all fields",
                });
            }

            const [adminRows] = await db.query(
                `SELECT user_id, email, password, role, is_active
                 FROM login
                 WHERE user_id = ? AND role = 'admin'`,
                [id]
            );

            if (adminRows.length === 0) {
                return res.status(404).json({
                    message: "Admin session not valid",
                });
            }

            const admin = adminRows[0];

            if (admin.is_active === "deactive") {
                return res.status(403).json({
                    message: "Admin account is deactivated",
                });
            }

            if (admin.password !== adminPassword) {
                return res.status(400).json({
                    message: "Deletion failed",
                });
            }

            const [targetRows] = await db.query(
                `SELECT user_id, email, role, is_active
                 FROM login
                 WHERE email = ?`,
                [targetEmail]
            );

            if (targetRows.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const targetUser = targetRows[0];

            if (targetUser.role === "admin") {
                return res.status(400).json({
                    message: "Admin account cannot be deactivated",
                });
            }

            if (targetUser.is_active === "deactive") {
                return res.status(400).json({
                    message: "User already deactivated",
                });
            }

            await db.query(
                `UPDATE login
                 SET is_active = 'deactive'
                 WHERE user_id = ?`,
                [targetUser.user_id]
            );

            return res.status(200).json({
                message: "User deactivated successfully",
                redirect: "/index.html",
            });
        }

        return res.status(403).json({
            message: "Invalid role",
        });
    } catch (err) {
        console.error("deleteuser error:", err);
        return res.status(500).json({
            message: "Deletion failed",
            error: err.message,
        });
    }
};

module.exports = { deleteaccount };