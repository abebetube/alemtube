console.log("🎬 AlemTube מתחיל...");


let playlist = [];
let currentIndex = 0;

const input = document.getElementById("searchInput");
const playerContainer = document.getElementById("player-container");
const resultsContainer = document.getElementById("results");

input.addEventListener("keydown", e => {
  if (e.key === "Enter") searchVideos();
});

async function searchVideos() {
  const q = input.value.trim();
  if (!q) return;

  playlist = [];
  currentIndex = 0;

   playerContainer.innerHTML = "";
  resultsContainer.innerHTML = "";
  
 

  try {
    const res = await fetch(`https://alemtube-v.onrender.com/search?q=${encodeURIComponent(q)}`);
   const data= data;
    playlist = data;

    if (!playlist.length) {
      alert("לא נמצאו תוצאות");
      return;
    }

    playVideo(0);
  } catch (e) {
    console.error("שגיאת חיפוש", e);
  }
}

function playVideo(index) {
  const v = playlist[index];
  if (!v) return;
  
  currentIndex = index;

playerContainer.innerHTML = `
    <iframe 
      src="https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1"
      allowfullscreen
      allow="autoplay">
    </iframe>
  `;

   resultsContainer.innerHTML = "";

  playlist.forEach((vid, i) => {
    if (i === index) return;

    const div = document.createElement("div");
    div.className = "video-item";
    div.onclick = () => playVideo(i);
    div.innerHTML = `
      <img src="${vid.thumb}">
      <div class="video-title">${vid.title}</div>
    `;
    results.appendChild(div);
  });
}

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("splash").style.display = "none", 3000);
});
