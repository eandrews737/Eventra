import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../services/api";
import BackButton from "../components/BackButton";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDatetime: "",
    endDatetime: "",
    location: "",
    minAttendees: "",
    maxAttendees: "",
    locationDetails: "",
    preparationInfo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert form data to proper format
      const eventData = {
        ...formData,
        minAttendees: parseInt(formData.minAttendees) || 0,
        maxAttendees: parseInt(formData.maxAttendees) || 0,
      };

      await eventsAPI.create(eventData);
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top right back button */}
        <div className="flex justify-end mb-6">
          <BackButton variant="logo" to="/events" />
        </div>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your event details
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Event Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Date and Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="startDatetime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDatetime"
                    name="startDatetime"
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.startDatetime}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDatetime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endDatetime"
                    name="endDatetime"
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.endDatetime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Location
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Conference Room A, Main Hall"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="locationDetails"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Location Details
                  </label>
                  <textarea
                    id="locationDetails"
                    name="locationDetails"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Additional location information, directions, etc."
                    value={formData.locationDetails}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Attendees
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="minAttendees"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Minimum Attendees
                  </label>
                  <input
                    type="number"
                    id="minAttendees"
                    name="minAttendees"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.minAttendees}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="maxAttendees"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Maximum Attendees
                  </label>
                  <input
                    type="number"
                    id="maxAttendees"
                    name="maxAttendees"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Additional Information
              </h3>
              <div>
                <label
                  htmlFor="preparationInfo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Preparation Information
                </label>
                <textarea
                  id="preparationInfo"
                  name="preparationInfo"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="What participants should bring, wear, or prepare for the event"
                  value={formData.preparationInfo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
