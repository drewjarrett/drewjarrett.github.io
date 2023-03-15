import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

class Hiro extends Component {
  constructor(props) {
    super(props);

    this.state = {lat : 51.0698916, lng: -1.3118446};

    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        lat : position.coords.latitude,
        lng : position.coords.longitude
      });
    });

    this.handleDrewClick = this.handleDrewClick.bind(this);
  }

  handleDrewClick() {
    let scene = document.querySelector('a-scene');

    let model = document.createElement('a-entity');
    model.setAttribute('gps-entity-place', 'latitude: ' + this.state.lat + '; longitude: ' + this.state.lng + ';');
    model.setAttribute('scale', '0.5 0.5 0.5');
    model.setAttribute('rotation', '0 180 0');
    model.setAttribute('position', '0 0 0');
    model.setAttribute('gltf-model', './assets/magnemite/scene.gltf');
    model.setAttribute('animation-mixer', '');

    scene.appendChild(model);

    alert('latitude: ' + this.state.lat + '; longitude: ' + this.state.lng + ';');
  }

  render() {
    return (
      <div>
        <div class="aSceneControls">
          <button onClick={this.handleDrewClick}>DREW</button>
        </div>
        <a-scene
          vr-mode-ui="enabled: false"
          embedded
          arjs='sourceType: webcam; sourceWidth:1280; sourceHeight:960; displayWidth: 1280; displayHeight: 960; debugUIEnabled: false;'>
          <a-camera gps-camera rotation-reader></a-camera>
        </a-scene>
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {startVr : false};

    this.handleStartClick = this.handleStartClick.bind(this);
  }

  handleStartClick() {
    this.setState({startVr : true });
  }

  render() {
    return (
      <div>
        {!this.state.startVr && (
          <button onClick={this.handleStartClick}>
              First we'll ask for Camera and Location permissions here
          </button>
        )}

        {this.state.startVr && (
          <Hiro />
        )}
      </div>
    )
  }
}

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);