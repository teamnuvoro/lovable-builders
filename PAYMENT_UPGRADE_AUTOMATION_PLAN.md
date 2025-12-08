# Payment Upgrade Automation Plan

## Problem
Users complete payment but premium status isn't automatically updated, blocking chat access.

## Root Cause Analysis
1. Payment verification endpoint updates user, but may fail silently
2. Webhook handler exists but may not be triggered reliably
3. No database-level automation to ensure upgrade happens
4. Frontend may not refresh user data immediately

## Solution: Multi-Layer Automation

### Layer 1: Database Triggers (Primary - Most Reliable)
**Purpose**: Automatically upgrade users at database level when payment/subscription changes

**Implementation**:
1. Create trigger on `subscriptions` table - when status = 'active', upgrade user
2. Create trigger on `payments` table - when status = 'success', upgrade user
3. Create function to calculate expiry date based on plan_type
4. Ensure idempotency (safe to run multiple times)

### Layer 2: Improved Webhook Handler
**Purpose**: Handle Cashfree webhook notifications reliably

**Improvements**:
1. Better error handling and logging
2. Retry logic for failed updates
3. Update subscription AND user in same transaction
4. Set proper expiry dates

### Layer 3: Enhanced Payment Verification
**Purpose**: Ensure verification endpoint is bulletproof

**Improvements**:
1. Check multiple sources (subscription status, payment status, Cashfree API)
2. Update user even if subscription already active
3. Better error messages and logging

### Layer 4: Manual Fix Function
**Purpose**: Fix existing users who paid but weren't upgraded

**Implementation**:
1. Database function to upgrade users with active subscriptions
2. API endpoint to trigger manual upgrade check
3. Admin tool to fix specific users

## Implementation Steps

### Step 1: Create Database Functions & Triggers
- Function: `upgrade_user_to_premium(user_id, plan_type)`
- Trigger: On `subscriptions.status` change to 'active'
- Trigger: On `payments.status` change to 'success'
- Function: `fix_all_paid_users()` - manual fix for existing users

### Step 2: Improve Webhook Handler
- Add transaction support
- Better error handling
- Logging improvements

### Step 3: Improve Payment Verification
- Check subscription status first
- Fallback to Cashfree API
- Update user regardless of source

### Step 4: Add Manual Fix Endpoint
- `/api/payment/fix-user` - fix specific user
- `/api/payment/fix-all` - fix all users with active subscriptions

## Testing Strategy
1. Test trigger fires on subscription status change
2. Test trigger fires on payment status change
3. Test webhook handler with mock data
4. Test manual fix functions
5. Test end-to-end payment flow

## Rollout Plan
1. Deploy database functions/triggers (non-breaking)
2. Deploy improved webhook handler
3. Deploy improved verification endpoint
4. Run manual fix function for existing users
5. Monitor and verify

