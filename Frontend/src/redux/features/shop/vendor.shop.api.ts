import { baseApi } from "@/redux/baseApi";

export const vendorShopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getMyShop: builder.query({
      query: () => ({
        url: "/shops/my-shop",
        method: "GET",
      }),
      providesTags: ["Shop"],
    }),

    createShop: builder.mutation({
      query: (data: FormData) => ({
        url: "/shops",
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Shop"],
    }),

    updateMyShop: builder.mutation({
      query: (data: FormData) => ({
        url: "/shops/my-shop",
        method: "PATCH",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Shop"],
    }),

    deleteMyShop: builder.mutation({
      query: () => ({
        url: "/shops/my-shop",
        method: "DELETE",
      }),
      invalidatesTags: ["Shop"],
    }),

  }),
});

export const {
  useGetMyShopQuery,
  useCreateShopMutation,
  useUpdateMyShopMutation,
  useDeleteMyShopMutation,
} = vendorShopApi;
