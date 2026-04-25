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
            // Index for marketplace listing visibility
            $table->index(['is_active', 'status', 'is_public'], 'templates_visibility_idx');
            
            // Index for category filtering and sorting
            $table->index(['category', 'use_count'], 'templates_category_popularity_idx');
            
            // Single index for use_count if queried alone
            $table->index('use_count');
        });
        
        Schema::table('resumes', function (Blueprint $table) {
            // Index for user's own list browsing
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropIndex('templates_visibility_idx');
            $table->dropIndex('templates_category_popularity_idx');
            $table->dropIndex(['use_count']);
        });
        
        Schema::table('resumes', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
