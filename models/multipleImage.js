import mongoose from "mongoose";

const multipleImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
    },
    subTitle: {
      type: String,
      // required: true,
    },
    des: {
      type: String,
      // required: true,
    },
    photo:{
      data:Buffer,
      contentType:String,
  },
  },
  { timestamps: true }
);

const MultipleImage = mongoose.model("MultipleImage", multipleImageSchema);

export default MultipleImage;
