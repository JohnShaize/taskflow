import authReducer, {
  setUser,
  setLoading,
  clearUser,
} from '@/store/slices/authSlice'
import { User } from '@/types'

describe('authSlice', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'john@example.com',
    full_name: 'John Shaize',
    avatar_url: null,
    created_at: '2026-04-06T10:00:00.000Z',
  }

  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' })

    expect(state).toEqual({
      user: null,
      isLoading: true,
    })
  })

  it('should set user and stop loading', () => {
    const state = authReducer(undefined, setUser(mockUser))

    expect(state.user).toEqual(mockUser)
    expect(state.isLoading).toBe(false)
  })

  it('should set loading state', () => {
    const state = authReducer(undefined, setLoading(false))

    expect(state.isLoading).toBe(false)
    expect(state.user).toBeNull()
  })

  it('should clear user and stop loading', () => {
    const loggedInState = authReducer(undefined, setUser(mockUser))
    const state = authReducer(loggedInState, clearUser())

    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(false)
  })
})