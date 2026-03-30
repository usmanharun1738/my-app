<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MoviesController extends Controller
{
    private string $tmdbBaseUrl;
    private string $tmdbApiKey;
    private int $tmdbPageSize = 20;

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
        $filters = $this->extractFilters($request);
        $page = max(1, (int) $request->integer('page', 1));
        $perPage = max(1, min((int) $request->integer('perPage', 12), 20));

        $cacheKey = 'movies:discover:' . md5(json_encode([
            ...$filters,
            'page' => $page,
            'perPage' => $perPage,
        ]));

        $cached = Cache::remember($cacheKey, 3600, function () use ($filters, $page, $perPage): array {
            return $this->fetchDiscoverPayload($filters, $page, $perPage);
        });

        // Guard against stale cached errors from transient upstream failures.
        if (isset($cached['error'])) {
            Cache::forget($cacheKey);
            $cached = $this->fetchDiscoverPayload($filters, $page, $perPage);

            if (! isset($cached['error'])) {
                Cache::put($cacheKey, $cached, 3600);
            }
        }

        if (isset($cached['error'])) {
            return response()->json(['error' => 'Failed to fetch movies'], 502);
        }

        return response()->json([
            'data' => $cached['results'] ?? [],
            'meta' => $cached['meta'] ?? [
                'page' => $page,
                'perPage' => $perPage,
                'totalPages' => 1,
                'totalResults' => 0,
                'hasNextPage' => false,
                'hasPreviousPage' => false,
            ],
        ]);
    }

    private function fetchDiscoverPayload(array $filters, int $page, int $perPage): array
    {
        $queryParams = [
            'sort_by' => $this->mapDiscoverSort($filters['sortBy']),
        ];

        if ($filters['genreId']) {
            $queryParams['with_genres'] = $filters['genreId'];
        }

        if ($filters['year']) {
            $queryParams['primary_release_year'] = $filters['year'];
        }

        if ($filters['minRating']) {
            $queryParams['vote_average.gte'] = $filters['minRating'];
        }

        if ($filters['releaseDate']) {
            $queryParams['primary_release_date.gte'] = $filters['releaseDate'];
        }

        $offset = ($page - 1) * $perPage;
        $tmdbPage = (int) floor($offset / $this->tmdbPageSize) + 1;
        $offsetInTmdbPage = $offset % $this->tmdbPageSize;
        $pagesNeeded = (int) ceil(($offsetInTmdbPage + $perPage) / $this->tmdbPageSize);

        $mergedResults = [];
        $totalResults = 0;

        try {
            for ($index = 0; $index < $pagesNeeded; $index++) {
                $response = Http::withHeaders([
                    'accept' => 'application/json',
                    'Authorization' => "Bearer {$this->tmdbApiKey}",
                ])->get($this->tmdbBaseUrl . '/discover/movie', [
                    ...$queryParams,
                    'page' => $tmdbPage + $index,
                ]);

                if ($response->failed()) {
                    return ['error' => $response->status()];
                }

                $json = $response->json();

                if ($index === 0) {
                    $totalResults = (int) ($json['total_results'] ?? 0);
                }

                $mergedResults = [...$mergedResults, ...($json['results'] ?? [])];
            }

            $results = array_slice($mergedResults, $offsetInTmdbPage, $perPage);
            $totalPages = max(1, (int) ceil($totalResults / $perPage));

            return [
                'results' => $results,
                'meta' => [
                    'page' => $page,
                    'perPage' => $perPage,
                    'totalPages' => $totalPages,
                    'totalResults' => $totalResults,
                    'hasNextPage' => $page < $totalPages,
                    'hasPreviousPage' => $page > 1,
                ],
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->string('q')->trim();
        $filters = $this->extractFilters($request);

        if ($query->isEmpty()) {
            return response()->json(['data' => []]);
        }

        $cacheKey = 'movies:search:' . md5(json_encode([
            'query' => $query->toString(),
            ...$filters,
        ]));

        $cached = Cache::remember($cacheKey, 3600, function () use ($query, $filters): array {
            return $this->fetchSearchPayload($query->toString(), $filters);
        });

        if (isset($cached['error'])) {
            Cache::forget($cacheKey);
            $cached = $this->fetchSearchPayload($query->toString(), $filters);

            if (! isset($cached['error'])) {
                Cache::put($cacheKey, $cached, 3600);
            }
        }

        if (isset($cached['error'])) {
            return response()->json(['data' => []]);
        }

        $results = collect($cached['results'] ?? []);
        $filtered = $this->applyResultFilters($results, $filters);

        return response()->json([
            'data' => $filtered->values()->all(),
        ]);
    }

    public function show(string $movieId): JsonResponse
    {
        $cacheKey = "movies:detail:v3:{$movieId}";
        $cached = Cache::remember($cacheKey, 86400, function () use ($movieId): array {
            return $this->fetchDetailsPayload($movieId);
        });

        if (isset($cached['error'])) {
            Cache::forget($cacheKey);
            $cached = $this->fetchDetailsPayload($movieId);

            if (! isset($cached['error'])) {
                Cache::put($cacheKey, $cached, 86400);
            }
        }

        if (isset($cached['error'])) {
            return response()->json(['error' => 'Failed to fetch movie details'], 502);
        }

        return response()->json(['data' => $cached]);
    }

    private function fetchSearchPayload(string $query, array $filters): array
    {
        $queryParams = [
            'query' => $query,
        ];

        if ($filters['year']) {
            $queryParams['year'] = $filters['year'];
        }

        try {
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'Authorization' => "Bearer {$this->tmdbApiKey}",
            ])->get($this->tmdbBaseUrl . '/search/movie', $queryParams);

            if ($response->failed()) {
                return ['error' => $response->status()];
            }

            return $response->json();
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function fetchDetailsPayload(string $movieId): array
    {
        try {
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'Authorization' => "Bearer {$this->tmdbApiKey}",
            ])->get($this->tmdbBaseUrl . "/movie/{$movieId}", [
                'append_to_response' => 'credits,videos,similar',
            ]);

            if ($response->failed()) {
                return ['error' => $response->status()];
            }

            return $response->json();
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function extractFilters(Request $request): array
    {
        $sortBy = (string) $request->string('sortBy', 'popular');

        return [
            'genreId' => $request->integer('genreId') ?: null,
            'year' => $request->integer('year') ?: null,
            'minRating' => $request->integer('minRating') ?: null,
            'releaseDate' => $request->string('releaseDate')->toString() ?: null,
            'sortBy' => in_array($sortBy, ['popular', 'release_desc', 'release_asc'], true)
                ? $sortBy
                : 'popular',
        ];
    }

    private function mapDiscoverSort(string $sortBy): string
    {
        return match ($sortBy) {
            'release_desc' => 'primary_release_date.desc',
            'release_asc' => 'primary_release_date.asc',
            default => 'popularity.desc',
        };
    }

    private function applyResultFilters(Collection $results, array $filters): Collection
    {
        $filtered = $results;

        if ($filters['genreId']) {
            $filtered = $filtered->filter(function (array $movie) use ($filters): bool {
                $genres = $movie['genre_ids'] ?? [];

                return in_array($filters['genreId'], $genres, true);
            });
        }

        if ($filters['minRating']) {
            $filtered = $filtered->filter(function (array $movie) use ($filters): bool {
                return ((float) ($movie['vote_average'] ?? 0)) >= $filters['minRating'];
            });
        }

        if ($filters['year']) {
            $filtered = $filtered->filter(function (array $movie) use ($filters): bool {
                $releaseDate = (string) ($movie['release_date'] ?? '');

                return str_starts_with($releaseDate, (string) $filters['year']);
            });
        }

        if ($filters['releaseDate']) {
            $filtered = $filtered->filter(function (array $movie) use ($filters): bool {
                $releaseDate = (string) ($movie['release_date'] ?? '');

                if ($releaseDate === '') {
                    return false;
                }

                return $releaseDate >= $filters['releaseDate'];
            });
        }

        if ($filters['sortBy'] === 'release_desc') {
            $filtered = $filtered->sortByDesc(function (array $movie): string {
                return (string) ($movie['release_date'] ?? '0000-00-00');
            });
        }

        if ($filters['sortBy'] === 'release_asc') {
            $filtered = $filtered->sortBy(function (array $movie): string {
                return (string) ($movie['release_date'] ?? '9999-12-31');
            });
        }

        return $filtered;
    }
}
