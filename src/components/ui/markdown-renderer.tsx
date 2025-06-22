"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export const MarkdownRenderer = ({ 
  children, 
  className,
  inline = false
}: MarkdownRendererProps) => {
  if (!children) return null;

  const baseStyles = cn(
    // Basic typography
    "[&>p]:leading-[1.4]",
    "[&>p]:mb-2 [&>p:last-child]:mb-0",
    
    // Lists
    "[&>ul]:ml-4 [&>ul]:list-disc [&>ul]:space-y-1",
    "[&>ol]:ml-4 [&>ol]:list-decimal [&>ol]:space-y-1",
    "[&>li]:leading-[1.4]",
    
    // Emphasis
    "[&>p_strong]:font-semibold",
    "[&>p_em]:italic",
    "[&>li_strong]:font-semibold",
    "[&>li_em]:italic",
    
    // Inline code
    "[&>p_code]:bg-gray-100 [&>p_code]:px-1 [&>p_code]:py-0.5 [&>p_code]:rounded [&>p_code]:text-xs [&>p_code]:font-mono",
    "[&>li_code]:bg-gray-100 [&>li_code]:px-1 [&>li_code]:py-0.5 [&>li_code]:rounded [&>li_code]:text-xs [&>li_code]:font-mono",
    
    // Code blocks
    "[&>pre]:bg-gray-100 [&>pre]:p-2 [&>pre]:rounded [&>pre]:text-xs [&>pre]:font-mono [&>pre]:overflow-x-auto [&>pre]:mb-2",
    
    // Blockquotes
    "[&>blockquote]:border-l-2 [&>blockquote]:border-gray-300 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:mb-2",
    
    // Headings (though unlikely in resumes)
    "[&>h1]:font-bold [&>h1]:text-base [&>h1]:mb-2",
    "[&>h2]:font-semibold [&>h2]:text-sm [&>h2]:mb-1",
    "[&>h3]:font-medium [&>h3]:text-sm [&>h3]:mb-1",
    
    className
  );

  if (inline) {
    return (
      <div className={baseStyles}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <span>{children}</span>,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={baseStyles}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}; 