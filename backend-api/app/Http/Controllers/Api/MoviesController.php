<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MoviesController extends Controller
{
    private string $tmdbBaseUrl;
    private string $tmdbApiKey;

    public function __construct()
    {
        $this->tmdbBaseUrl = config('tmdb.base_url', 'https://api.themoviedb.org/3');
        $this->tmdbApiKey = config('tmdb.api_key', '');

        if (!$this->tmdbApiKey) {
            throw new \RuntimeException('TMDB_API_KEY is not configured');
        }
    }

    public function discover(Request $request): JsonResponse
    {
        $cacheKey = 'movies:discover:' . md5(json_encode($request->query()));
        $cached = Cache::remember($cacheKey, 3600, function (): array {
            try {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'Authorization' => "Bearer {$this->tmdbApiKey}",
                ])->get($this->tmdbBaseUrl . '/discover/movie', [
                    'sort_by' => 'popularity.desc',
                ]);

                if ($response->failed()) {
                    return ['error' => $response->status()];
                }

                return $response->json();
            } catch (\Exception $e) {
                return ['error' => $e->getMessage()];
            }
        });

        if (isset($cached['error'])) {
            return response()->json(['error' => 'Failed to fetch movies'], 502);
        }

        return response()->json([
            'data' => $cached['results'] ?? [],
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim();

        if ($query->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $cacheKey = 'movies:search:' . md5($query);
        $cached = Cache::remember($cacheKey, 3600, function () use ($query): array {
            try {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'Authorization' => "Bearer {$this->tmdbApiKey}",
                ])->get($this->tmdbBaseUrl . '/search/movie', [
                    'query' => $query,
                ]);

                if ($response->failed()) {
                    return ['error' => $response->status()];
                }

                return $response->json();
            } catch (\Exception $e) {
                return ['error' => $e->getMessage()];
            }
        });

        if (isset($cached['error'])) {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => $cached['results'] ?? [],
        ]);
    }

    public function show(string $movieId): JsonResponse
    {
        $cacheKey = "movies:detail:{$movieId}";
        $cached = Cache::remember($cacheKey, 86400, function () use ($movieId): array {
            try {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'Authorization' => "Bearer {$this->tmdbApiKey}",
                ])->get($this->tmdbBaseUrl . "/movie/{$movieId}");

                if ($response->failed()) {
                    return ['error' => $response->status()];
                }

                return $response->json();
            } catch (\Exception $e) {
                return ['error' => $e->getMessage()];
            }
        });

        if (isset($cached['error'])) {
            return response()->json(['error' => 'Failed to fetch movie details'], 502);
        }

        return response()->json(['data' => $cached]);
    }
}
