# -*- coding: utf-8 -*-
from dotenv import load_dotenv
import os

load_dotenv('../../env')


service_token = os.getenv('SERVICE_TOKEN', '')
secret_key = os.getenv('SECRET_KEY', '')
app_id = os.getenv('APP_ID', '')


images_dir = os.getenv('IMAGES_DIR', 'images/')


PORT = os.getenv('PORT', '8000')
HOST = os.getenv('HOST', '192.168.8.120')
LOG_API = os.getenv('LOG_API', True)

database = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'database': os.getenv('DB_NAME', 'vezdekod'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password')
}