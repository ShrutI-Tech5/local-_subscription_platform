import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email Configuration
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'shruteee00@gmail.com'
EMAIL_HOST_PASSWORD = 'wiuczofyjyavzazo'

# Set a timeout for the SMTP connection
socket.setdefaulttimeout(30)

def test_email_simple():
    """Simple test to send email"""
    print("Starting email test...")
    print(f"Connecting to {EMAIL_HOST}:{EMAIL_PORT}...")
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_HOST_USER
        msg['To'] = EMAIL_HOST_USER
        msg['Subject'] = 'Test Email from OTP System'
        
        body = "This is a test email."
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to SMTP server
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=30)
        print("Connected! Starting TLS...")
        server.starttls()
        
        print("Logging in...")
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        print("Logged in! Sending message...")
        
        # Send email
        server.send_message(msg)
        print("Email sent!")
        
        server.quit()
        print("Success!")
        return True
        
    except Exception as e:
        print(f"Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_email_simple()
