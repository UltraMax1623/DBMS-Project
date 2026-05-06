const db = require("../db");

const loginUser = async (req, res) => {
	try {
		const { username, password, role } = req.body;

		if (!username || !password || !role) {
			return res.status(400).json({ message: "All fields are required" });
		}

		const [rows] = await db.query(
			"SELECT * FROM login WHERE username = ? AND password = ? AND role = ?",
			[username, password, role],
		);

		if (rows.length === 0) {
			return res
				.status(401)
				.json({ message: "Invalid username, password, or role" });
		}

		req.session.user = {
			id: rows[0].id,
			username: rows[0].username,
			role: rows[0].role,
		};

		let redirectPage = "";

		switch (rows[0].role) {
			case "doctor":
				redirectPage = "/HTML/doctor.html";
				break;
			case "patient":
				redirectPage = "/HTML/patient.html";
				break;
			case "admin":
				redirectPage = "/HTML/admin.html";
				break;
			default:
				return res.status(403).json({ message: "Unknown role" });
		}

		return res.status(200).json({
			message: "Login successful",
			user: req.session.user,
			redirect: redirectPage,
		});
	} catch (err) {
		console.error("Login controller error:");
		console.error(err.message);

		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

module.exports = { loginUser };
