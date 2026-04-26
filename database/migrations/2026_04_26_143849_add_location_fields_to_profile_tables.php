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
        if (!Schema::hasColumn('experiences', 'city')) {
            Schema::table('experiences', function (Blueprint $table) {
                $table->string('city')->nullable();
                $table->string('country')->nullable();
                $table->boolean('is_remote')->default(false);
            });
        }

        if (!Schema::hasColumn('educations', 'city')) {
            Schema::table('educations', function (Blueprint $table) {
                $table->string('city')->nullable();
                $table->string('country')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn(['city', 'country', 'is_remote']);
        });

        Schema::table('educations', function (Blueprint $table) {
            $table->dropColumn(['city', 'country']);
        });
    }
};
