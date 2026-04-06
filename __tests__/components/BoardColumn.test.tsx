import { render, screen } from '@testing-library/react'
import { BoardColumn } from '@/components/board/BoardColumn'
import { Task } from '@/types'

jest.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: jest.fn(),
    isOver: false,
  }),
}))

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: jest.fn(),
}))

jest.mock('@/components/board/TaskCard', () => ({
  TaskCard: ({ task }: { task: Task }) => (
    <div data-testid="mock-task-card">{task.title}</div>
  ),
}))

describe('BoardColumn', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      project_id: 'project-1',
      title: 'Write tests',
      description: 'Add unit tests',
      status: 'todo',
      priority: 'medium',
      assignee_id: null,
      created_by: 'user-1',
      due_date: null,
      position: 0,
      created_at: '2026-04-06T10:00:00.000Z',
      updated_at: '2026-04-06T10:00:00.000Z',
    },
    {
      id: 'task-2',
      project_id: 'project-1',
      title: 'Fix loading states',
      description: null,
      status: 'todo',
      priority: 'high',
      assignee_id: null,
      created_by: 'user-1',
      due_date: '2026-04-10',
      position: 1,
      created_at: '2026-04-06T10:00:00.000Z',
      updated_at: '2026-04-06T10:00:00.000Z',
    },
  ]

  it('renders column title and status label', () => {
    render(<BoardColumn title="Todo" status="todo" tasks={mockTasks} />)

    expect(screen.getByText('Todo')).toBeInTheDocument()
    expect(screen.getByText('todo')).toBeInTheDocument()
  })

  it('renders task count', () => {
    render(<BoardColumn title="Todo" status="todo" tasks={mockTasks} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders all tasks in the column', () => {
    render(<BoardColumn title="Todo" status="todo" tasks={mockTasks} />)

    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('Fix loading states')).toBeInTheDocument()
    expect(screen.getAllByTestId('mock-task-card')).toHaveLength(2)
  })

  it('renders empty state when there are no tasks', () => {
    render(<BoardColumn title="Done" status="done" tasks={[]} />)

    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('Drop zone')).toBeInTheDocument()
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders the droppable test id correctly', () => {
    render(<BoardColumn title="In Progress" status="in_progress" tasks={[]} />)

    expect(screen.getByTestId('column-in_progress')).toBeInTheDocument()
  })
})