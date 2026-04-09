
const ITEM_HEIGHT = 55;

let totalTime = 0;
let initialTotalTime = 0;
let interval = null;
let isRunning = false;
let isFinished = false;

const display = document.getElementById("display");
const button = document.getElementById("mainBtn");
const progressCircle = document.getElementById("progressCircle");
const dotHandle = document.getElementById("dotHandle");
const fileInput = document.getElementById("fileInput");
const addMelodyBtn = document.getElementById("addMelodyBtn");

let currentCircumference = 0;
let displayedRadius = 105;

let audio = new Audio();
let alarmTimeout = null;

let melodies = [
    {name:"Beep", file:"melodies/beep.mp3"},
    {name:"Alarm", file:"melodies/alarm.mp3"},
    {name:"Bell", file:"melodies/bell.mp3"}
];

function adaptCircleParams() {
    currentCircumference = progressCircle.getTotalLength();

    progressCircle.style.strokeDasharray = currentCircumference;
    progressCircle.style.strokeDashoffset = currentCircumference;

    resetCircleVisuals();
}

function resetCircleVisuals() {
    progressCircle.style.strokeDashoffset = currentCircumference;
    dotHandle.style.transform = `translate(-50%, -105px) rotate(0deg)`;
}

window.addEventListener('resize', adaptCircleParams);
adaptCircleParams();

function createWheel(id, max, isMelody=false) {
    const el = document.getElementById(id);
    el.innerHTML = '';

    if(isMelody){
        melodies.forEach(m=>{
            let d=document.createElement("div");
            d.innerText=m.name;
            el.appendChild(d);
        });
    } else {
        for(let i=0;i<=max;i++){
            let d=document.createElement("div");
            d.innerText=String(i).padStart(2,"0");
            el.appendChild(d);
        }
    }

    el.addEventListener("scroll", ()=>{
        clearTimeout(el.t);
        el.t=setTimeout(()=>{
            let i=Math.round(el.scrollTop/ITEM_HEIGHT);
            el.scrollTo({top:i*ITEM_HEIGHT,behavior:"smooth"});
        },100);

        updateActive(el);
    });

    el.scrollTop = 0;
    updateActive(el);
}

createWheel("hours",23);
createWheel("minutes",59);
createWheel("seconds",59);
createWheel("melody",0,true);

function updateActive(el){
    let i=Math.round(el.scrollTop/ITEM_HEIGHT);
    [...el.children].forEach((c,index)=>{
        c.classList.toggle("active",index===i);
    });
}

function getValue(id){
    return Math.round(document.getElementById(id).scrollTop/ITEM_HEIGHT);
}

addMelodyBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        melodies.push({name: file.name.substring(0, 8) + "..", file: url});
        createWheel("melody", 0, true);
        alert("Мелодия добавлена!");
    }
};

button.onclick=()=>{
    if(!isRunning && !isFinished){
        start();
    }
    else if(isRunning){
        reset();
    }
    else if(isFinished){
        stopAlarm();
    }
};

function start(){
    let h=getValue("hours");
    let m=getValue("minutes");
    let s=getValue("seconds");

    totalTime=h*3600+m*60+s;
    initialTotalTime = totalTime;

    if(totalTime<=0) return alert("Выбери время");

    isRunning=true;
    button.innerText="Отмена";

    interval=setInterval(()=>{
        totalTime--;
        updateDisplay();
        updateCircleProgress();

        if(totalTime<=0){
            clearInterval(interval);
            finish();
        }
    },1000);
}

function updateDisplay(){
    let h=Math.floor(totalTime/3600);
    let m=Math.floor((totalTime%3600)/60);
    let s=totalTime%60;

    display.innerText =
        `${String(h).padStart(2,"0")}:` +
        `${String(m).padStart(2,"0")}:` +
        `${String(s).padStart(2,"0")}`;
}

function updateCircleProgress(immediate = false) {
    if (initialTotalTime <= 0) return;

    let progressRatio = (initialTotalTime - totalTime) / initialTotalTime;

    let offset = currentCircumference - (progressRatio * currentCircumference);

    progressCircle.style.strokeDashoffset = offset;

    dotHandle.style.transform =
        `translate(-50%, -105px) rotate(${progressRatio * 360}deg)`;
}

function finish(){
    isRunning=false;
    isFinished=true;
    button.innerText="Стоп";

    let melodyIndex=getValue("melody");

    if(melodies[melodyIndex]) {
        audio.src=melodies[melodyIndex].file;
        audio.loop=true;
        audio.play().catch(()=>{});
    }

    alarmTimeout=setTimeout(reset,90000);
}

function stopAlarm(){
    reset();
}

function reset(){
    clearInterval(interval);
    clearTimeout(alarmTimeout);

    audio.pause();
    audio.currentTime=0;

    isRunning=false;
    isFinished=false;
    totalTime=0;
    initialTotalTime=0;

    display.innerText="00:00:00";
    button.innerText="Старт";

    resetCircleVisuals();

    ["hours","minutes","seconds","melody"].forEach(id=>{
        let el=document.getElementById(id);
        el.scrollTop=0;
        updateActive(el);
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}