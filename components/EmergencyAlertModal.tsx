import React, { useState } from 'react';
import { AlertIcon, CloseIcon } from './Icons';

export interface EmergencyIncident {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  authority: string;
  phoneNumber: string;
  isActive: boolean;
}

interface EmergencyAlertModalProps {
  onClose: () => void;
  onReportEmergency: (
    incident: EmergencyIncident,
    location: string,
    details: string,
    contactNumber: string
  ) => void;
  incidents: EmergencyIncident[];
  currentLocation?: string;
}

const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  onClose,
  onReportEmergency,
  incidents,
  currentLocation,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [location, setLocation] = useState(currentLocation || '');
  const [details, setDetails] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const activeIncidents = incidents.filter(inc => inc.isActive);

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsGettingLocation(false);
        },
        error => {
          console.error('Error getting location:', error);
          alert('Could not get current location. Please enter manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = () => {
    if (!selectedIncident) {
      alert('Please select an emergency type!');
      return;
    }

    if (!location.trim()) {
      alert('Please provide the location of the emergency!');
      return;
    }

    if (!contactNumber.trim() || contactNumber.length < 10) {
      alert('Please provide a valid contact number!');
      return;
    }

    onReportEmergency(selectedIncident, location, details, contactNumber);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideInUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-800 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">🚨 Emergency Alert</h2>
                <p className="text-red-100 text-sm">Report urgent situations to authorities</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Alert Notice */}
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
            <p className="text-sm text-red-800 font-semibold">
              ⚠️ FOR EMERGENCIES ONLY - False reports may result in legal action
            </p>
          </div>

          {/* Select Emergency Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Emergency Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {activeIncidents.map(incident => (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedIncident?.id === incident.id
                      ? `border-${incident.color}-500 bg-${incident.color}-50 shadow-lg`
                      : 'border-gray-200 hover:border-red-300 hover:shadow-md'
                  }`}
                  style={{
                    borderColor: selectedIncident?.id === incident.id ? incident.color : undefined,
                    backgroundColor:
                      selectedIncident?.id === incident.id ? `${incident.color}10` : undefined,
                  }}
                >
                  <div className="text-center">
                    <span className="text-3xl mb-2 block">{incident.icon}</span>
                    <p className="text-sm font-semibold text-gray-800">{incident.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{incident.authority}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (GPS Coordinates or Address) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g., Kathmandu Durbar Square or 27.7172, 85.3240"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
              >
                {isGettingLocation ? '📍...' : '📍 Current'}
              </button>
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Contact Number *
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              placeholder="98XXXXXXXX"
              maxLength={10}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Additional Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe the situation briefly..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none resize-none"
            />
          </div>

          {/* Preview Selected Incident */}
          {selectedIncident && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
              <p className="text-xs text-red-700 font-semibold mb-2">SELECTED EMERGENCY</p>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{selectedIncident.icon}</span>
                  <div>
                    <p className="font-bold text-gray-800">{selectedIncident.label}</p>
                    <p className="text-sm text-gray-600">
                      Contacting: {selectedIncident.authority}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  📞 Emergency Number: {selectedIncident.phoneNumber}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              !selectedIncident ||
              !location.trim() ||
              !contactNumber.trim() ||
              contactNumber.length < 10
            }
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            🚨 Send Emergency Alert
          </button>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ How it works:</strong> Your emergency alert will be sent via WhatsApp to
              {selectedIncident ? ` ${selectedIncident.authority}` : ' the relevant authority'} and
              logged in the admin panel. Emergency services will be notified immediately. Please
              only use this for genuine emergencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlertModal;
