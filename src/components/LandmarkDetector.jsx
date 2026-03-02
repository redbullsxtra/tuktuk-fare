import React, { useState, useRef } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import './LandmarkDetector.css';

const LandmarkDetector = () => {
  const { t } = useI18n();
  const [imagePreview, setImagePreview] = useState(null);
  const [landmarkName, setLandmarkName] = useState('');
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [sourceLocation, setSourceLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  
  const fileInputRef = useRef(null);

  // Mock landmark data for demonstration
  const mockLandmarks = {
    'temple': { name: 'Wat Pho', lat: 13.731506, lng: 100.472285 },
    'palace': { name: 'Grand Palace', lat: 13.751676, lng: 100.493843 },
    'bridge': { name: 'Rama VIII Bridge', lat: 13.746252, lng: 100.506866 },
    'market': { name: 'Chatuchak Weekend Market', lat: 13.814894, lng: 100.525082 },
  };

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Detect landmark using Qwen3-VL model
  const detectLandmark = async (imageData) => {
    // Configuration for Alibaba Cloud Model Studio API
    // Note: In a real application, these should be stored securely
    const apiKey = process.env.REACT_APP_ALIBABA_MODEL_STUDIO_API_KEY;
    
    // Prepare request body for Qwen3-VL model
    const requestBody = {
      model: 'qwen3-vl',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                image: imageData, // Pass the base64 image directly
              },
              {
                text: 'Identify the landmark or place shown in this image. Respond with just the name of the landmark or place.',
              }
            ]
          }
        ]
      },
      parameters: {
        temperature: 0.1,
        top_p: 0.9
      }
    };

    try {
      // Make request to backend proxy to avoid CORS issues
      const response = await fetch('http://localhost:5001/api/detect-landmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      // Debug output to see the raw Qwen3-VL response
      console.log("=== DEBUG: Qwen3-VL Response ===");
      console.log("Full response:", result);
      console.log("Detected place:", result.output?.choices?.[0]?.message?.content || "No place detected");
      console.log("===============================");
      
      // Parse the response to extract landmark name
      // Actual response structure may vary depending on API
      if (result.output && result.output.choices && result.output.choices.length > 0) {
        const detectedPlace = result.output.choices[0].message.content;
        const detectedPlaceName = detectedPlace.trim().toLowerCase();
        
        // Find the closest matching landmark from our mock data
        // In a real app, you would have coordinates from the API response
        for (const [key, landmark] of Object.entries(mockLandmarks)) {
          if (detectedPlaceName.includes(key) || landmark.name.toLowerCase().includes(detectedPlaceName)) {
            return landmark;
          }
        }
        
        // If no specific landmark matched, create a mock landmark based on the detected place
        // In a real app, you would geocode the place name to get coordinates
        return {
          name: detectedPlace.trim(),
          lat: 13.7563 + (Math.random() * 0.1 - 0.05), // Bangkok area with slight variation
          lng: 100.5018 + (Math.random() * 0.1 - 0.05)
        };
      }
      
      // If no result was returned, return a random one for demo
      const randomLandmarkKey = Object.keys(mockLandmarks)[Math.floor(Math.random() * Object.keys(mockLandmarks).length)];
      return mockLandmarks[randomLandmarkKey];
    } catch (error) {
      console.error(t('visionApiError', { error: error.message }));
      // Fallback to mock data if API fails
      const randomLandmarkKey = Object.keys(mockLandmarks)[Math.floor(Math.random() * Object.keys(mockLandmarks).length)];
      return mockLandmarks[randomLandmarkKey];
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(t('geolocationNotSupported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          reject(t('locationError', { error: error.message }));
        }
      );
    });
  };

  // Calculate distance using Google Maps Directions API
  const calculateDistance = async (origin, destination) => {
    const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      console.warn('Google Maps API key not found, using Haversine approximation');
      // Fallback to Haversine if API key is not available
      return calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&mode=driving&units=metric&key=${googleMapsApiKey}`
      );

      if (!response.ok) {
        throw new Error(`Google Maps API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        // Distance in meters, convert to kilometers
        const distanceInMeters = data.rows[0].elements[0].distance.value;
        return distanceInMeters / 1000;
      } else {
        throw new Error('Could not calculate distance using Google Maps API');
      }
    } catch (error) {
      console.error(t('mapsApiError', { error: error.message }));
      // Fallback to Haversine if Google Maps API fails
      return calculateDistanceHaversine(origin.lat, origin.lng, destination.lat, destination.lng);
    }
  };

  // Haversine formula as fallback
  const calculateDistanceHaversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Handle image upload and processing
  const handleUpload = async () => {
    if (!imagePreview) {
      setError(t('selectImageError'));
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Get user location (source)
      let location;
      if (!userLocation) {
        location = await getUserLocation();
      } else {
        location = userLocation;
      }

      // Store source location
      setSourceLocation(location);

      // Detect landmark (destination)
      const landmark = await detectLandmark(imagePreview);
      setLandmarkName(landmark.name);

      // Store destination location
      setDestinationLocation({ lat: landmark.lat, lng: landmark.lng });

      // Calculate distance
      const calculatedDistance = await calculateDistance(
        location, 
        { lat: landmark.lat, lng: landmark.lng }
      );
      
      setDistance(calculatedDistance.toFixed(2));

      // Calculate fare (50 THB base + 10 THB per km)
      const calculatedFare = 50 + (calculatedDistance * 10);
      setFare(calculatedFare.toFixed(2));

    } catch (err) {
      setError(t('apiError', { error: err.message || t('apiError') }));
    } finally {
      setLoading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="landmark-detector">
      <h1>{t('landmarkDetectorTitle')}</h1>
      
      <div className="upload-section">
        <button onClick={triggerFileInput} className="camera-button" disabled={loading}>
          {t('cameraButton')}
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt={t('landmarkDetectorTitle')} />
          </div>
        )}
        
        <button 
          onClick={handleUpload} 
          className="detect-button" 
          disabled={!imagePreview || loading}
        >
          {loading ? t('processing') : t('detectButton')}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      
      {landmarkName && (
        <div className="result-section">
          <h2>{t('landmarkDetected', { landmark: landmarkName })}</h2>
          
          {distance !== null && (
            <div className="distance-section">
              <p>{t('distanceLabel', { distance: distance })}</p>
              
              {sourceLocation && destinationLocation && (
                <div className="locations-section">
                  <p><strong>{t('sourceLocation')}:</strong> {sourceLocation.lat.toFixed(4)}, {sourceLocation.lng.toFixed(4)}</p>
                  <p><strong>{t('destinationLocation')}:</strong> {destinationLocation.lat.toFixed(4)}, {destinationLocation.lng.toFixed(4)}</p>
                </div>
              )}
              
              {fare !== null && (
                <div className="fare-section">
                  <h3>{t('fareEstimate', { fare: fare })}</h3>
                  <p>{t('baseFare')}</p>
                  <p><strong>{t('breakdown')}</strong></p>
                  <p>{t('baseFareText')}</p>
                  <p>{t('distanceCharge', { charge: (distance * 10).toFixed(2), distance: distance })}</p>
                  <p><strong>{t('total', { total: fare })}</strong></p>
                  
                  <div className="fare-references">
                    <h4>{t('fareReferences')}</h4>
                    <ul>
                      <li>{t('fareReference1')}</li>
                      <li>{t('fareReference2')}</li>
                      <li>{t('fareReference3')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandmarkDetector;