import React from 'react';
import styles from '../../styles/Facilities_Content.module.css';

function FacilitiesContent({ data, pickupPointOptions }) {
  if (!data) return null;
  const transportations = [
    { id: 1, name: 'Own car' },
    { id: 2, name: 'School bus' },
  ];
  const residences = [
    { id: 1, name: 'Boys dormitory' },
    { id: 2, name: 'Girls dormitory' },
    { id: 3, name: 'Non-Residence hall' },
  ];

  const getPickupPointName = () => {
    if (data?.pickup_point_id) {
      const option = pickupPointOptions.find(
        (p) => p.pickup_point_id === data.pickup_point_id
      );
      return option ? option.name : '-';
    }
    return data?.pickup_point_custom ?? '-';
  };

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

        {transportations.map((transport) => (
          <div key={transport.id} className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.transportation_id === transport.id && (
                <div className={styles.radioBtnInner} />
              )}
            </div>
            <div className={styles.field}>{transport.name}</div>
          </div>
        ))}

        <div className={styles.schoolBusDetails}>
          <div className={styles.pickupPoint}>
            <div className={styles.field}>Pickup point</div>
            <b className={styles.pickupPointAnswer}>{getPickupPointName()}</b>
          </div>
        </div>

        <div className={styles.ownCar}>
          <div className={styles.checkBox}>
            {renderCheckbox(data?.transportation_policy === 'Signed')}
          </div>
          <div className={styles.checkBoxPolicy}>Transportation policy</div>
        </div>
      </div>

      {/* Residence Hall */}
      <div className={styles.top}>
        <div className={styles.txtRh}>
          <div className={styles.residenceHall}>Residence Hall</div>
        </div>

        {residences.map((residence) => (
          <div key={residence.id} className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.residence_id === residence.id && (
                <div className={styles.radioBtnInner} />
              )}
            </div>
            <div className={styles.field}>{residence.name}</div>
          </div>
        ))}

        <div className={styles.ownCar}>
          <div className={styles.checkBox}>
            {renderCheckbox(data?.residence_hall_policy === 'Signed')}
          </div>
          <div className={styles.checkBoxPolicy}>Residence Hall policy</div>
        </div>
      </div>
    </div>
  );
}

export default FacilitiesContent;
