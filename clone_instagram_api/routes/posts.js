const express = require("express");

const router = express.Router();
const {
  createPost,
  deletePost,
  updatePost,
  userNewsFeed,
  getAllPost,
} = require("../controllers/postController");

const authtication = require("../middleware/auth");

// create post
router.post("/", authtication, createPost);

// update post
router.put("/", authtication, updatePost);

// delete post
router.delete("/", authtication, deletePost);

// User News Feed
router.get("/", authtication, getAllPost);

module.exports = router;
