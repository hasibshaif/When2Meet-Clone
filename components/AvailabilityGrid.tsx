// components/AvailabilityGrid.tsx
import React from 'react';

const AvailabilityGrid: React.FC = () => {
  // Example grid data for times and dates (could be dynamically generated based on the meeting)
  const dates = ['2024-11-01', '2024-11-02', '2024-11-03'];
  const times = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'];

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Select Your Availability</h2>
      <div className="grid grid-cols-4 gap-2">
        {dates.map((date) => (
          <div key={date}>
            <h3 className="font-medium">{date}</h3>
            {times.map((time) => (
              <button
                key={time}
                className="w-full py-2 mt-1 border rounded hover:bg-blue-200"
              >
                {time}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityGrid;
