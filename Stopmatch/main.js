let doli = 0;
let second = 0;
let minutes = 0;
let hours = 0;
let timerInterval = null;

let display = document.getElementById("timeDisplay");

function updateDisplay() {
  let h = hours < 10 ? "0" + hours : hours;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = second < 10 ? "0" + second : second;
  let d = doli < 10 ? "0" + doli : doli;
  display.innerText = h + ":" + m + ":" + s + "." + d;
}

function runTimer() {
  doli++;
  if (doli === 100) {
    doli = 0;
    second++;

    if (second === 60) {
      second = 0;
      minutes++;
    }
    if (minutes === 60) {
      minutes = 0;
      hours++;
    }
  }
  updateDisplay();
}

document.getElementById("startTimer").addEventListener("click", function () {
  if (timerInterval === null) {
    timerInterval = setInterval(runTimer, 10);
  }
});
document.getElementById("stopTimer").addEventListener("click", function () {
  clearInterval(timerInterval);
  timeInterval = null;
});
document.getElementById("resetTimer").addEventListener("click", function () {
  clearInterval(timeInterval);
  timerInterval = null;
  doli = 0;
  second = 0;
  minutes = 0;
  hours = 0;
  updateDisplay();
});
