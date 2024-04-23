import fs from "fs";
import sliderModel from "../models/sliderModel.js";

// Define the slider controller function
const sliderContrlr = async (req, res) => {
  try {
    const { photo } = req.files;
    const SliderData = new sliderModel({ ...req.fields });
    SliderData.photo.data = fs.readFileSync(photo.path);
    SliderData.photo.contentType = photo.type;
    await SliderData.save();
    res.status(201).send({
      success: true,
      message: "Slider created successfully",
      SliderData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating slide image",
    });
  }
};

export const sliderphoto = async (req, res) => {
  try {
    const chat = await sliderModel.findById(req.params.id).select("photo");
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
export const getSingle = async (req, res) => {
  try {
    const singleSlider = await sliderModel
      .findById(req.params.id)
      .select("-photo");

    if (!singleSlider) {
      return res.status(404).send({
        success: false,
        message: "Slider not found",
      });
    }

    res.status(200).send({
      success: true,
      data: singleSlider,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while getting slider",
      error: error.message,
    });
  }
};

export const getSliderCntrlr = async (req, res) => {
  try {
    const sliderData = await sliderModel.find({}).select("-photo");
    res.status(200).send({
      success: true,
      message: "All slider finded",
      sliderData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in getting data ",
      error: error.message,
    });
  }
};

export const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subTitle, des } = req.body;
    const { photo } = req.files;

    // Update the slider and retrieve the updated slider
    const updatedSlider = await sliderModel.findByIdAndUpdate(
      id,
      { title, subTitle, des },
      { new: true } // Return the updated document
    );

    if (!updatedSlider) {
      return res.status(404).send({
        success: false,
        message: "Slider not found for update",
      });
    }

    if (photo) {
      updatedSlider.photo.data = fs.readFileSync(photo.path);
      updatedSlider.photo.contentType = photo.type;
      await updatedSlider.save();
    }

    res.status(200).send({
      success: true,
      message: "Slider updated successfully",
      data: updatedSlider,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in updating slider",
      error: error.message,
    });
  }
};

export const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    await sliderModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
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

export default sliderContrlr;
