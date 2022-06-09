import Link from 'next/link';
import styles from './header.module.scss';
export default function Header() {
  return (
    <Link href={`/`}>
      <a>
        <div className={styles.containerHeader}>
          <img src="/Logo.svg" alt="logo" />
        </div>
      </a>
    </Link>
  );
}
