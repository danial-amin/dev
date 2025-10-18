$(function() {
  const d = new Date();
  const hours = d.getHours();
  const night = hours >= 19 || hours <= 7; // between 7pm and 7am
  const body = document.querySelector('body');
  const toggle = document.getElementById('toggle');
  const input = document.getElementById('switch');

  if (night) {
    input.checked = true;
    body.classList.add('night');
  }

  toggle.addEventListener('click', function() {
    const isChecked = input.checked;
    if (isChecked) {
      body.classList.remove('night');
    } else {
      body.classList.add('night');
    }
  });

  const introHeight = document.querySelector('.intro').offsetHeight;
  const topButton = document.getElementById('top-button');
  const $topButton = $('#top-button');

  window.addEventListener(
    'scroll',
    function() {
      if (window.scrollY > introHeight) {
        $topButton.fadeIn();
      } else {
        $topButton.fadeOut();
      }
    },
    false
  );

  topButton.addEventListener('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 500);
  });

  const hand = document.querySelector('.emoji.wave-hand');

  function waveOnLoad() {
    hand.classList.add('wave');
    setTimeout(function() {
      hand.classList.remove('wave');
    }, 2000);
  }

  setTimeout(function() {
    waveOnLoad();
  }, 1000);

  hand.addEventListener('mouseover', function() {
    hand.classList.add('wave');
  });

  hand.addEventListener('mouseout', function() {
    hand.classList.remove('wave');
  });

  window.sr = ScrollReveal({
    reset: false,
    duration: 600,
    easing: 'cubic-bezier(.694,0,.335,1)',
    scale: 1,
    viewFactor: 0.3,
  });

  sr.reveal('.background');
  sr.reveal('.skills');
  sr.reveal('.experience', { viewFactor: 0.2 });
  sr.reveal('.featured-projects', { viewFactor: 0.1 });
  sr.reveal('.other-projects', { viewFactor: 0.05 });

  // Initialize Grid Animation
  const gridAnimation = new GridAnimation();
});

// Grid Animation Class
class GridAnimation {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.lines = [];
    this.gridSize = 40;
    this.maxLines = 42;
    this.animationId = null;
    
    this.init();
    this.bindEvents();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'grid-animation';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    `;
    
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resize();
    
    // Start with one line
    this.resetAnimation();
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  resetAnimation() {
    this.lines = [this.createLine()];
  }
  
  createLine() {
    const cols = Math.floor(this.canvas.width / this.gridSize);
    const rows = Math.floor(this.canvas.height / this.gridSize);
    
    return {
      x: Math.floor(Math.random() * cols) * this.gridSize,
      y: Math.floor(Math.random() * rows) * this.gridSize,
      dx: this.gridSize * (Math.random() > 0.5 ? 1 : -1),
      dy: this.gridSize * (Math.random() > 0.5 ? 1 : -1),
      trail: [],
      maxTrailLength: 20,
      hue: Math.random() * 360,
      alpha: 0.8
    };
  }
  
  updateLine(line) {
    // Add current position to trail
    line.trail.push({ x: line.x, y: line.y });
    if (line.trail.length > line.maxTrailLength) {
      line.trail.shift();
    }
    
    // Move line
    line.x += line.dx;
    line.y += line.dy;
    
    // Check boundaries and split if at corner
    let hitBoundary = false;
    
    if (line.x < 0 || line.x >= this.canvas.width) {
      line.dx = -line.dx;
      line.x = Math.max(0, Math.min(line.x, this.canvas.width - this.gridSize));
      hitBoundary = true;
    }
    
    if (line.y < 0 || line.y >= this.canvas.height) {
      line.dy = -line.dy;
      line.y = Math.max(0, Math.min(line.y, this.canvas.height - this.gridSize));
      hitBoundary = true;
    }
    
    // Split at boundary if not at max lines
    if (hitBoundary && this.lines.length < this.maxLines) {
      return this.createSplitLine(line);
    }
    
    return null;
  }
  
  createSplitLine(originalLine) {
    const newLine = this.createLine();
    newLine.x = originalLine.x;
    newLine.y = originalLine.y;
    newLine.hue = (originalLine.hue + 30) % 360; // Slightly different color
    
    // Random direction for new line
    const directions = [
      { dx: this.gridSize, dy: 0 },
      { dx: -this.gridSize, dy: 0 },
      { dx: 0, dy: this.gridSize },
      { dx: 0, dy: -this.gridSize }
    ];
    
    const randomDir = directions[Math.floor(Math.random() * directions.length)];
    newLine.dx = randomDir.dx;
    newLine.dy = randomDir.dy;
    
    return newLine;
  }
  
  drawLine(line) {
    const isDarkMode = document.body.classList.contains('night');
    
    // Draw trail
    line.trail.forEach((point, index) => {
      const alpha = (index / line.trail.length) * line.alpha * 0.3;
      this.ctx.fillStyle = isDarkMode 
        ? `hsla(${line.hue}, 70%, 60%, ${alpha})`
        : `hsla(${line.hue}, 50%, 40%, ${alpha})`;
      
      this.ctx.fillRect(point.x, point.y, this.gridSize * 0.3, this.gridSize * 0.3);
    });
    
    // Draw current position
    this.ctx.fillStyle = isDarkMode 
      ? `hsla(${line.hue}, 70%, 60%, ${line.alpha})`
      : `hsla(${line.hue}, 50%, 40%, ${line.alpha})`;
    
    this.ctx.fillRect(line.x, line.y, this.gridSize * 0.6, this.gridSize * 0.6);
    
    // Draw direction indicator
    this.ctx.fillStyle = isDarkMode 
      ? `hsla(${line.hue}, 90%, 80%, ${line.alpha})`
      : `hsla(${line.hue}, 70%, 30%, ${line.alpha})`;
    
    const centerX = line.x + this.gridSize * 0.3;
    const centerY = line.y + this.gridSize * 0.3;
    const nextX = centerX + line.dx * 0.3;
    const nextY = centerY + line.dy * 0.3;
    
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(nextX, nextY);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = isDarkMode 
      ? `hsla(${line.hue}, 90%, 80%, ${line.alpha})`
      : `hsla(${line.hue}, 70%, 30%, ${line.alpha})`;
    this.ctx.stroke();
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw subtle grid
    this.drawGrid();
    
    // Update and draw lines
    const newLines = [];
    this.lines.forEach(line => {
      const splitLine = this.updateLine(line);
      if (splitLine) {
        newLines.push(splitLine);
      }
      this.drawLine(line);
    });
    
    // Add new lines from splits
    this.lines.push(...newLines);
    
    // Reset if we've reached max lines
    if (this.lines.length >= this.maxLines) {
      setTimeout(() => this.resetAnimation(), 1000);
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  drawGrid() {
    const isDarkMode = document.body.classList.contains('night');
    this.ctx.strokeStyle = isDarkMode 
      ? 'rgba(175, 175, 191, 0.05)' 
      : 'rgba(68, 68, 82, 0.05)';
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
  
  splitOnClick(event) {
    if (this.lines.length >= this.maxLines) return;
    
    // Find closest line to click
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    let closestLine = null;
    let minDistance = Infinity;
    
    this.lines.forEach(line => {
      const distance = Math.sqrt(
        Math.pow(clickX - line.x, 2) + Math.pow(clickY - line.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestLine = line;
      }
    });
    
    if (closestLine && minDistance < this.gridSize * 2) {
      const newLine = this.createSplitLine(closestLine);
      this.lines.push(newLine);
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    
    // Enable pointer events for clicks
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.addEventListener('click', (e) => this.splitOnClick(e));
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}