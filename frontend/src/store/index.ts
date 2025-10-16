import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import analysisSlice from './slices/analysisSlice';
import reportsSlice from './slices/reportsSlice';
import companyProfilesSlice from './slices/companyProfilesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    analysis: analysisSlice,
    reports: reportsSlice,
    companyProfiles: companyProfilesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
