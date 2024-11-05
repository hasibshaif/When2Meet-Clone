// pages/create-event.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";

export default function CreateEvent() {
  const router = useRouter();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [timezone, setTimezone] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeRanges, setTimeRanges] = useState<
    Record<string, { start: Dayjs | null; end: Dayjs | null }>
  >({});
  const [error, setError] = useState("");

  const allTimezones = Intl.supportedValuesOf("timeZone");

  useEffect(() => {
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(localTimezone);
  }, []);

  const handleSubmit = () => {
    setError("");
  
    if (!eventTitle.trim()) {
      setError("Please provide an event title.");
      return;
    }
    if (selectedDates.length === 0) {
      setError("Please select at least one date.");
      return;
    }
    const missingTimeRange = selectedDates.some((date) => {
      const dateStr = formatDate(date);
      const timeRange = timeRanges[dateStr];
      return !timeRange || !timeRange.start || !timeRange.end;
    });
  
    if (missingTimeRange) {
      setError("Please set a time range for each selected date.");
      return;
    }
  
    const eventDetails = {
      title: eventTitle,
      description: eventDescription,
      timezone,
      dates: selectedDates,
      timeRanges
    };
  
    // Serialize and encode data for safe URL passing
    const eventDataString = encodeURIComponent(JSON.stringify(eventDetails));
  
    router.push(`/select-availability?data=${eventDataString}`);
  };

  const handleTimeChange = (
    date: string,
    field: "start" | "end",
    value: Dayjs | null
  ) => {
    setTimeRanges((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
      },
    }));
  };

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col md:flex-row w-full max-w-sm md:max-w-6xl mx-auto p-4 md:p-8 rounded-lg space-x-0 md:space-x-8"
        >
          {/* Calendar Section */}
          <div className="flex-1 bg-transparent flex justify-center">
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-semibold text-indigo-300 mb-6 md:mb-10">
                What days might work?
              </h2>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates as Date[])}
                className="text-white transform scale-110 md:scale-125" // Enlarge calendar for larger screens
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-4 max-w-full md:max-w-md">
            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full p-2 md:p-3 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring focus:ring-indigo-500"
              required
            />

            <textarea
              placeholder="Event Description"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full p-2 md:p-3 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring focus:ring-indigo-500"
              rows={3}
            />

            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full p-2 md:p-3 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring focus:ring-indigo-500"
              required
            >
              <option value="" disabled>
                Select Timezone
              </option>
              {allTimezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>

            {/* Time selection shown after date selection */}
            {/* Time selection shown after date selection */}
            {selectedDates.length > 0 && (
              <>
                {/* Header outside the scrollable div */}
                <h2 className="text-lg font-semibold text-indigo-300 mt-4">
                  What times might work?
                </h2>
                <div className="space-y-4 max-h-48 md:max-h-64 overflow-y-auto mt-2">
                  {" "}
                  {/* Limit height and make scrollable */}
                  {selectedDates.map((date) => {
                    const dateStr = formatDate(date);
                    return (
                      <div key={dateStr} className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-md font-medium text-indigo-400">
                          {dateStr}
                        </h3>
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mt-2">
                          <div className="flex flex-col w-full">
                            <label className="text-sm text-gray-400 mb-1">
                              No earlier than:
                            </label>
                            <TimePicker
                              label="Start Time"
                              value={timeRanges[dateStr]?.start || null}
                              onChange={(newValue) =>
                                handleTimeChange(dateStr, "start", newValue)
                              }
                              className="w-full bg-gray-700 rounded focus:ring-indigo-500"
                            />
                          </div>
                          <div className="flex flex-col w-full">
                            <label className="text-sm text-gray-400 mb-1">
                              No later than:
                            </label>
                            <TimePicker
                              label="End Time"
                              value={timeRanges[dateStr]?.end || null}
                              onChange={(newValue) =>
                                handleTimeChange(dateStr, "end", newValue)
                              }
                              className="w-full bg-gray-700 rounded focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Create Event Button */}
            <div className="flex justify-start mt-4">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 md:px-6 md:py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
              >
                Create Event
              </button>
            </div>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          </div>
        </motion.div>
      </AuroraBackground>
    </LocalizationProvider>
  );
}
