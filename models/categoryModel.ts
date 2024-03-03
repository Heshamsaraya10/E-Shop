import mongoose, { Schema, Document } from "mongoose";

interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
}

const categorySchema: Schema<ICategory> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category required"],
      unique: true,
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

//Crate model
const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);

export default CategoryModel;
