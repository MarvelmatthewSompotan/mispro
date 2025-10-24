import React from 'react';
import mascot from '../../assets/hello_mascot.png';
import styles from '../styles/WelcomeBanner.module.css';

const WelcomeBanner = ({ name = 'Sarah' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.frameParent}>
        <div className={styles.frameGroup}>
          <div className={styles.containerText}>
            <div className={styles.title}>Hello {name}!!</div>
            <div className={styles.text1}>It's good to see you back</div>
          </div>
          <div className={styles.date}>Last login: dd/mm/yy - hh:mm</div>
        </div>
        <img className={styles.mascotIcon} alt="Mascot" src={mascot} />
      </div>
    </div>
  );
};

export default WelcomeBanner;