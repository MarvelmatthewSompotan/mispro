import React from "react";

import Sidebar from "../molecules/sidebar/Sidebar";
import StatCard from "../molecules/statCard/StatCard";
import ColorGrid from "../molecules/colorGrid/ColorGrid";
import mascot from "../../assets/image/mascot.png";
import "../css/HomePage.css";

const HomePage = () => (
  <div className="home-root">
  
    <Sidebar />
    <div className="home-main">
      <div className="home-inner">
        {/* <HeaderHome /> */}
        <div className="header-home">
          <div className="header-home-text">
            <div className="header-home-title">Hello Sarah!</div>
            <div className="header-home-subtitle">Welcome back</div>
          </div>
          <img src={mascot} alt="Mascot" className="header-home-mascot" />
        </div>
        <div className="home-content">
          <div className="home-left">
            <ColorGrid />
          </div>
          <div className="home-right">
            <StatCard />
            <div className="home-card home-card-empty" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;
