declare module 'markdown-it-katex' {
  import { PluginSimple } from 'markdown-it';
  
  interface KatexOptions {
    throwOnError?: boolean;
    errorColor?: string;
    delimiters?: Array<{
      left: string;
      right: string;
      display: boolean;
    }>;
  }
  
  const markdownItKatex: PluginSimple<KatexOptions>;
  export = markdownItKatex;
}
