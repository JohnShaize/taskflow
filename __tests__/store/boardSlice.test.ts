import boardReducer, {
  setTasks,
  moveTask,
  setFilterPriority,
  setFilterAssignee,
  clearFilters,
} from '@/store/slices/boardSlice'
import { Task } from '@/types'

describe('boardSlice', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      project_id: 'project-1',
      title: 'Design dashboard',
      description: 'Create dashboard layout',
      status: 'todo',
      priority: 'medium',
      assignee_id: 'user-1',
      created_by: 'user-1',
      due_date: '2026-04-10',
      position: 0,
      created_at: '2026-04-06T10:00:00.000Z',
      updated_at: '2026-04-06T10:00:00.000Z',
    },
    {
      id: 'task-2',
      project_id: 'project-1',
      title: 'Build board filters',
      description: null,
      status: 'in_progress',
      priority: 'high',
      assignee_id: 'user-2',
      created_by: 'user-1',
      due_date: null,
      position: 1,
      created_at: '2026-04-06T10:00:00.000Z',
      updated_at: '2026-04-06T10:00:00.000Z',
    },
  ]

  it('should return the initial state', () => {
    const state = boardReducer(undefined, { type: 'unknown' })

    expect(state).toEqual({
      tasks: [],
      filteredPriority: null,
      filteredAssignee: null,
      isLoading: false,
    })
  })

  it('should set tasks correctly', () => {
    const state = boardReducer(undefined, setTasks(mockTasks))

    expect(state.tasks).toHaveLength(2)
    expect(state.tasks[0].title).toBe('Design dashboard')
    expect(state.tasks[1].status).toBe('in_progress')
  })

  it('should move a task to a new status and position', () => {
    const initialState = boardReducer(undefined, setTasks(mockTasks))

    const state = boardReducer(
      initialState,
      moveTask({
        taskId: 'task-1',
        newStatus: 'done',
        newPosition: 2,
      })
    )

    const movedTask = state.tasks.find((task) => task.id === 'task-1')

    expect(movedTask?.status).toBe('done')
    expect(movedTask?.position).toBe(2)
  })

  it('should set priority filter', () => {
    const state = boardReducer(undefined, setFilterPriority('high'))

    expect(state.filteredPriority).toBe('high')
  })

  it('should set assignee filter', () => {
    const state = boardReducer(undefined, setFilterAssignee('user-2'))

    expect(state.filteredAssignee).toBe('user-2')
  })

  it('should clear all filters', () => {
    let state = boardReducer(undefined, setFilterPriority('medium'))
    state = boardReducer(state, setFilterAssignee('user-1'))
    state = boardReducer(state, clearFilters())

    expect(state.filteredPriority).toBeNull()
    expect(state.filteredAssignee).toBeNull()
  })
})