import * as THREE from "three";

/* Sakura Biyori — Japanese miniature garden
   Procedural, deterministic scene assets; Three.js r166 CDN compatible. */

const mount = document.querySelector("#scene");
const loading = document.querySelector("#loading");
if (!mount) throw new Error('Missing #scene mount element');

const scene = new THREE.Scene();
scene.background = new THREE.Color("#e7e9df");
scene.fog = new THREE.Fog("#e7e9df", 22, 42);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(10.8, 8.6, -12.2);
camera.lookAt(0, 1.25, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xfff8ed, 0x6d7969, 1.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe5c7, 2.8);
sun.position.set(-7, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10;
sun.shadow.bias = -0.00025;
scene.add(sun);

const mat = (color, roughness = .82, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const wood = mat("#967456"), woodLight = mat("#b08b67"), woodDark = mat("#514236");
const plaster = mat("#e9e1d2"), paper = mat("#eee8d9", .95, { side: THREE.DoubleSide });
const roofMat = mat("#465b61", .78), roofEdge = mat("#34494e");
const earth = mat("#9da58b"), soil = mat("#827d68"), stone = mat("#77796e");
const moss = mat("#667c5e"), mossLight = mat("#829477");
const waterMat = new THREE.MeshPhysicalMaterial({
  color: "#79b8b0", roughness: .2, metalness: .05, clearcoat: .55,
  clearcoatRoughness: .2, transparent: true, opacity: .9, side: THREE.DoubleSide
});
const blossomColors = ["#f2c7d0", "#f7dce0", "#eab1c0", "#f5d0d7", "#fff0e9"];
const blossomMats = blossomColors.map(c => mat(c, .72));
const leafMat = mat("#71896b", .9);
const darkLeafMat = mat("#526c56", .9);

/* Fine, tileable artisan textures: subtle wood grain, washi fibers, tatami weave and fired clay. */
function canvasTexture(size, paint, repeatX = 2, repeatY = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  paint(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  return texture;
}
const woodGrain = canvasTexture(256, (ctx, n) => {
  ctx.fillStyle = "#b38e68"; ctx.fillRect(0,0,n,n);
  for (let i=0;i<90;i++) {
    const y = (i/90)*n, wobble = Math.sin(i*.7)*3;
    ctx.strokeStyle = i%5===0 ? "rgba(72,45,27,.18)" : "rgba(255,235,198,.15)";
    ctx.lineWidth = i%5===0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(0,y);
    ctx.bezierCurveTo(n*.3,y+wobble,n*.65,y-wobble,n,y+Math.sin(i)*2); ctx.stroke();
  }
  for (const [x,y,r] of [[62,70,13],[194,183,9],[132,228,5]]) {
    ctx.strokeStyle="rgba(75,47,29,.22)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(x,y,r,r*.38,.2,0,Math.PI*2); ctx.stroke();
  }
}, 2, 1);
const washiGrain = canvasTexture(256, (ctx,n) => {
  ctx.fillStyle="#eee5d2"; ctx.fillRect(0,0,n,n);
  for(let i=0;i<500;i++){
    const x=(i*73)%n,y=(i*151)%n;
    ctx.strokeStyle=i%3===0?"rgba(151,126,91,.11)":"rgba(255,255,255,.35)";
    ctx.lineWidth=.6; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(i*13)%13,y+(i*3)%3); ctx.stroke();
  }
}, 1, 1);
const tatamiWeave = canvasTexture(256, (ctx,n) => {
  ctx.fillStyle="#c7b995"; ctx.fillRect(0,0,n,n);
  for(let y=0;y<n;y+=4){
    ctx.fillStyle=y%8===0?"rgba(89,104,72,.17)":"rgba(255,247,218,.24)";
    ctx.fillRect(0,y,n,2);
  }
  for(let x=0;x<n;x+=5){
    ctx.fillStyle=x%10===0?"rgba(103,91,62,.13)":"rgba(255,255,255,.18)";
    ctx.fillRect(x,0,2,n);
  }
}, 2, 2);
const ceramicGrain = canvasTexture(256, (ctx,n) => {
  ctx.fillStyle="#607276"; ctx.fillRect(0,0,n,n);
  for(let i=0;i<1700;i++){
    const v=i%2===0?255:20, a=((i*17)%9)/100;
    ctx.fillStyle=`rgba(${v},${v},${v},${a})`;
    ctx.fillRect((i*73)%n,(i*151)%n,(i*7)%3+1,(i*11)%2+1);
  }
}, 3, 3);
wood.map = woodGrain; woodLight.map = woodGrain; woodDark.map = woodGrain;
wood.needsUpdate = woodLight.needsUpdate = woodDark.needsUpdate = true;
plaster.map = washiGrain; plaster.needsUpdate = true;
roofMat.map = ceramicGrain; roofMat.needsUpdate = true;

let seed = 712031;
function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function range(a, b) { return a + (b - a) * rand(); }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

function addMesh(parent, geometry, material, position = [0, 0, 0], options = {}) {
  const o = new THREE.Mesh(geometry, material);
  o.position.set(...position);
  o.castShadow = options.castShadow !== false;
  o.receiveShadow = options.receiveShadow !== false;
  if (options.rotation) o.rotation.set(...options.rotation);
  if (options.scale) o.scale.set(...options.scale);
  parent.add(o);
  return o;
}
function box(parent, size, material, pos, options = {}) {
  return addMesh(parent, new THREE.BoxGeometry(...size), material, pos, options);
}
function tube(parent, points, radius, material, segments = 18, radial = 7) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return addMesh(parent, new THREE.TubeGeometry(curve, segments, radius, radial, false), material);
}
function taperedTube(parent, points, radiusStart, radiusEnd, material, segments = 28, radial = 9) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const frames = curve.computeFrenetFrames(segments, false);
  const vertices = [], indices = [];
  for (let i=0;i<=segments;i++) {
    const t=i/segments, point=curve.getPointAt(t);
    const radius=THREE.MathUtils.lerp(radiusStart,radiusEnd,t) * (1 + .035*Math.sin(t*17));
    for(let j=0;j<=radial;j++){
      const a=j/radial*Math.PI*2;
      const normal=frames.normals[i].clone().multiplyScalar(Math.cos(a));
      const binormal=frames.binormals[i].clone().multiplyScalar(Math.sin(a));
      const v=point.clone().addScaledVector(normal,radius).addScaledVector(binormal,radius);
      vertices.push(v.x,v.y,v.z);
      if(i<segments && j<radial){
        const k=i*(radial+1)+j;
        indices.push(k,k+radial+1,k+1,k+1,k+radial+1,k+radial+2);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return addMesh(parent,geometry,material);
}
function lathe(parent, profile, material, pos, segments = 16) {
  return addMesh(parent, new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(p[0], p[1])), segments), material, pos);
}
function leaf(parent, position, scale = 1, material = leafMat, rotation = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(.12, .16, .34, .06);
  shape.quadraticCurveTo(.17, -.02, 0, 0);
  const g = new THREE.ShapeGeometry(shape, 8);
  const m = addMesh(parent, g, material, position);
  m.scale.setScalar(scale);
  m.rotation.set(-Math.PI / 2 + range(-.25, .25), rotation, range(-.25, .25));
  return m;
}
const world = new THREE.Group();
scene.add(world);

/* Rounded, layered plinth */
const plinth = addMesh(world, new THREE.BoxGeometry(10.4, .52, 10.4, 4, 1, 4), mat("#c9c2b1"), [0, -.26, 0]);
plinth.geometry.computeVertexNormals();
box(world, [10.12, .12, 10.12], soil, [0, .055, 0]);
const groundShape = new THREE.Shape();
groundShape.moveTo(-4.95, -4.9); groundShape.lineTo(4.95, -4.9);
groundShape.lineTo(4.95, 4.9); groundShape.lineTo(-4.95, 4.9); groundShape.closePath();
const groundGeo = new THREE.ShapeGeometry(groundShape, 32); groundGeo.rotateX(-Math.PI / 2);
addMesh(world, groundGeo, earth, [0, .12, 0], { castShadow: false });

/* Curving stream, with a raised natural bank */
const waterGroup = new THREE.Group(); world.add(waterGroup);
const stream = new THREE.Shape();
stream.moveTo(-4.95, -2.55);
stream.bezierCurveTo(-3.6, -3.15, -2.95, -1.85, -1.55, -2.15);
stream.bezierCurveTo(-.05, -2.55, .15, -3.65, 1.65, -3.25);
stream.bezierCurveTo(3.0, -2.9, 3.55, -2.0, 4.95, -2.55);
stream.lineTo(4.95, -4.35);
stream.bezierCurveTo(3.4, -4.05, 2.85, -3.65, 1.55, -3.85);
stream.bezierCurveTo(.1, -4.1, -.25, -3.0, -1.7, -3.0);
stream.bezierCurveTo(-3.05, -2.95, -3.7, -4.05, -4.95, -3.65);
stream.closePath();
const waterGeo = new THREE.ShapeGeometry(stream, 48); waterGeo.rotateX(-Math.PI / 2);
const water = addMesh(waterGroup, waterGeo, waterMat, [0, .205, 0], { castShadow: false });
const rippleMat = new THREE.MeshBasicMaterial({ color: "#d8eee5", transparent: true, opacity: .28, side: THREE.DoubleSide });
const ripples = [];
for (let i = 0; i < 8; i++) {
  const r = addMesh(waterGroup, new THREE.RingGeometry(.08, .105, 32), rippleMat, [range(-4, 4), .222, range(-3.8, -2.7)], { castShadow: false });
  r.rotation.x = -Math.PI / 2; r.userData.phase = range(0, Math.PI * 2); ripples.push(r);
}

/* River stones, deliberately clustered along the shoreline */
for (let i = 0; i < 74; i++) {
  const x = range(-4.8, 4.8), z = range(-4.25, -1.85);
  if (rand() > .68) continue;
  const s = range(.075, .24);
  const pebble = addMesh(world, new THREE.IcosahedronGeometry(1, 1), pick([stone, mat("#969184"), mat("#686f68")]),
    [x, .19 + s * .18, z], { scale: [s * range(1, 1.8), s * .58, s * range(.8, 1.3)] });
  pebble.rotation.y = range(0, Math.PI);
}
for (let i = 0; i < 22; i++) {
  const x = range(-4.7, 4.7), z = range(-4.55, -2.1), s = range(.08, .22);
  const patch = addMesh(world, new THREE.SphereGeometry(1, 10, 7), pick([moss, mossLight]), [x, .19, z],
    { scale: [s * 1.6, .035, s] , castShadow: false });
}

/* Bridge: arched deck built from a curved surface and separate handrails */
const bridge = new THREE.Group(); world.add(bridge);
function makeBridgeDeck() {
  const verts = [], uvs = [], indices = [];
  const length = 1.95, width = .78, steps = 24;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps, x = (u - .5) * length;
    const y = .43 + Math.sin(u * Math.PI) * .28;
    for (const side of [-1, 1]) {
      verts.push(x, y, side * width / 2);
      uvs.push(u, side === -1 ? 0 : 1);
    }
    if (i < steps) { const a = i * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices); g.computeVertexNormals();
  addMesh(bridge, g, woodLight, [1.35, 0, -2.75]);
}
makeBridgeDeck();
for (let i = 0; i < 11; i++) {
  const x = -1.0 + i * .19;
  const y = .44 + Math.sin((i / 10) * Math.PI) * .28;
  const plank = box(bridge, [.17, .045, .77], i % 2 ? wood : woodLight, [1.35 + x, y, -2.75]);
  plank.rotation.z = Math.cos((i / 10) * Math.PI) * .05;
}
for (const side of [-1, 1]) {
  const railPoints = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12, x = -1.0 + u * 2;
    railPoints.push([1.35 + x, .62 + Math.sin(u * Math.PI) * .38, -2.75 + side * .43]);
  }
  tube(bridge, railPoints, .045, woodDark, 30, 8);
  for (let i = 0; i < 7; i++) {
    const u = .08 + i * .14, x = -1 + u * 2;
    const y = .48 + Math.sin(u * Math.PI) * .28;
    tube(bridge, [[1.35 + x, y, -2.75 + side * .43], [1.35 + x, y + .28, -2.75 + side * .43]], .025, woodDark, 4, 6);
  }
}

/* House platform */
box(world, [4.85, .22, 3.72], woodDark, [0, .34, .18]);
box(world, [4.72, .12, 3.6], mat("#cdbd9f"), [0, .51, .18]);
const house = new THREE.Group(); world.add(house);

/* Japanese timber frame, plaster infill and exposed beams */
// Open-front architecture: the front facade is intentionally omitted so the room is visible
// when the shoji panels slide apart. A continuous rear wall and two side returns keep the
// building structurally legible without blocking the interior view.
box(house, [4.22, 1.82, .14], plaster, [0, 1.52, 1.43]);
box(house, [.14, 1.82, 2.48], plaster, [-2.04, 1.52, .18]);
box(house, [.14, 1.82, 2.48], plaster, [2.04, 1.52, .18]);
box(house, [4.0, .12, .16], plaster, [0, 2.36, 1.43]);
for (const x of [-2.12, 2.12]) {
  box(house, [.105, 2.18, .13], woodDark, [x, 1.55, -1.12]);
  box(house, [.075, 2.05, .08], woodLight, [x + .045, 1.55, -1.195]);
}
box(house, [4.55, .16, .18], woodDark, [0, 2.57, -1.12]);
box(house, [4.55, .12, .16], wood, [0, .57, -1.12]);
for (const z of [-1.05, 1.48]) for (const x of [-2.1, 2.1]) {
  box(house, [.13, 2.12, .13], woodDark, [x, 1.55, z]);
}
box(house, [4.18, .11, .12], woodDark, [0, 2.38, 1.48]);
for (const x of [-1.95, 1.95]) box(house, [.12, 1.8, .12], woodDark, [x, 1.5, 1.48]);

/* Curved Japanese irimoya-inspired roof: smooth swept roof panels + individually shaped tiles */
const roofGroup = new THREE.Group(); house.add(roofGroup);
function roofSurface(side) {
  const verts = [], indices = [];
  const nx = 48, nz = 18;
  for (let i = 0; i <= nx; i++) {
    const u = i / nx, x = (u - .5) * 5.05;
    const endLift = Math.pow(Math.abs(x) / 2.52, 2) * .2;
    for (let j = 0; j <= nz; j++) {
      const v = j / nz, z = side * (v * 1.72);
      const y = 3.05 - v * .52 + Math.pow(v, 2) * .05 + endLift;
      verts.push(x, y, .18 + z);
      if (i < nx && j < nz) {
        const a = i * (nz + 1) + j;
        if (side > 0) indices.push(a, a + nz + 1, a + 1, a + 1, a + nz + 1, a + nz + 2);
        else indices.push(a, a + 1, a + nz + 1, a + 1, a + nz + 2, a + nz + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(indices); g.computeVertexNormals();
  const roof = addMesh(roofGroup, g, roofMat, [0, 0, 0]);
  roof.material.side = THREE.DoubleSide;
}
roofSurface(-1); roofSurface(1);
box(roofGroup, [5.1, .16, .2], roofEdge, [0, 3.08, .18]);
/* Curved eaves and fascia */
for (const side of [-1, 1]) {
  const eave = [];
  for (let i = 0; i <= 24; i++) {
    const x = -2.55 + i * .2125;
    eave.push([x, 2.54 + Math.pow(Math.abs(x) / 2.55, 2) * .2, .18 + side * 1.72]);
  }
  tube(roofGroup, eave, .075, roofEdge, 36, 9);
}
/* Small overlapping half-round ceramic tiles, instanced to keep draw calls low */
const tileGeo = new THREE.CylinderGeometry(.105, .105, .30, 10, 1, false, 0, Math.PI);
tileGeo.rotateZ(Math.PI / 2);
const tileMat = mat("#65777a", .62);
const tileCount = 2 * 5 * 24;
const tiles = new THREE.InstancedMesh(tileGeo, tileMat, tileCount);
tiles.castShadow = true; tiles.receiveShadow = true;
const dummy = new THREE.Object3D();
let tileIndex = 0;
for (const side of [-1, 1]) for (let row = 0; row < 5; row++) for (let col = 0; col < 24; col++) {
  const x = -2.42 + col * .21;
  const v = .13 + row * .31;
  dummy.position.set(x, 3.055 - v * .52 + v * v * .05 + Math.pow(Math.abs(x) / 2.52, 2) * .2 + .025,
    .18 + side * v);
  dummy.rotation.set(side * .08, 0, 0);
  dummy.scale.set(1, 1, 1);
  dummy.updateMatrix(); tiles.setMatrixAt(tileIndex++, dummy.matrix);
}
roofGroup.add(tiles);
for (const x of [-2.45, 2.45]) {
  const endCap = lathe(roofGroup, [[0,0],[.12,0],[.15,.08],[.12,.18],[.06,.24],[0,.24]], roofEdge, [x, 2.9, .18], 14);
  endCap.rotation.z = Math.PI / 2;
}

/* Veranda and tatami room */
box(house, [4.2, .12, .62], woodLight, [0, .68, -1.47]);
for (let i = 0; i < 6; i++) box(house, [.035, .04, .58], woodDark, [-1.95 + i * .78, .75, -1.47], { castShadow: false });
const tatamiMat = mat("#c8b995", .96, { map: tatamiWeave }), tatamiEdge = mat("#8f8b6b");
for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
  box(house, [1.18, .055, .94], tatamiMat, [-1.23 + i * 1.22, .64, .3 + j * .98]);
  box(house, [1.18, .025, .045], tatamiEdge, [-1.23 + i * 1.22, .68, -.17 + j * .98]);
}
/* Shoji panels: warm translucent paper, fine lattice and timber frame */
const doors = new THREE.Group(); house.add(doors); doors.position.set(0, .65, -1.04);
const doorFrameMat = mat("#805f43"), shojiPaper = mat("#f0eadc", .98, { transparent: true, opacity: .82 });
for (const side of [-1, 1]) {
  const panel = new THREE.Group(); doors.add(panel); panel.position.x = side * .78;
  box(panel, [1.42, 1.7, .055], shojiPaper, [0, .85, 0], { castShadow: false });
  box(panel, [1.35, 1.62, .025], paper, [0,.85,-.032], { castShadow:false });
  for (const x of [-.69, .69]) box(panel, [.075, 1.78, .11], doorFrameMat, [x, .85, -.045]);
  for (const y of [.04, 1.66]) box(panel, [1.44, .075, .11], doorFrameMat, [0, y, -.045]);
  for (const x of [-.52,-.35,-.175,0,.175,.35,.52]) {
    box(panel, [.024, 1.56, .035], woodLight, [x, .85, -.085], { castShadow: false });
  }
  for (let y = .18; y < 1.58; y += .19) {
    box(panel, [1.29, .022, .035], woodLight, [0, y, -.085], { castShadow: false });
  }
  // Recessed lower kick rail and delicate brass finger pull
  box(panel, [1.28,.09,.045], woodDark, [0,.13,-.105]);
  addMesh(panel, new THREE.TorusGeometry(.035,.008,6,12), mat("#a88c61",.35), [.56,.88,-.12], { rotation:[Math.PI/2,0,0], castShadow:false });
  panel.userData.homeX = side * .78;
  panel.userData.openX = side * 1.94;
  panel.userData.targetX = panel.userData.homeX;
  panel.userData.isDoor = true;
}
/* Interior furniture, tea set, tokonoma alcove and lantern warmth */
const cushionMat = mat("#a69b84");
box(house, [.86, .15, .72], cushionMat, [-.62, .78, .56]);
box(house, [.72, .11, .58], woodDark, [.52, .78, .35]);
box(house, [.72, .055, .58], woodLight, [.52, .86, .35]);
lathe(house, [[0,0],[.12,0],[.16,.035],[.14,.12],[.11,.16],[0,.16]], mat("#b77d5d", .42), [.45, .9, .32], 18);
for (let i = 0; i < 2; i++) lathe(house, [[0,0],[.065,0],[.08,.025],[.07,.09],[.05,.105],[0,.105]], mat("#e8ddc9", .35), [.1 + i * .58, .89, .28], 16);
const vase = lathe(house, [[0,0],[.11,0],[.14,.1],[.09,.25],[.05,.31],[.045,.37],[.07,.39],[0,.39]], mat("#82958b", .34), [-1.52, .7, .55], 20);
tube(house, [[-1.52,.99,.55],[-1.6,1.2,.55],[-1.72,1.32,.58]], .012, woodDark, 12, 5);
leaf(house, [-1.69,1.22,.56], .7, blossomMats[1], .4);
box(house, [.42, .08, .08], woodDark, [1.62, 1.05, 1.32]);
box(house, [.08, .52, .08], woodDark, [1.62, .78, 1.32]);
box(house, [.34, .28, .035], mat("#d8c8a9"), [1.62, 1.38, 1.34]);
const roomLight = new THREE.PointLight(0xffc987, 1.15, 4);
roomLight.position.set(0, 1.8, .5); house.add(roomLight);


/* Fine architectural joinery and lived-in interior details */
const trimMat = mat("#c2a17a"), inkMat = mat("#594b3c");
const washiWarm = mat("#f4ead7", .98, { side: THREE.DoubleSide });
/* Rear wall timber bays and low dado rail */
for (let x = -1.82; x <= 1.83; x += .46) {
  box(house, [.035, 1.58, .035], woodLight, [x, 1.54, 1.335]);
}
for (const y of [.82, 2.28]) box(house, [3.9, .045, .045], woodDark, [0, y, 1.33]);
/* Subtle plaster wall inset panels */
for (let i = 0; i < 4; i++) {
  box(house, [.72, .92, .025], washiWarm, [-1.38 + i * .92, 1.62, 1.32], { castShadow: false });
}
/* Floorboards visible through the open front */
for (let i = 0; i < 10; i++) {
  const z = -.55 + i * .19;
  box(house, [3.82, .025, .17], i % 2 ? woodLight : wood, [0, .59, z], { castShadow: false });
}
/* Exposed ceiling beams and rafters under the eaves */
for (let i = 0; i < 9; i++) {
  const x = -1.9 + i * .475;
  box(house, [.055, .12, 2.28], woodDark, [x, 2.47, .12]);
  box(house, [.075, .08, .16], trimMat, [x, 2.48, -1.0]);
}
/* Tokonoma alcove: raised timber border, hanging scroll and ikebana */
box(house, [.92, 1.24, .09], woodDark, [1.48, 1.62, 1.23]);
box(house, [.76, 1.08, .025], mat("#e7ddc8"), [1.48, 1.63, 1.17]);
box(house, [.82, .06, .16], woodLight, [1.48, 1.02, 1.16]);
box(house, [.025, .83, .025], inkMat, [1.48, 1.66, 1.13]);
box(house, [.34, .48, .018], mat("#d6c8aa"), [1.48, 1.68, 1.105]);
tube(house, [[1.47,1.44,1.08],[1.4,1.72,1.06],[1.29,1.94,1.05]], .012, woodDark, 12, 5);
tube(house, [[1.47,1.44,1.08],[1.58,1.79,1.05],[1.69,1.94,1.04]], .012, woodDark, 12, 5);
leaf(house, [1.33,1.79,1.045], .65, leafMat, .4);
leaf(house, [1.62,1.83,1.04], .62, blossomMats[1], -.5);
/* Low tea table, woven zabuton cushions and a tray */
box(house, [1.05, .075, .68], woodDark, [-.48, .91, .23]);
box(house, [1.0, .045, .64], woodLight, [-.48, .97, .23]);
for (const x of [-.88, -.08]) for (const z of [-.02, .48]) {
  box(house, [.12,.27,.12], woodDark, [x,.76,z]);
}
for (const x of [-1.28, .38]) {
  const cushion = addMesh(house, new THREE.CylinderGeometry(.28,.3,.09,24,1), mat("#a7a08b"), [x,.72,.28]);
  cushion.scale.z = .82;
}
const tray = box(house, [.46,.035,.31], mat("#5b5549"), [-.48,1.015,.22]);
for (const x of [-.62,-.34]) {
  lathe(house, [[0,0],[.055,0],[.07,.025],[.06,.09],[.04,.12],[.035,.14],[0,.14]], mat("#eee5d6",.3), [x,1.03,.2], 18);
}
/* Tea pot with spout, lid and handle */
lathe(house, [[0,0],[.12,0],[.16,.07],[.14,.19],[.08,.24],[0,.24]], mat("#9a7860",.34), [-.49,1.03,.29], 20);
addMesh(house, new THREE.TorusGeometry(.07,.012,8,18,Math.PI), mat("#9a7860"), [-.49,1.21,.29], { rotation:[Math.PI/2,0,0], castShadow:false });
tube(house, [[-.63,1.12,.29],[-.73,1.18,.29],[-.76,1.23,.29]], .025, mat("#9a7860"), 10, 7);
/* A small floor lamp with a warm washi shade */
box(house, [.25,.045,.25], woodDark, [-1.65,.66,.92]);
box(house, [.045,.58,.045], woodDark, [-1.65,.96,.92]);
const lampShade = addMesh(house, new THREE.CylinderGeometry(.14,.2,.34,12,1,true), washiWarm, [-1.65,1.43,.92]);
const lampGlow = new THREE.PointLight(0xffd49c,.7,2.4); lampGlow.position.set(-1.65,1.42,.92); house.add(lampGlow);
/* Ceiling pendant */
tube(house, [[-.35,2.42,.15],[-.35,2.13,.15]], .012, woodDark, 6, 5);
const pendant = addMesh(house, new THREE.CylinderGeometry(.12,.18,.25,10,1,true), washiWarm, [-.35,2.0,.15]);
const pendantLight = new THREE.PointLight(0xffd7a8,.48,2.2); pendantLight.position.set(-.35,1.95,.15); house.add(pendantLight);
/* Sliding doors gain a visible recessed wood threshold and finger-pull details */
box(house, [4.05,.055,.19], woodDark, [0,.63,-1.04]);
for (const x of [-.78,.78]) {
  box(house, [.055,.24,.035], trimMat, [x,1.38,-1.105]);
}

/* Stone path: irregular flagstones with beveled edges */
for (let i = 0; i < 8; i++) {
  const x = -1.9 + i * .42 + range(-.08, .08);
  const z = -2.15 - i * .19 + range(-.06, .06);
  const s = range(.25, .37);
  const p = addMesh(world, new THREE.CylinderGeometry(s * .92, s, .105, 9, 1), pick([stone, mat("#8b897c"), mat("#6f766d")]),
    [x, .22, z], { scale: [1, 1, range(.72, 1.05)] });
  p.rotation.y = range(0, Math.PI);
}
for (let i = 0; i < 2; i++) {
  const sandal = addMesh(world, new THREE.BoxGeometry(.25, .075, .4, 2, 1, 3), woodDark, [.46 + i * .27, .24, -1.83]);
  sandal.rotation.y = -.22;
}

/* Cherry blossom petals as a reusable mesh, instanced across natural branch tips */
function makePetalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.bezierCurveTo(-.08, .09, -.12, .23, 0, .31);
  s.bezierCurveTo(.12, .23, .08, .09, 0, 0);
  return new THREE.ShapeGeometry(s, 8);
}
const petalGeo = makePetalGeometry();
function blossomCluster(parent, center, scale = 1, count = 22) {
  const group = new THREE.Group(); parent.add(group); group.position.set(...center);
  const inst = new THREE.InstancedMesh(petalGeo, blossomMats[0], count * 5);
  inst.castShadow = false; inst.receiveShadow = false;
  const temp = new THREE.Object3D();
  let n = 0;
  for (let f = 0; f < count; f++) {
    const c = new THREE.Vector3(range(-.18,.18), range(-.14,.14), range(-.18,.18));
    const rot = range(0, Math.PI * 2);
    for (let k = 0; k < 5; k++) {
      const a = rot + k * Math.PI * 2 / 5;
      temp.position.set(c.x + Math.cos(a) * .075 * scale, c.y, c.z + Math.sin(a) * .075 * scale);
      temp.rotation.set(range(-.35,.35), a, range(-.35,.35));
      temp.scale.setScalar(scale * range(.65,.95));
      temp.updateMatrix(); inst.setMatrixAt(n, temp.matrix);
      inst.setColorAt(n, new THREE.Color(pick(blossomColors)));
      n++;
    }
  }
  inst.count = n; group.add(inst);
  const centerGeo = new THREE.SphereGeometry(.026 * scale, 7, 5);
  const centerMat = mat("#d9a65e", .68);
  const centers = new THREE.InstancedMesh(centerGeo, centerMat, count);
  for (let f=0; f<count; f++) {
    const c = new THREE.Vector3(range(-.18,.18), range(-.14,.14), range(-.18,.18));
    temp.position.set(c.x,c.y,c.z);
    temp.rotation.set(0,0,0); temp.scale.setScalar(1);
    temp.updateMatrix(); centers.setMatrixAt(f,temp.matrix);
  }
  group.add(centers);
  return group;
}
function makeBranch(parent, start, end, radius) {
  const mid = new THREE.Vector3(...start).lerp(new THREE.Vector3(...end), .55);
  mid.y += range(.12, .3);
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...start), mid, new THREE.Vector3(...end));
  addMesh(parent, new THREE.TubeGeometry(curve, 16, radius, 7, false), woodDark);
  return end;
}
function makeTree(x, z, scale, style = 0) {
  const g = new THREE.Group(); world.add(g); g.position.set(x, .18, z); g.scale.setScalar(scale);
  const trunkPoints = [[0,0,0],[-.08,.55,.03],[.06,1.15,0],[.0,1.75,.02],[-.15,2.35,.05]];
  taperedTube(g, trunkPoints, .16, .045, woodDark, 32, 10);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 + style * .7;
    const len = range(1.05, 1.55);
    const end = [Math.cos(a) * len, range(1.8, 2.75), Math.sin(a) * len];
    const start = [0, range(1.05, 1.65), 0];
    const tip = makeBranch(g, start, end, range(.035, .06));
    for (let j = 0; j < 3; j++) {
      const t = .48 + j * .22;
      const branchEnd = [tip[0] * t + range(-.28,.28), tip[1] * t + range(.18,.5), tip[2] * t + range(-.28,.28)];
      makeBranch(g, [tip[0] * (t - .18), tip[1] * (t - .18), tip[2] * (t - .18)], branchEnd, .022);
      blossomCluster(g, branchEnd, range(.7, 1.0), 8);
    }
    blossomCluster(g, tip, range(.85, 1.15), 11);
  }
  /* A few delicate leaf tips keep the silhouette airy */
  for (let i = 0; i < 10; i++) {
    const a = range(0, Math.PI * 2), r = range(.45, 1.25);
    leaf(g, [Math.cos(a) * r, range(1.6, 2.8), Math.sin(a) * r], range(.45,.8), pick([leafMat, darkLeafMat]), a);
  }
  return g;
}
makeTree(-3.62, -.1, 1.12, 0);
makeTree(3.58, .3, 1.03, 1);
makeTree(-3.55, 3.15, .82, 2);
makeTree(3.55, 3.25, .86, 3);

/* Ferns, grass tufts and low shrubs in small planted drifts */
for (let i = 0; i < 38; i++) {
  const x = range(-4.65, 4.65), z = range(-1.8, 4.65);
  if (Math.abs(x) < 2.42 && z < 1.9) continue;
  const tuft = new THREE.Group(); world.add(tuft); tuft.position.set(x, .2, z);
  for (let j = 0; j < 5; j++) {
    const a = j * Math.PI * 2 / 5;
    const end = [Math.cos(a) * range(.18,.34), range(.2,.42), Math.sin(a) * range(.18,.34)];
    tube(tuft, [[0,0,0],[end[0]*.5,end[1]*.7,end[2]*.5],end], .012, pick([moss, leafMat]), 7, 5);
    leaf(tuft, [end[0], end[1], end[2]], .55, pick([leafMat, darkLeafMat]), a);
  }
}
for (let i = 0; i < 16; i++) {
  const x = range(-4.6, 4.6), z = range(-1.4, 4.6);
  if (Math.abs(x) < 2.45 && z < 1.6) continue;
  const s = range(.15, .3);
  const shrub = addMesh(world, new THREE.SphereGeometry(1, 12, 9), pick([moss, mossLight, leafMat]),
    [x, .24, z], { scale: [s * 1.25, s * .8, s] });
}

/* Stone lanterns: stacked base, pedestal, windowed housing and curved cap */
function makeLantern(x, z, scale = 1) {
  const g = new THREE.Group(); world.add(g); g.position.set(x, .18, z); g.scale.setScalar(scale);
  const granite = mat("#858477");
  const foot = new THREE.CylinderGeometry(.25,.31,.14,8);
  addMesh(g, foot, granite, [0,.07,0]);
  lathe(g, [[0,0],[.19,0],[.22,.08],[.16,.16],[.1,.22],[.08,.72],[.13,.78],[0,.78]], granite, [0,.14,0], 8);
  box(g, [.42,.3,.42], granite, [0,.96,0]);
  box(g, [.29,.21,.29], mat("#343b37"), [0,.96,0], { castShadow: false });
  const glow = new THREE.PointLight(0xffc982, .75, 2.4); glow.position.set(0, .98, 0); g.add(glow);
  const cap = new THREE.ConeGeometry(.39,.25,8);
  addMesh(g, cap, granite, [0,1.23,0]);
  const finial = new THREE.SphereGeometry(.07,10,8);
  addMesh(g, finial, granite, [0,1.39,0]);
  g.userData.glow = glow;
  return g;
}
const lanterns = [makeLantern(-2.55,-1.25,.82), makeLantern(2.65,1.65,.9)];

/* Koi: tapered custom body, fins and forked tail; animation sways tail */
function fishBodyGeometry() {
  const rings = 14, around = 16, verts = [], indices = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings, x = (t - .5) * .78;
    const fullness = Math.pow(Math.sin(Math.PI * t), .72);
    const ry = .105 * fullness + .008, rz = .12 * fullness + .006;
    for (let j = 0; j <= around; j++) {
      const a = j / around * Math.PI * 2;
      verts.push(x, Math.cos(a) * ry, Math.sin(a) * rz);
      if (i < rings && j < around) {
        const k = i * (around + 1) + j;
        indices.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(verts,3));
  g.setIndex(indices); g.computeVertexNormals(); return g;
}
const fish = [];
const koiColors = [mat("#f1e9d8",.4), mat("#e7a36e",.42), mat("#eee1c9",.42)];
for (let i = 0; i < 3; i++) {
  const f = new THREE.Group(); world.add(f);
  addMesh(f, fishBodyGeometry(), koiColors[i], [0,0,0]);
  const tail = new THREE.Group(); f.add(tail); tail.position.x = -.39; tail.userData.tail = true;
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0,0); tailShape.quadraticCurveTo(-.12,.12,-.29,.19);
  tailShape.quadraticCurveTo(-.24,0,-.29,-.19); tailShape.quadraticCurveTo(-.1,-.12,0,0);
  const tailMesh = addMesh(tail, new THREE.ShapeGeometry(tailShape,12), koiColors[i], [0,0,0]);
  tailMesh.rotation.y = Math.PI / 2;
  const finShape = new THREE.Shape();
  finShape.moveTo(0,0); finShape.quadraticCurveTo(.12,.16,.27,.11);
  finShape.quadraticCurveTo(.17,.02,0,0);
  for (const side of [-1,1]) {
    const fin = addMesh(f, new THREE.ShapeGeometry(finShape,10), koiColors[i], [-.02,-.035,side*.08]);
    fin.rotation.x = side * .6;
  }
  const eyeMat = mat("#272b27",.28);
  for (const side of [-1,1]) addMesh(f, new THREE.SphereGeometry(.018,8,6), eyeMat, [.28,.025,side*.09], { castShadow: false });
  f.position.set(-2.7 + i * 1.55, .29, -3.15 + i * .1);
  f.userData.phase = i * 2.2; f.userData.tail = tail; fish.push(f);
}

/* Falling petals: single instanced draw call, deterministic starting positions */
const petalCount = 58;
const petalMaterial = new THREE.MeshStandardMaterial({ color: "#efc0cd", side: THREE.DoubleSide, roughness: .78 });
const petalInstances = new THREE.InstancedMesh(petalGeo, petalMaterial, petalCount);
petalInstances.frustumCulled = false; petalInstances.castShadow = false;
world.add(petalInstances);
const petalData = [];
for (let i = 0; i < petalCount; i++) {
  petalData.push({ x: range(-4.6,4.6), y: range(.8,5.2), z: range(-4.6,4.6),
    speed: range(.22,.48), phase: range(0,Math.PI*2), spin: range(-.02,.02), scale: range(.5,.9) });
}

/* Subtle ground detail and distant paper backdrop */
const backdropMat = mat("#e5e5dc", 1, { side: THREE.DoubleSide });
addMesh(scene, new THREE.PlaneGeometry(24, 13), backdropMat, [0, 4.5, -7.5], { rotation: [0,0,0], castShadow: false });
const ambientFill = new THREE.DirectionalLight(0xfff4e7, .55);
ambientFill.position.set(7, 5, -4); scene.add(ambientFill);

/* Interaction: orbit, zoom, shoji hit test and UI controls */
let dragging = false, moved = false, lastX = 0, lastY = 0;
let rotY = .55, rotX = -.18, zoom = 1, doorOpen = false;
const target = new THREE.Vector3(0, 1.22, 0);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.style.touchAction = "none";
renderer.domElement.addEventListener("pointerdown", e => {
  dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", e => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
  rotY += dx * .006;
  rotX = THREE.MathUtils.clamp(rotX + dy * .004, -.62, .18);
  lastX = e.clientX; lastY = e.clientY;
});
renderer.domElement.addEventListener("pointerup", () => { dragging = false; });
renderer.domElement.addEventListener("pointercancel", () => { dragging = false; });
renderer.domElement.addEventListener("wheel", e => {
  e.preventDefault();
  zoom = THREE.MathUtils.clamp(zoom + e.deltaY * .00065, .76, 1.42);
}, { passive: false });

function setDoor(open) {
  doorOpen = open;
  doors.children.forEach(p => p.userData.targetX = open ? p.userData.openX : p.userData.homeX);
}
doors.children.forEach(p => p.userData.targetX = p.userData.homeX);
renderer.domElement.addEventListener("click", e => {
  if (moved) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObjects(doors.children, true).length) setDoor(!doorOpen);
});
document.querySelector("#doorBtn")?.addEventListener("click", () => setDoor(!doorOpen));
document.querySelector("#calmBtn")?.addEventListener("click", () => document.body.classList.toggle("calm"));

/* Time-of-day palettes */
const times = {
  morning: { bg:"#e7e9df", fog:"#e7e9df", sun:"#ffe7c9", intensity:2.8, hemi:1.8, water:"#79b8b0", lamp:.75 },
  sunset: { bg:"#dfc5b2", fog:"#dfc5b2", sun:"#f0a77d", intensity:2.25, hemi:1.2, water:"#789f9c", lamp:1.0 },
  night: { bg:"#263440", fog:"#303d49", sun:"#9eb5d0", intensity:.62, hemi:.55, water:"#456d78", lamp:2.0 }
};
let currentTime = "morning";
function setTime(name) {
  const t = times[name]; if (!t) return;
  currentTime = name;
  scene.background.set(t.bg); scene.fog.color.set(t.fog);
  sun.color.set(t.sun); sun.intensity = t.intensity; hemi.intensity = t.hemi;
  waterMat.color.set(t.water);
  roomLight.intensity = name === "night" ? 2.0 : name === "sunset" ? 1.3 : .85;
  lanterns.forEach(l => l.userData.glow.intensity = t.lamp);
  document.querySelectorAll(".time-btn").forEach(b => b.classList.toggle("active", b.dataset.time === name));
}
document.querySelectorAll(".time-btn").forEach(b => b.addEventListener("click", () => setTime(b.dataset.time)));

/* Responsive renderer */
function resize() {
  const w = Math.max(1, mount.clientWidth), h = Math.max(1, mount.clientHeight);
  camera.aspect = w / h;
  camera.position.z = w < 600 ? -14.2 : -12.2;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
if ("ResizeObserver" in window) new ResizeObserver(resize).observe(mount);
else window.addEventListener("resize", resize);
resize();

/* Animation */
const clock = new THREE.Clock();
const temp = new THREE.Object3D();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  world.rotation.y = rotY;
  world.rotation.x = rotX;
  world.scale.setScalar(zoom);
  doors.children.forEach(p => {
    p.position.x = THREE.MathUtils.damp(p.position.x, p.userData.targetX, 5, 1/60);
  });
  petalData.forEach((p, i) => {
    p.y -= p.speed / 60;
    p.x += Math.sin(t * .7 + p.phase) * .0018;
    if (p.y < .2) { p.y = 4.8 + (i % 7) * .18; p.x = range(-4.6,4.6); p.z = range(-4.6,4.6); }
    temp.position.set(p.x, p.y, p.z);
    temp.rotation.set(Math.sin(t + p.phase) * .5, p.phase, t * p.spin);
    temp.scale.setScalar(p.scale);
    temp.updateMatrix(); petalInstances.setMatrixAt(i, temp.matrix);
  });
  petalInstances.instanceMatrix.needsUpdate = true;
  fish.forEach((f, i) => {
    f.position.x = -2.8 + ((t * .24 + i * 2.15) % 5.3);
    f.position.z = -3.12 + Math.sin(t * .62 + i) * .17;
    f.position.y = .29 + Math.sin(t * 1.5 + i) * .018;
    f.rotation.y = Math.PI + Math.sin(t * .45 + i) * .12;
    f.userData.tail.rotation.y = Math.sin(t * 5 + i) * .38;
  });
  ripples.forEach((r, i) => {
    const s = .65 + ((t * .24 + i * .19) % 1.2);
    r.scale.setScalar(s); r.material.opacity = .22 * (1 - (s - .65) / 1.2);
    r.position.x = Math.sin(t * .3 + r.userData.phase) * .14;
  });
  renderer.render(scene, camera);
}
animate();
setTimeout(() => loading?.classList.add("hidden"), 650);
