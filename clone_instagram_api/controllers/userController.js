const User = require("../models/Users");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const { failureResponse, successResponse } = require("./utils");
const { find } = require("../models/Likes");
const { default: mongoose } = require("mongoose");

//get this id from token after logging in
//  const MY_ID = "651bc49b15918bbec8c7ceec"; // this is Yogini id
//const MY_ID = "651bc45015918bbec8c7cee8"; // this is Rahul's id
const MY_ID = "651fca1ad6296e155c186283"; // pawan 


const saltRounds = 10;

const secret = "mysecret";


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      failureResponse(res, "Please provide email and password", 400);
    } else {
      const user = await User.findOne({email});
      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password) ;
      if (passwordMatch) {
        // create token
        const token = jwt.sign(
          {id: user._id, email: user.email}, secret, { expiresIn: "48h"}
        );

        successResponse(res, { message: "login successfull", token });
      } else {
        failureResponse(res, "Password is incorrect", 400);
      } 
       }else{
        failureResponse(res, "User not found", 400);
       }
    }

  } catch (error) {
    failureResponse(res, error);
  }
};

const signup = async (req, res) => {
  try{
  const { email, username, password, userInfo, followers, following } = req.body;
  // if (!email || !username || !password || !userinfo) {
  //   failureResponse(res, "Please provide all required fields");
  // } else {

  // console.log(req.body);
  const hashPassword = await bcrypt.hash(password, saltRounds);
  const user = new User({
    email,
    username,
    password: hashPassword,
    userInfo,
    followers: [],
    following: [],
    pending: [],
  });
  const newUser = await user.save();
  successResponse(res, "User Created Successfully", 201);
} catch (error) {
  console.log(error)
  failureResponse(res, error);
}
}; 

const getProfile = async (req, res) => {
  // No. of profiles we can get:
  // 1. Our own Profile
  // 2. Public Profiles
  // 3. Following Profiles
// if we are allowed to see the profile then we will fetch the posts else we will send a message saying that we are not allowed to see the profile
try {
  let userId = MY_ID;
  let otherUserId = req.params.id; // id of the profile which we want to see
  let user = await User.findById(userId);
  let otherUser = await User.findById(otherUserId).lean();
  if (user && otherUser) {
    let posts = await Post.find({userId: otherUserId});
    if (userId=== otherUserId){
      delete otherUser.email;
      delete otherUser.pending;
      successResponse(res, {user: otherUser,posts});
    }
    // check if profile is private or public
    else if (otherUser.profileType === "public"){
      delete otherUser.password;
        delete otherUser.email;
        delete otherUser.pending;
        delete otherUser._id;
        successResponse(res, {user: otherUser, posts});
    } else {
      // if private then check if we are following the user 
      if (user.following.includes(otherUserId)) {
        delete otherUser.password;
          delete otherUser.email;
          delete otherUser.pending;
          delete otherUser._id;
          successResponse(res, { user: otherUser,posts});
      } else {
        failureResponse(res, "You are not allowed to see this profile");
      }
    }
  } else {
    failureResponse(res, " User not found");
  }
} catch (error) {
  failureResponse(res, error)
}
};

const updateProfile =async (req, res) => {
try {
  let userId = MY_ID;
  const { userInfo, username} = req.body;
  // find user by useId
  let user = await User.findById(userId);
  if (user) {
    if (userInfo) {
      user.userInfo = userInfo;
    }
    if (username) {
      user.username = username;
    }
    await user.save();
      return res.status(201).json({ message: "Profile updated successfully" });
  }else {
    return res.status(400).json({ message: "User not found" });
  }
} catch (error) {
  console.log(error);
  failureResponse(res, error)
}
};

const deleteProfile =async (req, res) => {
  try {
    const userId = MY_ID;
    // find user by email id
    let user = await User.findById(userId);
    if(userId){
      await User.deleteOne({_id: userId})
      return res.status(200).json({message:"profile deleted sucessfully"})
    } else{
      return res.status(400).json({ message: "User not found"})
    }
  } catch (error) {
    console.log(error);
    failureResponse(res, error)
  }
};

const changeProfileType =async (req, res) => {
  // change from private to public and vice versa
  try {
    const userId = MY_ID;
    const { isPrivate }= req.params;
    const user = await User.findById(userId);
    // if user exist 
    if (user) {
      // condition ? execute if condition is true : execute if condition is false
     if (isPrivate == "true") {
      user.profileType = "Private";
     } else {
      user.profileType = "Public";
     }
      await user.save();
      successResponse(res, "Profile type changed successfully");
    } else {
      failureResponse(res, "User not found");
    }
  } catch (error) {
    console.log(error);
    failureResponse(res,error);
  }
};

const follow = async (req,res) => {
  // to follow someone: Person A want to follow Person B;
  // 1. Check whether Person B has a public or a private profile. ❌
  // 1.a) check whether Person A is already following Person B ❌
  //2. a) Check if Person B is not Person A. ❌
  // 2. if person B has a public profile.
  // 2.a) then add Person A to Person B's followers list and add Person B to Person A's following list
  // 3. if person B has a private profile then add Person A to Person B's pending list
  // 3.b) if person B accepts Person A's request then repeat step 2.a
  // 4. if person B rejects person A request then remove Person A from Person B's pending list
try {
  let userId = MY_ID; //Person A
  let otherUserId = req.params.id; // Person B
  let user = await User.findById(userId);
  let otherUser = await User.findById(otherUserId);
  if (user&& otherUser){
    if (userId === otherUserId){
      // check if you are accidentally following yourself
      failureResponse(res, "you can't follow yourself");
    } else {
      if (user.following.includes(otherUserId)){
        // check if you already following the other person B
        failureResponse(res, "you are already following this person");

       }else if(otherUser.followers.includes(userId)) {
      // Check if the other person B is already following you
      failureResponse(res, "You're already following this person");
      // you can write a function to remove a user from followers list
      // ---------------------------------------
       } else {
      if (otherUser.profileType === "Public"){
        //check b has private profile or not
        // if b has public profile
        // then add person A to Person B's followes list and add Person B to Person A's following list
        otherUser.followers.push(userId);
        user.following.push(otherUserId);
        await user.save();
        await otherUser.save();
        successResponse(res, "You're now following " + otherUser.username);
      } else {
        // if person B has a private profile then add Person A to Person B's pending list
        otherUser.pending.push(userId);
        await otherUser.save();
        successResponse(
          res,
          "Follow request sent to " + otherUser.username
        );
      }

       }
    }

  } else {
    // either person A doesn't exist or person B doesn't exist
    failureResponse(res, "User not found");
  }
} catch (error) {
  console.log(error);
  failureResponse(res, error);
}
};

const unfollow =async (req,res) => {
  // to unfollow someone: Person A wants to unfollow Person B
  // Check whether Person A exists in Person B's followers list
  // Check whether Person B exists in Person A's following list
  // Remove Person A from followers of Person B
  // Remove Person B from following of Person A
  try {
    let userId = MY_ID; // person A
    let otherUserId = req.body.id; // person B
    let user = await User.findById(userId);
    let otherUser = await User.findById(otherUserId);

    if (user && otherUser) {
      if (user.following.includes(otherUserId) && otherUser.followers.includes(userId) ){
await User.updateOne(
  { _id: userId},
  { $pull: { following: new mongoose.Types.ObjectId(otherUserId)}}
);
await User.updateOne(
  { _id: otherUserId},
  { $pull: { followers: new mongoose.Types.ObjectId(userId)}}
);
successResponse(res, "You have unfollowed" + otherUser.username + " successfully");
      } else {
        failureResponse(res, "You are not following" + otherUser.username)
      }
    } else {
      failureResponse(res, "User not found")
    }
  } catch (error) {
    console.log(error);
    failureResponse(res,error);
  }
};

const changeRequestStatus =async (req,res) => {
  // to change status of follow request
  try {
    let userId = MY_ID; // Person B
    let otherUserId = req.body.id; // Person A
    let status = req.body.isAccepted; // status can be accepted or rejected
    let user = await User.findById(userId);
    let otherUser = await User.findById(otherUserId);
    if (user && otherUser) {
      if (user.pending.includes(otherUserId)) {
        // if pending request exist
        if (status) {
        // userb want to accept the follow request
        await user.updateOne(
          { _id: userId},
          { $pull: { pending: new mongoose.Types.ObjectId(otherUserId) }}
        );
        user.followers.push(otherUserId);
        otherUser.following.push(userId);
        await user.save();
        await otherUser.save();
        successResponse(res, "Follow request accepted");
        } else {
          // user wants to reject the follow reqest
          await user.updateOne(
            { _id: userId },
            { $pull: { pending: new mongoose.Types.ObjectId(otherUserId) }}
          );
          successResponse(res, "Follow request rejected");
        }
      } else {
        failureResponse(res, "Follow request doesn't exist");
      }
    } else {
      failureResponse(res, "User not found");
    }

  } catch (error) {
    console.log(error);
    failureResponse(res, error)
  }

};
module.exports = {
  login,
  signup,
  getProfile,
  updateProfile,
  deleteProfile,
  changeProfileType,
  follow,
  unfollow,
  changeRequestStatus,
};
