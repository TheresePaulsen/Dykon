import { useState } from "react";
import "./styles/main.scss";
import DuvetFinder from "./DuvetFinder";
import Header from "./components/Header";
import Footer from "./components/Footer";

const App = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1);
  const [quizKey, setQuizKey] = useState(0);

  return (
    <div className="app">
      {/* Skip to content link for accessibility */}
      <a href="#start-btn" className="skip-link">
        Spring til indhold
      </a>
      {/* Header */}
      <Header onLogoClick={() => setShowQuiz(false)} />

      {!showQuiz ? (
        /* Landing page */
        <main className="landing">
          <div className="landing-content">
            <div className="landing-image left">
              <img src="/Seng.jpeg" alt="Bedroom with duvet" />
            </div>

            <div className="landing-center">
              <h1>Træt af at vælge? Vi gør dynevalget lettere.</h1>

              <p className="intro-text">
                Flora Danicas værktøj kan hjælpe dig med at finde den perfekte
                dyne til dig, uanset om du har særlige behov eller blot ønsker
                en god nats søvn.
              </p>

              <p className="guide-text">
                Guiden præsenterer dig for fem spørgsmål som kan afklare dine
                behov, for at afgøre hvilke dyner der passer bedst til dig.
              </p>

              <p className="completion-text">
                Ved afslutning bliver du præsenteret for to dyner som bedst
                passer til dine behov. Der vil stå en oversigt over dynernes
                kvaliteter samt deres forskelle.
              </p>

              <button
                id="start-btn"
                className="start-btn"
                onClick={() => {
                  setQuizKey((prev) => prev + 1);
                  setQuizStep(1);
                  setShowQuiz(true);
                }}
              >
                Start dyneguiden
              </button>
            </div>

            <div className="landing-image right">
              <img src="/FoldetDyne.jpeg" alt="Stacked folded duvets" />
            </div>
          </div>
        </main>
      ) : (
        /* Quiz section */
        <main className="landing">
          <div
            className={`quiz-wrapper${
              quizStep === 6 ? " showing-results" : ""
            }`}
          >
            <div className="landing-image left">
              <img src="/Seng.jpeg" alt="Bedroom with duvet" />
            </div>
            <DuvetFinder key={quizKey} step={quizStep} setStep={setQuizStep} />
            <div className="landing-image right">
              <img src="/FoldetDyne.jpeg" alt="Stacked folded duvets" />
            </div>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default App;

