# 🔐 Email & Password Login Credentials

## You can login with EITHER Username OR Email Address

---

## 👨‍💼 ADMINISTRATOR (Full System Access - All 19 Modules)

### Option 1: Username Login
- **Email/Username:** `admin`
- **Password:** `admin123`

### Option 2: Email Login
- **Email/Username:** `admin@lims.com`
- **Password:** `admin123`

**What you'll see:** All 19 modules, all company data

---

## 🔬 EMPLOYEE (Operational Access - 11 Modules)

### Employee #1 - Lab Technician

#### Option 1: Username Login
- **Email/Username:** `labtech`
- **Password:** `tech123`

#### Option 2: Email Login
- **Email/Username:** `tech@lims.com`
- **Password:** `tech123`

**What you'll see:** 11 operational modules, all company data, no billing/admin

---

### Employee #2 - Sales Manager

#### Option 1: Username Login
- **Email/Username:** `sales`
- **Password:** `sales123`

#### Option 2: Email Login
- **Email/Username:** `sales@lims.com`
- **Password:** `sales123`

**What you'll see:** Same as Lab Technician (11 modules)

---

## 👤 CUSTOMER (Restricted Access - 4 Modules, Own Data Only)

### Customer #1 - Acme Corporation

#### Option 1: Username Login
- **Email/Username:** `customer1`
- **Password:** `customer123`

#### Option 2: Email Login
- **Email/Username:** `john@acme.com`
- **Password:** `customer123`

**What you'll see:** Only 4 modules, only Acme Corporation's data

---

### Customer #2 - TechGas Inc

#### Option 1: Username Login
- **Email/Username:** `customer2`
- **Password:** `customer123`

#### Option 2: Email Login
- **Email/Username:** `jane@techgas.com`
- **Password:** `customer123`

**What you'll see:** Only 4 modules, only TechGas Inc's data

---

## 📊 Quick Reference Table

| **Role** | **Email Address** | **Username** | **Password** |
|----------|------------------|--------------|--------------|
| **Administrator** | admin@lims.com | admin | admin123 |
| **Employee (Lab)** | tech@lims.com | labtech | tech123 |
| **Employee (Sales)** | sales@lims.com | sales | sales123 |
| **Customer (Acme)** | john@acme.com | customer1 | customer123 |
| **Customer (TechGas)** | jane@techgas.com | customer2 | customer123 |

---

## 💡 Login Instructions

1. Go to the login page
2. In the **"Username or Email Address"** field, enter EITHER:
   - The username (e.g., `admin`)
   - OR the email address (e.g., `admin@lims.com`)
3. Enter the password
4. Click **Sign In**

**Both methods work!** Choose whichever you prefer.

---

## 🎯 Recommended Testing Order

### Step 1: Test as Administrator
**Login with:** `admin@lims.com` / `admin123`  
**or:** `admin` / `admin123`

✅ You should see all 19 modules in the sidebar

---

### Step 2: Test as Employee
**Login with:** `tech@lims.com` / `tech123`  
**or:** `labtech` / `tech123`

✅ You should see only 11 modules  
❌ No Work Orders, Invoices, or User Management sections

---

### Step 3: Test as Customer
**Login with:** `john@acme.com` / `customer123`  
**or:** `customer1` / `customer123`

✅ You should see only 4 modules  
✅ Work Orders show only Acme Corporation's orders  
❌ Cannot see other companies' data

---

## ✨ The Login Form Shows These Credentials Too!

When you reach the login page, you'll see helpful credential hints right on the form:

- **Blue Box:** Administrator credentials
- **Green Box:** Employee credentials  
- **Purple Box:** Customer credentials

Just copy and paste from there!

---

## 🔒 Security Note

⚠️ **These are DEMO credentials only**

In a production system:
- Passwords would be encrypted (bcrypt/argon2)
- Would use JWT tokens
- Would have password reset via email
- Would enforce password complexity rules
- Would have multi-factor authentication

---

## Need Help?

If you have any issues logging in:
1. Make sure you're using the exact username/email and password
2. Usernames are case-sensitive (use lowercase)
3. Try using the email address instead of username
4. Check the credential hints on the login form itself

Happy Testing! 🎉
