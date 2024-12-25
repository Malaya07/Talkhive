import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    const handleOpenApp = () => {
        navigate("/signin");
    };

    return (
        <div
            className="landing-page"
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                backgroundImage: "url('/back.gif')", // Replace with the path to your GIF
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Content */}
            <div style={{ position: "relative", zIndex: 1, color: "white", textAlign: "center" }}>
                <div className="logo-container">
                    <h1 className="app-name">
                        {/* Talk */}
                        <span className="talk">Talk</span>

                        {/* Hive */}
                        <span className="hive">
                            <span>h</span>
                            <span>i</span>
                            <span>v</span>
                            <span>e</span>
                        </span>
                    </h1>
                    <p className="tagline">"Connecting Conversations, Instantly."</p>
                </div>
                <button className="open-app-button" onClick={handleOpenApp}>
                    Open App
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
