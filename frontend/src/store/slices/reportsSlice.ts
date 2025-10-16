import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { Report, ReportCreate, ReportUpdate, RegulatoryChange } from '../../types';

interface ReportsState {
  reports: Report[];
  currentReport: Report | null;
  regulatoryChanges: RegulatoryChange[];
  loading: boolean;
  error: string | null;
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
}

const initialState: ReportsState = {
  reports: [],
  currentReport: null,
  regulatoryChanges: [],
  loading: false,
  error: null,
  pagination: {
    skip: 0,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params: { skip?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      // Mock reports data for demo purposes
      const mockReports: Report[] = [
        {
          id: 1,
          title: "Q4 2024 Regulatory Changes Analysis",
          analysis_type: "comprehensive",
          status: "completed",
          scope: "Financial services sector regulatory changes",
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          user_id: 1,
          company_profile_id: 1
        },
        {
          id: 2,
          title: "Environmental Regulations Update",
          analysis_type: "targeted",
          status: "in_progress",
          scope: "Environmental compliance requirements",
          created_at: new Date().toISOString(),
          user_id: 1,
          company_profile_id: 1
        },
        {
          id: 3,
          title: "Labor Law Changes Analysis",
          analysis_type: "comprehensive",
          status: "pending",
          scope: "Labor regulations and compliance",
          created_at: new Date().toISOString(),
          user_id: 1,
          company_profile_id: 1
        }
      ];
      
      return { reports: mockReports, total: mockReports.length };
    } catch (error: any) {
      return rejectWithValue('Failed to fetch reports');
    }
  }
);

export const fetchReport = createAsyncThunk(
  'reports/fetchReport',
  async (reportId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch report');
    }
  }
);

export const createReport = createAsyncThunk(
  'reports/createReport',
  async (reportData: ReportCreate, { rejectWithValue }) => {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create report');
    }
  }
);

export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ reportId, reportData }: { reportId: number; reportData: ReportUpdate }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reports/${reportId}`, reportData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update report');
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (reportId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/reports/${reportId}`);
      return reportId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete report');
    }
  }
);

export const fetchRegulatoryChanges = createAsyncThunk(
  'reports/fetchRegulatoryChanges',
  async (reportId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}/regulatory-changes`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch regulatory changes');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setCurrentReport: (state, action: PayloadAction<Report | null>) => {
      state.currentReport = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addReport: (state, action: PayloadAction<Report>) => {
      state.reports.unshift(action.payload);
    },
    updateReportInList: (state, action: PayloadAction<Report>) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    removeReportFromList: (state, action: PayloadAction<number>) => {
      state.reports = state.reports.filter(report => report.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single report
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        state.error = null;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create report
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update report
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex(report => report.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport && state.currentReport.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        state.error = null;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete report
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.filter(report => report.id !== action.payload);
        if (state.currentReport && state.currentReport.id === action.payload) {
          state.currentReport = null;
        }
        state.error = null;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch regulatory changes
      .addCase(fetchRegulatoryChanges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRegulatoryChanges.fulfilled, (state, action) => {
        state.loading = false;
        state.regulatoryChanges = action.payload;
        state.error = null;
      })
      .addCase(fetchRegulatoryChanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentReport,
  clearError,
  setPagination,
  addReport,
  updateReportInList,
  removeReportFromList,
} = reportsSlice.actions;

export default reportsSlice.reducer;
