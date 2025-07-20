import React, { useState } from "react";
import styles from "./FacilitiesSection.module.css";
import checkBoxIcon from "../../../assets/CheckBox.png";

const FacilitiesSection = () => {
  // State untuk transportation
  const [transportation, setTransportation] = useState("schoolBus");
  const [pickupPoint, setPickupPoint] = useState("GIRIAN");
  const [transportationPolicy, setTransportationPolicy] = useState(true);

  // State untuk residence hall
  const [residenceHall, setResidenceHall] = useState("nonResidence");
  const [residenceHallPolicy, setResidenceHallPolicy] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>FACILITIES</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.transportationSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Transportation</div>
          </div>

          {/* Own Car Option */}
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="transportation"
                value="ownCar"
                checked={transportation === "ownCar"}
                onChange={(e) => setTransportation(e.target.value)}
                className={styles.hiddenRadio}
              />
              <div className={styles.radioButton}>
                <div className={styles.radioButtonCircle} />
                {transportation === "ownCar" && (
                  <div className={styles.radioButtonSelected} />
                )}
              </div>
              <div className={styles.label}>Own car</div>
            </label>
          </div>

          {/* School Bus Option */}
          <div className={styles.schoolBusWrapper}>
            <div className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="transportation"
                  value="schoolBus"
                  checked={transportation === "schoolBus"}
                  onChange={(e) => setTransportation(e.target.value)}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {transportation === "schoolBus" && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>School bus</div>
              </label>
            </div>

            {/* Pickup Point Field - hanya muncul jika school bus dipilih */}
            {transportation === "schoolBus" && (
              <div className={styles.pickupPointField}>
                <div className={styles.label}>Pickup point</div>
                <input
                  type="text"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className={styles.pickupPointInput}
                  placeholder="Enter pickup point"
                />
                <img
                  className={styles.pickupPointIcon}
                  alt=""
                  src="Polygon 2.svg"
                />
              </div>
            )}
          </div>

          {/* Transportation Policy Checkbox */}
          <div className={styles.optionItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={transportationPolicy}
                onChange={(e) => setTransportationPolicy(e.target.checked)}
                className={styles.hiddenCheckbox}
              />
              <div className={styles.checkBox}>
                <div className={styles.checkBoxSquare} />
                {transportationPolicy && (
                  <img
                    className={styles.checkBoxIcon}
                    alt=""
                    src={checkBoxIcon}
                  />
                )}
              </div>
              <div className={styles.label}>Transportation policy</div>
            </label>
          </div>
        </div>

        <div className={styles.residenceHallSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Residence Hall</div>
          </div>

          {/* Non-Residence Hall Option */}
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="residenceHall"
                value="nonResidence"
                checked={residenceHall === "nonResidence"}
                onChange={(e) => setResidenceHall(e.target.value)}
                className={styles.hiddenRadio}
              />
              <div className={styles.radioButton}>
                <div className={styles.radioButtonCircle} />
                {residenceHall === "nonResidence" && (
                  <div className={styles.radioButtonSelected} />
                )}
              </div>
              <div className={styles.label}>Non-Residence hall</div>
            </label>
          </div>

          {/* Boy's Dormitory Option */}
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="residenceHall"
                value="boysDormitory"
                checked={residenceHall === "boysDormitory"}
                onChange={(e) => setResidenceHall(e.target.value)}
                className={styles.hiddenRadio}
              />
              <div className={styles.radioButton}>
                <div className={styles.radioButtonCircle} />
                {residenceHall === "boysDormitory" && (
                  <div className={styles.radioButtonSelected} />
                )}
              </div>
              <div className={styles.label}>Boy's dormitory</div>
            </label>
          </div>

          {/* Girl's Dormitory Option */}
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="residenceHall"
                value="girlsDormitory"
                checked={residenceHall === "girlsDormitory"}
                onChange={(e) => setResidenceHall(e.target.value)}
                className={styles.hiddenRadio}
              />
              <div className={styles.radioButton}>
                <div className={styles.radioButtonCircle} />
                {residenceHall === "girlsDormitory" && (
                  <div className={styles.radioButtonSelected} />
                )}
              </div>
              <div className={styles.label}>Girl's dormitory</div>
            </label>
          </div>

          {/* Residence Hall Policy Checkbox */}
          <div className={styles.optionItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={residenceHallPolicy}
                onChange={(e) => setResidenceHallPolicy(e.target.checked)}
                className={styles.hiddenCheckbox}
              />
              <div className={styles.checkBox}>
                <div className={styles.checkBoxSquare} />
                {residenceHallPolicy && (
                  <img
                    className={styles.checkBoxIcon}
                    alt=""
                    src={checkBoxIcon}
                  />
                )}
              </div>
              <div className={styles.label}>Residence Hall policy</div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesSection;
