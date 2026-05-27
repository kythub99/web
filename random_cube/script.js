const COLORS = ["red", "blue", "green", "yellow"];
const SLOT_COUNT = 5;
const REEL_BASE_LENGTH = 28;

const lever = document.getElementById("lever");
const slots = Array.from(document.querySelectorAll(".slot"));

let spinning = false;
const prevColors = new Array(SLOT_COUNT).fill(null);

function cubeHTML(color) {
  if (!color) return "";
  return `<div class="cube ${color}">
    <div class="face top"></div>
    <div class="face front"></div>
    <div class="face right"></div>
  </div>`;
}

function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function buildReelHTML(reelLength, startColor, finalColor) {
  const cells = [];
  cells.push(`<div class="reel-cell">${cubeHTML(startColor)}</div>`);
  for (let i = 1; i < reelLength - 1; i++) {
    const c = Math.random() < 0.18 ? null : randomColor();
    cells.push(`<div class="reel-cell">${cubeHTML(c)}</div>`);
  }
  cells.push(`<div class="reel-cell final">${cubeHTML(finalColor)}</div>`);
  return cells.join("");
}

function getCellHeight() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--cell-h");
  return parseFloat(v) || slots[0].clientHeight;
}

function randomize() {
  if (spinning) return;
  spinning = true;

  const positions = shuffleArr([0, 1, 2, 3, 4]);
  const emptyIdx = positions[4];
  const colorOrder = shuffleArr(COLORS);
  const finalForSlot = {};
  finalForSlot[emptyIdx] = null;
  for (let i = 0; i < 4; i++) {
    finalForSlot[positions[i]] = colorOrder[i];
  }

  const cellH = getCellHeight();
  let finishedCount = 0;

  slots.forEach((slot, slotIdx) => {
    const finalColor = finalForSlot[slotIdx];
    const startColor = prevColors[slotIdx];
    const reelLength = REEL_BASE_LENGTH + slotIdx * 10;

    slot.classList.remove("landed");

    slot.innerHTML = `<div class="reel spinning">${buildReelHTML(reelLength, startColor, finalColor)}</div>`;
    const reel = slot.querySelector(".reel");

    reel.style.transition = "none";
    reel.style.transform = "translateY(0)";

    const targetY = -(reelLength - 1) * cellH;
    const duration = 2.8 + slotIdx * 0.8;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reel.style.transition = `transform ${duration}s cubic-bezier(0.06, 0.7, 0.12, 1)`;
        reel.style.transform = `translateY(${targetY}px)`;
      });
    });

    const onEnd = () => {
      reel.classList.remove("spinning");
      slot.classList.add("landed");
      if (finalColor) slot.classList.add("has-cube");
      else slot.classList.remove("has-cube");

      setTimeout(() => slot.classList.remove("landed"), 600);

      finishedCount++;
      if (finishedCount === SLOT_COUNT) {
        spinning = false;
        lever.classList.remove("disabled");
      }
    };

    reel.addEventListener("transitionend", onEnd, { once: true });

    prevColors[slotIdx] = finalColor;
  });
}

function pullLever() {
  if (spinning) return;
  lever.classList.add("pulled");
  lever.classList.add("disabled");

  // Spin kicks in just as the lever bottoms out — feels like the pull causes it
  setTimeout(() => randomize(), 220);

  // Lever springs back up
  setTimeout(() => lever.classList.remove("pulled"), 380);
}

lever.addEventListener("click", pullLever);
