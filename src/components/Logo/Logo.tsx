import styles from './Logo.module.css';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 24, showText = true }: LogoProps) {
  return (
    <div className={styles.logo}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="var(--brand-primary)" />
        <path
          d="M8 22 L8 10 L12 10 L12 18 L20 10 L24 10 L16 18 L24 22 L20 22 L12 14 L12 22 Z"
          fill="white"
          stroke="white"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 24 Q9 22 11 24"
          stroke="white"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      {showText && <span className={styles.text}>Sketch'd</span>}
    </div>
  );
}
