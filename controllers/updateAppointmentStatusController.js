const db = require("../db");

const updateAppointmentStatus = async (req, res) => {
    console.log("loadPatients route hit");
    try {
        const { appointment_id, status } = req.body;

        if (!appointment_id || !status) {
            return res.status(400).json({ message: "Appointment ID and status are required" });
        }

        if (!["pending","confirmed", "declined"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const [result] = await db.query(
            `UPDATE appointment
             SET request = ?
             WHERE appointment_id = ?`,
            [status, appointment_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        return res.status(200).json({
            message: "Appointment status updated successfully",
        });
    } catch (err) {
        console.error("Error updating appointment status:", err.message);
        console.error("Error code:", err.code);

        return res.status(500).json({
            message: "Failed to update appointment status",
        });
    }
};

module.exports = { updateAppointmentStatus };