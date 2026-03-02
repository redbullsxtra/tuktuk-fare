# Tuktuk Landmark Finder

A Progressive Web Application (PWA) that allows users to take photos of landmarks, detects the landmark using Alibaba Cloud Qwen3.5-flash model, calculates the distance using Google Maps API, and provides a fare estimate for tuktuk transportation.

## Features

- Camera upload functionality (supports both photo capture and image upload)
- Landmark recognition using Alibaba Cloud Qwen3.5-flash model via DashScope SDK
- Distance calculation from user's location to landmark using Google Maps API
- Fare estimation (50 THB base + 10 THB per km)
- Multiple fare reference sources for transparency
- Source and destination location display
- PWA capabilities for offline use and home screen installation
- Responsive design for mobile and desktop
- Multilingual support (Thai, English, Chinese, Japanese, Russian, Hindi)

## Prerequisites

- Node.js (v14 or higher)
- Python 3.7+
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the server directory with your API key:
```env
DASHSCOPE_API_KEY=your_alibaba_dashscope_api_key_here
```

4. Start the Python backend server:
```bash
python app.py
```

### Frontend Setup

1. From the main project directory, install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with your Google Maps API key:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. Start the frontend development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

## Architecture

The application uses a backend proxy server to securely handle API calls to Alibaba Cloud:
- Frontend (React) → Backend Proxy (Python Flask) → Alibaba Cloud Qwen3.5-flash API
- This pattern prevents exposing API keys in the browser

## Environment Variables

### Frontend
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API Key

### Backend
- `DASHSCOPE_API_KEY`: Your Alibaba Cloud DashScope API Key

## How to Use

1. Click the "Take Photo or Upload Image" button to capture a photo or select an image from your device
2. Click "Detect Landmark & Calculate Fare" to process the image
3. The app will detect the landmark using Qwen3.5-flash, calculate the distance from your current location, and provide a fare estimate

## Production Build

To create a production build, run:
```bash
npm run build
```

This will create an optimized build in the `build` directory.

## PWA Features

The application is built as a Progressive Web App with the following features:
- Works offline (with cached content)
- Installable on mobile devices and desktops
- Responsive design
- Fast loading times

## API Integration Notes

The application integrates with:
- Alibaba Cloud Qwen3.5-flash model via DashScope SDK for landmark recognition
- Google Maps API for distance calculation
- Browser Geolocation API for user location

## License

This project is open source and available under the MIT License.