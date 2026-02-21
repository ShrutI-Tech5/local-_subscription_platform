import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from backend.config import EMAIL_HOST, EMAIL_PORT, EMAIL_USE_TLS, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD

def send_otp_email(to_email, otp):
    """Send OTP email to user"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_HOST_USER
        msg['To'] = to_email
        msg['Subject'] = 'Your OTP for Local Service Platform'
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Email Verification OTP</h2>
            <p>Your One-Time Password (OTP) for registration is:</p>
            <h1 style="color: #6366f1; font-size: 36px; letter-spacing: 5px;">{otp}</h1>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Regards,<br>Local Service Platform Team</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Connect to SMTP server
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        
        # Login
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        return True, "OTP sent successfully"
    except Exception as e:
        print(f"Email sending error: {type(e).__name__}: {str(e)}")  # Debug print
        return False, f"Failed to send email: {str(e)}"

def send_welcome_email(to_email, name):
    """Send welcome email after OTP verification"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_HOST_USER
        msg['To'] = to_email
        msg['Subject'] = 'Welcome to Local Service Platform'
        
        body = f"""
        <html>
        <body>
            <h2>Welcome, {name}!</h2>
            <p>Your email has been successfully verified.</p>
            <p>You can now login to your account and start using our services.</p>
            <br>
            <p>Regards,<br>Local Service Platform Team</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        return True, "Welcome email sent"
    except Exception as e:
        return False, f"Failed to send email: {str(e)}"
