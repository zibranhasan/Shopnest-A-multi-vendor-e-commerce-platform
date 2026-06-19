import { baseApi } from "@/redux/baseApi";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getProductReviews: builder.query({
      query: ({ productId, ...params }) => ({
        url: `/reviews/product/${productId}`,
        method: "GET",
        params,
      }),
      providesTags: ["Review"],
    }),

    checkCanReview: builder.query({
      query: (productId: string) => ({
        url: `/reviews/can-review/${productId}`,
        method: "GET",
      }),
      providesTags: ["Review"],
    }),

    createReview: builder.mutation({
      query: (data: FormData) => ({
        url: "/reviews",
        method: "POST",
        data,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Review", "Product"],
    }),

    updateReview: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["Review", "Product"],
    }),

    deleteReview: builder.mutation({
      query: (id: string) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review", "Product"],
    }),

  }),
});

export const {
  useGetProductReviewsQuery,
  useCheckCanReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
