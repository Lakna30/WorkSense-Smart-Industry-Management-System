import React from "react";

export default function TaskCalendar({ tasks, onDateSelect }) {
  const tasksByDate = (tasks || []).reduce((acc, task) => {
    acc[task.deadline] = acc[task.deadline] || [];
    acc[task.deadline].push(task);
    return acc;
  }, {});

  const uniqueDates = Object.keys(tasksByDate);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
      <h2 className="text-lg font-semibold mb-4">Task Calendar</h2>
      {uniqueDates.length === 0 ? (
        <p className="text-gray-500">No tasks scheduled yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {uniqueDates.map((date) => (
            <div
              key={date}
              onClick={() => onDateSelect(date)}
              className="cursor-pointer p-4 border rounded-lg hover:bg-blue-50 transition"
            >
              <h3 className="font-medium">{date}</h3>
              <p className="text-sm text-gray-500">{tasksByDate[date].length} task(s)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}