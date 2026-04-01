# CalorieIQ

A production-ready meal calorie lookup app built with Next.js 16 App Router. Search any dish to get calories, macronutrients, and ingredient breakdowns sourced from the USDA FoodData Central database.

## Features

- Dish calorie and macro lookup with progress bars (% daily value)
- Autocomplete suggestions for popular dishes
- Per-serving and total macronutrient toggle
- Ingredient breakdown with per-100g nutrition data
- Search history with pagination on the dashboard
- Rate limit countdown (429 handling)
- JWT-based auth with Zustand persistence
- Dark / light / system theme
- Fully responsive

## Tech Stack

- **Framework** — Next.js 16.2 (App Router)
- **Styling** — Tailwind CSS v4 + shadcn/ui
- **State** — Zustand v5 with localStorage persistence
- **Forms** — react-hook-form + Zod v4
- **Testing** — Vitest + Testing Library

---

## Local Development

### 1. Prerequisites

- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`

### 2. Clone and install

```bash
git clone <repo-url>
cd meal-calorie-frontend-akash
pnpm install
```

### 3. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the value:

```env
NEXT_PUBLIC_API_BASE_URL=https://xpcc.devb.zeak.io
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Base URL for the Meal Calorie API |

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Docker

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Setup

Create a `.env` file in the project root (Docker Compose reads this automatically):

```bash
cp .env.example .env
```

Fill in the same value:

```env
NEXT_PUBLIC_API_BASE_URL=https://xpcc.devb.zeak.io
```

### Run

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

The API URL is injected as a Docker build argument so Next.js can inline it at build time.

---

## Testing

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
```

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── dashboard/        # Search history and stats
│   ├── calories/         # Dish lookup
│   ├── login/
│   └── register/
├── components/
│   ├── ui/               # shadcn/ui primitives
│   ├── AuthForm.tsx
│   ├── MealForm.tsx
│   ├── ResultCard.tsx
│   ├── DishAutocomplete.tsx
│   └── Header.tsx
├── hooks/
│   └── useAuthGuard.ts   # Redirect if unauthenticated
├── lib/
│   ├── api.ts            # Fetch utility, auth, rate limit handling
│   └── validations.ts    # Zod schemas
├── stores/
│   ├── authStore.ts      # JWT + user, persisted
│   └── mealStore.ts      # Search history, persisted
└── types/
    └── index.ts
```

---

## API Error Handling

| Status | Behaviour |
|---|---|
| 400 | Field-level error on servings input |
| 401 | Redirect to /login |
| 403 | Clear auth state, redirect to /login |
| 404 | Alert — dish not found |
| 422 | Alert — food found but no nutrition data |
| 429 | Alert with live countdown until retry |
| 500 | Generic server error alert |
