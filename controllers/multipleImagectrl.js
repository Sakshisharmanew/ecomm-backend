import multipleImage from "../models/multipleImage.js";
import fs from "fs";

export const multipleUpload = async (req, res) => {
  try {
    const { photo } = req.files;
    if (!photo) {
      return res.status(400).send({
        success: false,
        message: "No photo uploaded",
      });
    }
    const SliderII = new multipleImage({ ...req.fields });
    SliderII.photo.data = fs.readFileSync(photo.path);
    SliderII.photo.contentType = photo.type;
    // Save the data
    const savedImageData = await SliderII.save();

    res.status(201).send({
      success: true,
      message: "Slider created successfully",
      SliderII: savedImageData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message, // Only send the error message to the client
      message: "Error in creating slide image",
    });
  }
};
export const sliderIIphoto = async (req, res) => {
  try {
    const chat = await multipleImage.findById(req.params.id).select("photo");
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

// Controller to retrieve all multipleImage data
export const getAllMultipleImages = async (req, res) => {
  try {
    const imageData = await multipleImage.find({}).select("-photo");
    res.status(200).json({
      success: true,
      data: imageData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in retrieving multipleImage data",
    });
  }
};

// export default multipleUpload;
export const deleteSliderImage = async (req, res) => {
  try {
    const { id } = req.params;
    await multipleImage.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting slider",
      error: error.message, // Send only the error message
    });
  }
};
