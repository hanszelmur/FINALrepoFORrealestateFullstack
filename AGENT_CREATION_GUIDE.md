# Agent Creation Guide

## Critical Understanding: Agent Creation Flow

**⚠️ IMPORTANT: There is NO "Add Agent" form in the admin portal UI.**

This is an intentional security design decision. Agent accounts should only be created through secure, controlled methods.

## How Agents Are Created

When your company hires a new agent, the system administrator must use ONE of the following methods:

### Method 1: CLI Script (Recommended) ⭐

This is the easiest and most secure method for creating new agents.

**Step 1:** Navigate to the project directory
```bash
cd /home/runner/work/FINALrepoFORrealestateFullstack/FINALrepoFORrealestateFullstack
```

**Step 2:** Run the add-agent script
```bash
npm run add-agent
```

**Step 3:** Follow the interactive prompts
```
Full Name: Maria Santos
Email: maria.santos@tesproperty.com
Password (min 8 characters): SecurePass123!
Phone (+639XXXXXXXXX or 09XXXXXXXXX): +639171234567
```

**Step 4:** The script will:
- Validate all inputs
- Hash the password with bcrypt (10 rounds)
- Insert the agent into the database
- Display the credentials for HR to provide to the new employee

**Output Example:**
```
✅ Agent account created successfully!

==================================================
Agent Credentials (save these securely):
==================================================
Name:     Maria Santos
Email:    maria.santos@tesproperty.com
Password: SecurePass123!
Phone:    +639171234567
User ID:  7
==================================================

📝 Please provide these credentials to the new agent.
⚠️  The agent should change their password on first login.
```

### Method 2: Direct SQL Insert

For advanced administrators who prefer direct database access:

**Step 1:** Generate a bcrypt hash for the password
```bash
# Using Node.js REPL
node
> const bcrypt = require('bcrypt');
> bcrypt.hashSync('YourPassword123', 10);
'$2b$10$abc123...'
```

**Step 2:** Insert directly into the database
```sql
INSERT INTO users (email, password_hash, full_name, role, phone, status)
VALUES (
    'newagent@tesproperty.com',
    '$2b$10$abc123...',  -- Replace with actual hash
    'Agent Name',
    'agent',
    '+639171234567',
    'active'
);
```

**⚠️ Warning:** 
- Always use bcrypt with 10 rounds minimum
- Never insert plain text passwords
- Verify the hash before insertion

### Method 3: Protected API Endpoint (Optional - For HR System Integrations)

This method is ONLY for automated HR system integrations, NOT for web UI access.

**Endpoint:** `POST /api/admin/agents`

**Requirements:**
- Admin JWT token
- Environment variable secret (X-Admin-Secret header)
- NOT accessible from web UI

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin/agents \
  -H "Authorization: Bearer [admin_jwt_token]" \
  -H "X-Admin-Secret: [ADMIN_API_SECRET from .env]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@tesproperty.com",
    "password": "SecurePass123!",
    "full_name": "New Agent",
    "phone": "+639171234567"
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 7,
    "email": "agent@tesproperty.com",
    "full_name": "New Agent",
    "role": "agent",
    "phone": "+639171234567"
  }
}
```

**Security Notes:**
- This endpoint requires BOTH admin JWT AND environment secret
- The secret must be stored in `.env` file: `ADMIN_API_SECRET=your_secret_here`
- Never expose this secret in client-side code
- Log all API agent creations for audit purposes

## Admin Portal Capabilities

The admin can perform these actions on existing agents:

### ✅ What Admins CAN Do:
- View all agents and their statistics
- View agent performance metrics
- Deactivate agents (soft delete)
- Reactivate agents
- Reset agent passwords
- Assign inquiries to agents
- Reassign inquiries between agents

### ❌ What Admins CANNOT Do:
- Create new agents through web UI (no form, no button)
- Delete agents permanently (only deactivate)

## Why No UI Form?

**Security Reasons:**
1. **Prevents unauthorized access:** If an attacker gains admin access, they cannot create rogue agents
2. **Audit trail:** CLI/SQL methods require server access, creating better audit logs
3. **HR integration:** Forces proper onboarding through HR systems
4. **Reduces attack surface:** No web endpoint that could be exploited

**Best Practices:**
1. Only system administrators should have server access
2. HR should request agent creation through official channels
3. All agent creations should be logged and reviewed
4. Agents should change their password on first login

## Troubleshooting

### "User with this email already exists"
- Check if the email is already in the database
- Use a different email address
- If the agent left and returned, reactivate their old account instead

### "Invalid phone format"
- Use Philippine format: +639XXXXXXXXX or 09XXXXXXXXX
- Example: +639171234567 or 09171234567

### "Password must be at least 8 characters"
- Use strong passwords with mix of letters, numbers, symbols
- Recommend 12+ characters for production

### Script won't run
```bash
# Ensure ts-node is installed
npm install ts-node --save-dev

# Ensure database is running
mysql -u root -p -e "SHOW DATABASES;"

# Check .env file exists with correct credentials
cat .env
```

## Production Deployment Notes

1. **Restrict server access:** Only trusted administrators should access production servers
2. **Secure .env file:** Protect environment variables (JWT_SECRET, DB credentials, ADMIN_API_SECRET)
3. **Log all creations:** Monitor who creates agents and when
4. **Regular audits:** Review agent list periodically for unauthorized accounts
5. **Disable Method 3:** If not using HR integration, comment out the API endpoint

## Support

For questions about agent creation:
- Contact your system administrator
- Review this guide thoroughly
- Check database logs for any errors

---

**Last Updated:** December 2025
