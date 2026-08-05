// const resultBox = document.getElementById("result-box");

// function showMessage() {
//   resultBox.textContent = `Дэлхийн хамгийн өндөр уул нь Эверэст бөгөөд өндөр нь 8848 метр.`;
// }

// let container = document.getElementById("container");

// function changeColor() {
//   container.style.color = "green";
// }
// function changeBig() {
//   container.style.fontSize = "50px";
// }
// function changeSmall() {
//   container.style.color = "black";
//   container.style.fontSize = "30px";
// }

// let textContainer= document.getElementById('text');

// textContainer.className += ' font-bold';

// let text = document.getElementById("container");

// function change() {
//   text.classList.add("bg-black");
// }

// function showInfo() {
//     let image= document.getElementById("myImage");
//     let info= document.getElementById("info");

//     let alt= image.getAttribute("alt");
//     info.innerHTML = `Tailbar: ${alt}`;
// }

// const img = document.getElementById("animal");
// const caption = document.getElementById("caption");

// function changeAnimal() {
//   const newScr = "/a1.jpg";
//   const newAlt = "Анааш";
//   const newText = "Энэ бол анааш";

//   img.setAttribute("src", newScr);
//   img.setAttribute("alt", newAlt);
//   caption.textContent = newText;
// }
// function reset(){

//     const newScr = "/CatObesity.jpg";
//     const newAlt = "Muur";
//     const newText = " ene bol muur"

//     img.setAttribute("src", newScr);
//   img.setAttribute("alt", newAlt);
//   caption.textContent = newText;
// }

// const themeTogglebutton = document.getElementById("theme-toggle");
// const headText = document.getElementById("head");
// const body = document.body;

// let tsag = 0;

// let container = document.getElementById("stopmatch");

// function container() {

// }
// set

let startTime = 0 ;
let elapsedTime = 0 ;
let totalMillisecond = 0;
let timerInterval;

let display = document.getElementById('time');
let startTimer = document.getElementById('startTimer');
let stopTimer = document.getElementById('stopTimer');
let resetTimer = document.getElementById('resetTimer');

function updateTime() {
  totalMillisecond = totalMillisecond+10;
  let minutes = Math.floor(totalMillisecond / 60000);
  let seconds = Math.floor((totalMillisecond % 60000) / 1000);
  let ms = Math.floor((totalMillisecond % 1000)/10);

  let m = minutes < 10 ? '0' + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;
  let d = ms < 10 ? "0" + ms : ms;

  display.innerHTML = m + ":" + s + ms;

}
function start() {
  if (timerInterval === null) {
    timerInterval = setInterval(updateTime, 10);
  }
}
function stop() {
  clearInterval(timerInterval);
  timerInterval = null;
}
function reset() {
  stop();
  totalMillisecond = 0;
  display.innerHTML = '00:00:00.00';
}
startTimer.addEventListener('click',start);
stopTimer.addEventListener('click',stop);
resetTimer.addEventListener('click',reset);