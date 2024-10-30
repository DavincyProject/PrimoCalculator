import { useState, useEffect, useCallback } from "react";
import { MoonIcon, SunIcon, Sparkle, FileDown } from "lucide-react";

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
  const [rateStatus, setRateStatus] = useState("off");
  const [results, setResults] = useState(null);
  const [theme, setTheme] = useState("light");

  const [savedData, saveData] = useLocalStorage("genshinPullCalculator", {
    currentPrimo: "",
    currentFate: "",
    pity: "",
    targetPulls: "",
    rateStatus: "off",
  });

  useEffect(() => {
    setCurrentPrimo(savedData.currentPrimo);
    setCurrentFate(savedData.currentFate);
    setPity(savedData.pity);
    setTargetPulls(savedData.targetPulls);
    setRateStatus(savedData.rateStatus);
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
        ? "Sudah bisa pull sesuai target"
        : "Belum bisa pull sesuai target";
    const extraFate = Math.max(0, fateConversion - target);

    const pullInfo = [90, 180, 270, 360, 450].map((pulls, index) => {
      const requiredPrimo = pulls * 160;
      const canPull = totalCurrentPrimo >= requiredPrimo;
      let statusText = canPull ? "Bisa" : "Tidak bisa";

      // Tentukan konten tambahan untuk status berdasarkan kondisi
      const sparkleElement = <Sparkle color="#0afbff" />;
      const additionalStatus =
        rateStatus === "on" ? (
          index % 2 === 0 ? (
            <> , guaranteed banner {sparkleElement}</>
          ) : (
            ", 50/50"
          )
        ) : index % 2 === 0 ? (
          ", 50/50"
        ) : (
          <> , guaranteed banner {sparkleElement}</>
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

    saveData({ currentPrimo, currentFate, pity, targetPulls });
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
      } catch (error) {
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
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="card w-full max-w-md md:max-w-2xl mx-auto bg-base-200 shadow-xl my-4">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title">Kalkulator Pull Genshin Impact</h2>
            <p>Hitung kebutuhan primogem dan fate Anda</p>
          </div>
          <div>
            <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
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
                <span className="label-text">Primogem Sekarang</span>
              </label>
              <input
                id="currentPrimo"
                type="number"
                value={currentPrimo}
                onChange={(e) => setCurrentPrimo(e.target.value)}
                placeholder="Masukkan jumlah primogem"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="currentFate">
                <span className="label-text">Fate Sekarang</span>
              </label>
              <input
                id="currentFate"
                type="number"
                value={currentFate}
                onChange={(e) => setCurrentFate(e.target.value)}
                placeholder="Masukkan jumlah fate"
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label" htmlFor="pity">
                <span className="label-text">Pity</span>
              </label>
              <input
                id="pity"
                type="number"
                value={pity}
                onChange={(e) => setPity(e.target.value)}
                placeholder="Masukkan jumlah pity"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label" htmlFor="targetPulls">
                <span className="label-text">Target Pull</span>
              </label>
              <input
                id="targetPulls"
                type="number"
                value={targetPulls}
                onChange={(e) => setTargetPulls(e.target.value)}
                placeholder="Masukkan target pull"
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="rateStatus">
              <span className="label-text">Status Rate</span>
            </label>
            <select
              id="rateStatus"
              value={rateStatus}
              onChange={(e) => setRateStatus(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="off">Off</option>
              <option value="on">On</option>
            </select>
          </div>
          <button type="submit" className="btn btn-info w-full">
            Hitung
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
              Export
            </div>
          </button>

          <label htmlFor="import-file" className="btn btn-warning">
            Import Data
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
                <code>Hasil Perhitungan</code>
              </pre>

              <div className="mb-2  stats stats-vertical lg:stats-horizontal flex flex-col lg:flex-row shadow w-full">
                <div className="stat place-items-center flex-1">
                  <div className="stat-title text-base">
                    Konversi Primo ke Fate
                  </div>
                  <div className="stat-value text-secondary">
                    {results.fateConversion}
                  </div>
                </div>

                <div className="stat place-items-center flex-1">
                  <div className="stat-title">Target Primo yang dikoversi</div>
                  <div className="stat-value">{results.targetPrimo}</div>
                  <div className="stat-desc">
                    Target yang ingin dicapai : {targetPulls}
                  </div>
                </div>

                <div className="stat place-items-center flex-1">
                  <div className="stat-title">Kelebihan Fate</div>
                  <div className="stat-value">{results.extraFate}</div>
                </div>
              </div>

              <div className="stats stats-vertical flex flex-col shadow w-full">
                <div className="stat place-items-center ">
                  <div className="stat-title">Status Pull</div>
                  <div
                    className={`stat-value text-secondary text-base  ${
                      results.pullStatus == "Sudah bisa pull sesuai target"
                        ? "text-green-500"
                        : "text-red-500"
                    } `}
                  >
                    {results.pullStatus}
                  </div>
                </div>

                <div className="stat place-items-center ">
                  <div className="stat-title">Kekurangan Primo</div>
                  <div className="stat-value">{results.primoShortage}</div>
                </div>

                <div className="stat place-items-left ">
                  <div className="stat-title place-content-center">
                    Informasi Status Pull
                  </div>
                  <div className="stat-value"></div>
                  <div className="stat-value text-secondary text-base">
                    <ul className="list-disc list-inside">
                      {results.pullInfo.map((info, index) => (
                        <li
                          className={`list-none text-md ${
                            info.statusText.includes("Tidak bisa") ||
                            info.statusText.includes("50/50")
                              ? "text-red-500"
                              : "text-green-500"
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
  );
};

export default PullCalculator;
