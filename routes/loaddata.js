const express = require("express");
const router = express.Router();

const { doclist } = require("../controllers/doclistController");
const { patientlist } = require("../controllers/patientlistController");

router.get("/doctorlist", doclist);
router.get("/patientlist",patientlist);

module.exports = router;