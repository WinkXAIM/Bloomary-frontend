import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { checkAuth, signOut } from "./api/bloomaryApi";
import LoadingOverlay from "./components/common/LoadingOverlay";

const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Analyze = lazy(() => import("./pages/Analyze"));
const DetectedFlowers = lazy(() => import("./pages/DetectedFlowers"));
const Result = lazy(() => import("./pages/Result"));
const StoryPreview = lazy(() => import("./pages/StoryPreview"));
const History = lazy(() => import("./pages/History"));
const Recommend = lazy(() => import("./pages/Recommend"));

const PROTECTED_PATHS = new Set([
  "/home",
  "/analyze",
  "/detected",
  "/result",
  "/story",
  "/history",
  "/recommend",
]);

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isActive = true;
    const isProtectedPath = PROTECTED_PATHS.has(location.pathname);

    if (!isProtectedPath && location.pathname !== "/") {
      return undefined;
    }

    checkAuth().then((isAuthenticated) => {
      if (!isActive) return;

      if (isProtectedPath && !isAuthenticated) {
        navigate("/", { replace: true });
        return;
      }

      if (location.pathname === "/" && isAuthenticated) {
        navigate("/home", { replace: true });
      }
    });

    return () => {
      isActive = false;
    };
  }, [location.pathname, navigate]);

  return (
    <Suspense fallback={<LoadingOverlay isOpen />}>
      <Routes>
        <Route path="/" element={<Login onLogin={() => navigate("/home")} />} />
        <Route
          path="/home"
          element={
            <Home
              onGoAnalyze={() => navigate("/analyze")}
              onGoHistory={() => navigate("/history")}
              onGoRecommend={() => navigate("/recommend")}
              onLogout={async () => {
                await signOut();
                navigate("/");
              }}
            />
          }
        />
        <Route
          path="/analyze"
          element={
            <Analyze
              onBack={() => navigate("/home")}
              onAnalyze={(analysisInput) => navigate("/detected", { state: analysisInput })}
            />
          }
        />
        <Route
          path="/detected"
          element={
            <DetectedFlowers
              onBack={() => navigate("/analyze")}
              onGoResult={(analysis, context = {}) =>
                navigate("/result", {
                  state: {
                    from: "/detected",
                    analysis,
                    analysisId: analysis?.id,
                    imageFile: context.imageFile,
                  },
                })
              }
            />
          }
        />
        <Route
          path="/result"
          element={
            <Result
              onBack={() => navigate(location.state?.from ?? "/detected")}
              onGoStory={(analysis, context = {}) =>
                navigate("/story", {
                  state: {
                    from: location.state?.from ?? "/detected",
                    analysis: analysis ?? location.state?.analysis,
                    analysisId: analysis?.id ?? location.state?.analysisId,
                    imageFile: context.imageFile ?? location.state?.imageFile,
                  },
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
                  state: {
                    from: location.state?.from ?? "/detected",
                    analysis: location.state?.analysis,
                    analysisId: location.state?.analysisId,
                    imageFile: location.state?.imageFile,
                  },
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
              onView={(analysisId) =>
                navigate("/result", {
                  state: {
                    from: "/history",
                    analysisId,
                  },
                })
              }
            />
          }
        />
        <Route path="/recommend" element={<Recommend onBack={() => navigate("/home")} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
