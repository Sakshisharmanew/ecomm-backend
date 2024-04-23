import slugify from "slugify";
import subCategoryModel from "../models/subCategoryModel.js";

export const subCategoryCntrlr = async (req, res) => {
  try {
    const { name, category } = req.body; // Extract 'name' and 'category' from req.body

    // console.log(name, "name");
    // console.log(category, "categry");
    if (!name || !category) {
      return res
        .status(401)
        .send({ message: "Name and Category are required" });
    }

    const existingSubCategory = await subCategoryModel.findOne({ name });

    if (existingSubCategory) {
      return res.status(301).send({
        success: true,
        message: "SubCategory Already Exists",
      });
    }

    const subcategory = await new subCategoryModel({
      name,
      category,
      slug: slugify(name),
    }).save();

    res.status(201).send({
      success: true,
      message: "New subcategory created",
      subcategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in subcategory",
    });
  }
};
// Update a subcategory
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(id, {
      name,
      category,
      slug: slugify(name),
    });

    if (!updatedSubCategory) {
      return res
        .status(404)
        .send({ success: false, message: "SubCategory not found" });
    }
    res.status(200).send({
      success: true,
      message: "SubCategory updated",
      updatedSubCategory,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error updating subcategory" });
  }
};
// Delete a subcategory
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params; // Extract subcategory ID from URL params

    const deletedSubCategory = await subCategoryModel.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return res
        .status(404)
        .send({ success: false, message: "SubCategory not found" });
    }

    res.status(200).send({
      success: true,
      message: "SubCategory deleted",
      deletedSubCategory,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error deleting subcategory" });
  }
};
// Get all subcategories or a specific one by ID
export const getSubCategories = async (req, res) => {
  try {
    const { id } = req.params; // Extract subcategory ID from URL params

    if (id) {
      // Get a specific subcategory by ID
      const subcategory = await subCategoryModel.findById(id);
      if (!subcategory) {
        return res
          .status(404)
          .send({ success: false, message: "SubCategory not found" });
      }
      res.status(200).send({ success: true, subcategory });
    } else {
      // Get all subcategories
      const subcategories = await subCategoryModel.find();
      res.status(200).send({ success: true, subcategories });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error getting subcategories" });
  }
};

export const getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await subCategoryModel.find().populate("category");

    if (!subcategories || subcategories.length === 0) {
      return res.status(404).send({
        success: false,
        message: "SubCategories not found",
      });
    }
    // Extract relevant information for the response
    const subcategoriesWithCategoryName = subcategories.map((subcategory) => {
      return {
        _id: subcategory._id,
        name: subcategory.name,
        slug: subcategory.slug,
        category: subcategory.category.name,
      };
    });
    res.status(200).send({
      success: true,
      subcategories: subcategoriesWithCategoryName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error getting subcategories",
    });
  }
};

export const getAllSubCategoriesByCategoryId = async (req, res) => {
  try {
    const category = req.params.id; // Assuming the category ID is in the request parameters
    const subcategories = await subCategoryModel
      .find({ category: category })
      .populate("category");

    if (!subcategories || subcategories.length === 0) {
      return res.status(202).send({
        success: false,
        message: "SubCategories not found ",
      });
    }
    // Extract relevant information for the response
    const subcategoriesWithCategoryName = subcategories.map((subcategory) => {
      return {
        name: subcategory.name,
        _id: subcategory._id,
        slug: subcategory.slug,
      };
    });
    res.status(200).send({
      success: true,
      subcategories: subcategoriesWithCategoryName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error getting subcategories",
    });
  }
};
