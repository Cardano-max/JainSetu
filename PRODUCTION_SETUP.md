# JainSetu - Complete Production Setup Guide

## Prerequisites

- **Node.js 18+** (download from nodejs.org)
- **PostgreSQL** (download from postgresql.org or use Docker)
- **Git**
- **VS Code** (recommended)

---

## STEP 1: Pull Latest Code

```powershell
# Navigate to project
cd C:\Users\ateeb\Desktop\Jain\JainSetu

# Stash local changes
git stash

# Pull latest code
git pull origin claude/build-jainsetu-app-RzR3K

# (Optional) Apply stashed changes
git stash pop
```

---

## STEP 2: Setup PostgreSQL Database

### Option A: Install PostgreSQL Directly

1. Download from: https://www.postgresql.org/download/windows/
2. During install, set password for `postgres` user (remember this!)
3. After install, open pgAdmin or psql and create database:

```sql
CREATE DATABASE jainsetu;
```

### Option B: Use Docker (Easier)

```powershell
docker run --name jainsetu-db -e POSTGRES_PASSWORD=password123 -e POSTGRES_DB=jainsetu -p 5432:5432 -d postgres:15
```

---

## STEP 3: Setup Backend

```powershell
# Navigate to backend
cd C:\Users\ateeb\Desktop\Jain\JainSetu\backend

# Install dependencies
npm install

# Create .env file (copy from example)
copy .env.example .env
```

### Edit `.env` file:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jainsetu?schema=public"

# JWT Secret (change this to something random/secure)
JWT_SECRET="your-super-secret-key-jainsetu-2024-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# OTP (keep as mock for demo)
OTP_SERVICE=mock

# Razorpay (optional - for payments)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Run Database Setup:

```powershell
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate:dev

# Seed demo data (optional)
npm run seed

# Start backend server
npm run dev
```

Backend should now be running at: **http://localhost:3000**

Test it by visiting: http://localhost:3000/api/health

---

## STEP 4: Setup Mobile App

```powershell
# Open NEW terminal
cd C:\Users\ateeb\Desktop\Jain\JainSetu\mobile

# Install dependencies
npm install --legacy-peer-deps

# If you get ajv error, run:
npm install ajv@8 --legacy-peer-deps
```

### Configure API URL (for local testing):

The mobile app automatically connects to:
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **iOS Simulator**: `http://localhost:3000/api`
- **Physical Device on same WiFi**: `http://YOUR_PC_IP:3000/api`

To find your PC IP:
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

For physical device testing, create `.env` file in mobile folder:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

---

## STEP 5: Run & Test

### Terminal 1 - Run Backend:
```powershell
cd C:\Users\ateeb\Desktop\Jain\JainSetu\backend
npm run dev
```

### Terminal 2 - Run Mobile:
```powershell
cd C:\Users\ateeb\Desktop\Jain\JainSetu\mobile
npm start
```

### Testing Options:

1. **Press `a`** - Run on Android Emulator
2. **Press `i`** - Run on iOS Simulator (Mac only)
3. **Scan QR** - Open in Expo Go app on your phone

---

## STEP 6: Test Checklist

| Feature | How to Test | Expected Result |
|---------|-------------|-----------------|
| Login | Enter phone number, tap Login | Goes to home screen |
| Stories | Tap on any story circle | Story viewer opens |
| Add Story | Tap "Your Story" | Shows add options |
| Slider | Swipe left/right on slider | Slides change |
| Messenger | Tap chat icon in header | Shows conversations |
| + Button | Tap + icon in header | Shows add content options |
| Festival Post | Menu > Festival Post | Template selector opens |
| Weather | Check home screen | Shows temperature |
| Tirth | Menu > Tirth & Dharamshala | Shows places list |
| Navigate | Tap navigate button on Tirth | Opens Google Maps |

---

## STEP 7: Build APK for Client

### One-time Setup:

```powershell
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo (create free account at expo.dev)
eas login
```

### Build APK:

```powershell
cd C:\Users\ateeb\Desktop\Jain\JainSetu\mobile

# Build preview APK (faster, for testing)
eas build --platform android --profile preview

# OR Build production APK
eas build --platform android --profile production
```

### After Build Completes:

1. EAS will give you a download link
2. Download the `.apk` file
3. Share with client via WhatsApp/Google Drive
4. Client installs APK on their Android phone

---

## STEP 8: Quick Demo for Client (Without APK)

If client wants to see quickly:

```powershell
# Run with tunnel (accessible from anywhere)
npx expo start --tunnel
```

Share the URL with client. They:
1. Download "Expo Go" app from Play Store
2. Open the shared URL
3. App loads instantly!

---

## Production Deployment Checklist

Before March 1st launch:

- [ ] Deploy backend to cloud (Railway, Render, or AWS)
- [ ] Update mobile app API URL to production
- [ ] Set up real PostgreSQL database
- [ ] Configure real SMS service (MSG91/Twilio)
- [ ] Set up Razorpay for payments
- [ ] Build production APK/AAB
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Test all features end-to-end

---

## Troubleshooting

### "Cannot find module 'ajv'"
```powershell
npm install ajv@8 --legacy-peer-deps
```

### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Make sure database exists

### "Network error" on mobile
- Ensure backend is running
- Check PC and phone on same WiFi
- Use correct IP in EXPO_PUBLIC_API_URL

### Metro bundler error
```powershell
npx expo start -c
```

### Build failed
```powershell
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## Support

- Expo Docs: https://docs.expo.dev
- Prisma Docs: https://www.prisma.io/docs
- GitHub Issues: https://github.com/Cardano-max/JainSetu/issues
