/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  September 2022  -- A3 Template
/////////////////////////////////////////////////////////////////////////////////////////

import * as THREE from 'three';
import { OrbitControls } from "./js/OrbitControls.js";
import { OBJLoader } from "./js/OBJLoader.js";
import { Keyframe, Motion } from "./motion.js";
import { SkinnedMesh } from 'three';

console.log('hello world');

var a=5;  
var b=2.6;
console.log('a=',a,'b=',b);
var myvector = new THREE.Vector3(0,1,2);
console.log('myvector =',myvector);

var animation = true;
var meshesLoaded = false;
var RESOURCES_LOADED = false;
var deg2rad = Math.PI/180;

// give the following global scope (in this file), which is useful for motions and objects
// that are related to animation

var myboxMotion = new Motion(myboxSetMatrices);     
var handMotion = new Motion(handSetMatrices);     
var link1, link2, link3, link4, link5;
var linkFrame1, linkFrame2, linkFrame3, linkFrame4, linkFrame5;
var sphere;    
var mybox;  
var meshes = {};  

// Giraffe character
var bodyLink, headLink, neckLink1, neckLink2, tailLink, fLegLink1, fLegLink2, fLegLink3, fLegLink4,
bLegLink1, bLegLink2, bLegLink3, bLegLink4;
var bodyLinkF, headLinkF, neckLinkF1, neckLinkF2, tailLinkF, fLegLinkF1, fLegLinkF2, fLegLinkF3, fLegLinkF4,
bLegLinkF1, bLegLinkF2, bLegLinkF3, bLegLinkF4;
var giraffeMotion = new Motion(giraffeMatrices);
var giraffeMotion2 = new Motion(giraffeMatrices);
var giraffeMotionOff = true;

// Creative component
var airDancerDirection = 0; // 0=Z 1=X 2=Y
var airDancers = [];
var skinGeometry;
var skinMaterial;
var segmentHeight = 1;
var segmentCount = 4;
var height = segmentHeight * segmentCount;
var halfHeight = height * 0.5;
var sizing = {
	segmentHeight: segmentHeight,
	segmentCount: segmentCount,
	height: height,
	halfHeight: halfHeight
};

// SETUP RENDERER & SCENE

var canvas = document.getElementById('canvas');
var camera;
var light;
var ambientLight;
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xd0f0d0);     // set background colour
canvas.appendChild(renderer.domElement);

//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

function initCamera() {
    // set up M_proj    (internally:  camera.projectionMatrix )
    var cameraFov = 30;     // initial camera vertical field of view, in degrees
      // view angle, aspect ratio, near, far
    camera = new THREE.PerspectiveCamera(cameraFov,1,0.1,1000); 

    var width = 10;  var height = 5;
//    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    camera.position.set(0,12,20);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt(0,0,0);
    scene.add(camera);

      // SETUP ORBIT CONTROLS OF THE CAMERA
    const controls = new OrbitControls( camera, renderer.domElement );
//    var controls = new OrbitControls(camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
};

// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
}

//SCROLLBAR FUNCTION DISABLE
window.onscroll = function () {
     window.scrollTo(0,0);
}

////////////////////////////////////////////////////////////////////////	
// init():  setup up scene
////////////////////////////////////////////////////////////////////////	

function init() {
    console.log('init called');

    initCamera();
    initMotions();
    initLights();
    initObjects();
    initHand();
    initGiraffe();
    initBone();
    initFileObjects();

    window.addEventListener('resize',resize);
    resize();
};

////////////////////////////////////////////////////////////////////////
// initMotions():  setup Motion instances for each object that we wish to animate
////////////////////////////////////////////////////////////////////////

function initMotions() {

      // keyframes for the mybox animated motion:   name, time, [x, y, z, theta]
    myboxMotion.addKeyFrame(new Keyframe('rest pose',0.0, [0, 0, 0, 0]));
    myboxMotion.addKeyFrame(new Keyframe('rest pose',1.0, [-3, 0, 0, -90]));
    myboxMotion.addKeyFrame(new Keyframe('rest pose',2.0, [-3, 6, 0, 0]));
    myboxMotion.addKeyFrame(new Keyframe('rest pose',3.0, [0, 6, 0, 0]));
    myboxMotion.addKeyFrame(new Keyframe('rest pose',8.0, [0, 0, 0, 0]));

      // basic interpolation test
    myboxMotion.currTime = 0.1;
    console.log('kf',myboxMotion.currTime,'=',myboxMotion.getAvars());    // interpolate for t=0.1
    myboxMotion.currTime = 2.9;
    console.log('kf',myboxMotion.currTime,'=',myboxMotion.getAvars());    // interpolate for t=2.9

      // keyframes for hand:    name, time, [x, y, theta1, theta2, theta3, theta4, theta5]
    handMotion.addKeyFrame(new Keyframe('straight',         0.0, [2, 3,    0, 0, 0, 0, 0]));
    handMotion.addKeyFrame(new Keyframe('right finger curl',1.0, [2, 3,    90, +150, -150, 0,0]));
    handMotion.addKeyFrame(new Keyframe('straight',         2.0, [2, 3,    0, 0, 0, 0, 0]));
    handMotion.addKeyFrame(new Keyframe('left finger curl', 3.0, [2, 3,    0, 0, 0, -90,-90]));
    handMotion.addKeyFrame(new Keyframe('straight',         4.0, [2, 3,    0, 0, 0, 0, 0]));
    handMotion.addKeyFrame(new Keyframe('both fingers curl',4.5, [2, 3,    90, -90, -90, -90,-90]));
    handMotion.addKeyFrame(new Keyframe('straight',         6.0, [2, 3,    0, 0, 0, 0, 0]));

    // giraffe motions
    // avars: x, y, z, neck2, tail, leftBottomLegs, rightBottomLegs, head, body
    giraffeMotion.addKeyFrame(new Keyframe('test', 0.0, [-3, 2, 6, 0, -45, 0, 0, 0, 0, 0, 0]));
    giraffeMotion.addKeyFrame(new Keyframe('test2', 1.0, [-3, 8, 6, -45, 45, 90, -90, 50, 0, 0, 0]));
    giraffeMotion.addKeyFrame(new Keyframe('test2', 2.0, [-3, 2, 6, 0, 0, 0, 0, 0, 0, 0, 0]));
    giraffeMotion.addKeyFrame(new Keyframe('test2', 3.0, [-3, 8, 6, 45, -45, 90, -90, 50, 0, 0, 0]));
    giraffeMotion.addKeyFrame(new Keyframe('test2', 4.0, [-3, 2, 6, 0, 45, 0, 0, 0, 0, 0, 0]));

    // avars: x, y, z, neck2, tail, leftBottomLegs, rightBottomLegs, head， leftTopLegs, rightTopLegs, body
    giraffeMotion2.addKeyFrame(new Keyframe('test', 0.0, [-5, 2, 6, 0, -90, 0, 0, -50, 70, 70, -30]));
    giraffeMotion2.addKeyFrame(new Keyframe('test2', 1.0, [5, 2, 6, 45, 90, 0, 0, 50, -70, -70, 30]));
    giraffeMotion2.addKeyFrame(new Keyframe('test2', 2.0, [-5, 2, 6, -45, -90, 0, 0, -50, 70, 70, -30]));
    giraffeMotion2.addKeyFrame(new Keyframe('test2', 3.0, [5, 2, 6, 45, 90, 0, 0, 50, -45, -45, 30]));
    giraffeMotion2.addKeyFrame(new Keyframe('test2', 4.0, [-5, 2, 6, -45, -90, 0, 0, -50, 45, 45, -30]));
}

///////////////////////////////////////////////////////////////////////////////////////
// myboxSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function myboxSetMatrices(avars) {
    // note:  in the code below, we use the same keyframe information to animation both
    //        the box and the dragon, i.e., avars[], although only the dragon uses avars[3], as a rotatino

     // update position of a box
    mybox.matrixAutoUpdate = false;     // tell three.js not to over-write our updates
    mybox.matrix.identity();              
    mybox.matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0], avars[1], avars[2]));  
    mybox.matrix.multiply(new THREE.Matrix4().makeRotationY(-Math.PI/2));
    mybox.matrix.multiply(new THREE.Matrix4().makeScale(1.0,1.0,1.0));
    mybox.updateMatrixWorld();  

     // update position of a dragon
    var theta = avars[3]*deg2rad;
    meshes["dragon1"].matrixAutoUpdate = false;
    meshes["dragon1"].matrix.identity();
    meshes["dragon1"].matrix.multiply(new THREE.Matrix4().makeTranslation(avars[0],avars[1],0));  
    meshes["dragon1"].matrix.multiply(new THREE.Matrix4().makeRotationX(theta));  
    meshes["dragon1"].matrix.multiply(new THREE.Matrix4().makeScale(0.3,0.3,0.3));
    meshes["dragon1"].updateMatrixWorld();  
}

///////////////////////////////////////////////////////////////////////////////////////
// handSetMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function handSetMatrices(avars) {
    var xPosition = avars[0];
    var yPosition = avars[1];
    var theta1 = avars[2]*deg2rad;
    var theta2 = avars[3]*deg2rad;
    var theta3 = avars[4]*deg2rad;
    var theta4 = avars[5]*deg2rad;
    var theta5 = avars[6]*deg2rad;
    var M = new THREE.Matrix4();

      ////////////// link1
    linkFrame1.matrix.identity(); 
    linkFrame1.matrix.multiply(M.makeTranslation(xPosition+4.0,yPosition,0));   
    linkFrame1.matrix.multiply(M.makeRotationZ(theta1));    
      // Frame 1 has been established, now setup the extra transformations for the scaled box geometry
    link1.matrix.copy(linkFrame1.matrix);
    link1.matrix.multiply(M.makeTranslation(2,0,0));   
    link1.matrix.multiply(M.makeScale(6,1,3));

      ////////////// link2
    linkFrame2.matrix.copy(linkFrame1.matrix);      // start with parent frame
    linkFrame2.matrix.multiply(M.makeTranslation(5,0,1));
    linkFrame2.matrix.multiply(M.makeRotationZ(theta2));    
      // Frame 2 has been established, now setup the extra transformations for the scaled box geometry
    link2.matrix.copy(linkFrame2.matrix);
    link2.matrix.multiply(M.makeTranslation(2,0,0));   
    link2.matrix.multiply(M.makeScale(4,1,1));    

      ///////////////  link3
    linkFrame3.matrix.copy(linkFrame2.matrix);
    linkFrame3.matrix.multiply(M.makeTranslation(4,0,0));
    linkFrame3.matrix.multiply(M.makeRotationZ(theta3));    
      // Frame 3 has been established, now setup the extra transformations for the scaled box geometry
    link3.matrix.copy(linkFrame3.matrix);
    link3.matrix.multiply(M.makeTranslation(2,0,0));   
    link3.matrix.multiply(M.makeScale(4,1,1));    

      /////////////// link4
    linkFrame4.matrix.copy(linkFrame1.matrix);
    linkFrame4.matrix.multiply(M.makeTranslation(5,0,-1));
    linkFrame4.matrix.multiply(M.makeRotationZ(theta4));    
      // Frame 4 has been established, now setup the extra transformations for the scaled box geometry
    link4.matrix.copy(linkFrame4.matrix);
    link4.matrix.multiply(M.makeTranslation(2,0,0));   
    link4.matrix.multiply(M.makeScale(4,1,1));    

      // link5
    linkFrame5.matrix.copy(linkFrame4.matrix);
    linkFrame5.matrix.multiply(M.makeTranslation(4,0,0));
    linkFrame5.matrix.multiply(M.makeRotationZ(theta5));    
      // Frame 5 has been established, now setup the extra transformations for the scaled box geometry
    link5.matrix.copy(linkFrame5.matrix);
    link5.matrix.multiply(M.makeTranslation(2,0,0));   
    link5.matrix.multiply(M.makeScale(4,1,1));    

    link1.updateMatrixWorld();
    link2.updateMatrixWorld();
    link3.updateMatrixWorld();
    link4.updateMatrixWorld();
    link5.updateMatrixWorld();

    linkFrame1.updateMatrixWorld();
    linkFrame2.updateMatrixWorld();
    linkFrame3.updateMatrixWorld();
    linkFrame4.updateMatrixWorld();
    linkFrame5.updateMatrixWorld();
}

function setLinkMatrix(linkFrameMatrix, linkMatrix, parentMatrix, ftx, fty, ftz, tx, ty, tz, rx, rz, sx, sy, sz) {
  var M = new THREE.Matrix4();
  
  linkFrameMatrix.copy(parentMatrix);
  linkFrameMatrix.multiply(M.makeTranslation(ftx,fty,ftz));  
  linkFrameMatrix.multiply(M.makeRotationX(rx));
  linkFrameMatrix.multiply(M.makeRotationZ(rz)); 
  linkMatrix.copy(linkFrameMatrix);
  linkMatrix.multiply(M.makeTranslation(tx,ty,tz));   
  linkMatrix.multiply(M.makeScale(sx, sy, sz));
}

///////////////////////////////////////////////////////////////////////////////////////
// giraffeMatrices(avars)
///////////////////////////////////////////////////////////////////////////////////////

function giraffeMatrices(avars) {
  var xPosition = avars[0];
  var yPosition = avars[1];
  var zPosition = avars[2];
  
  var theta1 = avars[3]*deg2rad;
  var theta2 = avars[4]*deg2rad;
  var theta3 = avars[5]*deg2rad;
  var theta4 = avars[6]*deg2rad;
  var theta5 = avars[7]*deg2rad;
  var theta6 = avars[8]*deg2rad;
  var theta7 = avars[9]*deg2rad;
  var theta8 = avars[10]*deg2rad;
  var M = new THREE.Matrix4();

  setLinkMatrix(bodyLinkF.matrix, bodyLink.matrix, M.identity(), xPosition, yPosition, zPosition,0,0,0,0,theta8,1,1,1.8);
  setLinkMatrix(neckLinkF2.matrix, neckLink2.matrix, bodyLinkF.matrix,0,0.5,0.65,0,0.8,0,0,0,0.5,1.6,0.5);
  setLinkMatrix(neckLinkF1.matrix, neckLink1.matrix, neckLinkF2.matrix,0,1.6,0,0,0.8,0,0,theta1,0.5,1.6,0.5);
  setLinkMatrix(headLinkF.matrix, headLink.matrix, neckLinkF1.matrix,0,1.6,0,0,0.2,0.1,theta5,0,0.5,0.4,0.7);
  setLinkMatrix(fLegLinkF1.matrix, fLegLink1.matrix, bodyLinkF.matrix,0.35,-0.5,0.65,0,-0.6,0,0,theta6,0.3,1.2,0.5);
  setLinkMatrix(fLegLinkF2.matrix, fLegLink2.matrix, fLegLinkF1.matrix,0,-1.2,0,0,-0.6,0,0,theta3,0.3,1.2,0.5);
  setLinkMatrix(fLegLinkF3.matrix, fLegLink3.matrix, bodyLinkF.matrix,-0.35,-0.5,0.65,0,-0.6,0,0,theta7,0.3,1.2,0.5);
  setLinkMatrix(fLegLinkF4.matrix, fLegLink4.matrix, fLegLinkF3.matrix,0,-1.2,0,0,-0.6,0,0,theta4,0.3,1.2,0.5);
  setLinkMatrix(bLegLinkF1.matrix, bLegLink1.matrix, bodyLinkF.matrix,0.35,-0.5,-0.65,0,-0.6,0,0,theta6,0.3,1.2,0.5);
  setLinkMatrix(bLegLinkF2.matrix, bLegLink2.matrix, bLegLinkF1.matrix,0,-1.2,0,0,-0.6,0,0,theta3,0.3,1.2,0.5);
  setLinkMatrix(bLegLinkF3.matrix, bLegLink3.matrix, bodyLinkF.matrix,-0.35,-0.5,-0.65,0,-0.6,0,0,theta7,0.3,1.2,0.5);
  setLinkMatrix(bLegLinkF4.matrix, bLegLink4.matrix, bLegLinkF3.matrix,0,-1.2,0,0,-0.6,0,0,theta4,0.3,1.2,0.5);
  setLinkMatrix(tailLinkF.matrix, tailLink.matrix, bodyLinkF.matrix,0,0,-0.9,0,0,-0.6,theta2,0,0.3,0.3,1.2);


  bodyLink.updateMatrixWorld();
  neckLink2.updateMatrixWorld();
  neckLink1.updateMatrixWorld();
  headLink.updateMatrixWorld();
  fLegLink1.updateMatrixWorld();
  fLegLink2.updateMatrixWorld();
  fLegLink3.updateMatrixWorld();
  fLegLink4.updateMatrixWorld();
  bLegLink1.updateMatrixWorld();
  bLegLink2.updateMatrixWorld();
  bLegLink3.updateMatrixWorld();
  bLegLink4.updateMatrixWorld();
  tailLink.updateMatrixWorld();

  bodyLinkF.updateMatrixWorld();
  neckLinkF2.updateMatrixWorld();
  neckLinkF1.updateMatrixWorld();
  headLinkF.updateMatrixWorld();
  fLegLinkF1.updateMatrixWorld();
  fLegLinkF2.updateMatrixWorld();
  fLegLinkF3.updateMatrixWorld();
  fLegLinkF4.updateMatrixWorld();
  bLegLinkF1.updateMatrixWorld();
  bLegLinkF2.updateMatrixWorld();
  bLegLinkF3.updateMatrixWorld();
  bLegLinkF4.updateMatrixWorld();
  tailLinkF.updateMatrixWorld();
}

/////////////////////////////////////	
// initLights():  SETUP LIGHTS
/////////////////////////////////////	

function initLights() {
    light = new THREE.PointLight(0xffffff);
    light.position.set(0,4,2);
    scene.add(light);
    ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
}

/////////////////////////////////////	
// MATERIALS
/////////////////////////////////////	

var diffuseMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
var diffuseMaterial2 = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide } );
var basicMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );
var armadilloMaterial = new THREE.MeshBasicMaterial( {color: 0x7fff7f} );

/////////////////////////////////////	
// initObjects():  setup objects in the scene
/////////////////////////////////////	

function initObjects() {
    var worldFrame = new THREE.AxesHelper(5) ;
    scene.add(worldFrame);

    // mybox 
    var myboxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth
    mybox = new THREE.Mesh( myboxGeometry, diffuseMaterial );
    mybox.position.set(4,4,0);
    scene.add( mybox );

    // textured floor
    var floorTexture = new THREE.TextureLoader().load('images/floor.jpg');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    var floorGeometry = new THREE.PlaneGeometry(15, 15);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -1.1;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    // sphere, located at light position
    var sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);    // radius, segments, segments
    sphere = new THREE.Mesh(sphereGeometry, basicMaterial);
    sphere.position.set(0,4,2);
    sphere.position.set(light.position.x, light.position.y, light.position.z);
    scene.add(sphere);

    // box
    var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth
    var box = new THREE.Mesh( boxGeometry, diffuseMaterial );
    box.position.set(-4, 0, 0);
    scene.add( box );

    // multi-colored cube      [https://stemkoski.github.io/Three.js/HelloWorld.html] 
    var cubeMaterialArray = [];    // order to add materials: x+,x-,y+,y-,z+,z-
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
    cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
      // Cube parameters: width (x), height (y), depth (z), 
      //        (optional) segments along x, segments along y, segments along z
    var mccGeometry = new THREE.BoxGeometry( 1.5, 1.5, 1.5, 1, 1, 1 );
    var mcc = new THREE.Mesh( mccGeometry, cubeMaterialArray );
    mcc.position.set(0,0,0);
    scene.add( mcc );	

    // cylinder
    // parameters:  radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
    var cylinderGeometry = new THREE.CylinderGeometry( 0.30, 0.30, 0.80, 20, 4 );
    var cylinder = new THREE.Mesh( cylinderGeometry, diffuseMaterial);
    cylinder.position.set(2, 0, 0);
    scene.add( cylinder );

    // cone:   parameters --  radiusTop, radiusBot, height, radialSegments, heightSegments
    var coneGeometry = new THREE.CylinderGeometry( 0.0, 0.30, 0.80, 20, 4 );
    var cone = new THREE.Mesh( coneGeometry, diffuseMaterial);
    cone.position.set(4, 0, 0);
    scene.add( cone);

    // torus:   parameters -- radius, diameter, radialSegments, torusSegments
    var torusGeometry = new THREE.TorusGeometry( 1.2, 0.4, 10, 20 );
    var torus = new THREE.Mesh( torusGeometry, diffuseMaterial);

    torus.rotation.set(0,0,0);     // rotation about x,y,z axes
    torus.scale.set(1,2,3);
    torus.position.set(-6, 0, 0);   // translation

    scene.add( torus );

    // custom object

    const geometry = new THREE.BufferGeometry();
    const vertices = [
	0,0,0,
	3,0,0,
	3,3,0,
	0,3,0
    ];
    const indices = [
	0, 1, 2, // first triangle
	2, 3, 0 // second triangle
    ];
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial();
    const customObject = new THREE.Mesh(geometry, material);
    customObject.position.set(0, 0, -2);
    scene.add(customObject);
}

/////////////////////////////////////////////////////////////////////////////////////
//  initHand():  define all geometry associated with the hand
/////////////////////////////////////////////////////////////////////////////////////

function initHand() {
    var handMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
    var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth

    link1 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link1 );
    linkFrame1   = new THREE.AxesHelper(1) ;   scene.add(linkFrame1);
    link2 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link2 );
    linkFrame2   = new THREE.AxesHelper(1) ;   scene.add(linkFrame2);
    link3 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link3 );
    linkFrame3   = new THREE.AxesHelper(1) ;   scene.add(linkFrame3);
    link4 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link4 );
    linkFrame4   = new THREE.AxesHelper(1) ;   scene.add(linkFrame4);
    link5 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( link5 );
    linkFrame5   = new THREE.AxesHelper(1) ;   scene.add(linkFrame5);

    link1.matrixAutoUpdate = false;  
    link2.matrixAutoUpdate = false;  
    link3.matrixAutoUpdate = false;  
    link4.matrixAutoUpdate = false;  
    link5.matrixAutoUpdate = false;
    linkFrame1.matrixAutoUpdate = false;  
    linkFrame2.matrixAutoUpdate = false;  
    linkFrame3.matrixAutoUpdate = false;  
    linkFrame4.matrixAutoUpdate = false;  
    linkFrame5.matrixAutoUpdate = false;
}

/////////////////////////////////////////////////////////////////////////////////////
//  initGiraffe():  define all geometry associated with the giraffe
/////////////////////////////////////////////////////////////////////////////////////

function initGiraffe() {
  var handMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
  var boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );    // width, height, depth

  bodyLink = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( bodyLink );
  headLink = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( headLink );
  neckLink1 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( neckLink1 );
  neckLink2 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( neckLink2 );
  tailLink = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( tailLink );
  fLegLink1 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( fLegLink1 );
  fLegLink2 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( fLegLink2 );
  fLegLink3 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( fLegLink3 );
  fLegLink4 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( fLegLink4 );
  bLegLink1 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( bLegLink1 );
  bLegLink2 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( bLegLink2 );
  bLegLink3 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( bLegLink3 );
  bLegLink4 = new THREE.Mesh( boxGeometry, handMaterial );  scene.add( bLegLink4 );

  bodyLinkF = new THREE.AxesHelper(1) ;   scene.add(bodyLinkF);
  headLinkF = new THREE.AxesHelper(1) ;   scene.add(headLinkF);
  neckLinkF1 = new THREE.AxesHelper(1) ;   scene.add(neckLinkF1);
  neckLinkF2 = new THREE.AxesHelper(1) ;   scene.add(neckLinkF2);
  tailLinkF = new THREE.AxesHelper(1) ;   scene.add(tailLinkF);
  fLegLinkF1 = new THREE.AxesHelper(1) ;   scene.add(fLegLinkF1);
  fLegLinkF2 = new THREE.AxesHelper(1) ;   scene.add(fLegLinkF2);
  fLegLinkF3 = new THREE.AxesHelper(1) ;   scene.add(fLegLinkF3);
  fLegLinkF4 = new THREE.AxesHelper(1) ;   scene.add(fLegLinkF4);
  bLegLinkF1 = new THREE.AxesHelper(1) ;   scene.add(bLegLinkF1);
  bLegLinkF2 = new THREE.AxesHelper(1) ;   scene.add(bLegLinkF2);
  bLegLinkF3 = new THREE.AxesHelper(1) ;   scene.add(bLegLinkF3);
  bLegLinkF4 = new THREE.AxesHelper(1) ;   scene.add(bLegLinkF4);

  bodyLink.matrixAutoUpdate = false;
  headLink.matrixAutoUpdate = false;  
  neckLink1.matrixAutoUpdate = false;  
  neckLink2.matrixAutoUpdate = false;  
  tailLink.matrixAutoUpdate = false;  
  fLegLink1.matrixAutoUpdate = false;
  fLegLink2.matrixAutoUpdate = false;
  fLegLink3.matrixAutoUpdate = false;
  fLegLink4.matrixAutoUpdate = false;
  bLegLink1.matrixAutoUpdate = false;
  bLegLink2.matrixAutoUpdate = false;
  bLegLink3.matrixAutoUpdate = false;
  bLegLink4.matrixAutoUpdate = false;

  bodyLinkF.matrixAutoUpdate = false;
  headLinkF.matrixAutoUpdate = false;
  neckLinkF1.matrixAutoUpdate = false;
  neckLinkF2.matrixAutoUpdate = false;
  tailLinkF.matrixAutoUpdate = false;
  fLegLinkF1.matrixAutoUpdate = false;
  fLegLinkF2.matrixAutoUpdate = false;
  fLegLinkF3.matrixAutoUpdate = false;
  fLegLinkF4.matrixAutoUpdate = false;
  bLegLinkF1.matrixAutoUpdate = false;
  bLegLinkF2.matrixAutoUpdate = false;
  bLegLinkF3.matrixAutoUpdate = false;
  bLegLinkF4.matrixAutoUpdate = false;
}

function initBone() {
  // parameters:  radiusAtTop, radiusAtBottom, height, radialSegments, heightSegments
  // Create geometry
  skinGeometry = new THREE.CylinderGeometry(
    0.3, // radiusTop
    0.3, // radiusBottom
    sizing.height, // height
    8, // radiusSegments
    sizing.segmentCount * 3, // heightSegments
    true // openEnded
  );

  const position = skinGeometry.attributes.position;

  const vertex = new THREE.Vector3();

  const skinIndices = [];
  const skinWeights = [];

  for ( let i = 0; i < position.count; i ++ ) {

    vertex.fromBufferAttribute( position, i );

    const y = ( vertex.y + sizing.halfHeight );

    const skinIndex = Math.floor( y / sizing.segmentHeight );
    const skinWeight = ( y % sizing.segmentHeight ) / sizing.segmentHeight;

    skinIndices.push( skinIndex, skinIndex + 1, 0, 0 );
    skinWeights.push( 1 - skinWeight, skinWeight, 0, 0 );

  }

  skinGeometry.setAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( skinIndices, 4 ) );
  skinGeometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeights, 4 ) );
  
  // Create material
  skinMaterial = new THREE.MeshPhongMaterial( {
    color: 0x156289,
    emissive: 0x072534,
    side: THREE.DoubleSide,
    flatShading: true
  } );

  createSkinnedMesh(-5, 1, 5);
}

function createSkinnedMesh(xPos, yPos, zPos) {
  // Create bones
  const bones = [];

	let prevBone = new THREE.Bone();
	bones.push( prevBone );
	prevBone.position.y = - sizing.halfHeight;

	for ( let i = 0; i < sizing.segmentCount; i ++ ) {

		const bone = new THREE.Bone();
		bone.position.y = sizing.segmentHeight;
		bones.push( bone );
		prevBone.add( bone );
		prevBone = bone;
	}

  const skinnedMesh = new THREE.SkinnedMesh( skinGeometry,	skinMaterial );
  const skeleton = new THREE.Skeleton( bones );

  skinnedMesh.add( bones[ 0 ] );

  skinnedMesh.bind( skeleton );

  const skeletonHelper = new THREE.SkeletonHelper( skinnedMesh );
  skeletonHelper.material.linewidth = 2;
  scene.add( skeletonHelper );

  skinnedMesh.scale.multiplyScalar( 1 );
  skinnedMesh.position.set(xPos, yPos, zPos);
  scene.add( skinnedMesh );
  airDancers.push(skinnedMesh);
}

/////////////////////////////////////////////////////////////////////////////////////
//  create customShader material
/////////////////////////////////////////////////////////////////////////////////////

var customShaderMaterial = new THREE.ShaderMaterial( {
//        uniforms: { textureSampler: {type: 't', value: floorTexture}},
	vertexShader: document.getElementById( 'customVertexShader' ).textContent,
	fragmentShader: document.getElementById( 'customFragmentShader' ).textContent
} );

// var ctx = renderer.context;
// ctx.getShaderInfoLog = function () { return '' };   // stops shader warnings, seen in some browsers

////////////////////////////////////////////////////////////////////////	
// initFileObjects():    read object data from OBJ files;  see onResourcesLoaded() for instances
////////////////////////////////////////////////////////////////////////	

var models;

function initFileObjects() {
        // list of OBJ files that we want to load, and their material
    models = {     
	teapot:    {obj:"obj/teapot.obj", mtl: customShaderMaterial, mesh: null	},
	armadillo: {obj:"obj/armadillo.obj", mtl: customShaderMaterial, mesh: null },
	dragon:    {obj:"obj/dragon.obj", mtl: customShaderMaterial, mesh: null }
    };

    var manager = new THREE.LoadingManager();
    manager.onLoad = function () {
	console.log("loaded all resources");
	RESOURCES_LOADED = true;
	onResourcesLoaded();
    }
    var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
	    var percentComplete = xhr.loaded / xhr.total * 100;
	    console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
    };
    var onError = function ( xhr ) {
    };

    // Load models;  asynchronous in JS, so wrap code in a fn and pass it the index
    for( var _key in models ){
	console.log('Key:', _key);
	(function(key){
	    var objLoader = new OBJLoader( manager );
	    objLoader.load( models[key].obj, function ( object ) {
		object.traverse( function ( child ) {
		    if ( child instanceof THREE.Mesh ) {
			child.material = models[key].mtl;
			child.material.shading = THREE.SmoothShading;
		    }	} );
		models[key].mesh = object;
	    }, onProgress, onError );
	})(_key);
    }
}

/////////////////////////////////////////////////////////////////////////////////////
// onResourcesLoaded():  once all OBJ files are loaded, this gets called.
//                       Object instancing is done here
/////////////////////////////////////////////////////////////////////////////////////

function onResourcesLoaded(){
	
 // Clone models into meshes;   [Michiel:  AFAIK this makes a "shallow" copy of the model,
 //                             i.e., creates references to the geometry, and not full copies ]
    meshes["armadillo1"] = models.armadillo.mesh.clone();
    meshes["armadillo2"] = models.armadillo.mesh.clone();
    meshes["dragon1"] = models.dragon.mesh.clone();
    meshes["teapot1"] = models.teapot.mesh.clone();
    meshes["teapot2"] = models.teapot.mesh.clone();
    
    // position the object instances and parent them to the scene, i.e., WCS
    // For static objects in your scene, it is ok to use the default postion / rotation / scale
    // to build the object-to-world transformation matrix. This is what we do below.
    //
    // Three.js builds the transformation matrix according to:  M = T*R*S,
    // where T = translation, according to position.set()
    //       R = rotation, according to rotation.set(), and which implements the following "Euler angle" rotations:
    //            R = Rx * Ry * Rz
    //       S = scale, according to scale.set()
    
    meshes["armadillo1"].position.set(-6, 1.5, 2);
    meshes["armadillo1"].rotation.set(0,-Math.PI/2,0);
    meshes["armadillo1"].scale.set(1,1,1);
    scene.add(meshes["armadillo1"]);

    meshes["armadillo2"].position.set(-3, 1.5, 2);
    meshes["armadillo2"].rotation.set(0,-Math.PI/2,0);
    meshes["armadillo2"].scale.set(1,1,1);
    scene.add(meshes["armadillo2"]);

    meshes["dragon1"].position.set(-5, 0.2, 4);
    meshes["dragon1"].rotation.set(0, Math.PI, 0);
    meshes["dragon1"].scale.set(0.3,0.3,0.3);
    scene.add(meshes["dragon1"]);

    meshes["teapot1"].position.set(3, 0, 3);
    meshes["teapot1"].scale.set(0.5, 0.5, 0.5);
    scene.add(meshes["teapot1"]);

    meshes["teapot2"].position.set(3, 0, 6);
    meshes["teapot2"].scale.set(0.2, 0.2, 0.2);
    scene.add(meshes["teapot2"]);

    meshesLoaded = true;
}


///////////////////////////////////////////////////////////////////////////////////////
// LISTEN TO KEYBOARD
///////////////////////////////////////////////////////////////////////////////////////

// movement
document.addEventListener("keydown", onDocumentKeyDown, false);
document.addEventListener("dblclick", onDocumentClick, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    // up
    if (keyCode == "W".charCodeAt()) {          // W = up
        light.position.y += 0.11;
        // down
    } else if (keyCode == "S".charCodeAt()) {   // S = down
        light.position.y -= 0.11;
        // left
    } else if (keyCode == "A".charCodeAt()) {   // A = left
	light.position.x -= 0.1;
        // right
    } else if (keyCode == "D".charCodeAt()) {   // D = right
        light.position.x += 0.11;
    } else if (keyCode == " ".charCodeAt()) {   // space
	animation = !animation;
    } else if (keyCode == "M".charCodeAt()) {   // M = giraffe motion
      giraffeMotionOff = !giraffeMotionOff;
    } else if (keyCode == "X".charCodeAt()) {   // X = direction of air dancers
      console.log(airDancerDirection);
      airDancerDirection = (airDancerDirection + 1) % 3;
    }
};

function onDocumentClick(event) {
  console.log(event);
  var vec = new THREE.Vector3(); // create once and reuse
  var pos = new THREE.Vector3(); // create once and reuse

  vec.set(
      ( event.clientX / window.innerWidth ) * 2 - 1,
      - ( event.clientY / window.innerHeight ) * 2 + 1,
      0.5 );

  vec.unproject( camera );

  vec.sub( camera.position ).normalize();

  var distance = - camera.position.z / vec.z;

  pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
  console.log(pos);

  var randomZPlane = Math.floor(Math.random() * (5 - (-5) + 1) + (-5));

  createSkinnedMesh(pos.x, Math.abs(pos.y), randomZPlane);
}


///////////////////////////////////////////////////////////////////////////////////////
// UPDATE CALLBACK:    This is the main animation loop
///////////////////////////////////////////////////////////////////////////////////////

function update() {
//    console.log('update()');
    var dt=0.02;
    const time = Date.now() * 0.005;
    if (animation && meshesLoaded) {
	  // advance the motion of all the animated objects
	    myboxMotion.timestep(dt);
   	  handMotion.timestep(dt);
      if (giraffeMotionOff) {
        giraffeMotion.timestep(dt);
      } else {
        giraffeMotion2.timestep(dt);
      }


      for (let a = 0; a < airDancers.length; a++) {
        var dancer = airDancers[a];
        for ( let i = 0; i < dancer.skeleton.bones.length; i ++ ) {
          if (airDancerDirection == 0) {
            dancer.skeleton.bones[ i ].rotation.z = Math.sin( time ) * 2 / dancer.skeleton.bones.length;
          } else if (airDancerDirection == 2) {
            dancer.skeleton.bones[ i ].rotation.y = Math.sin( time ) * 2 / dancer.skeleton.bones.length;
          } else {
            dancer.skeleton.bones[ i ].rotation.x = Math.sin( time ) * 2 / dancer.skeleton.bones.length;
          }
  
        }
      }
      
    }
    if (meshesLoaded) {
	    sphere.position.set(light.position.x, light.position.y, light.position.z);
	    renderer.render(scene, camera);
    }
    
    requestAnimationFrame(update);      // requests the next update call;  this creates a loop
}

init();
update();

