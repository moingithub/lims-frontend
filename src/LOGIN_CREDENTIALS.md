# 🔐 Login Credentials for Natty Gas Lab LIMS

## Test Users for Role-Based Access Control

### 👨‍💼 Administrator Account

**Username:** `admin`  
**Password:** `admin123`

**Role:** Administrator  
**Full Name:** Admin User  
**Email:** admin@lims.com  
**Company:** N/A (System User)

**Access Level:**
- ✅ **All 19 Modules** with full permissions
- ✅ **All Data** across all companies
- ✅ Complete CRUD operations on all entities
- ✅ User management and role configuration

**What You Can Do:**
- Access every page in the system
- Manage users, roles, and permissions
- View and edit all work orders, invoices, and reports
- Configure analysis pricing
- Manage cylinder and company master data
- Generate and view all invoices
- Access all administrative functions

---

### 🔬 Employee Accounts

#### Employee 1: Lab Technician

**Username:** `labtech`  
**Password:** `tech123`

**Role:** Employee  
**Full Name:** Lab Technician  
**Email:** tech@lims.com  
**Company:** N/A (Staff Member)

**Access Level:**
- ✅ **11 Operational Modules** with full permissions
- ✅ **All Data** across all companies
- ❌ **No Access** to billing or user management

**What You Can Do:**
- ✅ Dashboard
- ✅ Cylinder Check-Out
- ✅ Sample Check-In
- ✅ Cylinder Master
- ✅ Company Master
- ✅ Contacts
- ✅ Company Areas
- ✅ Import Machine Report
- ✅ Cylinder Inventory
- ✅ Analysis Reports
- ✅ Pending Orders

**What You CANNOT Do:**
- ❌ Work Orders
- ❌ Generate Invoice
- ❌ Invoices
- ❌ Analysis Pricing
- ❌ Roles Management
- ❌ Users Management
- ❌ Modules Management
- ❌ Role Module Configuration

---

#### Employee 2: Sales Manager

**Username:** `sales`  
**Password:** `sales123`

**Role:** Employee  
**Full Name:** Sales Manager  
**Email:** sales@lims.com  
**Company:** N/A (Staff Member)

**Access Level:**
- ✅ **Same as Lab Technician** (11 operational modules)
- ✅ **All Data** across all companies
- ❌ **No Access** to billing or user management

**Purpose:** Demonstrates that multiple employees can have the same role

---

### 👤 Customer Accounts

#### Customer 1: Acme Corporation

**Username:** `customer1`  
**Password:** `customer123`

**Role:** Customer  
**Full Name:** John Doe  
**Email:** john@acme.com  
**Company:** Acme Corporation (Company ID: 1)

**Access Level:**
- ✅ **4 Modules** with read-only access
- ✅ **Own Company Data ONLY**
- ❌ **No Access** to other companies' data

**What You Can See:**
- ✅ Dashboard (own data)
- ✅ Work Orders (only Acme Corporation's orders)
- ✅ Invoices (only Acme Corporation's invoices)
- ✅ Analysis Reports (only Acme Corporation's reports)

**What You CANNOT See:**
- ❌ Any other module (15 modules blocked)
- ❌ Work orders from TechGas Inc, Industrial Co, etc.
- ❌ Other companies' invoices or reports
- ❌ Any operational, master data, or admin pages

---

#### Customer 2: TechGas Inc

**Username:** `customer2`  
**Password:** `customer123`

**Role:** Customer  
**Full Name:** Jane Smith  
**Email:** jane@techgas.com  
**Company:** TechGas Inc (Company ID: 2)

**Access Level:**
- ✅ **4 Modules** with read-only access
- ✅ **Own Company Data ONLY**
- ❌ **No Access** to other companies' data

**What You Can See:**
- ✅ Dashboard (own data)
- ✅ Work Orders (only TechGas Inc's orders)
- ✅ Invoices (only TechGas Inc's invoices)
- ✅ Analysis Reports (only TechGas Inc's reports)

**What You CANNOT See:**
- ❌ Any other module (15 modules blocked)
- ❌ Work orders from Acme Corporation, Industrial Co, etc.
- ❌ Other companies' invoices or reports
- ❌ Any operational, master data, or admin pages

**Purpose:** Demonstrates data isolation between customer accounts

---

## 📊 Quick Reference Table

| **Username** | **Password** | **Role** | **Company** | **Modules** | **Data Access** |
|-------------|-------------|----------|-------------|-------------|-----------------|
| `admin` | `admin123` | Administrator | System | 19 | All Companies |
| `labtech` | `tech123` | Employee | Staff | 11 | All Companies |
| `sales` | `sales123` | Employee | Staff | 11 | All Companies |
| `customer1` | `customer123` | Customer | Acme Corporation | 4 | Own Company Only |
| `customer2` | `customer123` | Customer | TechGas Inc | 4 | Own Company Only |

---

## 🧪 Testing Scenarios

### Test 1: Administrator Full Access
1. Login as `admin` / `admin123`
2. ✅ Verify all 19 modules visible in sidebar
3. ✅ Navigate to Work Orders - see all companies' orders
4. ✅ Navigate to Users - manage all users
5. ✅ Navigate to Role Module - configure permissions

### Test 2: Employee Limited Access
1. Login as `labtech` / `tech123`
2. ✅ Verify only 11 modules visible in sidebar
3. ✅ Navigate to Cylinder Check-Out - full access
4. ✅ Navigate to Analysis Reports - see all companies
5. ❌ Try to access Users page - should show "Access Denied"
6. ❌ Sidebar should NOT show: Work Orders, Invoices, Generate Invoice

### Test 3: Customer Data Isolation (Acme)
1. Login as `customer1` / `customer123`
2. ✅ Verify only 4 modules visible in sidebar
3. ✅ Navigate to Work Orders - see ONLY Acme Corporation orders
4. ✅ Navigate to Invoices - see ONLY Acme Corporation invoices
5. ❌ Should NOT see TechGas Inc data
6. ❌ Try to access Cylinder Check-Out - should show "Access Denied"

### Test 4: Customer Data Isolation (TechGas)
1. Login as `customer2` / `customer123`
2. ✅ Verify only 4 modules visible in sidebar
3. ✅ Navigate to Work Orders - see ONLY TechGas Inc orders
4. ✅ Navigate to Invoices - see ONLY TechGas Inc invoices
5. ❌ Should NOT see Acme Corporation data
6. ❌ Should NOT see any other company's data

### Test 5: Different Employees Same Role
1. Login as `labtech` / `tech123`
2. Note accessible modules
3. Logout
4. Login as `sales` / `sales123`
5. ✅ Verify same modules accessible
6. ✅ Confirms role-based permissions working correctly

### Test 6: Session Persistence
1. Login as any user
2. Navigate to a few pages
3. Refresh the browser (F5)
4. ✅ User should remain logged in
5. ✅ Same modules should be visible
6. ✅ Session persisted correctly

### Test 7: Logout and Security
1. Login as `admin` / `admin123`
2. Note you can see all modules
3. Click user avatar → Log Out
4. ✅ Should return to login screen
5. ✅ Session cleared
6. Login as `customer1` / `customer123`
7. ✅ Should see only 4 customer modules
8. ✅ Previous admin session completely cleared

---

## 🔒 Security Features Demonstrated

### Authentication
- ✅ Username/password required for access
- ✅ Invalid credentials rejected with error message
- ✅ Inactive users cannot login

### Authorization
- ✅ Module-level permissions enforced
- ✅ Role-based access control (RBAC)
- ✅ Route guards prevent unauthorized access
- ✅ Direct URL navigation blocked if no permission

### Data Filtering
- ✅ Customers see only their company's data
- ✅ Administrators see all data
- ✅ Employees see all data (operational access)
- ✅ Data filtered by `company_id` or `created_by`

### UI/UX
- ✅ Sidebar shows only accessible modules
- ✅ Empty sections automatically hidden
- ✅ Clear "Access Denied" messages
- ✅ User info displayed in header (name, role, company)
- ✅ No broken links or navigation dead ends

---

## 💡 Tips for Testing

### Quick Login Tip
**On Login Screen:**
- The "Username" field accepts username (not email)
- Usernames are case-sensitive (use lowercase)
- Passwords are exactly as shown above

### Viewing User Info
After logging in, click on the **user avatar** in the top-right corner to see:
- Full name
- Role
- Company (if applicable)
- Logout option

### Testing Data Filtering
To test customer data isolation:
1. Login as `admin` and note all work orders
2. Logout and login as `customer1`
3. Compare - you should see much fewer orders (only Acme's)
4. Logout and login as `customer2`
5. Compare - you should see different orders (only TechGas's)

### Testing Route Guards
To test access denial:
1. Login as `customer1`
2. Try typing `/cylinder-checkout` in the browser URL
3. You should see "Access Denied" message
4. Your role will be shown in the error message

---

## 📝 User Data Summary

### Administrator (1 user)
- **Purpose:** System administration and configuration
- **Use Case:** IT staff, system managers
- **Data Scope:** Everything

### Employees (2 users)
- **Purpose:** Lab operations and customer service
- **Use Case:** Lab technicians, sales staff, field workers
- **Data Scope:** All operational data, no billing/admin

### Customers (2 users)
- **Purpose:** View their own work orders and invoices
- **Use Case:** External clients checking order status
- **Data Scope:** Own company data only

---

## 🎯 Quick Start

**Want to see everything?**  
→ Login as: `admin` / `admin123`

**Want to see operational access?**  
→ Login as: `labtech` / `tech123`

**Want to see customer restricted view?**  
→ Login as: `customer1` / `customer123`

---

## ⚠️ Important Notes

1. **Passwords are not encrypted** in this demo (they're stored as plain text)
   - In production, use bcrypt or similar hashing
   
2. **Session stored in localStorage** for demo purposes
   - In production, use JWT tokens with HTTP-only cookies
   
3. **No "Remember Me" functionality** yet
   - Currently all sessions persist until logout
   
4. **No password reset** functionality yet
   - Would require email integration in production
   
5. **Company assignments are hardcoded** for demo
   - customer1 → Acme Corporation
   - customer2 → TechGas Inc

---

## 🚀 Ready to Test!

Pick a user from the table above and start exploring the system. Each role provides a completely different experience!

**Recommended Testing Order:**
1. Start as **Administrator** to see the full system
2. Logout and try **Employee** to see operational access
3. Logout and try **Customer** to see restricted data view
4. Compare the differences in sidebar, accessible pages, and visible data

Happy Testing! 🎉
