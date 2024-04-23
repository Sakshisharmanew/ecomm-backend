import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  deleteSliderImage,
  getAllMultipleImages,
  multipleUpload,
  sliderIIphoto,
} from "../controllers/multipleImagectrl.js";
import ExpressFormidable from "express-formidable";
const multi_route = express()


multi_route.post(
  "/multiple-upload",
  ExpressFormidable(),
  requireSignIn,
  multipleUpload
);
multi_route.get("/multiple-get", getAllMultipleImages);
multi_route.get("/sliderImageII/:id", sliderIIphoto);
multi_route.delete(
  "/deleteSliderImage/:id",
  requireSignIn,
  isAdmin,
  deleteSliderImage
);

export default multi_route;
