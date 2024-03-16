const express = require("express")
const router = express.Router()
const sessionController = require("../controllers/sessionController.js")

const { body } = require("express-validator")
// to validate the incoming string
const stringValidation  = (string)=> body(string).isString().trim().escape()

// sign-up route
router.post(
    "/sign-up", 
    stringValidation("fullName"), 
    stringValidation("email"),
    stringValidation("password"),
    sessionController.createUser)
                         
// login-route
router.post("/login", stringValidation("email"), stringValidation("password"), sessionController.loginUser)

// to refresh the access token
router.post("/refresh", sessionController.refreshUser)

// to log the user out
router.delete("/logout", sessionController.logoutUser)

router.post("/google", sessionController.googleAuthenticator)
module.exports = router