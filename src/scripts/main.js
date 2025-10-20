import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js";

let camera, scene, renderer, controller;
let model, placed = false;

const info = document.getElementById("info");
const video = document.getElementById("fallbackCanvas");

(async function init() {
  if (navigator.xr && await navigator.xr.isSessionSupported('immersive-ar')) {
    startWebXR();
  } else {
    startFallbackMode();
  }
})();

function startWebXR() {
  info.innerText = "Modo AR real (ARCore/ARKit) detectado";

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  const loader = new GLTFLoader();
  loader.load('../models/satelite.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
  });

  renderer.setAnimationLoop(() => renderer.render(scene, camera));
}

function onSelect() {
  if (!model) return;
  const clone = model.clone();
  clone.position.setFromMatrixPosition(controller.matrixWorld);
  clone.position.y -= 0.05;
  scene.add(clone);
  info.innerText = "Satélite posicionado!";
  setTimeout(() => info.style.display = "none", 2500);
}

async function startFallbackMode() {
  info.innerText = "Modo sem ARCore — toque para posicionar o modelo.";

  // Acessa a câmera como fundo
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  video.srcObject = stream;

  // Cena 3D normal sobre o vídeo
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 1;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const loader = new GLTFLoader();
  loader.load('../models/satelite.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(0.3, 0.3, 0.3);
    scene.add(model);
    placed = true;
  });

  window.addEventListener('touchstart', (e) => {
    if (model && placed) {
      // move modelo conforme o toque
      const touch = e.touches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = -(touch.clientY / window.innerHeight) * 2 + 1;
      model.position.set(x, y, -1);
      info.innerText = "Modelo reposicionado.";
      setTimeout(() => info.style.display = "none", 2500);
    }
  });

  animateFallback();
}

function animateFallback() {
  requestAnimationFrame(animateFallback);
  if (model) model.rotation.y += 0.005;
  renderer.render(scene, camera);
}
