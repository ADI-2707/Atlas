# `plugins/hr`

The HR & Payroll Management plugin for the Atlas platform. It manages employee directories, departments structure, leave requests tracking, balances, and payroll execution.

- **Frontend:** React HR panel (`@atlas/plugin-hr`)
- **Backend:** NestJS Module (`apps/backend/src/plugins/hr`)
- **Data Model:** `Employee`, `Department`, `LeaveRequest`, `LeaveBalance`, `PayrollRecord`

---

## Preview

![HR Directory & Payroll Processing](../../docs/images/plugins/hr.png)
_HR management console displaying employee list and active payroll run actions in Light Mode_

---

## Core Capabilities

- **Employee Profiles:** Track basic contact records, hire date, manager hierarchy, and employment status.
- **Leave Request Cycles:** Submit and review vacation, sick, and personal leaves with automatic balances deductions.
- **Payroll Runs:** Process salary runs with calculations of taxes and basic payouts saved to `PayrollRecord` entries.

---

## Directory Structure

```
hr/
├── manifest.json      # HR permission definitions and payroll routes
├── package.json
├── backend/           # NestJS controllers and services
├── frontend/          # React HR dashboard and employee directories
└── shared/            # Common TypeScript models and helper functions
```
