const express = require("express")
const router = express.Router()
const sessionController = require("../controllers/sessionController.js")
const { stringValidation } = require("../middlewares/middlewares.js")
const { body } = require("express-validator")

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

router.post("/enable-f2a",  stringValidation("email"), stringValidation("refreshToken"), body("isGoogleUser").escape().isBoolean(), sessionController.enableF2a )

router.delete("/disable-factor2Auth/:id", sessionController.disableFactor2Auth)
module.exports = router