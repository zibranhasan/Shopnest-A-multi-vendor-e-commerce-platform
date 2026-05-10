import { model, Schema } from "mongoose";
import { ShopStatus, type IShop } from "./shop.interface.js";

const shopSchema = new Schema<IShop>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        logo: { type: String },
        banner: { type: String },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: Object.values(ShopStatus),
            default: ShopStatus.PENDING,
        },
        address: { type: String },
        phone: { type: String },
        email: { type: String },
        isDeleted: { type: Boolean, default: false },
        totalProducts: { type: Number, default: 0 },
        totalSales: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Slug auto-generation from name
shopSchema.pre("save", function () {
    if (this.isModified("name")) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
});

export const Shop = model<IShop>("Shop", shopSchema);
