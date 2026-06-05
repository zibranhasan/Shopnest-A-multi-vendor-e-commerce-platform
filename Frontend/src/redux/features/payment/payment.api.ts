// redux/features/payment/payment.api.ts

import { baseApi } from "@/redux/baseApi";

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ✅ Initialize payment
        initPayment: builder.mutation({
            query: (orderId: string) => ({
                url: `/payment/init/${orderId}`,
                method: "POST",
            }),
        }),

        // ✅ Payment success callback
        successPayment: builder.mutation({
            query: (data) => ({
                url: "/payment/success",
                method: "POST",
                data,
            }),
        }),

        // ✅ Payment fail callback
        failPayment: builder.mutation({
            query: (data) => ({
                url: "/payment/fail",
                method: "POST",
                data,
            }),
        }),

        // ✅ Payment cancel callback
        cancelPayment: builder.mutation({
            query: (data) => ({
                url: "/payment/cancel",
                method: "POST",
                data,
            }),
        }),

    }),
});

export const {
    useInitPaymentMutation,
    useSuccessPaymentMutation,
    useFailPaymentMutation,
    useCancelPaymentMutation,
} = paymentApi;