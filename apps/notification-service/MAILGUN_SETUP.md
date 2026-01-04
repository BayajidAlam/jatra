# Mailgun Email Setup Guide

## Free Tier Benefits

- **5,000 emails/month** for the first 3 months
- **100 emails/day** after trial period
- Professional email delivery with tracking
- No credit card required for trial

## Setup Steps

### 1. Create Mailgun Account

1. Go to [https://mailgun.com](https://mailgun.com)
2. Sign up for free account
3. Verify your email address

### 2. Add Your Domain (Recommended for Production)

1. Go to **Sending > Domains**
2. Click **Add New Domain**
3. Enter your domain (e.g., `mg.yourdomain.com`)
4. Follow DNS configuration steps:
   - Add TXT records for SPF and DKIM
   - Add MX records
   - Add CNAME for tracking
5. Wait for verification (usually 24-48 hours)

### 3. Use Sandbox Domain (Quick Start - Development Only)

For testing, Mailgun provides a sandbox domain:

- Format: `sandbox[random].mailgun.org`
- Limited to **5 authorized recipients**
- Add test email addresses in **Sending > Domain Settings > Authorized Recipients**

### 4. Get SMTP Credentials

1. Go to **Sending > Domain Settings**
2. Select your domain
3. Click **SMTP credentials** tab
4. Use the credentials shown:
   ```
   SMTP hostname: smtp.mailgun.org
   Port: 587 (or 465 for SSL)
   Username: postmaster@your-domain.mailgun.org
   Password: [shown in dashboard]
   ```

### 5. Configure Notification Service

Update `.env` file in `apps/notification-service/`:

```bash
# Email Provider Selection
EMAIL_PROVIDER=MAILGUN  # Use MAILGUN for production, MOCK for development

# Mailgun SMTP Configuration
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
SMTP_FROM=Jatra Railway <noreply@your-domain.mailgun.org>
```

**Provider Options:**

- `MAILGUN`: Use Mailgun for actual email delivery (production)
- `MOCK`: Simulate email sending for development/testing (no actual emails sent)

### 6. Test Email Sending

Start notification service:

```bash
cd apps/notification-service
PORT=3007 pnpm start:dev
```

Check logs for:

```
✅ Mailgun SMTP server is ready to send emails
```

### 7. Production Recommendations

**For Production:**

- ✅ Use verified custom domain (not sandbox)
- ✅ Configure SPF, DKIM, and DMARC records
- ✅ Enable bounce and complaint tracking
- ✅ Set up webhooks for delivery events
- ✅ Monitor sending reputation in Mailgun dashboard

**Email Types in Jatra:**

- Booking confirmation emails
- Ticket delivery with QR codes
- OTP for authentication
- Booking cancellation notifications
- Password reset emails

## Troubleshooting

### SMTP Connection Failed

- Verify SMTP credentials are correct
- Check if port 587 is not blocked by firewall
- For sandbox domain, verify recipient email is authorized

### Emails Not Delivered

- Check Mailgun dashboard Logs section
- Verify sending domain is verified (not sandbox)
- Check recipient spam folder
- Review bounce/complaint reports

### Rate Limiting

- Free tier: 100 emails/day after trial
- Upgrade to Flex plan for higher limits
- Monitor usage in Mailgun dashboard

## Alternative SMTP Options

If Mailgun doesn't work:

1. **Brevo (Sendinblue)**: 300 emails/day free
2. **SendGrid**: 100 emails/day free
3. **Gmail SMTP**: 500 emails/day (requires App Password)

## API Documentation

Mailgun also provides REST API for advanced features:

- [https://documentation.mailgun.com/en/latest/](https://documentation.mailgun.com/en/latest/)

For this integration, we're using SMTP which is simpler and works with existing Nodemailer setup.
