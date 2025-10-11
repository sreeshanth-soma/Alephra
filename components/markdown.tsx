/* eslint-disable react/no-unescaped-entities */

import React from "react";
import markdownit from "markdown-it";
import DOMPurify from 'dompurify';

type Props = {
  text: string | undefined | null;
};

const md = markdownit({
});

const Markdown = ({ text }: Props) => {
  // Ensure text is a string and not undefined/null
  const safeText = text || '';
  
  // Clean LaTeX formatting for better readability
  const cleanedText = safeText
    .replace(/\$([^$]+)\$/g, '$1')   // Remove LaTeX math delimiters
    .replace(/\\text\{([^}]+)\}/g, '$1') // Remove LaTeX text commands
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '') // Remove other LaTeX commands
    .replace(/\*\*(.*?)\*\*/g, '**$1**') // Preserve bold markdown
    .replace(/\*(.*?)\*/g, '*$1*'); // Preserve italic markdown
  
  const htmlcontent = md.render(cleanedText);
  const sanitized = DOMPurify.sanitize(htmlcontent);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }}></div>;
};

export default Markdown;