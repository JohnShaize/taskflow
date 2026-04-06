import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockDispatch = jest.fn()
const mockSignInWithPassword = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/supabase', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders email input, password input, and sign in button', () => {
    render(<LoginForm />)

    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
  })

  it('allows typing in email and password fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')

    await user.type(emailInput, 'john@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('john@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('shows an error message when login fails', async () => {
    const user = userEvent.setup()

    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginForm />)

    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('password-input'), 'wrongpassword')
    await user.click(screen.getByTestId('login-button'))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('submits successfully and redirects to dashboard', async () => {
    const user = userEvent.setup()

    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'john@example.com',
          created_at: '2026-04-06T10:00:00.000Z',
          user_metadata: {
            full_name: 'John Shaize',
            avatar_url: null,
          },
        },
      },
      error: null,
    })

    render(<LoginForm />)

    await user.type(screen.getByTestId('email-input'), 'john@example.com')
    await user.type(screen.getByTestId('password-input'), 'password123')
    await user.click(screen.getByTestId('login-button'))

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
    })

    expect(mockDispatch).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
    expect(mockRefresh).toHaveBeenCalled()
  })
})