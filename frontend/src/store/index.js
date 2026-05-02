/**
 * Redux Store - barcha slicelar shu yerda birlashtiriladi
 */
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import patientsReducer from './slices/patientsSlice'
import mlReducer from './slices/mlSlice'
import themeReducer from './slices/themeSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    ml: mlReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export default store
