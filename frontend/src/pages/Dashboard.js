import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { eventsAPI, participantsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Card from "../components/Card";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";

// Memoized Dashboard Event Card Component
const DashboardEventCard = React.memo(
  ({
    event,
    user,
    onJoin,
    onQuit,
    actionLoading,
    formatDateTime,
    formatDate,
    formatTime,
    isEventCreator,
  }) => {
    const CalendarIcon = () => (
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    );

    const LocationIcon = () => (
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    );

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

    const EyeIcon = () => (
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        className="w-4 h-4 mr-1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    );

    const eventIsCreator = isEventCreator(event);

    return (
      <Card
        hover
        className="group relative overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate flex-1">
              <Link
                to={`/events/${event.id}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {event.name}
              </Link>
            </h3>
            <Badge
              variant={eventIsCreator ? "primary" : "success"}
              className="ml-2"
            >
              {eventIsCreator && event.isParticipant
                ? "Created & Joined"
                : eventIsCreator
                ? "Created"
                : "Joined"}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarIcon />
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatDate(event.startDatetime)}
                </span>
                <span className="text-xs">
                  {formatTime(event.startDatetime)}
                </span>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center">
                <LocationIcon />
                <span className="truncate">{event.location}</span>
              </div>
            )}

            {event.minAttendees && event.maxAttendees && (
              <div className="flex items-center">
                <PeopleIcon />
                <span className="truncate">
                  {event.minAttendees} - {event.maxAttendees} attendees
                  {event.participantCount !== undefined && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                      ({event.participantCount} joined)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to={`/events/${event.id}`} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="small"
                className="w-full sm:w-auto flex items-center justify-center"
              >
                <EyeIcon />
                View Details
              </Button>
            </Link>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {/* Join/Quit toggle button */}
              <Button
                variant={event.isParticipant ? "danger" : "success"}
                size="small"
                onClick={() =>
                  event.isParticipant ? onQuit(event) : onJoin(event.id)
                }
                disabled={actionLoading[event.id]}
                className="w-full sm:w-auto flex items-center justify-center"
              >
                {actionLoading[event.id] ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {event.isParticipant ? "Quitting..." : "Joining..."}
                  </>
                ) : (
                  <>{event.isParticipant ? "Quit" : "Join"}</>
                )}
              </Button>

              {/* Event creator specific buttons */}
              {eventIsCreator && (
                <>
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="primary"
                      size="small"
                      className="w-full sm:w-auto"
                    >
                      Edit
                    </Button>
                  </Link>
                  {event.isParticipant && (
                    <Link
                      to={`/events/${event.id}/participants`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="success"
                        size="small"
                        className="w-full sm:w-auto"
                      >
                        Manage
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const fetchDashboardEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getDashboardEvents();
        setEvents(response.data);
      } catch (err) {
        setError("Failed to fetch dashboard events. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardEvents();
  }, []);

  // Memoize expensive computations
  const formatDateTime = useCallback((dateTime) => {
    return new Date(dateTime).toLocaleString();
  }, []);

  const formatDate = useCallback((dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const formatTime = useCallback((dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const isEventCreator = useCallback(
    (event) => {
      return user && event && event.createdBy === user.id;
    },
    [user]
  );

  // Memoize the events slice to prevent unnecessary re-renders
  const dashboardEvents = useMemo(() => {
    return events.slice(0, 12); // Increased from 6 to 12
  }, [events]);

  const handleJoin = useCallback(async (eventId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [eventId]: true }));
      setError(null);

      await eventsAPI.join(eventId);

      // Re-fetch events to update the UI
      const response = await eventsAPI.getDashboardEvents();
      setEvents(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to join event";
      setError(errorMessage);
      console.error("Join event error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  }, []);

  const handleQuit = useCallback(async (event) => {
    try {
      // Check if the user is actually participating in this event
      if (!event.isParticipant) {
        setError("You are not participating in this event");
        return;
      }

      // Check if we have the participant ID
      if (!event.participantId) {
        setError("Unable to quit event: participant information not found");
        return;
      }

      setActionLoading((prev) => ({ ...prev, [event.id]: true }));
      setError(null);

      // Use the participantId directly from the event data
      await participantsAPI.remove(event.participantId);

      // Re-fetch events to update the UI
      const response = await eventsAPI.getDashboardEvents();
      setEvents(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to quit event";
      setError(errorMessage);
      console.error("Quit event error:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [event.id]: false }));
    }
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const CalendarIcon = (props) => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your events."
      maxWidth="7xl"
    >
      <ErrorMessage message={error} className="mb-6" />

      {/* Quick Actions */}
      <FormContainer className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/events/create" className="flex-1">
            <Button
              variant="primary"
              size="large"
              className="w-full flex items-center justify-center space-x-2"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Create New Event</span>
            </Button>
          </Link>
          <Link to="/events" className="flex-1">
            <Button
              variant="secondary"
              size="large"
              className="w-full flex items-center justify-center space-x-2"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Browse All Events</span>
            </Button>
          </Link>
        </div>
      </FormContainer>

      {/* Events Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Your Events
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Recent events you've created or joined
              {events.length > 12 && (
                <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                  (showing 12 of {events.length})
                </span>
              )}
            </p>
          </div>
          {events.length > 12 && (
            <Link to="/events">
              <Button variant="secondary" size="small">
                View All Events
              </Button>
            </Link>
          )}
        </div>

        {dashboardEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No events yet"
            description="You haven't created or joined any events yet. Get started by creating your first event!"
            action={
              <Link to="/events/create">
                <Button variant="primary">Create Event</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-6">
              {dashboardEvents.map((event) => (
                <DashboardEventCard
                  key={event.id}
                  event={event}
                  user={user}
                  onJoin={handleJoin}
                  onQuit={handleQuit}
                  actionLoading={actionLoading}
                  formatDateTime={formatDateTime}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  isEventCreator={isEventCreator}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Dashboard;
