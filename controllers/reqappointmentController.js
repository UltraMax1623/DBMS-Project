const db = require("../db");

const reqappointment = async (req, res) => {
	console.log("session in reqappointment:", req.session);
	console.log("session.user:", req.session.user);
	let conn;

	try {
		const patient_id = req.session.user.id;
		const { doctor_id, date, category, textInput } = req.body;

		if (!patient_id) {
			return res.status(401).json({ message: "User not logged in" });
		}

		if (!doctor_id || !date || !category || !textInput) {
			return res.status(400).json({ message: "All fields are required" });
		}

		conn = await db.getConnection();
		await conn.beginTransaction();

		console.log(req.body);

		const [result] = await conn.query(
			`INSERT INTO appointment 
            (patient_id, doctor_id, appointment_date, appointment_time, reason, request)
            VALUES (?, ?, ?, ?, ?, ?)`,
			[patient_id, doctor_id, date, category, textInput, "pending"],
		);

		await conn.commit();

		return res.status(201).json({
			message: "Appointment created successfully",
			appointmentId: result.insertId,
		});
	} catch (err) {
		if (conn) await conn.rollback();

		console.error("Appointment insert error:", err.message);
		console.error("Error code:", err.code);

		return res.status(500).json({
			message: "Database error while creating appointment",
		});
	} finally {
		if (conn) conn.release();
	}
};

module.exports = { reqappointment };
