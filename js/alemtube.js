// הגדרת כתובת השרת
const SERVER_URL = window.location.origin; // או כתובת ספציפית אם השרת במקום אחר

let playlist = [];
let currentIndex = 0;

// טעינת האתר
window.addEventListener("load", () => {
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
  
  loadFromCache();
});

// אירועי מקלדת לחיפוש
document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchVideos();
  }
});

// חיפוש סרטונים
async function searchVideos() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  playlist = [];
  currentIndex = 0;
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-container").innerHTML = "";

  const isURL = query.includes("youtube.com") || query.includes("youtu.be");
  if (isURL) {
    const match = query.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    const videoId = match ? match[1] : "";
    if (videoId && await checkEmbeddable(videoId)) {
      playlist = [{ videoId, title: "סרטון שהוזן", thumb: "" }];
      currentIndex = 0;
      saveToCache();
      playVideo(currentIndex);
    }
    return;
  }

  try {
    // שימוש בשרת כמתווך
    const response = await fetch(`${SERVER_URL}/search?q=${encodeURIComponent(query)}`);
    const videos = await response.json();

    if (!response.ok) {
      throw new Error(videos.error || "שגיאה בחיפוש");
    }

    // בדיקת סרטונים ניתנים להטמעה
    for (const video of videos) {
      if (await checkEmbeddable(video.videoId)) {
        playlist.push({
          videoId: video.videoId,
          title: video.title,
          thumb: video.thumb,
        });
      }
    }

    if (playlist.length === 0) {
      return alert("לא נמצאו סרטונים ניתנים לניגון");
    }

    currentIndex = 0;
    saveToCache();
    playVideo(currentIndex);
  } catch (e) {
    console.error("שגיאת חיפוש:", e);
    alert("אירעה שגיאה בחיפוש. נסה שוב.");
  }
}

// ניגון סרטון
function playVideo(index) {
  const video = playlist[index];
  if (!video) return;

  document.getElementById("player-container").innerHTML =
    `<iframe id="ytplayer" src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1" allowfullscreen allow="autoplay"></iframe>`;

  setTimeout(() => {
    document.getElementById("player-container").scrollIntoView({ behavior: "smooth" });
  }, 500);

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
    div.innerHTML = `<img src="${v.thumb}" alt="${v.title}"><div class="video-title">${v.title}</div>`;
    resultsDiv.appendChild(div);
  });

  setTimeout(() => setupPlayerEvents(), 1000);
}

// הגדרת אירועי נגן YouTube
function setupPlayerEvents() {
  if (typeof YT === "undefined" || typeof YT.Player === "undefined") return;
  
  new YT.Player("ytplayer", {
    events: {
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED && currentIndex + 1 < playlist.length) {
          currentIndex++;
          saveToCache();
          playVideo(currentIndex);
        }
      },
    },
  });
}

// בדיקת אפשרות הטמעה דרך השרת
async function checkEmbeddable(id) {
  try {
    const response = await fetch(`${SERVER_URL}/check-embeddable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId: id })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("שגיאה בבדיקת הטמעה:", data.error);
      return false;
    }

    return data.embeddable;
  } catch (error) {
    console.error("שגיאה בבדיקת הטמעה:", error);
    return false;
  }
}

// טיפול בפרסומות
document.addEventListener('DOMContentLoaded', () => {
  const ads = document.querySelectorAll('.ad, .ads, .advertisement');
  ads.forEach(ad => ad.style.display = 'none');
});

function skipAds() {
  const adElements = document.querySelectorAll('.ad, .advertisement, #ad-container');
  adElements.forEach(el => {
    el.style.display = 'none';
  });

  const skipButton = document.querySelector('.skip-ad, .skip-button');
  if (skipButton) {
    skipButton.click();
  }
}

setInterval(skipAds, 3000);

// ניהול מטמון
function saveToCache() {
  localStorage.setItem("abe_playlist", JSON.stringify(playlist));
  localStorage.setItem("abe_index", currentIndex);
}

function loadFromCache() {
  const list = localStorage.getItem("abe_playlist");
  const idx = localStorage.getItem("abe_index");
  if (list && idx !== null) {
    playlist = JSON.parse(list);
    currentIndex = parseInt(idx);
    playVideo(currentIndex);
  }
}

// אפקט זיקוקים
function launchFireworks(count = 5) {
  const container = document.querySelector('.fireworks');

  for (let i = 0; i < count; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    for (let j = 0; j < 30; j++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      const angle = (Math.PI * 2 * j) / 30;
      const distance = 80 + Math.random() * 50;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.setProperty('--x', `${dx}px`);
      particle.style.setProperty('--y', `${dy}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;

      container.appendChild(particle);

      setTimeout(() => particle.remove(), 1500);
    }
  }
}

// טעינת YouTube API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);
