const Like = require("../models/Likes");
const User = require("../models/Users");
const Post = require("../models/Posts");
const { successResponse, failureResponse} = require("./utils")

//get this id from token after logging in
// const MY_ID = "651bc49b15918bbec8c7ceec"; // this is Yogini id
const MY_ID = "651bc45015918bbec8c7cee8"; // this is Rahul's id
// const MY_ID = "651bc47615918bbec8c7ceea"; // risit id

const createLike =async (req, res) => {
try {
  let userId =MY_ID;
  let postId = req.params.postId;
  let existingLike = await Like.findOne({userId,postId});
  let user = await User.findOne({userId});
  let post = await Post.findOne({postId});
  // if the user and post exists
  if (user){
    if(post){
      // if like already exist
      if (existingLike){
        failureResponse(res,"like already exist")
      } else {
        await Like.create({ userId, postId});
        successResponse(res, "You have like the post.");
      }
    } else {
      failureResponse(res," Post not found")
    }
  } else {
    failureResponse(res, "User not found")
  }
} catch (error) {
failureResponse(res,error)  
}
};

const removeLike =async (req, res) => {
try {
  let userId =MY_ID;
  let postId= req.params.postId;
  await Like.findOneAndDelete({ userId, postId});
  successResponse(res, "You have unlike the post");
} catch (error) {
failureResponse(res,error)  
}
};

const getLikes = async (req,res) => {
try {
  // implement logic user that allows to see the likes or not
  // same logic as getProfile
  let postId = req.params.postId;
  let likes= await Like.findOne({ postId }).populate("userId", "username");
  successRespone(res, likes);
} catch (error) {
failureResponse(res,error)  
}
}

module.exports = {
  createLike,
  removeLike,
  getLikes,
};
