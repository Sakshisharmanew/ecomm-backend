import slugify from "slugify";
import productModel from "./../models/productModel.js";
import categoryModel from "./../models/categoryModel.js";
import orderModel from "./../models/orderModel.js";
import braintree from "braintree";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
dotenv.config();
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import subCategoryModel from "../models/subCategoryModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//payment gateway======

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// create product //
export const createProductCntrolr = async (req, res) => {
  try {
    const { name } = req.body;
    const files = req.files;
    const productData = {
      name: req.body.name,
      slug: slugify(name),
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      subcategory: req.body.subcategory,
      colors: req.body.colors,
      quantity: req.body.quantity,
      currency: req.body.currency,
      offers: req.body.offers,
      size: req.body.size,
      offerDate: req.body.offerDate,
      brand: req.body.brand,
      deleverydate: req.body.deleverydate,
      ratting: req.body.ratting,
      images: files.map((file) => ({
        filename: file.filename,
        type: file.mimetype,
      })),
    };

    const products = new productModel(productData);
    await products.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message, // Use error.message to get the error message
      message: "Error in creating product",
    });
  }
};

//get all products ----=-------------------
export const getAllProductsCntlr = async (req, res) => {
  try {
    const product = await productModel
      .find({})
      .populate("category")

      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      TotalCount: product.length,
      message: "All products finded",
      product,
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

//get single product by slug
export const getSingleProductCntlr = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate("category")
      .populate("subcategory")
      .populate({
        path: "reviews.user",
        select: "name city", // Specify the fields you want to retrieve
      });

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single data found",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in finding single data",
      error: error.message,
    });
  }
};

//delete  a   product
export const deleteProductContrlr = async (req, res) => {
  try {
    const { pid } = req.params;
    const deletedImage = await productModel.findById(pid);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    const imageFilenames = deletedImage.images.map((p) => p.filename);
    const imagePath = path.join(__dirname, "./../../client/src/img/produtImg");

    if (fs.existsSync(imagePath)) {
      imageFilenames.forEach((filename) => {
        const filePath = path.join(imagePath, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.error(`Error: Image file not found - ${filePath}`);
        }
      });

      // Delete the image from the database
      await productModel.findByIdAndDelete(pid);

      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      console.error("Error: Image directory not found");
      return res.status(404).json({
        success: false,
        message: "Image directory not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in deleting image",
      error: error.message,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      colors,
      quantity,
      currency,
      offers,
      size,
      offerDate,
      brand,
      deleverydate,
      ratting,
    } = req.body;

    const slug = slugify(name);

    const productId = new mongoose.Types.ObjectId(req.params.pid);

    const files = req.files || [];

    const images = files.map((file) => ({
      filename: file.filename,
      type: file.mimetype,
    }));

    const updatedProductData = {
      name,
      slug,
      description,
      price,
      category,
      subcategory,
      colors,
      quantity,
      currency,
      offers,
      size,
      offerDate,
      deleverydate,
      ratting,
      brand,
      images,
    };

    if (!updatedProductData.images || updatedProductData.images.length === 0) {
      // If no new images provided, remove the 'images' field from the data
      delete updatedProductData.images;
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      updatedProductData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error in updating product",
    });
  }
};

//filter products
export const productFilterContrlr = async (req, res) => {
  try {
    const { checked, radio, colors, offers } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    if (colors.length) args.colors = colors;
    if (offers.length) args.offers = offers;
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in filter ",
      error,
    });
  }
};

// product count controler
export const productCountContrlr = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "product not count somthing went wrong",
      error,
    });
  }
};

//produc pagination==========
export const productListController = async (req, res) => {
  try {
    const perPage = 15;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search products=========
export const searchProductContrlr = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { colors: { $regex: keyword, $options: "i" } },
      ],
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: true,
      message: "Error in search product api",
      error,
    });
  }
};

//related product
export const realtedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })

      .limit(10)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while geting related product",
      error,
    });
  }
};
export const relatedColorController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    // console.log(pid, "lllll");
    // Assuming you have a field named "color" in your product model
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .limit(5)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error while getting related products",
      error,
    });
  }
};
//seach  product by  category wize
export const productCategoryContrlr = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      error,
      message: "Error while geting product",
    });
  }
};
//seach  product by  subcategory wize
export const productSubCategoryContrlr = async (req, res) => {
  try {
    const subcategory = await subCategoryModel.findOne({
      slug: req.params.slug,
    });
    const products = await productModel
      .find({ subcategory })
      .populate("subcategory");
    res.status(200).send({
      success: true,
      subcategory,
      products,
    });
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      error,
      message: "Error while geting product",
    });
  }
};

// payment gateway api
//   token
export const braintreeTokenContrlr = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
    });
  }
};

export const braintreePaymentContrlr = async (req, res) => {
  try {
    const {
      paymentMethod,
      products,
      shipinginfo,
      orderItems,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      payment,
      buyer,
      nonce,
    } = req.body.orderData;

    let newTransaction = gateway.transaction.sale(
      {
        amount: totalPrice,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      async function (error, result) {
        if (error) {
          console.error("Braintree payment error:", error);
          return res.status(500).send(error);
        }

        if (paymentMethod === "online") {
          const order = new orderModel({
            paymentMethod,
            products,
            shipinginfo,
            orderItems,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            payment,
            buyer: {
              _id: req.user._id,
              name: req.user.name,
              email: req.user.email,
            },
          });
          await order.save();

          for (const item of orderItems) {
            const product = await productModel.findById(item.product);

            if (!product) {
              return res.status(400).json({ error: "Product not found" });
            }

            console.log("Product:", product); // Log product data for debugging

            if (product.quantity >= item.quantity) {
              product.quantity -= item.quantity;
              await product.save();
            } else {
              return res.status(400).json({
                error: `Not enough stock available for product: ${product.name}`,
              });
            }
          }

          sendCODPaymentEmail(order, buyer.name, buyer.email);

          return res.json({ ok: true });
        } else {
          return res.status(400).json({ error: "Invalid payment method" });
        }
      }
    );
  } catch (error) {
    console.error("Error in braintreePaymentContrlr:", error);
    return res.status(500).send(error.message || "Internal Server Error");
  }
};

export const handleCODPayment = async (req, res) => {
  try {
    const orderData = req.body.orderData;

    if (!orderData || !orderData.paymentMethod) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const {
      paymentMethod,
      products,
      shipinginfo,
      orderItems,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      payment,
      buyer,
    } = orderData;

    if (paymentMethod === "COD") {
      const order = new orderModel({
        paymentMethod,
        products,
        shipinginfo,
        orderItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        payment,
        buyer: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      });
      // console.log(order,'kkkkkkk')
      await order.save();
      //auto minimize product quantity
      for (const item of orderItems) {
        const product = await productModel.findById(item.product);

        if (product) {
          // Check if there is enough quantity to fulfill the order
          if (product.quantity >= item.quantity) {
            product.quantity -= item.quantity;
            await product.save();
          } else {
            return res.status(400).json({
              error: `Not enough stock available for product: ${product.name}`,
            });
          }
        }
      }

      sendCODPaymentEmail(order, buyer.name, buyer.email);
      // console.log("COD payment successful");
      return res.json({ ok: true });
    } else {
      return res
        .status(400)
        .json({ error: "Invalid payment method for this endpoint" });
    }
  } catch (error) {
    console.error("Error during Cash on Delivery:", error);
    res.status(500).send(error.message || "Internal Server Error");
  }
};

const sendCODPaymentEmail = async (order, buyerName, buyerEmail) => {
  if (!order) {
    console.error("Invalid parameters for sending email");
    return;
  } // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });
  // Email options
  const recipients = [buyerEmail, process.env.email];
  const mailOptions = {
    from: process.env.email,
    to: recipients,
    subject: `Your order for${order.orderItems[0].name}... has been successfully Placed`,
    html: `
        <p>Dear ${buyerName},</p>
        
        <p>Your ${order.paymentMethod} payment for order #${order._id} has been successfully completed. Here are the details:</p>

        <table border="1" style="border-collapse: collapse; width: 50%;  color:blue;">
            <tr>
                <th>Order ID</th>
                <td>${order._id}</td>
            </tr>
            <tr>
                <th>Product Details</th>
                <td></td>
            </tr>
            <tr>
                <td>Name</td>
                <td>${order.orderItems[0].name}</td>
            </tr>
            <tr>
                <td>Image</td>
                <td>${order.orderItems[0].image}</td>
            </tr>
            <tr>
                <td>Product Price</td>
                <td>${order.orderItems[0].price}</td>
            </tr>
            <tr>
                <td>Quantity</td>
                <td>${order.orderItems[0].quantity}</td>
            </tr>
            
        </table>

        <p><b>Shipping Information:</b></p>

        <table border="1" style="border-collapse: collapse; width: 50%; color:blue;">
            <tr>
                <td>Name</td>
                <td>${order.shipinginfo.name}</td>
            </tr>
            <tr>
                <td>State</td>
                <td>${order.shipinginfo.state}</td>
            </tr>          
            <tr>
                <td>City</td>
                <td>${order.shipinginfo.city}</td>
            </tr>
            <tr>
                <td>Landmark</td>
                <td>${order.shipinginfo.landmark}</td>
            </tr>
            <tr>
                <td>Locality</td>
                <td>${order.shipinginfo.locality}</td>
            </tr>
            <tr>
                <td>Pincode</td>
                <td>${order.shipinginfo.pincode}</td>
            </tr>
            <tr>
                <td>Mobile</td>
                <td>${order.shipinginfo.mobile}</td>
            </tr>
        </table>

        <p><b>Order Summary:</b></p>

        <table border="1" style="border-collapse: collapse; width: 50%;  color:blue;">
            <tr>
                <td>Discounted Price</td>
                <td>${order.itemsPrice}</td>
            </tr>
            <tr>
                <td>Shipping Price</td>
                <td>${order.shippingPrice}</td>
            </tr>
            <tr>
                <td>Tax Price</td>
                <td>${order.taxPrice}</td>
            </tr>
            <tr>
                <td>Total Price</td>
                <td>${order.totalPrice}</td>
            </tr>
        </table>

        <p>Paid At: ${order.paidAt}</p>

        <p>Thank you for shopping with us!</p>

        <p>Best regards,<br>Your Store Team</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

export const notifyProductAvailability = async (
  productName,
  buyerName,
  buyerEmail
) => {
  const user = require.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });

  // Email options
  const recipients = [buyerEmail, process.env.email];
  const mailOptions = {
    from: buyerEmail, // Use your own email address as the sender
    to: recipients,
    subject: `${productName} is not available`,
    html: `
        <p>Dear ${buyerName},</p>        

        <p>We are excited to inform you that is not available </p>
        
        <p>Best regards,<br>Your Store Team</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
// notifyProductAvailability(productName, buyerName, buyerEmail);

export const addReview = async (req, res) => {
  const { ObjectId } = mongoose.Types;
  try {
    const { comment, rating } = req.body;
    const files = req.files;

    const productId = new ObjectId(req.params.pid);

    if (!comment || !rating || isNaN(rating)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing parameters.",
      });
    }

    const review = {
      user: req.user._id,
      rating: rating,
      comment: comment,
      images: files.map((file) => ({
        filename: file.filename,
        type: file.mimetype,
      })),
    };

    const product = await productModel.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    product.reviews.push(review);
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Uncaught exception in addReview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Delete a review

export const deletereview = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.pid);
    const reviewId = new ObjectId(req.params.rid);

    const product = await productModel.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const reviewIndex = product.reviews.findIndex((review) =>
      review._id.equals(reviewId)
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    product.reviews.splice(reviewIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Uncaught exception in deleteReview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviewIndex = req.params.reviewIndex;
    const userId = req.userId;
    const product = await productModel.findById(productId);

    if (!product) {
      console.log("Product not found");
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // if (reviewIndex >= 0 && reviewIndex < product.reviews.length) {
    const review = product.reviews[reviewIndex];

    // if (!review.likes.includes(userId)) {
    review.likes.push(userId);

    // Save the updated product
    await product.save();
    console.log("Like added successfully");
    return res
      .status(200)
      .json({ success: true, message: "Like added successfully" });
    // } else {
    //   console.log("User has already liked this review");
    //   return res.status(400).json({ success: false, message: "User has already liked this review" });
    // }
    // } else {
    //   console.log("Invalid review index");
    //   return res.status(400).json({ success: false, message: "Invalid review index" });
    // }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
