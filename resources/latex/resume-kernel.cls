% resume-kernel.cls
% A custom LaTeX class for the Canva + LaTeX Resume Builder

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume-kernel}[2026/01/09 Custom Resume Kernel]

\LoadClass{article}

\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage[margin=0in]{geometry} % We use absolute positioning
\RequirePackage{tikz}
\RequirePackage{xcolor}

% Setup for absolute positioning via TikZ
\newcommand{\resumeElement}[2]{%
    % #1: Metadata (x, y, width, height, etc.)
    % #2: Content
    \begin{tikzpicture}[remember picture, overlay]
        \node[anchor=north west, inner sep=0pt] at (#1.x pt, -#1.y pt) {
            \begin{minipage}{#1.width pt}
                #2
            \end{minipage}
        };
    \end{tikzpicture}
}

% Default Styles
\pagestyle{empty}
