import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  // user: [
  //   {
  //     type: mongoose.ObjectId,
  //     ref: "users",
  //   },
  // ],
  photo:{
    data:Buffer,
    contentType:String,
},
  text: String,
});
export default mongoose.model("Message", messageSchema);
