let heading = document.querySelector("#pageTitle");
let button = document.querySelector("button");
let firstmessege = document.querySelectorAll(".description");
let message = document.getElementById("message");
message.innerHTML = "<a> Tavtai moril !</a>";

let fact = document.querySelector("#fact");
fact.textContent = "aldaag (bug) oloh, zasah bol protsessig debug gej nerledeg";

const nameInputEl = document.getElementById("nameInput");
const name = nameInputEl.value;

function greetUser() {
  const name = document.getElementById("nameInput").value;
  const output = document.getElementById("outputText");

  output.textContent = `Sain uu , ${name}!`;
}



console.log("title", heading);

console.log(heading.textContent);
heading.textContent = "Sain bnu ta";

console.log("button", button);
console.log("description", firstmessege);
