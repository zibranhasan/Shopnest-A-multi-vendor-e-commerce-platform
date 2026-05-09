import bcryptjs from "bcryptjs";

import { envVars } from "../config/env.js";
import { User } from "../modules/user/user.model.js";
import { Role, type IAuthProvider, type IUser } from "../modules/user/user.interface.js";


export const seedSuperAdmin = async () => {
    try {
        const isSuperAdminExist = await User.findOne({
            email: envVars.SUPER_ADMIN_EMAIL,
        });

        if (isSuperAdminExist) {
            console.log("Super Admin Already Exists!");
            return;
        }

        console.log("Trying to create Super Admin...");

        const hashedPassword = await bcryptjs.hash(
            envVars.SUPER_ADMIN_PASSWORD,
            Number(envVars.BCRYPT_SALT_ROUND) || 12,
        );

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL,
        };

        const payload: IUser = {
            name: "Super admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider],
        };

        const superadmin = await User.create(payload);
        console.log("Super Admin Created Successfuly! \n");
        console.log(superadmin);
    } catch (error) {
        console.log(error);
    }
};
