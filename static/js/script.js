const box = document.getElementById("chatbox");
let storeval = "";
async function getdatat() {
  let data;
  let attempts = 0;
  let yik = null;
  showTyping();
  while (true) {
    let response = await fetch("/data");
    data = await response.json();
    yik = data;
    hideTyping();

    console.log("Checking Flask variable:", data.gini);

    // Break the loop if x is updated
    if (data.gini !== "NUll") break;

    attempts++;
    if (attempts > 20) {
      // Stop checking after 10 tries (to avoid infinite loop)
      console.error("Timeout: x was not updated in Flask.");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before retrying
  }

  return data;
}
function showTyping() {
  const typingDiv = document.createElement("div");
  typingDiv.id = "typing-indicator";
  typingDiv.classList.add("message", "bot", "typing");
  typingDiv.textContent = "Typing...";
  typingDiv.style.color = "yellow";
  typingDiv.style.height = "25px";
  typingDiv.style.width = "70px";
  typingDiv.style.padding = "5px";
  typingDiv.style.borderRadius = "5px";
  typingDiv.style.backgroundColor = " rgb(33, 33, 33);";

  box.appendChild(typingDiv);
  box.scrollTop = box.scrollHeight;
}
function chatredirtect() {
  window.location.href = "/chat";
}

function hideTyping() {
  const typingDiv = document.getElementById("typing-indicator");
  if (typingDiv) typingDiv.remove();
}
function placegini(txt) {
  const para = document.createElement("p");
  let chatdiv = document.createElement("div");
  chatdiv.style.width = "95%";
  chatdiv.style.display="flex";
  chatdiv.style.flex="flex-start"
  chatdiv.style.marginLeft = "30px";
  chatdiv.style.width = "97%";
  para.style.position = "relative";
  para.style.color = "rgb(250, 233, 188)";
  para.style.fontFamily = "'Nunito";
  para.style.background="rgb(167, 167, 167,0.2)"
  para.style.padding="10px";
  para.style.borderRadius="50px";
  const ginitxt = document.createTextNode(txt);
  para.appendChild(ginitxt);
  chatdiv.appendChild(para);
  box.appendChild(chatdiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}
function sendData(inpdata) {
  let data = { message: `${inpdata}` };

  fetch("http://127.0.0.1:8080/receive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => console.log("Success:", data))
    .catch((error) => console.error("Error:", error));
}
async function place(tm = null) {
  const val = document.getElementById("inp");
  if (tm != null) {
    val.value = tm;
  }
  if (val.value == "") {
    return -1;
  }
  let chatbox = document.getElementById("chatbox");

  let userdiv = document.createElement("userdiv");

  const x = document.createElement("p");
  sendData(val.value);
  let y = document.createTextNode(val.value);
  x.appendChild(y);

  x.style.color = "white";
  x.style.fontFamily = "'Nunito";
  userdiv.style.width = "97%";
  userdiv.style.display = "flex";
  userdiv.style.alignItems = "flex-end";
  userdiv.style.justifyContent = "flex-end";
  x.style.backgroundColor = "rgba(255, 255, 255, 0.49)";
  x.style.padding="10px";
  x.style.borderRadius="50px"
  userdiv.appendChild(x);
  box.appendChild(userdiv);
  val.value = null;
  showTyping();
  y = await getdatat();
  // alert("here it is "+y["gini"]);
  placegini(y["gini"]);
  chatbox.scrollTop = chatbox.scrollHeight;
}
window.onload = function () {
  const chatbut = document.getElementById("chatbut");
  const sub = document.getElementById("sub");

  if (chatbut) {
    chatbut.addEventListener("click", chatredirtect);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        chatredirtect();
      }
    });
  }
  if (sub) {
    sub.addEventListener("click", place);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        place();
      }
    });
  }
};
