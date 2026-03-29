<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWatchlistRequest;
use App\Models\WatchlistItem;
use Illuminate\Http\JsonResponse;

class WatchlistController extends Controller
{
    public function index(): JsonResponse
    {
        $items = WatchlistItem::query()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn(WatchlistItem $item): array => [
                'id' => $item->id,
                'movie_id' => $item->movie_id,
                'title' => $item->title,
                'poster_path' => $item->poster_path,
                'release_date' => $item->release_date,
                'vote_average' => $item->vote_average,
                'created_at' => $item->created_at,
            ]);

        return response()->json(['data' => $items]);
    }

    public function store(StoreWatchlistRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $item = WatchlistItem::query()->updateOrCreate(
            ['movie_id' => $validated['movieId']],
            [
                'title' => $validated['title'],
                'poster_path' => $validated['posterPath'] ?? null,
                'release_date' => $validated['releaseDate'] ?? null,
                'vote_average' => $validated['voteAverage'] ?? null,
            ]
        );

        return response()->json([
            'data' => [
                'id' => $item->id,
                'movie_id' => $item->movie_id,
                'title' => $item->title,
                'poster_path' => $item->poster_path,
                'release_date' => $item->release_date,
                'vote_average' => $item->vote_average,
                'created_at' => $item->created_at,
            ],
        ], 201);
    }

    public function destroy(string $movieId): JsonResponse
    {
        WatchlistItem::query()->where('movie_id', $movieId)->delete();

        return response()->json([
            'message' => 'Movie removed from watchlist',
        ]);
    }
}
