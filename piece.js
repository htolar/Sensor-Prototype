// piece.js: reads window.sense inside its own frame loop and answers.
//
// This piece responds to the state and signals from the State Table. Keep the
// visual response here; read the sensor result through window.sense, never the camera.

const canvas = document.querySelector('#piece');
const ctx = canvas.getContext('2d');
const focusBuffer = document.createElement('canvas');
const focusContext = focusBuffer.getContext('2d');

function resize() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
}
addEventListener('resize', resize);
resize();

const COLORS = {
  nobody: '#0b0b0d',
  neutral: '#26323b',
  surprised: '#3a1d2a',
  'closed-eyes': '#1d2a3a',
  focused: '#25413d',
};

// A state with no colour above still gets a bright one of its own, picked from
// its name, so a new row in table.js is visible the moment it fires.
function colorFor(state) {
  if (COLORS[state]) return COLORS[state];
  let hash = 0;
  for (const ch of state) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${hash}, 85%, 50%)`;
}

function frame() {
  const { state, signals, since } = window.sense;
  const held = performance.now() - since; // ms in this state
  const progress = Math.min(1, held / 5000);
  const shake = state === 'surprised' ? (1 - Math.min(1, held / 2000)) * 8 : 0;
  const drawingContext = state === 'focused' ? focusContext : ctx;

  if (state === 'focused') {
    const resolution = 0.15 + 0.85 * Math.ceil(progress * 32) / 32;
    const width = Math.max(1, Math.round(canvas.width * resolution));
    const height = Math.max(1, Math.round(canvas.height * resolution));
    if (focusBuffer.width !== width || focusBuffer.height !== height) {
      focusBuffer.width = width;
      focusBuffer.height = height;
    }
    drawingContext.setTransform(width / canvas.width, 0, 0, height / canvas.height, 0, 0);
  } else {
    drawingContext.setTransform(1, 0, 0, 1, 0, 0);
  }

  drawingContext.save();
  if (shake) {
    const phase = performance.now() / 35;
    drawingContext.translate(Math.sin(phase) * shake, Math.cos(phase * 1.3) * shake);
  }
  drawingContext.filter = state === 'focused' ? `contrast(${1 + progress})` : 'none';
  drawingContext.fillStyle = colorFor(state);
  drawingContext.fillRect(0, 0, canvas.width, canvas.height);

  if (state === 'surprised') {
    drawingContext.strokeStyle = 'rgba(242, 239, 233, 0.8)';
    drawingContext.lineWidth = Math.max(1, canvas.width / 900);
    for (let crack = 0; crack < 8; crack++) {
      const angle = crack * Math.PI / 4;
      const length = Math.min(canvas.width, canvas.height) * 0.42;
      drawingContext.beginPath();
      drawingContext.moveTo(canvas.width / 2, canvas.height / 2);
      for (let step = 1; step <= 6; step++) {
        const distance = length * step / 6;
        const bend = Math.sin(crack * 17 + step * 9) * length * 0.025;
        drawingContext.lineTo(
          canvas.width / 2 + Math.cos(angle) * distance + Math.cos(angle + Math.PI / 2) * bend,
          canvas.height / 2 + Math.sin(angle) * distance + Math.sin(angle + Math.PI / 2) * bend,
        );
      }
      drawingContext.stroke();
    }
  }

  if (state === 'neutral' || state === 'focused' || state === 'surprised') {
    const focus = state === 'focused' ? progress : 0;
    const expression = signals.mouthPucker || signals.browInnerUp || 0;
    const r = Math.min(canvas.width, canvas.height) * (0.08 + 0.24 * expression + 0.12 * focus);
    const fadeIn = Math.min(1, held / 600);
    drawingContext.globalAlpha = fadeIn;
    drawingContext.fillStyle = '#f2efe9';
    drawingContext.beginPath();
    drawingContext.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
    drawingContext.fill();
    drawingContext.globalAlpha = 1;
  }

  if (state === 'closed-eyes') {
    drawingContext.fillStyle = `rgba(0, 0, 0, ${progress})`;
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawingContext.restore();
  if (state === 'focused') ctx.drawImage(focusBuffer, 0, 0, canvas.width, canvas.height);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
