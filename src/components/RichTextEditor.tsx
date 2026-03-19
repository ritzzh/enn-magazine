import { useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MONO: React.CSSProperties = { fontFamily: "'Space Mono',monospace" };

const TOOLBAR_ACTIONS = [
  { cmd: 'bold',          icon: 'B',      title: 'Bold'        },
  { cmd: 'italic',        icon: 'I',      title: 'Italic'      },
  { cmd: 'underline',     icon: 'U',      title: 'Underline'   },
  { cmd: 'separator' },
  { cmd: 'formatBlock:h2', icon: 'H2',   title: 'Heading 2'   },
  { cmd: 'formatBlock:h3', icon: 'H3',   title: 'Heading 3'   },
  { cmd: 'separator' },
  { cmd: 'insertUnorderedList', icon: '⁕', title: 'Bullet list' },
  { cmd: 'insertOrderedList',   icon: '1.', title: 'Numbered'   },
  { cmd: 'separator' },
  { cmd: 'formatBlock:blockquote', icon: '❝', title: 'Blockquote' },
  { cmd: 'createLink',    icon: '⇗',     title: 'Insert link' },
  { cmd: 'separator' },
  { cmd: 'removeFormat',  icon: '✕',     title: 'Clear format' },
];

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdating = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdating.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const exec = (cmd: string) => {
    if (cmd.startsWith('formatBlock:')) {
      document.execCommand('formatBlock', false, cmd.split(':')[1]);
    } else if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else {
      document.execCommand(cmd, false);
    }
    editorRef.current?.focus();
  };

  const handleInput = () => {
    isUpdating.current = true;
    onChange(editorRef.current?.innerHTML || '');
    setTimeout(() => { isUpdating.current = false; }, 0);
  };

  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,.04)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.125rem', padding: '.375rem .5rem', borderBottom: '1px solid var(--rule)', background: 'rgba(0,0,0,.2)', flexWrap: 'wrap' }}>
        {TOOLBAR_ACTIONS.map((action, i) =>
          action.cmd === 'separator' ? (
            <div key={i} style={{ width: 1, height: 18, background: 'var(--rule)', margin: '0 .125rem' }} />
          ) : (
            <button key={action.cmd} type="button" title={action.title}
              onMouseDown={e => { e.preventDefault(); exec(action.cmd); }}
              style={{ ...MONO, fontSize: '0.6875rem', background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: '.25rem .5rem', borderRadius: 2, transition: 'all .15s', minWidth: 28, textAlign: 'center', fontWeight: action.cmd === 'bold' ? 700 : 400 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,146,42,.12)'; e.currentTarget.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--dim)'; }}
            >{action.icon}</button>
          )
        )}
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder || 'Write your story here…'}
        style={{ minHeight: 300, maxHeight: 600, overflowY: 'auto', padding: '1rem 1.125rem', color: 'var(--white)', fontSize: '0.9375rem', lineHeight: 1.75, outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
        suppressContentEditableWarning
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--dim2);
          pointer-events: none;
        }
        [contenteditable] h2 { font-family: 'Fraunces',serif; font-size: 1.4rem; font-weight: 900; color: var(--white); margin: 1.25rem 0 .5rem; }
        [contenteditable] h3 { font-family: 'Fraunces',serif; font-size: 1.125rem; font-weight: 700; color: var(--white); margin: 1rem 0 .375rem; }
        [contenteditable] p  { margin-bottom: .875rem; }
        [contenteditable] blockquote { border-left: 3px solid var(--gold); margin: 1.25rem 0; padding: .75rem 1.25rem; background: rgba(200,146,42,.06); color: var(--gold-lt); font-style: italic; font-family: 'Fraunces',serif; }
        [contenteditable] a  { color: var(--gold); }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.5rem; margin-bottom: .875rem; }
        [contenteditable]:focus { box-shadow: none; }
      `}</style>
    </div>
  );
}
