const box = document.getElementById("chatbox");
const baname = document.getElementById("hd");
const vid = document.getElementById("vidr");
const valxx = document.getElementById("inpbox");
const nmic = document.getElementById("nmic");
let headcolour = "rgb(242, 255, 0)";
valxx.style.visibility = "hidden";
box.style.display = "flex";
box.style.justifyContent = "center";
box.style.alignItems = "center";
box.style.flexDirection = "column";

// Create elements
const indexhtmldiv = document.createElement("div");
const indexhtml = document.createElement("input");
const indexhtmlbutton = document.createElement("button");
// Create the first h1 element
const head = document.createElement("h1");
head.id = "head";
head.className = "head";
head.textContent = "M i n d - E a s e";

// Create the second h1 element
const head1 = document.createElement("h1");
head1.className = "head1";
head1.textContent = "Hi, there";

// Apply gradient styles to both
[head, head1].forEach((el) => {
  el.style.background = `linear-gradient(to right, ${headcolour}, rgb(255, 255, 255))`;
  el.style.webkitBackgroundClip = "text";
  el.style.webkitTextFillColor = "transparent";
});

// Font sizes
head.style.fontSize = "40px";
head1.style.fontSize = "20px";

// Append to body (or any other container)
box.appendChild(head);
box.appendChild(head1);
// Style the input
indexhtml.id = "indexinput";
indexhtml.placeholder = "Type...";
indexhtml.style.backgroundColor = " rgb(43, 41, 41,0.1)";
indexhtml.style.width = "300px";
indexhtml.style.height = "45px";
indexhtml.style.borderRadius = "20px";
indexhtml.style.border = "1px solid rgba(128, 128, 128, 0.138)";

indexhtml.style.outline = "none";
indexhtml.style.padding = "0 15px";
indexhtml.style.color = "rgb(255, 255, 255)";
indexhtml.style.fontSize = "16px";

const style = document.createElement("style");
style.textContent = `
  #indexinput::placeholder {
  color: rgba(255, 255, 255, 0.449);
}
`;
document.head.appendChild(style);
indexhtmldiv.appendChild(indexhtml);
box.appendChild(indexhtmldiv);
// Style the button
indexhtmlbutton.id = "batbox";
indexhtmlbutton.textContent = "Send";
indexhtmlbutton.style.marginLeft = "10px";
indexhtmlbutton.style.height = "45px";
indexhtmlbutton.style.borderRadius = "20px";
indexhtmlbutton.style.padding = "0 20px";
indexhtmlbutton.style.background = "rgba(255,255,255,0.1)";
indexhtmlbutton.style.border = "1px solid #ccc";
indexhtmlbutton.style.color = "#fff";
indexhtmlbutton.style.fontSize = "16px";
indexhtmlbutton.style.cursor = "pointer";

// Center everything
box.style.display = "flex";
box.style.justifyContent = "center";
box.style.alignItems = "center";
box.style.height = "80vh";

indexhtmldiv.style.display = "flex";
indexhtmldiv.style.alignItems = "center";

// Append to DOM
indexhtmldiv.append(indexhtml, indexhtmlbutton);
box.appendChild(indexhtmldiv);

function resetChatUI() {
  vid.disabled = false;
  // Remove the input box div
  valxx.style.visibility = "visible";
  place(indexhtml.value);
  box.removeChild(indexhtmldiv);
  box.removeChild(head);
  box.removeChild(head1);
  // Reset #chatbox to default style
  box.removeAttribute("style");

  // Reset #baname (or batbox?) to default style
  const nmic = document.getElementById("nmic");
  baname.removeAttribute("style");
  document.getElementById("inp").focus();
}

function recomd() {
  placegini("--Recommended video link---");
  placegini(`https://youtu.be/Ah2Zf1Vi77o?si=M18P_6DtdVjK71Ll`);
}
async function fetchRecording(event) {
  if (event) event.preventDefault(); // stop form from submitting

  try {
    const response = await fetch("/recording");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    let text = data.text; // corrected to access the inner text

    console.log("Cleaned Text:", text);
    place(text); // display it wherever you want
  } catch (error) {
    console.error("Failed to fetch recording:", error);
  }
}

function spritualtheme() {
  headcolour = "rgb(242, 255, 0)";
  head.textContent = "M I N D - E A S E";
  baname.innerHTML = "M I N D - E A S E";
  document.body.style.setProperty(
    "--bg-color",
    "linear-gradient(315deg, rgb(255, 202, 146) 3%, rgb(101, 101, 101) 38%, rgba(0, 0, 0, 0.46) 68%, rgb(255, 149, 0) 98%)"
  );
  document.body.style.setProperty("--bghd-color", "rgb(242, 255, 0)");

  [head, head1].forEach((el) => {
    el.style.background = `linear-gradient(to right, ${headcolour}, rgb(255, 255, 255))`;
    el.style.webkitBackgroundClip = "text";
    el.style.webkitTextFillColor = "transparent";
  });
}

function baymaxtheme() {
  headcolour = "rgb(255, 72, 72)";
  head.textContent = "B A Y M A X";
  baname.innerHTML = "B A Y M A X";
  baname.style.color = "#fff";
  document.body.style.setProperty(
    "--bg-color",
    "linear-gradient(315deg, rgb(227, 87, 87) 3%, rgb(255, 255, 255) 38%, rgba(0, 0, 0, 0.46) 68%, rgb(255, 64, 0) 98%)"
  );
  document.body.style.setProperty("--bghd-color", "rgb(255, 0, 0)");
  [head, head1].forEach((el) => {
    el.style.background = `linear-gradient(to right, ${headcolour}, rgb(255, 255, 255))`;
    el.style.webkitBackgroundClip = "text";
    el.style.webkitTextFillColor = "transparent";
  });
}

async function getdatat() {
  let attempts = 0;
  let data = null;
  showTyping();

  while (true) {
    let response = await fetch("/data");
    data = await response.json();
    console.log("Checking Flask variable:", data.gini);

    if (data.gini !== "NUll") {
      break;
    }

    attempts++;
    if (attempts > 20) {
      console.error("Timeout: x was not updated in Flask.");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  hideTyping();
  return data;
}

function showTyping() {
  if (document.getElementById("typing-indicator")) return; // Prevent duplicates

  const typingDiv = document.createElement("div");
  typingDiv.id = "typing-indicator";
  typingDiv.classList.add("message", "bot", "typing");
  typingDiv.textContent = "Typing...";
  typingDiv.style.color = "yellow";
  typingDiv.style.height = "25px";
  typingDiv.style.width = "70px";
  typingDiv.style.padding = "10px";
  typingDiv.style.borderRadius = "20px";
  typingDiv.style.backgroundColor = "rgb(177, 177, 177)";
  typingDiv.style.margin = "10px";
  typingDiv.style.marginLeft = "120px";

  box.appendChild(typingDiv);
  box.scrollTop = box.scrollHeight;
}

function hideTyping() {
  const typingDiv = document.getElementById("typing-indicator");
  if (typingDiv) typingDiv.remove();
}

function placegini(txt) {
  const para = document.createElement("p");
  const chatdiv = document.createElement("div");
  chatdiv.style.width = "80%";
  chatdiv.style.display = "flex";
  chatdiv.style.marginLeft = "130px";

  para.style.position = "relative";
  para.style.color = "rgb(250, 188, 188)";
  para.style.fontFamily = "Nunito";
  para.style.background = "rgba(79, 79, 79, 0.54)";
  para.style.padding = "10px";
  para.style.borderRadius = "20px";

  para.appendChild(document.createTextNode(txt));
  chatdiv.appendChild(para);
  box.appendChild(chatdiv);
  box.scrollTop = box.scrollHeight;
}

function sendData(inpdata) {
  const data = { message: inpdata };
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

  if (tm !== null) {
    val.value = tm;
  }

  if (val.value.trim() === "") {
    return;
  }

  const userdiv = document.createElement("div");
  const userMsg = document.createElement("p");
  userMsg.textContent = val.value;

  userMsg.style.color = "white";
  userMsg.style.fontFamily = "Nunito";
  userMsg.style.backgroundColor = "rgba(255, 255, 255, 0.49)";
  userMsg.style.padding = "10px";
  userMsg.style.borderRadius = "50px";

  userdiv.style.width = "97%";
  userdiv.style.display = "flex";
  userdiv.style.justifyContent = "flex-end";

  userdiv.appendChild(userMsg);
  box.appendChild(userdiv);

  sendData(val.value);
  val.value = "";

  showTyping();
  const y = await getdatat();
  placegini(y["gini"]);
  box.scrollTop = box.scrollHeight;
}

function chatredirtect() {
  window.location.href = "/chat";
}

window.onload = function () {
  spritualtheme();
  const batbox = document.getElementById("batbox");

  const baythm = document.getElementById("baymax");
  const sprtm = document.getElementById("spritual");
  const chatbut = document.getElementById("chatbut");
  const sub = document.getElementById("sub");
  const vid = document.getElementById("vidr");

  const videoButton = document.getElementById("getVideoButton");
  const videoContainer = document.getElementById("videoRecommendation");
  const clearBtn = document.getElementById("nchat");


  vid.disabled = true;
  if (batbox) {
    indexhtmlbutton.addEventListener("click", resetChatUI);

    function enterHandler(event) {
      if (event.key === "Enter") {
        resetChatUI();
        document.removeEventListener("keydown", enterHandler); // ✅ now it works
      }
    }

    document.addEventListener("keydown", enterHandler);
  }
  if (baythm) baythm.addEventListener("click", baymaxtheme);
  if (sprtm) sprtm.addEventListener("click", spritualtheme);
  if (chatbut) {
    chatbut.addEventListener("click", chatredirtect);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        chatredirtect();
      }
    });
  }

  if (vid) {
    // Make a fetch request to Flask endpoint
    vid.addEventListener("click", function () {
      videoContainer.innerHTML = `
        <div id="DEDE" style="margin-left: 150px;">
          <h5 class="loading-text">Analyzing your conversation...</h5>
        </div>
        <style>
          .loading-text {
            width: 300px;
            font-size: 12px;
            color: rgba(241, 0, 0, 0.58);
            background-color: rgba(199, 199, 199, 0.58);
          }
        </style>
      `;

      box.appendChild(videoContainer);

      fetch("/recommend")
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            const video = data.videos[0];
            const videoUrl = video.url;
            const videoTitle = video.title;

            videoContainer.innerHTML = `
              <div style="margin-left: 150px;">
                <iframe width="560" height="315" style="border-radius: 10px;"
                  src="https://www.youtube.com/embed/${videoUrl.split("v=")[1]}"
                  title="${videoTitle}" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
                <p><a href="${videoUrl}" target="_blank">Watch on YouTube</a></p>
              </div>
            `;
          } else {
            videoContainer.innerHTML = `<p>Error: ${data.message}</p>`;
          }
        })
        .catch((error) => {
          videoContainer.innerHTML = `<p>Error fetching video recommendations.</p>`;
          console.error("Error:", error);
        });
    });
  }
  if (nmic) {
    nmic.addEventListener("click", fetchRecording);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      fetch("/clear_conversation", {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            location.reload(); // Refresh the page
          } else {
            alert("Failed to clear conversation.");
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          alert("Something went wrong.");
        });
    });
  }

  if (sub) {
    sub.addEventListener("click", function (event) {
      event.preventDefault(); // Prevent the default behavior
      place(); // Call the function without the event object
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        place();
      }
    });
  }
};
