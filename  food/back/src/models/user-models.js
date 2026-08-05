import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectiD = Schema.ObjectiD;

const UserSchema = new Schema ({
    id: ObjectiD,
    name : String,
    email : String,
    password : String,
    phone: String,
    role: {

    },
    
  createdAt: {type: Date, required: true , default: Date.now},
  updatedAt: {type: Date, required: true , default: Date.now},
});

export const categoryModel = mongoose.model("Category", CategorySchema);