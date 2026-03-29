# Movie App (Expo + Laravel API)

A cross-platform movie discovery app built with Expo Router and a Laravel backend.

The app supports:

- Latest movie listing
- Movie search with debounced requests
- Search analytics tracking
- Trending movies based on search activity
- Movie details screen

## Tech Stack

Frontend:

- Expo SDK 54
- Expo Router
- React Native + TypeScript
- NativeWind (Tailwind-style utility classes)

Backend:

- Laravel 12
- SQLite (local development)
- TMDB API proxy + caching
- Search analytics endpoints

## Project Structure

```
my-app/
  app/                 # Expo Router screens
  components/          # Reusable UI components
  constants/           # Icons/images constants
  services/            # Frontend API clients and hooks
  interfaces/          # Shared TS interfaces
  assets/              # Fonts/icons/images
  backend-api/         # Laravel backend API
```

## Prerequisites

- Node.js 18+
- npm 9+
- PHP 8.2+
- Composer 2+
- Expo Go app (matching SDK 54 runtime)

## Environment Variables

Frontend (.env in project root):

```
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Use your LAN IP for physical device testing, for example:

```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8000
```

Backend (backend-api/.env):

```
TMDB_API_KEY=your_tmdb_bearer_token
TMDB_BASE_URL=https://api.themoviedb.org/3
```

## Installation

From project root:

```bash
npm install
```

From backend folder:

```bash
cd backend-api
composer install
php artisan key:generate
php artisan migrate
```

## Running the App

1) Start backend API

```bash
cd backend-api
php artisan serve --host=0.0.0.0 --port=8000

fuser -k 8000/tcp >/dev/null 2>&1 || true && php artisan serve --host=0.0.0.0 --port=8000
```

2) Start Expo frontend

```bash
cd ..
npx expo start -c
```

For physical devices, prefer tunnel mode:

```bash
npx expo start -c --tunnel
```

## API Overview

Analytics:

- POST /api/analytics/search
- GET /api/analytics/trending?limit=5

Movies:

- GET /api/movies/discover
- GET /api/movies/search?q=keyword
- GET /api/movies/{id}

## Common Troubleshooting

1) Network request failed on mobile

- Do not use 127.0.0.1 for phone testing.
- Set EXPO_PUBLIC_API_BASE_URL to your computer LAN IP.
- Run Laravel with --host=0.0.0.0.

2) Asset resolution errors

- Ensure assets/icons and assets/images exist and are synced.
- Restart with cache clear: npx expo start -c

3) Web opens Expo starter page

- Root route should redirect to /(tabs) in app/index.tsx.

4) SDK mismatch with Expo Go

- Keep Expo package aligned with your installed Expo Go runtime.

## Scripts

Frontend:

- npm start
- npm run android
- npm run ios
- npm run web
- npm run lint

Backend:

- php artisan serve
- php artisan migrate
- php artisan test

## Roadmap

- Save/watchlist persistence
- Profile features
- Auth support
- Better poster fallback handling

## License

This project is for learning and development purposes.
