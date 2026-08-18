const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

const defaultState={
  expression:"", result:"0", memory:0, history:[], xp:0, calculations:0,
  achievements:[], theme:"dark", sound:false, animation:true, vibration:false, decimals:"auto", base:10
};
let state={...defaultState,...JSON.parse(localStorage.getItem("cubesKnightState")||"{}")};
let waitingForOperand=false, currentBase=state.base||10;

const levels=[
 ["Novice Knight",0],["Cube Apprentice",100],["Cube Warrior",250],["Crystal Knight",500],
 ["Shadow Knight",800],["Royal Knight",1200],["Legendary Cube Knight",1700],
 ["Master of Numbers",2300],["Grand Cube Sage",3000],["Cubes Legend",4000]
];
const achievements=[
 ["first","FIRST CALCULATION","Melakukan perhitungan pertama."],
 ["speed","SPEED KNIGHT","Melakukan 10 perhitungan."],
 ["warrior","MATH WARRIOR","Melakukan 100 perhitungan."],
 ["science","SCIENCE KNIGHT","Menggunakan scientific calculator."],
 ["master","CUBE MASTER","Mencapai Level 10."]
];

const conversions={
 length:{m:1,km:1000,cm:.01,mm:.001,ft:.3048,inch:.0254},
 weight:{kg:1,g:.001,mg:.000001,lb:.453592},
 temperature:null,
 area:{m2:1,km2:1e6,cm2:.0001,ft2:.092903},
 volume:{l:1,ml:.001,m3:1000,gal:3.78541},
 time:{s:1,min:60,h:3600,day:86400},
 speed:{ms:1,kph:.277778,mph:.44704,knot:.514444},
 data:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776},
 energy:{J:1,kJ:1000,Wh:3600,kWh:3600000}
};

function save(){localStorage.setItem("cubesKnightState",JSON.stringify(state))}
function format(n){
  if(typeof n!=="number") n=Number(n);
  if(!Number.isFinite(n)) return "ERROR";
  if(state.decimals!=="auto") n=Number(n.toFixed(Number(state.decimals)));
  if(Math.abs(n)>=1e15||Math.abs(n)<1e-9&&n!==0) return n.toExponential(8);
  return new Intl.NumberFormat("en-US",{maximumFractionDigits:12}).format(n);
}
function rawNumber(){
  const x=Number(state.result);
  return Number.isFinite(x)?x:0;
}
function updateDisplay(){
  $("#expression").textContent=state.expression||"0";
  $("#result").textContent=state.result;
  $("#memoryIndicator").textContent=state.memory!==0?`MEMORY: ${format(state.memory)}`:"";
  $("#calcCount").textContent=state.calculations;
  updateLevel();
  save();
}
function updateLevel(){
  let lvl=1;
  for(let i=0;i<levels.length;i++) if(state.xp>=levels[i][1]) lvl=i+1;
  const idx=Math.min(lvl-1,levels.length-1), base=levels[idx][1], next=levels[idx+1]?.[1]??base+1000;
  const pct=idx===levels.length-1?100:Math.max(0,Math.min(100,(state.xp-base)/(next-base)*100));
  $("#levelText").textContent=`LEVEL ${String(lvl).padStart(2,"0")}`;
  $("#levelName").textContent=levels[idx][0];
  $("#xpBar").style.width=pct+"%";
  $("#xpText").textContent=idx===levels.length-1?`${state.xp} XP — MAX`:`${state.xp-base} / ${next-base} XP`;
  $("#achievementCount").textContent=state.achievements.length;
}
function toast(html){
  const el=document.createElement("div");el.className="toast";el.innerHTML=html;
  $("#toastContainer").append(el);setTimeout(()=>el.remove(),2600);
}
let audioCtx;
function beep(freq=500,duration=.06){
  if(!state.sound)return;
  audioCtx??=new (window.AudioContext||window.webkitAudioContext)();
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.frequency.value=freq;o.type="sine";g.gain.value=.035;o.connect(g);g.connect(audioCtx.destination);o.start();
  g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+duration);o.stop(audioCtx.currentTime+duration);
}
function vibration(){if(state.vibration&&navigator.vibrate)navigator.vibrate(12)}
function setMessage(msg,error=false){
  $("#knightMessage").textContent=msg;$("#knightMessage").classList.toggle("error",error);
}
function addXP(n=10){
  const old=levels.reduce((a,v,i)=>state.xp>=v[1]?i:a,0);
  state.xp+=n;
  const now=levels.reduce((a,v,i)=>state.xp>=v[1]?i:a,0);
  toast(`⚔ <strong>Calculation Complete!</strong> +${n} XP`);
  if(now>old){$("#knight").classList.add("levelup");setTimeout(()=>$("#knight").classList.remove("levelup"),800);setMessage("LEVEL UP!");beep(880,.25)}
}
function unlock(id){
  if(state.achievements.includes(id))return;
  state.achievements.push(id);const a=achievements.find(x=>x[0]===id);
  toast(`🏆 <strong>${a[1]}</strong> unlocked!`);beep(950,.2);save();
}
function record(expr,res){
  state.history.unshift({expr,res,time:new Date().toLocaleString("id-ID")});
  state.history=state.history.slice(0,50);
  state.calculations++;addXP(10);
  if(state.calculations>=1)unlock("first");
  if(state.calculations>=10)unlock("speed");
  if(state.calculations>=100)unlock("warrior");
}
function sanitizeExpression(s){
  return s.replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/,/g,"");
}
function calculate(expr){
  let s=sanitizeExpression(expr).replace(/%/g,"/100");
  if(!/^[0-9+\-*/().\s]+$/.test(s))throw Error("Invalid expression");
  if(/\/\s*0(?:\D|$)/.test(s))throw Error("Division by zero");
  // Safe expression parser using Function only after strict character validation.
  const value=Function(`"use strict";return (${s})`)();
  if(!Number.isFinite(value))throw Error("Result overflow");
  return value;
}
function inputDigit(d){
  if(waitingForOperand){state.result="0";state.expression="";waitingForOperand=false}
  if(d==="." && state.result.includes("."))return;
  if(state.result==="0"&&d!==".")state.result=d;else state.result+=d;
  state.expression=state.result;updateDisplay();beep(420);vibration();
}
function inputOperator(op){
  if(state.expression && /[+\-*/]$/.test(sanitizeExpression(state.expression))){
    state.expression=state.expression.slice(0,-1)+op;
  }else{
    state.expression=(state.expression||state.result)+op;
  }
  waitingForOperand=true;updateDisplay();beep(540);vibration();
}
function clearAll(){state.expression="";state.result="0";waitingForOperand=false;updateDisplay();beep(280)}
function backspace(){
  if(waitingForOperand)return;
  state.result=state.result.length>1?state.result.slice(0,-1):"0";
  state.expression=state.result;updateDisplay();
}
function toggleSign(){state.result=String(-rawNumber());state.expression=state.result;updateDisplay()}
function percent(){state.result=String(rawNumber()/100);state.expression=state.result;updateDisplay()}
function equal(){
  if(!state.expression)return;
  try{
    const expr=state.expression;
    const value=calculate(expr);
    state.result=String(value);record(expr,format(value));state.expression=`${expr} =`;
    waitingForOperand=true;setMessage("Calculation ready!");beep(760,.12);vibration();updateDisplay();
  }catch(e){state.result="ERROR";state.expression="INVALID MOVE";waitingForOperand=true;setMessage(e.message==="Division by zero"?"Impossible move!":"Oops! Check your equation.",true);beep(150,.2);updateDisplay()}
}
function scientific(type){
  let x=rawNumber(),v;
  try{
    switch(type){
      case"sin":v=Math.sin(x*Math.PI/180);break;case"cos":v=Math.cos(x*Math.PI/180);break;case"tan":v=Math.tan(x*Math.PI/180);break;
      case"asin":v=Math.asin(x)*180/Math.PI;break;case"acos":v=Math.acos(x)*180/Math.PI;break;case"atan":v=Math.atan(x)*180/Math.PI;break;
      case"sqrt":v=Math.sqrt(x);break;case"square":v=x*x;break;case"inverse":v=1/x;break;case"log":v=Math.log10(x);break;case"ln":v=Math.log(x);break;
      case"exp":v=Math.exp(x);break;case"tenpow":v=10**x;break;case"factorial":v=factorial(x);break;case"abs":v=Math.abs(x);break;case"random":v=Math.random();break;
      case"power":state.expression=`${x}**`;waitingForOperand=true;updateDisplay();return;
    }
    if(!Number.isFinite(v))throw Error("Invalid math function");
    const expr=`${type}(${format(x)})`;state.result=String(v);state.expression=`${expr} =`;record(expr,format(v));waitingForOperand=true;unlock("science");updateDisplay();beep(820,.12);
  }catch(e){state.result="ERROR";state.expression="INVALID MOVE";setMessage("Oops! Check your equation.",true);updateDisplay()}
}
function factorial(n){if(!Number.isInteger(n)||n<0||n>170)throw Error("Invalid factorial");let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function constant(type){const v=type==="pi"?Math.PI:type==="e"?Math.E:(1+Math.sqrt(5))/2;state.result=String(v);state.expression=String(v);waitingForOperand=false;updateDisplay()}
function memory(action){
  const x=rawNumber();
  if(action==="mc")state.memory=0;if(action==="mr"){state.result=String(state.memory);state.expression=state.result}
  if(action==="mplus")state.memory+=x;if(action==="mminus")state.memory-=x;if(action==="ms")state.memory=x;
  updateDisplay();beep(620)
}
function showModal(id){$("#"+id).classList.add("show")}
function closeModal(id){$("#"+id).classList.remove("show")}
function renderHistory(){
  const box=$("#historyList");box.innerHTML="";
  if(!state.history.length){box.innerHTML="<p style='color:var(--muted)'>Belum ada history.</p>";return}
  state.history.forEach((h,i)=>{
    const el=document.createElement("div");el.className="history-item";
    el.innerHTML=`<div><small>${h.time}</small><br><strong>${escapeHtml(h.expr)}</strong> = ${escapeHtml(h.res)}</div><button title="Gunakan hasil">↩</button>`;
    el.querySelector("button").onclick=()=>{state.result=h.res.replace(/,/g,"");state.expression=state.result;waitingForOperand=false;updateDisplay();closeModal("historyModal")};
    box.append(el);
  })
}
function renderAchievements(){
  $("#achievementList").innerHTML=achievements.map(a=>`<div class="achievement-item ${state.achievements.includes(a[0])?"":"locked"}"><div>🏆 <strong>${a[1]}</strong><small>${a[2]}</small></div><span>${state.achievements.includes(a[0])?"✓":"🔒"}</span></div>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

function switchMode(mode){
  $("#scientificPanel").classList.toggle("hidden",mode!=="scientific");
  $("#programmerPanel").classList.toggle("hidden",mode!=="programmer");
  $("#converterPanel").classList.toggle("hidden",mode!=="converter");
  if(mode==="scientific")unlock("science");
}
function setupConverter(){
  const cat=$("#converterCategory").value, list=cat==="temperature"?["C","F","K"]:Object.keys(conversions[cat]);
  $("#converterFrom").innerHTML=list.map(x=>`<option>${x}</option>`).join("");
  $("#converterTo").innerHTML=list.map(x=>`<option>${x}</option>`).join("");
  convert();
}
function convert(){
  const cat=$("#converterCategory").value,x=Number($("#converterInput").value)||0,from=$("#converterFrom").value,to=$("#converterTo").value;let out;
  if(cat==="temperature"){
    let c=from==="C"?x:from==="F"?(x-32)*5/9:x-273.15;out=to==="C"?c:to==="F"?c*9/5+32:c+273.15;
  }else{out=x*conversions[cat][from]/conversions[cat][to]}
  $("#converterOutput").textContent=format(out);
}
function programmerAction(type){
  let a=BigInt(Math.trunc(rawNumber())),v;
  try{
    if(type==="not")v=~a;if(type==="shl")v=a<<1n;if(type==="shr")v=a>>1n;
    if(["and","or","xor"].includes(type)){
      const b=BigInt(prompt(`Masukkan angka untuk ${type.toUpperCase()}:`));
      v=type==="and"?a&b:type==="or"?a|b:a^b;
    }
    state.result=String(v);state.expression=`${type.toUpperCase()}(${a})`;updateDisplay();$("#programmerValue").textContent=String(v);
  }catch(e){setMessage("Invalid programmer value",true)}
}
function updateProgrammer(){const n=BigInt(Math.trunc(rawNumber()));const b=currentBase;$("#programmerValue").textContent=n.toString(b).toUpperCase()}
function applySettings(){
  document.body.classList.toggle("light",state.theme==="light");
  $("#themeBtn").textContent=state.theme==="dark"?"🌙":"☀️";$("#soundBtn").textContent=state.sound?"🔊":"🔇";
  $("#themeSetting").textContent=state.theme==="dark"?"Dark":"Light";$("#soundSetting").textContent=state.sound?"ON":"OFF";
  $("#animationSetting").textContent=state.animation?"ON":"OFF";$("#vibrationSetting").textContent=state.vibration?"ON":"OFF";
  $("#decimalSetting").value=state.decimals;
}
function particles(){
  for(let i=0;i<28;i++){const p=document.createElement("i");p.className="particle";p.style.left=Math.random()*100+"%";p.style.animationDelay=-Math.random()*7+"s";p.style.animationDuration=4+Math.random()*7+"s";$("#particles").append(p)}
}

$("#keypad").addEventListener("click",e=>{
  const k=e.target.closest("[data-key]")?.dataset.key;if(!k)return;
  if(k==="AC")return clearAll();if(k==="=")return equal();if(k==="percent")return percent();if(k==="sign")return toggleSign();
  if(["+","-","*","/"].includes(k))return inputOperator(k);inputDigit(k);
});
$("#backspaceBtn").onclick=backspace;
$$("[data-action]").forEach(b=>b.onclick=()=>memory(b.dataset.action));
$$("[data-scientific]").forEach(b=>b.onclick=()=>scientific(b.dataset.scientific));
$$("[data-constant]").forEach(b=>b.onclick=()=>constant(b.dataset.constant));
$("#modeSelect").onchange=e=>switchMode(e.target.value);
$("#historyBtn").onclick=()=>{renderHistory();showModal("historyModal")};
$("#achievementBtn").onclick=()=>{renderAchievements();showModal("achievementModal")};
$$("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
$("#clearHistory").onclick=()=>{state.history=[];save();renderHistory()};
$("#settingsBtn").onclick=()=>showModal("settingsModal");
$("#themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";applySettings();save()};
$("#soundBtn").onclick=()=>{state.sound=!state.sound;applySettings();save()};
$("#themeSetting").onclick=()=>{$("#themeBtn").click()};
$("#soundSetting").onclick=()=>{$("#soundBtn").click()};
$("#animationSetting").onclick=()=>{state.animation=!state.animation;applySettings();save()};
$("#vibrationSetting").onclick=()=>{state.vibration=!state.vibration;applySettings();save()};
$("#decimalSetting").onchange=e=>{state.decimals=e.target.value;applySettings();updateDisplay()};
$("#resetData").onclick=()=>{if(confirm("Reset semua data kalkulator?")){state={...defaultState};save();location.reload()}};
$("#converterCategory").onchange=setupConverter;$("#converterInput").oninput=convert;$("#converterFrom").onchange=convert;$("#converterTo").onchange=convert;
$$("[data-base]").forEach(b=>b.onclick=()=>{currentBase=Number(b.dataset.base);$$("[data-base]").forEach(x=>x.classList.remove("active"));b.classList.add("active");updateProgrammer()});
$$("[data-bit]").forEach(b=>b.onclick=()=>programmerAction(b.dataset.bit));

document.addEventListener("keydown",e=>{
  if(e.target.matches("input,select"))return;
  const k=e.key;
  if(/[0-9]/.test(k)||k==="."){inputDigit(k);e.preventDefault()}
  else if(["+","-","*","/"].includes(k)){inputOperator(k);e.preventDefault()}
  else if(k==="Enter"||k==="="){equal();e.preventDefault()}
  else if(k==="Escape"){clearAll();e.preventDefault()}
  else if(k==="Backspace"){backspace();e.preventDefault()}
  else if(k==="%"){percent();e.preventDefault()}
});
particles();applySettings();setupConverter();updateDisplay();
