const Post = require("../models/Posts");
// const { login } = require("./userController");
const User = require("../models/Users");
const Like = require("../models/Likes");

const { successResponse, failureResponse } = require("./utils");

//get this id from token after logging in
// const MY_ID = "651bc49b15918bbec8c7ceec"; // this is Yogini id
// const MY_ID = "651bc45015918bbec8c7cee8"; // this is Rahul's id
const MY_ID = "651fca83d6296e155c186287"; // risit id

const createPost = async (req, res) => {
  try {
    const { contentUrl, description, tags } = req.body;
    const userId = req.user.user._id;

    const post = await Post.create({
      contentUrl,
      description,
      tags,
      userId,
    });
    successResponse(
      res,
      {
        message: "Post created successfully",
        post,
      },
      201
    );
  } catch (error) {
    console.log(error);
    failureResponse(res, error);
  }
};

const deletePost = async (req, res) => {
  try {
    let userId = MY_ID; // fetch from the token through req.user._id;
    let postId = req.params.postId;
    let post = await Post.deleteOne({ _id: postId, userId });
    if (!post.deletedCount) failureResponse(res, "Post not found.");
    else {
      successResponse(res, "Post deleted Successfully.");
    }
  } catch (error) {
    console.log(error);
    failureResponse(res, error);
  }
};

const updatePost = async (req, res) => {
  // only change description and or tags
  try {
    let userId = MY_ID;
    const { description, tags } = req.body;
    // find user by userId
    let user = await User.findById(userId);
    if (user) {
      if (description) {
        user.description = description;
      }
      if (tags) {
        user.tags = tags;
      }
      await user.save();
      successResponse(res, "Profile updated successfully");
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    failureResponse(res, error);
  }
};

const getAllPost = async (req, res) => {
  try {
    // const { following } = req.user.user; // ["id1", "id2", "id3"]

    // const posts = await Post.find({ userId: { $in: following } }).populate({
    //   path: "userId",
    //   select: "-password",
    // });

    const post = await Post.find().populate({
      path: "userId",
      select: "-password",
    });

    successResponse(res, post);
  } catch (e) {
    failureResponse(res, e);
  }
};

const userNewsFeed = async (req, res) => {
  try {
    // 1. get all user who we follow
    // 2. Calculate Score for each user initially it will be 0;
    // 3. Using comments and like we evaluate score by adding 1 for eachcomment and like
    // 4. sort the user according to score.
    // 5. Get all posts of these users (users who we follow)
    // 6. Sort the posts according to score

    const userId = MY_ID; // fetch from the token through req.user>_id;
    const user = await User.findById(userId);
    // check if user exist
    if (user) {
      // 1. get all user we follow
      const followingUsers = user.following;
      // 2. Calculate Score for each user initiaaly it will be 0
      const usersScore = {};
      followingUsers.forEach((userId) => {
        usersScore[userId.toString()] = 0;
      });
      // 3. Using comments and likes we evaluate score by adding 1 for each comment and like
      // fetching all likes and comments done by the user (i.e. me)
      const comments = await Comment.find({ userId });
      const likes = await Like.find({ userId });
      let allPromises = [];
      // adding score for comments
      comments.forEach((comment) => {
        const postId = comment.postId.toString();
        allPromises.push(
          Post.findById(postId)
            .then((post) => {
              const userId = post.userId.toString();
              usersScore[userId] += 1;
            })
            .catch((err) => {
              console.log("Err in comment", err);
            })
        );
      });
      // adding score for like
      likes.forEach((like) => {
        const postId = like.postId.toString();
        allPromises
          .push(Post.findById(postId))
          .then((post) => {
            const userId = post.userId.toString();
            usersScore[userId] += 1;
          })
          .catch((err) => {
            console.log("Err in likes", err);
          });
      });
      await Promise.all(allPromises);
      //4. sort the user according to score
      let userScoreArray = [];
      Object.keys(usersScore).forEach((userId) => {
        userScoreArray.push({ userId: userId, score: usersScore[userId] });
      });
      // Sorting users according to score in Descending order
      userScoreArray = userScoreArray.sort(
        (entry1, entry2) => entry2.score - entry1.score
      );
      // 5. get all the posts of these users (users who we follow)
      let allFollowingUserPosts = await Post.find({
        userId: { $in: followingUsers },
      });
      // 6. Sort the posts according to score
      allFollowingUserPosts = allFollowingUserPosts.sort((post1, post2) => {
        const user1 = post1.userId.toString();
        const user2 = post2.userId.toString();
        const post1Score = usersScore[user1];
        //userScore = { userId1: score1, userId2: score2, ... }
        const post2Score = usersScore[user2];
        return post2Score - post1Score;
      });
      successResponse(res, allFollowingUserPosts);
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    failureResponse(res, error.message || error);
  }
};

module.exports = {
  createPost,
  deletePost,
  updatePost,
  userNewsFeed,
  getAllPost,
};
