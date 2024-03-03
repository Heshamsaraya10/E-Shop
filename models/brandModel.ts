import mongoose, { Schema, Document } from "mongoose";

interface IBrand extends Document {
  name: string;
  slug: string;
  image?: string;
}

const brandSchema: Schema<IBrand> = new mongoose.Schema(
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

const BrandModel = mongoose.model<IBrand>("Brand", brandSchema);

export default BrandModel;
