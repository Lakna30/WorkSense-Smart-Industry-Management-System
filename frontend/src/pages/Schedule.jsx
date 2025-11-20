import React, { useCallback, useEffect, useMemo, useState } from "react";
import AddTaskModal from "../components/ui/AddTaskModal.jsx";
import TaskCalendar from "../components/ui/TaskCalendar.jsx";
import TaskFilters from "../components/ui/TaskFilters.jsx";
import TaskList from "../components/ui/TaskList.jsx";
import TaskStats from "../components/ui/TaskStats.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import TaskChecklist from "../components/ui/TaskChecklist.jsx";
import { scheduleAPI } from "../lib/api.js";

const normalizeDate = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split("T")[0];
};

export default function Schedule() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [checklistTask, setChecklistTask] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const getEmployeeName = useCallback(
    (schedule) => {
      const joined = [schedule.first_name, schedule.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (joined) return joined;
      const match = employees.find((emp) => emp.id === schedule.employee_id);
      return match?.name || "Unassigned";
    },
    [employees]
  );

  const formatSchedule = useCallback(
    (schedule) => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description || "",
      deadline: normalizeDate(schedule.deadline),
      priority: schedule.priority || "Normal",
      status: schedule.status || "Pending",
      employeeId: schedule.employee_id ?? null,
      employeeName: getEmployeeName(schedule)
    }),
    [getEmployeeName]
  );

  const loadEmployees = useCallback(async () => {
    try {
      const { data } = await scheduleAPI.getEmployees();
      setEmployees(data?.data ?? []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      const { data } = await scheduleAPI.getAll();
      const records = data?.data ?? [];
      setTasks(records.map(formatSchedule));
      setError(null);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      setError(err.response?.data?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [formatSchedule]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleSaveTask = async (taskData) => {
    try {
      setIsProcessing(true);
      const payload = {
        title: taskData.title,
        description: taskData.description,
        employee_id: Number(taskData.employee_id),
        deadline: taskData.deadline,
        priority: taskData.priority
      };

      if (editingTask) {
        const { data } = await scheduleAPI.update(editingTask.id, payload);
        const updated = data?.data;

        if (updated) {
          const formatted = formatSchedule(updated);
          setTasks((prev) =>
            prev.map((task) => (task.id === formatted.id ? formatted : task))
          );
        } else {
          await loadSchedules();
        }
      } else {
        const { data } = await scheduleAPI.create(payload);
        const created = data?.data;

        if (created) {
          setTasks((prev) => [...prev, formatSchedule(created)]);
        } else {
          await loadSchedules();
        }
      }

      setShowModal(false);
      setEditingTask(null);
      setError(null);
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(
        err.response?.data?.message ||
          (editingTask ? "Failed to update schedule" : "Failed to create schedule")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await scheduleAPI.update(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating schedule:", err);
      setError(err.response?.data?.message || "Failed to update schedule");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await scheduleAPI.delete(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError(err.response?.data?.message || "Failed to delete schedule");
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleClearFilters = () => {
    setSelectedEmployee("");
    setSelectedPriority("");
    setSelectedDate("");
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const loadChecklist = useCallback(async (taskId) => {
    try {
      setChecklistLoading(true);
      const { data } = await scheduleAPI.getChecklist(taskId);
      setChecklistItems(data?.data ?? []);
    } catch (err) {
      console.error("Error fetching checklist items:", err);
      setError(err.response?.data?.message || "Failed to load checklist");
      setChecklistItems([]);
    } finally {
      setChecklistLoading(false);
    }
  }, []);

  const handleOpenChecklist = async (task) => {
    setChecklistTask(task);
    setChecklistItems([]);
    await loadChecklist(task.id);
  };

  const handleCloseChecklist = () => {
    setChecklistTask(null);
    setChecklistItems([]);
  };

  const handleAddChecklistItem = async (title) => {
    if (!checklistTask) return;
    if (checklistSaving || checklistLoading) return;
    try {
      setChecklistSaving(true);
      const { data } = await scheduleAPI.addChecklistItem(checklistTask.id, { title });
      const created = data?.data;
      if (created) {
        setChecklistItems((prev) => [...prev, created]);
      } else {
        await loadChecklist(checklistTask.id);
      }
    } catch (err) {
      console.error("Error adding checklist item:", err);
      setError(err.response?.data?.message || "Failed to add checklist item");
    } finally {
      setChecklistSaving(false);
    }
  };

  const handleToggleChecklistItem = async (item) => {
    if (!checklistTask) return;
    if (checklistLoading) return;
    const next = !item.is_completed;
    setChecklistItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, is_completed: next } : entry
      )
    );
    try {
      await scheduleAPI.updateChecklistItem(checklistTask.id, item.id, {
        is_completed: next
      });
    } catch (err) {
      console.error("Error updating checklist item:", err);
      setError(err.response?.data?.message || "Failed to update checklist item");
      setChecklistItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, is_completed: item.is_completed } : entry
        )
      );
    }
  };

  const handleDeleteChecklistItem = async (item) => {
    if (!checklistTask) return;
    if (checklistLoading) return;
    const previous = checklistItems;
    setChecklistItems((prev) => prev.filter((entry) => entry.id !== item.id));
    try {
      await scheduleAPI.deleteChecklistItem(checklistTask.id, item.id);
    } catch (err) {
      console.error("Error deleting checklist item:", err);
      setError(err.response?.data?.message || "Failed to delete checklist item");
      setChecklistItems(previous);
    }
  };

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesEmployee =
        !selectedEmployee ||
        (task.employeeId !== null &&
          String(task.employeeId) === selectedEmployee);
      const matchesPriority =
        !selectedPriority || task.priority === selectedPriority;
      const matchesDate =
        !selectedDate || task.deadline === normalizeDate(selectedDate);

      return matchesEmployee && matchesPriority && matchesDate;
    });

    const toTimestamp = (deadline) => {
      if (!deadline) return Number.POSITIVE_INFINITY;
      const parsed = new Date(deadline);
      return Number.isNaN(parsed.getTime())
        ? Number.POSITIVE_INFINITY
        : parsed.getTime();
    };

    return filtered
      .slice()
      .sort((a, b) => toTimestamp(a.deadline) - toTimestamp(b.deadline));
  }, [selectedDate, selectedEmployee, selectedPriority, tasks]);

  const hasActiveFilters =
    selectedEmployee || selectedPriority || selectedDate;

  const selectedEmployeeName = selectedEmployee
    ? employees.find((emp) => String(emp.id) === selectedEmployee)?.name || ""
    : "";

  const handleDownloadSchedules = () => {
    if (typeof window === "undefined") return;

    const headers = ["Title", "Description", "Deadline", "Priority", "Status", "Employee"];
    const rows = filteredTasks.map((task) => [
      task.title || "",
      task.description || "",
      normalizeDate(task.deadline) || "",
      task.priority || "",
      task.status || "",
      task.employeeName || ""
    ]);

    const sanitize = (value) => {
      const str = String(value ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(sanitize).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schedule-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-blue-50 to-purple-50">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-blue-50 to-purple-50">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-200 ${
          showModal ? "pointer-events-none select-none blur-sm" : ""
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Scheduling & Work Assignment
              </h1>
              <p className="text-gray-600">
                Manage and track all work assignments efficiently
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:items-center">
              <button
                onClick={handleDownloadSchedules}
                disabled={filteredTasks.length === 0}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-60 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                Download Schedule
              </button>
              <button
                onClick={handleOpenCreate}
                disabled={isProcessing}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-70"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Assignment
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Task Statistics Dashboard */}
        <TaskStats tasks={tasks} />

        {/* View Toggle and Filters Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              View & Filters
            </h2>
            <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  List
                </div>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "calendar"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Calendar
                </div>
              </button>
            </div>
          </div>

          {/* Filters */}
          <TaskFilters
            employees={employees}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            onClear={handleClearFilters}
          />

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">
                Active Filters:
              </span>
              {selectedEmployee && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {selectedEmployeeName}
                  <button
                    onClick={() => setSelectedEmployee("")}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedPriority && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {selectedPriority}
                  <button
                    onClick={() => setSelectedPriority("")}
                    className="ml-2 text-purple-600 hover:text-purple-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedDate && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {normalizeDate(selectedDate)}
                  <button
                    onClick={() => setSelectedDate("")}
                    className="ml-2 text-green-600 hover:text-green-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Area - Calendar or List View */}
        {viewMode === "calendar" ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">
                Task Calendar
              </h2>
            </div>
            <TaskCalendar tasks={filteredTasks} onDateSelect={handleDateSelect} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">
                  Task List
                  {filteredTasks.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredTasks.length}{" "}
                      {filteredTasks.length === 1 ? "task" : "tasks"})
                    </span>
                  )}
                </h2>
              </div>
            </div>

            {filteredTasks.length > 0 ? (
              <TaskList
                tasks={filteredTasks}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                onChecklist={handleOpenChecklist}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasActiveFilters
                    ? "No tasks match your filters"
                    : "No tasks yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results"
                    : "Get started by creating your first work assignment"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    onClick={handleOpenCreate}
                    className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create First Task
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <AddTaskModal
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          employees={employees}
          initialData={
            editingTask
              ? {
                  ...editingTask,
                  employee_id:
                    editingTask.employeeId !== null
                      ? editingTask.employeeId
                      : editingTask.employee_id ?? ""
                }
              : null
          }
          saving={isProcessing}
        />
      )}

      {checklistTask && (
        <TaskChecklist
          task={checklistTask}
          items={checklistItems}
          onToggle={handleToggleChecklistItem}
          onDelete={handleDeleteChecklistItem}
          onAdd={handleAddChecklistItem}
          onClose={handleCloseChecklist}
          saving={checklistSaving}
          loading={checklistLoading}
        />
      )}
    </div>
  );
}
