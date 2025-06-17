'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
  ssr: false,
});

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function RichTextEditor({ value, onChange }) {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const isMountedRef = useRef(true); // ✅ Start as true

  useEffect(() => {
    return () => {
      isMountedRef.current = false; // 🧹 Cleanup on unmount
    };
  }, []);

  const handleEditorChange = (state) => {
    if (isMountedRef.current) {
      setEditorState(state);
      const html = draftToHtml(convertToRaw(state.getCurrentContent()));
      onChange(html);
    }
  };

  return (
    <div className="editor-container" style={{ direction: 'ltr' }}>
      <Editor
        editorState={editorState}
        onEditorStateChange={handleEditorChange}
        wrapperClassName="demo-wrapper"
        editorClassName="px-2 min-h-[150px] text-left bg-white border border-gray-300 rounded-md"
        editorStyle={{
          direction: 'ltr',
          textAlign: 'left',
          unicodeBidi: 'plaintext',
        }}
        toolbar={{
          options: ['inline', 'list', 'textAlign', 'history'],
          inline: {
            options: ['bold', 'italic', 'underline'],
          },
          list: {
            options: ['unordered', 'ordered'],
          },
          textAlign: {
            options: ['left', 'center', 'right'],
          },
        }}
        textAlignment="left"
        localization={{ locale: 'en' }}
      />
    </div>
  );
}
