# Local Service Subscription Platform - Complete Workflow Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles](#user-roles)
3. [Technology Stack](#technology-stack)
4. [Complete User Flow](#complete-user-flow)
5. [Feature List](#feature-list)
6. [API Endpoints](#api-endpoints)
7. [Database Models](#database-models)
8. [Page Routes](#page-routes)

---

## 1. System Overview

The **Local Service Subscription Platform** (brand name: **Servease**) is a marketplace connecting customers with local service providers. Customers can subscribe to recurring services or book instant one-time services. The platform supports both subscription-based and on-demand service models.

---

## 2. User Roles

### Customer
- Browse and search local service providers
- Subscribe to services (Daily, Weekly, Monthly plans)
- Make instant bookings for urgent needs
- Make payments via Card, UPI, or Net Banking
- Provide feedback on quotes
- View subscription history and bookings
- Manage profile

### Service Provider
- Register and offer services
- Receive and manage service requests
- Accept/reject instant booking requests
- Submit quotes for customer jobs
- View earnings and revenue reports
- Manage customer subscriptions
- Handle customer feedback on pricing

---

## 3. Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React Context API
- **Build Tool**: Vite

### Backend
- **Framework**: Flask (Python)
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT-style with OTP verification
- **Email**: SMTP for OTP delivery
- **CORS**: Flask-CORS

### Data Storage
- **MongoDB**: Primary database for users, bookings, subscriptions, payments
- **LocalStorage**: Frontend mock data and caching

---

## 4. Complete User Flow

### A. Customer Registration & Login Flow

```
1. Landing Page (/)
   ↓
2. Select Role: Customer or Provider
   ↓
3a. Customer Registration (/register/customer)
   - Fill: Name, Email, Mobile, Address, Password
   - Submit → Backend creates user (verified=false)
   - Backend generates 6-digit OTP
   - Backend sends OTP via email
   ↓
3b. Provider Registration (/register/provider)
   - Fill: Name, Email, Mobile, Service Type, Service Area, Password
   - Submit → Backend creates provider (status=pending)
   - Backend generates 6-digit OTP
   - Backend sends OTP via email
   ↓
4. OTP Verification (/verify-otp)
   - Enter 6-digit OTP
   - Backend validates OTP (5-minute expiry)
   - Mark user as verified=true
   - Clear OTP from database
   ↓
5. Login (/login)
   - Enter Email + Password
   - Backend verifies credentials
   - Check if verified=true
   - Return user data with role
   - Frontend stores user in AuthContext + localStorage
   ↓
6. Role-based Dashboard Redirect
   - Customer → /customer/dashboard
   - Provider → /provider/dashboard
```

### B. Customer Service Subscription Flow

```
1. Customer Dashboard (/customer/dashboard)
   ↓
2. Click "Browse Services" → /customer/browse-services
   ↓
3. Browse Services Page
   - Search by service type, provider name, description
   - Filter by category (Plumber, Electrician, etc.)
   - Filter by location
   - Sort by: Rating, Price (Low-High, High-Low)
   - View service cards with provider info, rating, price
   - View detailed table of all providers
   ↓
4. Select Service → /customer/service/:serviceId
   - View provider details
   - View customer reviews and ratings
   - Select subscription plan:
     * Daily (₹200/day)
     * Weekly (₹500/week)
     * Monthly (₹799/month)
   ↓
5. Proceed to Payment → /customer/payment
   - Select Payment Method:
     * Credit/Debit Card
     * UPI
     * Net Banking
   - Enter payment details
   - Simulated payment processing (2 second delay)
   ↓
6. Payment Success
   - Backend creates Subscription record
   - Backend creates Payment record
   - Frontend shows success message
   - Redirect to Customer Dashboard
   ↓
7. Customer Dashboard (Updated)
   - New subscription appears in "Active Subscriptions"
   - Subscription has status="active"
   - Shows end date of subscription
```

### C. Instant Booking Flow

```
1. Customer Dashboard (/customer/dashboard)
   ↓
2. Click "Instant Booking" → /customer/instant-booking
   ↓
3. Instant Booking Form
   - Service Type (dropdown)
   - Problem Description (textarea)
   - Voice Note Recording (microphone)
   - Image Upload (optional)
   - Address (auto-filled from profile, editable)
   - Phone (auto-filled from profile, editable)
   ↓
4. Submit Booking Request
   - Backend creates InstantBooking (status=pending)
   - Frontend shows "Booking Submitted" confirmation
   ↓
5. Provider Selection
   - System finds nearby providers matching service type
   - Customer selects from available providers
   - Booking updated with provider_id and provider_name
   ↓
6. Provider Receives Request
   - Provider views in Service Requests
   - Provider can Accept or Reject
   ↓
7a. Provider Accepts
   - Provider enters quote amount
   - Booking status → "accepted"
   - Customer sees quote on dashboard
   ↓
7b. Provider Rejects
   - Booking status → "rejected"
   - Customer notified
   ↓
8. Customer Reviews Quote
   - Accept (thumbs up) → Provider proceeds
   - Too High (thumbs down) → Can submit feedback message
   - Provider can adjust quote based on feedback
   ↓
9. Customer Makes Payment
   - Navigate to Payment page
   - Complete payment for quote amount
   - Booking status → "completed"
   ↓
10. Both Parties See Completed Job
    - Customer can hide/delete from dashboard
    - Provider can mark job complete
```

### D. Provider Workflow

```
1. Provider Login → /provider/dashboard
   ↓
2. Dashboard Overview
   - Total Earnings
   - Active Customers (subscriptions)
   - Pending Requests
   - Completed Jobs
   - Service Profile info
   - Recent Reviews
   ↓
3. Service Requests (/provider/service-requests)
   - View all booking requests
   - Filter by: All, Pending, Accepted, Completed, Rejected, Feedback Received
   - Accept: Enter quote amount
   - Reject: Cancel request
   - Complete: Mark job done after customer payment
   - Change Quote: If customer rejected as "too high"
   ↓
4. Earnings (/provider/earnings)
   - Total Earnings
   - Net Earnings (after 15% commission)
   - This Month's Earnings
   - Monthly Revenue Report
   - Payment History Table
   ↓
5. Profile (/provider/profile)
   - View/Edit personal info
   - Service stats
   - Customer reviews
   - Active subscriptions
```

---

## 5. Feature List

### Authentication Features
- [x] User Registration (Customer & Provider)
- [x] Email OTP Verification (6-digit, 5-minute expiry)
- [x] Login with email/password
- [x] Role-based access control
- [x] Session management via localStorage
- [x] Logout functionality

### Customer Features
- [x] Browse services with search & filters
- [x] Filter by service category, location
- [x] Sort by rating, price
- [x] View service provider details
- [x] View customer reviews and ratings
- [x] Subscribe to services (Daily/Weekly/Monthly)
- [x] Instant booking for urgent needs
- [x] Voice note recording for problem description
- [x] Image upload for problem visualization
- [x] Select nearby providers
- [x] Review and accept/reject quotes
- [x] Provide feedback on pricing
- [x] Multiple payment methods (Card, UPI, Net Banking)
- [x] View active subscriptions
- [x] View booking history
- [x] Edit profile information

### Provider Features
- [x] View incoming service requests
- [x] Accept/reject booking requests
- [x] Submit price quotes
- [x] Adjust quotes based on customer feedback
- [x] Mark jobs as completed
- [x] View earnings dashboard
- [x] Track monthly revenue
- [x] Platform commission calculation (15%)
- [x] View payment history
- [x] View customer reviews
- [x] Manage profile information

### General Features
- [x] Responsive design (mobile-friendly)
- [x] Real-time stats and dashboards
- [x] Hide/delete completed bookings
- [x] MongoDB + localStorage hybrid data storage
- [x] Email notification for OTP

---

## 6. API Endpoints

### Base URL: `http://localhost:5000/api`

#### Authentication Routes (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user (creates unverified account) |
| POST | `/login` | Login (requires verified email) |
| POST | `/send-otp` | Resend OTP to email |
| POST | `/verify-otp` | Verify OTP and mark email as verified |

#### Booking Routes (`/bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/instant-booking` | Create new instant booking |
| GET | `/instant-booking/:id` | Get booking by ID |
| GET | `/customer/:id/bookings` | Get all bookings for customer |
| GET | `/provider/:id/bookings` | Get all bookings for provider |
| GET | `/bookings/pending` | Get all pending bookings |
| PUT | `/instant-booking/:id` | Update booking (accept, reject, complete) |

#### Subscription Routes (`/subscriptions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscription` | Create new subscription |
| GET | `/subscription/:id` | Get subscription by ID |
| GET | `/customer/:id/subscriptions` | Get all subscriptions for customer |
| GET | `/provider/:id/subscriptions` | Get all subscriptions for provider |
| GET | `/subscriptions/active` | Get all active subscriptions |
| PUT | `/subscription/:id` | Update subscription (renew, cancel) |

#### Payment Routes (`/payments`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment` | Record new payment |
| GET | `/payment/:id` | Get payment by ID |
| GET | `/customer/:id/payments` | Get all payments for customer |
| GET | `/provider/:id/payments` | Get all payments for provider |
| GET | `/subscription/:id/payment` | Get payment by subscription ID |
| GET | `/booking/:id/payment` | Get payment by booking ID |

---

## 7. Database Models

### User Model
```
- _id: ObjectId
- name: String
- email: String (unique)
- password_hash: String (bcrypt)
- role: String ("customer" | "provider")
- verified: Boolean (default: false)
- otp: String (nullable)
- otp_expiry: DateTime (nullable)
- mobile: String
- address: String
- service_type: String (providers only)
- service_area: String (providers only)
- status: String ("pending" | "active")
- created_at: DateTime
```

### InstantBooking Model
```
- _id: ObjectId
- customer_id: String
- customer_name: String
- service_type: String
- description: String
- image: String (optional)
- voice_note: String (base64, optional)
- address: String
- phone: String
- status: String ("pending" | "accepted" | "completed" | "rejected")
- provider_id: String (optional)
- provider_name: String (optional)
- price: Number (optional)
- quote: Number (optional)
- feedback: String ("thumbs_up" | "thumbs_down", optional)
- feedback_message: String (optional)
- created_at: DateTime
```

### Subscription Model
```
- _id: ObjectId
- customer_id: String
- service_id: String
- provider_id: String
- plan: String ("daily" | "weekly" | "monthly" | "quarterly" | "annual")
- price: Number
- status: String ("active" | "expired" | "cancelled")
- start_date: DateTime
- end_date: DateTime
- service_name: String
- provider_name: String
- service_type: String
- location: String
- created_at: DateTime
```

### Payment Model
```
- _id: ObjectId
- user_id: String
- provider_id: String
- customer_id: String
- amount: Number
- type: String ("subscription" | "instant")
- status: String ("success" | "failed" | "pending")
- subscription_id: String (optional)
- booking_id: String (optional)
- plan: String (optional)
- created_at: DateTime
```

---

## 8. Page Routes

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | AboutPage | Landing/About page |
| `/home` | LandingPage | Role selection and login/register |
| `/register/customer` | CustomerRegister | Customer registration form |
| `/register/provider` | ProviderRegister | Provider registration form |
| `/verify-otp` | OTPVerification | OTP verification page |
| `/login` | Login | Login page |

### Customer Routes (Protected)
| Path | Component | Description |
|------|-----------|-------------|
| `/customer/dashboard` | Dashboard | Customer main dashboard |
| `/customer/profile` | Profile | Customer profile management |
| `/customer/browse-services` | BrowseServices | Browse and search services |
| `/customer/service/:serviceId` | SubscriptionSelection | Service details & plan selection |
| `/customer/payment` | Payment | Payment processing |
| `/customer/instant-booking` | InstantBooking | Instant booking request form |

### Provider Routes (Protected)
| Path | Component | Description |
|------|-----------|-------------|
| `/provider/dashboard` | Dashboard | Provider main dashboard |
| `/provider/profile` | Profile | Provider profile management |
| `/provider/service-requests` | ServiceRequests | Manage booking requests |
| `/provider/service-management` | ServiceManagement | Manage services |
| `/provider/earnings` | Earnings | View earnings and revenue |

### Error Routes
| Path | Component | Description |
|------|-----------|-------------|
| `*` | NotFound | 404 page |

---

## 9. Mock Data Structure

The platform includes extensive mock data:
- **15 Service Types**: Plumber, Electrician, Carpenter, HVAC, Painter, Cleaner, Gardener, Mechanic, Appliance Repair, Pest Control, Home Security, Interior Designer, Landscaping, Pool Maintenance, Window Cleaning
- **17 Providers per Service Type**: 255 total service listings
- **20 Locations**: Chennai, Coimbatore, Madurai, etc.
- **Dynamic Customer Reviews**: Generated reviews with ratings

---

## 10. Payment Flow Summary

1. **Customer** selects service/plan or receives quote
2. **Customer** enters payment details (Card/UPI/Netbanking)
3. **Frontend** simulates 2-second processing
4. **Backend** creates Payment record (status=success)
5. **Backend** creates/updates Subscription or InstantBooking
6. **Frontend** shows success message
7. **Redirect** to respective dashboard

**Note**: This is a demo/simulation. No real payment processing occurs.

---

## 11. Commission Structure

- **Platform Commission**: 15% on all provider earnings
- **Provider Net Earnings**: Gross Earnings - 15% Commission
- Displayed in Provider's Earnings dashboard

---

*Document generated for reporting purposes*
*Platform: Local Service Subscription Platform (Servease)*
*Tech Stack: React + TypeScript + Flask + MongoDB*
