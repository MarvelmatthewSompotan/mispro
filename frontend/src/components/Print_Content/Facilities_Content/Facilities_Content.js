import React from 'react';
import styles from '../../styles/Facilities_Content.module.css';

function FacilitiesContent({ data, pickupPointOptions }) {
  if (!data) return null;
  const localTransportations = [
    { id: 1, name: 'Own car' },
    { id: 2, name: 'School bus' },
  ];
  const localResidences = [
    { id: 1, name: 'Boys dormitory' },
    { id: 2, name: 'Girls dormitory' },
    { id: 3, name: 'Non-Residence hall' },
  ];

  const getPickupPointName = () => {
    if (data?.pickup_point_id) {
      const option = pickupPointOptions.find(
        (p) => p.pickup_point_id === parseInt(data.pickup_point_id, 10)
      );
      return option ? option.name : '-';
    }
    return data?.pickup_point_custom ?? '-';
  };

  const getTransportationName = () => {
    if (data?.transportation_id) {
      // Kita harus mengasumsikan data.transportation_id dari Print.js adalah Integer (Number)
      const idToMatch = parseInt(data.transportation_id, 10);
      const found = localTransportations.find((t) => t.id === idToMatch);
      return found ? found.name : '-';
    }
    return '-';
  };

  const getResidenceName = () => {
    if (data?.residence_id) {
      // Kita harus mengasumsikan data.residence_id dari Print.js adalah Integer (Number)
      const idToMatch = parseInt(data.residence_id, 10);
      const found = localResidences.find((r) => r.id === idToMatch);
      return found ? found.name : '-';
    }
    return '-';
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

        {localTransportations.map((transport) => (
          <div key={transport.id} className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {String(data?.transportation_id) === String(transport.id) && (
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

        {localResidences.map((residence) => (
          <div key={residence.id} className={styles.ownCar}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {String(data?.residence_id) === String(residence.id) && (
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
