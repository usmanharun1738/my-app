<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSearchStat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    private const GENRE_MAP = [
        28 => 'Action',
        12 => 'Adventure',
        16 => 'Animation',
        35 => 'Comedy',
        80 => 'Crime',
        99 => 'Documentary',
        18 => 'Drama',
        10751 => 'Family',
        14 => 'Fantasy',
        36 => 'History',
        27 => 'Horror',
        10402 => 'Music',
        9648 => 'Mystery',
        10749 => 'Romance',
        878 => 'Science Fiction',
        10770 => 'TV Movie',
        53 => 'Thriller',
        10752 => 'War',
        37 => 'Western',
    ];

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = UserSearchStat::query()
            ->where('user_id', $user->id)
            ->get(['genre_ids', 'count']);

        $searchCount = (int) $stats->sum('count');

        $genreFrequency = [];

        foreach ($stats as $row) {
            $count = (int) ($row->count ?? 0);
            $genreIds = is_array($row->genre_ids) ? $row->genre_ids : [];

            foreach ($genreIds as $genreId) {
                $normalizedId = (int) $genreId;

                if ($normalizedId < 1) {
                    continue;
                }

                $genreFrequency[$normalizedId] = ($genreFrequency[$normalizedId] ?? 0) + $count;
            }
        }

        arsort($genreFrequency);

        $topGenres = collect($genreFrequency)
            ->take(5)
            ->map(function (int $count, int $genreId): array {
                return [
                    'id' => $genreId,
                    'name' => self::GENRE_MAP[$genreId] ?? 'Unknown',
                    'count' => $count,
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'createdAt' => $user->created_at?->toISOString(),
                ],
                'stats' => [
                    'searchCount' => $searchCount,
                    'topGenres' => $topGenres,
                ],
            ],
        ]);
    }
}
