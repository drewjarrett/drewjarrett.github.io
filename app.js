import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

class Hiro extends Component {
  render() {
    return (
      <a-scene
       vr-mode-ui="enabled: false"
    embedded
        arjs='sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; debugUIEnabled: false;'>
        <a-camera gps-camera rotation-reader></a-camera>
  </a-scene>
    );
  }
}

function Square() {
  return (
    <button>
      Drew Test
    </button>
  );
}

let App = function Game() {
  return (
    <div>
      <Hiro />
      <Square />
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);