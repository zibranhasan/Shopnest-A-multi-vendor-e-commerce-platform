// redux/features/shop/shop.api.ts

import { baseApi } from "@/redux/baseApi";

export const shopApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // =========================================
        // PUBLIC ROUTES
        // =========================================

        // ✅1. Get all shops (public)
        getAllShops: builder.query({
            query: (params) => ({
                url: "/shops",
                method: "GET",
                params,
            }),
            providesTags: ["Shop"],
        }),

        // ✅2. Get shop by slug (public)
        getShopBySlug: builder.query({
            query: (slug: string) => ({
                url: `/shops/${slug}`,
                method: "GET",
            }),
            providesTags: ["Shop"],
        }),

        // =========================================
        // VENDOR ROUTES
        // =========================================

        // ✅3. Get my shop
        getMyShop: builder.query({
            query: () => ({
                url: "/shops/my-shop",
                method: "GET",
            }),
            providesTags: ["Shop"],
        }),

        // ✅4. Create shop
        createShop: builder.mutation({
            query: (data: FormData) => ({
                url: "/shops",
                method: "POST",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["Shop"],
        }),

        // ✅5. Update my shop
        updateMyShop: builder.mutation({
            query: (data: FormData) => ({
                url: "/shops/my-shop",
                method: "PATCH",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["Shop"],
        }),

        // ✅6. Delete my shop
        deleteMyShop: builder.mutation({
            query: () => ({
                url: "/shops/my-shop",
                method: "DELETE",
            }),
            invalidatesTags: ["Shop"],
        }),

        // =========================================
        // ADMIN ROUTES
        // =========================================

        // ✅7. Get all shops admin
        getAllShopsAdmin: builder.query({
            query: (params) => ({
                url: "/shops/admin/all",
                method: "GET",
                params,
            }),
            providesTags: ["Shop"],
        }),

        // ✅8. Get single shop by ID admin
        getShopByIdAdmin: builder.query({
            query: (id: string) => ({
                url: `/shops/admin/${id}`,
                method: "GET",
            }),
            providesTags: ["Shop"],
        }),

        // ✅9. Update shop status admin
        updateShopStatus: builder.mutation({
            query: ({
                id,
                status,
            }: {
                id: string;
                status: string;
            }) => ({
                url: `/shops/admin/${id}/status`,
                method: "PATCH",
                data: { status },
            }),
            invalidatesTags: ["Shop"],
        }),

    }),
});

export const {
    useGetAllShopsQuery,
    useGetShopBySlugQuery,

    useGetMyShopQuery,
    useCreateShopMutation,
    useUpdateMyShopMutation,
    useDeleteMyShopMutation,

    useGetAllShopsAdminQuery,
    useGetShopByIdAdminQuery,
    useUpdateShopStatusMutation,
} = shopApi;