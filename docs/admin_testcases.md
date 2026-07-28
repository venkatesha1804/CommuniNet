# Admin Test Cases — CommuNet Community Portal

## 1. Admin Content Management

### 1.1 Business Management

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1.1 | View all businesses | Navigate to Admin > Businesses | List of all businesses displayed |
| 1.1.2 | Delete business | Click delete on a business | Status set to "deleted_by_admin", "Deleted by Admin" badge appears |
| 1.1.3 | Soft delete verification | Check deleted business in DB | Record exists with status "deleted_by_admin" |

### 1.2 Event Management

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.2.1 | View all events | Navigate to Admin > Events | List of all events displayed |
| 1.2.2 | Delete event | Click delete on an event | Status = "deleted_by_admin", badge shows |
| 1.2.3 | Edit event validation | Edit event with empty title | Validation errors display inline |

### 1.3 Career Management

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.3.1 | Delete job posting | Click delete on a job | Status = "deleted_by_admin" |
| 1.3.2 | Delete scholarship | Click delete on a scholarship | Status = "deleted_by_admin" |

### 1.4 Achievement Management

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.4.1 | View achievements | Navigate to Admin > Achievements | All achievements listed |
| 1.4.2 | Delete achievement | Click delete | Soft-deleted with admin badge |

## 2. Admin Form Validation (same rules as user)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | Edit business (admin) | Open business edit as admin, clear name | Validation error appears |
| 2.2 | Edit event (admin) | Open event edit as admin, set past date | Validation error: date must be in future |
| 2.3 | Edit job (admin) | Open job edit as admin, enter invalid email | Validation error on contact email |
| 2.4 | Edit scholarship (admin) | Open scholarship edit as admin, clear description | Validation error on description |

## 3. Admin Dashboard

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1 | View dashboard stats | Navigate to /admin | Dashboard shows correct counts |
| 3.2 | User management | Navigate to Admin > Users | List of all users displayed |
| 3.3 | Pending approvals | Check pending content | List of items awaiting approval |

## 4. Role-Based Access

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | Admin-only pages | Access /admin as member | Redirected/blocked |
| 4.2 | Admin-only actions | Attempt admin delete as member | Unauthorized error |
| 4.3 | Valid admin access | Login as admin, navigate to /admin | Full admin panel accessible |
