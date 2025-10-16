import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { tokenManager } from '../../services/tokenManager';
import { User, LoginRequest, Token } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      // Mock successful login for demo purposes
      const mockUser: User = {
        id: 1,
        email: credentials.username + "@example.com",
        username: credentials.username,
        full_name: "Demo User",
        is_active: true,
        is_superuser: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const mockToken = "demo-token-123";
      
      // Store token in localStorage and token manager
      localStorage.setItem('token', mockToken);
      tokenManager.setToken(mockToken);
      
      return { token: mockToken, user: mockUser };
    } catch (error: any) {
      return rejectWithValue('Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      // Mock successful registration for demo purposes
      const mockUser: User = {
        id: 2,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name || "New User",
        is_active: true,
        is_superuser: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockUser;
    } catch (error: any) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // Mock user data for demo purposes
      const mockUser: User = {
        id: 1,
        email: "demo@example.com",
        username: "demo",
        full_name: "Demo User",
        is_active: true,
        is_superuser: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockUser;
    } catch (error: any) {
      return rejectWithValue('Failed to get user info');
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      // Mock successful update for demo purposes
      const mockUser: User = {
        id: 1,
        email: userData.email || "demo@example.com",
        username: userData.username || "demo",
        full_name: userData.full_name || "Demo User",
        is_active: true,
        is_superuser: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockUser;
    } catch (error: any) {
      return rejectWithValue('Failed to update user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      tokenManager.clearToken();
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
      tokenManager.setToken(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        tokenManager.clearToken();
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
