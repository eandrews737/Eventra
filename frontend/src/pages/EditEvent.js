import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsAPI } from "../services/api";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import FormSection from "../components/FormSection";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const EditEvent = () => {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getById(id);
      const event = response.data;

      // Format datetime for input fields
      const formatDateTimeForInput = (dateTime) => {
        const date = new Date(dateTime);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        name: event.name || "",
        description: event.description || "",
        startDatetime: formatDateTimeForInput(event.startDatetime),
        endDatetime: formatDateTimeForInput(event.endDatetime),
        location: event.location || "",
        minAttendees: event.minAttendees?.toString() || "",
        maxAttendees: event.maxAttendees?.toString() || "",
        locationDetails: event.locationDetails || "",
        preparationInfo: event.preparationInfo || "",
      });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // debugAuth();

      // Convert form data to proper format with snake_case field names
      const eventData = {
        name: formData.name,
        description: formData.description,
        start_datetime: formData.startDatetime,
        end_datetime: formData.endDatetime,
        location: formData.location,
        min_attendees: parseInt(formData.minAttendees) || 0,
        max_attendees: parseInt(formData.maxAttendees) || 0,
        location_details: formData.locationDetails,
        preparation_info: formData.preparationInfo,
      };

      console.log("Sending event data:", eventData);
      await eventsAPI.update(id, eventData);
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !formData.name) {
    return (
      <PageLayout title="Error">
        <ErrorMessage message={error} className="mb-6" />
        <Button variant="primary" onClick={() => navigate("/events")}>
          Back to Events
        </Button>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit Event"
      subtitle="Update your event details"
      showBackButton
      backButtonProps={{ variant: "logo", to: `/events/${id}` }}
    >
      <ErrorMessage message={error} className="mb-6" />

      <FormContainer>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <FormSection title="Basic Information">
            <FormInput
              label="Event Name"
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
            />

            <FormInput
              label="Description"
              id="description"
              name="description"
              type="textarea"
              required
              value={formData.description}
              onChange={handleChange}
            />
          </FormSection>

          {/* Date and Time */}
          <FormSection title="Date and Time">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label="Start Date & Time"
                id="startDatetime"
                name="startDatetime"
                type="datetime-local"
                required
                value={formData.startDatetime}
                onChange={handleChange}
              />

              <FormInput
                label="End Date & Time"
                id="endDatetime"
                name="endDatetime"
                type="datetime-local"
                required
                value={formData.endDatetime}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Location */}
          <FormSection title="Location">
            <FormInput
              label="Location"
              id="location"
              name="location"
              type="text"
              required
              placeholder="e.g., Conference Room A, Main Hall"
              value={formData.location}
              onChange={handleChange}
            />

            <FormInput
              label="Location Details"
              id="locationDetails"
              name="locationDetails"
              type="textarea"
              rows={3}
              placeholder="Additional location information, directions, etc."
              value={formData.locationDetails}
              onChange={handleChange}
            />
          </FormSection>

          {/* Attendees */}
          <FormSection title="Attendees">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <FormInput
                label="Minimum Attendees"
                id="minAttendees"
                name="minAttendees"
                type="number"
                min="0"
                value={formData.minAttendees}
                onChange={handleChange}
              />

              <FormInput
                label="Maximum Attendees"
                id="maxAttendees"
                name="maxAttendees"
                type="number"
                min="0"
                value={formData.maxAttendees}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Additional Information */}
          <FormSection title="Additional Information">
            <FormInput
              label="Preparation Information"
              id="preparationInfo"
              name="preparationInfo"
              type="textarea"
              rows={4}
              placeholder="What participants should bring, wear, or prepare for the event"
              value={formData.preparationInfo}
              onChange={handleChange}
            />
          </FormSection>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/events/${id}`)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </FormContainer>
    </PageLayout>
  );
};

export default EditEvent;
