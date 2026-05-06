const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const { loginUser } = require("../controllers/loginController");
//router.get("/:username/:password/:role", loginUser);
router.post("/", loginUser);
module.exports = router;
