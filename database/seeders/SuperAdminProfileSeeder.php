<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserDetail;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Skill;
use App\Models\Certification;
use App\Models\Language;
use Carbon\Carbon;

class SuperAdminProfileSeeder extends Seeder
{
    public function run(): void
    {
        // Get the super admin user
        $admin = User::where('email', 'admin@resumemaker.com')->first();
        
        if (!$admin) {
            $this->command->error('Admin user not found. Please run AdminUserSeeder first.');
            return;
        }

        $userId = $admin->id;

        // Clear existing profile data
        UserDetail::where('user_id', $userId)->delete();
        Education::where('user_id', $userId)->delete();
        Experience::where('user_id', $userId)->delete();
        Skill::where('user_id', $userId)->delete();
        Certification::where('user_id', $userId)->delete();
        Language::where('user_id', $userId)->delete();

        // 1. Personal Information
        UserDetail::create([
            'user_id' => $userId,
            'full_name' => 'John Carter (Admin)',
            'email' => 'admin@resumemaker.com',
            'phone' => '+1 (555) 123-4567',
            'address' => '123 Innovation Drive, Tech District',
            'city' => 'San Francisco',
            'state' => 'CA',
            'zip_code' => '94105',
            'country' => 'United States',
            'website' => 'https://johncarter.dev',
            'linkedin' => 'linkedin.com/in/johncarter',
            'github' => 'github.com/johncarter',
            'twitter' => '@johncartertech',
            'professional_summary' => 'Highly accomplished Senior Full Stack Engineer and Systems Architect with over 10 years of experience in designing, building, and scaling high-performance web applications. Proven track record of leading cross-functional teams to deliver enterprise-grade software solutions using modern PHP and JavaScript ecosystems. Passionate about cloud architecture, clean code principles, and mentoring the next generation of software engineers.',
        ]);

        // 2. Education (Max 3)
        $educations = [
            [
                'institution' => 'Massachusetts Institute of Technology (MIT)',
                'degree' => 'Master of Science',
                'field_of_study' => 'Computer Science',
                'start_date' => '2013-09-01',
                'end_date' => '2015-06-01',
                'currently_studying' => false,
                'gpa' => '3.9',
                'description' => 'Specialized in Distributed Systems and Advanced Machine Learning. Authored a thesis on scalable microservice architectures.',
                'order' => 1
            ],
            [
                'institution' => 'Stanford University',
                'degree' => 'Bachelor of Science',
                'field_of_study' => 'Software Engineering',
                'start_date' => '2009-09-01',
                'end_date' => '2013-06-01',
                'currently_studying' => false,
                'gpa' => '3.8',
                'description' => 'Graduated with Honors. Member of the Stanford Computer Graphics Lab.',
                'order' => 2
            ],
            [
                'institution' => 'Tech High School Academy',
                'degree' => 'High School Diploma',
                'field_of_study' => 'General Sciences',
                'start_date' => '2005-09-01',
                'end_date' => '2009-06-01',
                'currently_studying' => false,
                'gpa' => '4.0',
                'description' => 'Valedictorian. Founded the school\'s first coding and robotics club.',
                'order' => 3
            ]
        ];

        foreach ($educations as $edu) {
            $edu['user_id'] = $userId;
            Education::create($edu);
        }

        // 3. Experience (Max 3)
        $experiences = [
            [
                'company' => 'TechNova Solutions',
                'position' => 'Principal Software Engineer',
                'location' => 'San Francisco, CA',
                'start_date' => '2019-03-01',
                'end_date' => null,
                'currently_working' => true,
                'responsibilities' => "• Architected and developed a massively scalable SaaS platform serving over 2 million active users.\n• Led a team of 15 engineers in migrating a monolithic legacy application to a modern microservices architecture.\n• Implemented robust CI/CD pipelines reducing deployment times by 60%.\n• Collaborated directly with stakeholders to align technical strategy with business objectives.",
                'achievements' => 'Received the "Innovator of the Year" award in 2022 for optimizing database query performance leading to a 40% reduction in server costs.',
                'order' => 1
            ],
            [
                'company' => 'CloudFront Integrations',
                'position' => 'Senior Backend Developer',
                'location' => 'Austin, TX',
                'start_date' => '2015-08-01',
                'end_date' => '2019-02-01',
                'currently_working' => false,
                'responsibilities' => "• Designed RESTful APIs handling high-throughput financial transactions.\n• Maintained maximum uptime (99.99%) across critical cloud infrastructure on AWS.\n• Mentored junior developers and conducted extensive code reviews to ensure code quality and security standards.",
                'achievements' => 'Successfully integrated 3 major third-party payment gateways within a strict 2-month deadline.',
                'order' => 2
            ],
            [
                'company' => 'Startup Hub',
                'position' => 'Full Stack Developer',
                'location' => 'Seattle, WA',
                'start_date' => '2013-07-01',
                'end_date' => '2015-07-01',
                'currently_working' => false,
                'responsibilities' => "• Developed dynamic, responsive web interfaces using React.js and Vue.js.\n• Built and maintained the underlying PHP/Laravel backend system and PostgreSQL databases.\n• Participated in daily Agile stand-ups and sprint planning sessions.",
                'achievements' => 'Delivered the beta version of the core product 3 weeks ahead of schedule.',
                'order' => 3
            ]
        ];

        foreach ($experiences as $exp) {
            $exp['user_id'] = $userId;
            Experience::create($exp);
        }

        // 4. Skills (10 skills)
        $skills = [
            ['name' => 'Laravel / PHP', 'category' => 'technical', 'proficiency' => 'expert', 'order' => 1],
            ['name' => 'React & Vue.js', 'category' => 'technical', 'proficiency' => 'expert', 'order' => 2],
            ['name' => 'System Architecture', 'category' => 'technical', 'proficiency' => 'expert', 'order' => 3],
            ['name' => 'AWS Cloud Services', 'category' => 'technical', 'proficiency' => 'advanced', 'order' => 4],
            ['name' => 'Docker & Kubernetes', 'category' => 'technical', 'proficiency' => 'advanced', 'order' => 5],
            ['name' => 'MySQL / PostgreSQL', 'category' => 'technical', 'proficiency' => 'expert', 'order' => 6],
            ['name' => 'Agile/Scrum Leadership', 'category' => 'soft', 'proficiency' => 'advanced', 'order' => 7],
            ['name' => 'TypeScript / Node.js', 'category' => 'technical', 'proficiency' => 'advanced', 'order' => 8],
            ['name' => 'CI/CD Pipelines', 'category' => 'technical', 'proficiency' => 'advanced', 'order' => 9],
            ['name' => 'Cross-functional Team Mentorship', 'category' => 'soft', 'proficiency' => 'expert', 'order' => 10],
        ];

        foreach ($skills as $skill) {
            $skill['user_id'] = $userId;
            Skill::create($skill);
        }

        // 5. Certifications (10 certificates)
        $certifications = [
            ['name' => 'AWS Certified Solutions Architect – Professional', 'issuing_organization' => 'Amazon Web Services', 'issue_date' => '2023-01-15', 'expiry_date' => '2026-01-15', 'order' => 1],
            ['name' => 'Certified Kubernetes Administrator (CKA)', 'issuing_organization' => 'Cloud Native Computing Foundation', 'issue_date' => '2022-05-10', 'expiry_date' => '2025-05-10', 'order' => 2],
            ['name' => 'Laravel Certification', 'issuing_organization' => 'Laravel LLC', 'issue_date' => '2020-11-20', 'expiry_date' => null, 'order' => 3],
            ['name' => 'Professional Scrum Master (PSM I)', 'issuing_organization' => 'Scrum.org', 'issue_date' => '2019-08-05', 'expiry_date' => null, 'order' => 4],
            ['name' => 'Google Cloud Associate Cloud Engineer', 'issuing_organization' => 'Google Cloud', 'issue_date' => '2021-03-12', 'expiry_date' => '2024-03-12', 'order' => 5],
            ['name' => 'Meta Front-End Developer Professional Certificate', 'issuing_organization' => 'Meta / Coursera', 'issue_date' => '2020-02-14', 'expiry_date' => null, 'order' => 6],
            ['name' => 'ITIL 4 Foundation Certification', 'issuing_organization' => 'AXELOS', 'issue_date' => '2018-09-22', 'expiry_date' => null, 'order' => 7],
            ['name' => 'CompTIA Security+', 'issuing_organization' => 'CompTIA', 'issue_date' => '2017-06-30', 'expiry_date' => '2020-06-30', 'order' => 8],
            ['name' => 'Oracle Certified Professional, MySQL 5.7 Database Administrator', 'issuing_organization' => 'Oracle', 'issue_date' => '2016-12-01', 'expiry_date' => null, 'order' => 9],
            ['name' => 'Zend Certified PHP Engineer', 'issuing_organization' => 'Zend Technologies', 'issue_date' => '2015-04-18', 'expiry_date' => null, 'order' => 10],
        ];

        foreach ($certifications as $cert) {
            $cert['user_id'] = $userId;
            $cert['credential_id'] = 'CRED-' . rand(100000, 999999);
            Certification::create($cert);
        }

        // 6. Languages (5 languages)
        $languages = [
            ['name' => 'English', 'proficiency' => 'Native', 'order' => 1],
            ['name' => 'Spanish', 'proficiency' => 'Fluent', 'order' => 2],
            ['name' => 'French', 'proficiency' => 'Intermediate', 'order' => 3],
            ['name' => 'German', 'proficiency' => 'Beginner', 'order' => 4],
            ['name' => 'Mandarin', 'proficiency' => 'Beginner', 'order' => 5],
        ];

        foreach ($languages as $lang) {
            $lang['user_id'] = $userId;
            Language::create($lang);
        }

        $this->command->info('Super Admin profile seeded successfully!');
    }
}
