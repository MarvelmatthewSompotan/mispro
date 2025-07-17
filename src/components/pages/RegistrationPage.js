import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import RegistrationTable from "./RegistrationTable";
import RegistrationForm from "./RegistrationForm";
import PopUpForm from "./PopUpForm";
import "../css/RegistrationPage.css";

const RegistrationPage = () => {
  const [showPopUp, setShowPopUp] = useState(false);
  const [showForm, setShowForm] = useState(false);

  return (
    <MainLayout>
      {!showForm && (
        <>
          <RegistrationTable onNewForm={() => setShowPopUp(true)} />
          {showPopUp && (
            <PopUpForm
              onClose={() => setShowPopUp(false)}
              onCreate={(data) => {
                setShowPopUp(false);
                setShowForm(true);
                // data bisa disimpan jika ingin diteruskan ke RegistrationForm
              }}
            />
          )}
        </>
      )}
      {showForm && <RegistrationForm onBack={() => setShowForm(false)} />}
    </MainLayout>
  );
};

export default RegistrationPage;
