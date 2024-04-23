import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import sliderContrlr, {
  deleteSlider,
  getSingle,
  getSliderCntrlr,
  sliderphoto,
  updateSlider,
} from "../controllers/sliderContrlr.js";

const slider_route = express();
import ExpressFormidable from "express-formidable";

slider_route.post(
  "/slider",
  ExpressFormidable(),
  requireSignIn,
  isAdmin,
  sliderContrlr
);
slider_route.get("/get-slider", getSliderCntrlr);
slider_route.get("/get-slider/:id", sliderphoto);
slider_route.delete("/delete-slider/:id", requireSignIn, isAdmin, deleteSlider);
slider_route.get("/getSingle-slider/:id", requireSignIn, isAdmin, getSingle);
slider_route.put(
    "/update-slider/:id",
    ExpressFormidable(),
    requireSignIn,
    isAdmin,
    updateSlider
  );

export default slider_route;
