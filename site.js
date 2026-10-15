const distributionRepository = "miriben/MathLearnSolvee";
const releaseApi = `https://api.github.com/repos/${distributionRepository}/releases/latest`;
const releasePage = `https://github.com/${distributionRepository}/releases/latest`;

document.getElementById("current-year").textContent = new Date().getFullYear();

const releaseStatus = document.getElementById("release-status");
const downloadVersion = document.getElementById("download-version");

function setReleaseStatus(message, ready = false) {
  const dot = document.createElement("span");
  dot.className = ready ? "availability-dot is-ready" : "availability-dot";
  releaseStatus.replaceChildren(dot, document.createTextNode(` ${message}`));
}

fetch(releaseApi, { headers: { Accept: "application/vnd.github+json" } })
  .then((response) => {
    if (!response.ok) throw new Error("No public release yet");
    return response.json();
  })
  .then((release) => {
    const applicationVersion = /^Application-Version:\s*(\d+(?:\.\d+){0,3})\s*$/m
      .exec(release.body || "")?.[1];
    const version = applicationVersion || release.tag_name || release.name;
    setReleaseStatus(`Version ${version} · disponible pour Windows`, true);
    downloadVersion.textContent = `Version ${version} · ${release.name || "MathLearnSolve"}`;
    document.getElementById("release-link").href = release.html_url || releasePage;
  })
  .catch(() => {
    setReleaseStatus("Première version bientôt disponible");
    downloadVersion.textContent = "L’installateur sera disponible dès la première publication.";
  });

const canvas = document.getElementById("math-scene");
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let sceneWidth = 0;
let sceneHeight = 0;
let frame = 0;

function resizeScene() {
  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  sceneWidth = bounds.width;
  sceneHeight = bounds.height;
  canvas.width = Math.round(sceneWidth * pixelRatio);
  canvas.height = Math.round(sceneHeight * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function drawScene() {
  context.clearRect(0, 0, sceneWidth, sceneHeight);
  const spacing = sceneWidth < 600 ? 42 : 56;
  const originX = sceneWidth * 0.53;
  const originY = sceneHeight * 0.54;

  context.lineWidth = 1;
  context.strokeStyle = "rgba(39, 70, 66, .10)";
  for (let x = originX % spacing; x < sceneWidth; x += spacing) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, sceneHeight);
    context.stroke();
  }
  for (let y = originY % spacing; y < sceneHeight; y += spacing) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(sceneWidth, y);
    context.stroke();
  }

  context.strokeStyle = "rgba(23, 40, 42, .55)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(0, originY);
  context.lineTo(sceneWidth, originY);
  context.moveTo(originX, 0);
  context.lineTo(originX, sceneHeight);
  context.stroke();

  const scale = spacing / 2;
  const curves = [
    { color: "#ed684b", width: 3, fn: (x) => 0.42 * (x - 1) * (x - 1) - 2.2 },
    { color: "#397bcb", width: 2, fn: (x) => -0.62 * x + 0.7 },
    { color: "#2f875e", width: 2, fn: (x) => 1.35 * Math.sin(x * 0.8) + 0.1 },
  ];
  for (const curve of curves) {
    context.beginPath();
    context.strokeStyle = curve.color;
    context.lineWidth = curve.width;
    let started = false;
    for (let pixelX = 0; pixelX <= sceneWidth; pixelX += 2) {
      const x = (pixelX - originX) / scale;
      const pixelY = originY - curve.fn(x) * scale;
      if (!started) {
        context.moveTo(pixelX, pixelY);
        started = true;
      } else {
        context.lineTo(pixelX, pixelY);
      }
    }
    context.stroke();
  }

  const movingX = reducedMotion ? 1 : Math.sin(frame / 70) * 2.4;
  const movingY = 0.42 * (movingX - 1) * (movingX - 1) - 2.2;
  context.beginPath();
  context.arc(originX + movingX * scale, originY - movingY * scale, 6, 0, Math.PI * 2);
  context.fillStyle = "#17282a";
  context.fill();
  context.beginPath();
  context.arc(originX + movingX * scale, originY - movingY * scale, 11, 0, Math.PI * 2);
  context.strokeStyle = "rgba(23, 40, 42, .2)";
  context.lineWidth = 2;
  context.stroke();

  if (!reducedMotion) {
    frame += 1;
    window.requestAnimationFrame(drawScene);
  }
}

new ResizeObserver(() => {
  resizeScene();
  drawScene();
}).observe(canvas);