import * as THREE from './assets/three.module.js';

// After the ceiling fills the viewport and fades to black, light rings emerge into a 3D corridor.
export function prepareDimension() {
  const host=document.createElement('div');host.className='dimension-portal';host.style.visibility='hidden';host.setAttribute('aria-hidden','true');document.body.appendChild(host);
  let renderer;
  try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}catch(error){host.remove();throw error;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x000000,1);host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x000000,.009);
  const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.02,250);
  const corridor=new THREE.Group();scene.add(corridor);
  const palettes=[0x8be6dc,0xe9bd75,0x719ac2,0xb9e6c6];
  for(let i=0;i<42;i++) {
    const material=new THREE.MeshBasicMaterial({color:palettes[i%4],transparent:true,opacity:.68,blending:THREE.AdditiveBlending,depthWrite:false});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(4.1,.025,5,64),material);ring.position.z=-i*4-6;ring.rotation.z=i*.065;corridor.add(ring);
    const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-4.3,-2.8,0),new THREE.Vector3(4.3,-2.8,0),new THREE.Vector3(4.3,2.8,0),new THREE.Vector3(-4.3,2.8,0)]),new THREE.LineBasicMaterial({color:palettes[(i+1)%4],transparent:true,opacity:.2}));outline.position.z=ring.position.z-2;outline.rotation.z=i*.09;corridor.add(outline);
  }
  const segments=[];
  for(let i=0;i<850;i++){const a=i*2.399963,rad=2.8+(Math.sin(i*12.12)*.5+.5)*6;const x=Math.cos(a)*rad,y=Math.sin(a)*rad,z=-8-(i%160);segments.push(x,y,z,x,y,z-1.1-(i%4)*.5);}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(segments,3));corridor.add(new THREE.LineSegments(starGeometry,new THREE.LineBasicMaterial({color:0xd9ece5,transparent:true,opacity:.52,blending:THREE.AdditiveBlending})));
  // A fully black threshold separates the ceiling zoom from the first light.
  // All corridor materials begin at zero opacity, including the first rendered frame.
  for(const object of corridor.children){object.userData.baseOpacity=object.material.opacity;object.material.opacity=0;}
  const glow=document.createElement('div');glow.className='dimension-glow';host.appendChild(glow);
  const caption=document.createElement('p');caption.className='dimension-caption';caption.textContent='AL OTRO LADO DE LA FRECUENCIA';host.appendChild(caption);
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};window.addEventListener('resize',resize);
  // Compile before approaching the TV so shader/context setup cannot interrupt the hand-off.
  renderer.compile(scene,camera);
  return async function travelThroughDimension(){
  renderer.render(scene,camera);host.dataset.phase='black';host.style.visibility='visible';
  await new Promise(resolve=>{
    const start=performance.now(),duration=2700,blackHold=220;
    function frame(now){
      const t=THREE.MathUtils.clamp((now-start-blackHold)/(duration-blackHold),0,1),progress=.18*t+.82*t*t*(3-2*t);
      const lights=THREE.MathUtils.smoothstep(t,0,.27);
      host.dataset.phase=t===0?'black':t<.27?'emerging':'tunnel';
      camera.position.z=-progress*128;
      camera.position.x=Math.sin(t*Math.PI*2)*.10*Math.sin(t*Math.PI);
      camera.position.y=Math.cos(t*Math.PI*2)*.08*Math.sin(t*Math.PI);
      camera.rotation.z=Math.sin(t*Math.PI)*.13;corridor.rotation.z=t*.15;
      for(const object of corridor.children){object.material.opacity=object.userData.baseOpacity*lights;}
      caption.style.opacity=String(Math.max(0,Math.min(1,(t-.38)*6,(.87-t)*9)));
      glow.style.opacity=String(THREE.MathUtils.smoothstep(t,.8,1));
      renderer.render(scene,camera);if(t<1)requestAnimationFrame(frame);else resolve();
    }
    requestAnimationFrame(frame);
  });
  window.removeEventListener('resize',resize);
  scene.traverse(object=>{object.geometry?.dispose();if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>material.dispose());}});renderer.dispose();
  // Keep the pale exit frame until the next HTML document opens.
  };
}
