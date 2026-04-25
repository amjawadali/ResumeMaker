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
        Schema::table('resumes', function (Blueprint $table) {
            $table->uuid('template_version_id')->nullable()->after('template_id');
            $table->decimal('fill_score', 5, 2)->nullable()->after('template_version_id');
            
            $table->foreign('template_version_id')->references('id')->on('template_versions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resumes', function (Blueprint $table) {
            $table->dropForeign(['template_version_id']);
            $table->dropColumn(['template_version_id', 'fill_score']);
        });
    }
};
