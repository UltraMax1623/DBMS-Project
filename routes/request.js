const express = require("express");
const router = express.Router();

const { reqappointment } = require("../controllers/reqappointmentController");

router.post("/reqappointment", reqappointment);

module.exports = router;