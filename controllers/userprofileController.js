const db = require("../db");

const userprofile = async (req, res) => {
    try {
        console.log("SESSION USER:", req.session.user);

        if (!req.session.user) {
            return res.status(401).json({
                message: "Please login first",
            });
        }

        const { id, role } = req.session.user;

        if (!id) {
            return res.status(400).json({
                message: "User ID missing in session",
            });
        }

        let rows;

        if (role === "doctor") {
            [rows] = await db.query(
                `SELECT d.name,
                        l.email,
                        d.phone_no,
                        d.dob,
                        d.gender,
                        d.specialization
                 FROM doctor d
                 JOIN login l ON d.user_id = l.user_id
                 WHERE d.user_id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Doctor profile not found",
                });
            }

            return res.status(200).json({
                role: "doctor",
                name: rows[0].name,
                email: rows[0].email,
                phone: rows[0].phone_no,
                dob: rows[0].dob,
                gender: rows[0].gender,
                specialization: rows[0].specialization,
            });
        }

        if (role === "patient") {
            [rows] = await db.query(
                `SELECT p.name,
                        l.email,
                        p.phone_no,
                        p.dob,
                        p.gender
                 FROM patient p
                 JOIN login l ON p.user_id = l.user_id
                 WHERE p.user_id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Patient profile not found",
                });
            }

            return res.status(200).json({
                role: "patient",
                name: rows[0].name,
                email: rows[0].email,
                phone: rows[0].phone_no,
                dob: rows[0].dob,
                gender: rows[0].gender,
            });
        }

        if (role === "admin") {
            [rows] = await db.query(
                `SELECT l.email
                 FROM login l
                 WHERE l.user_id = ? AND l.role = 'admin'`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Admin profile not found",
                });
            }

            return res.status(200).json({
                role: "admin",
                name: "Admin",
                email: rows[0].email,
                phone: "",
                dob: "",
                gender: "",
            });
        }

        return res.status(400).json({
            message: "Invalid role",
        });
    } catch (err) {
        console.error("Profile fetch error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

module.exports = { userprofile };