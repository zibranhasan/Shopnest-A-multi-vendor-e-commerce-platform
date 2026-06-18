import { baseApi } from "@/redux/baseApi";
import type { IAdminUser } from "@/types";

export interface IAdminUsersResponse {
  success: boolean;
  statusCode?: number;
  message?: string;
  data: IAdminUser[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<IAdminUsersResponse, any>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<IAdminUsersResponse, any>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",

      }),
      providesTags: ["User"],
    }),

    changeUserRole: builder.mutation<any, { id: string; role: string }>({
      query: ({ id, role }: { id: string; role: string }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        data: { role },
      }),
      invalidatesTags: ["User"],
    }),

    changeUserStatus: builder.mutation<any, { id: string; isActive: string }>({
      query: ({ id, isActive }: { id: string; isActive: string }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        data: { isActive },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useChangeUserRoleMutation,
  useChangeUserStatusMutation,
} = adminUserApi;
