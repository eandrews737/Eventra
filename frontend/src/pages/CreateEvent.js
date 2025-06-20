import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../services/api";
import PageLayout from "../components/PageLayout";
import FormContainer from "../components/FormContainer";
import FormSection from "../components/FormSection";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

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
    <PageLayout
      title="Create New Event"
      subtitle="Set up your event details"
      showBackButton
      backButtonProps={{ variant: "logo", to: "/events" }}
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
              onClick={() => navigate("/events")}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </FormContainer>
    </PageLayout>
  );
};

export default CreateEvent;
