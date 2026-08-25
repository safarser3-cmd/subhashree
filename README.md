# 🌟 Shubhashree Sahu Fan Portal

Welcome to the ultimate fan experience dedicated to **Shubhashree Sahu**. This premium web application is designed to bring fans closer through stunning visual design, interactive elements, and a dedicated community space.

## ✨ Features

* **Cinematic Hero Experience**: Features a custom-built, interactive HTML5 Canvas engine using Three.js logic to render "Liquid Vapor" particle physics with large blurred orbs and additive blending.
* **Aggregated Social Feed**: A unified timeline showcasing updates from across various social platforms (Instagram-style images, Twitter-style thoughts, TikTok-style videos) in a beautifully animated bento-grid layout.
* **Ultimate Fan Love Calculator**: An interactive algorithm that computes your "Fan Bond Score" and generates a beautiful, downloadable verified fan card.
* **High-Res Gallery**: A masonry-style gallery featuring high-quality photography and moments.
* **Community Fan Art**: A dedicated space where fans can submit and view creative artworks inspired by Shubhashree.
* **Fan Messages Board**: Leave a supportive message and read thoughts from other fans worldwide.

## 🛠️ Technology Stack

* **Frontend Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Glassmorphism utilities
* **Animations**: Canvas 2D API for high-performance physics, CSS Keyframes, and modern transitions.
* **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites

Ensure you have Node.js (v18 or higher) installed.

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```
This will compile the TypeScript, bundle the React application, and output the static files into the `dist` directory, alongside compiling the server entry point (if full-stack).

## 📁 Project Structure

* `/src/components`: Contains all modular UI sections (`HeroSection`, `GallerySection`, `LoveCalculatorSection`, etc.)
* `/src/App.tsx`: The main application orchestrator, managing state and layout constraints (`max-w-7xl mx-auto`).
* `/src/index.css`: Global stylesheet containing custom Tailwind configurations and glass-panel CSS rules.
* `/public`: Static assets, images, and icons.

## 🎨 Design Philosophy

The application features a "Dark Luxury" aesthetic:
* **Glassmorphism**: Translucent panels with deep background blurs and subtle rose/pink tinted borders.
* **Strict Layout Boundaries**: Handled with `max-w-7xl mx-auto` and `overflow-hidden` constraints to prevent visual clipping and ensure a flawless experience across all screen sizes.
* **Smooth Interactions**: Every hover, click, and scroll is accompanied by smooth, hardware-accelerated CSS transitions.
