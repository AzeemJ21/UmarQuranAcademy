'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // 🔁 Send HTML back to parent
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  return (
    <div className="border border-gray-300 rounded-md p-2 bg-white min-h-[150px] text-left">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'font-bold text-blue-600' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'italic text-blue-600' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor?.isActive('underline') ? 'underline text-blue-600' : ''}
        >
          Underline
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'text-blue-600' : ''}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? 'text-blue-600' : ''}
        >
          1. List
        </button>
      </div>

      <EditorContent editor={editor} className="focus:outline-none" />
    </div>
  );
}





// 'use client';

// import dynamic from 'next/dynamic';
// import { useEffect, useRef, useState } from 'react';
// import { EditorState, convertToRaw } from 'draft-js';
// import draftToHtml from 'draftjs-to-html';

// const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), {
//   ssr: false,
// });

// import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// export default function RichTextEditor({ value, onChange }) {
//   const [editorState, setEditorState] = useState(EditorState.createEmpty());
//   const isMountedRef = useRef(true); // ✅ Start as true

//   useEffect(() => {
//     return () => {
//       isMountedRef.current = false; // 🧹 Cleanup on unmount
//     };
//   }, []);

//   const handleEditorChange = (state) => {
//     if (isMountedRef.current) {
//       setEditorState(state);
//       const html = draftToHtml(convertToRaw(state.getCurrentContent()));
//       onChange(html);
//     }
//   };

//   return (
//     <div className="editor-container" style={{ direction: 'ltr' }}>
//       <Editor
//         editorState={editorState}
//         onEditorStateChange={handleEditorChange}
//         wrapperClassName="demo-wrapper"
//         editorClassName="px-2 min-h-[150px] text-left bg-white border border-gray-300 rounded-md"
//         editorStyle={{
//           direction: 'ltr',
//           textAlign: 'left',
//           unicodeBidi: 'plaintext',
//         }}
//         toolbar={{
//           options: ['inline', 'list', 'textAlign', 'history'],
//           inline: {
//             options: ['bold', 'italic', 'underline'],
//           },
//           list: {
//             options: ['unordered', 'ordered'],
//           },
//           textAlign: {
//             options: ['left', 'center', 'right'],
//           },
//         }}
//         textAlignment="left"
//         localization={{ locale: 'en' }}
//       />
//     </div>
//   );
// }
