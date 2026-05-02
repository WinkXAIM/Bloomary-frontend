import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import DetectedFlowers from "./pages/DetectedFlowers";
import Result from "./pages/Result";
import StoryPreview from "./pages/StoryPreview";
import History from "./pages/History";
import Recommend from "./pages/Recommend";

function App() {
  const [page, setPage] = useState("login");

  // ⭐ 어디서 result로 왔는지 기억
  const [fromPage, setFromPage] = useState(null);

  if (page === "login") {
    return <Login onLogin={() => setPage("home")} />;
  }

  if (page === "analyze") {
    return (
      <Analyze
        onBack={() => setPage("home")}
        onAnalyze={() => setPage("detected")}
      />
    );
  }

  if (page === "detected") {
    return (
      <DetectedFlowers
        onBack={() => setPage("analyze")}

        onGoResult={() => {
          setFromPage("detected"); // ⭐ detected에서 왔다 기록
          setPage("result");
        }}
      />
    );
  }

  if (page === "result") {
    return (
      <Result
        onBack={() => setPage(fromPage)} // ⭐ 이전 페이지로 돌아감
        onGoStory={() => setPage("story")}
      />
    );
  }

  if (page === "story") {
    return (
      <StoryPreview
        onBack={() => setPage("result")}
        onGoHome={() => setPage("home")}
      />
    );
  }

  if (page === "history") {
    return (
      <History
        onBack={() => setPage("home")}

        onView={() => {
          setFromPage("history"); // ⭐ history에서 왔다 기록
          setPage("result");
        }}
      />
    );
  }

  if (page === "recommend") {
    return (
      <Recommend
        onBack={() => setPage("home")}
      />
    );
  }

  return (
    <Home
      onGoAnalyze={() => setPage("analyze")}
      onGoHistory={() => setPage("history")}
      onGoRecommend={() => setPage("recommend")}
    />
  );
}

export default App;