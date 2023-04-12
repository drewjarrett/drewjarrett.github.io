import * as THREE from 'three';
import { createThreeAppScene, Echo, Reticle } from './utils.js';

const { XRWebGLLayer } = window;


/**
 * Container class to manage connecting to the WebXR Device API
 * and handle rendering on every frame.
 */
class WebXRApp {

  /**
   * Let Parent know when we have stabilized AR
   */
  setStabilizedCallback(funcRef) {
    this.stabilizedCallback = funcRef;
  }

  /**
   * Init / Run when the WebXR Component loads.
   */
  activateXR = async () => {
  	try {
  	  this.xrSession = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.getElementById("ar-overlay") }
      });

      this.createXRCanvas();

      await this.onSessionStarted();
    } catch(error) {
      // TODO: Actually log error.
      alert("Drew Doh! There was an error :( " + error.message);

      console.log(error);
    }
  }

  exitXR = async () => {
    if (this.xrSession) {
      await this.xrSession.end();
    }
  }

  /**
   * Add a canvas element and initialize a WebGL context that is compatible with WebXR.
   */
  createXRCanvas() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl", {xrCompatible: true});

    this.xrSession.updateRenderState({
      baseLayer: new window.XRWebGLLayer(this.xrSession, this.gl)
    });
  }

  /**
   * Called on the XRSession's requestAnimationFrame.
   * Called with the time and XRPresentationFrame.
   */
  onXRFrame = (time, frame) => {
    // Queue up the next draw request.
    this.xrSession.requestAnimationFrame(this.onXRFrame);

    // Bind the graphics framebuffer to the baseLayer's framebuffer.
    const framebuffer = this.xrSession.renderState.baseLayer.framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)
    this.renderer.setFramebuffer(framebuffer);

    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(this.localReferenceSpace);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];

      const viewport = this.xrSession.renderState.baseLayer.getViewport(view);
      this.renderer.setSize(viewport.width, viewport.height)

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      this.camera.matrix.fromArray(view.transform.matrix)
      this.camera.projectionMatrix.fromArray(view.projectionMatrix);
      this.camera.updateMatrixWorld(true);

      // Conduct hit test.
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);

      // If we have results, consider the environment stabilized.
      if (!this.stabilized && hitTestResults.length > 0) {
        this.stabilized = true;
        this.stabilizedCallback();
      }
      if (hitTestResults.length > 0) {
        const hitPose = hitTestResults[0].getPose(this.localReferenceSpace);

        // Update the reticle position
        if (this.reticle && this.isCreateImg) {
          this.reticle.visible = true;
          this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
          this.reticle.updateMatrixWorld(true);
        }
      }

      // Render the scene with THREE.WebGLRenderer.
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Called when the XRSession has begun. Here we set up our three.js
   * renderer, scene, and camera and attach our XRWebGLLayer to the
   * XRSession and kick off the render loop.
   */
  onSessionStarted = async () => {
    // To help with working with 3D on the web, we'll use three.js.
    this.setupThreeJs();

    // Setup an XRReferenceSpace using the "local" coordinate system.
    this.localReferenceSpace = await this.xrSession.requestReferenceSpace('local');

    // Create another XRReferenceSpace that has the viewer as the origin.
    this.viewerSpace = await this.xrSession.requestReferenceSpace('viewer');

    // Perform hit testing using the viewer as origin.
    this.hitTestSource = await this.xrSession.requestHitTestSource({ space: this.viewerSpace });

    // Start a rendering loop using this.onXRFrame.
    this.xrSession.requestAnimationFrame(this.onXRFrame);
  }

  /**
   * Initialize three.js specific rendering code, including a WebGLRenderer,
   * a scene, and a camera for viewing the 3D content.
   */
  setupThreeJs() {
    // To help with working with 3D on the web, we'll use three.js.
    // Set up the WebGLRenderer, which handles rendering to our session's base layer.
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: this.gl
    });
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize our demo scene.
    this.scene = createThreeAppScene();

    if (this.isCreateImg) {
      this.reticle = new Reticle();
      this.scene.add(this.reticle);
    }

    // We'll update the camera matrices directly from API, so
    // disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    this.camera = new THREE.PerspectiveCamera();
    this.camera.matrixAutoUpdate = false;
  }

  /** Place an Echo in the scene. */
  createEcho = (createImgSrc) => {
    //const echo = new Echo('/images/temp-notlicenced-ghostbg.png');
    const echo = new Echo(createImgSrc);
    echo.position.copy(this.reticle.position);
    this.scene.add(echo);

    //const shadowMesh = this.scene.children.find(c => c.name === 'shadowMesh');
    //shadowMesh.position.y = echo.position.y;

    this.scene.remove(this.reticle);
    this.reticle = null;
    this.isCreateImg = null;
  }
}

/**
 * WebXR Session.
 */
export class WebXR {
  constructor(stabilizedCallback, isCreateImg) {
    this.webXRApp = new WebXRApp();

    this.webXRApp.setStabilizedCallback(stabilizedCallback);
    this.webXRApp.isCreateImg = isCreateImg;
    this.webXRApp.activateXR();
  }

  dropEcho(createImgSrc) {
    this.webXRApp.createEcho(createImgSrc);
  }

  cleanUp = async () => {
    await this.webXRApp.exitXR();
  }
}
