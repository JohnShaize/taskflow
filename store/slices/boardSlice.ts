import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task, TaskStatus } from "@/types";

interface BoardState {
  tasks: Task[];
  filteredPriority: string | null;
  filteredAssignee: string | null;
  isLoading: boolean;
}

const initialState: BoardState = {
  tasks: [],
  filteredPriority: null,
  filteredAssignee: null,
  isLoading: false,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },
    moveTask(
      state,
      action: PayloadAction<{
        taskId: string;
        newStatus: TaskStatus;
        newPosition: number;
      }>,
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
        task.position = action.payload.newPosition;
      }
    },
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setFilterPriority(state, action: PayloadAction<string | null>) {
      state.filteredPriority = action.payload;
    },
    setFilterAssignee(state, action: PayloadAction<string | null>) {
      state.filteredAssignee = action.payload;
    },
    clearFilters(state) {
      state.filteredPriority = null;
      state.filteredAssignee = null;
    },
  },
});

export const {
  setTasks,
  moveTask,
  addTask,
  updateTask,
  removeTask,
  setFilterPriority,
  setFilterAssignee,
  clearFilters,
} = boardSlice.actions;
export default boardSlice.reducer;
