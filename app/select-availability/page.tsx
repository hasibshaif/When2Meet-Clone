// pages/select-availability.tsx
"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SelectableGroup, createSelectable } from 'react-selectable-fast';
import dayjs, { Dayjs } from 'dayjs';

const SelectableCell = createSelectable(({ selectableRef, isSelected, hour }: any) => (
  <div
    ref={selectableRef}
    className={`p-2 text-center rounded cursor-pointer ${
      isSelected ? 'bg-indigo-600' : 'bg-gray-700'
    }`}
  >
    {dayjs().hour(hour).format('h A')}
  </div>
));

export default function SelectAvailability() {
  const searchParams = useSearchParams();
  const eventDataString = searchParams.get('data');
  const eventData = eventDataString ? JSON.parse(decodeURIComponent(eventDataString)) : {};

  const { title, dates, timeRanges } = eventData;

  const [selectedCells, setSelectedCells] = useState(new Set());

  const handleSelection = (keys: any) => {
    setSelectedCells(new Set(keys.map((key: any) => key.hour)));
  };

  const renderGrid = () => {
    return dates.map((date: Date) => {
      const formattedDate = dayjs(date).format('MM/DD/YYYY');
      const startHour = dayjs(timeRanges[formattedDate]?.start).hour();
      const endHour = dayjs(timeRanges[formattedDate]?.end).hour();

      const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

      return (
        <div key={formattedDate} className="flex flex-col items-center">
          <h3 className="text-md font-medium text-indigo-400 mb-2">{formattedDate}</h3>
          <SelectableGroup
            className="grid grid-cols-1 gap-1 w-20"
            onSelectionFinish={handleSelection}
          >
            {hours.map(hour => (
              <SelectableCell
                key={`${formattedDate}-${hour}`}
                selectableKey={{ date: formattedDate, hour }}
                hour={hour}
                isSelected={selectedCells.has(hour)}
              />
            ))}
          </SelectableGroup>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 md:p-8 space-x-0 md:space-x-8 bg-gray-900 text-gray-100 rounded-lg">
      <div className="flex-1 bg-transparent flex flex-col items-center space-y-4">
        <h2 className="text-lg font-semibold text-indigo-300 mb-2">Select Your Availability</h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 overflow-x-auto">
          {renderGrid()}
        </div>
      </div>
    </div>
  );
}
