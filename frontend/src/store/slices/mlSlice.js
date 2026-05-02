/**
 * ML Redux Slice - Prognoz, o'qitish, dashboard statistikasi
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const predictDisease = createAsyncThunk('ml/predict', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/ml/predict', data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Prognoz xatoligi') }
})

export const trainModel = createAsyncThunk('ml/train', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/ml/train', data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'O\'qitish xatoligi') }
})

export const fetchDashboardStats = createAsyncThunk('ml/dashboardStats', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/ml/dashboard/stats'); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const fetchModelMetrics = createAsyncThunk('ml/metrics', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/ml/metrics'); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const fetchModelComparison = createAsyncThunk('ml/compare', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/ml/compare'); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const fetchPredictionHistory = createAsyncThunk('ml/history', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/ml/history', { params }); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const fetchFeatureImportance = createAsyncThunk('ml/featureImportance', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/ml/feature-importance'); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

const mlSlice = createSlice({
  name: 'ml',
  initialState: {
    prediction: null, predictLoading: false, predictError: null,
    trainResult: null, trainLoading: false, trainError: null,
    dashboardStats: null, statsLoading: false,
    metrics: [], metricsLoading: false,
    comparison: null, comparisonLoading: false,
    history: [], historyLoading: false,
    featureImportance: null, featureLoading: false,
  },
  reducers: {
    clearPrediction: s => { s.prediction = null; s.predictError = null },
    clearTrainResult: s => { s.trainResult = null; s.trainError = null },
  },
  extraReducers: b => {
    b
      .addCase(predictDisease.pending, s => { s.predictLoading = true; s.predictError = null })
      .addCase(predictDisease.fulfilled, (s, a) => { s.predictLoading = false; s.prediction = a.payload })
      .addCase(predictDisease.rejected, (s, a) => { s.predictLoading = false; s.predictError = a.payload })
      .addCase(trainModel.pending, s => { s.trainLoading = true; s.trainError = null })
      .addCase(trainModel.fulfilled, (s, a) => { s.trainLoading = false; s.trainResult = a.payload })
      .addCase(trainModel.rejected, (s, a) => { s.trainLoading = false; s.trainError = a.payload })
      .addCase(fetchDashboardStats.pending, s => { s.statsLoading = true })
      .addCase(fetchDashboardStats.fulfilled, (s, a) => { s.statsLoading = false; s.dashboardStats = a.payload })
      .addCase(fetchModelMetrics.fulfilled, (s, a) => { s.metricsLoading = false; s.metrics = a.payload })
      .addCase(fetchModelComparison.fulfilled, (s, a) => { s.comparisonLoading = false; s.comparison = a.payload })
      .addCase(fetchPredictionHistory.pending, s => { s.historyLoading = true })
      .addCase(fetchPredictionHistory.fulfilled, (s, a) => { s.historyLoading = false; s.history = a.payload })
      .addCase(fetchFeatureImportance.fulfilled, (s, a) => { s.featureLoading = false; s.featureImportance = a.payload })
  }
})
export const { clearPrediction, clearTrainResult } = mlSlice.actions
export default mlSlice.reducer
