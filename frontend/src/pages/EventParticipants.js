import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { participantsAPI, eventsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Card from "../components/Card";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";

// Memoized Participant Card Component
const ParticipantCard = React.memo(({ participant, getStatusColor }) => {
  const PeopleIcon = () => (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4 mr-2 flex-shrink-0"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  );

  return (
    <Card hover>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {participant.fullName || `User ${participant.userId}`}
            </h4>
            {participant.email && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {participant.email}
              </p>
            )}
          </div>
          <Badge
            variant={getStatusColor(participant.status)}
            size="small"
            className="ml-2 flex-shrink-0"
          >
            {participant.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <PeopleIcon />
            <span className="truncate">
              {participant.type === "registered" ? "Registered User" : "Guest"}
            </span>
          </div>
          {participant.joinedAt && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
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
              <span className="truncate">
                Joined: {new Date(participant.joinedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

const EventParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    type: "guest", // 'registered' or 'guest'
    email: "",
    fullName: "",
    userId: "",
    status: "pending",
  });
  const [adding, setAdding] = useState(false);

  const fetchEventAndParticipants = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchEventAndParticipants();
  }, [fetchEventAndParticipants]);

  const isEventCreator = useCallback(() => {
    return user && event && event.createdBy === user.id;
  }, [user, event]);

  const getStatusColor = useCallback((status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "declined":
        return "danger";
      default:
        return "default";
    }
  }, []);

  const handleAddParticipant = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        setAdding(true);
        setError(null);

        if (addFormData.type === "registered") {
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

        // Reset form
        setAddFormData({
          type: "guest",
          email: "",
          fullName: "",
          userId: "",
          status: "pending",
        });
        setShowAddForm(false);

        // Re-fetch participants
        await fetchEventAndParticipants();
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to add participant";
        setError(errorMessage);
        console.error("Add participant error:", err);
      } finally {
        setAdding(false);
      }
    },
    [id, addFormData, fetchEventAndParticipants]
  );

  // Memoize participants list to prevent unnecessary re-renders
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      // Sort by status: confirmed first, then pending, then declined
      const statusOrder = { confirmed: 0, pending: 1, declined: 2 };
      const statusA = statusOrder[a.status.toLowerCase()] ?? 3;
      const statusB = statusOrder[b.status.toLowerCase()] ?? 3;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // Then sort by name
      const nameA = (a.fullName || `User ${a.userId}`).toLowerCase();
      const nameB = (b.fullName || `User ${b.userId}`).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [participants]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <PageLayout title="Event Not Found" maxWidth="4xl">
        <ErrorMessage message="Event not found or you don't have permission to view it." />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (!isEventCreator()) {
    return (
      <PageLayout title="Access Denied" maxWidth="4xl">
        <ErrorMessage message="You don't have permission to manage this event's participants." />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate("/events")}>
            Back to Events
          </Button>
        </div>
      </PageLayout>
    );
  }

  const PeopleIcon = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
      />
    </svg>
  );

  return (
    <PageLayout
      title={`Participants - ${event.name}`}
      subtitle="Manage event participants"
      maxWidth="7xl"
      showBackButton
      backButtonProps={{ to: `/events/${id}` }}
    >
      <ErrorMessage message={error} className="mb-6" />

      {/* Event Info */}
      <Card className="mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {event.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {event.description}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="primary">
                {sortedParticipants.length} participants
              </Badge>
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? "Cancel" : "Add Participant"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Participant Form */}
      {showAddForm && (
        <FormContainer className="mb-6">
          <form onSubmit={handleAddParticipant}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Participant Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={addFormData.type}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                >
                  <option value="guest">Guest</option>
                  <option value="registered">Registered User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={addFormData.status}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            {addFormData.type === "registered" ? (
              <FormInput
                label="User ID"
                id="userId"
                name="userId"
                type="text"
                placeholder="Enter user ID"
                value={addFormData.userId}
                onChange={(e) =>
                  setAddFormData((prev) => ({
                    ...prev,
                    userId: e.target.value,
                  }))
                }
                required
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={addFormData.fullName}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  required
                />
                <FormInput
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={addFormData.email}
                  onChange={(e) =>
                    setAddFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAddForm(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={adding}>
                {adding ? "Adding..." : "Add Participant"}
              </Button>
            </div>
          </form>
        </FormContainer>
      )}

      {/* Participants List */}
      {sortedParticipants.length === 0 ? (
        <EmptyState
          icon={PeopleIcon}
          title="No participants yet"
          description="No one has joined this event yet. Add participants manually or share the event link."
          action={
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              Add First Participant
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {sortedParticipants.map((participant) => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                getStatusColor={getStatusColor}
              />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default EventParticipants;
