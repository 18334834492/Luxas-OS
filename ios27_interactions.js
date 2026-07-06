/**
 * Luxas OS — 流畅交互系统
 * 窗口管理 · AI助手 · 控制中心 · 壁纸
 * 
 * 依赖: ios27_animations.js（弹簧物理+流体粒子）
 * ============================================ */

// ==================== 窗口管理系统 ====================
class WindowManager {
  constructor() {
    this.windows = [];
    this.zIndex = 100;
    this.activeWindow = null;
  }

  createWindow(options = {}) {
    const window = {
      id: Date.now(),
      title: options.title || '窗口',
      content: options.content || '',
      x: options.x || (window.innerWidth - 800) / 2,
      y: options.y || (window.innerHeight - 600) / 2,
      width: options.width || 800,
      height: options.height || 600,
      zIndex: ++this.zIndex,
      minimized: false,
      maximized: false,
      element: null
    };

    this.createWindowElement(window);

    // 使用弹簧动画入场
    const spring = new Spring({
      stiffness: 220,
      damping: 16,
      onUpdate: (val) => {
        window.element.style.transform = `scale(${0.85 + val * 0.15}) translateY(${(1 - val) * 30}px)`;
        window.element.style.opacity = val;
      }
    });
    spring.snap(0);
    spring.setTarget(1);

    this.windows.push(window);
    this.setActiveWindow(window);

    return window;
  }

  createWindowElement(window) {
    const windowEl = document.createElement('div');
    windowEl.className = 'ios-window entering';
    windowEl.style.cssText = `
      position: absolute;
      top: ${window.y}px;
      left: ${window.x}px;
      width: ${window.width}px;
      height: ${window.height}px;
      z-index: ${window.zIndex};
    `;

    windowEl.innerHTML = `
      <div class="ios-window-header">
        <span class="ios-window-title">${window.title}</span>
        <div class="window-controls">
          <button class="window-button minimize" data-id="${window.id}">−</button>
          <button class="window-button maximize" data-id="${window.id}">□</button>
          <button class="window-button close" data-id="${window.id}">×</button>
        </div>
      </div>
      <div class="ios-window-content">
        ${window.content}
      </div>
      <div class="ios-window-footer">
        <button class="ios-button ios-button-secondary">取消</button>
        <button class="ios-button ios-button-primary">确定</button>
      </div>
    `;

    document.querySelector('.ios-desktop').appendChild(windowEl);
    window.element = windowEl;

    // 绑定平滑拖拽
    new SmoothDrag(windowEl, {
      onDragStart: () => this.setActiveWindow(window),
      bounds: { top: 0, left: 0 }
    });

    this.bindWindowEvents(window, windowEl);
  }

  bindWindowEvents(window, element) {
    element.addEventListener('mousedown', () => {
      this.setActiveWindow(window);
    });

    element.querySelector('.close').addEventListener('click', () => {
      this.closeWindow(window);
    });

    element.querySelector('.minimize').addEventListener('click', () => {
      this.minimizeWindow(window);
    });

    element.querySelector('.maximize').addEventListener('click', () => {
      this.maximizeWindow(window);
    });
  }

  setActiveWindow(window) {
    if (this.activeWindow) {
      this.activeWindow.element.style.boxShadow = 'var(--ios-shadow-glass)';
    }
    this.activeWindow = window;
    window.zIndex = ++this.zIndex;
    window.element.style.zIndex = window.zIndex;
    window.element.style.boxShadow = 'var(--ios-shadow-glow), var(--ios-shadow-glass)';
  }

  closeWindow(window) {
    window.element.classList.remove('entering');
    window.element.classList.add('exiting');
    setTimeout(() => {
      window.element.remove();
      this.windows = this.windows.filter(w => w.id !== window.id);
      if (this.activeWindow === window) {
        this.activeWindow = this.windows[this.windows.length - 1] || null;
      }
    }, 400);
  }

  minimizeWindow(window) {
    window.minimized = !window.minimized;
    window.element.classList.toggle('minimized', window.minimized);
  }

  maximizeWindow(window) {
    window.maximized = !window.maximized;
    if (window.maximized) {
      window._prevBounds = { x: window.x, y: window.y, width: window.width, height: window.height };
      window.x = 0; window.y = 0;
      window.width = window.innerWidth;
      window.height = window.innerHeight;
      window.element.style.transition = `all 0.4s var(--spring-gentle)`;
      window.element.style.top = '0'; window.element.style.left = '0';
      window.element.style.width = '100vw'; window.element.style.height = '100vh';
    } else {
      const b = window._prevBounds;
      window.x = b.x; window.y = b.y;
      window.width = b.width; window.height = b.height;
      window.element.style.transition = `all 0.4s var(--spring-gentle)`;
      window.element.style.top = `${b.y}px`; window.element.style.left = `${b.x}px`;
      window.element.style.width = `${b.width}px`; window.element.style.height = `${b.height}px`;
    }
  }

  closeAllWindows() {
    this.windows.forEach(window => this.closeWindow(window));
  }
}

// ==================== AI 助手系统 ====================
class AIAssistant {
  constructor() {
    this.assistant = document.querySelector('.ios-ai-assistant');
    if (!this.assistant) return;
    this.content = this.assistant.querySelector('.ai-content');
    this.messages = this.assistant.querySelectorAll('.ai-message');
    this.suggestions = this.assistant.querySelectorAll('.ai-suggestion');
    this.isListening = false;
    this.init();
  }

  init() {
    this.suggestions.forEach(suggestion => {
      suggestion.addEventListener('click', () => {
        this.sendMessage(suggestion.textContent.trim());
      });
    });

    this.assistant.addEventListener('click', () => {
      this.focus();
    });

    this._hoverSpring = new Spring({
      stiffness: 160, damping: 10,
      onUpdate: (val) => {
        const scale = 1 + val * 0.05;
        const glow = val * 40;
        this.assistant.style.transform = `translateX(-50%) scale(${scale})`;
        this.assistant.style.boxShadow = `0 0 ${glow}px rgba(102, 126, 234, ${val * 0.4})`;
      }
    });
    this._hoverSpring.snap(0);
  }

  focus() { this._hoverSpring.setTarget(1); }
  blur() { this._hoverSpring.setTarget(0); }

  sendMessage(message) {
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-message user-message';
    userMessage.textContent = message;
    userMessage.style.marginBottom = '12px';
    userMessage.style.color = 'var(--ios-blue)';
    userMessage.style.textAlign = 'right';
    userMessage.style.opacity = '0';
    userMessage.style.transform = 'translateX(10px)';
    userMessage.style.transition = 'all 0.3s ease-out';
    this.messages.forEach(msg => msg.style.display = 'none');
    this.content.appendChild(userMessage);
    requestAnimationFrame(() => {
      userMessage.style.opacity = '1';
      userMessage.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      const aiResponse = document.createElement('div');
      aiResponse.className = 'ai-message';
      aiResponse.textContent = `好的，我已收到您的请求：${message}`;
      aiResponse.style.opacity = '0';
      aiResponse.style.transform = 'translateY(8px)';
      aiResponse.style.transition = 'all 0.4s ease-out';
      this.content.appendChild(aiResponse);
      requestAnimationFrame(() => {
        aiResponse.style.opacity = '1';
        aiResponse.style.transform = 'translateY(0)';
      });
      this.showSuggestions();
    }, 800);
  }

  showSuggestions() {
    this.suggestions.forEach((s, i) => {
      s.style.display = 'inline-block';
      s.style.opacity = '0';
      s.style.transform = 'scale(0.8)';
      s.style.transition = `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s`;
      requestAnimationFrame(() => {
        s.style.opacity = '1';
        s.style.transform = 'scale(1)';
      });
    });
  }

  hideSuggestions() {
    this.suggestions.forEach(s => (s.style.display = 'none'));
  }

  toggleListening() {
    this.isListening = !this.isListening;
    const pulse = this.assistant.querySelector('.ai-pulse');
    if (this.isListening) {
      pulse.style.animation = 'pulse 0.5s ease-in-out infinite';
      pulse.style.background = 'rgba(255, 45, 85, 0.4)';
    } else {
      pulse.style.animation = 'pulse-soft 2.5s ease-in-out infinite';
      pulse.style.background = 'rgba(102, 126, 234, 0.4)';
    }
  }
}

// ==================== 控制中心 ====================
class ControlCenter {
  constructor() {
    this.controlCenter = document.querySelector('.ios-control-center');
    if (!this.controlCenter) return;
    this.isOpen = false;
    this.init();
  }

  init() {
    document.querySelectorAll('.control-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        this.toggleTile(tile);
        tile.style.transition = 'transform 0.1s';
        tile.style.transform = 'scale(0.92)';
        setTimeout(() => { tile.style.transform = 'scale(1)'; }, 100);
      });
    });

    this.controlCenter.addEventListener('click', (e) => {
      if (e.target === this.controlCenter) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  toggleTile(tile) {
    const isSwitch = tile.querySelector('.control-switch');
    const isSlider = tile.querySelector('.control-slider');
    if (isSwitch) isSwitch.classList.toggle('active');
    if (isSlider) {
      const fill = tile.querySelector('.slider-fill');
      fill.style.transition = 'width 0.4s ease-out';
      fill.style.width = Math.random() * 100 + '%';
    }
  }

  open() {
    this.isOpen = true;
    this.controlCenter.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const items = this.controlCenter.querySelectorAll('.control-tile, .control-btn');
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px) scale(0.9)';
      item.style.transition = `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s`;
      requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  close() {
    this.isOpen = false;
    this.controlCenter.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// ==================== 壁纸切换 ====================
class WallpaperManager {
  constructor() {
    this.wallpapers = [
      'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
      'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    ];
    this.currentIndex = 0;
    this.gradient = document.querySelector('.aurora-gradient');
    this.isTransitioning = false;
  }

  switchWallpaper() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.wallpapers.length;
    const next = this.wallpapers[this.currentIndex];
    this.gradient.style.transition = 'opacity 0.6s ease-out';
    this.gradient.style.opacity = '0';
    setTimeout(() => {
      this.gradient.style.background = next;
      this.gradient.style.opacity = '0.6';
    }, 300);
    setTimeout(() => { this.isTransitioning = false; }, 700);
  }

  setWallpaper(index) {
    if (index < 0 || index >= this.wallpapers.length) return;
    this.currentIndex = index;
    this.gradient.style.transition = 'background 0.8s ease-out, opacity 0.6s ease-out';
    this.gradient.style.background = this.wallpapers[index];
    this.gradient.style.opacity = '0.6';
  }
}

// ==================== 自动初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  window.windowManager = new WindowManager();
  window.aiAssistant = new AIAssistant();
  window.controlCenter = new ControlCenter();
  window.wallpaperManager = new WallpaperManager();

  // 双击桌面空白打开控制中心
  document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.ios-desktop') && !e.target.closest('.ios-window')) {
      if (window.controlCenter) window.controlCenter.open();
    }
  });

  // 双击标题栏最大化
  document.addEventListener('dblclick', (e) => {
    const header = e.target.closest('.ios-window-header');
    if (header) {
      const el = header.closest('.ios-window');
      const win = window.windowManager.windows.find(w => w.element === el);
      if (win) window.windowManager.maximizeWindow(win);
    }
  });
});
