import express from "express";
const router = express.Router();
import { createUser, loginUser, refreshUser, logoutUser, googleAuthenticator, enableF2a, disableFactor2Auth } from "../controllers/sessionController.js";
import { stringValidation, booleanValidation } from "../middlewares/AuthMiddlewares.js";
// sign-up route
router.post("/sign-up", stringValidation("fullName"), stringValidation("email"), stringValidation("password"), createUser);
// login-route
router.post("/login", stringValidation("email"), stringValidation("password"), loginUser);
// to refresh the access token
router.post("/refresh", stringValidation("refreshToken"), booleanValidation("isGoogleUser"), refreshUser);
// to log the user out
router.delete("/logout", logoutUser);
router.post("/google", stringValidation("code"), googleAuthenticator);
router.post("/enable-f2a", stringValidation("email"), enableF2a);
router.delete("/disable-factor2Auth/:id", disableFactor2Auth);
export default router;
