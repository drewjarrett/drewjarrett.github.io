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
              Click here!
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