import { useState } from "react";

function CVCalculator() {
  const [critRate, setCritRate] = useState("");
  const [critDamage, setCritDamage] = useState("");
  const [cv, setCV] = useState(null);
  const [error, setError] = useState("");

  const calculateCV = (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    // Replace comma with dot and parse numbers
    const critRateValue = parseFloat(critRate.replace(",", "."));
    const critDamageValue = parseFloat(critDamage.replace(",", "."));

    // Validate input
    if (
      isNaN(critRateValue) ||
      isNaN(critDamageValue) ||
      critRateValue < 0 ||
      critDamageValue < 0
    ) {
      setError("Please enter valid Number, and do not enter negative values.");
      return;
    }

    // Calculate CV
    const calculatedCV = critRateValue * 2 + critDamageValue;
    setCV(calculatedCV.toFixed(2)); // Set CV with 2 decimal places
  };

  const getTierClass = (value, threshold) => {
    return value >= threshold ? "text-green-800 font-bold" : "text-gray-500";
  };

  return (
    <div className="min-h-screen flex items-center justify-center rounded-box p-2 bg-gradient-to-r from-slate-900 to-slate-700">
      <div className="w-full max-w-md p-6 bg-base-200  rounded-lg shadow-md">
        <h1 className="text-2xl font-bold  text-center mb-4">CV Calculator</h1>
        <form onSubmit={calculateCV} className="space-y-4">
          <div>
            <label htmlFor="critRate" className="form-control w-full">
              <div className="label">
                <span className="label-text  font-semibold">Crit Rate (%)</span>
              </div>
              <input
                type="text"
                id="critRate"
                placeholder="example 25.5"
                value={critRate}
                onChange={(e) => setCritRate(e.target.value)}
                className="input input-bordered w-full  font-semibold"
              />
            </label>
          </div>
          <div>
            <label htmlFor="critDamage" className="form-control w-full">
              <div className="label">
                <span className="label-text  font-semibold">
                  Crit Damage (%)
                </span>
              </div>
              <input
                type="text"
                id="critDamage"
                placeholder="example 15.0"
                value={critDamage}
                onChange={(e) => setCritDamage(e.target.value)}
                className="input input-bordered w-full  font-semibold"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Calculate
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}
        {cv && (
          <>
            <div className="mt-4 p-4 bg-green-100 text-green-500 rounded-md">
              Your CV is: <strong>{cv}</strong>
            </div>
            <progress
              className="progress progress-accent w-full"
              value={Math.min(cv, 60)} // Cap progress at 60
              max="60"
            ></progress>
            <div className="flex gap-2 w-full items-start text-center justify-between px-2 text-xs">
              <span className={`${getTierClass(cv, 0)} flex-1`}>
                |<br />
                0 CV
                <br />
                Skip
              </span>
              <span className={`${getTierClass(cv, 10)} flex-1`}>
                |<br />
                10 CV
                <br />
                Common
              </span>
              <span className={`${getTierClass(cv, 20)} flex-1`}>
                |<br />
                20 CV
                <br />
                Uncommon
              </span>
              <span className={`${getTierClass(cv, 30)} flex-1`}>
                |<br />
                30 CV
                <br />
                Rare
              </span>
              <span className={`${getTierClass(cv, 40)} flex-1`}>
                |<br />
                40 CV
                <br />
                Epic
              </span>
              <span className={`${getTierClass(cv, 50)} flex-1`}>
                |<br />
                50 CV
                <br />
                Legendary
              </span>
              <span className={`${getTierClass(cv, 60)} flex-1`}>
                |<br />
                60 CV
                <br />
                GOD
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CVCalculator;
