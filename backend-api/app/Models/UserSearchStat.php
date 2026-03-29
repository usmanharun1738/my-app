<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSearchStat extends Model
{
    protected $fillable = [
        'user_id',
        'search_term',
        'search_term_normalized',
        'movie_id',
        'title',
        'poster_url',
        'genre_ids',
        'count',
    ];

    protected $casts = [
        'genre_ids' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
