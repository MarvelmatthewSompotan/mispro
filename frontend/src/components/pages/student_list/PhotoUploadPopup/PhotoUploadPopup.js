// src/components/PhotoUploadPopup/PhotoUploadPopup.js (Versi Baru dengan Cropper)
import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import styles from "./PhotoUploadPopup.module.css";
import getCroppedImg from "./cropImage"; // Kita akan buat file helper ini

const PhotoUploadPopup = ({ isOpen, onClose, onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // State baru untuk cropping
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // Fungsi yang dipanggil saat pengguna selesai mengatur area crop
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Fungsi untuk membaca file yang dipilih dan menampilkannya di cropper
  const handleFileSelectedForCropping = (file) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result);
    });
    reader.readAsDataURL(file);
  };

  // Handler untuk drag-and-drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleFileSelectedForCropping(file); // Tampilkan di cropper, bukan langsung kirim
      } else {
        alert("Please select an image file.");
      }
      e.dataTransfer.clearData();
    }
  }, []);

  // Handler untuk tombol browse
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelectedForCropping(e.target.files[0]); // Tampilkan di cropper
    }
  };

  // Fungsi untuk memproses gambar yang sudah di-crop dan mengirimkannya
  const showCroppedImage = useCallback(async () => {
    try {
      setIsCropping(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onFileSelect(croppedImage); // Kirim file yang sudah di-crop ke parent
      handleClose(); // Tutup popup setelah selesai
    } catch (e) {
      console.error(e);
    } finally {
      setIsCropping(false);
    }
    // eslint-disable-next-line
  }, [imageSrc, croppedAreaPixels, onFileSelect]);

  // Fungsi untuk mereset state dan menutup popup
  const handleClose = () => {
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    onClose();
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback(
    (e) => {
      handleDrag(e);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [handleDrag]
  );

  const handleDragOut = useCallback(
    (e) => {
      handleDrag(e);
      setIsDragging(false);
    },
    [handleDrag]
  );

  const onBrowseClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.popupContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          {" "}
          ×{" "}
        </button>

        {imageSrc ? (
          // Tampilan kedua: Cropper
          <>
            <div className={styles.cropperContainer}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={154 / 208} // Sesuaikan dengan rasio gambar profil Anda
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className={styles.controls}>
              <label>Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className={styles.zoomRange}
              />
            </div>
            <div className={styles.actionButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => setImageSrc(null)}
              >
                Change Photo
              </button>
              <button
                className={styles.saveButton}
                onClick={showCroppedImage}
                disabled={isCropping}
              >
                {isCropping ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </>
        ) : (
          // Tampilan pertama: Drag and Drop
          <div
            className={styles.dragAndDrop}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isDragging ? (
              <div className={styles.dropYourFileWrapper}>
                <div className={styles.dropYourFile}>Drop your file</div>
              </div>
            ) : (
              <div className={styles.dragAndDropYourFileHereParent}>
                <div className={styles.dragAndDropTitle}>
                  Drag and drop your file here
                </div>
                <div className={styles.or}>or</div>
                <button className={styles.browseButton} onClick={onBrowseClick}>
                  <div className={styles.browseText}>Browse</div>
                </button>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default PhotoUploadPopup;
