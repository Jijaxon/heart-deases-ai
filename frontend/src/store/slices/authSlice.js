/**
 * Auth Redux Slice
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const loginUser = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    params.append('username', username)
    params.append('password', password)
    const res = await api.post('/auth/login', params)
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login xatoligi')
  }
})

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data
  } catch {
    return rejectWithValue('Sessiya tugagan')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError(state) { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.access_token
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null; state.token = null; state.isAuthenticated = false
        localStorage.removeItem('token'); localStorage.removeItem('user')
      })
  }
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
