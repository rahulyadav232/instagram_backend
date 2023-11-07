const Comment = require("../models/Comments");
const Post = require("../models/Posts");
const { successResponse, failureResponse} = require("./utils");

//get this id from token after logging in
// const MY_ID = "651bc49b15918bbec8c7ceec"; // this is Yogini id
const MY_ID = "651bc45015918bbec8c7cee8"; // this is Rahul's id
// const MY_ID = "651bc47615918bbec8c7ceea"; // risit id

const createComment =async (req, res) => {
try {
  // implementing logic to check if user is allowed to see the comments or not like getProfile
  const userId = MY_ID;
  const postId = req.params.postId;
  const {message} = req.body;
  await Comment.create({userId, postId, message });
  successResponse(res, "Comment created sucessfully");
} catch (error) {
  failureResponse(res, error)
}
};

const deleteComment =async (req, res) => {
try {
  const userId= MY_ID;
  const commentId = req.params.commentId;
  const comment = await Comment.findById(commentId);
  // check if the comment exists and the comment is done by the user(i.e us)
  if (comment){
    const postId = comment.postId;
    const post = await Post.findById(postId);
     // if the comment exists then check if the comment is done by the user(i.e. us)
      // also implement logic that the user who owns the post can delete the comment
      if (
        comment.userId.toString()=== userId || post.userId.toString() === userId
      ) {
        await Comment.deleteOne({ _id: commentId });
        successResponse(res,"Comment deleted successfully");
      } else {
        failureResponse(res,"You can not delete comment done by other users.");
      }
  } else {
    failureResponse (res, "No comment found");
  }
} catch (error) {
  failureResponse(res, error)
}
};

const likeComment =async (req, res) => {
try {
  const userId = MY_ID;//req.user._id from token;
  const commentId = req.params.commentId;
  const comment = await Comment.findById(commentId);
  //
  if (comment){
    //check if user has already liked the comment or not
    if (comment.likes.includes(userId)){
      failureResponse(res, "You have already like the comment");
    } else {
      // if not then add the user to the likes array
      comment.likes.push(userId);
      await comment.save();
      // await Comment.updateOne({ _id: commentId }, { likes: comment.likes })
      successResponse(res, "Comment Like successfully");
    }
  }else {
    failureResponse(res, "No comment found")
  }
} catch (error) {
  failureResponse(res, error)
}
};

const replyComment =async (req, res) => {
try {
    // implement logic to check if user is allowed to see the comments or not like getProfile
    const userId = MY_ID; //req.user._id from token;
    const commentId = req.params.commentId;
    const { message } = req.body;
    const comment = await Comment.findById(commentId);
    if (comment) {
      comment.replies.push({ userId, message });
      await comment.save();
      // await Comment.updateOne({ _id: commentId }, { replies: comment.replies })
      successResponse(res, "Comment reply added.");
    } else {
      failureResponse(res, "No Comment found.");
    }
} catch (error) {
  failureResponse(res, error)
}
};

const getPostComments =async(req,res) => {
try {
  // implement logic to check if user is allowed to see the comments or not like getProfile
  const userId = MY_ID;
  // userid is to validate whether the user is allowed to see the comment 
  const postId = req.params.postId;
  const comments = await Comment.find({ postId }).populate("userId", "username").sort("createdAt");
  successResponse(res,comments);

} catch (error) {
  failureResponse(res, error)
}
}

module.exports = {
  createComment,
  deleteComment,
  likeComment,
  replyComment,
  getPostComments,
};
