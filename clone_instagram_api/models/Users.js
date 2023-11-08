const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userInfo: {
    location: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  pending: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  profileType: {
    type: String,
    enum: ["Private", "Public"],
    default: "Private",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
