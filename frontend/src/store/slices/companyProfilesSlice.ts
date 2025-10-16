import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { CompanyProfile, CompanyProfileCreate, CompanyProfileUpdate } from '../../types';

interface CompanyProfilesState {
  profiles: CompanyProfile[];
  currentProfile: CompanyProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyProfilesState = {
  profiles: [],
  currentProfile: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCompanyProfiles = createAsyncThunk(
  'companyProfiles/fetchProfiles',
  async (params: { skip?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      // Mock company profiles data for demo purposes
      const mockProfiles: CompanyProfile[] = [
        {
          id: 1,
          company_name: "TechCorp Solutions",
          industry: "Technology",
          jurisdiction: "US",
          company_size: "large",
          description: "Leading technology company specializing in software solutions",
          keywords: ["Data Protection", "Cybersecurity", "Financial Services"],
          trusted_sources: ["SEC.gov", "FTC.gov", "NIST.gov"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 1
        },
        {
          id: 2,
          company_name: "GreenEnergy Ltd",
          industry: "Energy",
          jurisdiction: "US",
          company_size: "medium",
          description: "Renewable energy company focused on sustainable solutions",
          keywords: ["Environmental", "Safety", "Energy Regulations"],
          trusted_sources: ["EPA.gov", "DOE.gov", "FERC.gov"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 1
        }
      ];
      
      return { profiles: mockProfiles, total: mockProfiles.length };
    } catch (error: any) {
      return rejectWithValue('Failed to fetch company profiles');
    }
  }
);

export const fetchCompanyProfile = createAsyncThunk(
  'companyProfiles/fetchProfile',
  async (profileId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/management/company-profiles/${profileId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch company profile');
    }
  }
);

export const createCompanyProfile = createAsyncThunk(
  'companyProfiles/createProfile',
  async (profileData: CompanyProfileCreate, { rejectWithValue }) => {
    try {
      const response = await api.post('/management/company-profiles', profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to create company profile');
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'companyProfiles/updateProfile',
  async ({ profileId, profileData }: { profileId: number; profileData: CompanyProfileUpdate }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/management/company-profiles/${profileId}`, profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update company profile');
    }
  }
);

export const deleteCompanyProfile = createAsyncThunk(
  'companyProfiles/deleteProfile',
  async (profileId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/management/company-profiles/${profileId}`);
      return profileId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to delete company profile');
    }
  }
);

const companyProfilesSlice = createSlice({
  name: 'companyProfiles',
  initialState,
  reducers: {
    setCurrentProfile: (state, action: PayloadAction<CompanyProfile | null>) => {
      state.currentProfile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addProfile: (state, action: PayloadAction<CompanyProfile>) => {
      state.profiles.unshift(action.payload);
    },
    updateProfileInList: (state, action: PayloadAction<CompanyProfile>) => {
      const index = state.profiles.findIndex(profile => profile.id === action.payload.id);
      if (index !== -1) {
        state.profiles[index] = action.payload;
      }
    },
    removeProfileFromList: (state, action: PayloadAction<number>) => {
      state.profiles = state.profiles.filter(profile => profile.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profiles
      .addCase(fetchCompanyProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload.profiles;
        state.error = null;
      })
      .addCase(fetchCompanyProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single profile
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create profile
      .addCase(createCompanyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCompanyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateCompanyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.profiles.findIndex(profile => profile.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
        if (state.currentProfile && state.currentProfile.id === action.payload.id) {
          state.currentProfile = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCompanyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete profile
      .addCase(deleteCompanyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompanyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = state.profiles.filter(profile => profile.id !== action.payload);
        if (state.currentProfile && state.currentProfile.id === action.payload) {
          state.currentProfile = null;
        }
        state.error = null;
      })
      .addCase(deleteCompanyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentProfile,
  clearError,
  addProfile,
  updateProfileInList,
  removeProfileFromList,
} = companyProfilesSlice.actions;

export default companyProfilesSlice.reducer;
