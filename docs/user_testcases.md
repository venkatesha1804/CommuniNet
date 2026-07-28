# User Test Cases — CommuNet Community Portal

## 1. Registration (/join)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1.1 | Empty form submission | Click Register without filling any fields | Inline errors: "Full Name is required", "Mobile Number is required", "Email is required", "Password is required" |
| 1.2 | Short name | Enter "A" as name | Error: "Full Name must be at least 2 characters" |
| 1.3 | Invalid phone | Enter "1234" as mobile | Error: "Phone number must be exactly 10 digits" |
| 1.4 | Invalid email | Enter "invalid" as email | Error: "Please enter a valid email address" |
| 1.5 | Weak password | Enter "123" as password | Error: "Password must be at least 6 characters" |
| 1.6 | Valid submission | Fill all fields correctly | Form submits, redirects to login |
| 1.7 | Error clears on input | Trigger error, then type in field | Error message disappears for that field |

## 2. Login (/login)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 2.1 | Empty phone | Submit with empty phone | Alert: "Please enter a valid 10-digit mobile number" |
| 2.2 | Short phone | Enter "12345" | Alert about 10-digit number |
| 2.3 | Empty password | Leave password blank | Alert: "Please enter your password" |
| 2.4 | Valid login | Enter valid credentials | Redirects to dashboard |

## 3. Business Add (/business/add)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 3.1 | Empty form | Submit empty | Errors on name, description, city, contact |
| 3.2 | Short name | Enter "AB" | Error: "Business Name must be at least 3 characters" |
| 3.3 | Short description | Enter < 20 chars | Error: "Description must be at least 20 characters" |
| 3.4 | Valid submission | Fill all required fields | Submits, redirects to business page |

## 4. Business Edit (/business/[id]/edit)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 4.1 | Clear required field | Clear name field, submit | Error: "Business Name is required" |
| 4.2 | Valid update | Update fields correctly | Saves and redirects |

## 5. Events Add (/events/add)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 5.1 | Empty form | Submit empty | Errors on title, date, time, location, description |
| 5.2 | Past date | Select yesterday's date | Error: "Event Date must be today or in the future" |
| 5.3 | Short description | Enter < 20 chars | Error on description field |
| 5.4 | Invalid registration URL | Enter "notaurl" with members_only audience | Error: "Please enter a valid URL" |
| 5.5 | Valid submission | Fill all fields correctly | Submits and redirects |

## 6. Events Edit (/events/[id]/edit)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 6.1 | Clear required field | Clear title, submit | Error on title |
| 6.2 | Valid update | Update and submit | Saves and redirects |

## 7. Job Post (/career/jobs/add)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 7.1 | Empty form | Submit empty | Errors on title, company, location, description |
| 7.2 | Invalid email | Enter "bad" in contact email | Error: "Please enter a valid email address" |
| 7.3 | Invalid phone | Enter "123" in contact phone | Error: 10-digit phone |
| 7.4 | Past deadline | Select past date | Error on deadline |
| 7.5 | Valid submission | Fill all correctly | Submits |

## 8. Job Edit (/career/jobs/[id]/edit)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 8.1 | Clear required field | Clear title, submit | Error on title |
| 8.2 | Valid update | Update and submit | Saves |

## 9. Scholarship Add (/career/scholarships/add)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 9.1 | Empty form | Submit empty | Errors on title, amount, eligibility, description, deadline |
| 9.2 | Invalid URL | Enter "badurl" in link | Error: valid URL required |
| 9.3 | Past deadline | Select past date | Error on deadline |
| 9.4 | Valid submission | Fill all correctly | Submits |

## 10. Scholarship Edit (/career/scholarships/[id]/edit)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 10.1 | Clear required field | Clear title, submit | Error on title |
| 10.2 | Valid update | Update and submit | Saves |

## 11. Mentorship Register (/career/mentorship/register)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 11.1 | Empty bio | Submit with empty bio | Error: "About You is required" |
| 11.2 | Short bio | Enter < 20 chars | Error: "About You must be at least 20 characters" |
| 11.3 | Valid submission | Fill bio >= 20 chars | Submits |

## 12. Mentorship Edit (/career/mentorship/[id]/edit)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 12.1 | Clear bio | Clear bio, submit | Error on bio |
| 12.2 | Valid update | Update bio, submit | Saves |

## 13. Achievement Add (/achievements/add)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 13.1 | Empty form | Submit empty | Errors on title, category, date, description |
| 13.2 | Short title | Enter "AB" | Error: "at least 3 characters" |
| 13.3 | Short description | Enter < 20 chars | Error on description |
| 13.4 | Valid submission | Fill all correctly | Submits |

## 14. Achievement Edit (/achievements/[id]/edit)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 14.1 | Clear required field | Clear title, submit | Error on title |
| 14.2 | Valid update | Update and submit | Saves |

## 15. Contact (/contact)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 15.1 | Empty form | Submit empty | Errors on name, phone, email, message |
| 15.2 | Invalid phone | Enter "123" | Error: 10-digit phone required |
| 15.3 | Invalid email | Enter "bad" | Error: valid email required |
| 15.4 | Short message | Enter < 10 chars | Error on message field |
| 15.5 | Valid submission | Fill correctly | Success alert, form resets |

## 16. Profile Edit (/profile)

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 16.1 | Clear name | Clear name, save | Error: "Full Name is required" |
| 16.2 | Short name | Enter "A" | Error: "at least 2 characters" |
| 16.3 | Invalid phone | Enter non-10-digit | Error on mobile |
| 16.4 | Long bio | Enter > 500 chars | Error on bio |
| 16.5 | Valid save | Fill correctly | Saves and exits edit mode |
| 16.6 | Numeric-only phone | Type letters in phone | Only digits accepted |
