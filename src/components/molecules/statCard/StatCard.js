import React from "react";
import mascot from "../../../assets/image/mascot.png";
import "../../css/StatCard.css";

const StatCard = () => (
  <div className="stat-card">
    <div className="stat-card-content">
      <div className="stat-card-number">1200</div>
      <div className="stat-card-label">Total active students</div>
    </div>
    <img src={mascot} alt="Mascot" className="stat-card-mascot" />
  </div>
);

export default StatCard;
