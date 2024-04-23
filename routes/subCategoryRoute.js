import express from "express";
import {
  deleteSubCategory,
  getAllSubCategories,
  getAllSubCategoriesByCategoryId,
  getSubCategories,
  subCategoryCntrlr,
  updateSubCategory,
} from "../controllers/subCategoryContlr.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
const router = express();

// Routes
router.post("/subcategories", requireSignIn, isAdmin, subCategoryCntrlr);
router.put("/subcategories/:id", requireSignIn, isAdmin, updateSubCategory);
router.delete("/subcategories/:id", requireSignIn, isAdmin, deleteSubCategory);
router.get("/subcategories/:id", getSubCategories);
router.get("/subcategories",  getAllSubCategories);
router.get("/subcategry/:id", getAllSubCategoriesByCategoryId);

export default router;
