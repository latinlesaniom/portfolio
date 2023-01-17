import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { AsciiEffect } from "three/examples/jsm/effects/AsciiEffect.js";

/**
 * Debug
 */
const gui = new dat.GUI({
  width: 400,
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Medusa
 */
//Geometry
/**
 * Test cube
 */
let cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshPhongMaterial({ flatShading: true })
);

/**
 * Loaders
 */

const draco = new DRACOLoader();
draco.setDecoderPath("/draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(draco);

let animateMesh;

gltfLoader.load("./models/sci_fi_helmet_3.glb", (gltf) => {
  gltf.scene.position.set(1.2, -0.8, -2);
  gltf.scene.rotation.y = -Math.PI * 0.5;
  animateMesh = gltf.scene;
  scene.add(gltf.scene);
});

/**
 * Lights
 */
const AmbientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(AmbientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(1.2, 0, 2);
scene.add(directionalLight);
gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(5)
  .step(0.01)
  .name("LightIntensity");

/**
 * scroll
 */
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * mousemove
 */

const cursor = {};
cursor.x = 0;
cursor.y = 0;
window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearAlpha(0);

//composer
const composer = new EffectComposer(renderer);
const rendererPass = new RenderPass(scene, camera);
composer.addPass(rendererPass);

const glitchPass = new GlitchPass();
composer.addPass(glitchPass);

//controls
//const controls = new OrbitControls(camera, effect.domElement);
//controls.enableDamping = true;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previusTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previusTime;
  previusTime = elapsedTime;

  //camera
  camera.position.y = (-scrollY / sizes.height) * 6;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  camera.position.x += (parallaxX - camera.position.x) * 5 * deltaTime;
  camera.position.y += (parallaxY - camera.position.y) * 5 * deltaTime;

  //  if (animateMesh != undefined) {
  //    animateMesh.rotation.y += Math.abs(Math.sin(0.01) * 1.5);
  //  }

  //update controls
  // controls.update();

  // Render
  renderer.render(scene, camera);
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
