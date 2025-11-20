Prediction Markets – Backend MVP

A lightweight, internal-use prediction market engine designed to let small teams experiment with creating, trading, and resolving markets using LMSR-based automated pricing. This MVP is intended for a dev-only, bare-bones environment, powering an eventual production-grade enterprise internal tool.

⸻

🎯 Purpose of the Project

The goal is to recreate the core mechanics behind platforms like Polymarket or Manifold, but optimized for internal decision-making inside companies.
Teams will be able to:
	•	Create markets about uncertain outcomes
	•	Trade YES/NO shares using play-money balances
	•	View continuously updated probabilistic prices
	•	Resolve markets once outcomes are known
	•	Reward accuracy and facilitate better forecasting

This backend MVP exists to give the business team and engineering team a complete working foundation before adding corporate features (SSO, audit logs, role systems, multi-tenant orgs, etc.).

⸻

⚙️ What the Backend Currently Does

The backend is a fully functional TypeScript ESM server that implements:

✔️ Authentication
	•	Register
	•	Login
	•	JWT-based session handling
	•	Auth middleware (extracts and validates token → attaches req.userId)
	•	Get current user (/auth/me)

✔️ Market Management
	•	Create a new prediction market
	•	List all markets
	•	Fetch a single market by ID
	•	Resolve a market with “yes” or “no”

✔️ LMSR Automated Market Maker
	•	Real LMSR cost function
	•	Buys update yesShares or noShares
	•	Prices dynamically increase as shares are purchased
	•	Trades create individual Trade records
	•	Balance updates & validation
	•	Full error handling

✔️ Prisma-Managed PostgreSQL Database

Schema includes:

User
	•	id, email, password (hashed)
	•	balance
	•	trades relationship

Market
	•	title, description
	•	yesShares, noShares
	•	status (open, closed, resolved)
	•	resolution
	•	trades relationship

Trade
	•	userId, marketId
	•	outcome (“yes”/“no”)
	•	shares, cost

A real database, managed through Prisma migrations, stores all users, markets, and trades.

⸻

🧱 Tech Stack (Accurate to the Current Project)

Backend
	•	Node.js (ESM)
	•	Express (routing, JSON handling)
	•	TypeScript (strict mode)
	•	TSX (dev runner)
	•	Prisma ORM (PostgreSQL)
	•	bcryptjs (password hashing)
	•	jsonwebtoken (JWT auth)
	•	Zod (future-proof validation)
	•	dotenv (environment variables)

Database
	•	PostgreSQL (via Prisma)
	•	Auto-generated Prisma Client

Auth
	•	Email/password
	•	JWT with expiry
	•	Middleware-protected routes

AMM (Automated Market Maker)
	•	LMSR cost function implemented manually
	•	Liquidity parameter B = 20

⸻

📁 Project Structure

backend/
│  package.json
│  tsconfig.json
│  prisma.config.ts
│  .env
│
├─ prisma/
│   ├─ schema.prisma
│   └─ migrations/     # auto-generated when running migrate dev
│
├─ src/
│   │  app.ts          # Express app setup (middleware + routes)
│   │  server.ts       # Server entrypoint
│
│   ├─ routes/
│   │   auth.ts        # /auth/*
│   │   market.ts      # /market/*
│   │   trade.ts       # /trade/*
│
│   ├─ controllers/
│   │   authController.ts
│   │   marketController.ts
│   │   tradeController.ts
│
│   ├─ middleware/
│   │   authMiddleware.ts
│
│   ├─ services/
│   │   └─ lmsr/
│   │         calcCost.ts   # LMSR cost calculation
│
│   └─ utils/
│       prisma.ts     # Prisma client singleton


⸻

🚀 Current Capabilities (Summary)

The backend already fully supports:
	•	Account registration
	•	Account login
	•	Persistent user sessions via JWT
	•	Creating prediction markets
	•	Viewing existing markets
	•	Viewing a single market
	•	Trading YES/NO shares
	•	Dynamic LMSR pricing
	•	Balance checks & updates
	•	Recording trades in the database
	•	Resolving markets as “yes” or “no”

What it does NOT include yet (planned for enterprise version):
	•	SSO (Google / Azure / Okta)
	•	Team/org accounts
	•	Market categories / permissions
	•	Real-money rails
	•	Audit logging
	•	Notifications
	•	Admin dashboards
	•	Multi-tenant design

⸻

🧩 Next Step

The backend is now stable and complete for the internal developer MVP.
The remaining component is the simple frontend UI to interact with:
	•	Login/register
	•	Market list
	•	Market detail + trading UI
	•	Create market
	•	Resolve market

Once that frontend is built, you will have an end-to-end working internal prediction market system.