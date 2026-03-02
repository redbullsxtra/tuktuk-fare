import React, { useState } from 'react';
import { I18nProvider } from './i18n/I18nProvider';
import LandmarkDetector from './components/LandmarkDetector';
import LanguageSelector from './components/LanguageSelector';
import './App.css';

function App() {
  return (
    <I18nProvider>
      <div className="App">
        <LanguageSelector />
        <h1 className="app-title">Tuktuk Landmark Finder</h1>
        
        <div className="tab-content">
          <LandmarkDetector />
        </div>
      </div>
    </I18nProvider>
  );
}

export default App;