import { useState, useEffect, useCallback } from "react";
import { MoonIcon, SunIcon, Sparkle, FileDown, Languages } from "lucide-react";
import useTranslate from "./useTranslate";

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : initialValue;
  });

  const saveToLocalStorage = useCallback(
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
    },
    [key]
  );

  return [value, saveToLocalStorage];
};

const PullCalculator = () => {
  const [currentPrimo, setCurrentPrimo] = useState("");
  const [currentFate, setCurrentFate] = useState("");
  const [pity, setPity] = useState("");
  const [targetPulls, setTargetPulls] = useState("");
  const [rateStatus, setRateStatus] = useState("");
  const [results, setResults] = useState(null);
  const [theme, setTheme] = useState("dark");

  // language functions
  const [language, setLanguage] = useState("en");
  const t = useTranslate(language);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("language", newLang); // Simpan pilihan bahasa
  };

  const [savedData, saveData] = useLocalStorage("genshinPullCalculator", {
    currentPrimo: "",
    currentFate: "",
    pity: "",
    targetPulls: "",
    rateStatus: "",
  });

  useEffect(() => {
    setCurrentPrimo(savedData.currentPrimo);
    setCurrentFate(savedData.currentFate);
    setPity(savedData.pity);
    setTargetPulls(savedData.targetPulls);
    setRateStatus(savedData.rateStatus);

    const savedLanguage = localStorage.getItem("language") || "en";
    setLanguage(savedLanguage);
  }, [savedData]);

  const calculateResults = () => {
    const primo = parseInt(currentPrimo) || 0;
    const fate = parseInt(currentFate) || 0;
    const target = parseInt(targetPulls) || 0;

    const totalCurrentPrimo = primo + fate * 160;
    const targetPrimo = target * 160;
    const primoShortage = Math.max(0, targetPrimo - totalCurrentPrimo);
    const fateConversion = Math.floor(totalCurrentPrimo / 160);
    const pullStatus =
      fateConversion >= target
        ? `${t.TargetPullsAchievable}`
        : `${t.TargetPullsNotAchievable}`;
    const extraFate = Math.max(0, fateConversion - target);

    const pullInfo = [90, 180, 270, 360, 450, 540].map((pulls, index) => {
      const requiredPrimo = pulls * 160;
      const canPull = totalCurrentPrimo >= requiredPrimo;
      let statusText = canPull ? `${t.CanPull}` : `${t.CannotPull}`;

      // Tentukan konten tambahan untuk status berdasarkan kondisi
      const sparkleElement = <Sparkle color="#0afbff" />;
      const additionalStatus =
        rateStatus === "on" ? (
          index % 2 === 0 ? (
            <>
              {" "}
              , {t.GuaranteedBanner} {sparkleElement}
            </>
          ) : (
            ", 50/50"
          )
        ) : index % 2 === 0 ? (
          ", 50/50"
        ) : (
          <>
            {" "}
            , {t.GuaranteedBanner} {sparkleElement}
          </>
        );

      // Gabungkan status dengan tambahan status jika bisa pull
      let statusJSX = (
        <div className="flex gap-2">
          {pulls}x pull: {statusText} {canPull && additionalStatus}
        </div>
      );

      return {
        statusText,
        statusJSX,
      };
    });

    setResults({
      targetPrimo,
      primoShortage,
      fateConversion,
      pullStatus,
      extraFate,
      pullInfo,
    });

    saveData({ currentPrimo, currentFate, pity, targetPulls, rateStatus });
  };

  const handleExport = () => {
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(savedData)
    )}`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "genshin_pull_calculator_data.json");
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        setCurrentPrimo(importedData.currentPrimo);
        setCurrentFate(importedData.currentFate);
        setPity(importedData.pity);
        setTargetPulls(importedData.targetPulls);
        setRateStatus(importedData.rateStatus);
        saveData(importedData);
      } catch {
        alert(
          `Error importing data from file "${file.name}". Please check the file format.`
        );
      } finally {
        event.target.value = null; // Reset input file
      }
    };
    reader.readAsText(file);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full bg-gradient-to-r from-slate-900 to-slate-700 rounded-box">
      <div className="card w-full max-w-md md:max-w-2xl mx-auto bg-base-200 shadow-xl my-4">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">{t.title}</h2>
              <p>{t.description}</p>
            </div>
            <div>
              <button
                onClick={toggleTheme}
                className="btn btn-ghost btn-circle"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="bahasa">
              <div
                className="tooltip tooltip-right tooltip-warning"
                data-tip={t.disclaimer}
              >
                <span className="label-text flex gap-1">
                  <Languages size={18} />
                  {t.lang}
                </span>
              </div>
            </label>
            <select
              onChange={handleLanguageChange}
              value={language}
              className="select select-bordered w-full mb-4"
            >
              <option value="en">English (US)</option>
              <option value="id">Indonesia</option>
              <option value="cn">Chinese</option>
              <option value="jp">Japanese</option>
            </select>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              calculateResults();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label" htmlFor="currentPrimo">
                  <span className="label-text">{t.currentPrimo}</span>
                </label>
                <input
                  id="currentPrimo"
                  type="number"
                  value={currentPrimo}
                  onChange={(e) => setCurrentPrimo(e.target.value)}
                  placeholder={t.CurrentDesc}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="currentFate">
                  <span className="label-text">{t.currentFate}</span>
                </label>
                <input
                  id="currentFate"
                  type="number"
                  value={currentFate}
                  onChange={(e) => setCurrentFate(e.target.value)}
                  placeholder={t.FateDesc}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label" htmlFor="pity">
                  <span className="label-text">{t.pity}</span>
                </label>
                <input
                  id="pity"
                  type="number"
                  value={pity}
                  onChange={(e) => setPity(e.target.value)}
                  placeholder={t.PityDesc}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="targetPulls">
                  <span className="label-text">{t.targetPulls}</span>
                </label>
                <input
                  id="targetPulls"
                  type="number"
                  value={targetPulls}
                  onChange={(e) => setTargetPulls(e.target.value)}
                  placeholder={t.PullDesc}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="rateStatus">
                <span className="label-text">{t.statusRate}</span>
              </label>
              <select
                id="rateStatus"
                value={rateStatus}
                onChange={(e) => setRateStatus(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="off">Off (50/50)</option>
                <option value="on">On (Guaranteed Banner)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-info w-full">
              {t.calculate}
            </button>
          </form>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleExport}
              className="group flex items-center justify-start w-11 h-11 bg-red-600 rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-32 hover:rounded-lg active:translate-x-1 active:translate-y-1"
            >
              <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-3">
                <FileDown color="#ffffff" />
              </div>
              <div className="absolute right-5 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                {t.export}
              </div>
            </button>

            <label htmlFor="import-file" className="btn btn-warning">
              {t.import}
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {results && (
            <div className="mt-6 space-y-4">
              <div className="mockup-code px-2 overflow-x-hidden">
                <pre data-prefix=">" className="text-success mb-2">
                  <code>{t.results}</code>
                </pre>

                <div className="mb-2  stats stats-vertical lg:stats-horizontal flex flex-col lg:flex-row shadow w-full">
                  <div className="stat place-items-center flex-1">
                    <div className="stat-title text-base">
                      {t.ConvertPrimotoFate}
                    </div>
                    <div className="stat-value text-secondary">
                      {results.fateConversion}
                    </div>
                    <div className="stat-desc">{t.fateConversionInfo}</div>
                  </div>

                  <div className="stat place-items-center flex-1">
                    <div className="stat-title">{t.RequiredPrimo}</div>
                    <div className="stat-value">{results.targetPrimo}</div>
                    <div className="stat-desc">
                      {t.TargettoAchieve} {targetPulls}
                    </div>
                  </div>

                  <div className="stat place-items-center flex-1">
                    <div className="stat-title">{t.ExcessFate}</div>
                    <div className="stat-value">{results.extraFate}</div>
                  </div>
                </div>

                <div className="stats stats-vertical flex flex-col shadow w-full">
                  <div className="stat place-items-center ">
                    <div className="stat-title">{t.PullStatus}</div>
                    <div
                      className={`stat-value text-secondary text-base  ${
                        results.pullStatus == `${t.TargetPullsAchievable}`
                          ? "text-green-500"
                          : "text-red-500"
                      } `}
                    >
                      {results.pullStatus}
                    </div>
                  </div>

                  <div className="stat place-items-center ">
                    <div className="stat-title">
                      {t.PrimoShortfallfromTarget}
                    </div>
                    <div className="stat-value">{results.primoShortage}</div>
                  </div>

                  <div className="stat place-items-left ">
                    <div className="stat-title place-content-center">
                      {t.PullStatusInformation}
                    </div>
                    <div className="stat-value"></div>
                    <div className="stat-value text-secondary text-base">
                      <ul className="list-disc list-inside">
                        {results.pullInfo.map((info, index) => (
                          <li
                            className={`list-none text-md ${
                              info.statusText.includes(`${t.CanPull}`)
                                ? "text-green-500"
                                : info.statusText.includes(`${t.CannotPull}`)
                                ? "text-red-500"
                                : "text-gray-500" // optional fallback if neither condition is met
                            }`}
                            key={index}
                          >
                            {info.statusJSX}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center items-center p-4 text-base">
        <h1 className="font-bold text-white">
          © 2024 Davincy Project. All rights reserved.
        </h1>
        <small className="text-blue-200">
          All icons and logo are property of their respective owners.
        </small>
      </div>
    </div>
  );
};

export default PullCalculator;
