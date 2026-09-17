const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const usersController = require("../controllers/users.js");

router.get("/signup", usersController.signupPage);

router.post("/signup", wrapAsync(usersController.signup));

router.get("/login", usersController.loginPage);

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  usersController.login,
);

router.get("/logout", usersController.logout);

module.exports = router;
