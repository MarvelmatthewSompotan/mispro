import React from 'react';
import styles from '../../styles/Facilities_Content.module.css';

function FacilitiesContent() {
  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtTransportation}>
          <div className={styles.transportation}>Transportation</div>
        </div>
        <div className={styles.ownCar}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
          </div>
          <div className={styles.transportationPolicy}>Own car</div>
        </div>
        <div className={styles.schoolBusDetails}>
          <div className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              <div className={styles.radioBtnInner} />
            </div>
            <div className={styles.transportationPolicy}>School bus</div>
          </div>
          <div className={styles.pickupPoint}>
            <div className={styles.transportationPolicy}>Pickup point</div>
            <b className={styles.girian}>GIRIAN</b>
          </div>
        </div>
        <div className={styles.ownCar}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.transportationPolicy}>
            Transportation policy
          </div>
        </div>
      </div>
      <div className={styles.top}>
        <div className={styles.txtRh}>
          <div className={styles.residenceHall}>Residence Hall</div>
        </div>
        <div className={styles.ownCar}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
            <div className={styles.radioBtnInner} />
          </div>
          <div className={styles.transportationPolicy}>Non-Residence hall</div>
        </div>
        <div className={styles.ownCar}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
          </div>
          <div className={styles.transportationPolicy}>Boy's dormitory</div>
        </div>
        <div className={styles.ownCar}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
          </div>
          <div className={styles.transportationPolicy}>Girl's dormitory</div>
        </div>
        <div className={styles.ownCar}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.transportationPolicy}>
            Residence Hall policy
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacilitiesContent;
