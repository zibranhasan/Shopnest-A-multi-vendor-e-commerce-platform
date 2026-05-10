import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { User } from "../user/user.model.js";
import { Role } from "../user/user.interface.js";
import { Shop } from "./shop.model.js";
import { ShopStatus, type IShop } from "./shop.interface.js";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { shopAdminSearchableFields, shopSearchableFields } from "./shop.constant.js";

const createShop = async (
    vendorId: string,
    payload: Partial<IShop>,
    files: { [fieldname: string]: Express.Multer.File[] } | any
) => {
    const vendor = await User.findById(vendorId);
    if (!vendor) {
        throw new AppError(StatusCodes.NOT_FOUND, "Vendor not found");
    }

    if (vendor.role !== Role.VENDOR) {
        throw new AppError(StatusCodes.FORBIDDEN, "Only vendors can create a shop");
    }

    const existingShop = await Shop.findOne({ vendor: vendorId });
    if (existingShop) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You already have a shop");
    }

    const logo = files?.["logo"]?.[0]?.path;
    const banner = files?.["banner"]?.[0]?.path;

    const shop = await Shop.create({
        ...payload,
        logo,
        banner,
        vendor: vendorId,
    });

    await User.findByIdAndUpdate(vendorId, { shop: shop._id });

    return shop;
};

const getMyShop = async (vendorId: string) => {
    const shop = await Shop.findOne({ vendor: vendorId, isDeleted: false }).populate("vendor", "name email picture");
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }
    return shop;
};

const updateMyShop = async (
    vendorId: string,
    payload: Partial<IShop>,
    files: { [fieldname: string]: Express.Multer.File[] } | any
) => {
    const shop = await Shop.findOne({ vendor: vendorId, isDeleted: false });
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }

    if (shop.status === ShopStatus.SUSPENDED || shop.status === ShopStatus.REJECTED) {
        throw new AppError(StatusCodes.FORBIDDEN, `Your shop is ${shop.status.toLowerCase()}. Contact admin.`);
    }

    const logo = files?.["logo"]?.[0]?.path;
    const banner = files?.["banner"]?.[0]?.path;

    if (logo && shop.logo) {
        await deleteImageFromCLoudinary(shop.logo);
    }
    if (banner && shop.banner) {
        await deleteImageFromCLoudinary(shop.banner);
    }

    const updateData: Partial<IShop> = { ...payload };
    if (logo) updateData.logo = logo;
    if (banner) updateData.banner = banner;

    if (payload.name) {
        updateData.slug = payload.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    const updatedShop = await Shop.findByIdAndUpdate(shop._id, updateData, {
        new: true,
        runValidators: true,
    });

    return updatedShop;
};

const deleteMyShop = async (vendorId: string) => {
    const shop = await Shop.findOne({ vendor: vendorId, isDeleted: false });
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }

    await Shop.findByIdAndUpdate(shop._id, { isDeleted: true });
    await User.findByIdAndUpdate(vendorId, { $unset: { shop: 1 } });

    return null;
};

const getAllShopsPublic = async (query: Record<string, string>) => {
    const shopQuery = new QueryBuilder(Shop.find({ status: ShopStatus.ACTIVE, isDeleted: false }), query)
        .search(shopSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await shopQuery.modelQuery.populate("vendor", "name picture");
    const meta = await shopQuery.getMeta();

    return { data: result, meta };
};

const getShopBySlug = async (slug: string) => {
    const shop = await Shop.findOne({ slug, isDeleted: false }).populate("vendor", "name picture");
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }
    if (shop.status !== ShopStatus.ACTIVE) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Shop is not available");
    }
    return shop;
};

const getAllShopsAdmin = async (query: Record<string, string>) => {
    const shopQuery = new QueryBuilder(Shop.find(), query)
        .search(shopAdminSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await shopQuery.modelQuery.populate("vendor", "name email picture");
    const meta = await shopQuery.getMeta();

    return { data: result, meta };
};

const getShopByIdAdmin = async (shopId: string) => {
    const shop = await Shop.findById(shopId).populate("vendor", "name email picture role");
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }
    return shop;
};

const updateShopStatus = async (shopId: string, status: ShopStatus) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }

    const updatedShop = await Shop.findByIdAndUpdate(shopId, { status }, { new: true });
    return updatedShop;
};

export const ShopServices = {
    createShop,
    getMyShop,
    updateMyShop,
    deleteMyShop,
    getAllShopsPublic,
    getShopBySlug,
    getAllShopsAdmin,
    getShopByIdAdmin,
    updateShopStatus,
};
