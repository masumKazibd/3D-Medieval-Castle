import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Create a scene
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 12);

// Room dimensions
const roomWidth = 10;
const roomHeight = 4.0;  
const roomDepth = 10;
const floorY = -roomHeight / 2;

// Target point for camera focus
const castleTarget = new THREE.Vector3(0, 0, 0);

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Textures
const wallTexture = new THREE.TextureLoader().load('texture/wall1.jpg');
const floorTexture = new THREE.TextureLoader().load('texture/castle-floor-texture.jpg');

const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture, side: THREE.DoubleSide });
const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });

// ==========================================
// Custom Room Walls with Larger Doorway
// ==========================================
const roomGroup = new THREE.Group();

// Floor & Ceiling
const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), floorMaterial);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = floorY;
roomGroup.add(floorMesh);

const ceilingMesh = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), ceilingMaterial);
ceilingMesh.rotation.x = Math.PI / 2;
ceilingMesh.position.y = roomHeight / 2;
roomGroup.add(ceilingMesh);

// Left & Right Room Walls
const sideWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);

const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial);
leftWall.position.set(-roomWidth / 2, 0, 0);
leftWall.rotation.y = Math.PI / 2;
roomGroup.add(leftWall);

const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial);
rightWall.position.set(roomWidth / 2, 0, 0);
rightWall.rotation.y = -Math.PI / 2;
roomGroup.add(rightWall);

// Front Wall (Camera side)
const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMaterial);
frontWall.position.set(0, 0, roomDepth / 2);
frontWall.rotation.y = Math.PI;
roomGroup.add(frontWall);

// Back Wall with Doorhole
const doorWidth = 1.4; 
const doorHeight = 2.0;
const sideWallWidth = (roomWidth - doorWidth) / 2;
const backZ = -roomDepth / 2;

const backLeft = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, roomHeight), wallMaterial);
backLeft.position.set(-roomWidth / 2 + sideWallWidth / 2, 0, backZ);
roomGroup.add(backLeft);

const backRight = new THREE.Mesh(new THREE.PlaneGeometry(sideWallWidth, roomHeight), wallMaterial);
backRight.position.set(roomWidth / 2 - sideWallWidth / 2, 0, backZ);
roomGroup.add(backRight);

const topHeaderHeight = roomHeight - doorHeight;
const backTop = new THREE.Mesh(new THREE.PlaneGeometry(doorWidth, topHeaderHeight), wallMaterial);
backTop.position.set(0, roomHeight / 2 - topHeaderHeight / 2, backZ);
roomGroup.add(backTop);

scene.add(roomGroup);
 
// Castle Model Load 
const loader = new GLTFLoader();
var castle = null;

loader.load('model/castle/scene.gltf', function (gltf) {
    castle = gltf.scene;
    var scale = 0.25;
    castle.scale.set(scale, scale, scale);
    castle.position.set(0, floorY, 0);

    castle.traverse(function (child) {
        if (child.name === 'Object_51' || child.name === 'Object_52') {
            child.visible = false;
        }
    });

    scene.add(castle);
}, undefined, function (error) {
    console.error(error);
});
 
// Drawbridge Model Load (Opening Outwards) 
let bridgePivot = new THREE.Group();
let isBridgeOpen = false;
 
// closedAngle = +Math.PI / 2 (direct downwards) 
// openAngle = 0 (outwards)
const closedAngle = Math.PI / 2;
const openAngle = 0;
let targetBridgeRotation = closedAngle; 

loader.load('model/drawbridge.gltf', function (gltf) {
    const bridgeModel = gltf.scene;

    bridgeModel.scale.set(0.85, 0.85, 0.85);
    bridgeModel.position.set(0, 0, 0); 

    bridgePivot.add(bridgeModel);
    
    // face the drawbridge outwards (towards the camera)
    bridgePivot.rotation.y = Math.PI;

    // position set: outside the wall
    bridgePivot.position.set(0, floorY + 0.02, backZ - 0.02);
    bridgePivot.rotation.x = closedAngle;

    scene.add(bridgePivot);
}, undefined, function (error) {
    console.error('Error loading drawbridge:', error);
});
 
// Click Event Listener 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (bridgePivot) {
        const intersects = raycaster.intersectObjects(bridgePivot.children, true);

        if (intersects.length > 0) {
            toggleDrawbridge();
        }
    }
});

function toggleDrawbridge() {
    isBridgeOpen = !isBridgeOpen;
    targetBridgeRotation = isBridgeOpen ? openAngle : closedAngle;
}

// Lighting
const light = new THREE.PointLight(0xffffff, 80, 50);
light.position.set(0, 4, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

function handleCameraMovement() {
    const speed = 0.12;

    if (keys['w'] || keys['arrowup']) camera.translateZ(-speed);
    if (keys['s'] || keys['arrowdown']) camera.translateZ(speed);
    if (keys['a'] || keys['arrowleft']) camera.translateX(-speed);
    if (keys['d'] || keys['arrowright']) camera.translateX(speed);
    if (keys['q']) camera.position.y += speed;
    if (keys['e']) camera.position.y -= speed;

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

    if (bridgePivot) {
        bridgePivot.rotation.x = THREE.MathUtils.lerp(
            bridgePivot.rotation.x,
            targetBridgeRotation,
            0.05
        );
    }

    renderer.render(scene, camera); 
}
animate();