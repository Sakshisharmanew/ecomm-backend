import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
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
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: [addressSchema],
    states: {
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
    role: {
      type: Number,
      default: 0,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
// Define a virtual property 'isBlocked' to get the blocked status
userSchema.virtual('isBlocked').get(function () {
  return this.blocked;
});

// Make sure to set the 'toJSON' option to include virtuals when calling 'toJSON' on the document
userSchema.set('toJSON', { virtuals: true });

// Method to block a user
userSchema.methods.blockUser = function () {
  this.blocked = true;
  return this.save();
};

// Method to unblock a user
userSchema.methods.unblockUser = function () {
  this.blocked = false;
  return this.save();
};
export default mongoose.model("users", userSchema);
