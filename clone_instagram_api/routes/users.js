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

// signup
router.post("/signup", signup);

// get profile
router.get("/profile", authenticate, getProfile);

// update profile
router.put("/profile", authenticate, updateProfile);

// delete profile
router.delete("/profile", authenticate, deleteProfile);

// change profile type
router.put("/type/:isPrivate", authenticate, changeProfileType);

// to follow someone
router.put("/follow/:id", authenticate, follow);

// to unfollow someone
router.put("/unfollow/:id", authenticate, unfollow);

// to change status of follow request 
router.put("/request", authenticate, changeRequestStatus);


module.exports = router;
