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
  const htmlcontent = md.render(safeText);
  const sanitized = DOMPurify.sanitize(htmlcontent);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }}></div>;
};

export default Markdown;