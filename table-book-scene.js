
// Import necessary Three.js modules
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;
camera.position.y = 1;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create room
const roomGeometry = new THREE.BoxGeometry(10, 5, 10);
const wallTexture = new THREE.TextureLoader().load('texture/wall1.jpg');
const floorTexture = new THREE.TextureLoader().load('texture/castle-floor-texture.jpg');

const roomMaterials = [
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Right face - red color
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Left face - green color
    new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }), // Top face - blue color
    new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.BackSide }), // Bottom face - yellow color
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide }), // Front face - magenta color
    new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.BackSide })  // Back face - cyan color
];
const room = new THREE.Mesh(roomGeometry, roomMaterials);
room.position.set(0, 1, 0);
scene.add(room);

 
const group = new THREE.Group(); 
 
//adding the castle model
const loader = new GLTFLoader();
//loader for gltf model
var castle = null;
loader.load( 'model/castle/scene.gltf', function ( gltf ) {
    castle = gltf.scene;
    var scale = 0.2;
    castle.scale.set(scale, scale, scale);
    castle.position.set(-0.10, -1.5, 0);
	scene.add( castle );

}, undefined, function ( error ) {

	console.error( error );

} );



// Create a light source
const light = new THREE.PointLight(0xffffff, 60, 40);
light.position.set(0, 2, 2);
scene.add(light);

scene.add( group );




// Animation loop
function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.01;

    renderer.render(scene, camera); 
}
animate();
