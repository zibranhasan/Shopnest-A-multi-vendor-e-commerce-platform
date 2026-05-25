import { baseApi } from "@/redux/baseApi";
import { IResponse } from "@/types";
import { ISendOtp, IVerifyOtp } from "@/types/auth.type";


export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (userInfo) => ({
                url: "/auth/login",
                method: "POST",
                data: userInfo,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            invalidatesTags: ["User"],
        }),
        register: builder.mutation({
            query: (userInfo) => ({
                url: "/users/register",
                method: "POST",
                data: userInfo,
            }),
        }),
        sendOtp: builder.mutation<IResponse<null>, ISendOtp>({
            query: (userInfo) => ({
                url: "/otp/send",
                method: "POST",
                data: userInfo,
            }),
        }),
        verifyOtp: builder.mutation<IResponse<null>, IVerifyOtp>({
            query: (userInfo) => ({
                url: "/otp/verify",
                method: "POST",
                data: userInfo,
            }),
        }),
        userInfo: builder.query({
            query: () => ({
                url: "/user/me",
                method: "GET",
            }),
            providesTags: ["User"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useSendOtpMutation,
    useVerifyOtpMutation,
    useUserInfoQuery,
    useLogoutMutation,
} = authApi;
