"""
Socket.io server for real-time updates
"""

import socketio
from fastapi import FastAPI
from src.config import SOCKET_IO_CORS_ALLOWED_ORIGINS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.io server
sio = socketio.AsyncServer(
    cors_allowed_origins=SOCKET_IO_CORS_ALLOWED_ORIGINS,
    logger=True,
    engineio_logger=True
)

# Create Socket.io app
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    logger.info(f"Client {sid} connected")
    await sio.emit('connected', {'message': 'Connected to server'}, room=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Client {sid} disconnected")

@sio.event
async def join_analysis_room(sid, data):
    """Join a specific analysis room for real-time updates"""
    report_id = data.get('report_id')
    if report_id:
        room = f"analysis_{report_id}"
        sio.enter_room(sid, room)
        logger.info(f"Client {sid} joined analysis room {room}")
        await sio.emit('joined_room', {'room': room}, room=sid)

@sio.event
async def leave_analysis_room(sid, data):
    """Leave a specific analysis room"""
    report_id = data.get('report_id')
    if report_id:
        room = f"analysis_{report_id}"
        sio.leave_room(sid, room)
        logger.info(f"Client {sid} left analysis room {room}")

async def emit_analysis_progress(report_id: int, progress_data: dict):
    """Emit analysis progress to all clients in the analysis room"""
    room = f"analysis_{report_id}"
    await sio.emit('analysis_progress', progress_data, room=room)
    logger.info(f"Emitted progress for report {report_id}: {progress_data}")

async def emit_analysis_complete(report_id: int, result_data: dict):
    """Emit analysis completion to all clients in the analysis room"""
    room = f"analysis_{report_id}"
    await sio.emit('analysis_complete', result_data, room=room)
    logger.info(f"Emitted completion for report {report_id}")

async def emit_analysis_error(report_id: int, error_data: dict):
    """Emit analysis error to all clients in the analysis room"""
    room = f"analysis_{report_id}"
    await sio.emit('analysis_error', error_data, room=room)
    logger.error(f"Emitted error for report {report_id}: {error_data}")

# Export the socket instance for use in other modules
__all__ = ['sio', 'socket_app', 'emit_analysis_progress', 'emit_analysis_complete', 'emit_analysis_error']
