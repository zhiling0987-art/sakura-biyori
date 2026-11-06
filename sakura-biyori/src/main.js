import * as THREE from "three";

const mount = document.querySelector("#scene");
const loading = document.querySelector("#loading");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#dfe4dc");
scene.fog = new THREE.Fog("#dfe4dc", 16, 31);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(9, 8, 11);
camera.lookAt(0, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xf8f3e7, 0x72796e, 2.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe8c8, 3.1);
sun.position.set(-7, 12, 7); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-12; sun.shadow.camera.right=12; sun.shadow.camera.top=12; sun.shadow.camera.bottom=-12;
scene.add(sun);

const mat = (color, roughness=.88) => new THREE.MeshStandardMaterial({color, roughness});
const wood=mat("#98765a"), darkWood=mat("#594b3e"), plaster=mat("#e7e0d1"), roof=mat("#536675"), roof2=mat("#71818a"), groundMat=mat("#a8a58c"), stone=mat("#777d73"), moss=mat("#71856a"), pink=mat("#f0c4cf"), palePink=mat("#f7dce0"), leaf=mat("#718b70"), waterMat=new THREE.MeshStandardMaterial({color:"#79b8b3",roughness:.25,metalness:.08,transparent:true,opacity:.88});
function mesh(geo, material, parent=scene, pos=[0,0,0]) { const o=new THREE.Mesh(geo,material); o.position.set(...pos); o.castShadow=true; o.receiveShadow=true; parent.add(o); return o; }
function box(parent, size, material, pos) { return mesh(new THREE.BoxGeometry(...size),material,parent,pos); }
function cylinder(parent, r1,r2,h,material,pos,segments=8) { return mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material,parent,pos); }

const world=new THREE.Group(); scene.add(world);
// square diorama base
box(world,[10,.48,10],mat("#d4cfc0"),[0,-.25,0]);
box(world,[9.72,.12,9.72],groundMat,[0,.04,0]);
const grass=mesh(new THREE.BoxGeometry(9.5,.08,9.5),mat("#9da88b"),world,[0,.13,0]);

// winding stream: overlapping organic water pools and stones
const waterGroup=new THREE.Group(); world.add(waterGroup);
const waterShape=new THREE.Shape();
waterShape.moveTo(-4.7,-2.1); waterShape.bezierCurveTo(-2.8,-2.8,-1.8,-1.0,-.1,-1.5); waterShape.bezierCurveTo(1.5,-2.1,2.4,-3.5,4.7,-2.5); waterShape.lineTo(4.7,-3.65); waterShape.bezierCurveTo(2.1,-4.4,1.2,-2.6,-.4,-2.55); waterShape.bezierCurveTo(-2.1,-2.5,-3.2,-3.7,-4.7,-3.1); waterShape.closePath();
const waterGeo=new THREE.ShapeGeometry(waterShape,32); waterGeo.rotateX(-Math.PI/2);
const water=mesh(waterGeo,waterMat,waterGroup,[0,.25,0]);
for(let i=0;i<55;i++){
 const x=-4.5+Math.random()*9,z=-3.8+Math.random()*2.8;
 if(Math.random()>.52) continue;
 const s=.08+Math.random()*.22;
 const b=mesh(new THREE.DodecahedronGeometry(s,0),stone,world,[x,.18+s*.22,z]); b.scale.y=.45;
}
const bridge=new THREE.Group(); world.add(bridge);
box(bridge,[1.55,.13,.52],wood,[1.55,.48,-2.55]);
for(let i=0;i<7;i++) cylinder(bridge,.035,.035,.55,darkWood,[.85+i*.23,.53,-2.55],6).rotation.z=Math.PI/2;
for(let i=0;i<2;i++) box(bridge,[1.7,.08,.07],darkWood,[1.55,.72,-2.78+i*.46]);

// house platform and architecture
box(world,[4.65,.22,3.5],darkWood,[0,.34,.15]);
box(world,[4.52,.12,3.38],mat("#c9b99d"),[0,.5,.15]);
const house=new THREE.Group(); world.add(house);
box(house,[4.25,1.85,2.65],plaster,[0,1.52,.2]);
// front timber frame
for(const x of [-2.12,0,2.12]) box(house,[.13,2.15,.14],darkWood,[x,1.56,-1.14]);
box(house,[4.45,.16,.16],wood,[0,2.56,-1.14]);
box(house,[4.45,.13,.16],wood,[0,.55,-1.14]);
// side posts
for(const z of [-1.05,1.45]) for(const x of [-2.08,2.08]) box(house,[.12,2.05,.12],wood,[x,1.55,z]);
// roof planes
const roofGeo=new THREE.BoxGeometry(4.95,.18,3.35);
const roofTop=mesh(roofGeo,roof,house,[0,2.72,.18]); roofTop.rotation.x=-.10;
const ridge=box(house,[5.05,.2,.22],darkWood,[0,3.12,.18]);
for(let side of [-1,1]){
 const e=box(house,[5.08,.14,.18],roof2,[0,2.55,.18+side*1.62]); e.rotation.x=side*.08;
 // visible layered tile rows
 for(let row=0;row<5;row++) for(let col=0;col<17;col++){
   const t=box(house,[.255,.055,.47],row%2?roof:roof2,[-2.36+col*.295,2.79-row*.055,.18+side*(.25+row*.29)]);
   t.rotation.x=side*.10;
 }
}
// front veranda floor
box(house,[4.2,.12,.62],wood,[0,.69,-1.48]);
// tatami room floor
for(let i=0;i<3;i++) for(let j=0;j<2;j++) {
 const t=box(house,[1.25,.045,1.05],mat("#c9b995"),[-1.35+i*1.3, .63,.25+j*.95]);
 t.material=mat("#c9b995");
}
// interior beams
box(house,[4.2,.12,.12],darkWood,[0,2.35,1.5]);
for(let x of [-2,2]) box(house,[.12,1.75,.12],darkWood,[x,1.55,1.48]);

// shoji sliding panels on front, open/close as a group
const doors=new THREE.Group(); house.add(doors); doors.position.set(0,.65,-1.05);
for(let side of [-1,1]){
 const panel=new THREE.Group(); doors.add(panel); panel.position.x=side*.78; panel.userData.side=side;
 box(panel,[1.42,1.7,.07],mat("#d9d2c2"),[0,.85,0]);
 for(let x=-.62;x<=.63;x+=.31) box(panel,[.025,1.62,.035],wood,[x,.85,-.05]);
 for(let y=.18;y<1.65;y+=.3) box(panel,[1.32,.025,.035],wood,[0,y,-.05]);
 panel.userData.homeX=side*.78; panel.userData.openX=side*1.48;
 panel.userData.door=true;
}

// cozy room details
const cushion=mat("#9c8c79");
box(house,[1.0,.16,.72],cushion,[-.5,.78,.55]);
box(house,[.8,.1,.58],wood,[.55,.78,.25]);
const tea=mat("#b77d5e");
cylinder(house,.16,.19,.24,tea,[.45,.98,.2],12);
for(let i=0;i<2;i++) cylinder(house,.09,.1,.09,mat("#e6d7c0"),[.12+i*.62,.9,.2],12);
for(let i=0;i<3;i++) { const d=mesh(new THREE.SphereGeometry(.11,12,10),[mat("#e7c8b8"),mat("#e9d9b0"),mat("#b9c9b4")][i],house,[.4+i*.2,1.02,-.2]); d.scale.set(1,.8,1); }
box(house,[.62,.07,.42],mat("#c8b99f"),[-1.25,.78,.4]).rotation.y=-.18;
box(house,[.08,.55,.08],wood,[1.65,1.02,1.1]);
box(house,[.42,.05,.3],wood,[1.65,1.32,1.1]);
box(house,[.3,.3,.04],mat("#d7c6a8"),[1.65,1.68,1.12]);

// stepping stones and entry shoes
for(let i=0;i<5;i++){ const s=mesh(new THREE.CylinderGeometry(.3,.34,.12,7),stone,world,[-1.5+i*.48,.22,-2.15-i*.22]); s.rotation.y=i*.4; }
for(let i=0;i<2;i++){ const shoe=mesh(new THREE.BoxGeometry(.28,.09,.42),darkWood,world,[.45+i*.28,.24,-1.82]); shoe.rotation.y=-.2; }

// cherry blossom trees, layered branches and clusters
const blossomMats=[mat("#f1c7d0"),mat("#f7dce0"),mat("#eab5c2"),mat("#f4d1d7")];
function makeTree(x,z,scale=1){
 const g=new THREE.Group(); world.add(g); g.position.set(x,.18,z); g.scale.setScalar(scale);
 cylinder(g,.22,.34,2.3,wood,[0,1.15,0],9);
 const branchEnds=[];
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7+.3, len=1.15+Math.random()*.55, y=1.35+Math.random()*.85;
  const end=new THREE.Vector3(Math.cos(a)*len,y,Math.sin(a)*len);
  const start=new THREE.Vector3(0,1.15,0), mid=start.clone().lerp(end,.55); mid.y+=.25;
  const curve=new THREE.QuadraticBezierCurve3(start,mid,end);
  const br=mesh(new THREE.TubeGeometry(curve,12,.055,6,false),darkWood,g,[0,0,0]);
  branchEnds.push(end);
 }
 branchEnds.forEach((p)=>{
  for(let j=0;j<7;j++){
   const q=new THREE.Vector3(p.x+(Math.random()-.5)*.9,p.y+(Math.random()-.5)*.55,p.z+(Math.random()-.5)*.9);
   const puff=mesh(new THREE.IcosahedronGeometry(.32+Math.random()*.17,1),blossomMats[Math.floor(Math.random()*blossomMats.length)],g,[q.x,q.y,q.z]);
   puff.scale.set(1.15,.8,1);
  }
 });
 for(let i=0;i<8;i++){
  const a=Math.random()*Math.PI*2,r=.3+Math.random()*.65;
  const puff=mesh(new THREE.IcosahedronGeometry(.25,1),blossomMats[i%4],g,[Math.cos(a)*r,2.1+Math.random()*.7,Math.sin(a)*r]);
  puff.scale.y=.75;
 }
 return g;
}
makeTree(-3.55,-.35,1.18); makeTree(3.45,.1,1.12); makeTree(-3.6,3.0,.92); makeTree(3.55,3.1,.9);

// shrubs, fern-like garden accents
for(let i=0;i<45;i++){
 const x=(Math.random()-.5)*8.8,z=-1.8+Math.random()*5.7;
 if(Math.abs(x)<2.35 && z<1.7) continue;
 const s=.12+Math.random()*.22;
 const shrub=mesh(new THREE.IcosahedronGeometry(s,1),i%3?leaf:moss,world,[x,.22+s*.45,z]);
 shrub.scale.y=.7;
}

// koi fish, animated around the stream
const fish=[];
for(let i=0;i<3;i++){
 const f=new THREE.Group(); world.add(f);
 const body=mesh(new THREE.SphereGeometry(.19,16,12),i===1?mat("#f1e5d1"):mat("#e7a66f"),f,[0,0,0]); body.scale.set(1.5,.55,.7);
 const tail=mesh(new THREE.ConeGeometry(.12,.28,5),mat("#f5e6d4"),f,[-.34,0,0]); tail.rotation.z=Math.PI/2;
 f.position.set(-2+i*1.6,.31,-2.9+i*.22); f.userData.phase=i*2.1; fish.push(f);
}

// falling petals
const petals=[];
const petalMat=new THREE.MeshStandardMaterial({color:"#efbdca",side:THREE.DoubleSide,roughness:.8});
for(let i=0;i<48;i++){
 const p=mesh(new THREE.CircleGeometry(.045,6),petalMat,world,[(Math.random()-.5)*8,1+Math.random()*5,(Math.random()-.5)*8]);
 p.rotation.x=-Math.PI/2; p.userData.speed=.25+Math.random()*.45; p.userData.phase=Math.random()*6; petals.push(p);
}

// lanterns
for(const x of [-1.8,1.8]){
 cylinder(world,.055,.055,.8,darkWood,[x,1.25,-1.72],7);
 const lamp=mesh(new THREE.BoxGeometry(.28,.38,.28),mat("#e9cda0"),world,[x,.92,-1.72]);
 lamp.material.emissive=new THREE.Color("#9b7040"); lamp.material.emissiveIntensity=.18;
}

// subtle ambient background paper screen
const screen=mesh(new THREE.PlaneGeometry(18,9),mat("#e5e3d9"),scene,[0,4,-7]);
screen.material.side=THREE.DoubleSide;

// interaction / orbit
let dragging=false, lastX=0,lastY=0, rotY=.55, rotX=-.18, zoom=1;
const target=new THREE.Vector3(0,1.2,0);
renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener("pointermove",e=>{if(!dragging)return;rotY+=(e.clientX-lastX)*.006;rotX=Math.max(-.65,Math.min(.2,rotX+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY;});
renderer.domElement.addEventListener("pointerup",()=>dragging=false);
renderer.domElement.addEventListener("pointercancel",()=>dragging=false);
renderer.domElement.addEventListener("wheel",e=>{zoom=Math.max(.72,Math.min(1.45,zoom+e.deltaY*.0007));},{passive:true});

let doorOpen=false;
function setDoor(open){doorOpen=open;doors.children.forEach(p=>p.userData.targetX=open?p.userData.openX:p.userData.homeX);}
doors.children.forEach(p=>p.userData.targetX=p.userData.homeX);
renderer.domElement.addEventListener("click",e=>{
 const rect=renderer.domElement.getBoundingClientRect();
 const mouse=new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
 const ray=new THREE.Raycaster(); ray.setFromCamera(mouse,camera);
 const hits=ray.intersectObjects(doors.children,true);
 if(hits.length) setDoor(!doorOpen);
});
document.querySelector("#doorBtn").addEventListener("click",()=>setDoor(!doorOpen));
document.querySelector("#calmBtn").addEventListener("click",()=>document.body.classList.toggle("calm"));

// time palettes
const times={
 morning:{bg:"#dfe7e0",fog:"#dfe7e0",sun:"#ffe6c5",intensity:3.1,hemi:2.0,water:"#79b8b3",lamp:.15},
 sunset:{bg:"#dfc6b2",fog:"#dfc6b2",sun:"#f3a879",intensity:2.35,hemi:1.25,water:"#719f9c",lamp:.45},
 night:{bg:"#252f3b",fog:"#303c49",sun:"#9eb4d0",intensity:.75,hemi:.65,water:"#456e78",lamp:1.8}
};
function setTime(name){
 const t=times[name]; scene.background.set(t.bg); scene.fog.color.set(t.fog); sun.color.set(t.sun); sun.intensity=t.intensity; hemi.intensity=t.hemi; waterMat.color.set(t.water);
 world.traverse(o=>{if(o.material?.emissive)o.material.emissiveIntensity=t.lamp;});
 document.querySelectorAll(".time-btn").forEach(b=>b.classList.toggle("active",b.dataset.time===name));
}
document.querySelectorAll(".time-btn").forEach(b=>b.addEventListener("click",()=>setTime(b.dataset.time)));

const clock=new THREE.Clock();
function resize(){
 const w=mount.clientWidth,h=mount.clientHeight;
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
new ResizeObserver(resize).observe(mount); resize();
function animate(){
 requestAnimationFrame(animate);
 const t=clock.getElapsedTime();
 world.rotation.y=rotY;
 world.rotation.x=rotX;
 world.scale.setScalar(zoom);
 doors.children.forEach(p=>{p.position.x=THREE.MathUtils.damp(p.position.x,p.userData.targetX,5,.016);});
 petals.forEach(p=>{p.position.y-=p.userData.speed*.016;p.position.x+=Math.sin(t+p.userData.phase)*.0018;p.rotation.z+=.008;if(p.position.y<.18){p.position.y=4+Math.random()*2;p.position.x=(Math.random()-.5)*8;p.position.z=(Math.random()-.5)*8;}});
 fish.forEach((f,i)=>{f.position.x=-2.4+((t*.28+i*2.6)%4.8);f.position.z=-2.9+Math.sin(t*.7+i)*.18;f.rotation.y=Math.PI;});
 waterMat.opacity=.82+Math.sin(t*1.7)*.035;
 renderer.render(scene,camera);
}
animate();
setTimeout(()=>loading.classList.add("hidden"),700);
