import React from 'react';
import styles from './PopUpUser.module.css';
import Button from '../../../atoms/Button';
import vectorDropdown from '../../../../assets/vector_dropdown.svg';

const PopUpCreateUser = ({ onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.popUpCreateNewUser}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.createNewUser}>Create new user</div>

        <div className={styles.frameParent}>
          <input
            type='text'
            placeholder='Username'
            className={styles.formInput}
          />

          <input
            type='email'
            placeholder='User Email'
            className={styles.formInput}
          />

          <input
            type='password'
            placeholder='User Password'
            className={styles.formInput}
          />

          <div className={styles.selectWrapper}>
            <select className={styles.formInput} defaultValue=''>
              <option value='' disabled>
                Role
              </option>
              <option value='admin'>Admin</option>
              <option value='user'>User</option>
              <option value='teacher'>Teacher</option>
            </select>
            <img
              src={vectorDropdown}
              alt='dropdown'
              className={styles.dropdownIcon}
            />
          </div>
        </div>

        <div className={styles.bAddSubjectParent}>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='solid'>Create</Button>
        </div>
      </div>
    </div>
  );
};

export default PopUpCreateUser;