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
        Schema::create('search_stats', function (Blueprint $table) {
            $table->id();
            $table->string('search_term');
            $table->string('search_term_normalized');
            $table->unsignedBigInteger('movie_id');
            $table->string('title');
            $table->string('poster_url')->nullable();
            $table->unsignedInteger('count')->default(0);
            $table->timestamps();

            $table->unique(['search_term_normalized', 'movie_id']);
            $table->index(['count', 'updated_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('search_stats');
    }
};
