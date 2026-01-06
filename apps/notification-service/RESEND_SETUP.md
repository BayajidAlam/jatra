# Resend Email Setup Guide (Recommended)

**Why Resend?** Modern, simple API, excellent deliverability, 3,000 free emails/month

## Step 1: Sign Up (2 minutes)

1. Go to [https://resend.com/](https://resend.com/)
2. Click **"Start Building"** or **"Sign Up"**
3. Sign up with GitHub or email (instant approval, no credit card needed)

## Step 2: Get Your API Key (1 minute)

1. After login, you'll be on the dashboard
2. Click **"API Keys"** in the left sidebar
3. Click **"Create API Key"**
4. Name it: `Jatra Railway`
5. Copy the API key (starts with `re_`)

**Important:** Save this key - you can't see it again!

## Step 3: Configure Notification Service (1 minute)

1. Open `/apps/notification-service/.env`
2. Update these values:

```bash
# Switch to Resend
EMAIL_PROVIDER=RESEND

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Jatra Railway <onboarding@resend.dev>
```

**Note:** For testing, you can use `onboarding@resend.dev` as the from address. For production, add your own domain.

## Step 4: Restart Notification Service

```bash
# Stop the service (Ctrl+C in the terminal)
# Then restart:
cd apps/notification-service
npm run start:dev
```

You should see:
```
✅ Resend email provider initialized successfully
```

## Step 5: Test It!

1. Register a new user
2. Make a booking
3. Check your email inbox - you'll receive real emails! 📧

## Emails You'll Receive

- ✅ Welcome email (on registration)
- ✅ Booking confirmation (after payment)
- ✅ Ticket with PDF
- ✅ Payment receipts

## Free Tier Limits

- **3,000 emails/month** (forever free)
- **100 emails/day**
- No credit card required
- No time limit

## Add Your Own Domain (Optional)

For production, use your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain (e.g., `mail.yourdomain.com`)
4. Add the DNS records shown
5. Wait for verification (~5 minutes)
6. Update `.env`:

```bash
RESEND_FROM_EMAIL=Jatra Railway <noreply@mail.yourdomain.com>
```

## Troubleshooting

### "Resend not configured"
- Check `RESEND_API_KEY` is set in `.env`
- Make sure API key starts with `re_`
- Restart notification service

### Emails not arriving
- Check spam folder
- Verify API key is correct
- Check Resend dashboard → Emails for delivery status

## Why Resend is Best

✅ **Easiest setup** - Just API key, no SMTP config  
✅ **Best free tier** - 3,000 emails/month forever  
✅ **Modern API** - Clean, simple, fast  
✅ **Great deliverability** - Emails don't go to spam  
✅ **No verification needed** - Works instantly with test domain  

---

**Need help?** Check Resend docs: https://resend.com/docs
