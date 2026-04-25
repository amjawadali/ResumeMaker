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
        Schema::table('templates', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->json('canvas_data')->nullable();
            $table->enum('type', ['blade', 'canvas'])->default('blade');
            $table->boolean('is_public')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('is_premium')->default(false);
            $table->integer('use_count')->default(0);
            $table->decimal('fill_score_avg', 5, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'canvas_data', 'type', 'is_public', 'status', 'is_premium', 'use_count', 'fill_score_avg']);
        });
    }
};
