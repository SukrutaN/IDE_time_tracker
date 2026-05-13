import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:8080/time-data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div className="p-4">Loading...</div>;
  }

  const remaining =
    data.earned_browse_seconds - (data.used_browse_seconds || 0);

  return (
    <div className="w-[350px] min-h-[500px] bg-[#0f0f0f] text-white p-4">
      <h1 className="text-2xl font-bold mb-6">
        IDE Time Tracker
      </h1>

      <div className="grid gap-4">
        <div className="bg-[#181818] rounded-2xl p-4">
          <p className="text-gray-400">Earned</p>
          <h2 className="text-3xl font-bold">
            {(data.earned_browse_minutes).toFixed(1)} min
          </h2>
        </div>

        <div className="bg-[#181818] rounded-2xl p-4">
          <p className="text-gray-400">Remaining</p>
          <h2 className="text-3xl font-bold">
            {(remaining / 60).toFixed(1)} min
          </h2>
        </div>
      </div>

      <button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 transition rounded-xl py-3 font-semibold">
        Reset Used Time
      </button>
    </div>
  );
}

export default App;