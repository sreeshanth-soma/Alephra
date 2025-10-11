/* eslint-disable react/no-unescaped-entities */

import React from "react";
import markdownit from "markdown-it";
import markdownItKatex from "markdown-it-katex";
import DOMPurify from 'dompurify';
import 'katex/dist/katex.min.css';

type Props = {
  text: string | undefined | null;
};

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
}).use(markdownItKatex, {
  throwOnError: false,
  errorColor: '#cc0000',
});

const Markdown = ({ text }: Props) => {
  // Ensure text is a string and not undefined/null
  const safeText = text || '';
  
  // Process the text with markdown-it (which now handles LaTeX math)
  const htmlcontent = md.render(safeText);
  const sanitized = DOMPurify.sanitize(htmlcontent, {
    ADD_TAGS: ['math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'msqrt', 'mroot'],
    ADD_ATTR: ['xmlns', 'display', 'mode']
  });
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitized }}
      className="markdown-content"
    />
  );
};

export default Markdown;