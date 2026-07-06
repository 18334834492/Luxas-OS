/**
 * Luxas OS — 流畅交互引擎 v2
 * 弹簧物理 · 流体粒子 · 惯性手势
 * ============================================ */

// ==========================================
// 1. 弹簧物理引擎
// ==========================================
class Spring {
  constructor(options = {}) {
    this.stiffness = options.stiffness || 180;     // 刚度
    this.damping = options.damping || 12;           // 阻尼
    this.mass = options.mass || 1;                  // 质量
    this.velocity = 0;
    this.position = 0;
    this.target = 0;
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.running = false;
    this.threshold = options.threshold || 0.5;
  }

  setTarget(target) {
    this.target = target;
    if (!this.running) {
      this.running = true;
      this._step();
    }
  }

  snap(target) {
    this.position = target;
    this.velocity = 0;
    this.target = target;
    this.onUpdate(target);
  }

  _step() {
    if (!this.running) return;

    const dt = 1 / 60;
    const fSpring = -this.stiffness * (this.position - this.target);
    const fDamper = -this.damping * this.velocity;
    const acceleration = (fSpring + fDamper) / this.mass;

    this.velocity += acceleration * dt;
    this.position += this.velocity * dt;

    this.onUpdate(this.position);

    if (
      Math.abs(this.velocity) < this.threshold &&
      Math.abs(this.position - this.target) < this.threshold
    ) {
      this.position = this.target;
      this.velocity = 0;
      this.running = false;
      this.onUpdate(this.target);
      this.onComplete();
      return;
    }

    requestAnimationFrame(() => this._step());
  }
}

// ==========================================
// 2. 惯性动画
// ==========================================
class Inertia {
  constructor(options = {}) {
    this.deceleration = options.deceleration || 0.003;
    this.maxSpeed = options.maxSpeed || 20;
    this.onUpdate = options.onUpdate || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.velocity = 0;
    this.position = 0;
    this.running = false;
  }

  fling(velocity) {
    this.velocity = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, velocity));
    if (!this.running) {
      this.running = true;
      this._step();
    }
  }

  _step() {
    if (!this.running) return;

    this.position += this.velocity;
    this.velocity *= (1 - this.deceleration);
    this.onUpdate(this.position);

    if (Math.abs(this.velocity) < 0.1) {
      this.velocity = 0;
      this.running = false;
      this.onComplete();
      return;
    }

    requestAnimationFrame(() => this._step());
  }

  stop() {
    this.velocity = 0;
    this.running = false;
  }
}

// ==========================================
// 3. 流体粒子系统（增强版）
// ==========================================
class FluidParticles {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000 };
    this.connections = [];
    this.options = {
      count: options.count || 60,
      maxSize: options.maxSize || 5,
      speed: options.speed || 0.3,
      connectionDist: options.connectionDist || 120,
      mouseRadius: options.mouseRadius || 150,
      colors: options.colors || [
        '102, 126, 234',
        '118, 75, 162',
        '38, 208, 206',
        '26, 41, 128'
      ],
      glowIntensity: options.glowIntensity || 0.5
    };

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.options.count; i++) {
      this.particles.push(this._createParticle());
    }
  }

  _createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: (Math.random() - 0.5) * this.options.speed,
      size: Math.random() * this.options.maxSize + 1.5,
      baseSize: 0,
      color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
      opacity: Math.random() * 0.4 + 0.15,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02,
      trail: []
    };
    // Set base size after creation
    const p = this.particles[this.particles.length - 1];
    if (p) p.baseSize = p.size;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const time = Date.now() * 0.001;

    this.particles.forEach((p, i) => {
      // ── 自然飘动 ──
      p.vx += Math.sin(time + p.phase) * 0.002;
      p.vy += Math.cos(time + p.phase) * 0.002;

      // ── 鼠标吸引力（平滑跟随） ──
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.options.mouseRadius && dist > 0) {
        const force = (1 - dist / this.options.mouseRadius) * 0.05;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;

        // 鼠标附近放大
        const scale = 1 + (1 - dist / this.options.mouseRadius) * 0.8;
        p.size = p.baseSize * scale;
      } else {
        // 恢复大小
        p.size += (p.baseSize - p.size) * 0.05;
      }

      // ── 速度限制 ──
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > this.options.speed * 2) {
        p.vx = (p.vx / speed) * this.options.speed * 2;
        p.vy = (p.vy / speed) * this.options.speed * 2;
      }

      // ── 位置更新 ──
      p.x += p.vx;
      p.y += p.vy;

      // ── 边界循环 ──
      if (p.x < -50) p.x = this.canvas.width + 50;
      if (p.x > this.canvas.width + 50) p.x = -50;
      if (p.y < -50) p.y = this.canvas.height + 50;
      if (p.y > this.canvas.height + 50) p.y = -50;

      // ── 呼吸脉冲 ──
      const pulse = Math.sin(time * p.pulseSpeed * 10 + p.phase) * 0.15 + 1;

      // ── 绘制粒子（发光） ──
      const alpha = p.opacity * pulse;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      this.ctx.fill();

      // ── 发光辉光 ──
      this.ctx.shadowBlur = 15 * this.options.glowIntensity;
      this.ctx.shadowColor = `rgba(${p.color}, ${alpha * 0.5})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * pulse * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // ── 粒子间连线 ──
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cd = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cd < this.options.connectionDist) {
          const lineAlpha = (1 - cd / this.options.connectionDist) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${p.color}, ${lineAlpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// 4. 平滑拖拽（窗口拖动）
// ==========================================
class SmoothDrag {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      onDragStart: options.onDragStart || (() => {}),
      onDrag: options.onDrag || (() => {}),
      onDragEnd: options.onDragEnd || (() => {}),
      bounds: options.bounds || null
    };

    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.velocityX = 0;
    this.velocityY = 0;

    this._springX = new Spring({
      stiffness: 200,
      damping: 15,
      onUpdate: (val) => {
        if (!this.isDragging) {
          this.element.style.transform =
            `translate(${val}px, ${this._springY.position}px)`;
        }
      }
    });

    this._springY = new Spring({
      stiffness: 200,
      damping: 15,
      onUpdate: (val) => {
        if (!this.isDragging) {
          this.element.style.transform =
            `translate(${this._springX.position}px, ${val}px)`;
        }
      }
    });

    this._bindEvents();
  }

  _bindEvents() {
    this.element.addEventListener('mousedown', (e) => this._start(e));
    document.addEventListener('mousemove', (e) => this._move(e));
    document.addEventListener('mouseup', (e) => this._end(e));

    this.element.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this._start({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const touch = e.touches[0];
      this._move({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: true });

    document.addEventListener('touchend', () => this._end({}), { passive: true });
  }

  _start(e) {
    this.isDragging = true;
    this.element.classList.add('dragging');

    const rect = this.element.getBoundingClientRect();
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.offsetX = rect.left;
    this.offsetY = rect.top;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    this._springX.snap(rect.left);
    this._springY.snap(rect.top);

    this.options.onDragStart(this.element);
  }

  _move(e) {
    if (!this.isDragging) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    this.velocityX = e.clientX - this.lastX;
    this.velocityY = e.clientY - this.lastY;
    this.lastX = e.clientX;
    this.lastY = e.clientY;

    let newX = this.offsetX + dx;
    let newY = this.offsetY + dy;

    // 边界约束
    if (this.options.bounds) {
      newX = Math.max(this.options.bounds.left || 0,
        Math.min(this.options.bounds.right || window.innerWidth - 100, newX));
      newY = Math.max(this.options.bounds.top || 0,
        Math.min(this.options.bounds.bottom || window.innerHeight - 100, newY));
    }

    this.element.style.left = `${newX}px`;
    this.element.style.top = `${newY}px`;

    this.options.onDrag(newX, newY);
  }

  _end(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.element.classList.remove('dragging');

    const rect = this.element.getBoundingClientRect();
    this._springX.setTarget(rect.left);
    this._springY.setTarget(rect.top);

    this.options.onDragEnd(this.element, this.velocityX, this.velocityY);
  }
}

// ==========================================
// 5. 弹性滚动（带惯性）
// ==========================================
class MomentumScroll {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      friction: options.friction || 0.92,
      minVelocity: options.minVelocity || 1,
      maxVelocity: options.maxVelocity || 60,
      overscroll: options.overscroll || 0.15,
      onScroll: options.onScroll || (() => {})
    };

    this.velocity = 0;
    this.scrollPos = 0;
    this.maxScroll = 0;
    this.isAnimating = false;
    this.isTouching = false;
    this.lastY = 0;
    this.lastTime = 0;

    this._spring = new Spring({
      stiffness: 120,
      damping: 18,
      onUpdate: (val) => {
        this.element.scrollTop = val;
        this.options.onScroll(val);
      }
    });

    this._bindEvents();
  }

  _bindEvents() {
    this.element.addEventListener('touchstart', (e) => {
      this.isTouching = true;
      this.velocity = 0;
      this.lastY = e.touches[0].clientY;
      this.lastTime = Date.now();
      this._spring.snap(this.element.scrollTop);
      this.scrollPos = this.element.scrollTop;
    }, { passive: true });

    this.element.addEventListener('touchmove', (e) => {
      if (!this.isTouching) return;
      const y = e.touches[0].clientY;
      const dy = this.lastY - y;

      this.velocity = dy / (Date.now() - this.lastTime) * 16;
      this.velocity = Math.max(-this.options.maxVelocity,
        Math.min(this.options.maxVelocity, this.velocity));

      this.scrollPos += dy;
      this.lastY = y;
      this.lastTime = Date.now();

      this.element.scrollTop = this.scrollPos;
    }, { passive: true });

    this.element.addEventListener('touchend', () => {
      this.isTouching = false;
      if (Math.abs(this.velocity) > 1) {
        this._startInertia();
      }
    }, { passive: true });
  }

  _startInertia() {
    const step = () => {
      this.velocity *= this.options.friction;
      this.scrollPos += this.velocity;
      this.element.scrollTop = this.scrollPos;

      if (Math.abs(this.velocity) > this.options.minVelocity) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  scrollTo(target, animated = true) {
    if (animated) {
      this._spring.setTarget(target);
    } else {
      this.element.scrollTop = target;
      this._spring.snap(target);
    }
  }

  updateMaxScroll() {
    this.maxScroll = this.element.scrollHeight - this.element.clientHeight;
  }
}

// ==========================================
// 6. 视差滚动
// ==========================================
class Parallax {
  constructor() {
    this.layers = [];
    this.isAnimating = false;

    window.addEventListener('scroll', () => this._update(), { passive: true });
    window.addEventListener('mousemove', (e) => this._onMouse(e), { passive: true });
  }

  addLayer(element, speed = 0.5) {
    this.layers.push({ element, speed, x: 0, y: 0 });
  }

  _update() {
    const scrollY = window.scrollY;
    this.layers.forEach(layer => {
      layer.element.style.transform =
        `translateY(${scrollY * layer.speed}px)`;
    });
  }

  _onMouse(e) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const px = (e.clientX - cx) / cx;
    const py = (e.clientY - cy) / cy;

    this.layers.forEach(layer => {
      if (layer.speed > 5) {  // 鼠标视差（相对较大值标识）
        const factor = layer.speed / 10;
        layer.element.style.transform =
          `translate(${px * 20 * factor}px, ${py * 20 * factor}px)`;
      }
    });
  }
}

// ==========================================
// 7. 数字缓动工具
// ==========================================
const Easing = {
  // 弹簧
  spring: (t) => {
    const c = 1 - Math.pow(1 - t, 3);
    return c * Math.exp(-t * 6);
  },

  // 弹性
  elasticOut: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) *
      Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  },

  // 超线性
  outExpo: (t) => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  },

  // 丝滑缓出
  outQuart: (t) => {
    return 1 - Math.pow(1 - t, 4);
  },

  // 贝塞尔近似
  smooth: (t) => {
    return t * t * (3 - 2 * t);
  }
};

// ==========================================
// 8. 序列动画控制器
// ==========================================
class AnimationSequence {
  constructor() {
    this.animations = [];
  }

  add(fn, delay = 0) {
    this.animations.push({ fn, delay });
    return this;
  }

  play() {
    let totalDelay = 0;
    this.animations.forEach(({ fn, delay }) => {
      totalDelay += delay;
      setTimeout(fn, totalDelay);
    });
  }

  reset() {
    this.animations = [];
  }
}

// ==========================================
// 9. 自动初始化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 如果有极光canvas，启动流体粒子
  const canvas = document.getElementById('aurora-canvas');
  if (canvas) {
    window.fluidParticles = new FluidParticles('aurora-canvas', {
      count: 60,
      connectionDist: 130,
      glowIntensity: 0.6
    });
  }

  // 初始入场序列
  const intro = new AnimationSequence();

  intro
    .add(() => {
      const dock = document.querySelector('.ios-dock');
      if (dock) dock.style.opacity = '1';
    }, 100)
    .add(() => {
      document.querySelectorAll('.ios-app-icon').forEach((el, i) => {
        el.style.setProperty('--anim-delay', `${i * 0.04}s`);
      });
    }, 50)
    .play();
});

// 导出
if (typeof module !== 'undefined') {
  module.exports = {
    Spring, Inertia, FluidParticles,
    SmoothDrag, MomentumScroll, Parallax,
    Easing, AnimationSequence
  };
}
