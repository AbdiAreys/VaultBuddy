# VaultBuddy Frontend

Cybersecurity-themed frontend for VaultBuddy secure secrets manager.

## Features

- **Cybersecurity Aesthetic**: Black/green/white color scheme with monospace fonts
- **Sharp Corners**: No rounded borders for that command-line feel
- **Neon Glow Effects**: Subtle green glows on hover and focus states
- **Dense Layout**: Information-rich interface with efficient space usage
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Integration**: Connects to Python backend for secret management

## Tech Stack

- React 18 with TypeScript
- CSS3 with custom properties
- JetBrains Mono font family
- Local storage fallback (for demo purposes)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Design System

### Colors
- **Primary Background**: `rgb(26, 26, 26)` - Deep black
- **Green Accent**: `rgb(0, 200, 0)` - Hacker green
- **Text Primary**: `white` - Main text
- **Text Secondary**: `rgb(170, 170, 170)` - Secondary text
- **Panel Background**: `rgb(35, 35, 35)` - Slightly lighter for panels

### Typography
- **Font Family**: JetBrains Mono, Courier New, monospace
- **Hierarchy**: h1 (2rem), h2 (1.5rem), body (1rem), small (0.8rem)

### Components
- **Buttons**: Sharp corners, uppercase text, green accents
- **Inputs**: Monospace font, green focus states, no rounded corners
- **Cards**: Dense layout, hover effects with green glow
- **Modals**: Full-screen overlays with green borders

## Backend Integration

The frontend is designed to integrate with the Python backend through:
- Direct Python subprocess calls
- REST API wrapper (future enhancement)
- Local storage fallback for demo purposes

## Security Features

- No secrets displayed in plain text
- Copy-to-clipboard functionality
- Secure password input fields
- OS keyring integration (via backend)
