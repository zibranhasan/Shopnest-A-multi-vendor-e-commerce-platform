// redux/features/category/category.api.ts

import { baseApi } from "@/redux/baseApi";

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ✅1. Get all categories (public)
        getAllCategories: builder.query({
            query: () => ({
                url: "/categories",
                method: "GET",
            }),
            providesTags: ["Category"],
        }),

        // ✅2. Get single category by slug (public)
        getCategoryBySlug: builder.query({
            query: (slug: string) => ({
                url: `/categories/${slug}`,
                method: "GET",
            }),
            providesTags: ["Category"],
        }),

        // ✅3. Create category (admin/super admin)
        createCategory: builder.mutation({
            query: (data: FormData) => ({
                url: "/categories",
                method: "POST",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["Category"],
        }),

        // ✅4. Update category (admin/super admin)
        updateCategory: builder.mutation({
            query: ({
                id,
                data,
            }: {
                id: string;
                data: FormData;
            }) => ({
                url: `/categories/${id}`,
                method: "PATCH",
                data,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }),
            invalidatesTags: ["Category"],
        }),

        // ✅5 Delete category (admin/super admin)
        deleteCategory: builder.mutation({
            query: (id: string) => ({
                url: `/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Category"],
        }),

    }),
});

export const {
    useGetAllCategoriesQuery,
    useGetCategoryBySlugQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;