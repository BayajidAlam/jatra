# Twilio SMS Setup Guide

## Free Trial Benefits

- **$15.50 trial credit** - No credit card required initially
- **SMS Cost**: ~$0.0079/message in US
- **Free SMS**: ~1,900 messages with trial credit
- Trial phone numbers available
- Good for development and testing

## Setup Steps

### 1. Create Twilio Account

1. Go to [https://twilio.com/try-twilio](https://twilio.com/try-twilio)
2. Sign up with email and verify
3. Verify your phone number (required for trial)

### 2. Get Your Credentials

1. Go to [Console Dashboard](https://console.twilio.com)
2. Find **Account Info** section
3. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)

### 3. Get a Phone Number

1. Go to **Phone Numbers > Manage > Buy a number**
2. Select country (e.g., United States)
3. Check **SMS** capability
4. Choose a number and click **Buy**
5. Trial accounts get 1 free number

### 4. Configure Trial Restrictions (Trial Accounts Only)

Trial accounts can only send SMS to **verified numbers**:

1. Go to **Phone Numbers > Manage > Verified Caller IDs**
2. Click **Add a new number**
3. Enter test phone number
4. Complete verification

### 5. Configure Notification Service

Update `.env` file in `apps/notification-service/`:

```bash
# SMS Provider Selection
SMS_PROVIDER=TWILIO  # Use TWILIO for production, MOCK for development

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890  # Your Twilio phone number
```

**Provider Options:**

- `TWILIO`: Use Twilio for actual SMS delivery (production)
- `MOCK`: Simulate SMS sending for development/testing (no actual SMS sent)

### 6. Test SMS Sending

Start notification service:

```bash
cd apps/notification-service
PORT=3007 pnpm start:dev
```

Check logs for:

```
✅ Twilio SMS provider initialized successfully
```

### 7. Production Upgrade

When ready for production:

1. **Verify Your Business**

   - Go to **Console > Account**
   - Click **Upgrade account**
   - Complete business verification

2. **Add Credit Card**

   - Pay-as-you-go pricing
   - No monthly fees

3. **Remove Trial Restrictions**
   - Send to any phone number
   - Higher rate limits

## SMS Types in Jatra

**OTP Messages:**

```
Your Jatra Railway OTP is: 123456. Valid for 10 minutes.
```

**Booking Confirmation:**

```
Booking confirmed! Suborno Express, Booking ID: BK123. Check email for details.
```

**Cancellation:**

```
Booking BK123 cancelled. Refund in 5-7 business days.
```

## Troubleshooting

### SMS Not Sending (Trial Account)

- ✅ Verify recipient number is added to **Verified Caller IDs**
- ✅ Check trial credit balance in dashboard
- ✅ Ensure phone number has SMS capability

### Invalid Phone Number Format

- ✅ Use E.164 format: `+[country code][phone number]`
- ✅ Example: `+8801712345678` (Bangladesh), `+12025551234` (US)

### Auth Error

- ✅ Verify Account SID starts with `AC`
- ✅ Check Auth Token is correct (not Test Credentials)
- ✅ Regenerate token if compromised

### Rate Limiting

- Trial: 1 message per second
- Production: Higher limits based on account

## Pricing (After Trial)

| Region     | Cost per SMS |
| ---------- | ------------ |
| US/Canada  | $0.0079      |
| Bangladesh | $0.0650      |
| India      | $0.0070      |
| UK         | $0.0430      |

## Best Practices

✅ **Use Mock in Development**

- Faster testing
- No SMS quota used
- No accidental spam

✅ **Production Checklist**

- Use verified Twilio account
- Monitor SMS quota and billing
- Implement rate limiting
- Log all SMS attempts
- Handle delivery failures

✅ **Security**

- Never commit credentials to git
- Use environment variables
- Rotate auth tokens regularly
- Restrict API access by IP (production)

## Alternative SMS Providers

If Twilio doesn't work:

1. **Vonage (Nexmo)**: €2 free credit
2. **MSG91**: 100 free SMS (India)
3. **Plivo**: $10 free credit
4. **AWS SNS**: 100 SMS/month free

## API Documentation

Twilio SMS API: [https://www.twilio.com/docs/sms](https://www.twilio.com/docs/sms)

For this integration, we're using the official Twilio Node.js SDK.
