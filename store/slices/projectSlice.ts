import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "@/types";

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
}

const initialState: ProjectState = {
  projects: [],
  activeProject: null,
  isLoading: false,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload;
    },
    setActiveProject(state, action: PayloadAction<Project | null>) {
      state.activeProject = action.payload;
    },
    addProject(state, action: PayloadAction<Project>) {
      state.projects.push(action.payload);
    },
    removeProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setProjects,
  setActiveProject,
  addProject,
  removeProject,
  setLoading,
} = projectSlice.actions;
export default projectSlice.reducer;
