const express = require("express");
const { registerUser, loginUser, currentUser } = require("../controllers/authController");


const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/get_current_user",currentUser);

module.exports = router;