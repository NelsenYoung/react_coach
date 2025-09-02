import React, { useState } from 'react';

function TimePicker({ value, onChange }) {
  return (
    <div className="flex flex-col items-start">
      <label htmlFor="time-input" className="mb-1 text-sm text-gray-600">Select Time:</label>
      <input
        type="time"
        id="time-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
}

export default TimePicker;