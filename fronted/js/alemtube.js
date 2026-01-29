let playlist = [];
let currentIndex = 0;
const BACKEND_URL = "https://YOUR_BACKEND_URL"; // <-- החלף ל-URL של ה-Backend שלך

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("splash").style.display = "none", 4000);
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); searchVideos(); }
});

async function searchVideos() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-container").innerHTML = "";

  try {
    // כאן אנחנו קוראים ל-backend במקום ל-YouTube ישירות
    const res = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data || data.length === 0) return alert("לא נמצאו סרטונים ניתנים לניגון");

    playlist = data;
    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
  } catch (e) {
    console.error("שגיאת חיפוש:", e);
  }
}

function playVideo(index) {
  const video = playlist[index];
  if (!video) return;

  document.getElementById("player-container").innerHTML =
    `<iframe id="ytplayer" src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1" allowfullscreen allow="autoplay"></iframe>`;

  setTimeout(() => document.getElementById("player-container").scrollIntoView({ behavior: "smooth" }), 500);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  playlist.forEach((v, i) => {
    if (i === index) return;
    const div = document.createElement("div");
    div.className = "video-item";
    div.onclick = () => { currentIndex = i; saveToCache(); playVideo(i); }
    div.innerHTML = `<img src="${v.thumb}" alt="${v.title}"><div class="video-title">${v.title}</div>`;
    resultsDiv.appendChild(div);
  });
}

function saveToCache() {
  localStorage.setItem("abe_playlist", JSON.stringify(playlist));
  localStorage.setItem("abe_index", currentIndex);
}

function loadFromCache() {
  const list = localStorage.getItem("abe_playlist");
  const idx = localStorage.getItem("abe_index");
  if (list && idx !==
