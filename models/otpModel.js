import mongoose from "mongoose";
const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: {
            expires: '5m'
        }
    }
}, { timestamps: true });

export default mongoose.model('otps', otpSchema);