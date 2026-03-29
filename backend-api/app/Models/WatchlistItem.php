<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WatchlistItem extends Model
{
    protected $fillable = [
        'user_id',
        'movie_id',
        'title',
        'poster_path',
        'release_date',
        'vote_average',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
