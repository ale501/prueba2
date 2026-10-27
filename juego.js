const COMANDOS={
  Linux:[
    ["grep","nano","chmod","top","df","apt","ip","tail"],
    ["du","chown","vi","htop","uname","head","lsblk","crontab","useradd","traceroute","iptables","systemctl","journalctl"],
    ["awk","sed","lsof","strace","rsync","dmesg","fdisk","ufw","visudo","tcpdump","modprobe","killall","umount","dpkg"]
  ],
  Windows:[
    ["ipconfig","notepad","copy","del","cls","tracert","tasklist","chkdsk"],
    ["findstr","netsh","attrib","taskmgr","mstsc","systeminfo","getmac","robocopy","regedit","gpupdate","msinfo32","xcopy","winver"],
    ["sfc","dism","bcdedit","wmic","diskpart","schtasks","gpresult","pathping","icacls","takeown","wevtutil","driverquery","powercfg","certutil"]
  ]
};
const PESOS=[[1],[0.3,0.7],[0,0.4,0.6],[0,0,1]];
const COL={Linux:"#ffb703",Windows:"#00d4ff"};
const $=id=>document.getElementById(id);
const cv=$("c"),g=cv.getContext("2d"),W=600,H=600,ZH=110;
const stars=Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+0.3,v:8+Math.random()*25}));
let hits=0,pts=0,lives=3,alive=true,paused=false,started=false,cur=null,prev="",choice=null,cx=300,flash=null,last=performance.now();
function nivel(){return hits<6?0:hits<14?1:hits<24?2:3}
function velocidad(){return Math.min(150+pts*0.3,480)}
function tierAleatorio(w){
  const r=Math.random();
  let acc=0;
  for(let i=0;i<w.length;i++){acc+=w[i];if(r<acc)return i}
  return w.length-1
}
function nuevo(){
  const sis=Math.random()<0.5?"Linux":"Windows";
  const tier=tierAleatorio(PESOS[nivel()]);
  const lista=COMANDOS[sis][tier];
  let t=lista[Math.floor(Math.random()*lista.length)];
  if(t===prev)t=lista[(lista.indexOf(t)+1)%lista.length];
  prev=t;
  cur={t,s:sis,y:20,v:tier+1};
  choice=null;
  cx=300;
  $("nivel").textContent="Nivel "+(nivel()+1)
}
function corazones(){
  $("hearts").innerHTML=[0,1,2].map(i=>'<span class="'+(i<lives?"":"off")+'">♥</span>').join("")
}
function elegir(z){if(started&&!paused&&alive)choice=z}
function pausar(p){
  if(!started||!alive)return;
  paused=p;
  $("pause").classList.toggle("show",p);
  $("pz").textContent=p?"▶":"⏸";
  last=performance.now()
}
function reiniciar(){
  hits=0;pts=0;lives=3;alive=true;paused=false;flash=null;prev="";
  nuevo();corazones();
  $("pause").classList.remove("show");
  $("over").classList.remove("show");
  $("pz").textContent="⏸";
  last=performance.now();
  publicar()
}
function resolver(){
  if(choice===cur.s){
    const antes=nivel();
    hits++;
    pts+=10*cur.v;
    flash=nivel()>antes?{c:"123,97,255",t:1,m:"¡Nivel "+(nivel()+1)+"!"}:{c:"61,220,151",t:1,m:"¡Bien!"}
  }else{
    lives--;
    corazones();
    flash={c:"255,77,109",t:1,m:"Era "+cur.s}
  }
  if(lives<=0){
    alive=false;
    $("final").textContent=pts;
    $("overtxt").textContent="Llegaste al nivel "+(nivel()+1)+" con "+hits+" aciertos.";
    $("over").classList.add("show")
  }else nuevo();
  publicar()
}
function tarjeta(txt,x,y,col){
  g.font="700 30px ui-monospace,Consolas,monospace";
  const w=g.measureText(txt).width+44,h=52;
  g.save();
  g.shadowColor=col;g.shadowBlur=24;
  g.fillStyle="#1d1a4d";g.strokeStyle=col;g.lineWidth=3;
  g.beginPath();g.roundRect(x-w/2,y,w,h,16);g.fill();g.stroke();
  g.restore();
  g.fillStyle="#fff";g.textAlign="center";g.textBaseline="middle";
  g.fillText(txt,x,y+h/2+1)
}
function zonas(){
  [["Linux",0,"#ffb703","#ff8a00","🐧"],["Windows",W/2,"#00d4ff","#2b7cff","🪟"]].forEach(([n,x,c1,c2,e])=>{
    const gr=g.createLinearGradient(0,H-ZH,0,H);
    gr.addColorStop(0,c1);gr.addColorStop(1,c2);
    g.fillStyle=gr;
    g.globalAlpha=choice===n?1:0.78;
    g.beginPath();g.roundRect(x+6,H-ZH,W/2-12,ZH-6,18);g.fill();
    g.globalAlpha=1;
    g.fillStyle="#10122b";g.textAlign="center";g.textBaseline="middle";
    g.font="800 30px system-ui,sans-serif";g.fillText(n,x+W/4,H-ZH/2-6);
    g.font="26px system-ui,sans-serif";g.fillText(e,x+W/4,H-ZH/2+26)
  })
}
function destello(dt){
  if(!flash)return;
  g.fillStyle="rgba("+flash.c+","+(flash.t*0.28)+")";
  g.fillRect(0,0,W,H);
  g.globalAlpha=Math.min(1,flash.t*1.5);
  g.fillStyle="#fff";g.font="800 40px system-ui,sans-serif";g.textAlign="center";
  g.fillText(flash.m,W/2,H/2-60-(1-flash.t)*30);
  g.globalAlpha=1;
  flash.t-=dt*1.6;
  if(flash.t<=0)flash=null
}
function cuadro(now){
  const dt=Math.min(0.05,(now-last)/1000);
  last=now;
  const corre=started&&!paused&&alive;
  if(corre){
    cur.y+=velocidad()*dt;
    const tx=choice==="Linux"?150:choice==="Windows"?450:300;
    cx+=(tx-cx)*Math.min(1,dt*12);
    if(cur.y>=H-ZH-30)resolver()
  }
  g.clearRect(0,0,W,H);
  g.fillStyle="#ffffff";
  stars.forEach(s=>{
    if(corre){s.y+=s.v*dt;if(s.y>H)s.y=0}
    g.globalAlpha=0.25+s.r/3;
    g.beginPath();g.arc(s.x,s.y,s.r,0,6.3);g.fill()
  });
  g.globalAlpha=1;
  zonas();
  tarjeta(cur.t,cx,cur.y,choice?COL[choice]:"#b9a7ff");
  destello(dt);
  requestAnimationFrame(cuadro)
}
addEventListener("keydown",e=>{
  if(e.target.tagName==="INPUT"&&e.key!=="Escape")return;
  if(e.key==="ArrowLeft"){elegir("Linux");e.preventDefault()}
  else if(e.key==="ArrowRight"){elegir("Windows");e.preventDefault()}
  else if(e.key==="p"||e.key==="P"||e.key==="Escape")pausar(!paused)
});
document.addEventListener("visibilitychange",()=>{if(document.hidden)pausar(true)});
$("bL").onclick=()=>elegir("Linux");
$("bW").onclick=()=>elegir("Windows");
$("pz").onclick=()=>pausar(!paused);
$("resume").onclick=()=>pausar(false);
$("rs1").onclick=reiniciar;
$("rs2").onclick=reiniciar;
const SALA="ale501-prueba2-linuxwin";
const nick=$("nick"),nick2=$("nick2"),estado=$("st");
let jugadores={},conexiones=[],anfitrion=null,soyAnfitrion=false,miId=null;
try{nick.value=localStorage.getItem("nick")||"";nick2.value=nick.value}catch(e){}
function mensaje(t){estado.textContent=t}
function yo(){return {nick:(nick.value||"Jugador").slice(0,14),score:pts,lives:Math.max(0,lives)}}
function publicar(){
  const m=yo();
  if(soyAnfitrion){jugadores[miId]=Object.assign({t:Date.now()},m);difundir()}
  else if(anfitrion&&anfitrion.open){anfitrion.send(Object.assign({type:"s"},m))}
}
function difundir(){
  const ahora=Date.now();
  for(const k in jugadores)if(k!==miId&&ahora-jugadores[k].t>8000)delete jugadores[k];
  const msg={type:"l",players:jugadores};
  conexiones.forEach(c=>{if(c.open)c.send(msg)});
  ranking()
}
function iniciarAnfitrion(){
  const p=new Peer(SALA);
  p.on("open",id=>{miId=id;soyAnfitrion=true;jugadores={};mensaje("Sala en vivo: eres el anfitrión");publicar()});
  p.on("connection",c=>{
    conexiones.push(c);
    c.on("data",d=>{
      if(d&&d.type==="s"){
        jugadores[c.peer]={nick:String(d.nick).slice(0,14),score:Number(d.score)||0,lives:Number(d.lives)||0,t:Date.now()};
        difundir()
      }
    });
    c.on("close",()=>{conexiones=conexiones.filter(x=>x!==c);delete jugadores[c.peer];difundir()})
  });
  p.on("error",e=>{
    try{p.destroy()}catch(x){}
    if(e.type==="unavailable-id")unirse();
    else{mensaje("Reintentando conexión…");setTimeout(iniciarAnfitrion,3000)}
  })
}
function unirse(){
  const c=new Peer();
  c.on("open",id=>{
    miId=id;soyAnfitrion=false;
    anfitrion=c.connect(SALA,{reliable:true});
    anfitrion.on("open",()=>{mensaje("Sala en vivo conectada");publicar()});
    anfitrion.on("data",d=>{if(d&&d.type==="l"){jugadores=d.players;ranking()}});
    anfitrion.on("close",()=>{
      mensaje("Reconectando…");
      anfitrion=null;
      try{c.destroy()}catch(x){}
      setTimeout(iniciarAnfitrion,500+Math.random()*2000)
    })
  });
  c.on("error",()=>{
    try{c.destroy()}catch(x){}
    anfitrion=null;
    setTimeout(iniciarAnfitrion,1000+Math.random()*1500)
  })
}
function ranking(){
  const ol=$("rank");
  ol.textContent="";
  const lista=Object.keys(jugadores).map(k=>[k,jugadores[k]]).sort((a,b)=>b[1].score-a[1].score);
  if(!lista.length){
    const li=document.createElement("li");
    li.textContent="Tú";
    ol.appendChild(li);
    return
  }
  lista.forEach(([k,p])=>{
    const li=document.createElement("li");
    if(k===miId)li.className="me";
    const a=document.createElement("span"),b=document.createElement("span"),sm=document.createElement("small");
    a.textContent=p.nick+(k===miId?" (tú)":"");
    sm.textContent=" · "+p.score;
    a.appendChild(sm);
    b.className="v";
    b.textContent=p.lives>0?"♥".repeat(p.lives):"💀";
    li.append(a,b);
    ol.appendChild(li)
  })
}
nick.addEventListener("input",()=>{try{localStorage.setItem("nick",nick.value)}catch(e){}publicar()});
$("go").onclick=()=>{
  nick.value=nick2.value.trim();
  try{localStorage.setItem("nick",nick.value)}catch(e){}
  $("inv").classList.remove("show");
  started=true;
  last=performance.now();
  publicar()
};
nick2.addEventListener("keydown",e=>{if(e.key==="Enter")$("go").click()});
nuevo();
corazones();
requestAnimationFrame(cuadro);
mensaje("Conectando a la sala…");
if(typeof Peer==="undefined")mensaje("No se pudo cargar la sala (modo solitario)");
else iniciarAnfitrion();
setInterval(publicar,1000);
