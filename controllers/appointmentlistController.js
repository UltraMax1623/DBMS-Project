const db = require("../db");

const appointmentlist = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                a.appointment_id,
                p.name AS patient_name,
                d.name AS doctor_name,
                d.specialization,
                a.appointment_date,
                a.appointment_time,
                a.reason,
                a.request AS request_status
            FROM appointment a
            JOIN patient p ON a.patient_id = p.user_id
            JOIN doctor d ON a.doctor_id = d.user_id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `);

        return res.status(200).json(rows);
    } catch (err) {
        console.error("Error loading appointment list:", err.message);
        console.error("Error code:", err.code);

        return res.status(500).json({
            message: "Failed to load appointment list",
        });
    }
};

module.exports = { appointmentlist };