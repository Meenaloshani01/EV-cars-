"""
Configuration Template for VoltEdge ML API
Copy this file to config.py and customize as needed
"""

import os

class Config:
    """Base configuration"""
    
    # Flask settings
    DEBUG = True
    TESTING = False
    
    # API settings
    API_HOST = '0.0.0.0'
    API_PORT = 5000
    
    # CORS settings
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
    ]
    
    # Model paths
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, 'ev_model.pkl')
    SCALER_PATH = os.path.join(BASE_DIR, 'ev_scaler.pkl')
    ENCODERS_PATH = os.path.join(BASE_DIR, 'ev_encoders.pkl')
    
    # Model settings
    DEFAULT_CAR_TYPE = 'Tata Punch EV'
    MAX_BATCH_SIZE = 100
    
    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    
    # Production security settings
    CORS_ORIGINS = [
        'https://yourdomain.com',
    ]
    
    # Use environment variables for sensitive data
    API_KEY = os.environ.get('VOLTEDGE_API_KEY')
    

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True


# Select configuration based on environment
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(env=None):
    """Get configuration for specified environment"""
    if env is None:
        env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])
