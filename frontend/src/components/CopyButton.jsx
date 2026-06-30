import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

// Button that copies text to the clipboard and confirms briefly.
export default function CopyButton({ text, label = 'Copy' }) {
  const { copied, copy } = useCopyToClipboard()
  return (
    <button type="button" className="copy-btn" onClick={() => copy(text)}>
      {copied ? 'Copied' : label}
    </button>
  )
}
