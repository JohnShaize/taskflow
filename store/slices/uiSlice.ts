import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isSidebarOpen: boolean;
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  editingTaskId: string | null;
}

const initialState: UiState = {
  isSidebarOpen: true,
  isTaskModalOpen: false,
  isProjectModalOpen: false,
  editingTaskId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    openTaskModal(state, action: PayloadAction<string | null>) {
      state.isTaskModalOpen = true;
      state.editingTaskId = action.payload;
    },
    closeTaskModal(state) {
      state.isTaskModalOpen = false;
      state.editingTaskId = null;
    },
    openProjectModal(state) {
      state.isProjectModalOpen = true;
    },
    closeProjectModal(state) {
      state.isProjectModalOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openTaskModal,
  closeTaskModal,
  openProjectModal,
  closeProjectModal,
} = uiSlice.actions;

export default uiSlice.reducer;
