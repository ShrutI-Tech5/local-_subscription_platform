# Local Service Subscription Platform - API & Database Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Sample API Requests](#sample-api-requests)
5. [Database Collections](#database-collections)

---

## Project Overview

This is a **Local Service Subscription Platform** built with:
- **Backend**: Flask (Python) with MongoDB
- **Frontend**: React with TypeScript
- **Database**: MongoDB (local instance)
- **Authentication**: Email-based OTP verification

**Base URL**: `http://localhost:5000`

---

## Database Schema

### Database Name: `local_service_platform`

---

### 1. Users Collection (`users`)

**Purpose**: Stores both customer and provider user information

**Schema Snapshot**:
```
json
{
  "_id": ObjectId("..."),
  "name": "John Doe",
  "email": "john@example.com",
  "password_hash": "$2b$12$...",
  "role": "customer" | "provider",
  "verified": true | false,
  "otp": null | "123456",
  "otp_expiry": datetime | null,
  "mobile": "+1234567890",
  "address": "123 Main St, City",
  "service_type": "plumbing" | "electrical" | "cleaning" | ...,
  "service_area": "Downtown, Uptown",
  "status": "active" | "pending" | "suspended",
  "created_at": datetime
}
```

**Indexes**:
- `_id` (Primary Key)
- `email` (Unique Index)

---

### 2. Instant Bookings Collection (`instant_bookings`)

**Purpose**: Stores one-time service booking requests

**Schema Snapshot**:
```
json
{
  "_id": ObjectId("..."),
  "customer_id": "user_id_string",
  "customer_name": "John Doe",
  "service_type": "plumbing",
  "description": "Leaking faucet in kitchen",
  "image": "base64_string" | null,
  "voice_note": "base64_string" | null,
  "address": "123 Main St",
  "phone": "+1234567890",
  "status": "pending" | "accepted" | "rejected" | "completed",
  "provider_id": "provider_id_string" | null,
  "provider_name": "Jane Plumber" | null,
  "price": 50.00 | null,
  "quote": "Will fix in 1 hour" | null,
  "feedback": 5 | null,
  "feedback_message": "Great service!" | null,
  "created_at": datetime,
  "updated_at": datetime
}
```

---

### 3. Subscriptions Collection (`subscriptions`)

**Purpose**: Stores recurring subscription plans for services

**Schema Snapshot**:
```
json
{
  "_id": ObjectId("..."),
  "customer_id": "user_id_string",
  "service_id": "service_id_string",
  "provider_id": "provider_id_string",
  "plan": "daily" | "weekly" | "monthly" | "quarterly" | "annual",
  "price": 99.99,
  "status": "active" | "cancelled" | "expired",
  "start_date": datetime,
  "end_date": datetime,
  "service_name": "Home Cleaning",
  "provider_name": "CleanPro Services",
  "service_type": "cleaning",
  "location": "Downtown Area",
  "created_at": datetime,
  "updated_at": datetime
}
```

**Plan Duration Mapping**:
- `daily`: 1 day
- `weekly`: 7 days
- `monthly`: 30 days
- `quarterly`: 90 days
- `annual`: 365 days

---

### 4. Payments Collection (`payments`)

**Purpose**: Records all payment transactions

**Schema Snapshot**:
```
json
{
  "_id": ObjectId("..."),
  "user_id": "user_id_string",
  "provider_id": "provider_id_string",
  "customer_id": "user_id_string",
  "amount": 99.99,
  "type": "subscription" | "instant",
  "status": "success" | "failed" | "pending",
  "subscription_id": "subscription_id_string" | null,
  "booking_id": "booking_id_string" | null,
  "plan": "monthly" | null,
  "created_at": datetime
}
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP |

### Booking Routes (`/api/bookings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/instant-booking` | Create a new booking |
| GET | `/api/instant-booking/<id>` | Get booking by ID |
| GET | `/api/customer/<id>/bookings` | Get all customer bookings |
| GET | `/api/provider/<id>/bookings` | Get all provider bookings |
| GET | `/api/bookings/pending` | Get all pending bookings |
| PUT | `/api/instant-booking/<id>` | Update booking |

### Subscription Routes (`/api/subscriptions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscription` | Create a new subscription |
| GET | `/api/subscription/<id>` | Get subscription by ID |
| GET | `/api/customer/<id>/subscriptions` | Get customer subscriptions |
| GET | `/api/provider/<id>/subscriptions` | Get provider subscriptions |
| GET | `/api/subscriptions/active` | Get all active subscriptions |
| PUT | `/api/subscription/<id>` | Update subscription |

### Payment Routes (`/api/payments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment` | Create a new payment |
| GET | `/api/payment/<id>` | Get payment by ID |
| GET | `/api/customer/<id>/payments` | Get customer payments |
| GET | `/api/provider/<id>/payments` | Get provider payments |
| GET | `/api/subscription/<id>/payment` | Get payment by subscription |
| GET | `/api/booking/<id>/payment` | Get payment by booking |

---

## Sample API Requests

### 1. User Registration (Customer Signup)

**Endpoint**: `POST /api/auth/signup`

**Request**:
```
json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "customer",
  "mobile": "+1234567890",
  "address": "123 Main Street, New York, NY"
}
```

**Response** (201 Created):
```
json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to login.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "verified": false,
    "mobile": "+1234567890",
    "address": "123 Main Street, New York, NY",
    "service_type": null,
    "service_area": null,
    "status": "active"
  }
}
```

---

### 2. User Registration (Provider Signup)

**Endpoint**: `POST /api/auth/signup`

**Request**:
```
json
{
  "name": "Jane Plumber",
  "email": "jane.plumber@example.com",
  "password": "securepass456",
  "role": "provider",
  "mobile": "+1987654321",
  "address": "456 Oak Avenue, New York, NY",
  "serviceType": "plumbing",
  "serviceArea": "Manhattan, Brooklyn"
}
```

**Response** (201 Created):
```
json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to login.",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Plumber",
    "email": "jane.plumber@example.com",
    "role": "provider",
    "verified": false,
    "mobile": "+1987654321",
    "address": "456 Oak Avenue, New York, NY",
    "service_type": "plumbing",
    "service_area": "Manhattan, Brooklyn",
    "status": "pending"
  }
}
```

---

### 3. Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`

**Request**:
```
json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):
```
json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

---

### 4. User Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```
json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```
json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "verified": true,
    "mobile": "+1234567890",
    "address": "123 Main Street, New York, NY",
    "service_type": null,
    "service_area": null,
    "status": "active"
  }
}
```

---

### 5. Create Instant Booking

**Endpoint**: `POST /api/instant-booking`

**Request**:
```
json
{
  "customerId": "507f1f77bcf86cd799439011",
  "customerName": "John Doe",
  "serviceType": "plumbing",
  "description": "Leaking faucet in kitchen sink needs immediate repair",
  "address": "123 Main Street, New York, NY",
  "phone": "+1234567890"
}
```

**Response** (201 Created):
```
json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "650f1a77bcf86cd799439021",
    "customer_id": "507f1f77bcf86cd799439011",
    "customer_name": "John Doe",
    "service_type": "plumbing",
    "description": "Leaking faucet in kitchen sink needs immediate repair",
    "image": null,
    "voice_note": null,
    "address": "123 Main Street, New York, NY",
    "phone": "+1234567890",
    "status": "pending",
    "provider_id": null,
    "provider_name": null,
    "price": null,
    "quote": null,
    "feedback": null,
    "feedback_message": null,
    "created_at": "2024-09-22T10:30:00"
  }
}
```

---

### 6. Provider Accepts Booking

**Endpoint**: `PUT /api/instant-booking/650f1a77bcf86cd799439021`

**Request**:
```
json
{
  "status": "accepted",
  "provider_id": "507f1f77bcf86cd799439012",
  "provider_name": "Jane Plumber",
  "price": 75.00,
  "quote": "Can arrive within 30 minutes"
}
```

**Response** (200 OK):
```
json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    "id": "650f1a77bcf86cd799439021",
    "customer_id": "507f1f77bcf86cd799439011",
    "customer_name": "John Doe",
    "service_type": "plumbing",
    "status": "accepted",
    "provider_id": "507f1f77bcf86cd799439012",
    "provider_name": "Jane Plumber",
    "price": 75.00,
    "quote": "Can arrive within 30 minutes",
    "created_at": "2024-09-22T10:30:00"
  }
}
```

---

### 7. Create Subscription

**Endpoint**: `POST /api/subscription`

**Request**:
```
json
{
  "customerId": "507f1f77bcf86cd799439011",
  "serviceId": "service_001",
  "providerId": "507f1f77bcf86cd799439012",
  "plan": "monthly",
  "price": 99.99,
  "serviceName": "Home Cleaning Service",
  "providerName": "CleanPro Services",
  "serviceType": "cleaning",
  "location": "Manhattan Area"
}
```

**Response** (201 Created):
```
json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "id": "650f1b77bcf86cd799439031",
    "customer_id": "507f1f77bcf86cd799439011",
    "service_id": "service_001",
    "provider_id": "507f1f77bcf86cd799439012",
    "plan": "monthly",
    "price": 99.99,
    "status": "active",
    "start_date": "2024-09-22T10:30:00",
    "end_date": "2024-10-22T10:30:00",
    "service_name": "Home Cleaning Service",
    "provider_name": "CleanPro Services",
    "service_type": "cleaning",
    "location": "Manhattan Area",
    "created_at": "2024-09-22T10:30:00"
  }
}
```

---

### 8. Create Payment

**Endpoint**: `POST /api/payment`

**Request** (Subscription Payment):
```
json
{
  "userId": "507f1f77bcf86cd799439011",
  "providerId": "507f1f77bcf86cd799439012",
  "customerId": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "type": "subscription",
  "status": "success",
  "subscriptionId": "650f1b77bcf86cd799439031",
  "plan": "monthly"
}
```

**Request** (Instant Booking Payment):
```
json
{
  "userId": "507f1f77bcf86cd799439011",
  "providerId": "507f1f77bcf86cd799439012",
  "customerId": "507f1f77bcf86cd799439011",
  "amount": 75.00,
  "type": "instant",
  "status": "success",
  "bookingId": "650f1a77bcf86cd799439021"
}
```

**Response** (201 Created):
```
json
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment": {
    "id": "650f1c77bcf86cd799439041",
    "user_id": "507f1f77bcf86cd799439011",
    "provider_id": "507f1f77bcf86cd799439012",
    "customer_id": "507f1f77bcf86cd799439011",
    "amount": 99.99,
    "type": "subscription",
    "status": "success",
    "subscription_id": "650f1b77bcf86cd799439031",
    "booking_id": null,
    "plan": "monthly",
    "created_at": "2024-09-22T10:35:00"
  }
}
```

---

### 9. Get Customer Subscriptions

**Endpoint**: `GET /api/customer/507f1f77bcf86cd799439011/subscriptions`

**Response** (200 OK):
```
json
{
  "success": true,
  "subscriptions": [
    {
      "id": "650f1b77bcf86cd799439031",
      "customer_id": "507f1f77bcf86cd799439011",
      "service_id": "service_001",
      "provider_id": "507f1f77bcf86cd799439012",
      "plan": "monthly",
      "price": 99.99,
      "status": "active",
      "start_date": "2024-09-22T10:30:00",
      "end_date": "2024-10-22T10:30:00",
      "service_name": "Home Cleaning Service",
      "provider_name": "CleanPro Services",
      "service_type": "cleaning",
      "location": "Manhattan Area",
      "created_at": "2024-09-22T10:30:00"
    }
  ]
}
```

---

### 10. Get Provider Bookings

**Endpoint**: `GET /api/provider/507f1f77bcf86cd799439012/bookings`

**Response** (200 OK):
```
json
{
  "success": true,
  "bookings": [
    {
      "id": "650f1a77bcf86cd799439021",
      "customer_id": "507f1f77bcf86cd799439011",
      "customer_name": "John Doe",
      "service_type": "plumbing",
      "description": "Leaking faucet in kitchen sink",
      "status": "accepted",
      "provider_id": "507f1f77bcf86cd799439012",
      "provider_name": "Jane Plumber",
      "price": 75.00,
      "created_at": "2024-09-22T10:30:00"
    }
  ]
}
```

---

### 11. Get Pending Bookings (For Providers)

**Endpoint**: `GET /api/bookings/pending`

**Response** (200 OK):
```
json
{
  "success": true,
  "bookings": [
    {
      "id": "650f1d77bcf86cd799439051",
      "customer_id": "507f1f77bcf86cd799439011",
      "customer_name": "John Doe",
      "service_type": "electrical",
      "description": "Need to install new ceiling fan",
      "address": "789 Elm Street",
      "phone": "+1234567890",
      "status": "pending",
      "created_at": "2024-09-22T11:00:00"
    }
  ]
}
```

---

### 12. Update Subscription Status

**Endpoint**: `PUT /api/subscription/650f1b77bcf86cd799439031`

**Request**:
```
json
{
  "status": "cancelled"
}
```

**Response** (200 OK):
```
json
{
  "success": true,
  "message": "Subscription updated successfully",
  "subscription": {
    "id": "650f1b77bcf86cd799439031",
    "status": "cancelled",
    "price": 99.99,
    "plan": "monthly",
    ...
  }
}
```

---

## Database Collections Summary

| Collection Name | Purpose | Key Fields |
|-----------------|---------|------------|
| `users` | User authentication and profiles | `email`, `role`, `verified`, `password_hash` |
| `instant_bookings` | One-time service requests | `customer_id`, `service_type`, `status`, `provider_id` |
| `subscriptions` | Recurring service subscriptions | `customer_id`, `plan`, `status`, `start_date`, `end_date` |
| `payments` | Payment transaction records | `user_id`, `amount`, `type`, `status`, `subscription_id` |

---

## Testing the API

You can test these endpoints using tools like **Postman** or **cURL**:

```
bash
# Example: User Registration
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"customer"}'
```

---

*Document generated for Local Service Subscription Platform Report*
