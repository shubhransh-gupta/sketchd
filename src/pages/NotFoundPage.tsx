import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo/Logo';
import { SiteCredit } from '../components/SiteCredit/SiteCredit';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <Logo size={48} />
      <h1 className={styles.code}>404</h1>
      <p className={styles.title}>This drawing doesn't exist.</p>
      <p className={styles.description}>
        It may have been deleted or the link may be incorrect.
      </p>
      <Link to="/" className={styles.button}>
        Create a new drawing
      </Link>
      <SiteCredit />
    </div>
  );
}
