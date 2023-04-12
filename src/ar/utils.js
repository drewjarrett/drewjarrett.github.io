/**
 * Utils functions to be used with WebXR Experience.
 */

 import * as THREE from 'three';
 import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * The Echo class, creates and loads in the image we will drop.
 */
export class Echo extends THREE.Mesh {
  constructor(imgData) {
    super();
      
    const imgLoader = new THREE.TextureLoader();
    const imgMaterial = new THREE.MeshLambertMaterial({ // MeshBasicMaterial if want no light
      map: imgLoader.load(imgData),
      side: THREE.DoubleSide,
      opacity: 0.8,
      transparent: true
    });

    const imgGeometry = new THREE.PlaneGeometry(1.0, 1.3325)
    const basicMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: false,
      side: THREE.DoubleSide
    })

    this.geometry = imgGeometry;
    this.material = imgMaterial;
  }
}

/**
 * The Reticle class creates an object that repeatedly calls
 * `xrSession.requestHitTest()` to render a ring along a found
 * horizontal surface.
 */
export class Reticle extends THREE.Object3D {
  constructor() {
    super();

    this.loader = new GLTFLoader();
    //this.loader.load("/images/temp-notlicenced-reticle.gltf", (gltf) => {
    this.loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
      this.add(gltf.scene);
    })

    this.visible = false;
  }
}

/**
 * Creates a THREE.Scene containing lights that case shadows,
 * and a mesh that will receive shadows.
 *
 * @return {THREE.Scene}
 */
export function createThreeAppScene() {
  const scene = new THREE.Scene();

  // The materials will render as a black mesh
  // without lights in our scenes. Let's add an ambient light
  // so our material can be visible, as well as a directional light
  // for the shadow.
  const light = new THREE.AmbientLight(0xffffff, 1);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
  directionalLight.position.set(10, 15, 10);

  // We want this light to cast shadow.
  directionalLight.castShadow = true;

  // Make a large plane to receive our shadows
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  // Rotate our plane to be parallel to the floor
  planeGeometry.rotateX(-Math.PI / 2);

  // Create a mesh with a shadow material, resulting in a mesh
  // that only renders shadows once we flip the `receiveShadow` property.
  const shadowMesh = new THREE.Mesh(planeGeometry, new THREE.ShadowMaterial({
    color: 0x111111,
    opacity: 0.2,
  }));

  // Give it a name so we can reference it later, and set `receiveShadow`
  // to true so that it can render our model's shadow.
  shadowMesh.name = 'shadowMesh';
  shadowMesh.receiveShadow = true;
  shadowMesh.position.y = 10000;

  // Add lights and shadow material to scene.
  scene.add(shadowMesh);
  scene.add(light);
  scene.add(directionalLight);

  return scene;
}
