import React, { useState, useEffect, useRef } from "react";
import styles from "./FacilitiesSection.module.css";
import checkBoxIcon from "../../../assets/CheckBox.png";
import { getRegistrationOptions } from "../../../services/api";

const FacilitiesSection = ({ onDataChange, sharedData, prefill }) => {
  const [transportations, setTransportations] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [residenceHalls, setResidenceHalls] = useState([]);

  const [selectedTransportation, setSelectedTransportation] = useState("");
  const [selectedPickupPoint, setSelectedPickupPoint] = useState("");
  const [pickupPointCustom, setPickupPointCustom] = useState("");
  const [transportationPolicy, setTransportationPolicy] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState("");
  const [residencePolicy, setResidencePolicy] = useState(false);

  // Use shared data if available, otherwise fetch separately
  useEffect(() => {
    if (sharedData) {
      setTransportations(sharedData.transportations || []);
      setPickupPoints(sharedData.pickup_points || []);
      setResidenceHalls(sharedData.residence_halls || []);
    } else {
      // Fallback to individual API call if shared data not available
      getRegistrationOptions()
        .then((data) => {
          console.log("Facilities data received:", data);
          setTransportations(data.transportations || []);
          setPickupPoints(data.pickup_points || []);
          setResidenceHalls(data.residence_halls || []);
        })
        .catch((err) => {
          console.error("Failed to fetch facilities options:", err);
        });
    }
  }, [sharedData]);

  // Tambahkan ref untuk tracking apakah ini adalah prefill pertama kali
  const isInitialPrefill = useRef(true);
  const hasInitialized = useRef(false);

  // Prefill hanya sekali saat component pertama kali mount atau saat prefill berubah signifikan
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      // Jika ini prefill pertama kali atau prefill berubah signifikan
      if (isInitialPrefill.current || !hasInitialized.current) {
        console.log("Initial prefilling FacilitiesSection with:", prefill);

        if (prefill.transportation_id)
          setSelectedTransportation(String(prefill.transportation_id));
        if (prefill.pickup_point_id)
          setSelectedPickupPoint(String(prefill.pickup_point_id));
        if (prefill.pickup_point_custom)
          setPickupPointCustom(prefill.pickup_point_custom);

        if (prefill.transportation_policy) {
          setTransportationPolicy(prefill.transportation_policy === "Signed");
        }

        if (prefill.residence_id)
          setSelectedResidence(String(prefill.residence_id));

        if (prefill.residence_hall_policy) {
          setResidencePolicy(prefill.residence_hall_policy === "Signed");
        }

        hasInitialized.current = true;
        isInitialPrefill.current = false;
      }
    } else if (Object.keys(prefill).length === 0 && hasInitialized.current) {
      // Jika prefill menjadi empty object (reset form), reset semua field
      console.log("Resetting FacilitiesSection form");
      setSelectedTransportation("");
      setSelectedPickupPoint("");
      setPickupPointCustom("");
      setTransportationPolicy(false);
      setSelectedResidence("");
      setResidencePolicy(false);

      hasInitialized.current = false;
    }
  }, [prefill]);

  const handleTransportationChange = (value) => {
    setSelectedTransportation(String(value));
    setSelectedPickupPoint("");

    onDataChange({
      transportation_id: value != null ? Number(value) : null,
      pickup_point_id: null,
      pickup_point_custom: "",
      transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      residence_id: selectedResidence ? Number(selectedResidence) : null,
      residence_hall_policy: residencePolicy ? "Signed" : "Not Signed",
    });
  };

  const handlePickupPointChange = (value) => {
    setSelectedPickupPoint(String(value));
    setPickupPointCustom("");

    onDataChange({
      transportation_id: selectedTransportation
        ? Number(selectedTransportation)
        : null,
      pickup_point_id:
        value != null && String(value).trim() !== "" ? Number(value) : null,
      pickup_point_custom: "",
      transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      residence_id: selectedResidence ? Number(selectedResidence) : null,
      residence_hall_policy: residencePolicy ? "Signed" : "Not Signed",
    });
  };

  const handlePickupPointCustom = (e) => {
    const value = e.target.value;
    setPickupPointCustom(value);
    setSelectedPickupPoint("");

    onDataChange({
      transportation_id: selectedTransportation
        ? Number(selectedTransportation)
        : null,
      pickup_point_id: null,
      pickup_point_custom: value,
      transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      residence_id: selectedResidence ? Number(selectedResidence) : null,
      residence_hall_policy: residencePolicy ? "Signed" : "Not Signed",
    });
  };

  const handleTransportationPolicy = (e) => {
    const value = e.target.checked;
    setTransportationPolicy(value);

    console.log("Transportation policy changed to:", value);

    // Send data immediately
    onDataChange({
      transportation_id: selectedTransportation
        ? Number(selectedTransportation)
        : null,
      pickup_point_id:
        selectedPickupPoint && String(selectedPickupPoint).trim() !== ""
          ? Number(selectedPickupPoint)
          : null,
      pickup_point_custom: pickupPointCustom,
      transportation_policy: value ? "Signed" : "Not Signed",
      residence_id: selectedResidence ? Number(selectedResidence) : null,
      residence_hall_policy: residencePolicy ? "Signed" : "Not Signed",
    });
  };

  const handleResidenceChange = (value) => {
    setSelectedResidence(String(value));

    // Send data immediately
    onDataChange({
      transportation_id: selectedTransportation
        ? Number(selectedTransportation)
        : null,
      pickup_point_id:
        selectedPickupPoint && String(selectedPickupPoint).trim() !== ""
          ? Number(selectedPickupPoint)
          : null,
      pickup_point_custom: pickupPointCustom,
      transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      residence_id: value != null ? Number(value) : null,
      residence_hall_policy: residencePolicy ? "Signed" : "Not Signed",
    });
  };

  const handleResidencePolicy = (e) => {
    const value = e.target.checked;
    setResidencePolicy(value);

    console.log("Residence policy changed to:", value);

    // Send data immediately
    onDataChange({
      transportation_id: selectedTransportation
        ? Number(selectedTransportation)
        : null,
      pickup_point_id:
        selectedPickupPoint && String(selectedPickupPoint).trim() !== ""
          ? Number(selectedPickupPoint)
          : null,
      pickup_point_custom: pickupPointCustom,
      transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      residence_id: selectedResidence ? Number(selectedResidence) : null,
      residence_hall_policy: value ? "Signed" : "Not Signed",
    });
  };

  const pickupInputRef = useRef(null);

  useEffect(() => {
    if (pickupInputRef.current) {
      const hasValue =
        selectedPickupPoint !== null &&
        selectedPickupPoint !== undefined &&
        String(selectedPickupPoint).trim() !== "";
      if (hasValue) {
        pickupInputRef.current.classList.add(styles.hasValue);
      } else {
        pickupInputRef.current.classList.remove(styles.hasValue);
      }
    }
  }, [selectedPickupPoint]);

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

          {/* Transportation Options from Backend */}
          {transportations.map((transport) => (
            <div key={transport.transport_id} className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="transportation"
                  value={String(transport.transport_id)}
                  checked={
                    selectedTransportation === String(transport.transport_id)
                  }
                  onChange={() =>
                    handleTransportationChange(transport.transport_id)
                  }
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {selectedTransportation ===
                    String(transport.transport_id) && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>{transport.type}</div>
              </label>
            </div>
          ))}

          {/* Pickup Point Field - Show only for school bus type */}
          {selectedTransportation && (
            <div ref={pickupInputRef} className={`${styles.pickupPointField}`}>
              <div className={styles.label}>Pickup point</div>
              <select
                value={selectedPickupPoint ?? ""}
                onChange={(e) => handlePickupPointChange(e.target.value)}
                className={styles.pickupPointSelect}
              >
                <option value="">Select pickup point</option>
                {pickupPoints.map((point) => (
                  <option
                    key={point.pickup_point_id}
                    value={String(point.pickup_point_id)}
                  >
                    {point.name}
                  </option>
                ))}
              </select>
              <img
                className={styles.pickupPointIcon}
                alt=""
                src="Polygon 2.svg"
              />
            </div>
          )}

          {/* Custom Pickup Point Input */}
          <div className={styles.optionItem}>
            <label className={styles.label}>Custom Pickup Point</label>
            <input
              type="text"
              value={pickupPointCustom}
              onChange={handlePickupPointCustom}
              placeholder="Enter custom pickup point"
              className={styles.customInput}
            />
          </div>

          {/* Transportation Policy Checkbox */}
          <div className={styles.optionItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={transportationPolicy}
                onChange={handleTransportationPolicy}
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

        {/* Residence Hall Section */}
        <div className={styles.residenceHallSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Residence Hall</div>
          </div>

          {/* Residence Hall Options from Backend */}
          {residenceHalls.map((residence) => (
            <div key={residence.residence_id} className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="residenceHall"
                  value={String(residence.residence_id)}
                  checked={selectedResidence === String(residence.residence_id)}
                  onChange={() => handleResidenceChange(residence.residence_id)}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {selectedResidence === String(residence.residence_id) && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>{residence.type}</div>
              </label>
            </div>
          ))}

          {/* Residence Hall Policy Checkbox */}
          <div className={styles.optionItem}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={residencePolicy}
                onChange={handleResidencePolicy}
                className={styles.hiddenCheckbox}
              />
              <div className={styles.checkBox}>
                <div className={styles.checkBoxSquare} />
                {residencePolicy && (
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
