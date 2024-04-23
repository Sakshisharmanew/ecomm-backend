import mongoose from "mongoose";
import colors from 'colors';

const connectDB = async ()  =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`connected to dataBASE ${conn.connection.host} `.bgYellow.bold);
    } catch (error) {
        console.log(`Error in connection ${error}`.bgRed.bold)
    }
}

export default connectDB;