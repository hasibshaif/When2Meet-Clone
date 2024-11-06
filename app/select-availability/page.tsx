"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SelectableGroup, createSelectable } from 'react-selectable-fast';
import supabase from "@/supabaseClient";
import dayjs from 'dayjs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Enhanced SelectableCell with immediate update functionality
const SelectableCell = createSelectable(({ selectableRef, isSelected, timeSlot, onSelect }) => (
  <div
    ref={selectableRef}
    className={`text-center cursor-pointer border border-gray-600 ${
      isSelected ? 'bg-indigo-600' : 'bg-gray-800'
    } hover:bg-indigo-500 transition-colors duration-150`}
    style={{
      padding: '8px 2px',
      fontSize: '0.75rem',
      width: '60px',
      height: '30px',
    }}
    onClick={() => {
      console.log("TimeSlot selected:", timeSlot);
      if (onSelect) onSelect(timeSlot);
    }}
  >
    {timeSlot}
  </div>
));

export default function SelectAvailability() {
  const searchParams = useSearchParams();
  const eventDataString = searchParams.get('data');
  const eventId = searchParams.get('eventId');
  const eventData = eventDataString ? JSON.parse(decodeURIComponent(eventDataString)) : {};
  const { title, dates = [], timeRanges = {} } = eventData;

  const [name, setName] = useState('');
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [allUsersAvailability, setAllUsersAvailability] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedTimeRanges = Object.fromEntries(
    Object.entries(timeRanges).map(([date, range]) => [
      date,
      { start: dayjs(range.start, 'HH:mm'), end: dayjs(range.end, 'HH:mm') },
    ])
  );

  // Fetch and subscribe to availability data for real-time updates
  useEffect(() => {
    if (eventId) {
      fetchAvailabilityData();
  
      const channel = supabase
        .channel('availability_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'Availability',
          filter: `eventId=eq.${eventId}`,
        }, fetchAvailabilityData)
        .subscribe();
  
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [eventId]);
  

  const fetchAvailabilityData = async () => {
    const { data, error } = await supabase
      .from('Availability')
      .select('userName, timeSlot, date, isAvailable')
      .eq('eventId', eventId);

    if (error) {
      console.error('Error fetching availability:', error);
      return;
    }

    const availabilityMap = {};
    data.forEach(({ userName, timeSlot, date, isAvailable }) => {
      const cellKey = `${date}-${timeSlot}`;
      if (!availabilityMap[cellKey]) {
        availabilityMap[cellKey] = { count: 0, users: [] };
      }
      if (isAvailable) {
        availabilityMap[cellKey].count += 1;
        availabilityMap[cellKey].users.push(userName);
      }
    });

    setAllUsersAvailability(availabilityMap);
  };

  const handleNameSubmit = () => {
    if (name.trim()) {
      setIsNameSubmitted(true);
      const existingAvailability = allUsersAvailability[name] || [];
      setSelectedCells(new Set(existingAvailability));
    }
  };

  const saveAvailability = async (timeSlot, date, isAvailable) => {
    const { error } = await supabase
      .from('Availability')
      .upsert({
        eventId,
        userName: name,
        timeSlot,
        date,
        isAvailable,
      }, {
        onConflict: 'eventId,userName,timeSlot,date',
      });

    if (error) {
      console.error('Error saving availability:', error);
    }
  };

  const handleSelection = async (selectedKeys) => {
    if (!isNameSubmitted) return;
    setIsSubmitting(true);

    try {
      const updates = selectedKeys.map(({ date, timeSlot }) => ({
        eventId,
        userName: name,
        timeSlot,
        date,
        isAvailable: true,
      }));

      const { error } = await supabase
        .from('Availability')
        .upsert(updates, { onConflict: 'eventId,userName,timeSlot,date' });

      if (error) throw error;

      const newSelection = new Set(
        selectedKeys.map(({ date, timeSlot }) => `${date}-${timeSlot}`)
      );
      setSelectedCells(newSelection);
    } catch (error) {
      console.error('Error saving selection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityInfo = (timeSlot, date) => {
    const cellKey = `${date}-${timeSlot}`;
    const availability = allUsersAvailability[cellKey] || { count: 0, users: [] };
    return {
      count: availability.count,
      availableUsers: availability.users,
    };
  };

  const getColorByAvailability = (count) => {
    if (count >= 5) return 'bg-indigo-900';
    if (count === 4) return 'bg-indigo-800';
    if (count === 3) return 'bg-indigo-700';
    if (count === 2) return 'bg-indigo-600';
    if (count === 1) return 'bg-indigo-500';
    return 'bg-gray-700';
  };

  const renderAvailabilityGrid = () => {
    return dates.map((date) => {
      const formattedDate = dayjs(date).format('MM/DD/YYYY');
      const parsedRange = parsedTimeRanges[formattedDate];

      if (!parsedRange?.start || !parsedRange?.end) {
        console.warn(`Missing time range for date: ${formattedDate}`);
        return null;
      }

      const startHour = parsedRange.start.hour();
      const endHour = parsedRange.end.hour();

      const intervals = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        intervals.push(dayjs().hour(hour).minute(0).format('h:mm A'));
        intervals.push(dayjs().hour(hour).minute(30).format('h:mm A'));
      }

      return (
        <div key={formattedDate} className="flex flex-col items-center mb-4">
          <h3 className="text-md font-medium text-indigo-400 mb-2">{formattedDate}</h3>
          <SelectableGroup
            className="grid grid-cols-1 gap-0"
            onSelectionFinish={handleSelection}
          >
            {intervals.map((timeSlot) => (
              <SelectableCell
                key={`${formattedDate}-${timeSlot}`}
                selectableKey={{ date: formattedDate, timeSlot }}
                timeSlot={timeSlot}
                isSelected={selectedCells.has(timeSlot)}
                onSelect={(slot) => saveAvailability(slot, formattedDate, true)}
              />
            ))}
          </SelectableGroup>
        </div>
      );
    });
  };

  const renderGroupAvailability = () => {
    return dates.map((date) => {
      const formattedDate = dayjs(date).format('MM/DD/YYYY');
      const parsedRange = parsedTimeRanges[formattedDate];

      if (!parsedRange?.start || !parsedRange?.end) return null;

      const startHour = parsedRange.start.hour();
      const endHour = parsedRange.end.hour();

      const intervals = [];
      for (let hour = startHour; hour <= endHour; hour++) {
        intervals.push(dayjs().hour(hour).minute(0).format('h:mm A'));
        intervals.push(dayjs().hour(hour).minute(30).format('h:mm A'));
      }

      return (
        <div key={formattedDate} className="flex flex-col items-center mb-4">
          <h3 className="text-md font-medium text-indigo-400 mb-2">{formattedDate}</h3>
          <div className="grid grid-cols-1 gap-0 w-fit">
            {intervals.map((timeSlot) => {
              const { count, availableUsers } = getAvailabilityInfo(timeSlot, formattedDate);

              return (
                <TooltipProvider key={`${formattedDate}-${timeSlot}`}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={`text-center cursor-help border border-gray-600 p-1 
                          ${getColorByAvailability(count)}`}
                        style={{
                          width: '60px',
                          height: '30px',
                        }}
                      >
                        {timeSlot}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-semibold mb-1">Available ({count}):</p>
                        {availableUsers.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {availableUsers.map((user) => (
                              <li key={user}>{user}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No one available</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 md:p-8 bg-gray-900 text-gray-100 rounded-lg space-y-4 md:space-y-0">
      <div className="flex-1 bg-transparent flex flex-col items-center space-y-4">
        {!isNameSubmitted ? (
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded"
            />
            <button 
              onClick={handleNameSubmit} 
              className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 transition-colors"
            >
              Submit
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-indigo-300 mb-2">Select Your Availability</h2>
            {renderAvailabilityGrid()}
          </>
        )}
      </div>

      <div className="flex-1 bg-transparent flex flex-col items-center space-y-4">
        <h2 className="text-lg font-semibold text-indigo-300 mb-2">Group Availability</h2>
        {renderGroupAvailability()}
      </div>
    </div>
  );
}
