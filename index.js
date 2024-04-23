import express from "express";
const app = express();
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import subCategoryRoute from "./routes/subCategoryRoute.js";
import productRoutes from "./routes/productRoutes.js";
import sliderRoutes from "./routes/sliderRoute.js";
import multiImageRoute from "./routes/MultipleImageRoute.js";
import chatprocess from "./routes/chatRoute.js";
import bodyParser from "body-parser";
import cors from "cors";

app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config();

connectDB();
// middlewares ==========
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes========
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/subCategory", subCategoryRoute);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/slider", sliderRoutes);
app.use("/api/vi/multiple", multiImageRoute);
app.use("/api/vi/chatprocess", chatprocess);
// rest api =====

app.get("/apitest", (req, res) => {
  res.send({
    message: "Welcome to my ecom app",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode on http://localhost:${PORT}`
      .bgCyan.white
  );
});
