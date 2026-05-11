import { model, Schema } from "mongoose";
import type { ICategory } from "./category.interface.js";

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        image: { type: String },
        description: { type: String },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Category = model<ICategory>("Category", categorySchema);
