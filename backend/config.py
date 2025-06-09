import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///patients.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

    # Email configuration
    MAIL_SERVER = 'smtp.gmail.com'  # Gmail SMTP server
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')  # Your Gmail address
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')  # Your Gmail app password
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_USERNAME')  # Same as MAIL_USERNAME
    MAIL_MAX_EMAILS = 50
    MAIL_ASCII_ATTACHMENTS = False
    MAIL_SUPPRESS_SEND = False

    # Twilio configuration for WhatsApp
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER') 