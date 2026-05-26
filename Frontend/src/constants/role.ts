export const role = {
    superAdmin: "SUPER_ADMIN",
    admin: "ADMIN",
    vendor: "VENDOR",
    customer: "CUSTOMER",
} as const;

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    VENDOR = "VENDOR",
    CUSTOMER = "CUSTOMER",
}
