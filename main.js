
let totalTime = 0;
let initialTotalTime = 0; // Для расчета процентов
let interval = null;
let isRunning = false;
let isFinished = false;

const display = document.getElementById("display");
const button = document.getElementById("mainBtn");
const progressCircle = document.getElementById("progressCircle");
const dotHandle = document.getElementById("dotHandle");
const fileInput = document.getElementById("fileInput");
const addMelodyBtn = document.getElementById("addMelodyBtn");

// Константа длины окружности для SVG (2 * PI * R)
// R=105 для десктопа, в CSS есть медиазапрос, JS тоже должен адаптироваться
let currentCircumference = 0;
let displayedRadius = 105;

let audio = new Audio();
let alarmTimeout = null;

let melodies = [
    {name:"Beep", file:"melodies/beep.mp3"},
    {name:"Alarm", file:"melodies/alarm.mp3"},
    {name:"Bell", file:"melodies/bell.mp3"}
];

// Функция адаптации параметров круга под размер экрана
function adaptCircleParams() {
    const svg = progressCircle.ownerSVGElement;
    if (!svg) return;

    currentCircumference = progressCircle.getTotalLength();
    const svgRect = svg.getBoundingClientRect();
    const svgScale = svgRect.height / 220;
    displayedRadius = progressCircle.r.baseVal.value * svgScale;

    resetCircleVisuals(); // Сбросить вид при ресайзе
}

// Инициализация и сброс визуализации круга
function resetCircleVisuals() {
    progressCircle.style.transition = 'stroke-dashoffset 1s linear';
    dotHandle.style.transition = 'transform 1s linear';

    progressCircle.style.strokeDasharray = currentCircumference;
    progressCircle.style.strokeDashoffset = currentCircumference;

    dotHandle.style.top = '50%';
    dotHandle.style.left = '50%';
    dotHandle.style.transform = `translate(-50%, -${displayedRadius}px) rotate(0deg)`;
}

window.addEventListener('resize', adaptCircleParams);
adaptCircleParams(); // Вызвать при загрузке


function createWheel(id, max, isMelody=false) {
    const el = document.getElementById(id);
    el.innerHTML = ''; // Очистка

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
            let i=Math.round(el.scrollTop/40); // Высота элемента 40px
            el.scrollTo({top:i*40,behavior:"smooth"});
        },100);
        updateActive(el);
    });
    updateActive(el);
}

// Инициализация колес (параметры из вашего первого файла)
createWheel("hours",23);
createWheel("minutes",59);
createWheel("seconds",59);
createWheel("melody",0,true);

function updateActive(el){
    let i=Math.round(el.scrollTop/40);
    [...el.children].forEach((c,index)=>{
        c.classList.toggle("active",index===i);
    });
}

function getValue(id){
    return Math.round(document.getElementById(id).scrollTop/40);
}

// Добавление своей мелодии
addMelodyBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        // Добавляем в список, сокращая имя
        melodies.push({name: file.name.substring(0, 8) + "..", file: url});
        createWheel("melody", 0, true); // Перерисовываем колесо мелодий
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
    initialTotalTime = totalTime; // Запоминаем старт

    if(totalTime<=0) return alert("Выбери время");

    isRunning=true;
    button.innerText="Отмена";

    interval=setInterval(()=>{
        totalTime--;
        updateDisplay();
        updateCircleProgress(); // Обновляем анимацию

        if(totalTime<=0){
            clearInterval(interval);
            totalTime = 0;
            updateDisplay();
            updateCircleProgress(true);
            finish();
        }
    },1000);
}

function updateDisplay(){
    let h=Math.floor(totalTime/3600);
    let m=Math.floor((totalTime%3600)/60);
    let s=totalTime%60;
    display.innerText = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// Самая важная часть: логика вращения точки и линии
function updateCircleProgress(immediate = false) {
    if (initialTotalTime <= 0) return;

    let progressRatio = (initialTotalTime - totalTime) / initialTotalTime;
    progressRatio = Math.min(Math.max(progressRatio, 0), 1);

    let offset = currentCircumference - (progressRatio * currentCircumference);

    if (immediate) {
        progressCircle.style.transition = 'none';
        dotHandle.style.transition = 'none';
    } else {
        progressCircle.style.transition = 'stroke-dashoffset 1s linear';
        dotHandle.style.transition = 'transform 1s linear';
    }

    progressCircle.style.strokeDashoffset = offset;
    dotHandle.style.transform = `translate(-50%, -${displayedRadius}px) rotate(${progressRatio * 360}deg)`;

    if (immediate) {
        requestAnimationFrame(() => {
            progressCircle.style.transition = 'stroke-dashoffset 1s linear';
            dotHandle.style.transition = 'transform 1s linear';
        });
    }
}

function finish(){
    isRunning=false;
    isFinished=true;
    button.innerText="Стоп";

    let melodyIndex=getValue("melody");
    if(melodies[melodyIndex]) {
        audio.src=melodies[melodyIndex].file;
        audio.loop=true;
        audio.play().catch(e=>console.log("Ошибка автоплея:", e));
    }

    updateCircleProgress(true);
    progressCircle.style.strokeDashoffset = 0;
    dotHandle.style.transform = `translate(-50%, -${displayedRadius}px) rotate(360deg)`;

    alarmTimeout=setTimeout(reset,60000); // Автосброс через минуту
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
    initialTotalTime = 0;

    display.innerText="00:00:00";
    button.innerText="Старт";

    resetCircleVisuals(); // Сброс круга

    // Сброс колес (по вашему первому файлу)
    ["hours","minutes","seconds","melody"].forEach(id=>{
        let el=document.getElementById(id);
        el.scrollTop=0;
        updateActive(el);
    });
}