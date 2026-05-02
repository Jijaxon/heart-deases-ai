import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchPatients = createAsyncThunk('patients/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/patients/', { params }); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const createPatient = createAsyncThunk('patients/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/patients/', data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const deletePatient = createAsyncThunk('patients/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/patients/${id}`); return id }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Xatolik') }
})

export const updatePatient = createAsyncThunk('patients/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.put(`/patients/${id}`, data); return res.data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Yangilashda xatolik') }
})

export const importCSV = createAsyncThunk('patients/importCSV', async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/patients/import/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data
  } catch (err) { return rejectWithValue(err.response?.data?.detail || 'Import xatoligi') }
})

const patientsSlice = createSlice({
  name: 'patients',
  initialState: {
    list: [], total: 0, page: 1, pageSize: 10, totalPages: 0,
    loading: false, error: null,
    filters: { search: '', target: null, min_age: null, max_age: null, trained: null },
    importLoading: false, importResult: null,
  },
  reducers: {
    setPage: (s, a) => { s.page = a.payload },
    setFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; s.page = 1 },
    clearFilters: (s) => { s.filters = { search: '', target: null, min_age: null, max_age: null, trained: null }; s.page = 1 },
    clearImportResult: (s) => { s.importResult = null },
  },
  extraReducers: (b) => {
    b.addCase(fetchPatients.pending, s => { s.loading = true })
     .addCase(fetchPatients.fulfilled, (s, a) => { s.loading = false; Object.assign(s, { list: a.payload.patients, total: a.payload.total, page: a.payload.page, pageSize: a.payload.page_size, totalPages: a.payload.total_pages }) })
     .addCase(fetchPatients.rejected, (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(deletePatient.fulfilled, (s, a) => { s.list = s.list.filter(p => p.id !== a.payload); s.total-- })
     .addCase(importCSV.pending, s => { s.importLoading = true })
     .addCase(importCSV.fulfilled, (s, a) => { s.importLoading = false; s.importResult = a.payload })
     .addCase(importCSV.rejected, (s, a) => { s.importLoading = false; s.error = a.payload })
     .addCase(updatePatient.fulfilled, (s, a) => {
       const idx = s.list.findIndex(p => p.id === a.payload.id)
       if (idx !== -1) s.list[idx] = a.payload
     })
  }
})
export const { setPage, setFilters, clearFilters, clearImportResult } = patientsSlice.actions
export default patientsSlice.reducer
