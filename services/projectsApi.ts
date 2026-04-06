import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";
import {
  Project,
  ProjectMember,
  ProjectActivity,
  DashboardOverview,
  DashboardOverviewQueryParams,
  InboxOverview,
  ApiResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
  InviteMemberPayload,
  UpdateMemberRolePayload,
} from "@/types";

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery,
  tagTypes: ["Project", "Member", "Activity"],
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",
      transformResponse: (response: ApiResponse<Project[]>) =>
        response.data ?? [],
      providesTags: ["Project"],
    }),

    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      transformResponse: (response: ApiResponse<Project>) => response.data!,
      providesTags: ["Project"],
    }),

    getDashboardOverview: builder.query<
      DashboardOverview,
      DashboardOverviewQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.projectId) {
          searchParams.set("projectId", params.projectId);
        }

        if (params?.range) {
          searchParams.set("range", params.range);
        }

        const queryString = searchParams.toString();

        return queryString
          ? `/dashboard/overview?${queryString}`
          : "/dashboard/overview";
      },
      transformResponse: (response: ApiResponse<DashboardOverview>) =>
        response.data!,
      providesTags: ["Project", "Member", "Activity"],
    }),

    getInboxOverview: builder.query<InboxOverview, void>({
      query: () => "/inbox",
      transformResponse: (response: ApiResponse<InboxOverview>) =>
        response.data!,
      providesTags: ["Project", "Member", "Activity"],
    }),

    getProjectActivity: builder.query<ProjectActivity[], string>({
      query: (projectId) => `/projects/${projectId}/activity`,
      transformResponse: (response: ApiResponse<ProjectActivity[]>) =>
        response.data ?? [],
      providesTags: ["Activity"],
    }),

    createProject: builder.mutation<Project, CreateProjectPayload>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Project>) => response.data!,
      invalidatesTags: ["Project", "Activity"],
    }),

    updateProject: builder.mutation<
      Project,
      { projectId: string } & UpdateProjectPayload
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Project>) => response.data!,
      invalidatesTags: ["Project", "Activity"],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project", "Activity"],
    }),

    getProjectMembers: builder.query<ProjectMember[], string>({
      query: (projectId) => `/projects/${projectId}/members`,
      transformResponse: (response: ApiResponse<ProjectMember[]>) =>
        response.data ?? [],
      providesTags: ["Member"],
    }),

    inviteMember: builder.mutation<
      ProjectMember,
      { projectId: string } & InviteMemberPayload
    >({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/members`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ProjectMember>) =>
        response.data!,
      invalidatesTags: ["Member", "Activity"],
    }),

    updateMemberRole: builder.mutation<
      ProjectMember,
      { projectId: string; memberId: string } & UpdateMemberRolePayload
    >({
      query: ({ projectId, memberId, ...body }) => ({
        url: `/projects/${projectId}/members/${memberId}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<ProjectMember>) =>
        response.data!,
      invalidatesTags: ["Member", "Activity"],
    }),

    removeMember: builder.mutation<
      void,
      { projectId: string; memberId: string }
    >({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/members/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Member", "Activity"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetDashboardOverviewQuery,
  useGetInboxOverviewQuery,
  useGetProjectActivityQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = projectsApi;
