import React from 'react';
import styles from '../../styles/Facilities_Content.module.css';

function FacilitiesContent({ data }) {
  if (!data) return null;
  const transportations = ['Own car', 'School bus'];
  const residences = [
    'Boys dormitory',
    'Girls dormitory',
    'Non-Residence hall',
  ];

  // helper checkbox biar tidak duplikat
  const renderCheckbox = (isSigned) => {
    return isSigned ? (
      <div className={styles.checkBoxChild} />
    ) : (
      <div
        style={{
          position: 'absolute',
          height: '108.33%',
          width: '108.33%',
          top: '-4.17%',
          right: '-4.17%',
          bottom: '-4.17%',
          left: '-4.17%',
          borderRadius: '4px',
          border: '3px solid #5f84fe',
          boxSizing: 'border-box',
          backgroundColor: 'white',
        }}
      />
    );
  };

  return (
    <div className={styles.content}>
      {/* Transportation */}
      <div className={styles.top}>
        <div className={styles.txtTransportation}>
          <div className={styles.transportation}>Transportation</div>
        </div>

        {transportations.map((transport, index) => (
          <div key={index} className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.transportation?.name === transport && (
                <div className={styles.radioBtnInner} />
              )}
            </div>
            <div className={styles.field}>{transport}</div>
          </div>
        ))}

        <div className={styles.schoolBusDetails}>
          <div className={styles.pickupPoint}>
            <div className={styles.field}>Pickup point</div>
            <b className={styles.pickupPointAnswer}>{data.pickup_point?.name ?? '-'}</b>
          </div>
        </div>

        <div className={styles.ownCar}>
          <div className={styles.checkBox}>
            {renderCheckbox(data?.transportation?.policy === 'Signed')}
          </div>
          <div className={styles.checkBoxPolicy}>
            Transportation policy
          </div>
        </div>
      </div>

      {/* Residence Hall */}
      <div className={styles.top}>
        <div className={styles.txtRh}>
          <div className={styles.residenceHall}>Residence Hall</div>
        </div>

        {residences.map((residence, index) => (
          <div key={index} className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.residence?.name === residence && (
                <div className={styles.radioBtnInner} />
              )}
            </div>
            <div className={styles.field}>{residence}</div>
          </div>
        ))}

        <div className={styles.ownCar}>
          <div className={styles.checkBox}>
            {renderCheckbox(data?.residence?.policy === 'Signed')}
          </div>
          <div className={styles.checkBoxPolicy}>
            Residence Hall policy
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacilitiesContent;
