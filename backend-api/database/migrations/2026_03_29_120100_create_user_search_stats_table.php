<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_search_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('search_term');
            $table->string('search_term_normalized');
            $table->unsignedBigInteger('movie_id');
            $table->string('title');
            $table->string('poster_url')->nullable();
            $table->json('genre_ids')->nullable();
            $table->unsignedInteger('count')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'search_term_normalized', 'movie_id'], 'user_search_unique_lookup');
            $table->index(['user_id', 'count', 'updated_at'], 'user_search_stats_leaderboard_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_search_stats');
    }
};
