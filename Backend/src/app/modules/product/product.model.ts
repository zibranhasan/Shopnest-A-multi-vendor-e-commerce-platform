import { Schema, model } from "mongoose";
import { ProductStatus, type IProduct, type IVariant } from "./product.interface.js";


const variantSchema = new Schema<IVariant>({
    size: { type: String },
    color: { type: String },
    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 },
}, { _id: true });

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    images: { type: [String], required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    discountPercent: { type: Number },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0 },
    variants: [variantSchema],
    ratings: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    tags: { type: [String] },
    status: {
        type: String,
        enum: Object.values(ProductStatus),
        default: ProductStatus.DRAFT
    },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});

// Pre-save hook for auto calculations
// ✅ Also works — async version needs no next
productSchema.pre("save", async function () {
    if (this.discountPrice && this.price > 0) {
        this.discountPercent = Math.round(
            ((this.price - this.discountPrice) / this.price) * 100
        );
    } else {
        this.discountPercent = 0;
    }

    if (this.stock === 0) {
        this.status = ProductStatus.OUT_OF_STOCK;
    } else if (this.stock > 0 && this.status === ProductStatus.OUT_OF_STOCK) {
        this.status = ProductStatus.ACTIVE;
    }
});

export const Product = model<IProduct>("Product", productSchema);
