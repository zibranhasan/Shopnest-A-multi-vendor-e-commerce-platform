import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";
import type { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

import AppError from "../../errorHelpers/AppError.js";
import { envVars } from "../../config/env.js";

import { User } from "./user.model.js";
import { Role, IsActive, type IAuthProvider, type IUser, type IAddress } from "./user.interface.js";
import { userSearchableFields } from "./user.constant.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, name, phone } = payload;

    if (!email) throw new AppError(StatusCodes.BAD_REQUEST, "Email is required");
    if (!password) throw new AppError(StatusCodes.BAD_REQUEST, "Password is required");

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User Already Exist!");
    }

    const hashedPassword = await bcryptjs.hash(
        password,
        Number(envVars.BCRYPT_SALT_ROUND) || 12,
    );

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email,
    };

    if (!name) throw new AppError(StatusCodes.BAD_REQUEST, "Name is required");

    const userPayload: any = {
        name,
        email,
        password: hashedPassword,
        auths: [authProvider],
    };
    if (phone) userPayload.phone = phone;

    const user = await User.create(userPayload);

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};

const getAllUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build().select("-password"),
        queryBuilder.getMeta(),
    ]);

    return { data, meta };
};

const getUserById = async (id: string) => {
    const user = await User.findById(id).select("-password");
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    }
    if (user.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
    }
    return user;
};

const updateUser = async (userId: string, payload: Partial<IUser>) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    }
    if (user.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
    }

    // Only allow updating name, phone, picture
    const updateData: Partial<IUser> = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.phone) updateData.phone = payload.phone;
    if (payload.picture) updateData.picture = payload.picture;

    const newUpdatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select("-password");

    return newUpdatedUser;
};

const deleteUser = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    }
    if (user.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is already deleted");
    }

    await User.findByIdAndUpdate(userId, { isDeleted: true });
    return null;
};

const changeUserRole = async (userId: string, role: Role) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
    return updatedUser;
};

const changeUserStatus = async (userId: string, isActive: IsActive) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("-password");
    return updatedUser;
};

// Address Management
const addAddress = async (userId: string, addressPayload: IAddress) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");

    if (addressPayload.isDefault) {
        // Set all existing addresses to isDefault: false
        await User.updateOne(
            { _id: userId },
            { $set: { "addresses.$[].isDefault": false } }
        );
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { addresses: addressPayload } },
        { new: true }
    ).select("-password");

    return updatedUser;
};

const updateAddress = async (userId: string, addressId: string, addressPayload: Partial<IAddress>) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");

    const addressExists = user.addresses?.find((addr: any) => addr._id.toString() === addressId);
    if (!addressExists) {
        throw new AppError(StatusCodes.NOT_FOUND, "Address Not Found");
    }

    if (addressPayload.isDefault === true) {
        // Set all existing addresses to isDefault: false first
        await User.updateOne(
            { _id: userId },
            { $set: { "addresses.$[].isDefault": false } }
        );
    }

    // Build the set object for the specific address
    const setObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(addressPayload)) {
        setObj[`addresses.$.${key}`] = value;
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, "addresses._id": addressId },
        { $set: setObj },
        { new: true }
    ).select("-password");

    return updatedUser;
};

const deleteAddress = async (userId: string, addressId: string) => {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { addresses: { _id: addressId } } },
        { new: true }
    ).select("-password");

    return updatedUser;
};

// Wishlist Management
const addToWishlist = async (userId: string, productId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");

    const objectId = new Types.ObjectId(productId);

    // Check if already in wishlist to avoid duplicates
    if (user.wishlist?.includes(objectId as any)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Product already in wishlist");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: objectId } }, // $addToSet is another way to prevent duplicates
        { new: true }
    ).select("-password");

    return updatedUser?.wishlist;
};

const removeFromWishlist = async (userId: string, productId: string) => {
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: new Types.ObjectId(productId) } },
        { new: true }
    ).select("-password");

    return updatedUser?.wishlist;
};

const getWishlist = async (userId: string) => {
    const user = await User.findById(userId)
        .populate("wishlist")
        .select("wishlist");

    if (!user) throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    return user.wishlist;
};

const getMyProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User Not Found");
    }
    if (user.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
    }
    return user;
};

export const UserServices = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    changeUserStatus,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    getMyProfile,
};
