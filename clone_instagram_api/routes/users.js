const express = require("express");

const router = express.Router();

const {
  login,
  signup,
  getProfile,
  updateProfile,
  deleteProfile,
  changeProfileType,
  follow,
  unfollow,
  changeRequestStatus,
} = require("../controllers/userController");
const authenticate = require("../middleware/auth");

// login
router.post("/login", login);

// verify user
router.get("/verify", authenticate, (req, res) => {
  res.status(200).json({ success: true, message: "verified", user: req.user });
});

router.post("/logout", (req, res) => {
  // delete cookie
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "logged out" });
});
// signup
router.post("/signup", signup);

// get profile
router.get("/profile", getProfile);

// update profile
router.put("/profile", updateProfile);

// delete profile
router.delete("/profile", deleteProfile);

// change profile type
router.put("/type/:isPrivate", changeProfileType);

// to follow someone
router.put("/follow/:id", follow);

// to unfollow someone
router.put("/unfollow/:id", unfollow);

// to change status of follow request
router.put("/request", changeRequestStatus);

module.exports = router;
