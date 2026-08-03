// Nội dung lễ cưới.
const wedding = {
  bride: "Phương Nhi",
  brideZh: "芳儿",
  groom: "Chí Hào",
  groomZh: "志豪",
  date: "29.11.2026",
  dateTime: "2026-11-29",
};

// Mật độ sao: 0.5 = nhẹ, 1 = chuẩn file mẫu, 1.5 = dày hơn.
const STAR_DENSITY = 1.5;
// Chọn 4 hoặc 6 tia cho hiệu ứng Star flare.
const FLARE_POINTS = 6;

document.querySelector("#bride-name").textContent = wedding.bride;
document.querySelector("#bride-name-zh").textContent = wedding.brideZh;
document.querySelector("#groom-name").textContent = wedding.groom;
document.querySelector("#groom-name-zh").textContent = wedding.groomZh;
document.querySelector("#monogram").innerHTML = `SAVE THE DATE`;
const dateElement = document.querySelector("#wedding-date");
dateElement.textContent = wedding.date;
dateElement.dateTime = wedding.dateTime;

const canvas = document.querySelector("#stars");
const ctx = canvas.getContext("2d");

let W;
let H;
let cx;
let cy;

// Thông số gốc từ file Universe_Space_Background_Animation_1.html.
const REF_AREA = 1920 * 1080;
const DIM_COUNT_REF = 2600;
const MED_COUNT_REF = 380;
const FLARE_COUNT_REF = 72;
const FAR = 1;
const NEAR = 0.06;
const LIFETIME = 16;
const DZ_PER_FRAME = (FAR - NEAR) / (LIFETIME * 60);

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  cx = W / 2;
  cy = H / 2;
}

function pickColor() {
  const value = Math.random();
  if (value < 0.72) return "255,255,255";
  if (value < 0.9) return "190,210,255";
  return "255,225,190";
}

class FlightStar {
  constructor(randomStartZ) {
    this.setOrigin();
    this.z = randomStartZ ? NEAR + Math.random() * (FAR - NEAR) : FAR;
    this.color = pickColor();
    this.phase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = 0.01 + Math.random() * 0.02;
  }

  setOrigin() {
    this.origX = Math.random() * W;
    this.origY = Math.random() * H;
  }

  step() {
    this.z -= DZ_PER_FRAME;
    if (this.z <= NEAR) {
      this.setOrigin();
      this.z = FAR;
      this.color = pickColor();
    }

    this.factor = FAR / this.z;
    this.sx = cx + (this.origX - cx) * this.factor;
    this.sy = cy + (this.origY - cy) * this.factor;
    this.phase += this.twinkleSpeed;

    const life = (this.z - NEAR) / (FAR - NEAR);
    this.edgeFade = Math.min(1, (1 - life) * 6) * Math.min(1, life * 10);
  }

  offscreen() {
    return this.sx < -80 || this.sx > W + 80 || this.sy < -80 || this.sy > H + 80;
  }
}

class DustStar extends FlightStar {
  constructor(randomStartZ) {
    super(randomStartZ);
    this.baseR = Math.random() * 0.7 + 0.3;
    this.baseAlpha = Math.random() * 0.5 + 0.2;
  }

  draw() {
    if (this.offscreen()) return;
    const twinkle = 0.7 + 0.3 * Math.sin(this.phase);
    const scale = Math.min(this.factor, 6);
    const alpha = Math.min(1, this.baseAlpha * twinkle * this.edgeFade * (0.5 + scale * 0.15));
    const radius = this.baseR * Math.min(scale, 3.2);
    ctx.fillStyle = `rgba(${this.color},${alpha})`;
    ctx.beginPath();
    ctx.arc(this.sx, this.sy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class MedStar extends FlightStar {
  constructor(randomStartZ) {
    super(randomStartZ);
    this.baseR = Math.random() * 1.1 + 0.7;
    this.baseAlpha = Math.random() * 0.4 + 0.5;
  }

  draw() {
    if (this.offscreen()) return;
    const twinkle = 0.75 + 0.25 * Math.sin(this.phase);
    const scale = Math.min(this.factor, 7);
    const alpha = Math.min(1, this.baseAlpha * twinkle * this.edgeFade * (0.5 + scale * 0.15));
    const radius = this.baseR * Math.min(scale, 4);
    ctx.fillStyle = `rgba(${this.color},${alpha})`;
    ctx.beginPath();
    ctx.arc(this.sx, this.sy, radius, 0, Math.PI * 2);
    ctx.fill();

    if (alpha > 0.45) {
      const glow = ctx.createRadialGradient(this.sx, this.sy, 0, this.sx, this.sy, radius * 4);
      glow.addColorStop(0, `rgba(${this.color},${alpha * 0.35})`);
      glow.addColorStop(1, `rgba(${this.color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.sx, this.sy, radius * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Những sao trung bình khi đủ lớn sẽ có diffraction spikes nhỏ.
    if (radius > 2.35 && alpha > 0.58) {
      const spikeLength = Math.min(15, radius * 3.2);
      const thickness = Math.max(1.45, radius * 0.12);
      ctx.save();
      ctx.translate(this.sx, this.sy);
      ctx.globalCompositeOperation = "lighter";
      const axisCount = FLARE_POINTS === 6 ? 3 : 2;
      for (let axis = 0; axis < axisCount; axis += 1) {
        ctx.save();
        ctx.rotate(axis * (Math.PI / axisCount));
        const spike = ctx.createLinearGradient(-spikeLength, 0, spikeLength, 0);
        spike.addColorStop(0, `rgba(${this.color},0)`);
        spike.addColorStop(0.5, `rgba(${this.color},${alpha * 0.48})`);
        spike.addColorStop(1, `rgba(${this.color},0)`);
        ctx.fillStyle = spike;
        ctx.fillRect(-spikeLength, -thickness / 2, spikeLength * 2, thickness);
        ctx.restore();
      }
      ctx.restore();
    }
  }
}

class FlareStar extends FlightStar {
  constructor(randomStartZ) {
    super(randomStartZ);
    this.baseSize = Math.random() * 0.9 + 1.2;
    this.baseAlpha = Math.random() * 0.18 + 0.76;
    this.rot = Math.random() * Math.PI;
    this.twinkleSpeed = 0.018 + Math.random() * 0.018;
  }

  setOrigin() {
    // Giữ flare gần tâm để chúng còn ở trong khung hình khi tiến sát camera.
    this.origX = cx + (Math.random() - 0.5) * W * 0.62;
    this.origY = cy + (Math.random() - 0.5) * H * 0.62;
  }

  draw() {
    if (this.offscreen()) return;
    const shimmer = Math.pow((Math.sin(this.phase) + 1) / 2, 2);
    const twinkle = 0.48 + 0.52 * shimmer;
    const scale = Math.min(this.factor, 4.2);
    const flareVisibility = Math.max(0.42, this.edgeFade);
    const alpha = Math.min(1, this.baseAlpha * twinkle * flareVisibility);
    const size = this.baseSize * Math.min(scale, 2.15);
    const spikeLength = size * (4.8 + 1.9 * Math.min(scale, 2.5));

    ctx.save();
    ctx.translate(this.sx, this.sy);
    ctx.rotate(this.rot);
    ctx.globalCompositeOperation = "lighter";

    const axisCount = FLARE_POINTS === 6 ? 3 : 2;
    const axisStep = Math.PI / axisCount;
    const spikeThickness = Math.max(1.5, size * 0.34);

    for (let axis = 0; axis < axisCount; axis += 1) {
      ctx.save();
      ctx.rotate(axis * axisStep);
      const spike = ctx.createLinearGradient(-spikeLength, 0, spikeLength, 0);
      spike.addColorStop(0, `rgba(${this.color},0)`);
      spike.addColorStop(0.42, `rgba(${this.color},${alpha * 0.18})`);
      spike.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      spike.addColorStop(0.58, `rgba(${this.color},${alpha * 0.18})`);
      spike.addColorStop(1, `rgba(${this.color},0)`);
      ctx.fillStyle = spike;
      ctx.fillRect(-spikeLength, -spikeThickness / 2, spikeLength * 2, spikeThickness);
      ctx.restore();
    }

    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 4.2);
    glow.addColorStop(0, `rgba(255,255,255,${alpha * 0.72})`);
    glow.addColorStop(0.24, `rgba(${this.color},${alpha * 0.38})`);
    glow.addColorStop(1, `rgba(${this.color},0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha + 0.2)})`;
    ctx.beginPath();
    ctx.arc(0, 0, size * (1.08 + shimmer * 0.22), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let dustStars = [];
let medStars = [];
let flareStars = [];

function populate() {
  const areaScale = (W * H) / REF_AREA;
  const densityScale = areaScale * Math.max(0.1, STAR_DENSITY);
  dustStars = Array.from({ length: Math.round(DIM_COUNT_REF * densityScale) }, () => new DustStar(true));
  medStars = Array.from({ length: Math.round(MED_COUNT_REF * densityScale) }, () => new MedStar(true));
  flareStars = Array.from({ length: Math.round(FLARE_COUNT_REF * densityScale) }, () => new FlareStar(true));
}

function handleResize() {
  resize();
  populate();
}

function frame() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  const allStars = dustStars.concat(medStars, flareStars);
  allStars.sort((first, second) => second.z - first.z);
  for (const star of allStars) {
    star.step();
    star.draw();
  }

  requestAnimationFrame(frame);
}

window.addEventListener("resize", handleResize);
handleResize();
frame();
