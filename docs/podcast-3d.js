import * as THREE from './assets/three.module.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const views=[];

function createView(host,fov=38) {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(fov,1,.1,50);
  scene.add(new THREE.HemisphereLight(0xfff8e8,0x48626b,2.4));
  const key=new THREE.DirectionalLight(0xffe6c3,3.5);key.position.set(-3,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xb9dcff,2.7);rim.position.set(4,2,-2);scene.add(rim);
  const environmentCanvas=document.createElement('canvas');environmentCanvas.width=512;environmentCanvas.height=256;
  const c=environmentCanvas.getContext('2d');c.fillStyle='#617071';c.fillRect(0,0,512,256);c.fillStyle='#ffedd0';c.fillRect(40,30,90,140);c.fillStyle='#e9f4ff';c.fillRect(350,55,40,130);
  const env=new THREE.CanvasTexture(environmentCanvas);env.mapping=THREE.EquirectangularReflectionMapping;env.colorSpace=THREE.SRGBColorSpace;
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(env).texture;env.dispose();pmrem.dispose();
  const view={host,renderer,scene,camera,visible:true,update:()=>{}};
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();view.resize?.(w,h);}).observe(host);
  new IntersectionObserver(entries=>{view.visible=entries[0].isIntersecting;},{rootMargin:'80px'}).observe(host);
  views.push(view);return view;
}

function makeMicrophone() {
  const host=document.querySelector('#microphone-scene'),view=createView(host,35),group=new THREE.Group();view.scene.add(group);
  view.camera.position.set(0,.1,5.95);view.camera.lookAt(0,.05,0);
  const black=new THREE.MeshStandardMaterial({color:0x242628,roughness:.43,metalness:.6});
  const rubber=new THREE.MeshStandardMaterial({color:0x131519,roughness:.8,metalness:.1});
  const edge=new THREE.MeshStandardMaterial({color:0x525b60,roughness:.3,metalness:.8});
  function mesh(geometry,material,x=0,y=0,z=0,parent=group){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
  mesh(new THREE.CylinderGeometry(.86,.9,.12,64),black,0,-1.43,0);
  mesh(new THREE.CylinderGeometry(.77,.82,.05,64),edge,0,-1.35,0);
  mesh(new THREE.CylinderGeometry(.87,.87,.04,64),rubber,0,-1.51,0);
  // A cut-out pedestal and U-shaped suspension like the reference condenser mic.
  const stand=new THREE.Shape();stand.moveTo(-.48,-1.34);stand.lineTo(-.29,-.77);stand.quadraticCurveTo(0,-.5,.29,-.77);stand.lineTo(.48,-1.34);stand.lineTo(.31,-1.34);stand.lineTo(.18,-.94);stand.quadraticCurveTo(0,-.74,-.18,-.94);stand.lineTo(-.31,-1.34);stand.closePath();
  const standGeometry=new THREE.ExtrudeGeometry(stand,{depth:.17,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035});standGeometry.translate(0,0,-.085);mesh(standGeometry,black);
  const yokeCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.62,.04,0),new THREE.Vector3(-.61,-.55,0),new THREE.Vector3(-.43,-.78,0),new THREE.Vector3(0,-.82,0),new THREE.Vector3(.43,-.78,0),new THREE.Vector3(.61,-.55,0),new THREE.Vector3(.62,.04,0)]);
  mesh(new THREE.TubeGeometry(yokeCurve,40,.078,8,false),black);
  const body=new THREE.Group();body.rotation.x=-.08;group.add(body);
  mesh(new THREE.CylinderGeometry(.43,.4,1.46,48),black,0,.22,0,body);
  mesh(new THREE.CylinderGeometry(.41,.38,.1,48),rubber,0,-.55,0,body);
  mesh(new THREE.CylinderGeometry(.45,.45,.065,48),edge,0,.97,0,body);
  mesh(new THREE.CylinderGeometry(.424,.424,.30,48),rubber,0,1.15,0,body);
  mesh(new THREE.SphereGeometry(.424,40,24,0,Math.PI*2,0,Math.PI/2),rubber,0,1.30,0,body);
  // Fine crossed wirework gives the rounded grille its woven texture.
  const wire=new THREE.MeshStandardMaterial({color:0x4b5051,roughness:.53,metalness:.66});
  for(let i=0;i<24;i++){const y=1.01+i*.029,r=y<=1.3?.428:Math.sqrt(Math.max(0,.424*.424-(y-1.3)**2))+.004;if(r>.015){const hoop=mesh(new THREE.TorusGeometry(r,.0045,4,48),wire,0,y,0,body);hoop.rotation.x=Math.PI/2;}}
  for(let i=0;i<44;i++){const a=i/44*Math.PI*2;const points=[];for(let j=0;j<=14;j++){const y=1.0+j*.051,r=y<=1.3?.429:Math.sqrt(Math.max(0,.424*.424-(y-1.3)**2))+.004;points.push(new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),18,.0038,3,false),wire,0,0,0,body);}
  for(const x of [-.55,.55]){const knob=mesh(new THREE.CylinderGeometry(.15,.15,.17,28),black,x,.03,0);knob.rotation.z=Math.PI/2;const cap=mesh(new THREE.CylinderGeometry(.12,.12,.185,28),edge,x,.03,0);cap.rotation.z=Math.PI/2;}
  const badge=mesh(new THREE.SphereGeometry(1,24,12),edge,0,.68,.416,body);badge.scale.set(.16,.105,.022);
  const inset=mesh(new THREE.SphereGeometry(1,24,12),rubber,0,.68,.433,body);inset.scale.set(.135,.081,.014);
  const dial=mesh(new THREE.CylinderGeometry(.09,.09,.08,24),black,0,-.02,.44,body);dial.rotation.x=Math.PI/2;
  const mute=mesh(new THREE.CylinderGeometry(.052,.052,.035,24),edge,0,.34,.43,body);mute.rotation.x=Math.PI/2;
  mesh(new THREE.SphereGeometry(.022,12,8),new THREE.MeshBasicMaterial({color:0xff7957}),0,.34,.457,body);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(64,64,2,64,64,62);gradient.addColorStop(0,'rgba(0,0,0,.5)');gradient.addColorStop(1,'rgba(0,0,0,0)');sc.fillStyle=gradient;sc.fillRect(0,0,128,128);
  const shadow=mesh(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}),0,-1.52,-.1);shadow.rotation.x=-Math.PI/2;
  group.rotation.y=-.35;
  let hover=false,px=0;
  const link=host.closest('a');link.addEventListener('pointerenter',()=>hover=true);link.addEventListener('pointerleave',()=>{hover=false;px=0;});link.addEventListener('focus',()=>hover=true);link.addEventListener('blur',()=>hover=false);
  link.addEventListener('pointermove',e=>{const rect=link.getBoundingClientRect();px=(e.clientX-rect.left)/rect.width-.5;});
  view.update=time=>{const motion=reduced.matches?0:1;group.rotation.y+=(-.35+px*.55+(hover?.16:0)+Math.sin(time*.65)*.08*motion-group.rotation.y)*.06;group.rotation.z=Math.sin(time*.9)*.018*motion;group.position.y=Math.sin(time*1.3)*.035*motion;const scale=hover?1.06:1;group.scale.lerp(new THREE.Vector3(scale,scale,scale),.07);};
  host.querySelector('.mic-fallback').hidden=true;
}

function makeFlag() {
  const host=document.querySelector('#eu-flag-scene'),view=createView(host,35);
  view.camera.position.set(0,0,3.6);
  view.renderer.toneMappingExposure=1;
  for(const child of view.scene.children)if(child.isLight)child.intensity*=.33;
  const geometry=new THREE.PlaneGeometry(3,2,48,28),positions=geometry.attributes.position,original=positions.array.slice();
  const flagCanvas=document.createElement('canvas');flagCanvas.width=600;flagCanvas.height=400;
  const fc=flagCanvas.getContext('2d');fc.fillStyle='#003399';fc.fillRect(0,0,600,400);fc.fillStyle='#ffcc00';
  for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,x=300+120*Math.cos(a),y=200+120*Math.sin(a);fc.beginPath();for(let j=0;j<10;j++){const angle=j*Math.PI/5-Math.PI/2,r=j%2?6.88:18;const px=x+r*Math.cos(angle),py=y+r*Math.sin(angle);j?fc.lineTo(px,py):fc.moveTo(px,py);}fc.closePath();fc.fill();}
  const texture=new THREE.CanvasTexture(flagCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,view.renderer.capabilities.getMaxAnisotropy());
  host.classList.add('flag-ready');
  const flag=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:texture,roughness:.93,metalness:0,side:THREE.DoubleSide,envMapIntensity:.18}));flag.rotation.y=-.13;view.scene.add(flag);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,2.25,12),new THREE.MeshStandardMaterial({color:0xb6b9b2,roughness:.4,metalness:.6}));pole.position.set(-1.52,0,0);view.scene.add(pole);
  view.update=time=>{
    const t=reduced.matches?0:time;
    for(let i=0;i<positions.count;i++){
      const x=original[i*3],y=original[i*3+1],pin=(x+1.5)/3;
      positions.setZ(i,pin*(Math.sin(x*3.6-t*2.25)*.15+Math.sin(x*6.2-y*1.8-t*2.9)*.045));
      positions.setY(i,y+pin*Math.sin(x*3-t*2.25)*.022);
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();
  };
}

try{makeMicrophone();}catch(error){console.warn('El enlace de episodios sigue disponible sin 3D.',error);}
try{makeFlag();}catch(error){console.warn('Se mantiene la bandera estática.',error);}
function animate(now){requestAnimationFrame(animate);if(document.hidden)return;for(const view of views){if(!view.visible)continue;view.update(now/1000);view.renderer.render(view.scene,view.camera);}}
requestAnimationFrame(animate);
