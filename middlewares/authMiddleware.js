import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

const ROLES = {
  ADMIN: 1,
  USER: 0,
  // Add more roles as needed
};

//protected rpotes========

export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send({
      success: false,
      message: "Unauthorized",
      error: "Invalid token",
    });
  }
};

// admin access=============-----
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    }

    if (user.role !== ROLES.ADMIN) {
      return res.status(401).send({
        success: false,
        message: "UnAthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: "Error in admin middleware",
    });
  }
};
