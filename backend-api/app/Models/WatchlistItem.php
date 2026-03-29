<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatchlistItem extends Model
{
    protected $fillable = [
        'movie_id',
        'title',
        'poster_path',
        'release_date',
        'vote_average',
    ];
}
