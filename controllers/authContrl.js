import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import otpModel from "../models/otpModel.js";
import nodemailer from "nodemailer";

export const generateOtp = async (req, res) => {
  const { phone, mode, email } = req.body;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  if (!mode || !["new user", "reset password"].includes(mode)) {
    return res.status(400).json({ error: "Invalid mode" });
  }

  try {
    const user = await userModel.findOne({ phone: phone });

    if ((mode === "new user" && user) || (mode === "reset password" && !user)) {
      return res.status(400).json({ error: "User validation failed" });
    }

    const OTP = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const otp = new otpModel({ phone: phone, otp: OTP, email: email });
    const result = await otp.save();

    // let msg = `Please use this code as your one-time password (OTP). It will expire in 3 minutes.\nYour OTP is ${OTP}.\nNever share your OTP with anyone`;

    // await axios.get(
    //   `https://www.fast2sms.com/dev/bulkV2?authorization=pTFGDocmgh8UduZvWxa7fY6iCKeOnqszBLtbAr5IPSl9VNMEkjyAS5he8YJsgtLxGFOnrwIU4vlRQMBN&route=dlt&sender_id=&message=${msg}&language=english&flash=0&numbers=${phone}`
    // );

    const emailResponse = await sendOtpEmail(email, OTP);

    return res.status(200).json({ message: `OTP sent successfully to` });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Something went wrong while sending OTP" });
  }
};
const sendOtpEmail = async (email, OTP) => {
  if (!email) {
    console.error("Invalid parameters for sending email");
    return;
  } // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });
  // Email options
  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Your One-Time Password (OTP)",
    text: `Your OTP is: ${OTP}. It will expire in 3 minutes. Never share your OTP with anyone.`,
  };
  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return true; // Return true if email is sent successfully
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false; // Return false if there is an error sending the email
  }
};

const verifyOtp = async (phone, otp) => {
  try {
    const otpHolder = await otpModel.find({ phone });

    if (otpHolder.length === 0) {
      return false; // OTP expired or not found
    }
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    return rightOtpFind.otp === otp;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    if (!name || !email || !password || !phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ phone });

    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: "User already registered. Please log in.",
      });
    }

    const isOtpValid = await verifyOtp(phone, otp);

    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
    }).save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in registration",
    });
  }
};

const loginContrl = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    let user;

    if (!isNaN(phoneOrEmail)) {
      // console.log("Searching by phoneOrEmail:", phoneOrEmail);
      user = await userModel.findOne({ phone: phoneOrEmail });
    } else {
      // console.log("Searching by email:", phoneOrEmail);
      user = await userModel.findOne({ email: phoneOrEmail });
    }

    if (!user) {
      return res.status(201).send({
        success: false,
        message: "Phone number or email is not registered",
      });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(201).send({
        success: false,
        message: "Invalid password or user id",
      });
    }

    if (user.blocked === true) {
      return res.status(201).send({
        success: false,
        message: `${user.name}, is blocked. Contact support for assistance.`,
      });
    }

    // token ===========
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
    });
  }
};

//forgot password======
export const forgotPasswordContrlr = async (req, res) => {
  try {
    const { phone, newPassword, otp } = req.body;

    const isOtpValid = await verifyOtp(phone, otp);

    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (!phone) {
      res.status(400).send({
        message: "phone is Required",
      });
    }
    if (!newPassword) {
      res.status(400).send({
        message: "pass is Required",
      });
    }
    if (!otp) {
      res.status(400).send({
        message: "otp is Required",
      });
    }
    //check
    const user = await userModel.findOne({ phone });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong phone Or otp",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Somthing went wrong",
      error,
    });
  }
};

const userContrler = async (req, res) => {
  try {
    // res.send('protected');
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "all users data",
      users,
    });
    // console.log(users, 'iiiiiiiiiiiiiii');
  } catch (error) {
    console.error("Error in userController:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while fetching data",
    });
  }
};
export const gelluseraddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("address");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//address delete from cart page...
export const deleteUserAddress = async (req, res) => {
  const addressIdToDelete = req.params.addressId;

  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.address.findIndex(
      (addr) => addr._id.toString() === addressIdToDelete
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.address.splice(addressIndex, 1);

    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateUserAddress = async (req, res) => {
  const addressIdToUpdate = req.params.addressId;
  const updatedAddressDetails = req.body;
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressToUpdate = user.address.find(
      (addr) => addr._id.toString() === addressIdToUpdate
    );

    if (!addressToUpdate) {
      return res.status(404).json({ message: "Address not found" });
    }

    Object.assign(addressToUpdate, updatedAddressDetails);

    await user.save();

    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// update profile
const updateContrlr = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      phone,
      pincode,
      locality,
      states,
      landmark,
      city,
    } = req.body;
    if (!pincode) {
      return res.send({ message: "pin is Required" });
    }
    const user = await userModel.findById(req.user._id);
    // password
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and & character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
        pincode: pincode || user.pincode,
        states: states || user.states,
        city: city || user.city,
        landmark: landmark || user.landmark,
        locality: locality || user.locality,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in update profile",
      error,
    });
  }
};

export const useraddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const newAddress = req.body;
    const user = await userModel.findById(req.user._id);
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }
    user.address.push(newAddress);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Address added successfully",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in updating address",
      error: error.message,
    });
  }
};

// status user orders
export const getOrdersContrlr = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        buyer: req.user._id,
      })
      .populate("products")
      .populate({
        path: "buyer",
        select: "name email",
      })
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

//find order gate single for show order details...
const findById = async (orderId) => {
  try {
    return await orderModel.findOne({ _id: orderId }).exec();
  } catch (error) {
    throw error; // or handle the error accordingly
  }
};

export const singleOrderController = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await findById(orderId);

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//status all order for admin
export const getAllOrdersContrlr = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products")
      .populate({
        path: "buyer",
        select: "name email",
      })
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(200).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

export const orederStatusControlr = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderModel
      .findById(id)
      .populate({ path: "buyer", select: "email" })
      .exec();

    const buyerEmail = order.buyer[0].email;

    const orders = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    sendStatusEmail(orders, buyerEmail);

    res.json(orders);
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};
const sendStatusEmail = async (order, buyerEmail) => {
  if (!order) {
    console.error("Invalid parameters for sending email");
    return;
  } // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });
  // Email options
  const mailOptions = {
    from: process.env.email,
    to: buyerEmail,
    subject: `Your order for${order.orderItems[0].name}... has been successfully  ${order.status}`,
    html: `
        <p>Dear,</p>
        
        <p>Your ${order.paymentMethod} payment for order #${order._id} has been successfully ${order.status}. Here are the details:</p>

        <table border="1" style="border-collapse: collapse; width: 50%;  color:blue;">
            <tr>
                <th>Order ID</th>
                <td>${order._id}</td>
            </tr>
            <tr>
                <th>Product Details</th>
                <td></td>
            </tr>
            <tr>
                <td>Name</td>
                <td>${order.orderItems[0].name}</td>
            </tr>
            <tr>
                <td>Image</td>
                <td>${order.orderItems[0].image}</td>
            </tr>
            <tr>
                <td>Product Price</td>
                <td>${order.orderItems[0].price}</td>
            </tr>
            <tr>
                <td>Quantity</td>
                <td>${order.orderItems[0].quantity}</td>
            </tr>
            
        </table>

        <p><b>Shipping Information:</b></p>

        <table border="1" style="border-collapse: collapse; width: 50%; color:blue;">
            <tr>
                <td>Name</td>
                <td>${order.shipinginfo.name}</td>
            </tr>
            <tr>
                <td>State</td>
                <td>${order.shipinginfo.state}</td>
            </tr>          
            <tr>
                <td>City</td>
                <td>${order.shipinginfo.city}</td>
            </tr>
            <tr>
                <td>Landmark</td>
                <td>${order.shipinginfo.landmark}</td>
            </tr>
            <tr>
                <td>Locality</td>
                <td>${order.shipinginfo.locality}</td>
            </tr>
            <tr>
                <td>Pincode</td>
                <td>${order.shipinginfo.pincode}</td>
            </tr>
            <tr>
                <td>Mobile</td>
                <td>${order.shipinginfo.mobile}</td>
            </tr>
        </table>

        <p><b>Order Summary:</b></p>

        <table border="1" style="border-collapse: collapse; width: 50%;  color:blue;">
            <tr>
                <td>Discounted Price</td>
                <td>${order.itemsPrice}</td>
            </tr>
            <tr>
                <td>Shipping Price</td>
                <td>${order.shippingPrice}</td>
            </tr>
            <tr>
                <td>Tax Price</td>
                <td>${order.taxPrice}</td>
            </tr>
            <tr>
                <td>Total Price</td>
                <td>${order.totalPrice}</td>
            </tr>
        </table>

        <p>Paid At: ${order.paidAt}</p>

        <p>Thank you for shopping with us!</p>

        <p>Best regards,<br>Your Store Team</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await orderModel.findByIdAndDelete(id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting order", error });
  }
};
//block user by admin
export const blockUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.blockUser();
    return res
      .status(200)
      .json({ success: true, message: "User blocked successfully", user });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while blocking the user",
    });
  }
};
//unblock user by admin
export const unblockUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    await user.unblockUser();
    res.status(200).send({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).send({
      success: false,
      message: "An error occurred while unblocking the user",
    });
  }
};
//user can cancel our orders..
export const orderUserCencel = async (req, res) => {
  try {
    const { orderId } = req.params; // Destructure orderId from req.params
    // console.log("Received ID:", orderId);

    let orders = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { $set: { status: "canceled" } },
      { new: true }
    );

    res.json(orders);
  } catch (error) {
    console.error("Error updating order status:", error);

    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

export { registerController, loginContrl, userContrler, updateContrlr };
