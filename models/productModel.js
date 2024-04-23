import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    offers: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.ObjectId,
      ref: "subCategory",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    colors: {
      type: String,
    },
    images: [
      {
        filename: String,
      },
    ],
    shiping: {
      type: Boolean,
    },
    reviews: [
      {
        images: [
          {
            filename: String,
          },
        ],
        user: {
          type: mongoose.ObjectId,
          ref: "users",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
        likes: [
          {
            type: String,
          },
        ],
      },
    ],
    ratting: {
      type: Number,
      default: 4,
    },
    size: {
      type: String,
    },
    brand: {
      type: String,
    },
    deleverydate: {
      type: String,
      required: true,
    },
    offerDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Products", productSchema);
