import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AnalysisRequest, AnalysisProgress } from '../../types';

interface AnalysisState {
  currentAnalysis: AnalysisProgress | null;
  analysisHistory: AnalysisProgress[];
  loading: boolean;
  error: string | null;
  realTimeUpdates: boolean;
}

const initialState: AnalysisState = {
  currentAnalysis: null,
  analysisHistory: [],
  loading: false,
  error: null,
  realTimeUpdates: false,
};

// Async thunks
export const startAnalysis = createAsyncThunk(
  'analysis/start',
  async (analysisRequest: AnalysisRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports/analyze', analysisRequest);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to start analysis');
    }
  }
);

export const getAnalysisStatus = createAsyncThunk(
  'analysis/getStatus',
  async (reportId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}/status`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to get analysis status');
    }
  }
);

export const getAnalysisHistory = createAsyncThunk(
  'analysis/getHistory',
  async (params: { skip?: number; limit?: number; days?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/history/reports', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to get analysis history');
    }
  }
);

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setCurrentAnalysis: (state, action: PayloadAction<AnalysisProgress>) => {
      state.currentAnalysis = action.payload;
    },
    updateAnalysisProgress: (state, action: PayloadAction<Partial<AnalysisProgress>>) => {
      if (state.currentAnalysis) {
        state.currentAnalysis = { ...state.currentAnalysis, ...action.payload };
      }
    },
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null;
    },
    setRealTimeUpdates: (state, action: PayloadAction<boolean>) => {
      state.realTimeUpdates = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addAnalysisToHistory: (state, action: PayloadAction<AnalysisProgress>) => {
      state.analysisHistory.unshift(action.payload);
      // Keep only last 50 analyses
      if (state.analysisHistory.length > 50) {
        state.analysisHistory = state.analysisHistory.slice(0, 50);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Start analysis
      .addCase(startAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAnalysis = {
          report_id: action.payload.id,
          status: action.payload.status,
          progress_percentage: 0,
          current_stage: 'initializing',
          message: 'Analysis started successfully'
        };
        state.error = null;
      })
      .addCase(startAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get analysis status
      .addCase(getAnalysisStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnalysisStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentAnalysis && state.currentAnalysis.report_id === action.payload.report_id) {
          state.currentAnalysis = {
            ...state.currentAnalysis,
            status: action.payload.status,
            message: `Analysis ${action.payload.status}`
          };
        }
      })
      .addCase(getAnalysisStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get analysis history
      .addCase(getAnalysisHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAnalysisHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.analysisHistory = action.payload;
      })
      .addCase(getAnalysisHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentAnalysis,
  updateAnalysisProgress,
  clearCurrentAnalysis,
  setRealTimeUpdates,
  clearError,
  addAnalysisToHistory,
} = analysisSlice.actions;

export default analysisSlice.reducer;
