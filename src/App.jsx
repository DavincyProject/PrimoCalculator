import { useState, useEffect } from "react"; // Import useState dan useEffect
import Ascension from "./Components/Ascension";
import CV from "./Components/CV";
import PullCalculator from "./Components/PullCalculator";

const TABS = {
  PULL: "pull",
  CV: "cv",
  ASCENSION: "ascension",
};

const LOCAL_STORAGE_KEY = "activeAppTab";

function App() {
  // State untuk menyimpan tab yang aktif, default ke PULL jika tidak ada di localStorage
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedTab || TABS.PULL; // Default ke TABS.PULL jika tidak ada yang tersimpan
    }
    return TABS.PULL; // Fallback jika window tidak tersedia (SSR)
  });

  // Efek untuk menyimpan tab aktif ke localStorage setiap kali berubah
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (event) => {
    setActiveTab(event.target.value);
  };

  return (
    <div className="flex items-start min-h-dvh p-2">
      <div role="tablist" className="tabs tabs-lifted w-full">
        {/* Tab Pull Calculator */}
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab text-blue-500 [--tab-bg:theme(colors.blue.100)] "
          aria-label="Pull"
          value={TABS.PULL}
          checked={activeTab === TABS.PULL}
          onChange={handleTabChange}
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-4" // Tambahkan padding jika perlu
        >
          {activeTab === TABS.PULL && <PullCalculator />}
        </div>

        {/* Tab CV */}
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab text-blue-500 [--tab-bg:theme(colors.blue.100)] "
          aria-label="CV"
          value={TABS.CV}
          checked={activeTab === TABS.CV}
          onChange={handleTabChange}
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-4"
        >
          {activeTab === TABS.CV && <CV />}
        </div>

        {/* Tab Ascension */}
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab text-blue-500 [--tab-bg:theme(colors.blue.100)] "
          aria-label="Ascension"
          value={TABS.ASCENSION}
          checked={activeTab === TABS.ASCENSION}
          onChange={handleTabChange}
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-4"
        >
          {activeTab === TABS.ASCENSION && <Ascension />}
        </div>
      </div>
    </div>
  );
}

export default App;
