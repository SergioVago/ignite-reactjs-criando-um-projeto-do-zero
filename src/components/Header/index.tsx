import { useRouter } from 'next/router';
import { useCallback } from 'react';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

interface HeaderProps {
  home?: boolean;
}

export default function Header({ home }: HeaderProps) {
  const router = useRouter();

  const handleGoHome = useCallback(() => {
    router.push('/', '/', {});
  }, [router]);

  return (
    <header className={`${commonStyles.container} ${home && styles.home}`}>
      <div className={styles.header}>
        <img
          src="/images/logo.svg"
          alt="logo"
          onClick={handleGoHome}
          role="presentation"
        />
      </div>
    </header>
  );
}
