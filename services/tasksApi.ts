import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";
import {
  Task,
  TaskComment,
  MyTasksOverview,
  ApiResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateTaskCommentPayload,
  ReorderTasksPayload,
} from "@/types";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery,
  tagTypes: ["Task", "TaskComment"],
  endpoints: (builder) => ({
    getTasksByProject: builder.query<Task[], string>({
      query: (projectId) => `/projects/${projectId}/tasks`,
      transformResponse: (response: ApiResponse<Task[]>) => response.data ?? [],
      providesTags: ["Task"],
    }),

    getMyTasksOverview: builder.query<MyTasksOverview, void>({
      query: () => "/tasks/my",
      transformResponse: (response: ApiResponse<MyTasksOverview>) =>
        response.data!,
      providesTags: ["Task", "TaskComment"],
    }),

    createTask: builder.mutation<Task, CreateTaskPayload>({
      query: (body) => ({
        url: `/projects/${body.project_id}/tasks`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Task>) => response.data!,
      invalidatesTags: ["Task"],
    }),

    updateTask: builder.mutation<Task, { id: string } & UpdateTaskPayload>({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<Task>) => response.data!,
      invalidatesTags: ["Task"],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),

    reorderTasks: builder.mutation<void, ReorderTasksPayload>({
      query: ({ projectId, tasks }) => ({
        url: `/projects/${projectId}/tasks/reorder`,
        method: "PATCH",
        body: { tasks },
      }),
      invalidatesTags: ["Task"],
    }),

    getTaskComments: builder.query<TaskComment[], string>({
      query: (taskId) => `/tasks/${taskId}/comments`,
      transformResponse: (response: ApiResponse<TaskComment[]>) =>
        response.data ?? [],
      providesTags: ["TaskComment"],
    }),

    createTaskComment: builder.mutation<TaskComment, CreateTaskCommentPayload>({
      query: ({ taskId, content }) => ({
        url: `/tasks/${taskId}/comments`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (response: ApiResponse<TaskComment>) => response.data!,
      invalidatesTags: ["TaskComment", "Task"],
    }),
  }),
});

export const {
  useGetTasksByProjectQuery,
  useGetMyTasksOverviewQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useReorderTasksMutation,
  useGetTaskCommentsQuery,
  useCreateTaskCommentMutation,
} = tasksApi;
