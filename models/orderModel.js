import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      enum: ["online", "COD"],
      required: true,
    },
    products: [
      {
        type: mongoose.ObjectId,
        ref: "Products",
      },
    ],

    shipinginfo: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      state: {
        type: String,
      },
      city: {
        type: String,
      },
      landmark: {
        type: String,
      },
      locality: {
        type: String,
      },
      pincode: {
        type: Number,
      },
      mobile: {
        type: Number,
      },
    },
    orderItems: [
      {
        name: {
          type: String,
        },
        image: {
          type: String,
          // required: true,
        },
        product: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "product",
          // required: true,
        },
        price: {
          type: Number,
          // required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    itemsPrice: {
      type: Number,
      // required: true,
    },
    shippingPrice: {
      type: Number,
      // required: true,
    },
    taxPrice: {
      type: Number,
      // required: true,
    },
    totalPrice: {
      type: Number,
      // required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now(),
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    deliveredAt: {
      type: Date,
    },
    payment: {},
    buyer: [
     {
      type: mongoose.ObjectId,
      ref: 'users', // Replace 'User' with the actual model name for your users
    },
    {
      name: String,
      email: String,
    },
    ],
    status: {
      type: String,
      enum: [ "Processing", "Shipped", "Delivered", "Cancel"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
