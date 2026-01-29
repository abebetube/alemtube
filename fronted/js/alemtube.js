let playlist = [];
let currentIndex = 0;

window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("splash").style.display = "none", 4000);
});

document.getElementById("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); searchVideos(); }
});

async function searchVideos() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const res = await fetch(`https://YOUR_BACKEND_URL/search?q=${encodeURIComponent(query)}`);
  const videos = await res.json();

  playlist = videos;
  if (playlist.length > 0) playVideo(0);
}

function playVideo(index) {
  const video = playlist[index];
  if (!video) return;
  document.getElementById("player-container").innerHTML =
    `<iframe id="ytplayer" src="https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1" allowfullscreen allow="autoplay"></iframe>`;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  playlist.forEach((v,i)=>{
    if(i===index) return;
    const div = document.createElement("div");
    div.className="video-item";
    div.onclick=()=>{ currentIndex=i; playVideo(i);}
    div.innerHTML=`<img src="${v.thumb}" alt="${v.title}"><div class="video-title">${v.title}</div>`;
    resultsDiv.appendChild(div);
  });
}
