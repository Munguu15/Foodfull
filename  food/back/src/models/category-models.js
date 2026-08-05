import mongoose from "mongoose";
const Schema = mongoose.Schema;
const ObjectiD = Schema.ObjectiD;

const CategorySchema = new Schema({
    id: ObjectiD,
    categoryName: {
    categoryName: String,
    required: false,   
    },
  createdAt: {type: Date, required: true , default: Date.now},
  updatedAt: {type: Date, required: true , default: Date.now},
});

export const categoryModel = mongoose.model("Category", CategorySchema);