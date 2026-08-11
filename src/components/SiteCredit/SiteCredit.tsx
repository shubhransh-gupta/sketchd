import styles from './SiteCredit.module.css';

export function SiteCredit() {
  return (
    <footer className={styles.credit} aria-label="Site credit">
      <span>
        Created with <span className={styles.heart} aria-hidden="true">❤️</span> by{' '}
        <a
          href="https://github.com/shubhransh-gupta"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Shubhransh Gupta
        </a>
      </span>
    </footer>
  );
}
