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
            $table->json('structure')->nullable()->after('preview_image'); // Layout config
            $table->json('default_styling')->nullable()->after('structure'); // CSS defaults
        });

        Schema::table('resumes', function (Blueprint $table) {
            $table->json('content_override')->nullable()->after('title'); // Snapshot of text
            $table->json('sections_order')->nullable()->after('content_override'); // Array of module IDs
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            $table->dropColumn(['structure', 'default_styling']);
        });

        Schema::table('resumes', function (Blueprint $table) {
            $table->dropColumn(['content_override', 'sections_order']);
        });
    }
};
