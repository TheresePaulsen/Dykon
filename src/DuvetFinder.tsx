// IMPORTER EXTERNE BIBLIOTEKER OG TYPES
import { useState, useMemo, useEffect, useRef } from "react";
import type { IDuvet } from "./types/IDuvet"; // Importerer interfaces
import dynerData from "../data/duvets.json"; // Importerer JSON-data fra den separate fil

import { useWeather } from "./hooks/useWeather";
import { getDuvetRecommendation } from "./utilities/getDuvetRecommendation";

// HJÆLPEFUNKTIONER UDEN FOR KOMPONENTEN 

// Funktion til at tjekke om en pris falder inden for brugerens valgte interval
const isPriceMatch = (price: number, range: string): boolean => {
  switch (range) {
    case "0-2000":
      return price <= 2000;
    case "2000-3500":
      return price >= 2000 && price < 3500;
    case "3500-5000":
      return price >= 3500 && price <= 5000;
    case "24000+":
      return price >= 24000;
    case "":
    default:
      return true; // Hvis ingen præference, matches alt
  }
};

// Normaliser variant-typen fra data, da nogle entries bruger 'Dyne' osv.
const normalizeVariantType = (t: string) => {
  const s = t.toLowerCase();
  if (s.includes("vinter") || s === "dyne") return "Vinterdyne";
  if (s.includes("sommer")) return "Sommerdyne";
  if (s.includes("helår") || s.includes("helars") || s.includes("helårs"))
    return "Helårsdyne";
  return t;
};

// Funktion til at generere den begrundede anbefaling (Krav 2: Begrundet anbefaling)
const getMatchReason = (
  dyne: IDuvet,
  userType: string,
  userInsulation: string
): string[] => {
  const reasons: string[] = [];

  if (dyne.allergyFriendly) {
    reasons.push("Allergivenlig");
  }

  if (dyne.fillings.toLowerCase().includes("edderdun")) {
    reasons.push("Luksuriøst fyld af Islandske Edderdun (højeste kvalitet)");
  } else if (dyne.fillings.toLowerCase().includes("moskusdun")) {
    reasons.push("Fyldt med Moskusdun");
  }

  const variantMatch = dyne.variants.find(
    (v) =>
      (userType === "Helårsdyne"
        ? normalizeVariantType(v.type) !== "Sommerdyne"
        : normalizeVariantType(v.type) === userType) &&
      v.insulation === userInsulation
  );

  if (variantMatch) {
    reasons.push(
      `Findes i en ${variantMatch.type} med ${variantMatch.insulation}-isolering (passer til dit behov)`
    );
  } else if (dyne.variants.some((v) => v.insulation === userInsulation)) {
    reasons.push(`Findes i den ønskede ${userInsulation}-isolering`);
  }

  if (dyne.properties.find((p) => p.toLowerCase().includes("kølende"))) {
    reasons.push("Har kølende og temperaturregulerende egenskaber");
  }

  return reasons;
};

// Helper to highlight differences
const getDuvetDifferences = (a: IDuvet, b: IDuvet) => {
  const diffs: Record<string, { a: string | number; b: string | number }> = {};
  if (a.fillings !== b.fillings)
    diffs["Fyld"] = { a: a.fillings, b: b.fillings };
  if (a.allergyFriendly !== b.allergyFriendly)
    diffs["Allergivenlig"] = {
      a: a.allergyFriendly ? "Ja" : "Nej",
      b: b.allergyFriendly ? "Ja" : "Nej",
    };
  if (a.quality !== b.quality)
    diffs["Kvalitet"] = { a: a.quality, b: b.quality };
  if (a.years_warranty !== b.years_warranty)
    diffs["Garanti"] = {
      a: a.years_warranty + " år",
      b: b.years_warranty + " år",
    };
  if (a.rating !== b.rating) diffs["Bedømmelse"] = { a: a.rating, b: b.rating };
  // Compare certifications
  if (JSON.stringify(a.certifications) !== JSON.stringify(b.certifications))
    diffs["Certificeringer"] = {
      a: a.certifications.join(", "),
      b: b.certifications.join(", "),
    };
  // Compare properties
  if (JSON.stringify(a.properties) !== JSON.stringify(b.properties))
    diffs["Egenskaber"] = {
      a: a.properties.join(", "),
      b: b.properties.join(", "),
    };
  return diffs;
};

type DuvetVariant = {
  id: string | number;
  length: number;
  width: number;
  price: number;
  insulation: string;
  type: string;
};

const DuvetResultCard = ({
  dyne,
  userType,
  userInsulation,
  userPriceRange,
  isExact,
  mismatchReasons,
  selectedVariant,
  onSelect,
}: {
  dyne: IDuvet;
  userType: string;
  userInsulation: string;
  userPriceRange: string;
  isExact?: boolean;
  mismatchReasons?: string[];
  selectedVariant: DuvetVariant | null;
  onSelect: (variant: DuvetVariant) => void;
}) => {
  // Først: find varianter der matcher brugerens eksplicitte valg (pris, type og isolering),
  // når disse er angivet. vælg den billigste af de matchende varianter.
  const candidates = dyne.variants.filter((v) => {
    const priceOk = userPriceRange
      ? isPriceMatch(v.price, userPriceRange)
      : true;
    // Match type with same Helårsdyne logic as calculateMatches: Helårs should match any non-sommer variant
    const typeOk = userType
      ? userType === "Helårsdyne"
        ? normalizeVariantType(v.type) !== "Sommerdyne"
        : normalizeVariantType(v.type) === userType
      : true;
    const insOk = userInsulation ? v.insulation === userInsulation : true;
    return priceOk && typeOk && insOk;
  });

  let bestVariant = null as (typeof dyne.variants)[0] | null;
  if (candidates.length > 0) {
    bestVariant = candidates.sort((a, b) => a.price - b.price)[0];
  } else {
    // Fald tilbage til tidligere logik (vis billigste variant) hvis intet matcher præcist
    bestVariant = dyne.variants.slice().sort((a, b) => a.price - b.price)[0];
  }

  const priceDisplay = bestVariant
    ? `Fra ${bestVariant.price.toLocaleString("da-DK")} DKK`
    : "Pris ikke fundet";

  return (
    <div className="duvet-result-card">
      <img src={dyne.images[0]} alt={dyne.name} />
      <h4>{dyne.name}</h4>
      <p>
        <strong>{priceDisplay}</strong>
      </p>
      <ul className="duvet-match-reason">
        {getMatchReason(dyne, userType, userInsulation).map((reason, idx) => (
          <li key={idx}>{reason}</li>
        ))}
      </ul>

      <div className="duvet-variant-container">
        <strong>Tilgængelige størrelser:</strong>
        <ul
          className="duvet-variant-list"
          aria-label="Vælg variant størrelse og isolering"
        >
          {dyne.variants
            .filter((v) => {
              // Only show variants that match insulation if user selected it
              if (userInsulation) {
                return v.insulation === userInsulation;
              }
              return true;
            })
            .sort((a, b) => a.price - b.price)
            .map((v) => {
              const isSelected = selectedVariant && v.id === selectedVariant.id;
              return (
                <li
                  key={v.id}
                  className={`duvet-variant-item${
                    isSelected ? " selected" : ""
                  }`}
                  onClick={() => onSelect(v)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected ? true : false}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(v);
                    }
                  }}
                >
                  <div className="variant-details">
                    <div className="variant-size">
                      {v.length}x{v.width} cm — {v.insulation}
                    </div>
                    <div className="variant-type">
                      {normalizeVariantType(v.type)}
                    </div>
                  </div>
                  <div className="variant-price">
                    {v.price.toLocaleString("da-DK")} DKK
                  </div>
                </li>
              );
            })}
        </ul>
        {userInsulation &&
          !dyne.variants.some((v) => v.insulation === userInsulation) && (
            <div className="no-variant-match">
              Ingen varianter matcher din valgte isolering.
            </div>
          )}
        {selectedVariant &&
          dyne.variants.some((v) => v.id === selectedVariant.id) && (
            <div className="add-to-cart-container">
              <button
                onClick={() =>
                  console.log(
                    `Added to cart: ${selectedVariant.length}x${
                      selectedVariant.width
                    } cm - ${selectedVariant.price.toLocaleString("da-DK")} DKK`
                  )
                }
                className="add-to-cart-button"
                aria-label={`Læg variant ${selectedVariant.length}x${
                  selectedVariant.width
                } cm, ${selectedVariant.price.toLocaleString(
                  "da-DK"
                )} DKK i kurv`}
              >
                Læg i kurv
              </button>
            </div>
          )}
      </div>
      {isExact === false ? (
        <div className="duvet-alternative-note">
          Alternativ — {mismatchReasons?.join(" • ")}
        </div>
      ) : (
        <div className="exact-note">Nøjagtigt match</div>
      )}
    </div>
  );
};

// Hjælpekomponent til at vise status
const QuestionStatus = ({
  currentStep,
  TOTAL_QUESTIONS,
}: {
  currentStep: number;
  TOTAL_QUESTIONS: number;
}) => (
  <p className="question-status">
    Spørgsmål {currentStep} ud af {TOTAL_QUESTIONS}
  </p>
);

const TOTAL_QUESTIONS = 5;

const WeatherDuvetChecker = () => {
  const [city, setCity] = useState("");
  const { temperature, loading, error, fetchWeather } = useWeather();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchWeather(city);
  };

  return (
    <section aria-labelledby="weather-check-heading">
      <h3 id="weather-check-heading">
        Find den rette dyne baseret på vejret i din by
      </h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="city-input">Indtast bynavn:</label>
          <input
            id="city-input"
            type="text"
            autoComplete="off"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Henter vejr..." : "Tjek vejr"}
        </button>
      </form>

      <div aria-live="polite">
        {error && <p className="weather-error">{error}</p>}
        {temperature !== null && (
          <div>
            <p>
              Temperatur: <strong>{temperature}°C</strong>
            </p>
            <p>
              Anbefalet dyne:{" "}
              <strong>{getDuvetRecommendation(temperature)}</strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

// HOVEDKOMPONENT 

const DuvetFinder = ({
  step,
  setStep,
}: {
  step: number;
  setStep: (s: number) => void;
}) => {
  // 2. STATE DEKLARATION
  // accessibility - focus first option on step change
  const firstOptionRef = useRef<HTMLButtonElement | null>(null);
  const [type, setType] = useState<
    "Sommerdyne" | "Vinterdyne" | "Helårsdyne" | ""
  >("");
  const [allergyFriendly, setAllergyFriendly] = useState<
    "allergy friendly" | "not_allergy_friendly" | ""
  >("");
  const [filling, setFilling] = useState<"musk_down" | "eider_down" | "">("");
  const [insulation, setInsulation] = useState<
    "Sval" | "Varm" | "Ekstra varm" | ""
  >("");
  const [priceRange, setPriceRange] = useState<
    "0-2000" | "2000-3500" | "3500-5000" | "24000+" | ""
  >("");
  const [topMatches, setTopMatches] = useState<
    Array<{ dyne: IDuvet; exact: boolean; mismatchReasons: string[] }>
  >([]);
  const [bestVariant, setBestVariant] = useState<{
    id: string | number;
    length: number;
    width: number;
    price: number;
  } | null>(null);

  // track selected answers for current question
  const [selectedType, setSelectedType] = useState<
    "Sommerdyne" | "Vinterdyne" | "Helårsdyne" | "unselected"
  >("unselected");
  const [selectedAllergy, setSelectedAllergy] = useState<
    "allergy friendly" | "not_allergy_friendly" | "no_preference" | "unselected"
  >("unselected");
  const [selectedFilling, setSelectedFilling] = useState<
    "musk_down" | "eider_down" | "no_preference" | "unselected"
  >("unselected");
  const [selectedInsulation, setSelectedInsulation] = useState<
    "Sval" | "Varm" | "Ekstra varm" | "no_preference" | "unselected"
  >("unselected");
  const [selectedPrice, setSelectedPrice] = useState<
    | "0-2000"
    | "2000-3500"
    | "3500-5000"
    | "24000+"
    | "no_preference"
    | "unselected"
  >("unselected");
  // Error message for quiz step
  const [quizError, setQuizError] = useState<string>("");

  // LOGIK OG FUNKTIONER

  // Funktion til at gå til næste spørgsmål efter at have valgt et svar

  // Focus first option on step change - accessibility
  useEffect(() => {
    if (step >= 1 && step <= 5 && firstOptionRef.current) {
      firstOptionRef.current.focus();
    }
  }, [step]);
  function handleProceedQuestion() {
    // Validate selection for current step
    if (step === 1 && selectedType === "unselected") {
      setQuizError("Vælg venligst en dyne-type før du går videre.");
      return;
    }
    if (step === 2 && selectedAllergy === "unselected") {
      setQuizError("Vælg venligst om du ønsker allergivenlighed.");
      return;
    }
    if (step === 3 && selectedFilling === "unselected") {
      setQuizError("Vælg venligst en fyld-type eller ingen præference.");
      return;
    }
    if (step === 4 && selectedInsulation === "unselected") {
      setQuizError("Vælg venligst et varmebehov eller ingen præference.");
      return;
    }
    if (step === 5 && selectedPrice === "unselected") {
      setQuizError("Vælg venligst et prisinterval eller ingen præference.");
      return;
    }
    setQuizError("");
    // Save the selected answer and proceed
    if (step === 1) {
      setType(selectedType === "unselected" ? "" : selectedType);
    } else if (step === 2) {
      setAllergyFriendly(
        selectedAllergy === "no_preference" || selectedAllergy === "unselected"
          ? ""
          : selectedAllergy
      );
    } else if (step === 3) {
      setFilling(
        selectedFilling === "no_preference" || selectedFilling === "unselected"
          ? ""
          : selectedFilling
      );
    } else if (step === 4) {
      setInsulation(
        selectedInsulation === "no_preference" ||
          selectedInsulation === "unselected"
          ? ""
          : selectedInsulation
      );
    } else if (step === 5) {
      setPriceRange(
        selectedPrice === "no_preference" || selectedPrice === "unselected"
          ? ""
          : selectedPrice
      );
    }
    setStep(step + 1);
  }

  // Funktion til at nulstille quizzen
  function reset() {
    setStep(1);
    setType("");
    setAllergyFriendly("");
    setFilling("");
    setInsulation("");
    setPriceRange("");
    setTopMatches([]);
    setSelectedType("unselected");
    setSelectedAllergy("unselected");
    setSelectedFilling("unselected");
    setSelectedInsulation("unselected");
    setSelectedPrice("unselected");
  }

  // Matchningslogik (Kører kun når svarene ændres) — soft UX: prefer matches but keep alternatives
  const calculateMatches = useMemo(() => {
    if (step !== TOTAL_QUESTIONS + 1) return [];

    const scoredDuvets = dynerData
      .map((dyne) => {
        let score = 0;
        const mismatchReasons: string[] = [];

        // 1. Allergivenlighed
        if (allergyFriendly === "allergy friendly" && dyne.allergyFriendly) {
          score += 10;
        }

        // 2. Fyld
        const fillingsText = (dyne.fillings || "").toLowerCase();
        if (filling === "eider_down") {
          if (fillingsText.includes("edderdun")) {
            score += 8;
          } else {
            mismatchReasons.push("Indeholder ikke edderdun");
          }
        } else if (filling === "musk_down") {
          if (fillingsText.includes("moskusdun")) {
            score += 6;
          } else {
            mismatchReasons.push("Indeholder ikke moskusdun");
          }
        }

        // 3. Perfekt Variant Match (type, isolering & pris)
        const matchingVariant = dyne.variants.find(
          (v) =>
            (type === "Helårsdyne"
              ? normalizeVariantType(v.type) !== "Sommerdyne"
              : normalizeVariantType(v.type) === type) &&
            (insulation ? v.insulation === insulation : true) &&
            (priceRange ? isPriceMatch(v.price, priceRange) : true)
        );

        if (matchingVariant) {
          score += 10; // bonus for en direkte variant-match
        } else {
          // Collect mismatch reasons 
          const hasType = type
            ? dyne.variants.some((v) => normalizeVariantType(v.type) === type)
            : false;
          const hasIns = insulation
            ? dyne.variants.some((v) => v.insulation === insulation)
            : false;
          const hasPrice = priceRange
            ? dyne.variants.some((v) => isPriceMatch(v.price, priceRange))
            : false;

          // Only add single-criterion messages if BOTH criteria are not present for a combined message
          if (type && !hasType && !(insulation && priceRange)) {
            mismatchReasons.push("Ingen variant i valgt type");
          }
          if (insulation && !hasIns && !(type && priceRange)) {
            mismatchReasons.push("Ingen variant i valgt isolering");
          }
          if (priceRange && !hasPrice && !(type && insulation)) {
            mismatchReasons.push("Ingen varianter i valgt prisinterval");
          }

          // If no single variant matches all selected criteria, add a specific combined reason
          // describing which pair-wise combination is missing, but only if both individual criteria exist
          // Also, if NO variant matches all selected criteria at once, always add a combined message
          if (!matchingVariant && (type || insulation || priceRange)) {
            const typeCheck = (v: DuvetVariant) =>
              type === "Helårsdyne"
                ? normalizeVariantType(v.type) !== "Sommerdyne"
                : normalizeVariantType(v.type) === type;
            const hasTypeIns =
              type && insulation
                ? dyne.variants.some(
                    (v) => typeCheck(v) && v.insulation === insulation
                  )
                : false;
            const hasTypePrice =
              type && priceRange
                ? dyne.variants.some(
                    (v) => typeCheck(v) && isPriceMatch(v.price, priceRange)
                  )
                : false;
            const hasInsPrice =
              insulation && priceRange
                ? dyne.variants.some(
                    (v) =>
                      v.insulation === insulation &&
                      isPriceMatch(v.price, priceRange)
                  )
                : false;

            // If all three criteria are present, check for triple-combo
            if (type && insulation && priceRange) {
              const hasAll = dyne.variants.some(
                (v) =>
                  typeCheck(v) &&
                  v.insulation === insulation &&
                  isPriceMatch(v.price, priceRange)
              );
              if (!hasAll) {
                mismatchReasons.push(
                  "Ingen variant matcher både valgt type, isolering og prisinterval"
                );
              }
            } else if (type && insulation && hasType && hasIns && !hasTypeIns) {
              mismatchReasons.push(
                "Ingen variant matcher både valgt type og isolering"
              );
            } else if (
              type &&
              priceRange &&
              hasType &&
              hasPrice &&
              !hasTypePrice
            ) {
              mismatchReasons.push(
                "Ingen variant matcher både valgt type og prisinterval"
              );
            } else if (
              insulation &&
              priceRange &&
              hasIns &&
              hasPrice &&
              !hasInsPrice
            ) {
              mismatchReasons.push(
                "Ingen variant matcher både valgt isolering og prisinterval"
              );
            }
          }
        }

        // 4. Varme/Isolering (Sekundær match)
        if (
          insulation &&
          dyne.variants.some((v) => v.insulation === insulation)
        ) {
          score += 3;
        }

        return { dyne, score, mismatchReasons };
      })
      .sort((a, b) => b.score - a.score);

    // Map to include exact flag and pick top 2
    return scoredDuvets
      .map((item) => ({
        dyne: item.dyne as unknown as IDuvet,
        exact: item.mismatchReasons.length === 0,
        mismatchReasons: item.mismatchReasons,
      }))
      .slice(0, 2);
  }, [step, type, allergyFriendly, filling, insulation, priceRange]);

  // Opdater topMatches når vi når resultat step 
  useEffect(() => {
    if (step === TOTAL_QUESTIONS + 1) {
      setTopMatches(calculateMatches);
    }
  }, [step, calculateMatches]);

  // RENDERING (JSX)

  return (
    <div className="duvet-finder-wrapper">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Spring til indhold
      </a>
      <div className="duvet-finder-center">
        <h2 className="duvet-finder-title">Find din ideelle dyne</h2>

        {/* step 1 til 5: Spørgsmål */}
        {step >= 1 && step <= 5 && (
          <main className="duvet-finder-container">
            {/* step 1: Type (Spørgsmål 1/5) */}
            {step === 1 && (
              <>
                <QuestionStatus
                  currentStep={1}
                  TOTAL_QUESTIONS={TOTAL_QUESTIONS}
                />
                <p>Søger du en sommer, vinter eller helårsdyne?</p>
                <button
                  ref={firstOptionRef}
                  onClick={() => {
                    setSelectedType("Sommerdyne");
                    setQuizError("");
                  }}
                  className={
                    selectedType === "Sommerdyne"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Sommerdyne
                </button>
                <button
                  onClick={() => {
                    setSelectedType("Vinterdyne");
                    setQuizError("");
                  }}
                  className={
                    selectedType === "Vinterdyne"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Vinterdyne
                </button>
                <button
                  onClick={() => {
                    setSelectedType("Helårsdyne");
                    setQuizError("");
                  }}
                  className={
                    selectedType === "Helårsdyne"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Helårsdyne
                </button>
                <button
                  onClick={handleProceedQuestion}
                  className="quiz-proceed-btn"
                >
                  Næste spørgsmål
                </button>
                {quizError && (
                  <div className="quiz-error" role="alert">
                    {quizError}
                  </div>
                )}
              </>
            )}

            {/* step 2: Allergi (Spørgsmål 2/5) */}
            {step === 2 && (
              <>
                <QuestionStatus
                  currentStep={2}
                  TOTAL_QUESTIONS={TOTAL_QUESTIONS}
                />
                <p>Har du behov for en allergivenlig dyne?</p>
                <button
                  ref={firstOptionRef}
                  onClick={() => {
                    setSelectedAllergy("allergy friendly");
                    setQuizError("");
                  }}
                  className={
                    selectedAllergy === "allergy friendly"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Allergivenlig
                </button>
                <button
                  onClick={() => {
                    setSelectedAllergy("not_allergy_friendly");
                    setQuizError("");
                  }}
                  className={
                    selectedAllergy === "not_allergy_friendly"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Ikke allergivenlig
                </button>
                <button
                  onClick={() => {
                    setSelectedAllergy("no_preference");
                    setQuizError("");
                  }}
                  className={
                    selectedAllergy === "no_preference"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Ved ikke / ingen præference
                </button>
                <button
                  onClick={handleProceedQuestion}
                  className="quiz-proceed-btn"
                >
                  Næste spørgsmål
                </button>
                {quizError && (
                  <div className="quiz-error" role="alert">
                    {quizError}
                  </div>
                )}
              </>
            )}

            {/* step 3: Fyld (Spørgsmål 3/5) */}
            {step === 3 && (
              <>
                <QuestionStatus
                  currentStep={3}
                  TOTAL_QUESTIONS={TOTAL_QUESTIONS}
                />
                <p>Hvilken type dun foretrækker du i din dyne?</p>
                <button
                  ref={firstOptionRef}
                  onClick={() => {
                    setSelectedFilling("musk_down");
                    setQuizError("");
                  }}
                  className={
                    selectedFilling === "musk_down"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Moskusdun
                </button>
                <button
                  onClick={() => {
                    setSelectedFilling("eider_down");
                    setQuizError("");
                  }}
                  className={
                    selectedFilling === "eider_down"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Edderdun
                </button>
                <button
                  onClick={() => {
                    setSelectedFilling("no_preference");
                    setQuizError("");
                  }}
                  className={
                    selectedFilling === "no_preference"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Ved ikke / ingen præference
                </button>
                <button
                  onClick={handleProceedQuestion}
                  className="quiz-proceed-btn"
                >
                  Næste spørgsmål
                </button>
                {quizError && (
                  <div className="quiz-error" role="alert">
                    {quizError}
                  </div>
                )}
              </>
            )}

            {/* step 4: Varmebehov (Spørgsmål 4/5) */}
            {step === 4 && (
              <>
                <QuestionStatus
                  currentStep={4}
                  TOTAL_QUESTIONS={TOTAL_QUESTIONS}
                />
                <p>Hvordan er dit personlige varmebehov, når du sover?</p>
                <button
                  ref={firstOptionRef}
                  onClick={() => {
                    setSelectedInsulation("Sval");
                    setQuizError("");
                  }}
                  className={
                    selectedInsulation === "Sval"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Sval (Jeg får let varmen)
                </button>
                <button
                  onClick={() => {
                    setSelectedInsulation("Varm");
                    setQuizError("");
                  }}
                  className={
                    selectedInsulation === "Varm"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Varm (Normal temperatur)
                </button>
                <button
                  onClick={() => {
                    setSelectedInsulation("Ekstra varm");
                    setQuizError("");
                  }}
                  className={
                    selectedInsulation === "Ekstra varm"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Ekstra varm (Jeg fryser let)
                </button>
                <button
                  onClick={() => {
                    setSelectedInsulation("no_preference");
                    setQuizError("");
                  }}
                  className={
                    selectedInsulation === "no_preference"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Ved ikke / ingen præference
                </button>
                <button
                  onClick={handleProceedQuestion}
                  className="quiz-proceed-btn"
                >
                  Næste spørgsmål
                </button>
                {quizError && (
                  <div className="quiz-error" role="alert">
                    {quizError}
                  </div>
                )}
              </>
            )}

            {/* step 5: Pris (Spørgsmål 5/5) */}
            {step === 5 && (
              <>
                <QuestionStatus
                  currentStep={5}
                  TOTAL_QUESTIONS={TOTAL_QUESTIONS}
                />
                <p>Hvilket prisinterval passer bedst til dit budget?</p>
                <button
                  ref={firstOptionRef}
                  onClick={() => {
                    setSelectedPrice("0-2000");
                    setQuizError("");
                  }}
                  className={
                    selectedPrice === "0-2000"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Under 2.000,-
                </button>
                <button
                  onClick={() => {
                    setSelectedPrice("2000-3500");
                    setQuizError("");
                  }}
                  className={
                    selectedPrice === "2000-3500"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  2.000 - 3.500,-
                </button>
                <button
                  onClick={() => {
                    setSelectedPrice("3500-5000");
                    setQuizError("");
                  }}
                  className={
                    selectedPrice === "3500-5000"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  3.500 - 5.000,-
                </button>
                <button
                  onClick={() => {
                    setSelectedPrice("24000+");
                    setQuizError("");
                  }}
                  className={
                    selectedPrice === "24000+"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Over 24.000,- (luksus edderdun)
                </button>
                <button
                  onClick={() => {
                    setSelectedPrice("no_preference");
                    setQuizError("");
                  }}
                  className={
                    selectedPrice === "no_preference"
                      ? "quiz-option-btn selected"
                      : "quiz-option-btn"
                  }
                >
                  Ved ikke / ingen præference
                </button>
                <button
                  onClick={handleProceedQuestion}
                  className="quiz-proceed-btn"
                >
                  Se dit resultat
                </button>
                {quizError && (
                  <div className="quiz-error" role="alert">
                    {quizError}
                  </div>
                )}
              </>
            )}
          </main>
        )}

        {/* step 6: Resultat */}
        {step === 6 && (
          <div className="duvet-results-wrapper">
            <div className="duvet-summary">
              <h4>Du har valgt:</h4>
              <ul>
                <li>
                  <strong>Type:</strong> {type || "Ingen præference"}
                </li>
                <li>
                  <strong>Allergivenlig:</strong>{" "}
                  {allergyFriendly === "allergy friendly"
                    ? "Ja"
                    : allergyFriendly === "not_allergy_friendly"
                    ? "Nej"
                    : "Ingen præference"}
                </li>
                <li>
                  <strong>Fyld:</strong>{" "}
                  {filling === "musk_down"
                    ? "Moskusdun"
                    : filling === "eider_down"
                    ? "Edderdun"
                    : "Ingen præference"}
                </li>
                <li>
                  <strong>Isolering:</strong> {insulation || "Ingen præference"}
                </li>
                <li>
                  <strong>Pris:</strong>{" "}
                  {priceRange === "0-2000"
                    ? "0-2.000 kr"
                    : priceRange === "2000-3500"
                    ? "2.000-3.500 kr"
                    : priceRange === "3500-5000"
                    ? "3.500-5.000 kr"
                    : priceRange === "24000+"
                    ? "24.000+ kr"
                    : "Ingen præference"}
                </li>
              </ul>
            </div>
            <h3>Dine top 2 anbefalinger:</h3>
            <div className="duvet-results-container">
              {topMatches.length > 0 ? (
                (() => {
                  let highlightDiffs: Record<string, boolean> = {};
                  if (topMatches.length === 2) {
                    const diffs = getDuvetDifferences(
                      topMatches[0].dyne,
                      topMatches[1].dyne
                    );
                    Object.keys(diffs).forEach((label) => {
                      highlightDiffs[label] = true;
                    });
                  }
                  return topMatches.map((item) => (
                    <DuvetResultCard
                      key={item.dyne.id}
                      dyne={item.dyne}
                      userType={type}
                      userInsulation={insulation}
                      userPriceRange={priceRange}
                      isExact={item.exact}
                      mismatchReasons={item.mismatchReasons}
                      selectedVariant={
                        bestVariant &&
                        item.dyne.variants.some((v) => v.id === bestVariant.id)
                          ? (item.dyne.variants.find(
                              (v) => v.id === bestVariant.id
                            ) as DuvetVariant)
                          : null
                      }
                      onSelect={(variant) => setBestVariant(variant)}
                    />
                  ));
                })()
              ) : (
                <p>
                  Vi kunne desværre ikke finde et direkte match baseret på dine
                  kriterier. Prøv at starte forfra med færre præferencer.
                </p>
              )}
            </div>
            {/* Difference summary below recommendations */}
            {topMatches.length === 2 &&
              (() => {
                const diffs = getDuvetDifferences(
                  topMatches[0].dyne,
                  topMatches[1].dyne
                );
                const diffLabels = Object.keys(diffs);
                if (diffLabels.length === 0)
                  return (
                    <div className="duvet-diff-summary">
                      De to dyner minder meget om hinanden.
                    </div>
                  );
                const nameA = topMatches[0].dyne.name;
                const nameB = topMatches[1].dyne.name;
                return (
                  <div className="duvet-diff-summary">
                    <strong className="duvet-diff-heading">
                      Hovedforskelle:
                    </strong>
                    <table
                      className="duvet-diff-table"
                      aria-label="Sammenligning af hovedforskelle mellem de to top dyner"
                    >
                      <thead>
                        <tr>
                          <th></th>
                          <th>{nameA}</th>
                          <th>{nameB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffLabels.map((label) => (
                          <tr key={label}>
                            <td>{label}</td>
                            <td className="duvet-diff-value-a">
                              {diffs[label].a}
                            </td>
                            <td className="duvet-diff-value-b">
                              {diffs[label].b}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            <button onClick={reset} className="reset-button">
              Start forfra
            </button>
          </div>
        )}

        <div className="weather-checker-wrapper">
          <WeatherDuvetChecker />
        </div>
      </div>
    </div>
  );
};

export default DuvetFinder;
