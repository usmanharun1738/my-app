<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\MoviesController;
use Illuminate\Support\Facades\Route;

$isLocal = app()->environment('local');

$analyticsThrottle = $isLocal ? 'throttle:600,1' : 'throttle:120,1';
$moviesDiscoverThrottle = $isLocal ? 'throttle:300,1' : 'throttle:60,1';
$moviesSearchThrottle = $isLocal ? 'throttle:600,1' : 'throttle:60,1';
$moviesDetailThrottle = $isLocal ? 'throttle:600,1' : 'throttle:120,1';

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
