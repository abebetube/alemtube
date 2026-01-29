console.log("🎬 AlemTube מתחיל...");

let playlist = [];
let currentIndex = 0;

/* =====================
   INIT
===================== */
window.addEventListener("load", () => {
  loadFromCache();

  // splash + fireworks
  const splash = document.getElementById("splash");
  let count = 0;
  const interval = setInterval(() => {
    launchFireworks();
    count++;
    if (count >= 4) clearInterval(interval);
  }, 700);

  setTimeout(() => {
    splash.style.display = "none";
  }, 4000);
});

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchVideos();
  }
});

/* =====================
   SEARCH (via Backend)
===================== */
async function searchVideos() {
  const query = searchInput.value.trim();
  if (!query) return;

  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-container").innerHTML = "";

  try {
    const res = await fetch(
      `https://alemtube-v.onrender.com/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) {
      throw new Error("שגיאת שרת");
    }

    const data = await res.json();
    playlist = data;

    if (!playlist.length) {
      alert("לא נמצאו סרטונים");
      return;
    }

    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);

  } catch (err) {
    console.error("שגיאת חיפוש:", err);
    alert("שגיאה בחיפוש (בדוק Backend / מכסת API)");
  }
}

/* =====================
   PLAYER
===================== */
function playVideo(index) {
  const video = playlist[index];
  if (!video) return;

  document.getElementById("player-container").innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1"
      allow="autoplay; fullscreen"
      allowfullscreen>
    </iframe>
  `;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  playlist.forEach((v, i) => {
    if (i === index) return;

    const div = document.createElement("div");
    div.className = "video-item";
    div.onclick = () => {
      currentIndex = i;
      saveToCache();
      playVideo(i);
    };

    div.innerHTML = `
      <img src="${v.thumb}" alt="${v.title}">
      <div class="video-title">${v.title}</div>
    `;

    resultsDiv.appendChild(div);
  });
}

/* =====================
   CACHE
===================== */
function saveToCache() {
  localStorage.setItem("abe_playlist", JSON.stringify(playlist));
  localStorage.setItem("abe_index", currentIndex);
}

function loadFromCache() {
  const list = localStorage.getItem("abe_playlist");
  const idx = localStorage.getItem("abe_index");

  if (list && idx !== null) {
    playlist = JSON.parse(list);
    currentIndex = parseInt(idx, 10);
    playVideo(currentIndex);
  }
}

/* =====================
   FIREWORKS
===================== */
function launchFireworks(count = 5) {
  const container = document.querySelector(".fireworks");
  if (!container) return;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    for (let j = 0; j < 30; j++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
      container.appendChild(particle);
      setTimeout(() => particle.remove(), 1500);
    }
  }
}
