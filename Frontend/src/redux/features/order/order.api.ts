// redux/features/order/order.api.ts

import { baseApi } from "@/redux/baseApi";

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // =========================================
        // CUSTOMER ROUTES
        // =========================================

        // ✅ Get my orders
        getMyOrders: builder.query({
            query: (params) => ({
                url: "/orders/my-orders",
                method: "GET",
                params,
            }),
            providesTags: ["Order"],
        }),

        // ✅ Get single my order by ID
        getMyOrderById: builder.query({
            query: (id: string) => ({
                url: `/orders/my-orders/${id}`,
                method: "GET",
            }),
            providesTags: ["Order"],
        }),

        // ✅ Place order
        placeOrder: builder.mutation({
            query: (data) => ({
                url: "/orders",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Order", "Cart"],
        }),

        // ✅ Cancel order
        cancelOrder: builder.mutation({
            query: (id: string) => ({
                url: `/orders/${id}/cancel`,
                method: "PATCH",
            }),
            invalidatesTags: ["Order"],
        }),

        // =========================================
        // ADMIN ROUTES
        // =========================================

        // ✅ Get all orders (admin)
        getAllOrdersAdmin: builder.query({
            query: (params) => ({
                url: "/orders/admin/all",
                method: "GET",
                params,
            }),
            providesTags: ["Order"],
        }),

        // ✅ Get single order by ID (admin)
        getOrderByIdAdmin: builder.query({
            query: (id: string) => ({
                url: `/orders/admin/${id}`,
                method: "GET",
            }),
            providesTags: ["Order"],
        }),

    }),
});

export const {
    useGetMyOrdersQuery,
    useGetMyOrderByIdQuery,
    usePlaceOrderMutation,
    useCancelOrderMutation,
    useGetAllOrdersAdminQuery,
    useGetOrderByIdAdminQuery,
} = orderApi;