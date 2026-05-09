import { model, Schema } from "mongoose";
import {
    IsActive,
    Role,
    type IAuthProvider,
    type IAddress,
    type IUser,
} from "./user.interface.js";

const authProviderSchema = new Schema<IAuthProvider>(
    {
        provider: { type: String, required: true },
        providerId: { type: String, required: true },
    },
    { versionKey: false, _id: false }
);

const addressSchema = new Schema<IAddress>(
    {
        label: { type: String },           // "Home", "Office"
        street: { type: String, required: true },
        city: { type: String, required: true },
        district: { type: String, required: true },
        postalCode: { type: String },
        isDefault: { type: Boolean, default: false },
    },
    { versionKey: false, _id: true }
);

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        phone: { type: String },
        picture: { type: String },

        role: {
            type: String,
            enum: Object.values(Role),
            default: Role.CUSTOMER,      // ← default is CUSTOMER not USER
        },

        isActive: {
            type: String,
            enum: Object.values(IsActive),
            default: IsActive.ACTIVE,
        },

        isVerified: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },

        auths: [authProviderSchema],

        // customer specific
        addresses: [addressSchema],
        wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],

        // vendor specific
        shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const User = model<IUser>("User", userSchema);