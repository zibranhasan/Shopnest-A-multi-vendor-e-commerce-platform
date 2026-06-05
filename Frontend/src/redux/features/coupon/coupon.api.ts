// redux/features/coupon/coupon.api.ts

import { baseApi } from "@/redux/baseApi";

export const couponApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ✅ Apply coupon (customer)
        applyCoupon: builder.mutation({
            query: (data) => ({
                url: "/coupons/apply",
                method: "POST",
                data,
            }),
        }),

        // ✅ Create coupon (admin/super admin)
        createCoupon: builder.mutation({
            query: (data) => ({
                url: "/coupons",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Coupon"],
        }),

        // ✅ Get all coupons (admin/super admin)
        getAllCoupons: builder.query({
            query: (params) => ({
                url: "/coupons",
                method: "GET",
                params,
            }),
            providesTags: ["Coupon"],
        }),

        // ✅ Get coupon by ID (admin/super admin)
        getCouponById: builder.query({
            query: (id: string) => ({
                url: `/coupons/${id}`,
                method: "GET",
            }),
            providesTags: ["Coupon"],
        }),

        // ✅ Update coupon (admin/super admin)
        updateCoupon: builder.mutation({
            query: ({
                id,
                data,
            }: {
                id: string;
                data: any;
            }) => ({
                url: `/coupons/${id}`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: ["Coupon"],
        }),

        // ✅ Delete coupon (admin/super admin)
        deleteCoupon: builder.mutation({
            query: (id: string) => ({
                url: `/coupons/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Coupon"],
        }),

    }),
});

export const {
    useApplyCouponMutation,
    useCreateCouponMutation,
    useGetAllCouponsQuery,
    useGetCouponByIdQuery,
    useUpdateCouponMutation,
    useDeleteCouponMutation,
} = couponApi;