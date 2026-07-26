const express = require("express");
const router = express.Router({ mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../controllers/users.js");

//router.get("/dashboard", isLoggedIn, userController.renderDashboard);
//router.get("/profile", isLoggedIn, userController.renderDashboard);

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get(userController.renderLoginForm)
.post(passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), userController.login);


// router.get("/signup", userController.renderSignupForm);

// router.post("/signup", wrapAsync(userController.signup));

// router.get("/login", userController.renderLoginForm);

// router.post("/login", passport.authenticate("local", {failureRedirect: '/login', failureFlash: true}), userController.login);

//router.get("/:username", wrapAsync(userController.renderProfile));
router.get("/logout", userController.logout);

module.exports = router;
