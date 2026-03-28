<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\MoviesController;
use Illuminate\Support\Facades\Route;

Route::prefix('analytics')->group(function (): void {
    Route::get('/trending', [AnalyticsController::class, 'trending'])
        ->middleware('throttle:120,1');

    Route::post('/search', [AnalyticsController::class, 'storeSearch'])
        ->middleware('throttle:120,1');
});

Route::prefix('movies')->group(function (): void {
    Route::get('/discover', [MoviesController::class, 'discover'])
        ->middleware('throttle:60,1');

    Route::get('/search', [MoviesController::class, 'search'])
        ->middleware('throttle:60,1');

    Route::get('/{movieId}', [MoviesController::class, 'show'])
        ->middleware('throttle:120,1');
});
