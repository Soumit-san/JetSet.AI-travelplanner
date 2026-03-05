import React from 'react';
import { 
  Plane,
  MessageSquare,
  Calendar,
  Map,
  Navigation,
} from 'lucide-react';

function App() {
  return (
    <div className="app-container">
      <div className="content-wrapper">
        <header className="header">
          <div className="header-content">
            <h1 className="app-title">JetSet.AI</h1>
            <p className="app-tagline">Your AI-Powered Travel Companion</p>
          </div>
        </header>

        <main className="main-content">
          <section className="hero-section">
            <h2 className="section-title">Plan Your Perfect Trip</h2>
            <p className="section-description">
              Let our AI travel assistant help you create unforgettable journeys tailored to your preferences.
            </p>
          </section>

          <section className="guide-section">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-container">
              <div className="step-card">
                <div className="step-icon">
                  <Map />
                </div>
                <h3 className="step-title">Enter Travel Details</h3>
                <p className="step-description">
                  Share your destination, travel dates, and preferences with our AI assistant.
                </p>
              </div>

              <div className="step-card">
                <div className="step-icon">
                  <MessageSquare />
                </div>
                <h3 className="step-title">Get Personalized Plans</h3>
                <p className="step-description">
                  Receive customized itineraries and recommendations based on your interests.
                </p>
              </div>

              <div className="step-card">
                <div className="step-icon">
                  <Calendar />
                </div>
                <h3 className="step-title">Plan & Book</h3>
                <p className="step-description">
                  Review your personalized travel plans and proceed with booking arrangements.
                </p>
              </div>
            </div>
          </section>

          <section className="features-section">
            <div className="feature-card">
              <Plane className="feature-icon" />
              <div className="feature-content">
                <h3 className="feature-title">Smart Travel Planning</h3>
                <p className="feature-description">
                  AI-powered recommendations for flights, accommodations, and activities.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <Navigation className="feature-icon" />
              <div className="feature-content">
                <h3 className="feature-title">Personalized Itineraries</h3>
                <p className="feature-description">
                  Custom travel plans based on your preferences and travel style.
                </p>
              </div>
            </div>
          </section>

          <footer className="welcome-footer">
            <p className="welcome-message">
              ¡Hola Amigos! Your AI assistant is present on the right side, START PLANNING; BON VOYAGE
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;