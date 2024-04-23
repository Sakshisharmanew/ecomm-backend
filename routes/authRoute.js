import express from "express";
import {
  registerController,
  loginContrl,
  userContrler,
  forgotPasswordContrlr,
  updateContrlr,
  getOrdersContrlr,
  getAllOrdersContrlr,
  orederStatusControlr,
  useraddress,
  generateOtp,
  gelluseraddress,
  deleteOrder,
  deleteUserAddress,
  updateUserAddress,
  blockUser,
  unblockUser,
  singleOrderController,
  orderUserCencel,
} from "../controllers/authContrl.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

// router object=====
const router = express.Router();

//routes
//register post methode========

router.post("/register", registerController);
router.post("/generate-otp", generateOtp);
// router.post('/veryfy-otp', verifyOtp);
router.post("/address", requireSignIn, useraddress);

// login =====
router.post("/login", loginContrl);

//forgot password route===
router.post("/forgot-password", forgotPasswordContrlr);

//get
router.get("/users", requireSignIn, isAdmin, userContrler);

router.get("/user/address/:id", requireSignIn, gelluseraddress); //cart page....
router.delete("/user/address/:addressId", requireSignIn, deleteUserAddress); //cart page....
router.put("/user/updateadd/:addressId", requireSignIn, updateUserAddress); //cart page....
// protected user Routes=====
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected admin
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});
//update profile
router.put("/profile", requireSignIn, updateContrlr);

//orders for users
router.get("/orders", requireSignIn, getOrdersContrlr);
router.get("/orders/:orderId", requireSignIn, singleOrderController);
router.put("/orderCancel/:orderId/canceled", requireSignIn, orderUserCencel);
//all orders for admins
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersContrlr);
router.put("/user/:userId/block", requireSignIn, isAdmin, blockUser);
router.put("/user/:userId/unblock", requireSignIn, isAdmin, unblockUser);

//status update for order
router.put(
  "/orders-status/:id/status",
  requireSignIn,
  isAdmin,
  orederStatusControlr
);
router.delete("/deleteOrders/:id/", requireSignIn, isAdmin, deleteOrder);

export default router;
