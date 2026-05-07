const db = require("../db");

const SignupUser = async (req, res) => {
  let conn;

  try {
    let { name, email, password, phone_no, dob, gender } = req.body;

    console.log("Signup request body:", req.body);

    if (!name || !email || !password || !phone_no || !dob || !gender) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    password = String(password).trim();      // TODO: hash in real app
    phone_no = String(phone_no).trim();
    gender = String(gender).trim().toLowerCase();

    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    // 1) Insert into login table (common auth)
    const [loginResult] = await conn.query(
      `INSERT INTO login (email, password, role)
       VALUES (?, ?, ?)`,
      [email, password, "patient"]
    );

    const userId = loginResult.insertId;

    // 2) Insert into patient table (profile)
    const [patientResult] = await conn.query(
      `INSERT INTO patient (user_id, name, phone_no, dob, gender)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, phone_no, dob, gender]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Signup successful",
      loginUserId: userId,
      patientId: patientResult.insertId,
      redirect: "/HTML/patient.html"
    });

  } catch (err) {
    if (conn) {
      await conn.rollback();
    }

    console.error("Signup transaction error:", err.message);
    console.error("Error code:", err.code);

    if (err.code === "ER_DUP_ENTRY") {
      // Could be duplicate email or phone number
      return res.status(409).json({
        message: "Email or phone number already exists"
      });
    }

    if (err.code === "ER_BAD_NULL_ERROR") {
      return res.status(400).json({
        message: "A required database field is missing"
      });
    }

    if (err.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        message: "Table does not exist"
      });
    }

    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({
        message: "Database access denied"
      });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Invalid foreign key reference"
      });
    }

    return res.status(500).json({
      message: "Database error"
    });

  } finally {
    if (conn) {
      conn.release();
    }
  }
};

module.exports = { SignupUser };