/**
 * Christmas Tree Joe — Three.js 3D Tree Renderer
 */
let scene, camera, renderer, treeGroup;

export function init3DStudio(containerId = 'webgl-container', canvasId = 'tree-canvas') {
  const container = document.getElementById(containerId);
  const canvas = document.getElementById(canvasId);
  if (!container || !canvas || typeof THREE === 'undefined') return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 4.5);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xd4af37, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  treeGroup = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8),
    new THREE.MeshBasicMaterial({ color: 0x3d2314 })
  );
  trunk.position.y = -0.4;
  treeGroup.add(trunk);

  // Cones
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x0B3B24 });
  [0.2, 0.7, 1.2].forEach((yPos, i) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9 - i * 0.2, 1.0 - i * 0.1, 8), foliageMat);
    cone.position.y = yPos;
    treeGroup.add(cone);
  });

  // Top Star
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: 0xD4AF37 }));
  star.position.y = 1.65;
  treeGroup.add(star);

  scene.add(treeGroup);

  function animate() {
    requestAnimationFrame(animate);
    treeGroup.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();
}

export function setSpeciesColor(speciesType) {
  if (!treeGroup) return;
  const colors = { Fraser: 0x0B3B24, Douglas: 0x1E5631, Noble: 0x072A19 };
  const targetColor = colors[speciesType] || 0x0B3B24;

  treeGroup.children.forEach(child => {
    if (child.geometry?.type === 'ConeGeometry') {
      child.material.color.setHex(targetColor);
    }
  });
}