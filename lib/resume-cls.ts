// Inline resume class definitions to make LaTeX self-contained.
// Based on Trey Hunner's resume.cls, adapted to work with \documentclass{article}.
// This allows external compilers (latexonline.cc etc.) to compile without resume.cls.

export const RESUME_CLASS_PREAMBLE = String.raw`\documentclass[11pt,letterpaper]{article}

% ---- Resume class definitions (inlined) ----
\usepackage[parfill]{parskip}
\usepackage{array}
\usepackage{ifthen}
\usepackage{hyperref}
\pagestyle{empty}

% Name
\def\name#1{\def\@name{#1}}
\def\@name{}

% Address
\def\addressSep{$\diamond$}
\let\@addressone\relax
\let\@addresstwo\relax
\let\@addressthree\relax

\def\address#1{%
  \@ifundefined{@addressone}{\def\@addressone{#1}}{%
    \@ifundefined{@addresstwo}{\def\@addresstwo{#1}}{%
      \def\@addressthree{#1}%
    }%
  }%
}

\def\printaddress#1{%
  \begingroup
    \def\\{\addressSep\ }%
    \centerline{#1}%
  \endgroup
  \par\addressskip
}

\def\printname{%
  \begingroup
    \hfil{\MakeUppercase{\namesize\bf\@name}}\hfil
    \nameskip\break
  \endgroup
}

\def\letatstart{%
  \printname
  \@ifundefined{@addressone}{}{\printaddress{\@addressone}}%
  \@ifundefined{@addresstwo}{}{\printaddress{\@addresstwo}}%
  \@ifundefined{@addressthree}{}{\printaddress{\@addressthree}}%
}

\let\ori@document=\document
\renewcommand{\document}{\ori@document\letatstart}

% Section
\newenvironment{rSection}[1]{%
  \sectionskip
  \MakeUppercase{\bf #1}%
  \sectionlineskip
  \hrule
  \begin{list}{}{\setlength{\leftmargin}{1.5em}}%
  \item[]%
}{%
  \end{list}%
}

% Subsection
\newenvironment{rSubsection}[4]{%
  {\bf #1}\hfill{#2}%
  \ifthenelse{\equal{#3}{}}{}{%
    \\{\em #3}\hfill{\em #4}%
  }%
  \smallskip
  \begin{list}{$\cdot$}{\leftmargin=0em}%
    \itemsep -0.5em \vspace{-0.5em}%
}{%
  \end{list}%
  \vspace{0.5em}%
}

\def\namesize{\huge}
\def\addressskip{\smallskip}
\def\sectionlineskip{\medskip}
\def\nameskip{\bigskip}
\def\sectionskip{\medskip}
% ---- End resume class definitions ----
`;

/**
 * Replace \documentclass{resume} and its geometry usepackage line
 * with a self-contained preamble that any LaTeX compiler can handle.
 */
export function makeSelfContained(latex: string): string {
  // Remove the \documentclass{resume} line
  let result = latex.replace(/\\documentclass\{resume\}\s*\n?/, "");

  // Remove the geometry \usepackage line (we'll include it in the preamble)
  const geometryLine = result.match(/\\usepackage\[.*?\]\{geometry\}\s*\n?/);
  const geometryDecl = geometryLine
    ? geometryLine[0].trim()
    : "\\usepackage[left=0.6in,top=0.6in,right=0.6in,bottom=0.6in]{geometry}";
  result = result.replace(/\\usepackage\[.*?\]\{geometry\}\s*\n?/, "");

  // Build self-contained preamble: article class + geometry + resume definitions
  const preamble = RESUME_CLASS_PREAMBLE + "\n" + geometryDecl + "\n";

  return preamble + result;
}
