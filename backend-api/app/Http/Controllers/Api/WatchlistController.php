<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWatchlistRequest;
use App\Models\WatchlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = WatchlistItem::query()
            ->where('user_id', $user->id)
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
        $user = $request->user();

        $item = WatchlistItem::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'movie_id' => $validated['movieId'],
            ],
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

    public function destroy(Request $request, string $movieId): JsonResponse
    {
        $user = $request->user();

        WatchlistItem::query()
            ->where('user_id', $user->id)
            ->where('movie_id', $movieId)
            ->delete();

        return response()->json([
            'message' => 'Movie removed from watchlist',
        ]);
    }
}
