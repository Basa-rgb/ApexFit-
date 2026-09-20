# ApexFit — Gym Management Platform

A full-stack gym management web application built with the MERN stack. Members can browse trainers, book personal training sessions, purchase memberships online (eSewa), and follow workout & diet plans — while trainers and admins manage everything from dedicated dashboards.

## Features

### Members
- Browse trainers, membership plans, workout/diet plans, blog posts, FAQs, and the gym gallery
- Book personal training sessions with trainer-defined **session types** (pricing + time slots)
- Purchase memberships through the **eSewa** payment gateway with signature verification
- Leave one review per account (update or delete anytime)
- Google OAuth sign-in plus standard email/password authentication with OTP email verification

### Trainers
- Dedicated dashboard with auto-created profile on first login
- Manage profile (photo upload to Cloudinary, availability, specialization)
- Create and manage **session types** (name, price, time slots) that members can book
- Handle bookings, view schedule, clients, earnings, and received reviews
- Assign workout and diet plans to their clients

### Admins
- Full admin panel: trainers, members, membership plans, payments table
- Manage workout plans, diet plans, blog posts, FAQs, contact messages, newsletter subscribers
- Upload gallery photos to Cloudinary with tap-to-view lightbox

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- React Router v7, Axios, Swiper, Motion, lucide-react icons
- Google OAuth (`@react-oauth/google`)

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose 9
- JWT authentication with role-based access control (`user`, `trainer`, `admin`)
- bcrypt password hashing, express-validator, express-rate-limit
- Multer + Cloudinary for image uploads
- eSewa payment integration (`esewajs`) with HMAC signature verification

## Project Structure

```
ApexFit/
├── Backend/
│   ├── controllers/       # Business logic per domain
│   ├── Routes/            # Express route definitions
│   ├── models/            # Mongoose schemas
│   ├── middlewares/       # auth, admin check, file upload
│   ├── config/            # DB + Cloudinary config
│   ├── utils/             # Helpers (Cloudinary uploader, etc.)
│   └── scripts/           # Seed + migration utilities
└── Frontend/ApexFit/
    ├── src/api/           # Axios API modules
    ├── src/Component/     # Features, Layout, Common components, Routes
    ├── src/pages/         # Standalone pages (payment result pages, etc.)
    └── public/            # Static assets (favicon, icons)
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account (free tier works)
- eSewa merchant account (UAT/sandbox credentials for development)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/ApexFit.git
cd ApexFit

# Backend
cd Backend
npm install

# Frontend
cd ../Frontend/ApexFit
npm install
```

### 2. Configure environment variables

Create `Backend/.env`:

```env
PORT=3000
MONGOOSE_URL=<your-mongodb-connection-string>
JWT_SECRET=<random-secret>
CLIENT_URL=http://localhost:5173

# OTP email sender
EMAIL_USER=<gmail-address>
EMAIL_PASSWORD=<gmail-app-password>

# Seeded admin account
ADMIN_EMAIL=<admin@example.com>
ADMIN_PASSWORD=<strong-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# eSewa payment gateway
MERCHANT_ID=EPAYTEST
SECRET=8gBm/:&EnhH.1/q
ESEWAPAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWAPAYMENT_STATUS_CHECK_URL=https://rc.esewa.com.np/api/epay/transaction/status/
SUCCESS_URL=http://localhost:5173/payment-success
FAILURE_URL=http://localhost:5173/payment-failed
```

> `EPAYTEST` values above are eSewa's public UAT sandbox settings. Use your live credentials in production.

Create `Frontend/ApexFit/.env`:

```env
VITE_API_URL=http://localhost:3000/api
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

### 3. Run the app

```bash
# Terminal 1 — backend (http://localhost:3000)
cd Backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd Frontend/ApexFit
npm run dev
```

## Admin Quick Start

Use these steps once to prepare an administrator account for a local demo.

1. In MongoDB Atlas, create the database user used in `MONGOOSE_URL` and add your current public IP address under **Security → Network Access**. Atlas must allow the machine running the backend to connect.
2. In `Backend/.env`, set real values for the minimum admin-login configuration:

```env
MONGOOSE_URL=mongodb+srv://<database-user>:<url-encoded-password>@<cluster>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=<a-long-random-secret>
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=<the-email-you-will-use-to-log-in>
ADMIN_PASSWORD=<a-long-unique-password>
```

3. Create (or reset) the configured account as an active, verified admin:

```bash
cd Backend
npm run seed:admin
```

4. Load the three demo-ready membership packages (Starter Fit, Progress Plus, and Apex Elite):

```bash
npm run seed:membership-plans
```

For a full project demonstration instead, run the one-command seed below. It adds sample members, trainer profiles, memberships, bookings, payments, workout plans, diet plans, blogs, gallery entries, FAQs, reviews, contacts, and newsletter subscribers.

```bash
npm run seed:demo
```

5. Start the backend and frontend, then open `http://localhost:5173/login`.
6. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. ApexFit redirects admins to `/admin/dashboard` automatically.

`seed:admin` is safe to run again: it updates the configured email to an active, verified admin and resets its password to `ADMIN_PASSWORD`.

For the complete app, also configure the email, Google OAuth, Cloudinary, and eSewa values in `Backend/.env`. These are not required merely to open the admin dashboard, but the corresponding features will not work until their values are set.

## Available Scripts

| Location | Script | Description |
|---|---|---|
| Backend | `npm run dev` | Start API with nodemon |
| Backend | `npm start` | Start API in production mode |
| Backend | `npm run seed:admin` | Create or update the configured admin account |
| Backend | `npm run seed:demo` | Load full demo content for every admin area |
| Backend | `npm run seed:membership-plans` | Add or refresh demo membership packages |
| Backend | `npm run seed:booking-options` | Seed sample booking options |
| Backend | `npm run migrate:booking-option-indexes` | Migrate booking option indexes |
| Backend | `npm run migrate:trainer-ids` | Migrate legacy trainer references |
| Frontend | `npm run dev` | Start Vite dev server |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run lint` | Lint with oxlint |

## API Overview

All endpoints are prefixed with `/api`. Authentication uses JWT bearer tokens.

| Route group | Purpose |
|---|---|
| `/api/auth` | Register, login, OTP verification, Google OAuth |
| `/api/users` | Profiles, member dashboard, trainer dashboard |
| `/api/admin` | Admin-only management endpoints |
| `/api/trainers` | Public trainer listing + trainer self-profile management |
| `/api/memberships` | Membership plans |
| `/api/subscriptions` | Member subscriptions |
| `/api/bookings` | Session bookings + trainer session types |
| `/api/workouts` | Workout plans |
| `/api/diets` | Diet plans |
| `/api/payments` | Payment records |
| `/api/esewa` | Initiate payment + verify transaction status |
| `/api/reviews` | Gym reviews (one per member) |
| `/api/gallery` | Gallery images |
| `/api/blogs` | Blog posts |
| `/api/faqs` | Frequently asked questions |
| `/api/contacts` | Contact form messages |
| `/api/newsletters` | Newsletter subscriptions |

## Payment Testing

The app integrates eSewa v2 ePay. In development, use eSewa's UAT test checkout:

- **eSewa ID:** `9806800001`
- **Password:** `Nepal@#`
- **MPIN:** `1122`
- **OTP:** any 6 digits

Successful payments are verified server-side against eSewa's status-check endpoint before being recorded.

## License

This project is licensed under the ISC License.
