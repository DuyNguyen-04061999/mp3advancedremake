import { music, music_2 } from "./data.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const container = $(".container");

const audio = $("#audio");
const musicPresent = $(".music__present-wrap");
const musicImgWrap = $(".music__img");
const musicImg = $(".music__img img");

const playPauseIcon = $("#playpause");
const playPauseBtn = $(".music__control-playpause");
const nextBtn = $("#next");
const backBtn = $("#back");
const title = $(".music__info-title");
const author = $(".music__info-author");
const timeStart = $(".--start");
const timeDuration = $(".--duration");
const progress = $(".music__progress");
const progressBar = $(".music__progress-bar");

const volumeArea = $(".container__volume");
const volumeRange = $("input[type='range']");
const volumeControl = $(".container__volume-control");
const volumeIcon = $(".container__volume-control > i");

const musicListAct = $("#list");
const musicListField = $(".container__music-field");

const repeatBtn = $("#repeat");
let musicIndex = Math.floor(Math.random() * music.length);

// render info of music (src of audio, img, name, artist)
function loadMusic(musicNum) {
  audio.src = `./assets/music/${music[musicNum].src}`;
  musicImg.src = `./assets/img/${music[musicNum].img}`;
  title.innerText = `${music[musicNum].name}`;
  author.innerText = `${music[musicNum].artist}`;
  liTags.forEach((liTag) => liTag.classList.remove("active"));
  liTags[musicNum].classList.add("active");
}

// ========== playpause music ==========
function playMusic() {
  container.classList.add("pause");
  playPauseIcon.classList.replace("fa-play", "fa-pause");
  musicImgWrap.classList.add("active");
  musicImgWrap.classList.remove("unactive");
  musicPresent.classList.add("active");
  audio.play();
}

function pauseMusic() {
  container.classList.remove("pause");
  musicImgWrap.classList.remove("active");
  musicImgWrap.classList.add("unactive");
  playPauseIcon.classList.replace("fa-pause", "fa-play");
  musicPresent.classList.remove("active");
  audio.pause();
}
playPauseBtn.onclick = (e) => {
  container.classList.contains("pause") ? pauseMusic() : playMusic();
};

//========== next prev music ============
const handleChangeMusic = (dir) => {
  if (dir > 0) {
    musicIndex++;
    if (musicIndex > music.length - 1) musicIndex = 0;
  } else if (dir < 0) {
    musicIndex--;
    if (musicIndex < 0) musicIndex = music.length - 1;
  }
  loadMusic(musicIndex);
  playMusic();
};

backBtn.onclick = () => {
  handleChangeMusic(-1);
};

nextBtn.onclick = () => {
  handleChangeMusic(1);
};

// ========= progress =========
audio.addEventListener("timeupdate", (e) => {
  const { currentTime, duration } = e.target;

  progress.style.width = `${(currentTime / duration) * 100}%`;

  timeStart.innerText = formatTime(currentTime);

  audio.addEventListener("loadeddata", (e) => {
    const { currentTime, duration } = e.target;
    timeStart.innerText = formatTime(currentTime);
    timeDuration.innerText = formatTime(duration);
  });
});

function formatTime(time) {
  const minutes = parseInt(time / 60);
  const seconds = parseInt(time - minutes * 60);
  return `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}
function handleMouseProgressMove(e) {
  const clickedPosition = e.offsetX;
  const progressBarWidth = progressBar.offsetWidth;

  progressRegulate(clickedPosition, progressBarWidth);
}

function progressRegulate(position, width) {
  audio.currentTime = (position / width) * audio.duration;
  playMusic();
}

function handleMouseTouch(e) {
  const clickedPosition =
    e.touches[0].clientX -
    container.getBoundingClientRect().left -
    this.offsetLeft;
  const progressBarWidth = progressBar.offsetWidth;

  if (clickedPosition >= 0) progressRegulate(clickedPosition, progressBarWidth);
}

progressBar.addEventListener("click", handleMouseProgressMove);

progressBar.addEventListener("mousedown", () => {
  progressBar.addEventListener("mousemove", handleMouseProgressMove);
});

document.addEventListener("mouseup", () => {
  progressBar.removeEventListener("mousemove", handleMouseProgressMove);
});

progressBar.addEventListener("mouseleave", () => {
  progressBar.removeEventListener("mousemove", handleMouseProgressMove);
});

progressBar.addEventListener("touchstart", () => {
  progressBar.addEventListener("touchmove", handleMouseTouch);
});
progressBar.addEventListener("touchend", () => {
  progressBar.removeEventListener("touchmove", handleMouseTouch);
});

//====== repeat ======
repeatBtn.addEventListener("click", (e) => {
  const getText = e.target.innerText;
  switch (getText) {
    case "repeat":
      e.target.innerText = "repeat_one";
      e.target.setAttribute("title", "Repeat");
      break;
    case "repeat_one":
      e.target.innerText = "shuffle";
      e.target.setAttribute("title", "Shuffle");
      break;
    case "shuffle":
      e.target.innerText = "repeat";
      e.target.setAttribute("title", "Song loop");
      break;
  }
});

// ====== music done ========
audio.addEventListener("ended", () => {
  switch (repeatBtn.innerText) {
    case "repeat":
      handleChangeMusic(1);
      break;
    case "repeat_one":
      audio.currentTime = 0;
      loadMusic(musicIndex);
      playMusic();
      break;
    case "shuffle":
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * music.length);
      } while (randomIndex === musicIndex);

      loadMusic(randomIndex);
      playMusic();
      break;
  }
});

// ======== keyboard =======
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case " ":
      container.classList.contains("pause") ? pauseMusic() : playMusic();
      break;
    case "ArrowRight":
      audio.currentTime += 10;
      playMusic();
      break;
    case "ArrowLeft":
      audio.currentTime -= 10;
      playMusic();
      break;
  }
});

// ====== volume ======
function handleChangeVolume(value, max) {
  const volumeValue = value / max;

  if (volumeValue >= 0 && volumeValue <= 1) {
    volumeRange.value = volumeValue * 100;
    audio.volume = volumeValue;
    switch (volumeValue) {
      case 0:
        volumeIcon.className = "fa-solid fa-volume-xmark";
        break;
      case 1:
        volumeIcon.className = "fa-solid fa-volume-high";
        break;

      default:
        volumeIcon.className = "fa-solid fa-volume-off";
        break;
    }
  }
}

function handleMouseVolumeMove(e) {
  handleChangeVolume(e.offsetX, e.target.offsetWidth);
}

function handleMouseVolumeMoveTouch(e) {
  const value =
    e.touches[0].clientX -
    container.getBoundingClientRect().left -
    e.target.offsetLeft;

  const max = e.target.offsetWidth;

  handleChangeVolume(value, max);
}

volumeArea.addEventListener("click", () => {
  volumeControl.classList.add("active");
});
document.addEventListener("click", (e) => {
  if (!volumeArea.contains(e.target) && !volumeControl.contains(e.target)) {
    volumeControl.classList.remove("active");
  }
});

volumeRange.addEventListener("change", (e) => {
  //volume receives 0 -> 1 value not 1 -> 100
  handleChangeVolume(e.target.value, e.target.max);
});

volumeRange.addEventListener("mousedown", () => {
  volumeRange.addEventListener("mousemove", handleMouseVolumeMove);
});

volumeRange.addEventListener("mouseup", () => {
  volumeRange.removeEventListener("mousemove", handleMouseVolumeMove);
});

volumeRange.addEventListener("touchmove", handleMouseVolumeMoveTouch);

//====== music List ======
musicListAct.addEventListener("click", () => {
  musicListField.classList.add("active");
});
musicListField.innerHTML = /*html*/ `
    <div class="info">
        <div class="info__left">
            <i class="material-symbols-outlined">queue_music </i>
            <h3>Songs list</h3>
        </div>

        <div class="info__right">
            <i id="list-close" class="material-symbols-outlined">close</i>
        </div>
    </div>

    <ul class="music__list">
        ${music_2
          .map(
            (item, id) => /*html*/ `
                <li class="" data-id=${id}>
                    <div class="">
                        <h3>${item.name}</h3>
                        <span>${item.artist}</span>
                    </div>
                    <audio class=audio-${id} src=./assets/music/${item.src}></audio>
                    <span id=duration-${id} class="music__duration"></span>

                    <div id='bars'>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                        <div class='bar'></div>
                    </div>
                </li>`
          )
          .join("")}
    </ul>
`;

const musicListClose = musicListField.querySelector(".info__right");

musicListClose.addEventListener("click", () => {
  musicListField.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (!musicListAct.contains(e.target) && !musicListField.contains(e.target)) {
    musicListField.classList.remove("active");
  }
});
const liTags = musicListField.querySelectorAll("li");

for (let i = 0; i < music_2.length; i++) {
  const audioTag = musicListField.querySelector(`.audio-${i}`);
  const durationTag = musicListField.querySelector(`#duration-${i}`);

  audioTag.addEventListener("loadeddata", (e) => {
    const { duration } = e.target;
    durationTag.innerText = formatTime(duration);
  });
}

liTags.forEach((liTag, id) => {
  liTag.addEventListener("click", (e) => {
    liTags.forEach((liTag) => liTag.classList.remove("active"));
    e.target.classList.add("active");
    loadMusic(id);
    playMusic();
    musicListField.classList.remove("active");
  });
});
loadMusic(musicIndex);
