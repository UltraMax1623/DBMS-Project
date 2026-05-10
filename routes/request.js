const express = require("express");
const router = express.Router();

const { reqappointment } = require("../controllers/reqappointmentController");
const { updateAppointmentStatus } = require("../controllers/updateAppointmentStatusController");
const {docupdatestatus } = require("../controllers/docupdatestatusController");
const { deleteaccount } = require("../controllers/deleteaccountContoller")

router.post("/reqappointment", reqappointment);
router.post("/appointmentstatus", updateAppointmentStatus);
router.post("/docupdatestatus", docupdatestatus);
router.post("/deleteaccount",deleteaccount);

module.exports = router;