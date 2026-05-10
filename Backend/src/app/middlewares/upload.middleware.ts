import { multerUpload } from "../config/multer.config.js";

// single file upload
export const uploadSingle = (fieldName: string) =>
    multerUpload.single(fieldName);

// multiple files upload (different fields)
export const uploadFields = (fields: { name: string; maxCount: number }[]) =>
    multerUpload.fields(fields);

// multiple files same field
export const uploadArray = (fieldName: string, maxCount: number) =>
    multerUpload.array(fieldName, maxCount);
