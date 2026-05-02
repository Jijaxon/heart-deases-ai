import { createSlice } from '@reduxjs/toolkit'
const themeSlice = createSlice({
  name: 'theme',
  initialState: { isDark: localStorage.getItem('theme') !== 'light' },
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark
      localStorage.setItem('theme', state.isDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('light', !state.isDark)
    }
  }
})
export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
