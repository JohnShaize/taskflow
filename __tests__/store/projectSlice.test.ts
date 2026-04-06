import projectReducer, {
  setProjects,
  setActiveProject,
  addProject,
  removeProject,
  setLoading,
} from '@/store/slices/projectSlice'
import { Project } from '@/types'

describe('projectSlice', () => {
  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: 'TaskFlow UI',
      description: 'Frontend build',
      owner_id: 'user-1',
      created_at: '2026-04-06T10:00:00.000Z',
      updated_at: '2026-04-06T10:00:00.000Z',
    },
    {
      id: 'project-2',
      name: 'TaskFlow Backend',
      description: 'API and permissions',
      owner_id: 'user-1',
      created_at: '2026-04-06T10:00:00.000Z',
      updated_at: '2026-04-06T10:00:00.000Z',
    },
  ]

  it('should return the initial state', () => {
    const state = projectReducer(undefined, { type: 'unknown' })

    expect(state).toEqual({
      projects: [],
      activeProject: null,
      isLoading: false,
    })
  })

  it('should set projects correctly', () => {
    const state = projectReducer(undefined, setProjects(mockProjects))

    expect(state.projects).toHaveLength(2)
    expect(state.projects[0].name).toBe('TaskFlow UI')
  })

  it('should set active project', () => {
    const state = projectReducer(undefined, setActiveProject(mockProjects[1]))

    expect(state.activeProject?.id).toBe('project-2')
    expect(state.activeProject?.name).toBe('TaskFlow Backend')
  })

  it('should add a project', () => {
    const state = projectReducer(undefined, addProject(mockProjects[0]))

    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].id).toBe('project-1')
  })

  it('should remove a project by id', () => {
    const initialState = projectReducer(undefined, setProjects(mockProjects))
    const state = projectReducer(initialState, removeProject('project-1'))

    expect(state.projects).toHaveLength(1)
    expect(state.projects[0].id).toBe('project-2')
  })

  it('should set loading state', () => {
    const state = projectReducer(undefined, setLoading(true))

    expect(state.isLoading).toBe(true)
  })
})