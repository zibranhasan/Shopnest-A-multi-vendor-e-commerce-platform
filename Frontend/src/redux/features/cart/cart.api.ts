// redux/features/cart/cart.api.ts

import { baseApi } from "@/redux/baseApi";

export const cartApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ✅ Get cart (customer)
        getCart: builder.query({
            query: () => ({
                url: "/cart",
                method: "GET",
            }),
            providesTags: ["Cart", "User"],
        }),

        // ✅ Add to cart (customer)
        addToCart: builder.mutation({
            query: (data) => ({
                url: "/cart",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Cart"],
        }),

        // ✅ Clear cart (customer)
        clearCart: builder.mutation({
            query: () => ({
                url: "/cart",
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),

        // ✅ Update cart quantity (customer)
        updateCartQuantity: builder.mutation({
            query: ({
                productId,
                quantity,
            }: {
                productId: string;
                quantity: number;
            }) => ({
                url: `/cart/${productId}`,
                method: "PATCH",
                data: { quantity },
            }),
            invalidatesTags: ["Cart"],
        }),

        // ✅ Remove from cart (customer)
        removeFromCart: builder.mutation({
            query: (productId: string) => ({
                url: `/cart/${productId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cart"],
        }),

    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useClearCartMutation,
    useUpdateCartQuantityMutation,
    useRemoveFromCartMutation,
} = cartApi;