const scene = document.querySelector('a-scene');
const model = document.getElementById('model');
const camera = document.getElementById('camera');
const cursor = document.getElementById('cursor');

scene.addEventListener('click', (evt) => {
  // Pega a direção da câmera
  const camPos = camera.object3D.position;
  const camDir = new THREE.Vector3();
  camera.object3D.getWorldDirection(camDir);

  // Distância arbitrária da parede
  const distance = 2; // 2 metros na frente da câmera
  const targetPos = camPos.clone().add(camDir.multiplyScalar(distance));

  // Posiciona o modelo
  model.object3D.position.copy(targetPos);
  model.object3D.lookAt(camPos); // Faz ele “encarar” a câmera
  model.setAttribute('visible', true);
});
