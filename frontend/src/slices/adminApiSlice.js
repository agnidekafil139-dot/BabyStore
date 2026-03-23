import { apiSlice } from './apiSlice';

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminOverview: builder.query({
            query: () => ({
                url: '/api/admin/overview',
            }),
            keepUnusedDataFor: 5,
        }),
        getOrders: builder.query({
            query: () => ({
                url: '/api/orders',
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Order']
        }),
        deliverOrder: builder.mutation({
            query: (orderId) => ({
                url: `/api/orders/${orderId}/deliver`,
                method: 'PUT',
            }),
            invalidatesTags: ['Order']
        }),
        getUsers: builder.query({
            query: () => ({
                url: '/api/users',
            }),
            keepUnusedDataFor: 5,
            providesTags: ['User']
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/api/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User']
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: `/api/users/${data.userId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['User']
        }),
    }),
});

export const {
    useGetAdminOverviewQuery,
    useGetOrdersQuery,
    useDeliverOrderMutation,
    useGetUsersQuery,
    useDeleteUserMutation,
    useUpdateUserMutation
} = adminApiSlice;
