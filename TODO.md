# TODO - Subscription Selection Updates

## Tasks:
- [ ] 1. Update mockData.ts - Change Subscription interface plan type from 'monthly' | 'quarterly' | 'annual' to 'daily' | 'weekly' | 'monthly'
- [ ] 2. Update Payment.tsx - Fix end date calculation to handle 'daily' and 'weekly' plans instead of 'quarterly' and 'annual'
- [ ] 3. Update SubscriptionSelection.tsx - Add a dropdown with 2-3 real customer names in the subscription summary section

## Notes:
- The subscription plans in SubscriptionSelection.tsx are already daily/weekly/monthly - no changes needed there
- Need to update Payment.tsx to handle the new plan types for date calculation
- Adding customer dropdown in SubscriptionSelection.tsx for selecting who the subscription is for
