import userModel from "../models/userModel.js";
import chatModel from "./../models/chatprocessModel.js";
import fs from "fs";

export const chatcontrolr = async (req, res) => {
  try {
    const { photo } = req.files;

    const Chatprocess = new chatModel({ ...req.fields });  

    if (photo) {
      // Read and save photo data
      Chatprocess.photo.data = fs.readFileSync(photo.path);
      Chatprocess.photo.contentType = photo.type;
    }

    await Chatprocess.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      Chatprocess,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).send({
      success: false,
      error,
      message: "Error in creating chat",
    });
  }
};

export const getAllchat = async (req, res) => {
  try {
    const chats = await chatModel.find({}).select("-photo").sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: 'All chats found',
      chats,
    });
    // console.log('Chats:', chats);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: 'Error in getting data',
      error: 'Internal Server Error',
    });
  }
};

export const chatPhotoContrlr = async(req, res)  =>{
  try {
      const chat = await chatModel.findById(req.params.id).select('photo')
      if(chat?.photo.data)          
      {
          res.set('content-type', chat.photo.contentType)
          return res.status(200).send(chat.photo.data)

      }
  } catch (error) {
      console.log(error)
      res.status(500).send({
          success:false,
          message:'error while getting photo',
          error,
      })
  }
};
