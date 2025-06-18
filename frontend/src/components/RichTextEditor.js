'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    return () => {
      editorRef.current = null;
    };
  }, []);

  return (
    <div className="border border-gray-300 rounded-md p-2 bg-white text-left">
      <Editor
        apiKey='hu96otceze23hkyx5vt67esqk5428oy0hk3e6b4v5utbztfs'
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value || ''}
        onEditorChange={(content) => {
          onChange(content);
        }}
        init={{
          height: 200,
          menubar: false,
          plugins: 'lists',
          toolbar: 'bold italic underline | bullist numlist',
          branding: false,
          statusbar: false,
          readonly: false,
        }}
      />
    </div>
  );
}
