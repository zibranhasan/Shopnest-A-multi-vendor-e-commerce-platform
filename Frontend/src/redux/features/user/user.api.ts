// redux/features/user/user.api.ts

import { baseApi } from "@/redux/baseApi";

export const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // =========================================
        // PUBLIC ROUTES
        // =========================================

        // ✅ Register user
        register: builder.mutation({
            query: (data) => ({
                url: "/users/register",
                method: "POST",
                data,
            }),
        }),

        // =========================================
        // AUTHENTICATED USER ROUTES
        // =========================================

        // ✅ Get my profile
        getMyProfile: builder.query({
            query: () => ({
                url: "/users/me",
                method: "GET",
            }),
            providesTags: ["User"],
        }),

        // ✅ Update my profile
        updateProfile: builder.mutation({
            query: (data: FormData) => ({
                url: "/users/me",
                method: "PATCH",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["User"],
        }),

        // ✅ Delete my account
        deleteMyProfile: builder.mutation({
            query: () => ({
                url: "/users/me",
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        // =========================================
        // ADDRESS ROUTES
        // =========================================

        // ✅ Add address
        addAddress: builder.mutation({
            query: (data) => ({
                url: "/users/me/addresses",
                method: "POST",
                data,
            }),
            invalidatesTags: ["User"],
        }),

        // ✅ Update address
        updateAddress: builder.mutation({
            query: ({
                addressId,
                data,
            }: {
                addressId: string;
                data: any;
            }) => ({
                url: `/users/me/addresses/${addressId}`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: ["User"],
        }),

        // ✅ Delete address
        deleteAddress: builder.mutation({
            query: (addressId: string) => ({
                url: `/users/me/addresses/${addressId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),

        // =========================================
        // WISHLIST ROUTES
        // =========================================

        // ✅ Get wishlist
        getWishlist: builder.query({
            query: () => ({
                url: "/users/me/wishlist",
                method: "GET",
            }),
            providesTags: ["Wishlist"],
        }),

        // ✅ Add to wishlist
        addToWishlist: builder.mutation({
            query: (data) => ({
                url: "/users/me/wishlist",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Wishlist"],
        }),

        // ✅ Remove from wishlist
        removeFromWishlist: builder.mutation({
            query: (productId: string) => ({
                url: `/users/me/wishlist/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Wishlist"],
        }),

        // =========================================
        // ADMIN ROUTES
        // =========================================

        // ✅ Get user by ID
        getUserById: builder.query({
            query: (id: string) => ({
                url: `/users/${id}`,
                method: "GET",
            }),
            providesTags: ["User"],
        }),

    }),
});

export const {
    // PUBLIC
    useRegisterMutation,

    // PROFILE
    useGetMyProfileQuery,
    useUpdateProfileMutation,
    useDeleteMyProfileMutation,

    // ADDRESS
    useAddAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,

    // WISHLIST
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,

    // ADMIN
    useGetUserByIdQuery,
} = userApi;