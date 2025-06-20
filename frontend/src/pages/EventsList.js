import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { eventsAPI, participantsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Card from "../components/Card";
import Badge from "../components/Badge";
import VirtualizedList from "../components/VirtualizedList";

// Memoized Event Card Component
const EventCard = React.memo(
  ({
    event,
    user,
    onJoin,
    onQuit,
    actionLoading,
    formatDateTime,
    isUpcoming,
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

    const eventIsUpcoming = isUpcoming(event);
    const eventIsCreator = isEventCreator(event);

    return (
      <Card hover>
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
              variant={eventIsUpcoming ? "success" : "default"}
              className="ml-2"
            >
              {eventIsUpcoming ? "Upcoming" : "Past"}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarIcon />
              <span className="truncate">
                {formatDateTime(event.startDatetime)}
              </span>
            </div>
            <div className="flex items-center">
              <LocationIcon />
              <span className="truncate">{event.location}</span>
            </div>
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

// Debounced search hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const EventsList = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Debounce search to reduce filtering frequency
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (err) {
      setError("Failed to fetch events. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Memoize expensive computations
  const formatDateTime = useCallback((dateTime) => {
    return new Date(dateTime).toLocaleString();
  }, []);

  const isUpcoming = useCallback((event) => {
    return new Date(event.startDatetime) > new Date();
  }, []);

  const isEventCreator = useCallback(
    (event) => {
      return user && event && event.createdBy === user.id;
    },
    [user]
  );

  // Memoize filtered events to prevent recalculation on every render
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        event.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        event.location
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      let matchesFilter = true;
      if (filter === "upcoming") {
        matchesFilter = isUpcoming(event);
      } else if (filter === "past") {
        matchesFilter = !isUpcoming(event);
      }

      return matchesSearch && matchesFilter;
    });
  }, [events, debouncedSearchTerm, filter, isUpcoming]);

  const handleJoin = useCallback(
    async (eventId) => {
      try {
        setActionLoading((prev) => ({ ...prev, [eventId]: true }));
        setError(null);

        await eventsAPI.join(eventId);

        // Re-fetch events to update the UI
        await fetchEvents();
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
    },
    [fetchEvents]
  );

  const handleQuit = useCallback(
    async (event) => {
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
        await fetchEvents();
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
    },
    [fetchEvents]
  );

  // Render function for virtualized list
  const renderEventItem = useCallback(
    (event, index) => (
      <div className="mb-4">
        <EventCard
          event={event}
          user={user}
          onJoin={handleJoin}
          onQuit={handleQuit}
          actionLoading={actionLoading}
          formatDateTime={formatDateTime}
          isUpcoming={isUpcoming}
          isEventCreator={isEventCreator}
        />
      </div>
    ),
    [
      user,
      handleJoin,
      handleQuit,
      actionLoading,
      formatDateTime,
      isUpcoming,
      isEventCreator,
    ]
  );

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
      title="Events"
      subtitle="Browse and manage your events"
      maxWidth="7xl"
    >
      {/* Header with Create Event Button */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <Link to="/events/create">
          <Button
            variant="primary"
            size="large"
            className="w-full sm:w-auto flex items-center space-x-2"
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
            <span>Create Event</span>
          </Button>
        </Link>
      </div>

      <ErrorMessage message={error} className="mb-6" />

      {/* Filters and Search */}
      <FormContainer className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FormInput
              label="Search Events"
              id="search"
              name="search"
              type="text"
              placeholder="Search by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <label
              htmlFor="filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Filter
            </label>
            <select
              id="filter"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>
          <div className="sm:w-48">
            <label
              htmlFor="viewMode"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              View
            </label>
            <select
              id="viewMode"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>
      </FormContainer>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No events found"
          description={
            searchTerm || filter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating a new event."
          }
          action={
            !searchTerm && filter === "all" ? (
              <Link to="/events/create">
                <Button variant="primary">Create Event</Button>
              </Link>
            ) : null
          }
        />
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              user={user}
              onJoin={handleJoin}
              onQuit={handleQuit}
              actionLoading={actionLoading}
              formatDateTime={formatDateTime}
              isUpcoming={isUpcoming}
              isEventCreator={isEventCreator}
            />
          ))}
        </div>
      ) : (
        // Virtualized List View for better performance with large lists
        <VirtualizedList
          items={filteredEvents}
          itemHeight={280} // Approximate height of each event card
          containerHeight={600}
          renderItem={renderEventItem}
          className="border border-gray-200 dark:border-gray-600 rounded-lg"
          overscan={3}
        />
      )}
    </PageLayout>
  );
};

export default EventsList;
