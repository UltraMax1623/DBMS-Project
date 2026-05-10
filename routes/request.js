const express = require("express");
const router = express.Router();

const { reqappointment } = require("../controllers/reqappointmentController");
const { updateAppointmentStatus } = require("../controllers/updateAppointmentStatusController");

router.post("/reqappointment", reqappointment);
router.post("/appointmentstatus", updateAppointmentStatus);

module.exports = router;