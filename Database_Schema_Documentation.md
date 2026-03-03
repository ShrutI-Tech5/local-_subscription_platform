# Local Service Subscription Platform - Database Schema

## Database Name
```
local_service_platform
```

**Database Engine**: MongoDB  
**Connection**: `mongodb://localhost:27017/`

---

## Collections Overview

| Collection Name | Purpose | Key Fields |
|-----------------|---------|------------|
| `users` | User authentication and profiles | `email`, `role`, `verified`, `password_hash` |
| `instant_bookings` | One-time service requests | `customer_id`, `service_type`, `status`, `provider_id` |
| `subscriptions` | Recurring service subscriptions | `customer_id`, `plan`, `status`, `start_date`, `end_date` |
| `payments` | Payment transaction records | `user_id`, `amount`, `type`, `status`, `subscription_id` |

---

## 1. Users Collection (`users`)

### Purpose
Stores both customer and provider user information with authentication data.

### Schema
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
  "service_type": "plumbing" | "electrical" | "cleaning" | null,
  "service_area": "Downtown, Uptown" | null,
  "status": "active" | "pending" | "suspended",
  "created_at": datetime
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key, auto-generated |
| `name` | String | Full name of the user |
| `email` | String | Unique email address (indexed) |
| `password_hash` | Binary | Bcrypt hashed password |
| `role` | String | "customer" or "provider" |
| `verified` | Boolean | Email verification status |
| `otp` | String | One-time password (temporary) |
| `otp_expiry` | DateTime | OTP expiration time |
| `mobile` | String | Contact phone number |
| `address` | String | Physical address |
| `service_type` | String | Service category (providers only) |
| `service_area` | String | Service coverage area (providers only) |
| `status` | String | Account status |
| `created_at` | DateTime | Account creation timestamp |

### Indexes
- `_id` - Primary Key
- `email` - Unique Index

### Sample Document
```
json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq.z7NQ.G",
  "role": "customer",
  "verified": true,
  "otp": null,
  "otp_expiry": null,
  "mobile": "+1234567890",
  "address": "123 Main Street, New York, NY",
  "service_type": null,
  "service_area": null,
  "status": "active",
  "created_at": ISODate("2024-09-22T10:00:00Z")
}
```

---

## 2. Instant Bookings Collection (`instant_bookings`)

### Purpose
Stores one-time service booking requests from customers.

### Schema
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

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key, auto-generated |
| `customer_id` | String | Reference to user who created booking |
| `customer_name` | String | Name of the customer |
| `service_type` | String | Type of service required |
| `description` | String | Detailed description of the issue |
| `image` | String | Base64 encoded image (optional) |
| `voice_note` | String | Base64 encoded voice note (optional) |
| `address` | String | Service location |
| `phone` | String | Contact number |
| `status` | String | Booking status |
| `provider_id` | String | Assigned provider (when accepted) |
| `provider_name` | String | Provider's name |
| `price` | Number | Quoted price |
| `quote` | String | Provider's quote/notes |
| `feedback` | Number | Rating (1-5) |
| `feedback_message` | String | Customer feedback text |
| `created_at` | DateTime | Booking creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

### Status Values
- `pending` - Awaiting provider acceptance
- `accepted` - Provider has accepted
- `rejected` - Provider declined
- `completed` - Service completed

### Sample Document
```
json
{
  "_id": ObjectId("650f1a77bcf86cd799439021"),
  "customer_id": "507f1f77bcf86cd799439011",
  "customer_name": "John Doe",
  "service_type": "plumbing",
  "description": "Leaking faucet in kitchen sink needs immediate repair",
  "image": null,
  "voice_note": null,
  "address": "123 Main Street, New York, NY",
  "phone": "+1234567890",
  "status": "accepted",
  "provider_id": "507f1f77bcf86cd799439012",
  "provider_name": "Jane Plumber",
  "price": 75.00,
  "quote": "Can arrive within 30 minutes",
  "feedback": null,
  "feedback_message": null,
  "created_at": ISODate("2024-09-22T10:30:00Z"),
  "updated_at": ISODate("2024-09-22T10:35:00Z")
}
```

---

## 3. Subscriptions Collection (`subscriptions`)

### Purpose
Stores recurring subscription plans for services.

### Schema
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

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key, auto-generated |
| `customer_id` | String | Reference to subscriber |
| `service_id` | String | Service identifier |
| `provider_id` | String | Reference to service provider |
| `plan` | String | Subscription plan type |
| `price` | Number | Subscription price |
| `status` | String | Subscription status |
| `start_date` | DateTime | Subscription start date |
| `end_date` | DateTime | Subscription end date |
| `service_name` | String | Name of the service |
| `provider_name` | String | Provider's business name |
| `service_type` | String | Category of service |
| `location` | String | Service location |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

### Plan Duration Mapping

| Plan | Duration |
|------|----------|
| `daily` | 1 day |
| `weekly` | 7 days |
| `monthly` | 30 days |
| `quarterly` | 90 days |
| `annual` | 365 days |

### Status Values
- `active` - Subscription is currently active
- `cancelled` - Subscription was cancelled
- `expired` - Subscription period ended

### Sample Document
```
json
{
  "_id": ObjectId("650f1b77bcf86cd799439031"),
  "customer_id": "507f1f77bcf86cd799439011",
  "service_id": "service_001",
  "provider_id": "507f1f77bcf86cd799439012",
  "plan": "monthly",
  "price": 99.99,
  "status": "active",
  "start_date": ISODate("2024-09-22T10:30:00Z"),
  "end_date": ISODate("2024-10-22T10:30:00Z"),
  "service_name": "Home Cleaning Service",
  "provider_name": "CleanPro Services",
  "service_type": "cleaning",
  "location": "Manhattan Area",
  "created_at": ISODate("2024-09-22T10:30:00Z"),
  "updated_at": ISODate("2024-09-22T10:30:00Z")
}
```

---

## 4. Payments Collection (`payments`)

### Purpose
Records all payment transactions for subscriptions and instant bookings.

### Schema
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

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key, auto-generated |
| `user_id` | String | User who made the payment |
| `provider_id` | String | Provider receiving payment |
| `customer_id` | String | Customer reference |
| `amount` | Number | Payment amount |
| `type` | String | Payment type |
| `status` | String | Payment status |
| `subscription_id` | String | Related subscription (if any) |
| `booking_id` | String | Related booking (if any) |
| `plan` | String | Subscription plan (if any) |
| `created_at` | DateTime | Payment timestamp |

### Payment Type Values
- `subscription` - Payment for subscription plan
- `instant` - Payment for one-time booking

### Payment Status Values
- `success` - Payment completed successfully
- `failed` - Payment failed
- `pending` - Payment processing

### Sample Documents

**Subscription Payment:**
```
json
{
  "_id": ObjectId("650f1c77bcf86cd799439041"),
  "user_id": "507f1f77bcf86cd799439011",
  "provider_id": "507f1f77bcf86cd799439012",
  "customer_id": "507f1f77bcf86cd799439011",
  "amount": 99.99,
  "type": "subscription",
  "status": "success",
  "subscription_id": "650f1b77bcf86cd799439031",
  "booking_id": null,
  "plan": "monthly",
  "created_at": ISODate("2024-09-22T10:35:00Z")
}
```

**Instant Booking Payment:**
```json
{
  "_id": ObjectId("650f1c77bcf86cd799439042"),
  "user_id": "507f1f77bcf86cd799439011",
  "provider_id": "507f1f77bcf86cd799439012",
  "customer_id": "507f1f77bcf86cd799439011",
  "amount": 75.00,
  "type": "instant",
  "status": "success",
  "subscription_id": null,
  "booking_id": "650f1a77bcf86cd799439021",
  "plan": null,
  "created_at": ISODate("2024-09-22T11:00:00Z")
}
```

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    Users    │       │  Instant Bookings │       │  Payments  │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ _id (PK)    │◄──────│ customer_id (FK)  │       │ _id (PK)    │
│ email       │       │ _id (PK)         │       │ user_id (FK)│
│ name        │       │ provider_id (FK) │◄──────│ provider_id │
│ role        │       │ status           │       │ booking_id  │
│ password_hash│      └──────────────────┘       │ subscription │
└─────────────┘              │                  │   _id (FK)   │
                             │                  └─────────────┘
                             ▼
                    ┌──────────────────┐
                    │  Subscriptions   │
                    ├──────────────────┤
                    │ _id (PK)         │
                    │ customer_id (FK) │
                    │ provider_id (FK) │
                    │ plan             │
                    │ status           │
                    │ start_date       │
                    │ end_date         │
                    └──────────────────┘
```

---

## MongoDB Query Examples

```
javascript
// Find all customers
db.users.find({ role: "customer" })

// Find all pending bookings
db.instant_bookings.find({ status: "pending" })

// Find active subscriptions
db.subscriptions.find({ status: "active" })

// Find payments for a specific provider
db.payments.find({ provider_id: "507f1f77bcf86cd799439012" })

// Find subscriptions by customer with active status
db.subscriptions.find({ 
  customer_id: "507f1f77bcf86cd799439011",
  status: "active" 
})
```

---

*Document generated for Local Service Subscription Platform Report*
