# BloodBridge WhatsApp Bot

A simple WhatsApp bot for connecting blood donors with patients in need.

## Quick Setup

### 1. Accounts Required
- **Supabase** (free): Database
- **Twilio** (free tier): WhatsApp messaging  
- **Vercel** (free): Hosting

### 2. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Create project
supabase projects create bloodbridge-db

# Run migrations
supabase db push
```

### 3. Deploy Bot
```bash
# Clone and setup
git clone <your-repo>
cd bloodbridge-bot
npm install

# Set environment variables in Vercel dashboard
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_WHATSAPP_NUMBER

# Deploy
vercel --prod
```

### 4. Configure Twilio Webhook
In Twilio Console → WhatsApp → Sandbox:
- Set webhook URL: `https://your-app.vercel.app/api/webhook`
- Method: POST

## Bot Commands

**Register as Donor:**
```
JOIN John Doe A+ Mumbai
```

**Request Blood:**
```
NEED A+ URGENT
```

**Get Help:**
```
HELP
```

## How It Works

1. **Donors join** with their blood type and location
2. **Patients request** blood specifying type and urgency  
3. **Bot automatically matches** compatible donors using blood type compatibility rules
4. **Notifications sent** to up to 3 matching donors
5. **Donors respond** YES/NO to confirm availability

## Blood Type Compatibility

- **O-**: Universal donor (can donate to all)
- **O+**: Can donate to A+, B+, AB+, O+
- **A-**: Can donate to A+, A-, AB+, AB-
- **A+**: Can donate to A+, AB+
- **B-**: Can donate to B+, B-, AB+, AB-  
- **B+**: Can donate to B+, AB+
- **AB-**: Can donate to AB+, AB-
- **AB+**: Can only donate to AB+

## Architecture

- **Frontend**: WhatsApp (via Twilio)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Messaging**: Twilio WhatsApp API

Total setup time: ~2 hours