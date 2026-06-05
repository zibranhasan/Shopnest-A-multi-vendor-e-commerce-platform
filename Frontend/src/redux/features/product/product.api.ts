// redux/features/product/product.api.ts
import { baseApi } from "@/redux/baseApi";


export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ✅ Get all products (public)
        getAllProducts: builder.query({
            query: (params) => ({
                url: "/products",
                method: "GET",
                params,
            }),
            providesTags: ["Product"],
        }),

        // ✅ Get single product by slug (public)
        getProductBySlug: builder.query({
            query: (slug: string) => ({
                url: `/products/${slug}`,
                method: "GET",
            }),
            providesTags: ["Product"],
        }),

        // ✅ Get my products (vendor)
        getMyProducts: builder.query({
            query: (params) => ({
                url: "/products/my-products",
                method: "GET",
                params,
            }),
            providesTags: ["Product"],
        }),

        // ✅ Create product (vendor)
        createProduct: builder.mutation({
            query: (data: FormData) => ({
                url: "/products",
                method: "POST",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["Product"],
        }),

        // ✅ Update product (vendor)
        updateProduct: builder.mutation({
            query: ({ id, data }: { id: string; data: FormData }) => ({
                url: `/products/${id}`,
                method: "PATCH",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["Product"],
        }),

        // ✅ Delete product (vendor)
        deleteProduct: builder.mutation({
            query: (id: string) => ({
                url: `/products/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Product"],
        }),

        // ✅ Get all products admin
        getAllProductsAdmin: builder.query({
            query: (params) => ({
                url: "/products/admin/all",
                method: "GET",
                params,
            }),
            providesTags: ["Product"],
        }),

        // ✅ Update product status (admin)
        updateProductStatus: builder.mutation({
            query: ({ id, status }: { id: string; status: string }) => ({
                url: `/products/admin/${id}/status`,
                method: "PATCH",
                data: { status },
            }),
            invalidatesTags: ["Product"],
        }),

    }),
});

export const {
    useGetAllProductsQuery,
    useGetProductBySlugQuery,
    useGetMyProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetAllProductsAdminQuery,
    useUpdateProductStatusMutation,
} = productApi;