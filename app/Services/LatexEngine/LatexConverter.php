<?php

namespace App\Services\LatexEngine;

class LatexConverter
{
    /**
     * Convert structured JSON data (semantics + layout) into a LaTeX string.
     *
     * @param array $data JSON schema containing semantics and layout overrides.
     * @param string $template The base LaTeX template/class name.
     * @return string
     */
    public function jsonToLatex(array $data, string $template = 'modern'): string
    {
        $latex = "% !TEX program = xelatex\n";
        $latex .= "\\documentclass{resume-kernel}\n\n";
        
        // Document Metadata
        $latex .= "\\begin{document}\n";
        
        foreach ($data['elements'] as $element) {
            $latex .= $this->renderElement($element);
        }
        
        $latex .= "\\end{document}";
        
        return $latex;
    }

    /**
     * Parse LaTeX string into structured JSON (semantics + layout).
     * 
     * @param string $latex
     * @return array
     */
    public function latexToJson(string $latex): array
    {
        $elements = [];
        
        // This is a simplified regex-based parser for our controlled DSL.
        // In a production system, this would be a more robust lexer.
        
        preg_match_all('/\\\\resumeElement\{(.*?)\}\{(.*?)\}/s', $latex, $matches, PREG_SET_ORDER);
        
        foreach ($matches as $match) {
            $metadata = $this->parseMetadata($match[1]);
            $content = $match[2];
            
            $elements[] = array_merge($metadata, [
                'content' => trim($content)
            ]);
        }
        
        return [
            'elements' => $elements
        ];
    }

    protected function renderElement(array $element): string
    {
        $metadata = [];
        foreach ($element as $key => $value) {
            if ($key !== 'content' && !is_array($value)) {
                $metadata[] = "$key=" . (is_bool($value) ? ($value ? 'true' : 'false') : $value);
            }
        }
        
        $metadataStr = implode(',', $metadata);
        $content = $element['content'] ?? ($element['text'] ?? '');
        $semantic = $element['semantic'] ?? 'generic';

        // Map semantic tags to specialized LaTeX macros
        switch ($semantic) {
            case 'full_name':
                return "\\cvname{{$metadataStr}}{{$content}}\n";
            case 'experience_title':
                return "\\cvexptitle{{$metadataStr}}{{$content}}\n";
            case 'professional_summary':
                return "\\cvsummary{{$metadataStr}}{{$content}}\n";
            default:
                return "\\resumeElement{{$metadataStr}}{{$content}}\n";
        }
    }

    protected function parseMetadata(string $metadataStr): array
    {
        $metadata = [];
        $parts = explode(',', $metadataStr);
        foreach ($parts as $part) {
            $kv = explode('=', $part);
            if (count($kv) === 2) {
                $metadata[trim($kv[0])] = trim($kv[1]);
            }
        }
        return $metadata;
    }
}
