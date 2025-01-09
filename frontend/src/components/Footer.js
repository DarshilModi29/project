import React from 'react';

const Footer = () => (
  <footer className='mt-3' style={{
    backgroundColor: '#001F3F', // Deep navy blue
    color: '#F0F0F0', // Light grey for text
    padding: '40px 20px',
    textAlign: 'center',
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: '0 20px',
    }}>
      <div style={{ flex: '1', margin: '10px', textAlign: 'left' }}>
        <h4 style={{ color: '#F0E68C', marginBottom: '20px' }}>Quick Links</h4>
        <p>
          <a href="/about" style={linkStyle}>About</a><br />
          <a href="/story" style={linkStyle}>Story</a><br />
          <a href="/services" style={linkStyle}>Services</a><br />
          <a href="/contacts" style={linkStyle}>Contacts</a><br />
        </p>
      </div>
      <div style={{ flex: '1', margin: '10px', textAlign: 'left' }}>
        <h4 style={{ color: '#F0E68C', marginBottom: '20px' }}>Legal</h4>
        <p>
          <a href="/" style={linkStyle}>Privacy</a><br />
          <a href="/" style={linkStyle}>Terms of Use</a><br />
          <a href="/" style={linkStyle}>Legal Notes</a><br />
          <a href="/" style={linkStyle}>Credits</a><br />
        </p>
      </div>
      <div style={{ flex: '1', margin: '10px', textAlign: 'left' }}>
        <h4 style={{ color: '#F0E68C', marginBottom: '20px' }}>Contact Us</h4>
        <p>
          FONDAZIONE SENECA<br />
          Via Longhena 116<br />
          00060 - Nazzano (ROMA)<br />
          TEL. +39 0327 8523827
        </p>
      </div>
    </div>
  </footer>
);

const linkStyle = {
  color: '#F0F0F0', // Light grey for links
  textDecoration: 'none',
  transition: 'color 0.3s ease',
};

export default Footer;
