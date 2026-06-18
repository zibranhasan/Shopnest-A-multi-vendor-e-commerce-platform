import { baseApi } from "@/redux/baseApi";

export const vendorProductApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMyProducts: builder.query({
      query: (params) => ({
        url: "/products/my-products",
        method: "GET",
        params,
      }),
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation({
      query: (data: FormData) => ({
        url: "/products",
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Product", "Shop"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Shop"],
    }),

  }),
});

export const {
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = vendorProductApi;
