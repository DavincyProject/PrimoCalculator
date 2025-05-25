"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, ExternalLink } from "lucide-react"; // ChevronDown tidak lagi diimpor di sini
import SearchableCharacterDropdown from "./SearchableCharacterDropdown"; // Impor komponen baru

// ... (useEffect hooks dan fungsi lainnya tetap sama seperti sebelumnya) ...

function Ascension() {
  const [allCharacterData, setAllCharacterData] = useState({});
  const [characterNames, setCharacterNames] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [owned, setOwned] = useState({});
  const [isLoadingOwned, setIsLoadingOwned] = useState(true);

  // Efek untuk mengambil data material karakter dari file JSON
  useEffect(() => {
    setIsInitialDataLoading(true);
    fetch("/json/characterMaterials.json") // Pastikan path ini benar
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAllCharacterData(data);
        const names = Object.keys(data).sort();
        setCharacterNames(names);

        if (names.length > 0) {
          const savedChar = localStorage.getItem(
            "ascensionTool_selectedCharacter"
          );
          if (savedChar && names.includes(savedChar)) {
            setSelectedCharacter(savedChar);
          } else {
            setSelectedCharacter(names[0]);
          }
        } else {
          setSelectedCharacter(null);
        }
        setIsInitialDataLoading(false);
      })
      .catch((error) => {
        console.error("Gagal mengambil data material karakter:", error);
        setIsInitialDataLoading(false);
        setCharacterNames([]);
        setAllCharacterData({});
      });
  }, []);

  // Efek untuk memuat daftar material dan 'owned' materials
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      selectedCharacter &&
      Object.keys(allCharacterData).length > 0
    ) {
      setIsLoadingOwned(true);
      setMaterials(allCharacterData[selectedCharacter] || []);
      const storageKey = `ascensionTool_ownedMaterials_${selectedCharacter}`;
      const savedOwned = localStorage.getItem(storageKey);
      if (savedOwned) {
        try {
          setOwned(JSON.parse(savedOwned));
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          setOwned({});
        }
      } else {
        setOwned({});
      }
      setIsLoadingOwned(false);
    } else if (!selectedCharacter && Object.keys(allCharacterData).length > 0) {
      setOwned({});
      setMaterials([]);
      setIsLoadingOwned(false);
    }
  }, [selectedCharacter, allCharacterData]);

  // Efek untuk menyimpan 'owned' materials
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      selectedCharacter &&
      !isLoadingOwned &&
      !isInitialDataLoading
    ) {
      localStorage.setItem(
        `ascensionTool_ownedMaterials_${selectedCharacter}`,
        JSON.stringify(owned)
      );
    }
  }, [owned, selectedCharacter, isLoadingOwned, isInitialDataLoading]);

  // Efek untuk menyimpan karakter yang dipilih
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      selectedCharacter &&
      !isInitialDataLoading
    ) {
      localStorage.setItem(
        "ascensionTool_selectedCharacter",
        selectedCharacter
      );
    }
  }, [selectedCharacter, isInitialDataLoading]);

  // ***** PERUBAHAN HANDLER *****
  const handleCharacterSelect = (characterName) => {
    setSelectedCharacter(characterName);
  };

  const updateOwned = (materialName, amount) => {
    const numAmount = Number.parseInt(amount) || 0;
    setOwned((prev) => ({ ...prev, [materialName]: numAmount }));
  };

  const getRemaining = (material) =>
    Math.max(0, material.required - (owned[material.name] || 0));
  const isCompleted = (material) =>
    (owned[material.name] || 0) >= material.required;

  const getTotalProgress = () => {
    if (!materials || materials.length === 0)
      return { completed: 0, total: 0, percentage: 0 };
    const completedCount = materials.filter(isCompleted).length;
    const percentage =
      materials.length > 0
        ? Math.round((completedCount / materials.length) * 100)
        : 0;
    return { completed: completedCount, total: materials.length, percentage };
  };

  const progress = getTotalProgress();
  const allMaterialsCollected =
    materials.length > 0 && progress.completed === progress.total;

  const groupedMaterials = materials.reduce((acc, material) => {
    acc[material.category] = acc[material.category] || [];
    acc[material.category].push(material);
    return acc;
  }, {});

  const formatNumber = (num) => num.toLocaleString();

  if (isInitialDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
        <span className="loading loading-ring loading-lg text-primary mb-4"></span>
        <p className="text-lg text-base-content/80">Memuat data karakter...</p>
      </div>
    );
  }
  if (characterNames.length === 0 && !isInitialDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
        <div role="alert" className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Gagal memuat data karakter. Pastikan file JSON (
            <code className="kbd kbd-sm text-error-content">
              /json/characterMaterials.json
            </code>
            ) ada di folder{" "}
            <code className="kbd kbd-sm text-error-content">public</code> dan
            formatnya benar.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 space-y-6">
      <div className="card w-full bg-base-100 shadow-2xl border border-base-300/50">
        <div className="card-body p-4 md:p-8">
          {/* Header Section */}
          <div className="mb-6 md:mb-8">
            {/* ... (Isi Header Section tetap sama, termasuk SearchableCharacterDropdown dan Progress Bar) ... */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="card-title text-2xl lg:text-3xl font-bold text-primary break-words">
                {selectedCharacter
                  ? `${selectedCharacter} Ascension`
                  : "Pilih Karakter"}
              </h1>
              <SearchableCharacterDropdown
                options={characterNames}
                selectedOption={selectedCharacter}
                onChange={handleCharacterSelect}
                placeholder="Pilih Karakter..."
                disabled={characterNames.length === 0 || isInitialDataLoading}
              />
            </div>
            {selectedCharacter && !isLoadingOwned && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-medium text-base-content/80">
                    Progres Total:
                  </span>
                  <span className="font-bold text-primary">
                    {progress.completed}/{progress.total} Material
                  </span>
                </div>
                <progress
                  className={`progress ${
                    progress.percentage === 100
                      ? "progress-success"
                      : progress.percentage > 50
                      ? "progress-primary"
                      : progress.percentage > 0
                      ? "progress-warning"
                      : "progress-error"
                  } w-full h-3`}
                  value={progress.percentage}
                  max="100"
                ></progress>
                <p className="text-xs text-right mt-1 text-base-content/70">
                  {progress.percentage}% Selesai
                </p>
              </div>
            )}
          </div>

          {/* Loading atau Konten Material */}
          {isLoadingOwned && selectedCharacter ? (
            <div className="flex flex-col items-center justify-center py-10 min-h-80">
              {" "}
              {/* min-h-80 dipertahankan untuk placeholder */}
              <span className="loading loading-spinner loading-md text-primary mb-3"></span>
              <p className="text-base-content/70">
                Memuat material untuk {selectedCharacter}...
              </p>
            </div>
          ) : !selectedCharacter && characterNames.length > 0 ? (
            <div
              role="alert"
              className="alert alert-info min-h-80 flex items-center justify-center" // min-h-80 dipertahankan
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6 inline-block mr-2 align-middle"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="align-middle">
                  Silakan pilih karakter untuk melihat material yang dibutuhkan.
                </span>
              </div>
            </div>
          ) : materials.length === 0 && selectedCharacter ? (
            <div
              role="alert"
              className="alert min-h-80 flex items-center justify-center" // min-h-80 dipertahankan
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-info shrink-0 w-6 h-6 inline-block mr-2 align-middle"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="align-middle">
                  Data material untuk {selectedCharacter} tidak ditemukan atau
                  kosong.
                </span>
              </div>
            </div>
          ) : (
            // ***** PERUBAHAN max-h DI SINI *****
            <div className="space-y-8 max-h-[calc(100dvh-20rem)] sm:max-h-[calc(100dvh-22rem)] md:max-h-[calc(100dvh-24rem)] lg:max-h-[calc(100dvh-20rem)] overflow-y-auto pr-2 md:pr-3 custom-scrollbar">
              {/* Penjelasan nilai max-h baru:
                - Mobile (default): max-h-[calc(100dvh-20rem)]
                  (100dvh dikurangi 20rem / 320px untuk elemen lain di luar list)
                - Small screens (sm): max-h-[calc(100dvh-22rem)]
                  (Offset sedikit lebih besar karena mungkin ada perubahan layout minor atau untuk kenyamanan)
                - Medium screens (md): max-h-[calc(100dvh-24rem)]
                  (Offset disesuaikan lagi)
                - Large screens (lg): max-h-[calc(100dvh-20rem)]
                  (Bisa jadi offset di layar besar kembali mirip mobile jika header dll lebih compact atau ingin area scroll lebih luas)

                Anda SANGAT PERLU menyesuaikan angka '20rem', '22rem', '24rem' ini 
                berdasarkan tinggi aktual dari elemen-elemen lain di halaman Anda 
                (header utama aplikasi, footer, padding di sekitar kartu, header di dalam kartu, dll.) 
                agar daftar material mendapatkan sisa ruang yang optimal.
            */}
              {Object.entries(groupedMaterials).map(
                ([category, categoryMaterials]) => (
                  <section
                    key={category}
                    aria-labelledby={`category-title-${category
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                    className="mb-6 last:mb-0"
                  >
                    <h2
                      id={`category-title-${category
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                      className="text-xl font-semibold text-accent border-b-2 border-accent/30 pb-2 mb-4 sticky top-0 bg-base-100 z-10 py-2"
                    >
                      {category}
                    </h2>
                    <div className="space-y-3">
                      {/* ... (Isi mapping material item tetap sama) ... */}
                      {categoryMaterials.map((material) => {
                        const remaining = getRemaining(material);
                        const completed = isCompleted(material);
                        return (
                          <div
                            key={material.name}
                            className={`
                            p-3 sm:p-4 rounded-lg border transition-all duration-300
                            ${
                              completed
                                ? "bg-success/10 border-success/50 shadow-md"
                                : "bg-base-200/50 border-base-300 hover:shadow-lg"
                            }
                          `}
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                              <div className="md:col-span-5 flex items-center gap-3">
                                {completed ? (
                                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                                ) : (
                                  <Circle className="w-5 h-5 text-base-content/40 flex-shrink-0" />
                                )}
                                <span
                                  className={`font-medium text-sm sm:text-base break-words ${
                                    completed
                                      ? "text-success/90"
                                      : "text-base-content"
                                  }`}
                                >
                                  {material.name}
                                </span>
                              </div>
                              <div className="md:col-span-2 text-xs sm:text-sm text-base-content/80 flex justify-between sm:block">
                                <span className="sm:hidden font-medium">
                                  Butuh:
                                </span>
                                <span>{formatNumber(material.required)}</span>
                              </div>
                              <div className="md:col-span-3">
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={owned[material.name] || ""}
                                  onChange={(e) =>
                                    updateOwned(material.name, e.target.value)
                                  }
                                  className={`input input-bordered w-full input-sm ${
                                    completed
                                      ? "input-success"
                                      : "input-primary/70"
                                  }`}
                                  min="0"
                                  max={material.required}
                                  aria-label={`Jumlah ${material.name} dimiliki`}
                                />
                              </div>
                              <div className="md:col-span-2 text-xs sm:text-sm text-center md:text-right">
                                {completed ? (
                                  <span className="badge badge-success badge-outline gap-1 py-2">
                                    <CheckCircle size={14} /> Lengkap
                                  </span>
                                ) : (
                                  <div className="flex justify-between sm:block md:text-right">
                                    <span className="sm:hidden font-medium text-error/80">
                                      Kurang:
                                    </span>
                                    <span className="font-semibold text-error">
                                      {formatNumber(remaining)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )
              )}
            </div>
          )}

          {/* ... (Pesan Selamat tetap sama) ... */}
          {allMaterialsCollected &&
            materials.length > 0 &&
            !isLoadingOwned &&
            selectedCharacter && (
              <div role="alert" className="alert alert-warning mt-8 shadow-lg">
                <CheckCircle className="stroke-current shrink-0 h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-bold text-lg text-white">
                    🎉 Selamat, karakter {selectedCharacter} kamu sudah bisa ke
                    level maksimal!
                  </h3>
                  <div className="text-md">
                    Semua material telah terkumpul. Saatnya level up!
                  </div>
                  <small className="text-md">
                    dan jangan lupa cek HoYoLAB untuk klaim hadiah harian
                  </small>
                </div>
                <a
                  href="https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline border-current text-current hover:bg-white hover:text-success-content"
                >
                  Cek HoYoLAB <ExternalLink size={16} className="ml-1" />
                </a>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Ascension;
