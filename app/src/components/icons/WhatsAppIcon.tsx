interface WhatsAppIconProps {
  className?: string;
  size?: number;
}

export default function WhatsAppIcon({ className = "w-4 h-4 shrink-0 aspect-square", size }: WhatsAppIconProps) {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px`, minWidth: `${size}px`, minHeight: `${size}px` } : undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} shrink-0 aspect-square`}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...sizeStyle }}
    >
      {/* Outer speech bubble outline */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 1.954.558 3.778 1.523 5.325L2 22l4.802-1.472A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.603 0-3.111-.433-4.414-1.189l-.316-.183-3.275 1.004.99-3.235-.205-.333A7.957 7.957 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"
      />
      {/* Inner phone handset receiver */}
      <path d="M8.8 8.4c.3-.3.8-.3 1.1 0l1.3 1.3c.3.3.3.8 0 1.1l-.6.7c.5.9 1.3 1.7 2.2 2.2l.7-.6c.3-.3.8-.3 1.1 0l1.3 1.3c.3.3.3.8 0 1.1l-.8.9c-.6.6-1.5.8-2.3.4-2.2-1.1-4-2.9-5.1-5.1-.4-.8-.2-1.7.4-2.3l.7-.8z" />
    </svg>
  );
}
