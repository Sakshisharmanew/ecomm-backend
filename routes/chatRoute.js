import { chatPhotoContrlr, chatcontrolr, getAllchat } from "../controllers/chatContrl.js";
import express from "express";
const router = express();
import ExpressFormidable from "express-formidable";

router.post("/chatlive", ExpressFormidable(), chatcontrolr);
router.get("/getAllchat",  getAllchat);
router.get("/chatphoto/:id",  chatPhotoContrlr);

export default router;
