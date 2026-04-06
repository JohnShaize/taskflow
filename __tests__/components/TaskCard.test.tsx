import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '@/components/board/TaskCard'
import { openTaskModal } from '@/store/slices/uiSlice'
import { Task } from '@/types'

const mockDispatch = jest.fn()

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    setActivatorNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}))

function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 'task-1',
    project_id: 'project-1',
    title: 'Finish dashboard UI',
    description: 'Build charts and summary cards',
    status: 'todo',
    priority: 'high',
    assignee_id: 'user-1',
    created_by: 'user-1',
    due_date: '2026-04-10',
    position: 0,
    created_at: '2026-04-06T10:00:00.000Z',
    updated_at: '2026-04-06T10:00:00.000Z',
    assignee: {
      id: 'user-1',
      email: 'john@example.com',
      full_name: 'John Shaize',
      avatar_url: null,
      created_at: '2026-04-06T10:00:00.000Z',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockMatchMedia(false)
  })

  it('renders title, description, priority, due date, and assignee', () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText('Finish dashboard UI')).toBeInTheDocument()
    expect(screen.getByText('Build charts and summary cards')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('John Shaize')).toBeInTheDocument()
    expect(
      screen.getByText(new Date('2026-04-10').toLocaleDateString())
    ).toBeInTheDocument()
  })

  it('shows fallback text when due date and assignee are missing', () => {
    const taskWithoutExtras: Task = {
      ...mockTask,
      due_date: null,
      assignee: undefined,
      assignee_id: null,
      description: null,
    }

    render(<TaskCard task={taskWithoutExtras} />)

    expect(screen.getByText('No due date')).toBeInTheDocument()
    expect(screen.getByText('Unassigned')).toBeInTheDocument()
    expect(
      screen.queryByText('Build charts and summary cards')
    ).not.toBeInTheDocument()
  })

  it('dispatches openTaskModal when clicked', async () => {
    const user = userEvent.setup()
    render(<TaskCard task={mockTask} />)

    await user.click(screen.getByRole('button'))

    expect(mockDispatch).toHaveBeenCalledWith(openTaskModal('task-1'))
  })

  it('dispatches openTaskModal when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<TaskCard task={mockTask} />)

    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')

    expect(mockDispatch).toHaveBeenCalledWith(openTaskModal('task-1'))
  })
})