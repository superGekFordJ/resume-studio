import React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="50 35 85 115" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* A4纸张轮廓 with border */}
    <rect x="55" y="40" width="70" height="99" rx="3" fill="white" stroke="#3F51B5" strokeWidth="5"/>
    {/* 文档线条 */}
    <rect x="70" y="60" width="40" height="3" fill="#3F51B5" />
    <rect x="70" y="70" width="40" height="3" fill="#3F51B5" />
    <rect x="70" y="80" width="30" height="3" fill="#3F51B5" />
    {/* AI星火点缀 */}
    <circle cx="115" cy="50" r="18" fill="#FF9800">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
    </circle>
    {/* AI星火内部符号 */}
    <path d="M115 43.75 L117.5 50 L123.75 50 L118.75 53.75 L121.25 60 L115 56.25 L108.75 60 L111.25 53.75 L106.25 50 L112.5 50 Z" fill="white" />
    {/* 文档底部渐变装饰 */}
    <rect x="70" y="110" width="40" height="20" fill="#FF9800" opacity="0.3" />
  </svg>
);

export default Logo; 