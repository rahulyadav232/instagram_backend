const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const authenticate = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", newToken, {
    expires: new Date(Date.now() + 86400000),
    httpOnly: true,
  });

  const { id } = decoded;
  const user = await User.findById(id);

  req.user = { user, token: newToken };
  req.id = id;
  req.decoded = decoded;

  next();
};

module.exports = authenticate;
