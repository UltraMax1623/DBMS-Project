const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const { SignupUser } = require("../controllers/signupController");
const { SignupDoc} = require("../controllers/signupdocController")
router.post("/patient", SignupUser);
router.post("/doc",SignupDoc);
module.exports = router;