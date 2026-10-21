/* Chá do Benício — motor 3D WebGL nativo, sem bibliotecas, recortes nem imagens externas. */
(() => {
'use strict';
const V3=(a,b,c)=>[a,b,c];
const RAD=Math.PI/180;
const hex=(h)=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]};
const matmul=(a,b)=>{let r=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)r[j*4+i]+=a[k*4+i]*b[j*4+k];return r};
const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const tr=(x,y,z)=>{let r=identity();r[12]=x;r[13]=y;r[14]=z;return r};
const sc=(x,y,z)=>new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]);
const rx=(a)=>{let c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])};
const ry=(a)=>{let c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])};
const rz=(a)=>{let c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1])};
const perspective=(fov,aspect,near,far)=>{let f=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)/(near-far);m[11]=-1;m[14]=(2*far*near)/(near-far);return m};
const norm=(v)=>{let l=Math.hypot(...v)||1;return v.map(x=>x/l)};
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const look=(eye,target,up=[0,1,0])=>{let z=norm(sub(eye,target)),x=norm(cross(up,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])};
function sphere(steps=28,rings=18){let p=[],n=[],inds=[];for(let j=0;j<=rings;j++){let a=Math.PI*j/rings;for(let i=0;i<=steps;i++){let b=2*Math.PI*i/steps,x=Math.sin(a)*Math.cos(b),y=Math.cos(a),z=Math.sin(a)*Math.sin(b);p.push(x,y,z);n.push(x,y,z)}}for(let j=0;j<rings;j++)for(let i=0;i<steps;i++){let v=j*(steps+1)+i;inds.push(v,v+steps+1,v+1,v+1,v+steps+1,v+steps+2)}return {p,n,inds}}
function box(){let p=[],n=[],inds=[];const faces=[[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],[[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]],[[1,0,0],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],[[-1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],[[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],[[0,-1,0],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]]];faces.forEach(([normal,pts])=>{let st=p.length/3;pts.forEach(v=>{p.push(...v);n.push(...normal)});inds.push(st,st+1,st+2,st,st+2,st+3)});return {p,n,inds}}
function cylinder(top=1,bottom=1){let p=[],n=[],inds=[],s=28;for(let j=0;j<=1;j++){let rr=j?bottom:top,y=j?-1:1;for(let i=0;i<=s;i++){let a=i*Math.PI*2/s,xx=Math.cos(a),zz=Math.sin(a);p.push(rr*xx,y,rr*zz);n.push(xx,(bottom-top)/2,zz)}}for(let i=0;i<s;i++){let k=i;inds.push(k,k+s+1,k+1,k+1,k+s+1,k+s+2)}for(let side=0;side<2;side++){let r=side?bottom:top,y=side?-1:1,begin=p.length/3;p.push(0,y,0);n.push(0,side?-1:1,0);for(let i=0;i<=s;i++){let a=i*Math.PI*2/s;p.push(r*Math.cos(a),y,r*Math.sin(a));n.push(0,side?-1:1,0)}for(let i=0;i<s;i++){if(side)inds.push(begin,begin+i+2,begin+i+1);else inds.push(begin,begin+i+1,begin+i+2)}}return {p,n,inds}}
function heart(){let pts=[],steps=60;for(let i=0;i<steps;i++){let t=2*Math.PI*i/steps,x=16*Math.pow(Math.sin(t),3)/17,y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17;pts.push([x,y])}let p=[],n=[],inds=[];for(let z of [0.17,-0.17]){let start=p.length/3;p.push(0,0,z);n.push(0,0,z>0?1:-1);pts.forEach(([x,y])=>{p.push(x,y,z);n.push(0,0,z>0?1:-1)});for(let i=0;i<steps;i++){let a=start+1+i,b=start+1+(i+1)%steps;if(z>0)inds.push(start,a,b);else inds.push(start,b,a)}}for(let i=0;i<steps;i++){let a=pts[i],b=pts[(i+1)%steps],st=p.length/3,u=norm([b[1]-a[1],a[0]-b[0],0]);[[...a,.17],[...b,.17],[...b,-.17],[...a,-.17]].forEach(v=>{p.push(...v);n.push(...u)});inds.push(st,st+1,st+2,st,st+2,st+3)}return {p,n,inds}}
function star(){let p=[],n=[],inds=[],pts=[];for(let i=0;i<10;i++){let a=i*Math.PI/5-Math.PI/2,r=i%2?.43:1;pts.push([r*Math.cos(a),r*Math.sin(a)])}for(let side of [.12,-.12]){let st=p.length/3;p.push(0,0,side);n.push(0,0,Math.sign(side));pts.forEach(([x,y])=>{p.push(x,y,side);n.push(0,0,Math.sign(side))});for(let i=0;i<10;i++){let a=st+1+i,b=st+1+(i+1)%10;if(side>0)inds.push(st,a,b);else inds.push(st,b,a)}}for(let i=0;i<10;i++){let a=pts[i],b=pts[(i+1)%10],st=p.length/3;for(let v of [[...a,.12],[...b,.12],[...b,-.12],[...a,-.12]]){p.push(...v);n.push(0,0,1)}inds.push(st,st+1,st+2,st,st+2,st+3)}return {p,n,inds}}
const basicMeshes={sphere:sphere(),box:box(),cylinder:cylinder(),cone:cylinder(0,1),heart:heart(),star:star()};
const colors={fur:'#ba865f',furLight:'#e5b994',furDark:'#a8714c',cream:'#ffe9d4',white:'#ffffff',navy:'#113d77',blue:'#4f9eea',baby:'#a1cbfb',sky:'#d4ecff',wood:'#d8ab7a',gold:'#e7ba69',black:'#292333',pink:'#f9cbbd',mint:'#9ed9d6',silver:'#afc0d7'};
function node(mesh,p,s,color,r=[0,0,0],rough=.65){return {mesh,p,s,color:hex(color),r,rough}}
const add=(arr,mesh,p,s,color,r,rough)=>arr.push(node(mesh,p,s,color,r,rough));
const ell=(a,p,s,c,r)=>add(a,'sphere',p,s,c,r);
const cube=(a,p,s,c,r)=>add(a,'box',p,s,c,r);
const cyl=(a,p,s,c,r)=>add(a,'cylinder',p,s,c,r);
const cone=(a,p,s,c,r)=>add(a,'cone',p,s,c,r);
const heartObj=(a,p,s,c,r)=>add(a,'heart',p,s,c,r);
const starObj=(a,p,s,c,r)=>add(a,'star',p,s,c,r);
function teddy(a,base=[0,0,0],size=1){const P=(x,y,z)=>[base[0]+x*size,base[1]+y*size,base[2]+z*size];const S=(x,y,z)=>[x*size,y*size,z*size];
 ell(a,P(0,.8,0),S(.72,.84,.57),colors.fur); // body
 ell(a,P(-.62,.35,.32),S(.43,.38,.5),colors.furLight,[-.22,0,-.38]);ell(a,P(.62,.35,.32),S(.43,.38,.5),colors.furLight,[-.22,0,.38]);
 ell(a,P(-.83,1.03,.21),S(.31,.5,.35),colors.fur,[-.3,0,-.38]);ell(a,P(.83,1.03,.21),S(.31,.5,.35),colors.fur,[-.3,0,.38]);
 ell(a,P(0,2.02,.08),S(.83,.78,.73),colors.furLight);
 ell(a,P(-.7,2.61,.04),S(.36,.39,.23),colors.fur);ell(a,P(.7,2.61,.04),S(.36,.39,.23),colors.fur);
 ell(a,P(-.7,2.61,.24),S(.22,.25,.08),colors.pink);ell(a,P(.7,2.61,.24),S(.22,.25,.08),colors.pink);
 ell(a,P(0,1.8,.68),S(.42,.3,.16),colors.cream);
 ell(a,P(-.31,2.17,.699),S(.105,.126,.065),colors.black);ell(a,P(.31,2.17,.699),S(.105,.126,.065),colors.black);
 ell(a,P(-.335,2.22,.756),S(.027,.031,.015),'#ffffff');ell(a,P(.286,2.22,.756),S(.027,.031,.015),'#ffffff');
 ell(a,P(0,1.89,.85),S(.17,.115,.105),colors.black);
 // mouth points curved downward in front
 ell(a,P(-.087,1.69,.795),S(.07,.025,.022),colors.furDark,[0,0,-.35]);ell(a,P(.087,1.69,.795),S(.07,.025,.022),colors.furDark,[0,0,.35]);
 // face blush, sculpted eyebrows, sparkle
 ell(a,P(-.46,1.91,.575),S(.17,.09,.038),'#deaa8e');ell(a,P(.46,1.91,.575),S(.17,.09,.038),'#deaa8e');
 ell(a,P(-.31,2.39,.664),S(.145,.025,.037),colors.furDark,[0,0,-.12]);ell(a,P(.31,2.39,.664),S(.145,.025,.037),colors.furDark,[0,0,.12]);
 // satin bow layered ribbons and silky knot
 ell(a,P(-.28,1.42,.58),S(.33,.22,.14),colors.blue,[0,0,-.3]);ell(a,P(.28,1.42,.58),S(.33,.22,.14),colors.blue,[0,0,.3]);
 ell(a,P(-.3,1.46,.693),S(.19,.09,.016),'#83bbff',[0,0,-.35]);ell(a,P(.3,1.46,.693),S(.19,.09,.016),'#83bbff',[0,0,.35]);
 ell(a,P(0,1.42,.75),S(.125,.14,.13),'#286cbb');
 ell(a,P(-.125,1.13,.52),S(.11,.23,.08),colors.blue,[0,0,.22]);ell(a,P(.125,1.13,.52),S(.11,.23,.08),colors.blue,[0,0,-.22]);
 // paw pads
 ell(a,P(-.65,.18,.75),S(.21,.17,.05),colors.cream);ell(a,P(.65,.18,.75),S(.21,.17,.05),colors.cream);
 // rounded heart in front, satin shine and embossed centerpiece
 heartObj(a,P(0,.84,.73),S(.52,.53,.37),colors.baby);
 ell(a,P(-.23,1.03,.842),S(.14,.035,.03),'#d8ecff',[0,0,.42]);
 // embroidered B on the heart, made from little 3D pieces rather than image text
 const l='#f9f1de';
 cube(a,P(-.065,.79,.814),S(.027,.18,.018),l);
 cube(a,P(.005,.959,.814),S(.085,.027,.018),l);cube(a,P(.018,.795,.814),S(.085,.026,.018),l);cube(a,P(.005,.624,.814),S(.085,.027,.018),l);
 ell(a,P(.083,.880,.814),S(.051,.077,.018),l);ell(a,P(.083,.707,.814),S(.051,.079,.018),l);
 // Toe embroidery on both pads
 for(const sign of [-1,1])for(let t=0;t<3;t++) ell(a,P(sign*(.53+t*.11),.27,.813),S(.045,.065,.027),'#d7a58d');
 // crown
 cyl(a,P(0,2.88,.05),S(.29,.12,.29),colors.gold);
 for(let i=-1;i<=1;i++){let xx=i*.22;cone(a,P(xx,3.02,.05),S(.09,.22,.09),colors.gold);ell(a,P(xx,3.22,.05),S(.07,.07,.07),colors.gold)}
 for(const obj of a){if([colors.fur,colors.furLight,colors.furDark,colors.cream,'#deaa8e'].some(c=>obj.color.every((v,i)=>Math.abs(v-hex(c)[i])<.0001)))obj.isFur=true;}
 }
function cloud(a,p,s=1){ell(a,[p[0],p[1],p[2]],[.57*s,.3*s,.32*s],'#ffffff');ell(a,[p[0]-.42*s,p[1]-.08*s,p[2]],[.36*s,.28*s,.29*s],'#f8fdff');ell(a,[p[0]+.38*s,p[1]-.09*s,p[2]],[.36*s,.26*s,.29*s],'#eef7ff');ell(a,[p[0]-.1*s,p[1]+.17*s,p[2]],[.35*s,.32*s,.27*s],'#ffffff')}
function heroScene(){const a=[];teddy(a,[0,-1.47,0],1.05);
 // starry surroundings and floating clouds
 cloud(a,[-1.62,1.28,-.8],.73);cloud(a,[1.65,1.48,-.7],.8);
 [[-1.52,2.2,.27,.2],[-1.75,.18,-.1,.13],[1.66,2.32,-.2,.17],[1.7,.42,.4,.15],[-.96,2.71,-.3,.12]].forEach(([x,y,z,s])=>starObj(a,[x,y,z],[s,s,s*.48],colors.gold));
 // balloon clusters: spheres with narrow strings
 for(let [x,y,z,s,c] of [[-1.45,.51,-.28,.36,colors.baby],[1.46,.65,-.25,.42,colors.blue],[-1.92,1.02,-.7,.31,colors.white],[1.92,1.43,-.8,.25,colors.cream]]){ell(a,[x,y,z],[s*.8,s,s*.7],c);cone(a,[x,y-s-.07,z],[.07,.085,.07],c,[Math.PI,0,0]);cyl(a,[x,y-s-.4,z],[.012,.28,.012],'#d6a76d')}
 // nursery furniture: genuine 3D geometry, not an image
 {let furniture=[];crib(furniture);for(const o of furniture){o.p=[o.p[0]*.56+2.15,o.p[1]*.56-.87,o.p[2]*.56-1.25];o.s=o.s.map(v=>v*.56);a.push(o)}}
 // soft translucent stars hang above the crib
 for(let i=0;i<3;i++){cyl(a,[1.72+i*.34,2.42-i*.17,-1.0],[.012,.24,.012],'#efe4d1');starObj(a,[1.72+i*.34,2.09-i*.17,-.96],[.11,.11,.06],i===1?colors.baby:colors.gold)}
 // nursery blocks
 for(let i=0;i<3;i++){cube(a,[-1.46+i*.31,-1.36,.48],[.17,.17,.17],['#f0d9b8','#b5daf7','#eacaa4'][i],[0,.13*i,0])}
 // soft floor podium
 ell(a,[0,-1.77,0],[2.15,.21,1.4],'#e1effc');
 return a}
function pack(a,shade=colors.blue){cube(a,[0,0,0],[.91,.6,.35],shade);cube(a,[0,.03,.356],[.76,.42,.02],'#ffffff');ell(a,[.37,-.15,.38],[.16,.16,.08],colors.baby);ell(a,[-.28,.05,.39],[.11,.14,.06],colors.mint);cube(a,[0,.52,0],[.55,.08,.3],colors.sky)}
function bottle(a,cap=colors.blue,body=colors.white){cyl(a,[0,-.2,0],[.4,.62,.34],body);cyl(a,[0,.54,0],[.29,.16,.29],cap);cyl(a,[0,.71,0],[.15,.1,.15],colors.cream);ell(a,[0,-.17,.33],[.19,.24,.03],colors.baby)}
function folded(a,n=3){for(let i=0;i<n;i++){ell(a,[0,-.5+i*.24,0],[.89,.18,.6],i%2?colors.white:colors.baby);ell(a,[-.67,-.5+i*.24,.1],[.16,.14,.4],colors.sky)}}
function clothing(a){cube(a,[0,0,0],[.57,.74,.09],colors.baby);cube(a,[-.72,.39,0],[.25,.24,.09],colors.baby,[0,0,.45]);cube(a,[.72,.39,0],[.25,.24,.09],colors.baby,[0,0,-.45]);cube(a,[-.34,-.65,0],[.22,.23,.09],colors.baby);cube(a,[.34,-.65,0],[.22,.23,.09],colors.baby);ell(a,[0,.69,.07],[.24,.15,.075],'#f6fcff');heartObj(a,[0,.1,.17],[.16,.17,.055],colors.white)}
function bathtub(a){ell(a,[0,-.22,0],[1.12,.37,.65],colors.baby);ell(a,[0,.08,0],[1.08,.16,.62],colors.white);ell(a,[0,.15,0],[.92,.11,.49],colors.sky);ell(a,[-.71,-.51,.2],[.16,.12,.14],colors.blue);ell(a,[.71,-.51,.2],[.16,.12,.14],colors.blue)}
function crib(a){ // legs & slats
 for(let x of [-.95,.95])for(let z of [-.53,.53])cyl(a,[x,0,z],[.065,.81,.065],colors.wood);
 cube(a,[0,-.35,0],[.98,.1,.59],colors.wood);cube(a,[0,-.15,0],[.85,.15,.51],colors.white);
 for(let x of [-.95,.95])for(let y of [-.55,.65])cube(a,[x,y,0],[.08,.08,.63],colors.wood);
 for(let z of [-.53,.53]){cube(a,[0,.66,z],[1.04,.09,.065],colors.wood);cube(a,[0,-.65,z],[1,.09,.065],colors.wood);for(let i=-4;i<=4;i++)cube(a,[i*.22,0,z],[.035,.62,.037],colors.wood)}
 }
function dresser(a){cube(a,[0,0,0],[1,.83,.49],colors.wood);for(let i=0;i<3;i++){cube(a,[0,.53-i*.51,.51],[.88,.22,.028],colors.cream);ell(a,[0,.53-i*.51,.56],[.055,.055,.038],colors.gold)}for(let x of [-.77,.77])cube(a,[x,-.94,0],[.1,.17,.4],colors.wood)}
function stroller(a){for(let x of [-.8,.8]){cyl(a,[x,-.77,.15],[.33,.12,.33],colors.black,[Math.PI/2,0,0]);cyl(a,[x,-.77,.28],[.17,.13,.17],colors.silver,[Math.PI/2,0,0])}ell(a,[0,.15,0],[.85,.47,.48],colors.blue,[0,0,-.25]);ell(a,[.12,.47,-.3],[.72,.57,.22],colors.navy,[0,0,-.3]);cube(a,[0,-.35,0],[.7,.1,.1],colors.silver);cyl(a,[-.83,.45,-.25],[.07,.9,.07],colors.silver,[0,0,.3])}
function carseat(a){ell(a,[0,-.3,0],[.8,.42,.64],colors.black);ell(a,[0,.23,-.26],[.71,.86,.39],colors.silver,[-.15,0,0]);ell(a,[0,.18,-.04],[.55,.72,.26],colors.navy);ell(a,[0,-.3,.32],[.48,.26,.24],colors.black);ell(a,[0,.03,.22],[.11,.3,.09],colors.white)}
function brush(a){for(let x of [-.42,.42]){ell(a,[x,.28,0],[.28,.31,.08],colors.baby);cube(a,[x,-.44,0],[.12,.49,.08],colors.baby);for(let i=-2;i<=2;i++)cube(a,[x+i*.08,.34,.09],[.018,.23,.02],colors.white)}}
function bib(a){ell(a,[0,0,0],[.67,.86,.1],colors.baby);ell(a,[0,.52,.1],[.33,.29,.11],colors.white);ell(a,[-.48,.68,.03],[.19,.24,.12],colors.sky);ell(a,[.48,.68,.03],[.19,.24,.12],colors.sky);heartObj(a,[0,-.2,.16],[.2,.22,.06],colors.white)}
function diaperOintment(a){cyl(a,[0,-.16,0],[.42,.64,.25],colors.white);cube(a,[0,.63,0],[.36,.16,.27],colors.blue);ell(a,[0,-.1,.27],[.3,.24,.04],colors.baby)}
function wipePack(a){cube(a,[0,-.21,0],[.93,.43,.57],colors.baby);cube(a,[0,.25,0],[.59,.13,.42],colors.white);ell(a,[0,.4,0],[.3,.07,.22],colors.white)}
function ps5(a){cube(a,[.05,.03,0],[.29,1.04,.31],colors.black);cube(a,[-.36,.08,0],[.13,1.15,.38],colors.white,[0,0,-.07]);cube(a,[.45,.08,0],[.13,1.15,.38],colors.white,[0,0,.07]);ell(a,[0,-.76,.52],[.54,.22,.31],colors.white);ell(a,[-.25,-.78,.8],[.17,.14,.12],colors.black);ell(a,[.25,-.78,.8],[.17,.14,.12],colors.black)}
function sceneProduct(type,variant=0){let a=[];switch(type){
 case 'diapers':pack(a,['#89d3e5','#98caef','#75b5ea','#78c5e5','#b7c5ef'][variant%5]);break;
 case 'wipes':wipePack(a);break;
 case 'ointment':diaperOintment(a);break;
 case 'soap':bottle(a,colors.mint,colors.white);break;
 case 'shampoo':bottle(a,colors.gold,'#f6e4b4');break;
 case 'bodies':case 'onesie':clothing(a);break;
 case 'blanket':case 'sheets':case 'cloths':folded(a,type==='cloths'?4:3);break;
 case 'towel':folded(a,2);heartObj(a,[0,.14,.4],[.23,.25,.14],colors.white);break;
 case 'bib':bib(a);break;
 case 'bottle':bottle(a,colors.blue,colors.white);break;
 case 'brush':brush(a);break;
 case 'bath':bathtub(a);break;
 case 'changing':cube(a,[0,0,0],[1,.17,.69],colors.white);cube(a,[0,.19,-.48],[1,.21,.23],colors.baby);break;
 case 'crib':crib(a);break;
 case 'dresser':dresser(a);break;
 case 'stroller':stroller(a);break;
 case 'carseat':carseat(a);break;
 case 'ps5':ps5(a);break;
 default:folded(a,2)
 }return a}
class WebGLScene{
 constructor(canvas,opts={}){this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:false});if(!this.gl)throw Error('WebGL indisponível');const gl=this.gl;
 const vert=`attribute vec3 aPos;attribute vec3 aNorm;uniform mat4 uP,uV,uM;uniform vec3 uScale;varying vec3 vN;varying vec3 vW;void main(){vec4 pos=uM*vec4(aPos,1.);vW=pos.xyz;vN=normalize(mat3(uM)*(aNorm/(uScale*uScale)));gl_Position=uP*uV*pos;}`;
 const frag=`precision mediump float;varying vec3 vN;varying vec3 vW;uniform vec3 uColor;uniform float uRough;uniform float uFur;
 float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
 void main(){vec3 n=normalize(vN);if(uFur>.5){float fuzz=hash(floor(vW*215.));float threads=hash(floor(vW*87.));n=normalize(n+(vec3(hash(vW*57.),hash(vW*63.),hash(vW*47.))-.5)*.11);}vec3 light=normalize(vec3(-0.55,1.,1.));float dif=max(dot(n,light),0.);float fill=max(dot(n,normalize(vec3(1.,.2,-.6))),0.);float lumin=.42+dif*.49+fill*.09;float spec=pow(max(dot(reflect(-light,n),normalize(vec3(0.,1.,2.))),0.),mix(44.,8.,uRough));vec3 col=uColor*lumin+vec3(1.,.97,.92)*spec*.32*(1.-uRough);
 if(uFur>.5){float f=hash(floor(vW*320.));float m=hash(floor(vW*95.));col*=.89+.13*f+.1*m;col+=vec3(.045,.031,.018)*pow(f,8.);}
 col+=pow(1.-max(dot(n,normalize(vec3(0.,.3,1.))),0.),3.)*vec3(.06,.07,.08);gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(.95)),1.);}`;
 const sh=(type,src)=>{let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};const program=gl.createProgram();gl.attachShader(program,sh(gl.VERTEX_SHADER,vert));gl.attachShader(program,sh(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);this.program=program;
 this.loc={pos:gl.getAttribLocation(program,'aPos'),nor:gl.getAttribLocation(program,'aNorm'),P:gl.getUniformLocation(program,'uP'),V:gl.getUniformLocation(program,'uV'),M:gl.getUniformLocation(program,'uM'),scale:gl.getUniformLocation(program,'uScale'),color:gl.getUniformLocation(program,'uColor'),rough:gl.getUniformLocation(program,'uRough'),fur:gl.getUniformLocation(program,'uFur')};this.mesh={};for(let [key,g] of Object.entries(basicMeshes)){let buffers=[];for(let arr of [g.p,g.n,g.inds]){let b=gl.createBuffer();gl.bindBuffer(buffers.length===2?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER,b);gl.bufferData(buffers.length===2?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER,buffers.length===2?new Uint16Array(arr):new Float32Array(arr),gl.STATIC_DRAW);buffers.push(b)}this.mesh[key]={buffers,count:g.inds.length}}
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);/* Geometrias próprias com ambos os lados visíveis */this.opts=opts;this.rotation=0;
 }
 resize(w,h,dpr=1){let canvas=this.canvas;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);this.gl.viewport(0,0,canvas.width,canvas.height)}
 render(scene,opt={}){const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);let ratio=this.canvas.width/this.canvas.height;const P=perspective((opt.fov||34)*RAD,ratio,.1,100),V=look(opt.eye||[0,1.05,7.8],opt.lookAt||[0,.6,0]);gl.uniformMatrix4fv(this.loc.P,false,P);gl.uniformMatrix4fv(this.loc.V,false,V);
 const yaw=opt.yaw||0;const R=ry(yaw);for(let ob of scene){const m=this.mesh[ob.mesh];if(!m)continue;let M=matmul(tr(...ob.p),matmul(R,matmul(rz(ob.r[2]),matmul(ry(ob.r[1]),matmul(rx(ob.r[0]),sc(...ob.s))))));gl.uniformMatrix4fv(this.loc.M,false,M);gl.uniform3fv(this.loc.scale,ob.s);gl.uniform3fv(this.loc.color,ob.color);gl.uniform1f(this.loc.rough,ob.rough);gl.uniform1f(this.loc.fur,ob.isFur?1:0);
 gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers[0]);gl.enableVertexAttribArray(this.loc.pos);gl.vertexAttribPointer(this.loc.pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers[1]);gl.enableVertexAttribArray(this.loc.nor);gl.vertexAttribPointer(this.loc.nor,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.buffers[2]);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0)}
 }
}

/* Canvas 2D software renderer: keeps REAL 3D triangle meshes visible even on browsers
   that block WebGL. Uses perspective projection, directional lighting and depth ordering. */
class Canvas3D {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});if(!this.ctx)throw Error('Canvas 2D indisponível');this.mode='software'}
 resize(w,h,dpr=1){this.canvas.width=Math.max(1,Math.round(w*dpr));this.canvas.height=Math.max(1,Math.round(h*dpr))}
 render(scene,opt={}){
  const ctx=this.ctx,W=this.canvas.width,H=this.canvas.height;ctx.clearRect(0,0,W,H);
  const eye=opt.eye||[0,1.05,7.8],view=look(eye,opt.lookAt||[0,.6,0]),proj=perspective((opt.fov||34)*RAD,W/H,.1,100),VP=matmul(proj,view),rot=ry(opt.yaw||0),facets=[];
  const project=(m,x,y,z)=>{const px=m[0]*x+m[4]*y+m[8]*z+m[12],py=m[1]*x+m[5]*y+m[9]*z+m[13],pz=m[2]*x+m[6]*y+m[10]*z+m[14],pw=m[3]*x+m[7]*y+m[11]*z+m[15];if(pw<.12)return null;return [(px/pw*.5+.5)*W,(.5-py/pw*.5)*H,pz/pw]};
  const light=norm([-.55,1.4,1.5]),fill=norm([1,.3,-.5]);
  for(const ob of scene){const mesh=basicMeshes[ob.mesh];if(!mesh)continue;
   const M=matmul(tr(...ob.p),matmul(rot,matmul(rz(ob.r[2]),matmul(ry(ob.r[1]),matmul(rx(ob.r[0]),sc(...ob.s))))));const MVP=matmul(VP,M),pts=mesh.p,norms=mesh.n,verts=[],wv=[],vnorm=[];
   for(let i=0;i<pts.length;i+=3){const x=pts[i],y=pts[i+1],z=pts[i+2];verts.push(project(MVP,x,y,z));wv.push([M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]]);const sx=norms[i]/(ob.s[0]*ob.s[0]),sy=norms[i+1]/(ob.s[1]*ob.s[1]),sz=norms[i+2]/(ob.s[2]*ob.s[2]);vnorm.push(norm([M[0]*sx+M[4]*sy+M[8]*sz,M[1]*sx+M[5]*sy+M[9]*sz,M[2]*sx+M[6]*sy+M[10]*sz]))}
   const ids=mesh.inds;
   for(let i=0;i<ids.length;i+=3){const a=ids[i],b=ids[i+1],c=ids[i+2],pa=verts[a],pb=verts[b],pc=verts[c];if(!pa||!pb||!pc)continue;
    const n=norm([vnorm[a][0]+vnorm[b][0]+vnorm[c][0],vnorm[a][1]+vnorm[b][1]+vnorm[c][1],vnorm[a][2]+vnorm[b][2]+vnorm[c][2]]);
    let center=[(wv[a][0]+wv[b][0]+wv[c][0])/3,(wv[a][1]+wv[b][1]+wv[c][1])/3,(wv[a][2]+wv[b][2]+wv[c][2])/3];
    if(dot(n,sub(eye,center))<-.1)continue;
    const shade=Math.min(1.16,.47+Math.max(0,dot(n,light))*.48+Math.max(0,dot(n,fill))*.06);
    const col=ob.color.map(v=>Math.round(255*Math.min(1,Math.pow(v*shade,.92))));
    facets.push({pa,pb,pc,depth:(pa[2]+pb[2]+pc[2])/3,fill:`rgb(${col.join(',')})`});
   }
  }
  facets.sort((a,b)=>b.depth-a.depth);
  for(const f of facets){ctx.fillStyle=f.fill;ctx.beginPath();ctx.moveTo(f.pa[0],f.pa[1]);ctx.lineTo(f.pb[0],f.pb[1]);ctx.lineTo(f.pc[0],f.pc[1]);ctx.closePath();ctx.fill();ctx.strokeStyle=f.fill;ctx.lineWidth=.48;ctx.stroke()}
 }
}
function makeRenderer(canvas){try{return new WebGLScene(canvas)}catch(e){return new Canvas3D(canvas)}}

function meetingScene(){const a=[];
 // layered folding paper map
 for(let i=-1;i<=1;i++){cube(a,[i*.61,-.67,0],[.32,.038,.89],i===0?'#e9f4ff':'#c8e6ff',[0,i*.19,0]);}
 for(let i=0;i<3;i++){cube(a,[-.93+i*.92,-.55,.01],[.015,.015,.8],'#8cbee9',[0,.12*i,0]);}
 // polished location pin: donut rim illusion and tapered point
 cone(a,[0,.05,.34],[.39,.58,.22],'#3388da',[Math.PI,0,0]);ell(a,[0,.62,.34],[.43,.43,.25],'#287bcd');
 ell(a,[0,.66,.61],[.21,.21,.025],'#e4f4ff');
 // wooden miniature house with roof
 cube(a,[1.25,-.26,-.4],[.38,.4,.34],'#ead0ae');
 cube(a,[1.25,.19,-.4],[.48,.16,.44],'#b78760',[0,0,.76]);
 cube(a,[1.25,-.38,-.04],[.11,.23,.04],'#fef3db');
 cloud(a,[-1.65,.75,-.8],.64);starObj(a,[1.65,1.1,-.7],[.2,.2,.12],colors.gold);
 return a}
function rsvpScene(){const a=[];teddy(a,[-.25,-1.2,0],.73);cloud(a,[-1.4,.05,-.6],.6);cloud(a,[1.22,.38,-.6],.55);heartObj(a,[1.26,1.38,-.6],[.42,.4,.18],colors.baby);starObj(a,[-1.35,1.3,-.5],[.22,.22,.09],colors.gold);return a}
let activeHero=null;
function initHero(){const el=document.getElementById('hero3d');if(!el)return;try{const R=makeRenderer(el);const scene=heroScene();let yaw=0,drag=false,previous=0,animated=!matchMedia('(prefers-reduced-motion: reduce)').matches;let w=0,h=0;const resize=()=>{let b=el.getBoundingClientRect();if(Math.abs(w-b.width)>1||Math.abs(h-b.height)>1){w=b.width;h=b.height;R.resize(w,h,Math.min(devicePixelRatio||1,2))}};el.addEventListener('pointerdown',e=>{drag=true;previous=e.clientX;el.setPointerCapture(e.pointerId)});el.addEventListener('pointermove',e=>{if(drag){yaw=Math.max(-.55,Math.min(.55,yaw+(e.clientX-previous)*.005));previous=e.clientX}});el.addEventListener('pointerup',()=>drag=false);el.addEventListener('pointercancel',()=>drag=false);
 let lastDraw=0;const tick=(t)=>{if(t-lastDraw>=(R.mode==='software'?240:33)){resize();const idle=animated?.085*Math.sin(t*.00053):0;R.render(scene,{eye:[0,.38,7.8],lookAt:[0,.05,0],fov:34,yaw:yaw+idle});lastDraw=t}if(activeHero===R)requestAnimationFrame(tick)};activeHero=R;resize();requestAnimationFrame(tick);el.dataset.status='ok';
 }catch(e){el.dataset.status='failed';console.error('Renderização 3D:',e)}}
async function buildPreviews(gifts){const photos=document.querySelectorAll('[data-product-render]');if(!photos.length)return;const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;let R;try{R=makeRenderer(canvas);R.resize(320,240,1)}catch(e){console.error(e);return}const mapped=new Map(gifts.map(x=>[x.id,x]));for(let i=0;i<photos.length;i++){const el=photos[i],g=mapped.get(el.dataset.productRender);if(!g)continue;let type=g.model,variant=g.variant||0;R.render(sceneProduct(type,variant),{eye:[1.7,1.3,4.0],lookAt:[0,0,0],fov:type==='crib'||type==='stroller'?40:33,yaw:-.2});el.src=canvas.toDataURL('image/png');el.alt='Modelo 3D de '+g.name; if(i%2===1)await new Promise(r=>requestAnimationFrame(r))}canvas.remove()}
function initAccent(id,scene,eye=[0,.6,6.9],fov=36){let c=document.getElementById(id);if(!c)return;try{const R=makeRenderer(c);const resize=()=>{let b=c.getBoundingClientRect();if(b.width<20||b.height<20)return;R.resize(b.width,b.height,Math.min(devicePixelRatio||1,1.7));R.render(scene,{eye,lookAt:[0,0,0],fov,yaw:-.13})};resize();new ResizeObserver(resize).observe(c);c.dataset.status='ok';}catch(err){console.error(err);c.dataset.status='failed'}}
window.Benicio3D={initHero,buildPreviews,heroScene,sceneProduct,initAccents(){initAccent('meeting3d',meetingScene(),[0,.65,6.7],39);initAccent('rsvp3d',rsvpScene(),[0,.4,6.8],35)}};
})();
