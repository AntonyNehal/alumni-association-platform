
import React from 'react';
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
export default function AttractiveHeroSection() {
  // Inline styles for the hero section
  const heroSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)',
    padding: '0 2.5rem',
    position: 'relative',
    overflow: 'hidden'
  };

  // Background decoration
  const backgroundDecoStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
    `,
    zIndex: 1
  };

  const contentWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4rem',
    maxWidth: '1200px',
    width: '100%',
    position: 'relative',
    zIndex: 2
  };

  const textSectionStyle = {
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: '2.5rem',
    maxWidth: '600px',
    flex: 1
  };

  const headingStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
    background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 4px 8px rgba(0,0,0,0.3)'
  };

  const paragraphStyle = {
    fontSize: '1.25rem',
    lineHeight: '1.8',
    marginBottom: '2rem',
    color: '#e0e7ff',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
    color: '#1f2937',
    padding: '1rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(251, 191, 36, 0.4)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    position: 'relative',
    overflow: 'hidden'
  };

  const imageContainerStyle = {
    flex: 1,
    maxWidth: '500px',
    height: '400px',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  const placeholderImageStyle = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: 'white',
    fontWeight: 'bold'
  };

  // Responsive styles
  const mediaQueryStyle = `
    @media (max-width: 768px) {
      .hero-content {
        flex-direction: column;
        text-align: center;
        gap: 2rem;
      }
      .hero-text {
        padding-right: 0;
        max-width: 100%;
      }
      .hero-heading {
        font-size: 2rem;
      }
      .hero-image {
        max-width: 100%;
        height: 300px;
      }
    }
  `;

  const handleButtonHover = (e) => {
    e.target.style.transform = 'translateY(-3px)';
    e.target.style.boxShadow = '0 12px 35px rgba(251, 191, 36, 0.6)';
  };

  const handleButtonLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.4)';
  };
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/signup"); // path of the Signup page
  };

  return (
    <div>
      <style>{mediaQueryStyle}</style>
      <div style={heroSectionStyle}>
        {/* Background Decoration */}
        <div style={backgroundDecoStyle}></div>
        
        <div style={contentWrapperStyle} className="hero-content">
          {/* Text Section */}
          <div style={textSectionStyle} className="hero-text">
            <h1 style={headingStyle} className="hero-heading">
              Welcome to the CEC Alumni Association
            </h1>
            <p style={paragraphStyle}>
              A registered body of the Alumni members of our prestigious institution
              where you can connect with fellow members and experience the growing
              spirit of our college.
            </p>
            <button 
              style={buttonStyle}
              onMouseEnter={handleButtonHover}
               onClick={handleRegisterClick}
              onMouseLeave={handleButtonLeave}
            >
              REGISTER NOW
            </button>
          </div>

          {/* Image/Visual Section */}
          <div style={imageContainerStyle} className="hero-image">
            {/* Replace this div with your actual image */}
            <div style={placeholderImageStyle}>
                  {/* Carousel Section */}
     <div className="w-[700px] h-[500px] shadow-xl rounded-lg overflow-hidden">
       <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={2500}
        >
          <div>
            <img
              src="/clg1.jpg"
              alt="College 1"
              className="w-full h-[440px] object-cover"
            />
          </div>
          <div>
            <img
              src="/clg2.jpg"
              alt="College 2"
              className="w-full h-[440px] object-cover"
            />
          </div>
          <div>
            <img
              src="/clg3.jpg"
              alt="College 3"
              className="w-full h-[440px] object-cover"
            />
          </div>
        </Carousel>
      </div>
    </div>
            </div>
          </div>
        </div>
      </div>

  );
}