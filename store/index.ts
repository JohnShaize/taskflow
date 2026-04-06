import { configureStore } from '@reduxjs/toolkit'
import { projectsApi } from '@/services/projectsApi'
import { tasksApi } from '@/services/tasksApi'
import authReducer from './slices/authSlice'
import boardReducer from './slices/boardSlice'
import projectReducer from './slices/projectSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
    project: projectReducer,
    ui: uiReducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(projectsApi.middleware)
      .concat(tasksApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch