<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RegexExtractionService
{
    /**
     * Professional Grade Regex Extraction Service
     * Optimized for high-accuracy without using LLMs/API keys.
     */

    public function extractProfileDataFromText(string $text): array
    {
        // 1. Pre-process and normalize
        $text = $this->preprocess($text);
        
        // 2. Identify and split into major sections
        $sections = $this->segmentText($text);
        
        // 3. Extract Specific Entities
        $personal = $this->extractPersonal($sections['PROFILE'] ?? $text);
        
        // Summarize "ABOUT ME" section if present
        if (!empty($sections['ABOUT'])) {
            $personal['professional_summary'] = $this->cleanText($sections['ABOUT']);
        }

        // 4. Parse Complex Blocks
        $education = $this->parseEducationBlocks($sections['EDUCATION'] ?? '');
        $experience = $this->parseExperienceBlocks($sections['EXPERIENCE'] ?? '');
        
        // Parse Projects and merge into Experience (common professional format)
        if (!empty($sections['PROJECTS'])) {
            $projects = $this->parseExperienceBlocks($sections['PROJECTS'], true);
            $experience = array_merge($experience, $projects);
        }

        return [
            'personal_info' => $personal,
            'education' => $education,
            'experience' => array_slice($experience, 0, 15),
            'skills' => $this->parseListSection($sections['SKILLS'] ?? ''),
            'certifications' => $this->parseCertSection($sections['CERTIFICATIONS'] ?? ''),
            'languages' => $this->parseListSection($sections['LANGUAGES'] ?? '', 'proficiency'),
        ];
    }

    protected function preprocess(string $text): string
    {
        // Remove OCR noise (single characters that look like bullet points or icons)
        $lines = explode("\n", $text);
        $clean = [];
        foreach ($lines as $line) {
            $line = trim($line);
            // Ignore single char noise like icons translated to '6' or '•'
            if (strlen($line) <= 1 && !is_numeric($line)) continue;
            // Common icon-to-text artifacts
            if (preg_match('/^[0-9]$/', $line)) continue; 
            
            if (!empty($line)) $clean[] = $line;
        }
        return implode("\n", $clean);
    }

    protected function segmentText(string $text): array
    {
        $headers = [
            'EDUCATION' => ['education', 'academic', 'qualification', 'studies'],
            'EXPERIENCE' => ['experience', 'work history', 'professional background', 'employment', 'working profile'],
            'PROJECTS' => ['projects', 'key projects', 'notable projects', 'portfolio'],
            'SKILLS' => ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'tools'],
            'CERTIFICATIONS' => ['certifications', 'awards', 'certificates', 'courses'],
            'LANGUAGES' => ['languages', 'linguistic'],
            'ABOUT' => ['about me', 'summary', 'profile summary', 'objective', 'about'],
            'CONTACTS' => ['contacts', 'contact info', 'reach me'],
        ];

        $segments = ['PROFILE' => ''];
        $current = 'PROFILE';
        
        $lines = explode("\n", $text);
        foreach ($lines as $line) {
            $isHeader = false;
            $cleanLine = trim(strtolower($line));
            
            foreach ($headers as $key => $keywords) {
                foreach ($keywords as $kw) {
                    if ($cleanLine === $kw || (strlen($cleanLine) < 20 && str_contains($cleanLine, $kw) && !str_contains($cleanLine, ' '))) {
                        $current = $key;
                        $segments[$current] = '';
                        $isHeader = true;
                        break 2;
                    }
                }
            }
            
            if (!$isHeader) {
                $segments[$current] .= $line . "\n";
            }
        }
        return $segments;
    }

    protected function extractPersonal(string $text): array
    {
        $data = [
            'full_name' => null,
            'email' => null,
            'phone' => null,
            'website' => null,
            'linkedin' => null,
            'github' => null,
            'address' => null,
        ];

        // Advanced Email
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $m)) {
            $data['email'] = strtolower($m[0]);
        }

        // Advanced Phone (cleans common OCR icon artifacts)
        if (preg_match('/(\+?[\d\s-]{10,20})/', $text, $m)) {
            $p = preg_replace('/[^\d+]/', '', $m[0]);
            if (strlen($p) >= 10) $data['phone'] = $p;
        }

        // Social Links
        if (preg_match('/linkedin\.com\/in\/[a-z0-9-]+/i', $text, $m)) $data['linkedin'] = 'https://' . $m[0];
        if (preg_match('/github\.com\/[a-z0-9-]+/i', $text, $m)) $data['github'] = 'https://' . $m[0];
        
        // Name Heuristic: The highest non-empty line that isn't contact info or a title
        $lines = array_filter(explode("\n", trim($text)));
        foreach ($lines as $line) {
            $line = trim($line);
            if (!str_contains($line, '@') && 
                !preg_match('/\d{5,}/', $line) && 
                !preg_match('/(Resume|CV|Curriculum|Contact|Developer|Engineer|Designer)/i', $line) &&
                strlen($line) > 3) {
                $data['full_name'] = ucwords(strtolower($line));
                break;
            }
        }

        return $data;
    }

    protected function parseEducationBlocks(string $text): array
    {
        if (empty(trim($text))) return [];
        $entries = [];
        $lines = explode("\n", trim($text));
        
        foreach ($lines as $line) {
            $dates = $this->extractDateRange($line);
            if (preg_match('/(Bachelor|Master|BS|MS|PhD|Degree|University|College|Institute|B\.?[A-Z]|M\.?[A-Z])/i', $line)) {
                
                // Smart Split: Institution vs Degree
                $institution = 'Information in text';
                $degree = $line;
                
                if (preg_match('/(University|College|Institute|School)/i', $line, $m)) {
                    $parts = preg_split('/(Bachelor|Master|BS|MS|PhD|Degree|B\.?[A-Z]|M\.?[A-Z])/i', $line, 2, PREG_SPLIT_DELIM_CAPTURE);
                    if (count($parts) >= 3) {
                        $institution = trim($parts[0]);
                        $degree = trim($parts[1] . ($parts[2] ?? ''));
                    }
                }

                $entries[] = [
                    'institution' => $this->sanitize($institution),
                    'degree' => $this->sanitize($degree),
                    'start_date' => $dates['start'],
                    'end_date' => $dates['end'],
                    'currently_studying' => $dates['is_current'],
                    'description' => null,
                ];
            }
        }
        return $entries;
    }

    protected function parseExperienceBlocks(string $text, bool $isProject = false): array
    {
        if (empty(trim($text))) return [];
        $entries = [];
        $lines = explode("\n", trim($text));
        $current = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            $dates = $this->extractDateRange($line);
            $isHeading = $this->isLikelyJobHeading($line, $dates['has_date']);

            if ($isHeading) {
                if ($current) $entries[] = $current;
                
                $current = [
                    'company' => $isProject ? 'Project' : 'Company in text',
                    'position' => $line,
                    'start_date' => $dates['start'],
                    'end_date' => $dates['end'],
                    'currently_working' => $dates['is_current'],
                    'responsibilities' => null,
                ];
            } elseif ($current) {
                // Determine if this line is actually the company name (if position was first)
                if (!$isProject && $current['company'] === 'Company in text' && strlen($line) < 60 && !str_starts_with($line, '•')) {
                    $current['company'] = $line;
                } else {
                    $current['responsibilities'] .= ($current['responsibilities'] ? "\n" : "") . $line;
                }
            }
        }
        if ($current) $entries[] = $current;

        foreach ($entries as &$e) {
            $e['position'] = $this->sanitize($e['position']);
            $e['company'] = $this->sanitize($e['company']);
        }

        return $entries;
    }

    protected function extractDateRange(string $line): array
    {
        $res = [
            'start' => date('Y-01-01'),
            'end' => null,
            'is_current' => false,
            'has_date' => false
        ];

        // Check for "Till Date" or "Present"
        if (preg_match('/(Present|Till Date|Current|Now)/i', $line)) {
            $res['is_current'] = true;
            $res['has_date'] = true;
        }

        // Find Years
        if (preg_match_all('/(19|20)\d{2}/', $line, $matches)) {
            $years = array_unique($matches[0]);
            sort($years);
            $res['has_date'] = true;
            
            if (count($years) >= 2) {
                $res['start'] = $years[0] . '-01-01';
                $res['end'] = $years[1] . '-01-01';
            } else {
                $res['start'] = $years[0] . '-01-01';
            }
        }
        
        // Refinement: If months are present (Jan, February, etc.)
        $months = '(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)';
        if (preg_match_all("/$months\s*(20|19)\d{2}/i", $line, $matches)) {
            $res['has_date'] = true;
            // Month parsing could be more precise but year is the core requirement
        }

        return $res;
    }

    protected function isLikelyJobHeading(string $line, bool $hasDate): bool
    {
        if ($hasDate) return true;
        if (preg_match('/(Developer|Engineer|Manager|Lead|Designer|Intern|Specialist|Support|Consultant|Scientist|Analyst)/i', $line)) return true;
        if ($line[0] === strtoupper($line[0]) && strlen($line) > 5 && !str_starts_with($line, '•') && !str_contains($line, ':')) return true;
        return false;
    }

    protected function parseListSection(string $text, string $keyName = 'name'): array
    {
        if (empty(trim($text))) return [];
        $items = [];
        $raw = preg_split('/[,|\n•\*]/', $text);
        foreach ($raw as $r) {
            $val = trim($r);
            if (!empty($val) && strlen($val) < 50) {
                $items[] = [
                    $keyName => $val,
                    ($keyName === 'name' ? 'level' : 'proficiency') => 'Intermediate'
                ];
            }
        }
        return $items;
    }

    protected function parseCertSection(string $text): array
    {
        if (empty(trim($text))) return [];
        $items = [];
        $lines = explode("\n", $text);
        foreach ($lines as $l) {
            if (strlen(trim($l)) > 5) {
                $items[] = [
                    'name' => trim($l),
                    'issuing_organization' => 'Certification Body',
                    'issue_date' => date('Y-01-01'),
                ];
            }
        }
        return $items;
    }

    protected function sanitize(string $text): string
    {
        // Strip out date artifacts from the name/title strings
        $text = preg_replace('/(\(?(19|20)\d{2}\s*[-–]\s*(Present|Till Date|Current|\d{4})\)?)/i', '', $text);
        $text = preg_replace('/(19|20)\d{2}/', '', $text);
        // Clean symbols
        return trim($text, " \t\n\r\0\x0B,-|•–");
    }

    protected function cleanText(string $text): string
    {
        return trim(preg_replace('/\s+/', ' ', $text));
    }
}
