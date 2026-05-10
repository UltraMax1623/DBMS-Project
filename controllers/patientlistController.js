const db = require("../db");

const patientlist = async (req, res) => {
	console.log("loadPatients route hit");
	try {
		const [rows] = await db.query(`
      SELECT 
    p.user_id,
    p.name,
    l.email,
    p.phone_no,
    p.dob,
    p.gender
FROM patient p
JOIN login l ON p.user_id = l.user_id
WHERE l.role = 'patient'
ORDER BY p.user_id ASC;
    `);

		return res.status(200).json(rows);
	} catch (err) {
		console.error("Error loading doctor list:", err.message);
		console.error("Error code:", err.code);

		return res.status(500).json({
			message: "Failed to load patient list",
		});
	}
};

module.exports = { patientlist };
