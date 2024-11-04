// components/MeetingForm.tsx
"use client"
import React, { useState } from 'react';
import { Calendar } from './ui/calendar';

const MeetingForm: React.FC = () => {
  const [name, setName] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, meetingTitle, selectedDates });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Create a New Meeting</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Meeting Title"
        value={meetingTitle}
        onChange={(e) => setMeetingTitle(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      
      {/* Calendar for Date Selection */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Dates
      </label>
      <Calendar
        mode="multiple" // Allows multiple date selection
        selected={selectedDates}
        onSelect={(dates) => setSelectedDates(dates as Date[])}
        className="mb-4"
      />

      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Create Meeting
      </button>
    </form>
  );
};

export default MeetingForm;
