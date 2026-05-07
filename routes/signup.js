const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const { SignupUser } = require("../controllers/signupController");

router.post("/", SignupUser);
module.exports = router;