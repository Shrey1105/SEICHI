import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { loginUser, registerUser, logout, getCurrentUser, updateUser } from '../store/slices/authSlice';
import { LoginRequest, User } from '../types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const login = useCallback(async (credentials: LoginRequest) => {
    return dispatch(loginUser(credentials));
  }, [dispatch]);

  const register = useCallback(async (userData: any) => {
    return dispatch(registerUser(userData));
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const fetchCurrentUser = useCallback(async () => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  const updateUserProfile = useCallback(async (userData: Partial<User>) => {
    return dispatch(updateUser(userData));
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: logoutUser,
    fetchCurrentUser,
    updateUser: updateUserProfile,
  };
};
