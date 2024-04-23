import express from "express";

import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createProductCntrolr,
  deleteProductContrlr,
  getAllProductsCntlr,
  getSingleProductCntlr,
  productCountContrlr,
  productFilterContrlr,
  productListController,
  searchProductContrlr,
  realtedProductController,
  productCategoryContrlr,
  braintreeTokenContrlr,
  braintreePaymentContrlr,
  addReview,
  updateProductController,
  deletereview,
  handleCODPayment,
  likePost,
  relatedColorController,
  productSubCategoryContrlr,
  notifyProductAvailability,
} from "../controllers/productControlr.js";
import ExpressFormidable from "express-formidable";

const router = express();
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import bodyParser from "body-parser";
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static("public"));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./../../client/src/img/produtImg"));
    // cb(null, path.join(__dirname, './../adminpanel/src/img/produtImg'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });
const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./../../client/src/img/reviewimg"));
    // cb(null, path.join(__dirname, './../adminpanel/src/img/produtImg'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload1 = multer({ storage: storage1 });

//routes
// create product list
router.post(
  "/create-product",
  upload.array("images", 5),
  requireSignIn,
  isAdmin,
  createProductCntrolr
);

//update product
router.put(
  "/update-product/:pid",
  upload.array("images", 5),
  requireSignIn,
  isAdmin,
  updateProductController
);

// get all product
router.get("/get-product", getAllProductsCntlr);

// get single product by name
router.get("/get-product/:slug", getSingleProductCntlr);
//delete product
router.delete("/delete-product/:pid", deleteProductContrlr);

//product filter by
router.post("/product-filters/", productFilterContrlr);

// product Count
router.get("/product-count", productCountContrlr);

//product paginations
router.get("/product-list/:page", productListController);

// search product
router.get("/search/:keyword", searchProductContrlr);

//similer product found ========
router.get("/related-product/:pid/:cid", realtedProductController);
router.get("/related-color/:pid/:cid", relatedColorController);

//category wise product
router.get("/product-category/:slug", productCategoryContrlr);

//category wise product
router.get("/product-subcategory/:slug", productSubCategoryContrlr);

// payment routes
//token
router.get("/braintree/token", braintreeTokenContrlr);

//payments
router.post("/braintree/payment", requireSignIn, braintreePaymentContrlr);
router.post("/cod/payment", requireSignIn, handleCODPayment);
router.post("/notify", requireSignIn, notifyProductAvailability);

//review
router.post(
  "/:pid/addreviews",
  upload1.array("images", 5),
  requireSignIn,
  addReview
);
router.delete("/products/:pid/reviews/:rid", requireSignIn, deletereview);
// router.post('/:pid/like/:rid', likePost);
router.put("/:productId/reviews/:reviewIndex/like", likePost);

export default router;
