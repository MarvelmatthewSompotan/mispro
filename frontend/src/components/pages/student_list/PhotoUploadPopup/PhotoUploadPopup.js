// src/components/PhotoUploadPopup/PhotoUploadPopup.js
import React, { useState, useCallback, useRef } from "react";
import styles from "./PhotoUploadPopup.module.css";

const PhotoUploadPopup = ({ isOpen, onClose, onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleDrop = useCallback(
    (e) => {
      handleDrag(e);
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        } else {
          alert("Please select an image file.");
        }
        e.dataTransfer.clearData();
      }
    },
    [handleDrag, onFileSelect]
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const onBrowseClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.popupContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
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
