// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 4);

// Target point for camera focus (the castle's center location)
const castleTarget = new THREE.Vector3(-0.10, -1.5, 0);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create room
const roomGeometry = new THREE.BoxGeometry(10, 5, 10);
const wallTexture = new THREE.TextureLoader().load('texture/wall1.jpg');
const floorTexture = new THREE.TextureLoader().load('texture/castle-floor-texture.jpg');

const roomMaterials = [
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Right face
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Left face
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }),   // Top face
    new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.BackSide }),// Bottom face
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Front face
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide })  // Back face
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
room.position.set(0, 1, 0);
scene.add(room);


const group = new THREE.Group(); 
 
// Adding the castle model
const loader = new GLTFLoader();
//loader for gltf model
var castle = null;
loader.load('model/castle/scene.gltf', function (gltf) {
    castle = gltf.scene;
    var scale = 0.2;
    castle.scale.set(scale, scale, scale);
    castle.position.set(castleTarget.x, castleTarget.y, castleTarget.z);
    scene.add( castle );

}, undefined, function ( error ) {

    console.error( error );

} );



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

    // Keep camera focused on the castle position
    camera.lookAt(castleTarget);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    handleCameraMovement();

    renderer.render(scene, camera); 
}
animate();
