const jwt = require("jsonwebtoken");
const User = require("../model/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        message: "User registered successfully",
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      res.json({
        message: "User logged in successfully",
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//Get current user profile

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isPro: user.isPro,
    });
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

//Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.name = req.body.name || user.name;
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("AUTH ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.file) {
      user.avatar = `/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      isPro: updatedUser.isPro,
    });
  } catch (error) {
    console.error("AVATAR ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
