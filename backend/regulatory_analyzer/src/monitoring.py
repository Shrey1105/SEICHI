"""
Monitoring and metrics for the Regulatory Intelligence Platform
"""

import time
import logging
from functools import wraps
from typing import Dict, Any
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'websocket_active_connections',
    'Number of active WebSocket connections'
)

ANALYSIS_COUNT = Counter(
    'analyses_total',
    'Total number of analyses performed',
    ['analysis_type', 'status']
)

ANALYSIS_DURATION = Histogram(
    'analysis_duration_seconds',
    'Analysis duration in seconds',
    ['analysis_type']
)

DATABASE_CONNECTIONS = Gauge(
    'database_connections_active',
    'Number of active database connections'
)

AI_API_CALLS = Counter(
    'ai_api_calls_total',
    'Total AI API calls',
    ['provider', 'status']
)

logger = structlog.get_logger()

def monitor_requests(func):
    """Decorator to monitor API requests"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        
        # Extract request info if available
        request = None
        for arg in args:
            if isinstance(arg, Request):
                request = arg
                break
        
        method = request.method if request else "unknown"
        endpoint = request.url.path if request else "unknown"
        
        try:
            result = await func(*args, **kwargs)
            status_code = 200
            return result
        except Exception as e:
            status_code = 500
            logger.error("Request failed", method=method, endpoint=endpoint, error=str(e))
            raise
        finally:
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
            REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
            
            logger.info(
                "Request completed",
                method=method,
                endpoint=endpoint,
                status_code=status_code,
                duration=duration
            )
    
    return wrapper

def monitor_analysis(func):
    """Decorator to monitor analysis operations"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        analysis_type = kwargs.get('analysis_type', 'unknown')
        
        try:
            result = await func(*args, **kwargs)
            status = 'success'
            return result
        except Exception as e:
            status = 'failed'
            logger.error("Analysis failed", analysis_type=analysis_type, error=str(e))
            raise
        finally:
            duration = time.time() - start_time
            ANALYSIS_COUNT.labels(analysis_type=analysis_type, status=status).inc()
            ANALYSIS_DURATION.labels(analysis_type=analysis_type).observe(duration)
            
            logger.info(
                "Analysis completed",
                analysis_type=analysis_type,
                status=status,
                duration=duration
            )
    
    return wrapper

def monitor_ai_api_calls(provider: str = "gemini"):
    """Decorator to monitor AI API calls"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                result = await func(*args, **kwargs)
                status = 'success'
                return result
            except Exception as e:
                status = 'failed'
                logger.error("AI API call failed", provider=provider, error=str(e))
                raise
            finally:
                AI_API_CALLS.labels(provider=provider, status=status).inc()
                
                logger.info(
                    "AI API call completed",
                    provider=provider,
                    status=status
                )
        
        return wrapper
    return decorator

class MetricsCollector:
    """Collects and exposes application metrics"""
    
    def __init__(self):
        self.logger = structlog.get_logger()
    
    def get_metrics(self) -> str:
        """Get Prometheus metrics"""
        return generate_latest()
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get application health status"""
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "version": "1.0.0",
            "uptime": time.time() - self._start_time,
            "metrics": {
                "total_requests": 0,  # Will be populated by actual request tracking
                "active_connections": 0,  # Will be populated by WebSocket tracking
                "total_analyses": 0,  # Will be populated by analysis tracking
                "active_db_connections": 0  # Will be populated by DB connection tracking
            }
        }
    
    def update_websocket_connections(self, count: int):
        """Update WebSocket connection count"""
        ACTIVE_CONNECTIONS.set(count)
        self.logger.info("WebSocket connections updated", count=count)
    
    def update_database_connections(self, count: int):
        """Update database connection count"""
        DATABASE_CONNECTIONS.set(count)
        self.logger.info("Database connections updated", count=count)

# Global metrics collector instance
metrics_collector = MetricsCollector()
metrics_collector._start_time = time.time()

# Logging configuration
def setup_logging(log_level: str = "INFO"):
    """Setup application logging"""
    import os
    os.makedirs('logs', exist_ok=True)
    
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('logs/app.log')
        ]
    )
    
    # Configure structlog
    structlog.configure(
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, log_level.upper())
        )
    )

def log_analysis_event(event_type: str, **kwargs):
    """Log analysis-related events"""
    logger.info(
        "Analysis event",
        event_type=event_type,
        **kwargs
    )

def log_security_event(event_type: str, **kwargs):
    """Log security-related events"""
    logger.warning(
        "Security event",
        event_type=event_type,
        **kwargs
    )

def log_performance_event(event_type: str, **kwargs):
    """Log performance-related events"""
    logger.info(
        "Performance event",
        event_type=event_type,
        **kwargs
    )
