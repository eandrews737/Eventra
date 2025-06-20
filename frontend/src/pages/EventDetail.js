import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { eventsAPI, participantsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Badge from "../components/Badge";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      setEvent(response.data);
    } catch (err) {
      setError("Failed to fetch event details");
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await eventsAPI.delete(id);
      navigate("/events");
    } catch (err) {
      setError("Failed to delete event");
      console.error("Error deleting event:", err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleQuit = async () => {
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

      // Remove the participant using the participantId from the event data
      await participantsAPI.remove(event.participantId);
      // Refresh the event data
      await fetchEvent();
    } catch (err) {
      setError("Failed to quit event");
      console.error("Error quitting event:", err);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      await eventsAPI.join(eventId);
      // Refresh the event data
      await fetchEvent();
    } catch (err) {
      setError("Failed to join event");
      console.error("Error joining event:", err);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  const isUpcoming = (event) => {
    return new Date(event.startDatetime) > new Date();
  };

  const isEventCreator = () => {
    return user && event && event.createdBy === user.id;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !event) {
    return (
      <PageLayout title="Event Not Found">
        <ErrorMessage
          message={error || "The event you are looking for does not exist."}
          className="mb-6"
        />
        <Button variant="primary" onClick={() => navigate("/events")}>
          Back to Events
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      showBackButton
      backButtonProps={{ variant: "logo", to: "/events" }}
    >
      {/* Page Title */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {event.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {new Date(event.startDatetime).toLocaleDateString()} •{" "}
          {event.location}
        </p>
      </div>

      {/* Event details */}
      <FormContainer className="mb-6">
        {/* Event Information */}
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Event Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {event.description}
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="overflow-hidden">
            {/* Mobile-friendly layout */}
            <div className="block sm:hidden">
              <div className="space-y-4 p-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Date & Time
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(event.startDatetime)} -{" "}
                    {formatDateTime(event.endDatetime)}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Location
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div>{event.location}</div>
                    {event.locationDetails && (
                      <div className="mt-1 text-gray-500 dark:text-gray-400">
                        {event.locationDetails}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Attendees
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div className="flex flex-col space-y-2">
                      <span>
                        {event.minAttendees} - {event.maxAttendees} people
                      </span>
                      {event.participantCount !== undefined && (
                        <Badge variant="primary" size="small">
                          {event.participantCount} participants joined
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {event.preparationInfo && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                      Preparation Information
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {event.preparationInfo}
                    </div>
                  </div>
                )}

                {event.creator && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                      Created By
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {event.creator.fullName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop table layout */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 w-1/3">
                    Date & Time
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDateTime(event.startDatetime)} -{" "}
                    {formatDateTime(event.endDatetime)}
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 w-1/3">
                    Location
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    <div>
                      <div>{event.location}</div>
                      {event.locationDetails && (
                        <div className="mt-1 text-gray-500 dark:text-gray-400">
                          {event.locationDetails}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 w-1/3">
                    Attendees
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                      <span>
                        {event.minAttendees} - {event.maxAttendees} people
                      </span>
                      {event.participantCount !== undefined && (
                        <Badge variant="primary" size="small">
                          {event.participantCount} participants joined
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>

                {event.preparationInfo && (
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 w-1/3">
                      Preparation Information
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {event.preparationInfo}
                    </td>
                  </tr>
                )}

                {event.creator && (
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 w-1/3">
                      Created By
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {event.creator.fullName}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FormContainer>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <Badge
          variant={isUpcoming(event) ? "success" : "default"}
          size="medium"
        >
          {isUpcoming(event) ? "Upcoming" : "Past"}
        </Badge>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Join/Quit toggle button */}
          <Button
            variant={event.isParticipant ? "danger" : "success"}
            size="medium"
            onClick={
              event.isParticipant ? handleQuit : () => handleJoin(event.id)
            }
            className="w-full sm:w-auto flex items-center justify-center"
          >
            {event.isParticipant ? <>Quit Event</> : <>Join Event</>}
          </Button>

          {/* Only show manage participants button if user is the event creator */}
          {isEventCreator() && (
            <Link
              to={`/events/${id}/participants`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="success"
                size="medium"
                className="w-full sm:w-auto"
              >
                Manage Participants
              </Button>
            </Link>
          )}

          {/* Only show edit and delete buttons if user is the event creator */}
          {isEventCreator() && (
            <>
              <Link to={`/events/${id}/edit`} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="medium"
                  className="w-full sm:w-auto"
                >
                  Edit Event
                </Button>
              </Link>

              <Button
                variant="danger"
                size="medium"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full sm:w-auto"
              >
                Delete Event
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-300 dark:border-gray-600 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Event
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{event.name}"? This action
                cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="medium"
                  loading={deleting}
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default EventDetail;
