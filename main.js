
let totalTime = 0;
let interval = null;
let isRunning = false;
let isFinished = false;

const display = document.getElementById("display");
const button = document.getElementById("mainBtn");

let audio = new Audio();
let alarmTimeout = null;

const melodies = [
    {name:"Beep", file:"melodies/beep.mp3"},
    {name:"Alarm", file:"melodies/alarm.mp3"},
    {name:"Bell", file:"melodies/bell.mp3"}
];

// колесо
function createWheel(id, max, isMelody=false) {
    const el = document.getElementById(id);

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
            let i=Math.round(el.scrollTop/40);
            el.scrollTo({top:i*40,behavior:"smooth"});
        },100);

        updateActive(el);
    });

    updateActive(el);
}

createWheel("hours",23);
createWheel("minutes",59);
createWheel("seconds",59);
createWheel("melody",0,true);

// активный
function updateActive(el){
    let i=Math.round(el.scrollTop/40);
    [...el.children].forEach((c,index)=>{
        c.classList.toggle("active",index===i);
    });
}

// значение
function getValue(id){
    return Math.round(document.getElementById(id).scrollTop/40);
}

// кнопка
button.onclick=()=>{
    if(!isRunning && !isFinished){
        start();
        button.innerText="Остановить";
    }
    else if(isRunning){
        reset();
    }
    else if(isFinished){
        stopAlarm();
    }
};

// старт
function start(){
    let h=getValue("hours");
    let m=getValue("minutes");
    let s=getValue("seconds");

    totalTime=h*3600+m*60+s;
    if(totalTime<=0) return alert("Выбери время");

    isRunning=true;

    interval=setInterval(()=>{
        totalTime--;
        updateDisplay();

        if(totalTime<=0){
            clearInterval(interval);
            finish();
        }
    },1000);
}

// дисплей
function updateDisplay(){
    let h=Math.floor(totalTime/3600);
    let m=Math.floor((totalTime%3600)/60);
    let s=totalTime%60;

    display.innerText =
        `${String(h).padStart(2,"0")}:` +
        `${String(m).padStart(2,"0")}:` +
        `${String(s).padStart(2,"0")}`;
}

// конец
function finish(){
    isRunning=false;
    isFinished=true;

    button.innerText="Время вышло";

    let melodyIndex=getValue("melody");
    audio.src=melodies[melodyIndex].file;
    audio.loop=true;
    audio.play();

    alarmTimeout=setTimeout(reset,60000);
}

// стоп звук
function stopAlarm(){
    audio.pause();
    audio.currentTime=0;
    reset();
}

// сброс
function reset(){
    clearInterval(interval);
    clearTimeout(alarmTimeout);

    audio.pause();
    audio.currentTime=0;

    isRunning=false;
    isFinished=false;
    totalTime=0;

    display.innerText="00:00:00";
    button.innerText="Старт";

    ["hours","minutes","seconds","melody"].forEach(id=>{
        let el=document.getElementById(id);
        el.scrollTop=0;
        updateActive(el);
    });
}


if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then(() => console.log("SW зарегистрирован"));
}