import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const loading=document.querySelector("#loading"), menu=document.querySelector("#menu"), hud=document.querySelector("#hud");
const blueEl=document.querySelector("#blueScore"),redEl=document.querySelector("#redScore"),timerEl=document.querySelector("#timer");
const healthEl=document.querySelector("#health"),healthBar=document.querySelector("#healthBar"),messageEl=document.querySelector("#message");
const isTouch=("ontouchstart" in window)||navigator.maxTouchPoints>0;

const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b19);scene.fog=new THREE.Fog(0x050b19,24,75);
const camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.1,120);
camera.position.set(0,1.7,13);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9bdcff,0x10152c,2));
const key=new THREE.DirectionalLight(0x9ddfff,2.2);key.position.set(-8,15,8);key.castShadow=true;scene.add(key);
const blueLight=new THREE.PointLight(0x087dff,30,22);blueLight.position.set(-12,4,0);scene.add(blueLight);
const redLight=new THREE.PointLight(0xff174f,25,22);redLight.position.set(12,4,-3);scene.add(redLight);

const mat=(c,em=0)=>new THREE.MeshStandardMaterial({color:c,roughness:.65,metalness:.35,emissive:c,emissiveIntensity:em});
const floorMat=mat(0x101d35), wallMat=mat(0x172b49), cyan=mat(0x13cfff,.65), blue=mat(0x087bff,.45), red=mat(0xff2857,.4), white=mat(0xdaf6ff,.2);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(44,44),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=0;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(44,44,0x16789b,0x18304c);grid.position.y=.015;scene.add(grid);

function box(x,y,z,sx,sy,sz,material,glow=false){
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
 if(glow){const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0x25dfff}));e.position.copy(m.position);scene.add(e)}
 return m;
}
for(let i=-1;i<=1;i+=2){box(i*22,3,0,1,6,44,wallMat);box(0,3,i*22,44,6,1,wallMat)}
// Futuristic cover blocks
box(-5,1.2,-5,3,2.4,2,wallMat,true);box(5,1.2,-4,2.5,2.4,3,wallMat,true);
box(-7,1.4,5,2,2.8,3,wallMat,true);box(7,1.4,6,3,2.8,2,wallMat,true);
box(0,.7,-9,5,1.4,1.5,wallMat,true);box(0,.7,9,5,1.4,1.5,wallMat,true);
for(let x=-18;x<=18;x+=6){for(let z=-18;z<=18;z+=6){if(Math.abs(x)<9&&Math.abs(z)<9)continue;const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.25,8),cyan);p.position.set(x,.15,z);scene.add(p)}}

const player={pos:new THREE.Vector3(0,1.7,14),yaw:Math.PI,pitch:0,health:100,blue:0,red:0};
camera.position.copy(player.pos);
const bots=[];
function makeBot(team,x,z){
 const g=new THREE.Group();g.position.set(x,0,z);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.65,4,8),team==="blue"?blue:red);body.position.y=.83;body.castShadow=true;g.add(body);
 const visor=new THREE.Mesh(new THREE.BoxGeometry(.42,.13,.08),white);visor.position.set(0,1.35,-.34);g.add(visor);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.035,6,20),team==="blue"?cyan:red);ring.rotation.x=Math.PI/2;ring.position.y=.12;g.add(ring);
 scene.add(g);bots.push({g,team,hp:100,phase:Math.random()*6,tagCooldown:0});
}
for(let i=0;i<3;i++)makeBot("red",-9+i*9,-12+Math.random()*3);
for(let i=0;i<2;i++)makeBot("blue",-10+i*20,4+Math.random()*3);

const raycaster=new THREE.Raycaster();let running=false,ended=false,remaining=120,last=performance.now(),fireCooldown=0;
const keys={};addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
let joy={x:0,y:0},lookPointer=null,lastX=0,lastY=0;
const stickZone=document.querySelector("#stickZone"),stick=document.querySelector("#stick");
function setStick(e){const r=stickZone.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy),max=43;if(len>max){dx=dx/len*max;dy=dy/len*max}joy.x=dx/max;joy.y=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`}
stickZone.addEventListener("pointerdown",e=>{e.preventDefault();stickZone.setPointerCapture(e.pointerId);setStick(e)});
stickZone.addEventListener("pointermove",e=>{if(e.buttons)setStick(e)});
function resetStick(){joy.x=joy.y=0;stick.style.transform="translate(0,0)"}
stickZone.addEventListener("pointerup",resetStick);stickZone.addEventListener("pointercancel",resetStick);
renderer.domElement.addEventListener("pointerdown",e=>{if(!running)return;if(e.pointerType==="mouse"){lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)}});
renderer.domElement.addEventListener("pointermove",e=>{if(!running)return;if(e.pointerType==="mouse"&&lookPointer===e.pointerId){player.yaw-=(e.clientX-lastX)*.004;player.pitch=Math.max(-1.25,Math.min(1.25,player.pitch-(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY}});
renderer.domElement.addEventListener("pointerup",()=>lookPointer=null);
let touchLook=null;
renderer.domElement.addEventListener("touchstart",e=>{if(!running)return;for(const t of e.changedTouches){if(t.clientX>innerWidth*.32){touchLook=t.identifier;lastX=t.clientX;lastY=t.clientY;break}}},{passive:true});
renderer.domElement.addEventListener("touchmove",e=>{if(!running||touchLook===null)return;for(const t of e.changedTouches){if(t.identifier===touchLook){player.yaw-=(t.clientX-lastX)*.006;player.pitch=Math.max(-1.2,Math.min(1.2,player.pitch-(t.clientY-lastY)*.006));lastX=t.clientX;lastY=t.clientY}}},{passive:true});
renderer.domElement.addEventListener("touchend",e=>{for(const t of e.changedTouches)if(t.identifier===touchLook)touchLook=null},{passive:true});

function showMessage(t){messageEl.textContent=t;setTimeout(()=>{if(messageEl.textContent===t)messageEl.textContent=""},1100)}
function tag(){
 if(!running||fireCooldown>0)return;fireCooldown=.28;
 const dir=new THREE.Vector3(0,0,-1).applyEuler(camera.rotation).normalize();
 raycaster.set(camera.position,dir);raycaster.far=24;
 const targets=[];for(const b of bots)if(b.team==="red"&&b.hp>0){const meshes=b.g.children.filter(c=>c.isMesh);targets.push(...meshes.map(m=>({mesh:m,bot:b})))}
 const hits=raycaster.intersectObjects(targets.map(t=>t.mesh),false);
 if(hits.length){const target=targets.find(t=>t.mesh===hits[0].object);if(target){target.bot.hp=0;scene.remove(target.bot.g);player.blue+=10;blueEl.textContent=player.blue;showMessage("ENERGY TAG +10")}}
 // visual energy pulse
 const beam=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),cyan);beam.position.copy(camera.position).add(dir.multiplyScalar(1.1));scene.add(beam);setTimeout(()=>scene.remove(beam),100);
}
document.querySelector("#tagBtn").addEventListener("pointerdown",e=>{e.preventDefault();tag()});
addEventListener("keydown",e=>{if(e.code==="Space")tag()});

function endRound(){running=false;ended=true;menu.style.display="grid";document.querySelector(".eyebrow").textContent="ROUND COMPLETE";document.querySelector("h1").innerHTML=player.blue>=player.red?"BLUE TEAM WINS":"RED TEAM WINS";document.querySelector(".sub").textContent=`FINAL SCORE  BLUE ${player.blue}  —  RED ${player.red}`;document.querySelector("#startBtn").textContent="PLAY AGAIN →"}
function start(){player.pos.set(0,1.7,14);player.yaw=Math.PI;player.pitch=0;player.health=100;player.blue=0;player.red=0;remaining=120;for(const b of [...bots])scene.remove(b.g);bots.length=0;for(let i=0;i<3;i++)makeBot("red",-9+i*9,-12+Math.random()*3);for(let i=0;i<2;i++)makeBot("blue",-10+i*20,4+Math.random()*3);blueEl.textContent="0";redEl.textContent="0";healthEl.textContent="100";healthBar.style.width="100%";menu.style.display="none";hud.style.display="block";running=true;ended=false;showMessage("MATCH START")}
document.querySelector("#startBtn").addEventListener("click",start);

function update(dt){
 if(!running)return;
 remaining-=dt;if(remaining<=0){remaining=0;endRound();return}
 timerEl.textContent=`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(Math.floor(remaining%60)).padStart(2,"0")}`;
 fireCooldown=Math.max(0,fireCooldown-dt);
 const forward=(keys.w||keys.arrowup?-1:0)+(keys.s||keys.arrowdown?1:0)-joy.y;
 const side=(keys.d||keys.arrowright?1:0)+(keys.a||keys.arrowleft?-1:0)+joy.x;
 const move=new THREE.Vector3(side,0,forward);if(move.length()>1)move.normalize();
 const angle=player.yaw;const dx=move.x*Math.cos(angle)-move.z*Math.sin(angle),dz=move.x*Math.sin(angle)+move.z*Math.cos(angle);
 player.pos.x=Math.max(-20,Math.min(20,player.pos.x+dx*dt*7));player.pos.z=Math.max(-20,Math.min(20,player.pos.z+dz*dt*7));
 // Keep player out of central cover blocks
 const obstacles=[[-5,-5,2.1],[5,-4,2.2],[-7,5,2.1],[7,6,2.1],[0,-9,2.2],[0,9,2.2]];
 for(const [x,z,r] of obstacles){const d=Math.hypot(player.pos.x-x,player.pos.z-z);if(d<r){const a=Math.atan2(player.pos.z-z,player.pos.x-x);player.pos.x=x+Math.cos(a)*r;player.pos.z=z+Math.sin(a)*r}}
 camera.position.copy(player.pos);camera.rotation.order="YXZ";camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
 for(const b of bots){
  if(b.hp<=0)continue;b.phase+=dt;
  if(b.team==="red"){
   const dx=player.pos.x-b.g.position.x,dz=player.pos.z-b.g.position.z,d=Math.hypot(dx,dz);
   if(d>3){b.g.position.x+=dx/d*dt*1.25;b.g.position.z+=dz/d*dt*1.25}
   b.g.rotation.y=Math.atan2(dx,dz);
   b.tagCooldown-=dt;if(d<7&&b.tagCooldown<=0){b.tagCooldown=2.5;player.health=Math.max(0,player.health-5);healthEl.textContent=player.health;healthBar.style.width=player.health+"%";if(player.health<=0){showMessage("SHIELD RECHARGING");player.health=100;healthEl.textContent=100;healthBar.style.width="100%";player.pos.set(0,1.7,14);player.red+=5;redEl.textContent=player.red}}
  }else{
   b.g.position.x+=Math.sin(b.phase)*dt*.5;b.g.position.z+=Math.cos(b.phase*.7)*dt*.4;
  }
 }
}
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera)}
requestAnimationFrame(animate);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
loading.style.display="none";
