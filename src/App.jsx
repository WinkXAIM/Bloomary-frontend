import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import DetectedFlowers from "./pages/DetectedFlowers";
import Result from "./pages/Result";
import StoryPreview from "./pages/StoryPreview";
import History from "./pages/History";
import Recommend from "./pages/Recommend";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");

    if (code) {
      console.log("Kakao login success. auth code:", code);
      localStorage.setItem("isLoggedIn", "true");
      navigate("/home", { replace: true });
      return;
    }

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true" && location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={() => navigate("/home")} />} />
      <Route
        path="/home"
        element={
          <Home
            onGoAnalyze={() => navigate("/analyze")}
            onGoHistory={() => navigate("/history")}
            onGoRecommend={() => navigate("/recommend")}
          />
        }
      />
      <Route
        path="/analyze"
        element={
          <Analyze
            onBack={() => navigate("/home")}
            onAnalyze={() => navigate("/detected")}
          />
        }
      />
      <Route
        path="/detected"
        element={
          <DetectedFlowers
            onBack={() => navigate("/analyze")}
            onGoResult={() => navigate("/result", { state: { from: "/detected" } })}
          />
        }
      />
      <Route
        path="/result"
        element={
          <Result
            onBack={() => navigate(location.state?.from ?? "/detected")}
            onGoStory={() =>
              navigate("/story", {
                state: { from: location.state?.from ?? "/detected" },
              })
            }
          />
        }
      />
      <Route
        path="/story"
        element={
          <StoryPreview
            onBack={() =>
              navigate("/result", {
                state: { from: location.state?.from ?? "/detected" },
              })
            }
            onGoHome={() => navigate("/home")}
          />
        }
      />
      <Route
        path="/history"
        element={
          <History
            onBack={() => navigate("/home")}
            onView={() => navigate("/result", { state: { from: "/history" } })}
          />
        }
      />
      <Route path="/recommend" element={<Recommend onBack={() => navigate("/home")} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
