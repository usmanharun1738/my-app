<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MoviesController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\WatchlistController;
use Illuminate\Support\Facades\Route;

$isLocal = app()->environment('local');

$analyticsThrottle = $isLocal ? 'throttle:600,1' : 'throttle:120,1';
$moviesDiscoverThrottle = $isLocal ? 'throttle:300,1' : 'throttle:60,1';
$moviesSearchThrottle = $isLocal ? 'throttle:600,1' : 'throttle:60,1';
$moviesDetailThrottle = $isLocal ? 'throttle:600,1' : 'throttle:120,1';
$watchlistThrottle = $isLocal ? 'throttle:600,1' : 'throttle:120,1';
$authThrottle = $isLocal ? 'throttle:300,1' : 'throttle:60,1';

Route::prefix('auth')->group(function () use ($authThrottle): void {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware($authThrottle);

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware($authThrottle);

    Route::middleware('auth:sanctum')->group(function () use ($authThrottle): void {
        Route::post('/logout', [AuthController::class, 'logout'])
            ->middleware($authThrottle);

        Route::get('/me', [AuthController::class, 'me'])
            ->middleware($authThrottle);
    });
});

Route::prefix('analytics')->group(function () use ($analyticsThrottle): void {
    Route::get('/trending', [AnalyticsController::class, 'trending'])
        ->middleware($analyticsThrottle);

    Route::post('/search', [AnalyticsController::class, 'storeSearch'])
        ->middleware($analyticsThrottle);
});

Route::prefix('movies')->group(function () use ($moviesDiscoverThrottle, $moviesSearchThrottle, $moviesDetailThrottle): void {
    Route::get('/discover', [MoviesController::class, 'discover'])
        ->middleware($moviesDiscoverThrottle);

    Route::get('/search', [MoviesController::class, 'search'])
        ->middleware($moviesSearchThrottle);

    Route::get('/{movieId}', [MoviesController::class, 'show'])
        ->middleware($moviesDetailThrottle);
});

Route::prefix('watchlist')->group(function () use ($watchlistThrottle): void {
    Route::get('/', [WatchlistController::class, 'index'])
        ->middleware($watchlistThrottle);

    Route::post('/', [WatchlistController::class, 'store'])
        ->middleware($watchlistThrottle);

    Route::delete('/{movieId}', [WatchlistController::class, 'destroy'])
        ->middleware($watchlistThrottle);
});

Route::prefix('profile')->middleware('auth:sanctum')->group(function () use ($authThrottle): void {
    Route::get('/summary', [ProfileController::class, 'summary'])
        ->middleware($authThrottle);
});
