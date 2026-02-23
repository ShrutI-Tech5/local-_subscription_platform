import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { addInstantBooking, getServices, Service, SERVICE_TYPES } from '../../utils/mockData';
import { ArrowLeft, Upload, MapPin, Star, Phone, Edit2, CheckCircle, Mic, Square, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function InstantBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    address: '',
    phone: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [nearbyProviders, setNearbyProviders] = useState<Service[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize address and phone from user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        address: user.address || '',
        phone: user.mobile || ''
      }));
    }
  }, [user]);

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl('');
    audioChunksRef.current = [];
  };

  // Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Filter nearby providers after submission
  useEffect(() => {
    if (submitted && formData.serviceType && formData.address) {
      const allServices = getServices();
      const filtered = allServices.filter(service => 
        service.serviceType === formData.serviceType &&
        service.location.toLowerCase().includes(formData.address.toLowerCase().split(',')[0].trim())
      );
      setNearbyProviders(filtered.slice(0, 6));
    } else {
      setNearbyProviders([]);
    }
  }, [submitted, formData.serviceType, formData.address]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.serviceType) newErrors.serviceType = 'Please select a service type';
    if (!formData.description.trim() && !audioBlob) newErrors.description = 'Please describe your problem or record a voice note';
    if (!formData.address.trim()) newErrors.address = 'Please provide your address';
    if (!formData.phone.trim()) newErrors.phone = 'Please provide your phone number';
    if (formData.phone.trim().length < 10) newErrors.phone = 'Please provide a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Create instant booking ID
    const newBookingId = Date.now().toString();
    
    // Convert voice note to base64 if exists
    let voiceNoteBase64 = '';
    if (audioBlob) {
      try {
        voiceNoteBase64 = await blobToBase64(audioBlob);
      } catch (error) {
        console.error('Error converting voice note:', error);
      }
    }
    
    // Try to save to MongoDB via API
    try {
      const bookingData = {
        customerId: user!.id,
        customerName: user!.name,
        serviceType: formData.serviceType,
        description: formData.description,
        image: imagePreview || undefined,
        voiceNote: voiceNoteBase64 || undefined,
        address: formData.address,
        phone: formData.phone
      };

      const response = await fetch(`${API_BASE_URL}/instant-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      if (result.success) {
        console.log('Booking saved to MongoDB:', result.booking);
        // Use MongoDB booking ID if available
        setBookingId(result.booking.id || newBookingId);
      } else {
        setBookingId(newBookingId);
      }
    } catch (error) {
      console.error('Error saving booking to MongoDB:', error);
      setBookingId(newBookingId);
    }

    // Also save to localStorage for backwards compatibility
    const newBooking = {
      id: newBookingId,
      customerId: user!.id,
      customerName: user!.name,
      serviceType: formData.serviceType,
      description: formData.description,
      image: imagePreview || undefined,
      voiceNote: voiceNoteBase64 || undefined,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    addInstantBooking(newBooking);
    setSubmitted(true);
  };

  const handleSelectProvider = async () => {
    if (selectedProvider && bookingId) {
      const provider = nearbyProviders.find(p => p.id === selectedProvider);
      
      // Update booking with provider info in MongoDB
      try {
        await fetch(`${API_BASE_URL}/instant-booking/${bookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId: selectedProvider,
            providerName: provider?.providerName,
            price: provider?.monthlyPrice
          })
        });
      } catch (error) {
        console.error('Error updating booking in MongoDB:', error);
      }

      // Update localStorage for backwards compatibility
      const bookings = JSON.parse(localStorage.getItem('instantBookings') || '[]');
      const index = bookings.findIndex((b: any) => b.id === bookingId);
      if (index !== -1) {
        bookings[index] = {
          ...bookings[index],
          providerId: selectedProvider,
          providerName: provider?.providerName,
          price: provider?.monthlyPrice
        };
        localStorage.setItem('instantBookings', JSON.stringify(bookings));
      }
      navigate('/customer/dashboard');
    }
  };

  // Show provider selection after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-pink-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl text-pink-600 font-bold">Servease</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Booking Confirmation */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl text-gray-900">Booking Submitted!</h2>
                <p className="text-sm text-gray-600">Your request has been sent. Select a provider below.</p>
              </div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Service:</span>
                  <p className="text-gray-900 font-medium">{formData.serviceType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="text-gray-900">{formData.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h3 className="text-xl mb-2 text-gray-900">Select a Service Provider</h3>
            <p className="text-gray-600 mb-6">Choose a provider near your location</p>

            {nearbyProviders.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {nearbyProviders.map(provider => (
                    <div 
                      key={provider.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedProvider === provider.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-gray-900 font-medium">{provider.providerName}</h4>
                          <p className="text-sm text-gray-600">{provider.serviceType}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-700">{provider.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {provider.location}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">${provider.monthlyPrice}</span>
                        <span className="text-sm text-gray-600">/month</span>
                      </div>
                      {selectedProvider === provider.id && (
                        <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSelectProvider}
                  disabled={!selectedProvider}
                  className={`w-full py-4 rounded-lg text-lg transition-colors ${
                    selectedProvider 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedProvider ? 'Confirm Selection' : 'Select a Provider'}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No service providers found near your location.</p>
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl text-pink-600 font-bold">Servease</h1>
            </div>
          </div>
          <h1 className="text-3xl text-gray-900">Instant Booking</h1>
          <p className="text-gray-600">Get immediate help from available service providers</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          {/* Address and Phone Section */}
          <div className="bg-pink-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Service Location</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                {showAddressForm ? 'Cancel' : 'Change'}
              </button>
            </div>

            {showAddressForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-gray-700">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your address"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-pink-600 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{formData.address || 'No address provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-pink-600 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{formData.phone || 'No phone provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Type */}
            <div>
              <label className="block mb-2 text-gray-700">Service Type *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service type</option>
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}
            </div>

            {/* Description with Voice Note */}
            <div>
              <label className="block mb-2 text-gray-700">Problem Description *</label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the problem in detail or record a voice note..."
                  rows={5}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {audioUrl ? (
                    <>
                      <audio controls src={audioUrl} className="h-8 w-40" />
                      <button
                        type="button"
                        onClick={deleteRecording}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        title="Delete voice note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-full transition-colors ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={isRecording ? 'Stop recording' : 'Record voice note'}
                    >
                      {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
              {isRecording && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Recording... Click the microphone button to stop.
                </p>
              )}
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block mb-2 text-gray-700">Upload Image (Optional)</label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    id="problemImage"
                    accept="image/*"
                  />
                  <label htmlFor="problemImage" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600">Click to upload an image</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(''); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 text-lg"
            >
              Submit Booking Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
