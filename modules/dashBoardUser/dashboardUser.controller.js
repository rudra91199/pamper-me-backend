import { generateToken } from "../../utils/generateToken.js";
import SendResponse from "../../utils/sendResponse.js";
import { userSearchableFields } from "./dashboardUser.constant.js";
import bcrypt from "bcrypt";
import { DashboardUser } from "./dashboardUser.model.js";

const createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    if ((!name || !email, !password || !role || !phone)) {
      throw new Error("All fields are required.");
    }
    const userExists = await DashboardUser.findOne({ email });
    if (userExists) {
      return SendResponse(res, {
        statusCode: 400,
        success: false,
        message: "user already exists",
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new DashboardUser({
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      status: req.body.status || "active",
    });

    const newUser = await user.save();

    SendResponse(res, {
      statusCode: 201,
      success: true,
      message: "user created successfully.",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await DashboardUser.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    if (user.role === "admin") {
      const token = generateToken(res, user._id);
      // user.lastLogin = new Date();
      // await user.save();

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
          ...user._doc,
          password: undefined,
          token,
        },
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access." });
    }
  } catch (error) {}
};
export const parlourLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await DashboardUser.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials." });
    }
    if (user.role === "parlour") {
      const token = generateToken(res, user._id);
      user.lastLogin = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        user: {
          ...user._doc,
          password: undefined,
          token,
        },
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized Access." });
    }
  } catch (error) {}
};

export const checkAuth = async (req, res) => {
  try {
    const user = await DashboardUser.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const filter = {
    ...(req.query.role && { role: req.query.role }),
    ...(req.query.status && { status: req.query.status }),
    ...(req.query.searchTerm && {
      $or: userSearchableFields.map((field) => ({
        [field]: { $regex: req.query.searchTerm, $options: "i" },
      })),
    }),
  };
  try {
    const users = await DashboardUser.find(filter)
      .populate("parlourId", "title")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-password");
    const count = await DashboardUser.countDocuments(filter);
    SendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully.",
      data: { users, count },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const DashboardUserControllers = {
  createUser,
  adminLogin,
  parlourLogin,
  checkAuth,
  getAllUsers,
};
