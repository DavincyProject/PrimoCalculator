import CV from "./Components/CV";
import PullCalculator from "./Components/PullCalculator";

function App() {
  return (
    <div className="flex items-start min-h-dvh p-2">
      <div role="tablist" className="tabs tabs-lifted w-full">
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab text-blue-500"
          aria-label="Pull"
          defaultChecked
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box"
        >
          <PullCalculator />
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab text-blue-500"
          aria-label="CV"
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box "
        >
          <CV />
        </div>
      </div>
    </div>
  );
}

export default App;
