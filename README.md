<div align="center">

<h1>🍽️ MealMate AI</h1>

<p><strong>AI-powered meal tracking & calorie estimation for a healthier you.</strong></p>

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=lightning&logoColor=white)

</div>

---

## 📱 Overview

**MealMate AI** is a cross-platform mobile application built with React Native and Expo that leverages AI to estimate meal calories from a text description or a photo. It tracks your daily nutritional intake, computes your BMI and BMR from a personalized onboarding flow, and displays your history — all backed by a real-time Supabase database.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Meal Estimation** | Describe a meal in text or snap a photo — Groq's LLM estimates calories, protein, carbs & fat instantly |
| 🔐 **Authentication** | Email/password sign-up with 6-digit OTP email verification and forgot-password flow |
| 🧭 **Smart Onboarding** | 6-step questionnaire capturing name, age, gender, weight (kg/lbs), height (cm/ft/in), and daily calorie goal with live BMI & BMR calculation |
| 📊 **Dashboard** | Animated calorie ring, live macro totals, dynamic AI suggestions based on your intake |
| 📅 **Meal History** | Day & week views with real bar charts, grouped by date with daily calorie totals |
| 👤 **Profile** | Edit weight, height, and daily goal — synced to Supabase with per-user row-level security |
| 🎬 **Animated Splash** | Smooth logo spring-in animation on every app launch |

---

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) + [Expo SDK 52](https://expo.dev/)
- **Navigation:** [Expo Router v4](https://expo.github.io/router/) (file-based routing)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend & Auth:** [Supabase](https://supabase.com/) (Postgres + Row Level Security)
- **AI Provider:** [Groq](https://groq.com/) — `llama-3.1-8b-instant` (text) + `meta-llama/llama-4-scout-17b-16e-instruct` (vision)
- **Language:** TypeScript

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- An [Expo Go](https://expo.dev/client) app on your device (for development)
- A [Supabase](https://supabase.com/) project
- A free [Groq](https://console.groq.com/) API key

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/afaqabid/MealMateAI.git
cd MealMateAI

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Edit `.env` with your keys:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key
```

### Database Setup

Run the following SQL in **Supabase → SQL Editor**:

```sql
-- Meals table
create table meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  kcal integer not null,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  eaten_at timestamptz not null default now()
);
alter table meals enable row level security;
create policy "meals_insert" on meals for insert with check (auth.uid() = user_id);
create policy "meals_select" on meals for select using (auth.uid() = user_id);

-- User profiles table
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  weight numeric default 70,
  height numeric default 170,
  daily_goal integer default 2000,
  unit text default 'kg',
  age integer,
  gender text default 'Male',
  setup_complete boolean default false,
  updated_at timestamptz default now()
);
alter table user_profiles enable row level security;
create policy "profiles_select" on user_profiles for select using (auth.uid() = id);
create policy "profiles_insert" on user_profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on user_profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Run the App

```bash
npx expo start --clear
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator.

---

## 📁 Project Structure

```
MealMateAI/
├── app/
│   ├── (auth)/               # Login, Register, OTP, Forgot Password
│   ├── (tabs)/               # Dashboard, Add Meal, History, Profile
│   ├── onboarding.tsx        # First-time setup questionnaire
│   └── _layout.tsx           # Root layout with animated splash
├── components/
│   └── AnimatedSplash.tsx    # Splash screen animation
├── context/
│   └── AuthContext.tsx       # Global auth state
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── gemini.ts             # Groq AI estimation functions
└── assets/
    └── images/               # App icon, splash, adaptive icon
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `EXPO_PUBLIC_GROQ_API_KEY` | Your Groq API key (free tier available) |

> ⚠️ Never commit your `.env` file. It is already added to `.gitignore`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ using React Native & Expo

</div>
