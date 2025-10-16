import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { updateAnalysisProgress, addAnalysisToHistory } from '../store/slices/analysisSlice';
import { AnalysisProgress } from '../types';

interface UseSocketOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const { enabled = true, onConnect, onDisconnect, onError } = options;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      onError?.(error);
    });

    // Analysis progress events
    socket.on('analysis_progress', (data: AnalysisProgress) => {
      console.log('Analysis progress update:', data);
      dispatch(updateAnalysisProgress(data));
    });

    // Analysis completed events
    socket.on('analysis_complete', (data: { 
      report_id: number; 
      status: string; 
      message: string;
      completed_at: string;
      regulatory_changes_count: number;
    }) => {
      console.log('Analysis completed:', data);
      const analysisProgress: AnalysisProgress = {
        report_id: data.report_id,
        status: data.status,
        progress_percentage: 100,
        current_stage: 'completed',
        message: data.message,
      };
      dispatch(addAnalysisToHistory(analysisProgress));
    });

    // Analysis error events
    socket.on('analysis_error', (data: { 
      report_id: number; 
      status: string; 
      error: string;
      timestamp: string;
    }) => {
      console.error('Analysis error:', data);
      const analysisProgress: AnalysisProgress = {
        report_id: data.report_id,
        status: data.status,
        progress_percentage: 0,
        current_stage: 'failed',
        message: `Analysis failed: ${data.error}`,
      };
      dispatch(updateAnalysisProgress(analysisProgress));
    });

    // Connection confirmation
    socket.on('connected', (data: { message: string }) => {
      console.log('Socket connected:', data.message);
    });

    // Room join confirmation
    socket.on('joined_room', (data: { room: string }) => {
      console.log('Joined room:', data.room);
    });

    return socket;
  }, [dispatch, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    emit('join_room', room);
  }, [emit]);

  const leaveRoom = useCallback((room: string) => {
    emit('leave_room', room);
  }, [emit]);

  const joinAnalysisRoom = useCallback((reportId: number) => {
    emit('join_analysis_room', { report_id: reportId });
  }, [emit]);

  const leaveAnalysisRoom = useCallback((reportId: number) => {
    emit('leave_analysis_room', { report_id: reportId });
  }, [emit]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    joinAnalysisRoom,
    leaveAnalysisRoom,
  };
};
