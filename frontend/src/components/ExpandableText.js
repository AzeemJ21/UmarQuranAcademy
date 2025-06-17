'use client';
import React from 'react';

export default function ExpandableText({ html, maxChars = 100 }) {
  const plainText = html.replace(/<[^>]*>?/gm, '').trim();
  const isLong = plainText.length > maxChars;

  if (!isLong) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <details className="text-sm text-gray-700">
      <summary className="cursor-pointer text-blue-600 hover:underline">
        {plainText.slice(0, maxChars)}...
      </summary>
      <div className="mt-2" dangerouslySetInnerHTML={{ __html: html }} />
    </details>
  );
}
