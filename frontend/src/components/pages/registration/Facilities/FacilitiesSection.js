import React, { useState, useEffect, useRef } from "react";
import styles from "./FacilitiesSection.module.css";
import checkBoxIcon from "../../../../assets/CheckBox.png";
import { getRegistrationOptions } from "../../../../services/api";

const FacilitiesSection = ({
  onDataChange,
  sharedData,
  prefill,
  errors,
  forceError,
}) => {
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
    const newSelectedId =
      selectedTransportation === String(value) ? "" : String(value);
    setSelectedTransportation(newSelectedId);

    // Selalu reset pickup point saat transportasi berubah
    setSelectedPickupPoint("");
    setPickupPointCustom("");

    // Logika baru yang lebih spesifik untuk mereset asrama
    let newSelectedResidenceId = selectedResidence; // Asumsikan state tidak berubah

    const selectedTransport = transportations.find(
      (t) => t.transport_id === Number(newSelectedId)
    );
    const transportType = selectedTransport
      ? selectedTransport.type.toLowerCase()
      : "";

    // Cek apakah transportasi yang baru dipilih adalah Own Car / School Bus
    if (transportType === "own car" || transportType === "school bus") {
      // Jika ya, cek apakah pilihan asrama saat ini adalah sebuah "Dormitory"
      if (selectedResidence) {
        const currentResidence = residenceHalls.find(
          (r) => r.residence_id === Number(selectedResidence)
        );

        // Jika pilihan saat ini adalah "Dormitory", baru kosongkan state-nya
        if (
          currentResidence &&
          currentResidence.type.toLowerCase().includes("dormitory")
        ) {
          setSelectedResidence("");
          newSelectedResidenceId = ""; // Siapkan state kosong untuk dikirim
        }
        // Jika yang terpilih bukan "Dormitory" (misal: "Non-Residence Hall"),
        // maka state-nya tidak akan diubah dan pilihan tetap ada.
      }
    }

    // Kirim data terbaru ke parent component
    onDataChange({
      transportation_id: newSelectedId ? Number(newSelectedId) : null,
      pickup_point_id: null,
      pickup_point_custom: "",
      transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      residence_id: newSelectedResidenceId
        ? Number(newSelectedResidenceId)
        : null,
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
    // 1. Tentukan ID residensial baru (bisa kosong jika opsi yang sama diklik ulang)
    const newSelectedResidence =
      selectedResidence === String(value) ? "" : String(value);
    setSelectedResidence(newSelectedResidence); // 2. Update state lokal untuk me-render ulang UI

    // 3. Cek apakah pilihan baru adalah asrama (dormitory)
    const selectedResidenceObj = residenceHalls.find(
      (r) => r.residence_id === Number(newSelectedResidence)
    );
    const isDormitory = selectedResidenceObj
      ? selectedResidenceObj.type.toLowerCase().includes("dormitory")
      : false;

    // 4. Siapkan data dasar yang akan selalu dikirim ke parent
    let dataToSend = {
      residence_id: newSelectedResidence ? Number(newSelectedResidence) : null,
      residence_hall_policy: residencePolicy ? "Signed" : "Not Signed",
    };

    // 5. Logika Kondisional untuk Data Transportasi
    if (isDormitory) {
      // Jika asrama dipilih, reset semua state lokal & data transportasi
      setSelectedTransportation("");
      setSelectedPickupPoint("");
      setPickupPointCustom("");
      setTransportationPolicy(false);

      // Tambahkan data transportasi yang sudah direset ke dalam payload yang akan dikirim
      dataToSend = {
        ...dataToSend,
        transportation_id: null,
        pickup_point_id: null,
        pickup_point_custom: "",
        transportation_policy: "Not Signed",
      };
    } else {
      // Jika BUKAN asrama yang dipilih (atau pilihan dikosongkan),
      // pertahankan data transportasi yang ada saat ini.
      dataToSend = {
        ...dataToSend,
        transportation_id: selectedTransportation
          ? Number(selectedTransportation)
          : null,
        pickup_point_id:
          selectedPickupPoint && String(selectedPickupPoint).trim() !== ""
            ? Number(selectedPickupPoint)
            : null,
        pickup_point_custom: pickupPointCustom,
        transportation_policy: transportationPolicy ? "Signed" : "Not Signed",
      };
    }

    // 6. Kirim semua data yang sudah diperbarui ke parent dalam satu panggilan
    onDataChange(dataToSend);
  };

  const handleResidencePolicy = (e) => {
    const value = e.target.checked;
    setResidencePolicy(value);

    // Kirim data lengkapnya
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
      residence_hall_policy: value ? "Signed" : "Not Signed", // Nilai yang diubah
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

  useEffect(() => {
    if (errors) {
    }
  }, [errors]);

  useEffect(() => {
    if (forceError) {
    }
  }, [forceError]);

  useEffect(() => {
    if (
      selectedTransportation &&
      (errors?.transportation_id || forceError?.transportation_id)
    ) {
    }
  }, [selectedTransportation, errors, forceError]);

  useEffect(() => {
    if (
      selectedResidence &&
      (errors?.residence_id || forceError?.residence_id)
    ) {
    }
  }, [selectedResidence, errors, forceError]);

  const selectedResidenceObj = residenceHalls.find(
    (r) => r.residence_id === Number(selectedResidence)
  );
  const isDormitorySelected = selectedResidenceObj
    ? selectedResidenceObj.type.toLowerCase().includes("dormitory")
    : false;

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>FACILITIES</span>
      </div>
      <div className={styles.contentWrapper}>
        {!isDormitorySelected && (
          <div className={styles.transportationSection}>
            <div className={styles.sectionTitle}>
              <div
                className={`${styles.sectionTitleText} ${
                  errors?.pickup_point_id || forceError?.pickup_point_id
                    ? styles.facilitiesSectionErrorLabel
                    : ""
                }`}
              >
                Transportation
              </div>
            </div>

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
                    onClick={() =>
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

            {(() => {
              if (!selectedTransportation) return false;
              const selectedTransport = transportations.find(
                (t) => t.transport_id === Number(selectedTransportation)
              );
              if (!selectedTransport) return false;
              return selectedTransport.type
                .toLowerCase()
                .includes("school bus");
            })() && (
              <div
                ref={pickupInputRef}
                className={`${styles.pickupPointField}`}
              >
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

            {(() => {
              if (!selectedTransportation) return false;
              const selectedTransport = transportations.find(
                (t) => t.transport_id === Number(selectedTransportation)
              );
              if (!selectedTransport) return false;
              return selectedTransport.type
                .toLowerCase()
                .includes("school bus");
            })() && (
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
            )}

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
        )}

        <div className={styles.residenceHallSection}>
          <div className={styles.sectionTitle}>
            <div
              className={`${styles.sectionTitleText} ${
                (errors?.residence_id || forceError?.residence_id) &&
                !selectedResidence
                  ? styles.facilitiesSectionErrorLabel
                  : ""
              }`}
            >
              Residence Hall
            </div>
          </div>

          {(() => {
            const selectedTransport = transportations.find(
              (t) => t.transport_id === Number(selectedTransportation)
            );
            const transportType = selectedTransport
              ? selectedTransport.type.toLowerCase()
              : "";
            const isTransportRestricted =
              transportType === "own car" || transportType === "school bus";

            return residenceHalls.map((residence) => {
              const isDormitoryOption = residence.type
                .toLowerCase()
                .includes("dormitory");

              if (isTransportRestricted && isDormitoryOption) {
                return null;
              }

              return (
                <div key={residence.residence_id} className={styles.optionItem}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="residenceHall"
                      value={String(residence.residence_id)}
                      checked={
                        selectedResidence === String(residence.residence_id)
                      }
                      onChange={() =>
                        handleResidenceChange(residence.residence_id)
                      }
                      onClick={() =>
                        handleResidenceChange(residence.residence_id)
                      }
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
              );
            });
          })()}

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
