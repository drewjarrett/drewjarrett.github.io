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

       <a-entity gltf-model="test.jpg" rotation="0 180 0" scale="0.15 0.15 0.15" gps-entity-place="longitude: 12.489820; latitude: 41.892590;" animation-mixer />
      </a-scene>
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
    console.log('drew');
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('drew 2');
      alert(position.coords.latitude + " - " + position.coords.longitude);
    });

    //this.setState({startVr : true });
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