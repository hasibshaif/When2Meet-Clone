// pages/select-availability.tsx
"use client";
import React, { useState, useEffect } from 'react';

type TimeRange = { start: string; end: string };
type AvailabilityGrid = Record<string, Record<string, Set<string>>>;

const generateHourSlots = (start: string, end: string) => {
  const hourSlots: string[] = [];
  let currentTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  while (currentTime <= endTime) {
    hourSlots.push(currentTime.toTimeString().slice(0, 5)); // Format "HH:MM"
    currentTime.setHours(currentTime.getHours() + 1); // Increment by 1 hour
  }
  return hourSlots;
};

export default function SelectAvailability() {
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAvailability, setUserAvailability] = useState<AvailabilityGrid>({});
  const [groupAvailability, setGroupAvailability] = useState<AvailabilityGrid>({});

  // Sample data: Replace with data from your backend
  const selectedDates = ['2024-11-01', '2024-11-02'];
  const timeRanges: Record<string, TimeRange> = {
    '2024-11-01': { start: '09:00', end: '17:00' },
    '2024-11-02': { start: '10:00', end: '16:00' },
  };

  const handleCellHighlight = (date: string, time: string) => {
    setUserAvailability(prev => {
      const dateAvailability = prev[date] || {};
      const timeAvailability = dateAvailability[time] || new Set<string>();
      if (timeAvailability.has(name)) timeAvailability.delete(name);
      else timeAvailability.add(name);

      return {
        ...prev,
        [date]: { ...dateAvailability, [time]: timeAvailability },
      };
    });

    setGroupAvailability(prev => {
      const dateAvailability = prev[date] || {};
      const timeAvailability = dateAvailability[time] || new Set<string>();
      if (timeAvailability.has(name)) timeAvailability.delete(name);
      else timeAvailability.add(name);

      return {
        ...prev,
        [date]: { ...dateAvailability, [time]: timeAvailability },
      };
    });
  };

  const renderTimeGrid = (availability: AvailabilityGrid, editable = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {selectedDates.map(date => {
        const hourSlots = generateHourSlots(timeRanges[date].start, timeRanges[date].end);
        return (
          <div key={date} className="border p-2">
            <h3 className="text-center font-semibold mb-2">{date}</h3>
            <div className="grid gap-1">
              {hourSlots.map(time => {
                const isAvailable = availability[date]?.[time]?.size > 0;
                const highlightLevel = availability[date]?.[time]?.size || 0;
                const bgColor = highlightLevel === 1 ? 'bg-green-200' : highlightLevel === 2 ? 'bg-green-400' : 'bg-green-600';

                return (
                  <div
                    key={`${date}-${time}`}
                    onClick={() => editable && handleCellHighlight(date, time)}
                    className={`p-2 text-xs text-center cursor-pointer border ${isAvailable ? bgColor : 'bg-gray-200'} border-b-4 border-dotted`}
                    onMouseEnter={() => {
                      if (!editable) {
                        const members = Array.from(availability[date]?.[time] || []).join(', ');
                        console.log(`Available members at ${date} ${time}: ${members}`);
                      }
                    }}
                  >
                    {time}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Select Your Availability</h1>
      {!isSubmitted ? (
        <div className="bg-white p-6 rounded shadow w-full max-w-lg space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button onClick={() => setIsSubmitted(true)} className="bg-blue-500 text-white py-2 px-4 rounded">
            Submit
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
          <div className="flex-1">
            <h2 className="text-center font-semibold mb-2">Group Availability</h2>
            {renderTimeGrid(groupAvailability)}
          </div>
          <div className="flex-1">
            <h2 className="text-center font-semibold mb-2">Your Availability</h2>
            {renderTimeGrid(userAvailability, true)}
          </div>
        </div>
      )}
    </div>
  );
}
