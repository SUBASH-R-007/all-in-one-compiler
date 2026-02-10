# Email Setup Guide

## Gmail Configuration (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update .env file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_FROM=your-email@outlook.com
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

## Testing

1. Update your `.env` file with valid email credentials
2. Restart the server: `npm start`
3. Register a new team through the admin panel
4. Check the recipient's email for login credentials

## Troubleshooting

- **Authentication failed**: Check your email credentials and app password
- **Connection timeout**: Verify EMAIL_HOST and EMAIL_PORT settings
- **Email not received**: Check spam folder, verify recipient email address
- **Gmail "Less secure apps"**: Use App Password instead of regular password

## Security Notes

- Never commit `.env` file to version control
- Use App Passwords instead of regular passwords
- Consider using environment-specific email settings for production