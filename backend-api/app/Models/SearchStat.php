<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchStat extends Model
{
    protected $fillable = [
        'search_term',
        'search_term_normalized',
        'movie_id',
        'title',
        'poster_url',
        'count',
    ];
}
