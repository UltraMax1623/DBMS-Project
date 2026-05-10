const db = require("../db");

const docupdatestatus = async (req, res) => {
    try {
        const { appointment_id, status } = req.body;

        if (!appointment_id || !status) {
            return res.status(400).json({
                message: "appointment_id and status are required",
            });
        }

        const allowedStatuses = ["pending", "confirmed", "declined", "completed"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
            });
        }

        const [result] = await db.query(
            `UPDATE appointment
             SET request = ?
             WHERE appointment_id = ?`,
            [status, appointment_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        return res.status(200).json({
            message: "Status updated successfully",
            appointment_id,
            status,
        });
    } catch (err) {
        console.error("docupdatestatus error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};

module.exports = { docupdatestatus };