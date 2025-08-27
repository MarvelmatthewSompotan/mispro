import React, { useMemo } from 'react';
import styles from '../../styles/Facilities_Content.module.css';

function FacilitiesContent({ facilitiesData }) {
  const data = facilitiesData || {};
  
  console.log("FacilitiesContent received data:", data);
  
  // ✅ PERBAIKAN: Logic yang sama dengan mapping ID
  const getTransportationType = useMemo(() => {
    const transportationId = data.transportation_id;
    if (transportationId === 1) return "own_car";
    if (transportationId === 2) return "school_bus";
    return "";
  }, [data.transportation_id]);

  const getResidenceHallType = useMemo(() => {
    const residenceId = data.residence_id;
    if (residenceId === 1) return "non_residence";
    if (residenceId === 2) return "boys_dormitory";
    if (residenceId === 3) return "girls_dormitory";
    return "";
  }, [data.residence_id]);

  const transportationType = getTransportationType;
  const residenceHallType = getResidenceHallType;

  console.log("Transportation type:", transportationType);
  console.log("Residence hall type:", residenceHallType);

  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtTransportation}>
          <div className={styles.transportation}>Transportation</div>
        </div>
        <div className={styles.ownCar}>
          <div className={`${styles.radioBtn} ${transportationType === "own_car" ? styles.selected : ""}`}>
            <div className={styles.radioBtnChild} />
            {transportationType === "own_car" && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.transportationPolicy}>Own car</div>
        </div>
        <div className={styles.schoolBusDetails}>
          <div className={styles.ownCar}>
            <div className={`${styles.radioBtn} ${transportationType === "school_bus" ? styles.selected : ""}`}>
              <div className={styles.radioBtnChild} />
              {transportationType === "school_bus" && <div className={styles.radioBtnInner} />}
            </div>
            <div className={styles.transportationPolicy}>School bus</div>
          </div>
          <div className={styles.pickupPoint}>
            <div className={styles.transportationPolicy}>Pickup point</div>
            <b className={styles.girian}>{data.pickup_point || "N/A"}</b>
          </div>
        </div>
        <div className={styles.ownCar}>
          <div className={`${styles.checkBox} ${data.transportation_policy === "Signed" ? styles.selected : ""}`}>
            <div className={styles.checkBoxChild} />
            {data.transportation_policy === "Signed" && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.transportationPolicy}>Transportation policy</div>
        </div>
      </div>
      <div className={styles.top}>
        <div className={styles.txtRh}>
          <div className={styles.residenceHall}>Residence Hall</div>
        </div>
        <div className={styles.ownCar}>
          <div className={`${styles.radioBtn} ${residenceHallType === "non_residence" ? styles.selected : ""}`}>
            <div className={styles.radioBtnChild} />
            {residenceHallType === "non_residence" && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.transportationPolicy}>Non-Residence hall</div>
        </div>
        <div className={styles.ownCar}>
          <div className={`${styles.radioBtn} ${residenceHallType === "boys_dormitory" ? styles.selected : ""}`}>
            <div className={styles.radioBtnChild} />
            {residenceHallType === "boys_dormitory" && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.transportationPolicy}>Boy's dormitory</div>
        </div>
        <div className={styles.ownCar}>
          <div className={`${styles.radioBtn} ${residenceHallType === "girls_dormitory" ? styles.selected : ""}`}>
            <div className={styles.radioBtnChild} />
            {residenceHallType === "girls_dormitory" && <div className={styles.radioBtnInner} />}
          </div>
          <div className={styles.transportationPolicy}>Girl's dormitory</div>
        </div>
        <div className={styles.ownCar}>
          <div className={`${styles.checkBox} ${data.residence_hall_policy === "Signed" ? styles.selected : ""}`}>
            <div className={styles.checkBoxChild} />
            {data.residence_hall_policy === "Signed" && <div className={styles.checkBoxInner} />}
          </div>
          <div className={styles.transportationPolicy}>Residence Hall policy</div>
        </div>
      </div>
    </div>
  );
}

export default FacilitiesContent; 