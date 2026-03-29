<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('watchlist_items')) {
            return;
        }

        Schema::create('watchlist_items_new', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('movie_id');
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->date('release_date')->nullable();
            $table->decimal('vote_average', 4, 2)->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'movie_id'], 'watchlist_items_user_movie_unique');
            $table->index(['user_id', 'created_at'], 'watchlist_items_user_created_idx');
        });

        DB::statement('INSERT INTO watchlist_items_new (id, movie_id, title, poster_path, release_date, vote_average, created_at, updated_at) SELECT id, movie_id, title, poster_path, release_date, vote_average, created_at, updated_at FROM watchlist_items');

        Schema::drop('watchlist_items');
        Schema::rename('watchlist_items_new', 'watchlist_items');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('watchlist_items')) {
            return;
        }

        Schema::create('watchlist_items_old', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('movie_id')->unique();
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->date('release_date')->nullable();
            $table->decimal('vote_average', 4, 2)->nullable();
            $table->timestamps();
            $table->index(['created_at']);
        });

        DB::statement('INSERT INTO watchlist_items_old (id, movie_id, title, poster_path, release_date, vote_average, created_at, updated_at) SELECT id, movie_id, title, poster_path, release_date, vote_average, created_at, updated_at FROM watchlist_items');

        Schema::drop('watchlist_items');
        Schema::rename('watchlist_items_old', 'watchlist_items');
    }
};
