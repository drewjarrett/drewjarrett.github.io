import * as THREE from 'three';
import { createThreeAppScene, Echo, Reticle } from './utils.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class ThreeARApp {
  /**
   * Init / Run when the WebXR Component loads.
   */
  activateAR = () => {
    this.createARCanvas().then(() => {
      this.creatEventListeners();
    });
  }

  exitAR = () => {
    window.removeEventListener("deviceorientation", this.handleOrientationEvent, true);
 
    // TODO: remove animateThreeJs ? remove this.renderer ?

    this.player.srcObject.getVideoTracks().forEach(track => track.stop());

    this.canvas.remove();
    this.player.remove();
    this.dom.remove();
  }

  /**
   * Add a canvas element and initialize a WebGL context.
   */
  createARCanvas = async () => {
  	this.dom = document.createElement("div");
    this.dom.width = window.innerWidth;
    this.dom.height = window.innerHeight;
    this.dom.className = "threeAr";

    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.className = "threeArCanvas";

    this.player = document.createElement("video");
    this.player.className = "threeArPlayer";
    this.player.setAttribute('autoplay', '');
    this.player.setAttribute('muted', '');
    this.player.setAttribute('playsinline', '');

    this.dom.appendChild(this.canvas);
    this.dom.appendChild(this.player);
    document.body.appendChild(this.dom);

    this.canvasContext = this.canvas.getContext("webgl");

    this.setupThreeJs();
  }

  /**
   * Initialize three.js specific rendering code which will define the AR view,
   * a scene, and a camera for viewing the 3D content.
   */
  setupThreeJs = () => {
    this.scene = createThreeAppScene();
    // this.camera = new THREE.PerspectiveCamera();
    this.camera = new THREE.PerspectiveCamera(75,
     	                                      this.canvas.width / this.canvas.height,
    	                                      0.1,
     	                                      1000);

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 1.5;

    this.scene.add(this.camera);
      
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: this.canvasContext
    });
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    document.body.appendChild(this.renderer.domElement);

    // Add Reticle.

    if (this.isCreateImg) {
      this.reticle = new Reticle();
      this.reticle.position.set(0, -0.2, -2);
      this.reticle.scale.set(1, 1, 1);
      this.reticle.visible = true;
      this.reticle.rotation.x = 0.4;

      this.camera.add(this.reticle);
    }

    // Start Render.
    this.animateThreeJs();
  }

  animateThreeJs = () => {
    requestAnimationFrame(this.animateThreeJs);

    if (this.reticle && this.isCreateImg) {
      this.reticle.rotation.y += 0.01;
    }

    if (this.pivot) {
      //this.pivot.rotation.y += 0.01;
    }

	this.renderer.render(this.scene, this.camera);
  }

  /**
   * Add Event Listeners.
   */

  handleOrientationEvent = (event) => {
  	const zee = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler();
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion(-1 * Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    
    const orientationAlpha = event.alpha * (Math.PI / 180);
    const orientationBeta = event.beta * (Math.PI / 180);
    const orientationGamma = event.gamma * (Math.PI / 180);
    const orientationWindow = (window.orientation || 0) * (Math.PI / 180);

    /* Update Camera Position */

    if (!this.camera) {
      return;
    }

    euler.set(orientationBeta, orientationAlpha, -1 * orientationGamma, "YXZ");

    this.camera.quaternion.setFromEuler(euler);
    this.camera.quaternion.multiply(q1);
    this.camera.quaternion.multiply(q0.setFromAxisAngle(zee, -1 * orientationWindow));
    
    this.camera.updateProjectionMatrix();
  }

  creatEventListeners = () => {
    const playerConstraints = {
      video: {
        facingMode: 'environment'
      },
      audio: false
    };
    navigator.mediaDevices.getUserMedia(playerConstraints).then((stream) => {
      this.player.srcObject = stream;
    });

  	// Device Orientation.
    if (typeof(DeviceOrientationEvent) !== "undefined"
      && typeof(DeviceOrientationEvent.requestPermission) === "function") {
      DeviceOrientationEvent.requestPermission()
        .then( response => {
          if ( response == "granted" ) {
            window.addEventListener("deviceorientation", this.handleOrientationEvent, true);
          } else {
            // ERROR
            alert("Drew Doh! There was an error :( No permission to use DeviceOrientationEvent");
          }
        });
    } else if (typeof(DeviceOrientationEvent) !== "undefined") {
      window.addEventListener("deviceorientation", this.handleOrientationEvent, true);
    } else {
      // ERROR
      alert("Drew Doh! There was an error :( DeviceOrientationEvent not here");
    }
  }

  /** Place an Echo in the scene. */

  createEcho = (createImgSrc) => {
    this.pivot = new THREE.Object3D();
    this.pivot.position.set(0, 0, 1.5);

    const echo = new Echo(createImgSrc);
    echo.position.set(0, 0.4, -1.5);
    echo.scale.set(0.8, 0.8, 0.8);

    this.pivot.add(echo);

    this.pivot.rotation.copy(this.camera.rotation);
    
    this.scene.add(this.pivot);

    //const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
    //shadowMesh.position.y = echo.position.y;

    this.camera.remove(this.reticle);
    this.reticle = null;
    this.isCreateImg = null;
  }
}

/**
 * ThreeAR Session.
 */
export class ThreeAR {
  constructor(stabilizedCallback, isCreateImg) {
  	stabilizedCallback();

  	this.ThreeARApp = new ThreeARApp();
  	this.ThreeARApp.isCreateImg = isCreateImg;
    this.ThreeARApp.activateAR();
  }

  dropEcho(createImgSrc) {
    this.ThreeARApp.createEcho(createImgSrc);
  }

  cleanUp = async () => {
    this.ThreeARApp.exitAR();
  }
}