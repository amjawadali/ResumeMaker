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
            'full_name' => 'JAWAD ALI',
            'email' => 'codewithjawad@gmail.com',
            'phone' => '03109865343',
            'address' => 'Peshawar, Pakistan',
            'city' => 'Peshawar',
            'state' => 'KP',
            'zip_code' => '25000',
            'country' => 'Pakistan',
            'website' => 'https://jawadali.web',
            'linkedin' => 'linkedin.com/in/jawadaliweb',
            'github' => 'github.com/jawadaliweb',
            'profile_photo' => 'uploads/1_1768067111_e17534de1aa041333614de16855373cd.jpg',
            'professional_summary' => "I'm Jawad Ali, a dedicated and passionate Web Developer with around 5.2 years of overall experience (2.2 years full-time and over 4 years part-time). I have worked extensively with Laravel, CodeIgniter, and WordPress, developing scalable web applications, APIs, and clean, mobile-friendly websites. My focus is on delivering efficient, user-friendly solutions that enhance system performance and communication. Currently, I'm working full-time and seeking opportunities to grow further, take on challenging projects, and contribute to meaningful, impactful work.",
        ]);

        // 2. Education
        Education::create([
            'user_id' => $userId,
            'institution' => 'CECOS University of IT and Emerging Sciences',
            'degree' => 'BS Computer Science',
            'field_of_study' => 'Computer Science',
            'start_date' => '2019-01-01',
            'end_date' => '2023-12-31',
            'currently_studying' => false,
            'description' => 'Gained solid knowledge in programming, web development, databases, and software engineering with hands-on project experience.',
            'order' => 1
        ]);

        // 3. Experience
        $experiences = [
            [
                'company' => 'Softilxx Technologies',
                'position' => 'Web Developer',
                'start_date' => '2020-01-01',
                'end_date' => null,
                'currently_working' => true,
                'responsibilities' => "• CodeIgniter: Extensively customized Perfex CRM, adding new features and modifying existing modules to meet client requirements to convert it to manufacturing ERP. Developed software for Kanorr Competitor (Crave Noodles) on behalf of Softilxx Technologies.\n• Laravel: Worked with repository pattern, DTO, Custom Routing, Service Pattern. Implemented custom routes, authentication systems, and user dashboards. Integrated role-based access and permissions using Spatie package. Experienced with theme setup, APIs, and modular development to build scalable applications.\n• WordPress: Developed numerous websites for company clients (local & international) including business, property, and e-commerce sites. Skilled in plugin development, theme development, SEO, and custom design implementation.",
                'order' => 1
            ],
            [
                'company' => 'Soft Vendors',
                'position' => 'Website Designer',
                'start_date' => '2019-01-01',
                'end_date' => '2019-06-30',
                'currently_working' => false,
                'responsibilities' => "• Designed and developed responsive websites using HTML, CSS, and Bootstrap.\n• Created and delivered WordPress training to multiple students.\n• Built and launched projects, including a charity website and other client-based solutions.",
                'order' => 2
            ],
            [
                'company' => 'AlKareem Electronics',
                'position' => 'IT Support & Web Developer',
                'start_date' => '2019-08-01',
                'end_date' => '2020-12-31',
                'currently_working' => false,
                'responsibilities' => "• Configured and maintained attendance machines, CCTV systems, and printers.\n• Provided troubleshooting and support for computers and Windows installations.\n• Designed and developed the company website and websites for their clients.",
                'order' => 3
            ]
        ];

        foreach ($experiences as $exp) {
            $exp['user_id'] = $userId;
            Experience::create($exp);
        }

        // 4. Projects
        $projects = [
            [
                'title' => 'Leasing ERP',
                'url' => 'Laravel',
                'description' => "Business Management ERP System: The comprehensive ERP system built in Laravel with Repository Pattern, DTO, Service Layer, Authentication & Authorization, Multi-Branch Support, 3-Layer Chart of Accounts, and Double Entry Accounting System.\n• Accounts Module: Chart of accounts with 3-tier hierarchy, voucher processing, general ledger management, fund transfers, daily expense tracking, opening balances, financial year management, balance sheet, trial balance, profit & loss statements.\n• Inventory Management: Item setup with categories/subcategories, brand management, stock opening balances, stock issue/receive operations, stock transfer and transit tracking, serial number tracking, comprehensive stock reporting.\n• Purchase Management: Supplier setup with group management, purchase price lists, purchase orders and scheduling, down payments, purchase invoicing, supplier payments, purchase returns, supplier ledger and purchase reports.\n• Sales Management: Customer setup with group management, salesman price lists, geographical setup (country/state/city), sales operations (inquiry, quotation, booking), sales invoicing, sales returns, customer reports and profit analysis.\n• Lease Management: Item planning and sale area management, customer processing and verification, delivery management, customer collections, CRC verification, block list management, slow customer tracking.\n• Payroll / HR Module: Employee profile management, department/designation setup, payroll policies, leave types and holiday management, allowance/deduction configuration, attendance tracking, salary calculation and payments, staff advances, employee actions and resignations.\n• Reporting & Analytics: Financial reports (balance sheet, P&L, trial balance), operational reports (stock, sales, purchase), employee ledger, daily cash summary, cross-module analytical reports.",
                'technologies' => 'Laravel',
                'order' => 1
            ],
            [
                'title' => 'Perfex CRM Modifications',
                'url' => 'CodeIgniter',
                'description' => "• Manufacturing Module: Modified the manufacturing module for over and under consumption and LOT Wise Consumption and time-based cost calculations with Labor cost, operation cost, raw material costs etc.\n• HR Records & HR Payroll Modules: Employee Incentive Configurations, Employee Salary Policy, Sales Commissions Calculations Based On Policy.\n• Sale Module: Secondary Sale (Distributor Sell to Shopkeeper), Secondary Sale involve Stock Received, Return, Execution, Load, Stock Delivery, Return Stock from Shopkeeper.\n• Inventory: The system existing stock calculation from transactions has a bug initially because of wrong transactions in the delivery vouchers / Goods Transaction Table, I have looked / Tested the system deeply and find out the delivery transaction in transaction table isn't happening based on warehouses that's why some warehouse stock gone into minus, so I modified and did on warehouse based.",
                'technologies' => 'CodeIgniter',
                'order' => 2
            ],
            [
                'title' => 'Coco ActiveWare',
                'url' => 'cocoactiveware.com',
                'description' => "• Ecommerce Website\n• CrocoBlock Jet Engine Used\n• Customized & Dynamic\n• Custom Cart Design",
                'technologies' => 'WordPress',
                'order' => 3
            ],
            [
                'title' => 'IVAMobile',
                'url' => 'ivamobile.com',
                'description' => "• Responsive Design\n• Elementor & Elementor Pro\n• Custom Coded Page\n• Custom Post Type\n• Custom Fields",
                'technologies' => 'WordPress',
                'order' => 4
            ]
        ];

        foreach ($projects as $proj) {
            $proj['user_id'] = $userId;
            \App\Models\Project::create($proj);
        }

        // 5. Skills
        $skills = [
            ['name' => 'Wordpress', 'category' => 'technical', 'order' => 1],
            ['name' => 'Laravel', 'category' => 'technical', 'order' => 2],
            ['name' => 'HTML', 'category' => 'technical', 'order' => 3],
            ['name' => 'CSS', 'category' => 'technical', 'order' => 4],
            ['name' => 'Javascript', 'category' => 'technical', 'order' => 5],
            ['name' => 'PHP', 'category' => 'technical', 'order' => 6],
            ['name' => 'MYSQL', 'category' => 'technical', 'order' => 7],
            ['name' => 'Jquery', 'category' => 'technical', 'order' => 8],
            ['name' => 'Problem Solving', 'category' => 'soft', 'order' => 9],
            ['name' => 'Communication', 'category' => 'soft', 'order' => 10],
            ['name' => 'Team Work', 'category' => 'soft', 'order' => 11],
        ];

        foreach ($skills as $skill) {
            $skill['user_id'] = $userId;
            Skill::create($skill);
        }

        // 6. Languages
        $languages = [
            ['name' => 'English', 'proficiency' => 'Fluent', 'order' => 1],
            ['name' => 'Urdu', 'proficiency' => 'Native', 'order' => 2],
            ['name' => 'Pashto', 'proficiency' => 'Native', 'order' => 3],
        ];

        foreach ($languages as $lang) {
            $lang['user_id'] = $userId;
            Language::create($lang);
        }

        // 7. Create a default Resume for the admin
        \App\Models\Resume::create([
            'user_id' => $userId,
            'template_id' => 1,
            'title' => 'My Premium Resume',
            'sections_visibility' => [
                'personal_info' => true,
                'summary' => true,
                'experience' => true,
                'education' => true,
                'skills' => true,
                'projects' => true,
            ],
            'canvas_state' => null // This will trigger createPremiumTemplate on first edit
        ]);

        $this->command->info('Super Admin profile and default resume seeded successfully!');
    }
}
