// Wrap content with a hover tooltip driven by a title attribute.
export default function Tooltip({ text, children }) {
  return (
    <span className="tooltip" data-tip={text}>
      {children}
    </span>
  )
}
