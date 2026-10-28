import * as THREE from './assets/three.module.js';

const host = document.querySelector('#scene');
const overlay = document.querySelector('.screen-ui');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
try {
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36,1,.1,100);
  camera.position.set(0, 1.25, 11.5);
  camera.lookAt(0,.2,0);
  scene.add(new THREE.HemisphereLight(0xfff9eb,0x586554,1.2));
  const light = new THREE.DirectionalLight(0xfff4e4,4.5);
  light.position.set(-5,8,6);light.castShadow=true;
  light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-7;light.shadow.camera.right=7;light.shadow.camera.top=7;light.shadow.camera.bottom=-7;light.shadow.normalBias=.025;light.shadow.radius=9;scene.add(light);
  const rim = new THREE.DirectionalLight(0xffb66c,2.4);rim.position.set(5,3,-2);scene.add(rim);
  const tv = new THREE.Group();scene.add(tv);
  const ivory = new THREE.MeshStandardMaterial({color:0xe9e8dc,roughness:.35,metalness:.08});
  const orange = new THREE.MeshPhysicalMaterial({color:0xe35c18,roughness:.24,metalness:.12,clearcoat:1,clearcoatRoughness:.2});
  const dark = new THREE.MeshStandardMaterial({color:0x33372f,roughness:.55});
  const silver = new THREE.MeshStandardMaterial({color:0xb7bcb0,metalness:.6,roughness:.4});
  function rounded(w,h,r){const s=new THREE.Shape();const x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function box(w,h,d,r,mat,x=0,y=0,z=0){const b=Math.min(.06,w*.2,h*.2,d*.2);const g=new THREE.ExtrudeGeometry(rounded(w-b*2,h-b*2,Math.min(r,(h-b*2)/2,(w-b*2)/2)),{depth:d-b*2,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:b,bevelThickness:b,curveSegments:18});g.translate(0,0,-(d-b*2)/2);const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;tv.add(m);return m;}
  // A translucent orange rear shell, a softly rounded ivory front and a dark CRT surround.
  box(5.14,4.3,2.6,.45,orange,0,.08,-.9);
  for(let row=0;row<12;row++)box(.035,.045,1.6,.01,dark,2.573,.15+row*.12,-.85);
  box(5.02,4.22,.65,.42,ivory,0,.08,.33);
  box(4.38,3.3,.14,.24,silver,0,.35,.698);
  box(4.21,3.15,.16,.23,dark,0,.35,.79);
  const photo = new THREE.TextureLoader().load('./assets/estudio.png', () => {photo.colorSpace=THREE.SRGBColorSpace;});
  // Crop centrally to fill the curved, nearly square CRT display.
  photo.repeat.set(.77,1);photo.offset.set(.115,0);
  function screenGeometry(){const g=new THREE.ShapeGeometry(rounded(3.95,2.86,.17),30);const p=g.attributes.position,u=g.attributes.uv;for(let i=0;i<p.count;i++)u.setXY(i,p.getX(i)/3.95+.5,p.getY(i)/2.86+.5);return g;}
  const screen = new THREE.Mesh(screenGeometry(),new THREE.MeshBasicMaterial({map:photo,color:0xe4e1d5}));
  screen.position.set(0,.35,.89);tv.add(screen);
  const shade = new THREE.Mesh(new THREE.ShapeGeometry(rounded(3.95,2.86,.17)),new THREE.MeshBasicMaterial({color:0x09130b,transparent:true,opacity:.27}));shade.position.set(0,.35,.895);tv.add(shade);
  // Fine horizontal phosphor lines remain subtle enough to preserve the photograph.
  const lines = document.createElement('canvas');lines.width=4;lines.height=128;
  const lc=lines.getContext('2d');for(let y=0;y<128;y+=3){lc.fillStyle='rgba(0,0,0,.12)';lc.fillRect(0,y,4,1);}
  const lineTexture=new THREE.CanvasTexture(lines);lineTexture.wrapS=lineTexture.wrapT=THREE.RepeatWrapping;lineTexture.repeat.set(1,5);
  const scan=new THREE.Mesh(screenGeometry(),new THREE.MeshBasicMaterial({map:lineTexture,transparent:true,depthWrite:false}));scan.position.set(0,.35,.9);tv.add(scan);
  // Lower speaker grilles and tactile power button.
  for(const x of [-1.82,1.82]){
    box(.79,.5,.12,.21,orange,x,-1.58,.72);
    for(let row=0;row<7;row++)for(let col=0;col<12;col++){
      const hole=new THREE.Mesh(new THREE.CircleGeometry(.012,5),dark);hole.position.set(x-.26+col*.047,-1.72+row*.046,.792);tv.add(hole);
    }
  }
  box(1.8,.27,.035,.06,silver,0,-1.53,.68);
  box(.3,.047,.045,.018,orange,0,-1.55,.72);
  const power=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.055,28),ivory);power.rotation.x=Math.PI/2;power.position.set(1.08,-1.6,.75);tv.add(power);
  const led=new THREE.Mesh(new THREE.CircleGeometry(.025,16),new THREE.MeshBasicMaterial({color:0xa1e079}));led.position.set(1.08,-1.6,.783);tv.add(led);
  const brandCanvas=document.createElement('canvas');brandCanvas.width=512;brandCanvas.height=96;const bc=brandCanvas.getContext('2d');bc.fillStyle='#55594c';bc.font='48px Georgia';bc.textAlign='center';bc.fillText('frecuencia',256,65);
  const brand=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.197),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(brandCanvas),transparent:true}));brand.position.set(0,-1.215,.73);tv.add(brand);
  box(3.7,.23,1.15,.09,orange,0,-2.18,-.03);
  box(3.35,.12,.9,.05,silver,0,-2.02,-.05);
  // Moulded front ribs catch the light around the upper screen bezel.
  for(let i=0;i<90;i++){
    const rib=new THREE.Mesh(new THREE.BoxGeometry(.008,.17,.008),silver);rib.position.set(-2.2+i*.0495,2.04,.67);tv.add(rib);
  }
  // A photographic room behind the live 3D television, with a contact shadow on its desk.
  const shadowFloor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({opacity:.28}));
  shadowFloor.rotation.x=-Math.PI/2;shadowFloor.position.y=-2.32;shadowFloor.receiveShadow=true;scene.add(shadowFloor);
  const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;
  const ec=envCanvas.getContext('2d');const grad=ec.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#b7c7c3');grad.addColorStop(.4,'#c7ba9e');grad.addColorStop(1,'#504633');ec.fillStyle=grad;ec.fillRect(0,0,1024,512);ec.fillStyle='#fff8e7';ec.fillRect(60,90,170,220);ec.fillStyle='#e5dfd0';ec.fillRect(670,110,80,160);
  const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(envTexture).texture;envTexture.dispose();pmrem.dispose();
  tv.rotation.y=-.34;
  let transition=null;
  let width=1,height=1,tx=-.34,ty=-.035,active=!document.querySelector('#intro').hidden;
  function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=Math.max(width<600?14.8:9.65,5.7/(2*Math.tan(THREE.MathUtils.degToRad(18))*camera.aspect)+.5);camera.position.y=1.1;camera.lookAt(0,.15,0);camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(host);resize();
  window.addEventListener('pointermove',e=>{if(transition||reduced||dragging||e.pointerType==='touch')return;tx=-.34+(e.clientX/innerWidth-.5)*.36;ty=-.035+(e.clientY/innerHeight-.5)*.09;});
  let dragging=false,lastX=0;
  host.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;host.setPointerCapture(e.pointerId);});
  host.addEventListener('pointermove',e=>{if(dragging){tx=THREE.MathUtils.clamp(tx+(e.clientX-lastX)*.004,-.72,.45);lastX=e.clientX;}});
  host.addEventListener('pointerup',()=>dragging=false);host.addEventListener('pointercancel',()=>dragging=false);
  window.addEventListener('scene-visibility',()=>{active=!document.querySelector('#intro').hidden;if(active){transition=null;tx=-.34;ty=-.035;tv.rotation.set(ty,tx,0);renderer.toneMappingExposure=1.3;resize();}});
  window.addEventListener('enter-tv',event=>{transition={start:performance.now(),z:camera.position.z,rotation:tv.rotation.clone(),complete:event.detail.complete};});
  renderer.domElement.addEventListener('webglcontextlost',()=>{renderer.domElement.style.display='none';document.querySelector('#fallback-tv').style.display='block';});
  document.querySelector('#fallback-tv').style.display='none';
  const center=new THREE.Vector3(),left=new THREE.Vector3(),right=new THREE.Vector3();
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  document.querySelector('.intro-stage').addEventListener('pointermove',e=>{if(transition)return;const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const over=raycaster.intersectObjects(tv.children,false).length>0;document.body.classList.toggle('tv-hover',over);});
  document.querySelector('.intro-stage').addEventListener('pointerleave',()=>document.body.classList.remove('tv-hover'));
  function draw(){requestAnimationFrame(draw);if(!active||!width||!height)return;
    if(transition){
      const t=Math.min((performance.now()-transition.start)/1300,1);
      const aim=THREE.MathUtils.smoothstep(t,.06,.78),push=t*t*t;
      // Dark ceiling panel in the supplied photograph: source UV (.46,.89),
      // mapped through the existing .77 crop onto the CRT's screen plane.
      const targetX=-.205,targetY=1.465;
      tv.rotation.y=transition.rotation.y*(1-aim);tv.rotation.x=transition.rotation.x*(1-aim);
      camera.position.set(targetX*aim,1.1+(targetY-1.1)*aim,transition.z+(1.04-transition.z)*push);
      camera.lookAt(targetX*aim,.15+(targetY-.15)*aim,.89*aim);
      renderer.toneMappingExposure=1.3*(1-THREE.MathUtils.smoothstep(t,.85,1));
      if(t>=1){tv.updateMatrixWorld();renderer.render(scene,camera);const done=transition.complete;transition=null;active=false;done();return;}
    }
    else{tv.rotation.y+=(tx-tv.rotation.y)*.045;tv.rotation.x+=(ty-tv.rotation.x)*.045;}
    tv.updateMatrixWorld();
    center.set(0,.35,.91).applyMatrix4(tv.matrixWorld).project(camera);
    left.set(-1.7,1.5,.91).applyMatrix4(tv.matrixWorld).project(camera);
    right.set(1.7,-.8,.91).applyMatrix4(tv.matrixWorld).project(camera);
    overlay.style.left=`${host.offsetLeft+(center.x+1)*width/2}px`;
    overlay.style.top=`${host.offsetTop+(1-center.y)*height/2}px`;
    overlay.style.width=`${(right.x-left.x)*width/2}px`;
    overlay.style.height=`${(left.y-right.y)*height/2}px`;
    overlay.style.transform=`translate(-50%,-50%) perspective(900px) rotateY(${tv.rotation.y*.75}rad) rotateZ(${tv.rotation.y*.08}rad)`;
    renderer.render(scene,camera);
  }draw();
} catch(error) {
  console.warn('La vista 3D no está disponible; se muestra la versión estática.',error);
}
