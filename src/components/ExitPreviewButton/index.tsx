import Link from 'next/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './exitPreviewButton.module.scss';

const ExitPreviewButton = () => {
  return (
    <aside className={`${commonStyles.container} ${styles.container}`}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
};

export default ExitPreviewButton;
