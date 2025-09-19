# Quick User Setup Guide - OpenGrains

## 🚀 Immediate Testing (Development Mode)

The system currently uses **email pattern-based authentication** for easy testing. No database setup required!

### 1. Admin Access
**Email**: `admin@opengrains.ro` (or any email containing "admin")
**Password**: Any password
**Access**: All features including User Management

### 2. Sales Agent Access
**Email**: `agent@opengrains.ro` (or any email containing "agent")
**Password**: Any password
**Access**: Agent dashboard, supplier registration, invitation links

### 3. Back Office Access
**Email**: `backoffice@opengrains.ro` (or any email containing "backoffice" or "support")
**Password**: Any password
**Access**: Supplier validation, document review

### 4. Supplier Access
**Email**: `supplier@farm.ro` (or any other email)
**Password**: Any password
**Access**: Supplier dashboard, document upload, trading

## 📋 Testing Steps

1. **Start the application**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login as Admin**
   - Email: `admin@opengrains.ro`
   - Password: `123` (any password works)
   - You'll see: Agent + Documents + Back Office + **Admin** tabs

3. **Test User Management**
   - Go to Admin tab
   - Create new users with different roles
   - See role-based access control in action

4. **Test as Sales Agent**
   - Logout and login with: `ion.agent@opengrains.ro`
   - You'll see: Agent + Documents tabs only
   - Test supplier registration and invitation links

5. **Test as Back Office**
   - Logout and login with: `maria.backoffice@opengrains.ro`
   - You'll see: Documents + Back Office tabs only
   - Test supplier validation workflows

6. **Test as Supplier**
   - Logout and login with: `fermier@example.ro`
   - You'll see: Supplier dashboard only
   - Test document upload and profile management

## 🎯 What Each Role Can Do

### 👑 Admin (`admin@opengrains.ro`)
- ✅ **User Management**: Create/edit/delete users
- ✅ **All Agent Features**: Register suppliers, create targets
- ✅ **All Back Office Features**: Validate documents, review applications
- ✅ **System Configuration**: Manage all system settings

### 👨‍💼 Sales Agent (`agent@opengrains.ro`)
- ✅ **Supplier Registration**: Direct registration forms
- ✅ **Invitation Links**: Generate secure supplier invitation links
- ✅ **Document Viewing**: View uploaded supplier documents
- ✅ **Target Tracking**: View assigned targets and progress

### 🏢 Back Office (`backoffice@opengrains.ro`)
- ✅ **Supplier Validation**: Approve/reject supplier applications
- ✅ **Document Review**: OCR validation and document approval
- ✅ **Reports**: Generate validation and compliance reports
- ✅ **Quality Control**: Ensure data quality and compliance

### 🚜 Supplier (`supplier@farm.ro`)
- ✅ **Profile Management**: Update business information
- ✅ **Document Upload**: OCR-enabled document submission
- ✅ **Sales Offers**: Create grain sales offers (framework ready)
- ✅ **Purchase Requests**: Submit grain purchase requests (framework ready)

## 🔧 Advanced Testing Scenarios

### Scenario 1: Complete Supplier Onboarding
1. Login as **Sales Agent** (`agent@opengrains.ro`)
2. Use "Generează link de partajare" to create invitation
3. Copy the generated link
4. Open link in new browser window (simulates supplier)
5. Complete supplier registration form
6. Login as **Back Office** (`backoffice@opengrains.ro`)
7. Validate the new supplier in Back Office tab

### Scenario 2: Document Management Flow
1. Login as **Supplier** (`supplier@farm.ro`)
2. Go to Documents tab
3. Upload test documents (supports JPG, PNG, PDF)
4. Watch OCR processing simulation
5. Login as **Back Office** to review documents
6. Approve/reject documents with validation notes

### Scenario 3: Role-Based Access Testing
1. Login with different email patterns
2. Observe tab visibility changes:
   - Admin: 4 tabs (Agent, Documents, Back Office, Admin)
   - Sales Agent: 2 tabs (Agent, Documents)
   - Back Office: 2 tabs (Documents, Back Office)
   - Supplier: 1 tab (Supplier Dashboard)

## 📊 User Management Interface

### Creating New Users (Admin Only)
1. Login as admin
2. Go to Admin tab → User Management
3. Click "Create User"
4. Fill in details and select role
5. New user appears in system immediately

### User Statistics
- View total users by role
- Monitor active/inactive users
- Search and filter users
- Manage user permissions

## 🛠️ Development Features

### Mock Data Generation
The system includes realistic mock data for:
- ✅ Supplier profiles with Romanian business data
- ✅ Document uploads with OCR results
- ✅ User accounts with proper role assignments
- ✅ Trading offers and requests (framework)

### Authentication Simulation
```typescript
// Email pattern → Role assignment
'admin@...' → 'admin'
'agent@...' → 'sales_agent'
'backoffice@...' → 'back_office'
'support@...' → 'back_office'
'anything else' → 'supplier'
```

## 🎯 Next Steps

### For Production Deployment
1. **Replace mock auth** with real authentication (see `PRODUCTION_USER_SETUP.md`)
2. **Set up database** with proper user tables and RLS policies
3. **Configure email** for user invitations and notifications
4. **Add password policies** and security measures
5. **Implement audit logging** for user actions

### For Further Development
1. **Complete trading system** (sales offers/purchase requests)
2. **Add real-time notifications** for user interactions
3. **Implement email templates** for user invitations
4. **Add user profile pictures** and extended profiles
5. **Create detailed audit trails** and activity logs

## 🚨 Important Notes

- **Development Mode**: Current system is for testing only
- **No Passwords**: Any password works in development mode
- **Data Persistence**: User data stored in localStorage (browser only)
- **Email Validation**: No actual emails sent in development
- **Security**: No real security measures in development mode

For production deployment, follow the complete setup guide in `PRODUCTION_USER_SETUP.md`.