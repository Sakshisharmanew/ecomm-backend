import mongoose from "mongoose"
const sliderSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
      },
    subTitle:{
        type:String,
    },   
    des:{
        type:String,
    }, 
    photo:{
        data:Buffer,
        contentType:String,
    },
    link:{
        type:String,
    },  
   
},{timestamps: true});

export default mongoose.model("slider", sliderSchema);
