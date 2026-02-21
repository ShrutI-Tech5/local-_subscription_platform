import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Email Configuration
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'shruteee00@gmail.com'
EMAIL_HOST_PASSWORD = 'jcdf bplf jscv aprw'

def test_email():
    """Test sending an email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_HOST_USER
        msg['To'] = EMAIL_HOST_USER  # Send to self
        msg['Subject'] = 'Test Email'
        
        body = "This is a test email."
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to SMTP server
        print(f"Connecting to {EMAIL_HOST}:{EMAIL_PORT}...")
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        
        # Login
        print(f"Logging in as {EMAIL_HOST_USER}...")
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        
        # Send email
        print("Sending email...")
        server.send_message(msg)
        server.quit()
        
        print("Email sent successfully!")
        return True, "Email sent successfully"
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, f"Failed to send email: {str(e)}"

if __name__ == "__main__":
    test_email()
