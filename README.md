# RoomiQ — Intelligent Shared Living Management Platform

**Group Members:**
- Fahmida Afrin (ID: [Student ID])
- Sumit Ghosh (ID: [Student ID])
- Rizvi Iqbal (ID: [Student ID])
- Tawsif Kabir Pritom (ID: [Student ID])

## Project Description

A full-stack MERN application built on MVC architecture for managing shared housing — finances, chores, house rules, complaints, shopping, maintenance, and roommate compatibility. The primary goal of this application is to facilitate a seamless co-living experience, enabling roommates to organize expenses, chores, rules, and resolve conflicts—all while ensuring transparency and fairness.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React + Vite + React Router         |
| Backend   | Node.js + Express                   |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (JSON Web Tokens)               |
| Real-time | Socket.io                           |
| Scheduler | node-cron (chore rotation, recurring expenses) |

---

## MVC Architecture

```
server/
├── models/          ← M: Mongoose schemas (data layer)
├── controllers/     ← C: Business logic
├── routes/          ← C: Route definitions mapping HTTP → controllers
client/src/
├── pages/           ← V: Full page views
└── components/      ← V: Reusable UI components
```

---

## Project Structure

```
roomiq/
├── package.json              # Root - runs client + server concurrently
├── server/
│   ├── index.js              # Entry point
│   ├── massive-seed.js       # Database seeder
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   ├── Activity.js       # Activity feed items
│   │   ├── Chore.js          # Chores + rotation + disputes
│   │   ├── Complaint.js      # Complaints + mediation votes
│   │   ├── Expense.js        # Expenses + splits + payment requests
│   │   ├── House.js          # House + members
│   │   ├── Maintenance.js    # Maintenance requests + status history
│   │   ├── Message.js        # Chat messages
│   │   ├── Notice.js         # Noticeboard posts
│   │   ├── Rule.js           # House rules + voting
│   │   ├── Shopping.js       # Shopping list + inventory
│   │   └── User.js           # User + compatibility profile
│   ├── controllers/
│   │   ├── activityController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── choreController.js
│   │   ├── complaintController.js
│   │   ├── dashboardController.js
│   │   ├── expenseController.js
│   │   ├── houseController.js
│   │   ├── maintenanceController.js
│   │   ├── matchingController.js
│   │   ├── noticeboardController.js
│   │   ├── ruleController.js
│   │   └── shoppingController.js
│   ├── routes/               # One route file per domain
│   ├── middleware/
│   │   └── authMiddleware.js # protect, requireHouseMember, requireHouseAdmin
│   ├── socket/
│   │   └── index.js          # Socket.io — real-time house room events
│   └── utils/
│       ├── activityLogger.js
│       ├── balanceCalculator.js       # Debt calculation and simplification
│       ├── compatibilityAlgorithm.js  # Weighted scoring algorithm
│       ├── cronJobs.js                # Chore rotation + recurring expenses
│       ├── generateInviteCode.js
│       └── generateToken.js
└── client/
    └── src/
        ├── pages/
        ├── components/
        │   ├── chores/
        │   ├── complaints/
        │   ├── finance/
        │   ├── layout/
        │   ├── maintenance/
        │   ├── noticeboard/
        │   ├── rules/
        │   ├── shopping/
        │   └── ui/
        ├── context/
        ├── hooks/
        ├── services/
        └── utils/
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone and install

```bash
git clone <https://github.com/RizviIqbal/roomiq>
cd roomiq
npm run install-all
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
```

### 3. Seed the database

```bash
cd server
node massive-seed.js
```

This creates 5 test users in a fully populated main house, plus 15 free agents and 9 other generated houses.

### 4. Run the project

```bash
# From root
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

---

## Test Accounts (after seeding)

| Name   | Email             | Role   | Password     |
|--------|-------------------|--------|--------------|
| Rafiq  | rafiq@test.com    | Admin  | password123  |
| Aisha  | aisha@test.com    | Member | password123  |
| Farhan | farhan@test.com   | Member | password123  |
| Zara   | zara@test.com     | Member | password123  |
| Kamil  | kamil@test.com    | Member | password123  |

**House Invite Code:** `RAFIQ123`

---

## API Reference

### Auth
| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| POST   | /api/auth/register      | Register new user            |
| POST   | /api/auth/login         | Login                        |
| GET    | /api/auth/me            | Get current user             |
| PUT    | /api/auth/me            | Update profile               |
| PUT    | /api/auth/compatibility | Save compatibility quiz      |

### House
| Method | Endpoint                              | Description          |
|--------|---------------------------------------|----------------------|
| POST   | /api/houses                           | Create house         |
| POST   | /api/houses/join                      | Join via invite code |
| GET    | /api/houses/:houseId                  | Get house details    |
| PUT    | /api/houses/:houseId                  | Update house (admin) |
| DELETE | /api/houses/:houseId/members/:userId  | Remove member        |
| POST   | /api/houses/:houseId/leave            | Leave house          |
| PUT    | /api/houses/:houseId/transfer-admin   | Transfer admin role  |

### Matching
| Method | Endpoint                            | Description                   |
|--------|-------------------------------------|-------------------------------|
| GET    | /api/matching/house/:houseId        | Scores vs all housemates      |
| GET    | /api/matching/house/:houseId/summary| Overall house compatibility   |
| GET    | /api/matching/compare/:userId       | Score vs specific user        |

### Expenses
| Method | Endpoint                                | Description              |
|--------|-----------------------------------------|--------------------------|
| POST   | /api/expenses                           | Add expense              |
| GET    | /api/expenses/house/:houseId            | Get house expenses       |
| GET    | /api/expenses/house/:houseId/balances   | Who owes whom            |
| PUT    | /api/expenses/:id/pay                   | Mark my share as paid    |
| POST   | /api/expenses/:id/request-payment       | Request payment          |
| DELETE | /api/expenses/:id                       | Delete expense           |

### Chores
| Method | Endpoint                             | Description               |
|--------|--------------------------------------|---------------------------|
| POST   | /api/chores                          | Create chore              |
| GET    | /api/chores/house/:houseId           | Get all chores            |
| GET    | /api/chores/house/:houseId/history   | Completion history        |
| PUT    | /api/chores/:id/done                 | Mark done                 |
| POST   | /api/chores/:id/dispute              | Raise dispute             |
| PUT    | /api/chores/:id/dispute/resolve      | Resolve dispute           |

### Rules
| Method | Endpoint                    | Description         |
|--------|-----------------------------|---------------------|
| POST   | /api/rules                  | Propose rule        |
| GET    | /api/rules/house/:houseId   | Get house rules     |
| POST   | /api/rules/:id/vote         | Vote on rule        |
| PUT    | /api/rules/:id/finalize     | Finalize voting     |
| DELETE | /api/rules/:id              | Delete rule         |

### Complaints
| Method | Endpoint                               | Description          |
|--------|----------------------------------------|----------------------|
| POST   | /api/complaints                        | File complaint       |
| GET    | /api/complaints/house/:houseId         | Get complaints       |
| GET    | /api/complaints/house/:houseId/offenders | Repeat offenders   |
| POST   | /api/complaints/:id/vote               | Mediation vote       |
| PUT    | /api/complaints/:id/resolve            | Resolve complaint    |

### Shopping
| Method | Endpoint                                  | Description           |
|--------|-------------------------------------------|-----------------------|
| POST   | /api/shopping/list                        | Add to shopping list  |
| GET    | /api/shopping/list/:houseId               | Get shopping list     |
| PUT    | /api/shopping/list/:id/bought             | Mark as bought        |
| DELETE | /api/shopping/list/:id                    | Remove from list      |
| POST   | /api/shopping/inventory                   | Add inventory item    |
| GET    | /api/shopping/inventory/:houseId          | Get inventory         |
| GET    | /api/shopping/inventory/:houseId/low-stock| Low stock items       |
| PUT    | /api/shopping/inventory/:id               | Update quantity       |

### Maintenance
| Method | Endpoint                          | Description          |
|--------|-----------------------------------|----------------------|
| POST   | /api/maintenance                  | Report issue         |
| GET    | /api/maintenance/house/:houseId   | Get house issues     |
| PUT    | /api/maintenance/:id/status       | Update status        |
| DELETE | /api/maintenance/:id              | Delete issue         |

### Noticeboard
| Method | Endpoint                          | Description      |
|--------|-----------------------------------|------------------|
| POST   | /api/noticeboard                  | Post notice      |
| GET    | /api/noticeboard/house/:houseId   | Get notices      |
| PUT    | /api/noticeboard/:id/pin          | Toggle pin       |
| DELETE | /api/noticeboard/:id              | Delete notice    |

---

## Core Features (20 total)

### Financial & Expense Management
1. **Dynamic Expense Splitting Engine:** Real-time percentage/custom splits for shared expenses.
2. **Automated Debt Calculation & Settlement:** Graph-based debt matrix reducing millions of micro-debts.
3. **Recurring Bill Management:** Automated monthly expense generation via Node Cron jobs.
4. **Shared Shopping List to Expense Pipeline:** WebSockets-synced collaborative list with automated conversion to expense.
5. **Financial Reporting & Ledger:** Advanced MongoDB aggregations for historic spending trends and immutable ledgers.

### Chore & Maintenance Management
6. **Recurring Chore Assignment & Scheduling:** Custom calendar-based temporal task tracking.
7. **Algorithmic Chore Rotation:** Round-robin intelligent assignment handling edge cases dynamically.
8. **Gamified Chore Point System:** Time-sensitive event-driven competitive ranking leaderboard.
9. **Maintenance Ticketing System:** Multipart data handling for secure photo evidence uploads via Multer.
10. **Ticket Resolution to Expense Integration:** Complex state machine automatically feeding resolved damages into the finance engine.

### Roommate Matching & Onboarding
11. **Dynamic Lifestyle Profile Creation:** Highly flexible non-relational document schema for complex user profiles.
12. **Compatibility Quiz Engine:** Immediate mathematical scoring engine applying custom behavioral weights.
13. **Matching & Recommendation Algorithm:** Euclidean distance calculation vectoring users for prioritized recommendations.
14. **Roommate Request Workflow:** Robust state machine preventing double-joins and managing strict business rules.
15. **Pre-Match Communication Portal:** Bi-directional WebSockets implementing real-time 1-on-1 messaging for safe pre-match talks.

### House Rules, Setup & Communication
16. **House Creation & Role Management:** Cryptographic invite links with strict Role-Based Access Control (RBAC).
17. **Collaborative House Rules Engine:** Dynamic consensus polling algorithm adapting to active member counts.
18. **Interactive House Noticeboard:** Deeply nested relational schema for endless comment threads.
19. **Anonymous Complaint & Moderation System:** Data masking logic securely protecting user privacy against admins.
20. **Personalized Aggregated Dashboard:** Unified parallel-query endpoint synthesizing multi-collection states for a snappy UX.

---

## Compatibility Algorithm

The matching algorithm uses **weighted trait scoring** — not a simple average. Each trait is weighted by its real-world impact on cohabitation:

| Trait             | Weight | Rationale                          |
|-------------------|--------|------------------------------------|
| Sleep schedule    | 25%    | Daily friction, hardest to change  |
| Cleanliness level | 20%    | Top source of roommate conflict    |
| Noise tolerance   | 15%    | Directly affects sleep and study   |
| Guest policy      | 15%    | Privacy and comfort                |
| Smoking policy    | 10%    | Hard constraint for many           |
| Pet policy        | 8%     | Allergy and comfort constraint     |
| Study habits      | 5%     | Flexible, schedule-dependent       |
| Food sharing      | 2%     | Easily negotiated verbally         |

Score ranges: 0-39 Poor | 40-59 Moderate | 60-79 Good | 80-100 Excellent

---

## Testing

Backend unit tests cover the pure-logic utilities (no database required):

```bash
cd server
npm test
```

Covers:
- `compatibilityAlgorithm.js` — weighted scoring, hard constraints (smoking/pets), label thresholds, symmetry
- `balanceCalculator.js` — debt calculation from expenses, debt simplification (greedy settlement, reduces transaction count)
- `generateInviteCode.js` — format and uniqueness

25 tests, all passing.

---

## Real-time Updates (Socket.io)

The frontend connects to Socket.io on login and joins a room scoped to the user's house (`house_<id>`). All mutating actions emit events that other connected roommates receive instantly — no page refresh needed.

| Event                | Triggered by                          | Frontend behavior                          |
|----------------------|----------------------------------------|---------------------------------------------|
| `expense_added`      | New expense created                    | Refreshes finance page + dashboard          |
| `expense_updated`    | Share marked paid                      | Refreshes finance page + dashboard          |
| `expense_deleted`    | Expense deleted                        | Refreshes finance page + dashboard          |
| `payment_requested`  | Payer requests payment from a roommate | Toast notification to the targeted user     |
| `chore_updated`      | Chore created/done/disputed/resolved   | Refreshes chores page + dashboard           |
| `rule_updated`       | Rule proposed/voted/finalized          | Refreshes rules page                        |
| `complaint_updated`  | Complaint filed/voted/resolved         | Refreshes complaints page                   |
| `shopping_updated`   | Shopping list item added/bought        | Refreshes shopping page                     |
| `inventory_updated`  | Inventory restocked                    | Refreshes shopping page + dashboard         |
| `low_stock_alert`    | Item drops to/below threshold          | Toast warning on shopping page              |
| `maintenance_updated`| Issue reported/status changed          | Refreshes maintenance page + dashboard      |
| `notice_posted`      | New noticeboard post                   | Refreshes noticeboard + toast for others    |

---

## Profile Page

Accessible by clicking your name/avatar in the sidebar footer. Allows editing name, phone, bio, and avatar URL, shows compatibility quiz status with a retake link, and provides sign-out.
