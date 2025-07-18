'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface ProClassicMarkdownRendererProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export const ProClassicMarkdownRenderer = ({
  children,
  className,
  inline = false,
}: ProClassicMarkdownRendererProps) => {
  if (!children) return null;

  const baseStyles = cn(
    // Reset default markdown styles
    '[&>*]:m-0',

    // Typography matching template1.html
    '[&>p]:text-[13px] [&>p]:leading-[18px] [&>p]:mt-1 [&>p:last-child]:mb-0',
    '[&>p]:text-[#555555]', // --text-medium from template1.html

    // Override react-gfm list styles completely
    '[&>ul]:list-none [&>ul]:p-0 [&>ul]:m-0 [&>ul]:pl-4 [&>ul]:mt-[3px]',
    '[&>ol]:list-none [&>ol]:p-0 [&>ol]:m-0 [&>ol]:pl-4 [&>ol]:mt-[3px]',

    // List items with custom bullets matching template1.html
    '[&>ul>li]:relative [&>ul>li]:text-[13px] [&>ul>li]:leading-[1.2]',
    '[&>ol>li]:relative [&>ol>li]:text-[13px] [&>ol>li]:leading-[1.2]',

    // Custom bullet points using ::before (matching template1.html .item-bullets li::before)
    "[&>ul>li]:before:content-['•'] [&>ul>li]:before:absolute [&>ul>li]:before:left-[-15px] [&>ul>li]:before:top-[1px] [&>ul>li]:before:text-[#888888]",

    // Strong/bold elements
    '[&_strong]:font-semibold [&_strong]:text-inherit',
    '[&_b]:font-semibold [&_b]:text-inherit',

    // Emphasis
    '[&_em]:italic [&_em]:text-inherit',
    '[&_i]:italic [&_i]:text-inherit',

    // Headings (matching template1.html styles)
    // h1: .header-info h1 style
    '[&>h1]:font-raleway [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-[#124f44] [&>h1]:uppercase [&>h1]:tracking-wider [&>h1]:m-0 [&>h1]:mb-1',

    // h2: .sidebar h2, .main-content h2 style
    '[&>h2]:font-raleway [&>h2]:text-[14px] [&>h2]:font-medium [&>h2]:text-[#888888] [&>h2]:uppercase [&>h2]:tracking-wider [&>h2]:py-1.5 [&>h2]:px-3 [&>h2]:border-b [&>h2]:border-[#e0e0e0] [&>h2]:leading-[16px]',

    // h3: .item-header h3, .education-item h3, .skill-category h3 styles
    '[&>h3]:font-raleway [&>h3]:text-[17px] [&>h3]:text-[#124f44] [&>h3]:font-semibold [&>h3]:m-0 [&>h3]:leading-[14px]',

    // h4: general heading style, e.g. .item-header .company
    '[&>h4]:font-raleway [&>h4]:text-[15px] [&>h4]:text-[#3cb371] [&>h4]:font-medium [&>h4]:m-0 [&>h4]:leading-[13px]',

    // h5, h6: smaller headings
    '[&>h5]:font-raleway [&>h5]:text-[14px] [&>h5]:font-medium [&>h5]:text-[#333333] [&>h5]:m-0',
    '[&>h6]:font-raleway [&>h6]:text-[13px] [&>h6]:font-medium [&>h6]:text-[#888888] [&>h6]:m-0',

    className
  );

  const customComponents = {
    // Override list rendering to ensure proper structure
    ul: ({ children, ...props }: { children: React.ReactNode }) => (
      <ul
        {...props}
        style={{
          listStyle: 'none',
          padding: '0',
          margin: 0,
          paddingLeft: '15px',
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: { children: React.ReactNode }) => (
      <ol
        {...props}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          paddingLeft: '15px',
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }: { children: React.ReactNode }) => (
      <li
        {...props}
        style={{
          position: 'relative',
          marginBottom: '0',
          fontSize: '13px',
          lineHeight: '18px',
        }}
      >
        {children}
      </li>
    ),
    // Handle inline rendering
    p: ({ children }: { children: React.ReactNode }) =>
      inline ? <span>{children}</span> : <p>{children}</p>,
  };

  return (
    <div className={baseStyles}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
};
