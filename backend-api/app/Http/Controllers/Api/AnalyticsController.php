<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSearchAnalyticsRequest;
use App\Models\SearchStat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsController extends Controller
{
    public function storeSearch(StoreSearchAnalyticsRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $normalizedTerm = Str::of($validated['searchTerm'])
            ->trim()
            ->lower()
            ->replaceMatches('/\s+/', ' ')
            ->toString();

        $stat = SearchStat::query()->firstOrNew([
            'search_term_normalized' => $normalizedTerm,
            'movie_id' => $validated['movieId'],
        ]);

        $stat->search_term = trim($validated['searchTerm']);
        $stat->title = $validated['title'];
        $stat->poster_url = $validated['posterUrl'] ?? null;
        $stat->count = ($stat->count ?? 0) + 1;
        $stat->save();

        return response()->json([
            'data' => [
                'searchTerm' => $stat->search_term,
                'movie_id' => $stat->movie_id,
                'title' => $stat->title,
                'count' => $stat->count,
                'poster_url' => $stat->poster_url,
            ],
        ], 201);
    }

    public function trending(Request $request): JsonResponse
    {
        $limit = max(1, min((int) $request->integer('limit', 5), 20));

        $results = SearchStat::query()
            ->orderByDesc('count')
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn(SearchStat $stat): array => [
                'searchTerm' => $stat->search_term,
                'movie_id' => $stat->movie_id,
                'title' => $stat->title,
                'count' => $stat->count,
                'poster_url' => $stat->poster_url,
            ]);

        return response()->json([
            'data' => $results,
        ]);
    }
}
