// redux/features/otp/otp.api.ts

import { baseApi } from "@/redux/baseApi";
import { IResponse } from "@/types";
import { ISendOtp, IVerifyOtp } from "@/types/auth.type";

export const otpApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ✅ Send OTP
        sendOtp: builder.mutation<IResponse<null>, ISendOtp>({
            query: (data) => ({
                url: "/otp/send",
                method: "POST",
                data,
            }),
        }),

        // ✅ Verify OTP
        verifyOtp: builder.mutation<IResponse<null>, IVerifyOtp>({
            query: (data) => ({
                url: "/otp/verify",
                method: "POST",
                data,
            }),
        }),

    }),
});

export const {
    useSendOtpMutation,
    useVerifyOtpMutation,
} = otpApi;