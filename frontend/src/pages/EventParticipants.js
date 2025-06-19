import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { participantsAPI, eventsAPI } from "../services/api";
import BackButton from "../components/BackButton";

const EventParticipants = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    type: "guest", // 'user' or 'guest'
    email: "",
    fullName: "",
    userId: "",
    status: "pending",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchEventAndParticipants();
  }, [id]);

  const fetchEventAndParticipants = async () => {
    try {
      setLoading(true);
      const [eventResponse, participantsResponse] = await Promise.all([
        eventsAPI.getById(id),
        participantsAPI.getEventParticipants(id),
      ]);
      setEvent(eventResponse.data);
      setParticipants(participantsResponse.data);
    } catch (err) {
      setError("Failed to fetch event and participants");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      if (addFormData.type === "user") {
        await participantsAPI.addRegisteredUser(id, {
          userId: parseInt(addFormData.userId),
          status: addFormData.status,
        });
      } else {
        await participantsAPI.addGuestUser(id, {
          email: addFormData.email,
          fullName: addFormData.fullName,
          status: addFormData.status,
        });
      }

      // Refresh participants list
      await fetchEventAndParticipants();

      // Reset form
      setAddFormData({
        type: "guest",
        email: "",
        fullName: "",
        userId: "",
        status: "pending",
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add participant");
      console.error("Error adding participant:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleStatusChange = async (participantId, newStatus) => {
    try {
      await participantsAPI.updateStatus(participantId, { status: newStatus });
      await fetchEventAndParticipants();
    } catch (err) {
      setError("Failed to update participant status");
      console.error("Error updating status:", err);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm("Are you sure you want to remove this participant?")) {
      return;
    }

    try {
      await participantsAPI.remove(participantId);
      await fetchEventAndParticipants();
    } catch (err) {
      setError("Failed to remove participant");
      console.error("Error removing participant:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "declined":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            to="/events"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Top right back button */}
        <div className="flex justify-end mb-6">
          <BackButton variant="logo" to={`/events/${id}`} />
        </div>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Event Participants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage participants for {event?.name}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {/* Actions */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Add Participant
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Participants List */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Participants ({participants.length})
              </h3>
            </div>

            {participants.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No participants yet. Add the first participant!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {participants.map((participant) => (
                  <li key={participant.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {participant.participant_name ||
                            participant.participant_email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {participant.participant_email}
                          {participant.participant_type === "registered" && (
                            <span className="ml-2 text-blue-600 dark:text-blue-400">
                              (Registered User)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={participant.status}
                          onChange={(e) =>
                            handleStatusChange(participant.id, e.target.value)
                          }
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                        </select>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            participant.status
                          )}`}
                        >
                          {participant.status}
                        </span>
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Add Participant Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-300 dark:border-gray-600 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add Participant
              </h3>
              <form onSubmit={handleAddParticipant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Participant Type
                  </label>
                  <select
                    name="type"
                    value={addFormData.type}
                    onChange={handleAddFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="guest">Guest User</option>
                    <option value="user">Registered User</option>
                  </select>
                </div>

                {addFormData.type === "guest" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={addFormData.fullName}
                        onChange={handleAddFormChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={addFormData.email}
                        onChange={handleAddFormChange}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User ID *
                    </label>
                    <input
                      type="number"
                      name="userId"
                      required
                      value={addFormData.userId}
                      onChange={handleAddFormChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={addFormData.status}
                    onChange={handleAddFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {adding ? "Adding..." : "Add Participant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventParticipants;
