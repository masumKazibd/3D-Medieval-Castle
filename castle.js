import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 4);

// Room dimensions
const roomWidth = 10;
const roomHeight = 2.5;  
const roomDepth = 10;

// Target point for camera focus
const castleTarget = new THREE.Vector3(0, 0, 0);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create room
const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);
const wallTexture = new THREE.TextureLoader().load('texture/wall1.jpg');
const floorTexture = new THREE.TextureLoader().load('texture/castle-floor-texture.jpg');

const roomMaterials = [
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Right face
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Left face
    new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide }),   // Top face
    new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.BackSide }),// Bottom face
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Front face
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide })  // Back face
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
// রুমের সেন্টার (0, 0, 0) রাখা হয়েছে
room.position.set(0, 0, 0);
scene.add(room);

const group = new THREE.Group(); 

// Floor Y calculation: floor level is at -roomHeight / 2 (-3.0)
const floorY = -roomHeight / 2;

// Adding the castle model
const loader = new GLTFLoader();
var castle = null;

loader.load('model/castle/scene.gltf', function (gltf) {
    castle = gltf.scene;
    var scale = 0.25;
    castle.scale.set(scale, scale, scale);
    
    // castle position set to floor level
    castle.position.set(0, floorY, 0);

    // Object_51 and Object_52 hide/invisible
    castle.traverse(function (child) {
        if (child.name === 'Object_51' || child.name === 'Object_52') {
            child.visible = false;
        }
    });

    scene.add(castle);

}, undefined, function (error) {
    console.error(error);
});

// Create a light source
const light = new THREE.PointLight(0xffffff, 60, 40);
light.position.set(0, 2, 2);
scene.add(light);

scene.add(group);

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function handleCameraMovement() {
    const speed = 0.08;

    // Move forward / backward along current camera direction
    if (keys['w'] || keys['arrowup']) {
        camera.translateZ(-speed);
    }
    if (keys['s'] || keys['arrowdown']) {
        camera.translateZ(speed);
    }

    // Move left / right sideways
    if (keys['a'] || keys['arrowleft']) {
        camera.translateX(-speed);
    }
    if (keys['d'] || keys['arrowright']) {
        camera.translateX(speed);
    }

    // Move vertically up / down
    if (keys['q']) {
        camera.position.y += speed;
    }
    if (keys['e']) {
        camera.position.y -= speed;
    }

    // ==========================================
    // Wall Boundary Check (camera should not go through walls) 
    const padding = 0.4; // camera should not go too close to the walls
    const minX = -roomWidth / 2 + padding;
    const maxX = roomWidth / 2 - padding;
    const minY = -roomHeight / 2 + padding;
    const maxY = roomHeight / 2 - padding;
    const minZ = -roomDepth / 2 + padding;
    const maxZ = roomDepth / 2 - padding;

    camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
    camera.position.y = Math.max(minY, Math.min(maxY, camera.position.y));
    camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));

    // Keep camera focused on the castle position
    camera.lookAt(castleTarget);
}

// Window resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    handleCameraMovement();

    renderer.render(scene, camera); 
}
animate();