// 

const db = require("../db");

const SignupDoc = async (req, res) => {
  let conn;

  try {
    let { name, email, password, phone_no, dob, gender, specialization } = req.body;

    console.log("Signup request body:", req.body);

    if (!name || !email || !password || !phone_no || !dob || !gender || !specialization) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = String(name).trim();
    email = String(email).trim().toLowerCase();
    password = String(password).trim();
    phone_no = String(phone_no).trim();
    gender = String(gender).trim().toLowerCase();
    specialization = String(specialization).trim();

    if (!["male", "female"].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    const [loginResult] = await conn.query(
      `INSERT INTO login (email, password, role)
       VALUES (?, ?, ?)`,
      [email, password, "doctor"]
    );

    const userId = loginResult.insertId;

    const [doctorResult] = await conn.query(
      `INSERT INTO doctor (user_id, name, specialization, phone_no, dob, gender)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, specialization, phone_no, dob, gender]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Doctor signup successful",
      loginUserId: userId,
      email:email,
      password: password,
      doctorId: doctorResult.insertId || userId,
    });

  } catch (err) {
    if (conn) {
      await conn.rollback();
    }

    console.error("Signup transaction error:", err.message);
    console.error("Error code:", err.code);

    if (err.code === "ER_DUP_ENTRY") {
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

module.exports = { SignupDoc };