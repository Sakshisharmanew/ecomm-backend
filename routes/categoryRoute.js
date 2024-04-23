import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryCntrlr,
  updateCategorycontlr,
  getAllCategoryCntrlr,
  singleCategoryContrlr,
  deleteCategory,
  categoryPhoto,
} from "../controllers/categoryCntrlr.js";
import ExpressFormidable from "express-formidable";
const router = express();
router.post(
  "/create-category",
  ExpressFormidable(),
  requireSignIn,
  isAdmin,
  categoryCntrlr
);

router.put(
  "/update-category/:id",
  ExpressFormidable(),
  requireSignIn,
  isAdmin,
  updateCategorycontlr
);

//get all category====
router.get("/get-category", getAllCategoryCntrlr);

router.get("/single-category/:id", singleCategoryContrlr);
router.get("/singlePhoto-category/:id", categoryPhoto);

//delete category by id
router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategory);

export default router;
