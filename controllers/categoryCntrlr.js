import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import fs from "fs";

export const categoryCntrlr = async (req, res) => {
  try {
    const { name } = req.fields;
    const { photo } = req.files;

    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }
    // console.log(name,'name');
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: true,
        message: "Category Already Exisits",
      });
    }
    const category = new categoryModel({
      name,
      slug: slugify(name),
    });
    category.photo.data = fs.readFileSync(photo.path);
    category.photo.contentType = photo.type;
    await category.save();
    res.status(201).send({
      success: true,
      message: "new category created",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "error in category",
    });
  }
};
export const categoryPhoto = async (req, res) => {
  try {
    const chat = await categoryModel.findById(req.params.id).select("photo");
    if (chat?.photo.data) {
      res.set("content-type", chat.photo.contentType);
      return res.status(200).send(chat.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting photo",
      error,
    });
  }
};

export const updateCategorycontlr = async (req, res) => {
  try {
    const { name } = req.fields;
    const { id } = req.params;
    const { photo } = req.files;
    const existingCategory = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );

    if (photo && photo.path) {
      const photoData = fs.readFileSync(photo.path);
      existingCategory.photo.data = Buffer.from(photoData, 'base64');
      existingCategory.photo.contentType = photo.type;
    }  

    existingCategory.slug = slugify(name);
    // Save the updated category
    const category = await existingCategory.save();

    res.status(200).send({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message || "Error while updating category",
    });
  }
};
//get all category
export const getAllCategoryCntrlr = async (req, res) => {
  try {
    const category = await categoryModel.find({}).select("-photo");
    res.status(200).send({
      success: true,
      message: "All category list ",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while geting all category",
      error,
    });
  }
};

//get single category name
export const singleCategoryContrlr = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel
      .findOne({ slug: req.params.slug })
      .select("-photo");
    res.status(200).send({
      success: true,
      message: "get single category name",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in fetching single category",
      error,
    });
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete the image from the database
    await categoryModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "image deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in deleting slider",
      error: error.message,
    });
  }
};

// export default {categoryCntrlr, updateCategorycontlr};
