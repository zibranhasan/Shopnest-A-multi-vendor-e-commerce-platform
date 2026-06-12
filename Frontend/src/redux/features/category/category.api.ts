import { baseApi } from "@/redux/baseApi";
import type { ICategory } from "@/types";

export interface ICategoryResponse {
    success: boolean;
    data: ICategory[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPage: number;
    };
}

export interface ISingleCategoryResponse {
    success: boolean;
    data: ICategory;
}

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllCategories: builder.query<ICategoryResponse, any>({
            query: (params) => ({
                url: "/categories",
                method: "GET",
                params,
            }),
            providesTags: ["Category"],
        }),
        createCategory: builder.mutation<ISingleCategoryResponse, FormData>({
            query: (data: FormData) => ({
                url: "/categories",
                method: "POST",
                data,
                headers: { "Content-Type": "multipart/form-data" },
            }),
            invalidatesTags: ["Category"],
        }),
        updateCategory: builder.mutation<ISingleCategoryResponse, { id: string; data: FormData }>({
            query: ({ id, data }: { id: string; data: FormData }) => ({
                url: `/categories/${id}`,
                method: "PATCH",
                data,
                headers: { "Content-Type": "multipart/form-data" },
            }),
            invalidatesTags: ["Category"],
        }),
        deleteCategory: builder.mutation<ISingleCategoryResponse, string>({
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
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;