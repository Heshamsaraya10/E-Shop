import mongoose, { Schema, Document } from "mongoose";

interface ISubCategory extends Document {
  name: string;
  slug: string;
  category: mongoose.Types.ObjectId;
}

const subCategorySchema: Schema<ISubCategory> =
  new mongoose.Schema<ISubCategory>(
    {
      name: {
        type: String,
        trim: true,
        unique: true,
        minlength: [2, "Too short SubCategory name"],
        maxlength: [32, "Too long SubCategory name"],
      },
      slug: {
        type: String,
        lowercase: true,
      },
      category: {
        type: mongoose.Schema.Types.ObjectId, // Use mongoose.Schema.Types.ObjectId here
        ref: "Category",
        required: [true, "SubCategory must belong to parent category"],
      },
    },
    { timestamps: true }
  );

//Crate model
const subCategoryModel = mongoose.model<ISubCategory>(
  "SubCategory",
  subCategorySchema
);

export default subCategoryModel;
