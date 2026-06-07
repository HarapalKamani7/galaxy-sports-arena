// ============================================
// GALAXY SPORTS ARENA - AI Game Engine
// ============================================

let currentGame = null;
let score = 0;
let animationId = null;
let keys = {};

// ============================================
// STAR FIELD BACKGROUND
// ============================================
function createStars(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random()
    });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
      s.y += s.speed;
      s.opacity = 0.3 + Math.abs(Math.sin(Date.now() * 0.001 + s.x));
      if (s.y > canvas.height) s.y = 0;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// ============================================
// OPENING SCREEN
// ============================================
createStars('starsCanvas');

// Load Drigger image
const driggerImg = document.getElementById('driggerImg');
driggerImg.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/Driger_beyblade.jpg/220px-Driger_beyblade.jpg';
driggerImg.onerror = function() {
  this.style.display = 'none';
  const container = document.querySelector('.drigger-container');
  container.innerHTML = `
    <div style="width:220px;height:220px;border-radius:50%;
    background:radial-gradient(circle, #0a3a6e, #000);
    border:3px solid #00ffff;
    box-shadow:0 0 40px #00ffff;
    display:flex;align-items:center;justify-content:center;
    font-size:80px;animation:float 3s ease-in-out infinite">
    ⚡</div>`;
};

document.getElementById('openingScreen').addEventListener('click', function() {
  this.style.animation = 'fadeOut 0.8s forwards';
  setTimeout(() => {
    this.classList.remove('active');
    const home = document.getElementById('homeScreen');
    home.classList.add('active');
    home.style.display = 'flex';
    createStars('starsCanvas2');
  }, 800);
});

// ============================================
// NAVIGATION
// ============================================
function startGame(gameName) {
  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('homeScreen').style.display = 'none';
  const gameScreen = document.getElementById('gameScreen');
  gameScreen.classList.add('active');
  gameScreen.style.display = 'flex';
  score = 0;
  document.getElementById('scoreDisplay').textContent = '0';
  if (animationId) cancelAnimationFrame(animationId);
  currentGame = gameName;
  const titles = {
    beyblade: 'BEYBLADE BATTLE',
    cricket: 'SPACE CRICKET',
    volleyball: 'GALAXY VOLLEYBALL',
    tabletennis: 'TABLE TENNIS',
    kabaddi: 'KABADDI RAID',
    khokho: 'KHO-KHO CHASE'
  };
  document.getElementById('gameTitle').textContent = titles[gameName];
  const hints = {
    beyblade: 'Arrow Keys to Spin | Space to Launch Attack | Defeat the AI Beyblade!',
    cricket: 'Click / Space to Bat | Time your shot perfectly | Hit Sixes!',
    volleyball: 'Arrow Keys to Move | Space to Jump & Spike | Beat the AI!',
    tabletennis: 'Mouse / Arrow Keys to move paddle | First to 11 wins!',
    kabaddi: 'Arrow Keys to Raid | Space to Tag defenders | Return safely!',
    khokho: 'Arrow Keys to Run | Dodge the AI chasers | Survive as long as possible!'
  };
  document.getElementById('controlsHint').textContent = hints[gameName];
  const canvas = document.getElementById('gameCanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 80;
  games[gameName].init(canvas);
}

function goHome() {
  if (animationId) cancelAnimationFrame(animationId);
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('gameScreen').style.display = 'none';
  const home = document.getElementById('homeScreen');
  home.classList.add('active');
  home.style.display = 'flex';
  keys = {};
}

// ============================================
// KEY CONTROLS
// ============================================
document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

function updateScore(points) {
  score += points;
  document.getElementById('scoreDisplay').textContent = score;
}

// ============================================
// DRAW HELPERS
// ============================================
function drawStarsBg(ctx, w, h) {
  ctx.fillStyle = '#000008';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 80; i++) {
    ctx.beginPath();
    ctx.arc(
      (Math.sin(i * 567) * 0.5 + 0.5) * w,
      (Math.sin(i * 345) * 0.5 + 0.5) * h,
      Math.random() < 0.1 ? 1.5 : 0.8,
      0, Math.PI * 2
    );
    ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(Date.now() * 0.002 + i) * 0.3})`;
    ctx.fill();
  }
}

function drawNeonText(ctx, text, x, y, color, size) {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Segoe UI`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ============================================
// ALL 6 GAMES
// ============================================
const games = {

  // ==========================================
  // GAME 1: BEYBLADE BATTLE
  // ==========================================
  beyblade: {
    player: null, ai: null, particles: [],
    init(canvas) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      this.player = {
        x: W * 0.3, y: H * 0.5,
        r: 35, angle: 0, spin: 8,
        vx: 0, vy: 0, hp: 100, color: '#00ffff'
      };
      this.ai = {
        x: W * 0.7, y: H * 0.5,
        r: 35, angle: 0, spin: 6,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        hp: 100, color: '#ff3366'
      };
      this.particles = [];
      const arena = { x: W / 2, y: H / 2, r: Math.min(W, H) * 0.42 };
      const loop = () => {
        animationId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        drawStarsBg(ctx, W, H);
        // Arena
        ctx.save();
        ctx.beginPath();
        ctx.arc(arena.x, arena.y, arena.r, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.stroke();
        ctx.restore();
        // Player controls
        if (keys['ArrowLeft']) this.player.vx -= 0.4;
        if (keys['ArrowRight']) this.player.vx += 0.4;
        if (keys['ArrowUp']) this.player.vy -= 0.4;
        if (keys['ArrowDown']) this.player.vy += 0.4;
        if (keys[' ']) {
          const dx = this.ai.x - this.player.x;
          const dy = this.ai.y - this.player.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          this.player.vx += (dx / d) * 2;
          this.player.vy += (dy / d) * 2;
        }
        // Move player
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        this.player.vx *= 0.96;
        this.player.vy *= 0.96;
        this.player.angle += this.player.spin;
        // Arena boundary
        const dpx = this.player.x - arena.x;
        const dpy = this.player.y - arena.y;
        if (Math.sqrt(dpx*dpx+dpy*dpy) > arena.r - this.player.r) {
          const a = Math.atan2(dpy, dpx);
          this.player.x = arena.x + (arena.r - this.player.r) * Math.cos(a);
          this.player.y = arena.y + (arena.r - this.player.r) * Math.sin(a);
          this.player.vx *= -0.6;
          this.player.vy *= -0.6;
        }
        // AI movement - chase player
        const adx = this.player.x - this.ai.x;
        const ady = this.player.y - this.ai.y;
        const ad = Math.sqrt(adx*adx+ady*ady);
        this.ai.vx += (adx/ad) * 0.2;
        this.ai.vy += (ady/ad) * 0.2;
        this.ai.x += this.ai.vx;
        this.ai.y += this.ai.vy;
        this.ai.vx *= 0.97;
        this.ai.vy *= 0.97;
        this.ai.angle -= this.ai.spin;
        const daix = this.ai.x - arena.x;
        const daiy = this.ai.y - arena.y;
        if (Math.sqrt(daix*daix+daiy*daiy) > arena.r - this.ai.r) {
          const a = Math.atan2(daiy, daix);
          this.ai.x = arena.x + (arena.r - this.ai.r) * Math.cos(a);
          this.ai.y = arena.y + (arena.r - this.ai.r) * Math.sin(a);
          this.ai.vx *= -0.6;
          this.ai.vy *= -0.6;
        }
        // Collision
        const colDx = this.player.x - this.ai.x;
        const colDy = this.player.y - this.ai.y;
        const colD = Math.sqrt(colDx*colDx+colDy*colDy);
        if (colD < this.player.r + this.ai.r) {
          this.ai.hp -= 1.5;
          this.player.hp -= 0.8;
          updateScore(2);
          for (let i = 0; i < 8; i++) {
            this.particles.push({
              x: (this.player.x+this.ai.x)/2,
              y: (this.player.y+this.ai.y)/2,
              vx: (Math.random()-0.5)*8,
              vy: (Math.random()-0.5)*8,
              life: 30, color: '#ffff00'
            });
          }
        }
        // Particles
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,0,${p.life/30})`;
          ctx.fill();
          p.x += p.vx; p.y += p.vy; p.life--;
        });
        // Draw beyblades
        [this.player, this.ai].forEach(b => {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle * Math.PI / 180);
          ctx.shadowBlur = 25;
          ctx.shadowColor = b.color;
          for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.ellipse(0, -b.r * 0.5, b.r * 0.2, b.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(0, 0, b.r * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();
        });
        // HP bars
        [[this.player, 50, 'YOU', '#00ffff'],
         [this.ai, W-200, 'AI', '#ff3366']].forEach(([b, x, label, c]) => {
          ctx.fillStyle = '#333';
          ctx.fillRect(x, 20, 150, 15);
          ctx.fillStyle = c;
          ctx.fillRect(x, 20, b.hp * 1.5, 15);
          drawNeonText(ctx, label + ': ' + Math.max(0,Math.round(b.hp)), x+75, 15, c, 14);
        });
        // Win/lose
        if (this.ai.hp <= 0) {
          drawNeonText(ctx, 'YOU WIN! SCORE: '+score, W/2, H/2, '#00ffff', 48);
          cancelAnimationFrame(animationId);
        }
        if (this.player.hp <= 0) {
          drawNeonText(ctx, 'AI WINS! SCORE: '+score, W/2, H/2, '#ff3366', 48);
          cancelAnimationFrame(animationId);
        }
      };
      loop();
    }
  },

  // ==========================================
  // GAME 2: CRICKET
  // ==========================================
  cricket: {
    ball: null, batsman: null, state: 'bowling', timing: 0,
    init(canvas) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      let balls = 6, runs = 0, wickets = 0;
      let ball = { x: W*0.5, y: 80, vy: 6, vx: (Math.random()-0.5)*3, active: true };
      let swingAngle = 0;
      let swingResult = '';
      let resultTimer = 0;
      let aiDifficulty = 1;
      const resetBall = () => {
        ball = { x: W*0.5 + (Math.random()-0.5)*100, y: 80,
          vy: 5 + aiDifficulty, vx: (Math.random()-0.5)*(2+aiDifficulty), active: true };
        swingResult = '';
      };
      const bat = { x: W*0.5, y: H-100, w: 80, h: 15, swing: false, swingAnim: 0 };
      document.addEventListener('keydown', e => {
        if (e.key === ' ' && !bat.swing) { bat.swing = true; bat.swingAnim = 0; }
      });
      canvas.addEventListener('click', () => { if (!bat.swing) { bat.swing = true; bat.swingAnim = 0; } });
      const loop = () => {
        animationId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        drawStarsBg(ctx, W, H);
        // Pitch
        ctx.fillStyle = 'rgba(0,100,50,0.4)';
        ctx.fillRect(W*0.3, 60, W*0.4, H-120);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(W*0.3, 60, W*0.4, H-120);
        // Crease
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(W*0.3, H-120, W*0.4, 3);
        // Move ball
        if (ball.active) {
          ball.x += ball.vx;
          ball.y += ball.vy;
          // Bat collision
          if (ball.y > H-130 && ball.y < H-80 &&
              ball.x > bat.x - bat.w/2 && ball.x < bat.x + bat.w/2 && bat.swing) {
            const timing = Math.abs(bat.swingAnim - 15);
            if (timing < 5) { swingResult = 'SIX! +6'; runs += 6; updateScore(6); aiDifficulty += 0.2; }
            else if (timing < 10) { swingResult = 'FOUR! +4'; runs += 4; updateScore(4); }
            else { swingResult = 'ONE RUN'; runs += 1; updateScore(1); }
            ball.active = false;
            balls--;
            resultTimer = 60;
            setTimeout(resetBall, 1000);
          }
          // Miss
          if (ball.y > H - 60) {
            swingResult = 'WICKET!';
            wickets++;
            ball.active = false;
            balls--;
            resultTimer = 60;
            setTimeout(resetBall, 1000);
          }
        }
        // Draw ball
        if (ball.active) {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ff4444';
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, 12, 0, Math.PI*2);
          ctx.fillStyle = '#cc0000';
          ctx.fill();
          ctx.strokeStyle = '#ffaaaa';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
        // Bat
        if (keys['ArrowLeft']) bat.x = Math.max(W*0.3+bat.w/2, bat.x-7);
        if (keys['ArrowRight']) bat.x = Math.min(W*0.7-bat.w/2, bat.x+7);
        if (bat.swing) {
          bat.swingAnim++;
          if (bat.swingAnim > 30) { bat.swing = false; bat.swingAnim = 0; }
        }
        ctx.save();
        ctx.translate(bat.x, H-100);
        ctx.rotate(bat.swing ? Math.sin(bat.swingAnim*0.2)*0.8 : 0);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-bat.w/2, -bat.h/2, bat.w, bat.h);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-bat.w/2, -bat.h/2, bat.w, 3);
        ctx.restore();
        // Score display
        drawNeonText(ctx, `RUNS: ${runs}  WICKETS: ${wickets}  BALLS: ${balls}`, W/2, H-20, '#ffdd00', 16);
        if (resultTimer > 0) {
          const color = swingResult.includes('SIX') ? '#ffdd00' :
                        swingResult.includes('FOUR') ? '#00ff88' :
                        swingResult.includes('WICKET') ? '#ff3366' : '#ffffff';
          drawNeonText(ctx, swingResult, W/2, H/2, color, 52);
          resultTimer--;
        }
        if (balls <= 0) {
          drawNeonText(ctx, `INNINGS OVER! ${runs} RUNS`, W/2, H/2-40, '#ffdd00', 42);
          cancelAnimationFrame(animationId);
        }
      };
      loop();
    }
  },

  // ==========================================
  // GAME 3: VOLLEYBALL
  // ==========================================
  volleyball: {
    init(canvas) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const net = { x: W/2, h: H*0.35 };
      const player = { x: W*0.25, y: H-100, w: 30, h: 60, vy: 0, onGround: true };
      const ai = { x: W*0.75, y: H-100, w: 30, h: 60, vy: 0 };
      const ball = { x: W*0.25, y: H-200, vx: 5, vy: -8, r: 18 };
      let playerScore = 0, aiScore = 0;
      const GRAVITY = 0.5, GROUND = H - 80;
      const loop = () => {
        animationId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        drawStarsBg(ctx, W, H);
        // Ground
        ctx.fillStyle = 'rgba(0,100,200,0.3)';
        ctx.fillRect(0, GROUND, W, H-GROUND);
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(0, GROUND, W, 3);
        // Net
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(net.x, GROUND);
        ctx.lineTo(net.x, GROUND - net.h);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Player controls
        if (keys['ArrowLeft']) player.x = Math.max(player.w/2, player.x - 6);
        if (keys['ArrowRight']) player.x = Math.min(W/2 - player.w/2, player.x + 6);
        if ((keys['ArrowUp'] || keys[' ']) && player.onGround) {
          player.vy = -14; player.onGround = false;
        }
        player.vy += GRAVITY;
        player.y += player.vy;
        if (player.y >= GROUND - player.h) {
          player.y = GROUND - player.h;
          player.vy = 0;
          player.onGround = true;
        }
        // AI follows ball
        if (ball.x > W/2) {
          if (ai.x < ball.x - 10) ai.x = Math.min(W - ai.w/2, ai.x + 5);
          if (ai.x > ball.x + 10) ai.x = Math.max(W/2 + ai.w/2, ai.x - 5);
          if (ai.onGround && ball.vy > 0 && Math.abs(ai.x - ball.x) < 60) {
            ai.vy = -13; ai.onGround = false;
          }
        }
        ai.vy = (ai.vy || 0) + GRAVITY;
        ai.y += (ai.vy || 0);
        if (ai.y >= GROUND - ai.h) {
          ai.y = GROUND - ai.h;
          ai.vy = 0;
          ai.onGround = true;
        }
        // Ball physics
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += GRAVITY * 0.7;
        // Ball bounce off walls
        if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
        if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
        // Ball bounce off ground
        if (ball.y > GROUND - ball.r) {
          if (ball.x < W/2) { aiScore++; }
          else { playerScore++; updateScore(5); }
          ball.x = W*0.25; ball.y = H-200;
          ball.vx = 5; ball.vy = -10;
        }
        // Ball bounce off net
        if (Math.abs(ball.x - net.x) < ball.r + 5 && ball.y > GROUND - net.h) {
          ball.vx *= -1;
        }
        // Player hits ball
        const pdx = ball.x - player.x;
        const pdy = ball.y - (player.y + player.h/2);
        if (Math.sqrt(pdx*pdx+pdy*pdy) < ball.r + player.w/2) {
          ball.vx = Math.abs(ball.vx) + 2;
          ball.vy = -12;
          updateScore(1);
        }
        // AI hits ball
        const adx = ball.x - ai.x;
        const ady = ball.y - (ai.y + ai.h/2);
        if (Math.sqrt(adx*adx+ady*ady) < ball.r + ai.w/2) {
          ball.vx = -Math.abs(ball.vx) - 2;
          ball.vy = -12;
        }
        // Draw players
        [[player,'#00ffff','YOU'],[ai,'#ff3366','AI']].forEach(([p,c,label]) => {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = c;
          ctx.fillStyle = c;
          // Body
          ctx.fillRect(p.x - p.w/2, p.y, p.w, p.h);
          // Head
          ctx.beginPath();
          ctx.arc(p.x, p.y - 15, 18, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
          drawNeonText(ctx, label, p.x, p.y - 35, c, 13);
        });
        // Draw ball
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#aaaaff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        // Score
        drawNeonText(ctx, `YOU: ${playerScore}`, W/4, 50, '#00ffff', 28);
        drawNeonText(ctx, `AI: ${aiScore}`, W*3/4, 50, '#ff3366', 28);
        if (playerScore >= 7 || aiScore >= 7) {
          const winner = playerScore >= 7 ? 'YOU WIN!' : 'AI WINS!';
          const wc = playerScore >= 7 ? '#00ffff' : '#ff3366';
          drawNeonText(ctx, winner, W/2, H/2, wc, 52);
          cancelAnimationFrame(animationId);
        }
      };
      loop();
    }
  },

  // ==========================================
  // GAME 4: TABLE TENNIS
  // ==========================================
  tabletennis: {
    init(canvas) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const paddleW = 15, paddleH = 90;
      const player = { x: 30, y: H/2 - paddleH/2, score: 0 };
      const ai = { x: W - 45, y: H/2 - paddleH/2, score: 0, speed: 4 };
      const ball = { x: W/2, y: H/2, vx: 6, vy: 4, r: 10 };
      canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        player.y = e.clientY - rect.top - paddleH/2;
      });
      const loop = () => {
        animationId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        // Table
        ctx.fillStyle = '#003300';
        ctx.fillRect(0, 0, W, H);
        drawStarsBg(ctx, W, H);
        ctx.fillStyle = 'rgba(0,80,0,0.6)';
        ctx.fillRect(20, 20, W-40, H-40);
        // Net
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(W/2, 20);
        ctx.lineTo(W/2, H-20);
        ctx.stroke();
        ctx.setLineDash([]);
        // Arrow key control
        if (keys['ArrowUp']) player.y = Math.max(20, player.y - 7);
        if (keys['ArrowDown']) player.y = Math.min(H-paddleH-20, player.y + 7);
        // AI follows ball
        const aiCenter = ai.y + paddleH/2;
        if (aiCenter < ball.y - 10) ai.y = Math.min(H-paddleH-20, ai.y + ai.speed);
        if (aiCenter > ball.y + 10) ai.y = Math.max(20, ai.y - ai.speed);
        // Ball
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.y < 20 + ball.r) { ball.y = 20+ball.r; ball.vy = Math.abs(ball.vy); }
        if (ball.y > H - 20 - ball.r) { ball.y = H-20-ball.r; ball.vy = -Math.abs(ball.vy); }
        // Player paddle collision
        if (ball.x - ball.r < player.x + paddleW &&
            ball.y > player.y && ball.y < player.y + paddleH && ball.vx < 0) {
          ball.vx = Math.abs(ball.vx) + 0.3;
          ball.vy += (ball.y - (player.y + paddleH/2)) * 0.1;
          updateScore(1);
          ai.speed = Math.min(8, ai.speed + 0.2);
        }
        // AI paddle collision
        if (ball.x + ball.r > ai.x &&
            ball.y > ai.y && ball.y < ai.y + paddleH && ball.vx > 0) {
          ball.vx = -(Math.abs(ball.vx) + 0.2);
          ball.vy += (ball.y - (ai.y + paddleH/2)) * 0.1;
        }
        // Scoring
        if (ball.x < 0) {
          ai.score++;
          ball.x = W/2; ball.y = H/2;
          ball.vx = 6; ball.vy = (Math.random()-0.5)*6;
        }
        if (ball.x > W) {
          player.score++;
          updateScore(5);
          ball.x = W/2; ball.y = H/2;
          ball.vx = -6; ball.vy = (Math.random()-0.5)*6;
        }
        // Draw paddles
        [[player,'#00ffff'],[ai,'#ff3366']].forEach(([p,c]) => {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = c;
          ctx.fillStyle = c;
          ctx.fillRect(p.x, p.y, paddleW, paddleH);
          ctx.restore();
        });
        // Draw ball
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        ctx.restore();
        drawNeonText(ctx, `${player.score}`, W/4, 60, '#00ffff', 42);
        drawNeonText(ctx, `${ai.score}`, W*3/4, 60, '#ff3366', 42);
        drawNeonText(ctx, 'Move Mouse or Arrow Keys', W/2, H-5, '#445566', 13);
        if (player.score >= 11 || ai.score >= 11) {
          const w = player.score >= 11 ? 'YOU WIN!' : 'AI WINS!';
          drawNeonText(ctx, w, W/2, H/2, '#ffdd00', 52);
          cancelAnimationFrame(animationId);
        }
      };
      loop();
    }
  },

  // ==========================================
  // GAME 5: KABADDI
  // ==========================================
  kabaddi: {
    init(canvas) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const raider = { x: W*0.25, y: H/2, r: 22, inZone: false, breath: 100 };
      const defenders = [];
      for (let i = 0; i < 4; i++) {
        defenders.push({
          x: W*0.6 + Math.random()*W*0.3,
          y: H*0.2 + i*(H*0.15),
          r: 20, tagged: false,
          vx: (Math.random()-0.5)*3,
          vy: (Math.random()-0.5)*3
        });
      }
      let tagged = 0, lives = 3, survived = 0;
      const midLine = W/2;
      const loop = () => {
        animationId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        drawStarsBg(ctx, W, H);
        // Court
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, W-60, H-60);
        // Mid line
        ctx.setLineDash([15,10]);
        ctx.beginPath();
        ctx.moveTo(midLine, 30);
        ctx.lineTo(midLine, H-30);
        ctx.strokeStyle = '#ffff00';
        ctx.stroke();
        ctx.setLineDash([]);
        // Labels
        drawNeonText(ctx, 'YOUR SIDE', W*0.25, 50, '#00ffff', 16);
        drawNeonText(ctx, 'OPPONENT SIDE', W*0.72, 50, '#ff3366', 16);
        // Raider movement
        if (keys['ArrowLeft']) raider.x = Math.max(40, raider.x - 5);
        if (keys['ArrowRight']) raider.x = Math.min(W-40, raider.x + 5);
        if (keys['ArrowUp']) raider.y = Math.max(40, raider.y - 5);
        if (keys['ArrowDown']) raider.y = Math.min(H-40, raider.y + 5);
        // In enemy zone
        raider.inZone = raider.x > midLine;
        if (raider.inZone) {
          raider.breath -= 0.5;
          survived++;
          if (survived % 60 === 0) updateScore(1);
        } else {
          raider.breath = Math.min(100, raider.breath + 1);
        }
        // Defenders AI
        defenders.forEach(d => {
          if (!d.tagged) {
            if (raider.inZone) {
              const dx = raider.x - d.x;
              const dy = raider.y - d.y;
              const dist = Math.sqrt(dx*dx+dy*dy);
              d.vx += (dx/dist) * 0.3;
              d.vy += (dy/dist) * 0.3;
            }
            d.x += d.vx;
            d.y += d.vy;
            d.vx *= 0.95;
            d.vy *= 0.95;
            d.x = Math.max(midLine+d.r, Math.min(W-40, d.x));
            d.y = Math.max(40, Math.min(H-40, d.y));
            // Tag raider (catch)
            const dx = raider.x - d.x;
            const dy = raider.y - d.y;
            if (Math.sqrt(dx*dx+dy*dy) < raider.r + d.r && raider.inZone) {
              lives--;
              raider.x = W*0.25;
              raider.y = H/2;
              raider.breath = 100;
              if (lives <= 0) {
                drawNeonText(ctx, 'OUT! SCORE: '+score, W/2, H/2, '#ff3366', 52);
                cancelAnimationFrame(animationId);
              }
            }
          }
        });
        // Space to tag defenders
        if (keys[' ']) {
          defenders.forEach(d => {
            if (!d.tagged) {
              const dx = raider.x - d.x;
              const dy = raider.y - d.y;
              if (Math.sqrt(dx*dx+dy*dy) < raider.r + d.r + 20) {
                d.tagged = true;
                tagged++;
                updateScore(10);
              }
            }
          });
        }
        // Draw defenders
        defenders.forEach(d => {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = d.tagged ? '#444' : '#ff3366';
          ctx.fillStyle = d.tagged ? '#333' : '#ff3366';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
          ctx.fill();
          if (!d.tagged) {
            drawNeonText(ctx, 'D', d.x, d.y+5, '#fff', 14);
          }
          ctx.restore();
        });
        // Draw raider
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(raider.x, raider.y, raider.r, 0, Math.PI*2);
        ctx.fill();
        drawNeonText(ctx, 'R', raider.x, raider.y+5, '#000', 14);
        ctx.restore();
        // Breath bar
        ctx.fillStyle = '#333';
        ctx.fillRect(20, H-40, 150, 12);
        ctx.fillStyle = raider.breath > 30 ? '#00ff88' : '#ff3366';
        ctx.fillRect(20, H-40, raider.breath * 1.5, 12);
        drawNeonText(ctx, 'BREATH', 95, H-42, '#aaaaaa', 11);
        drawNeonText(ctx, `TAGGED: ${tagged}  LIVES: ${lives}`, W/2, H-20, '#ffdd00', 15);
      };
      loop();
    }
  },

  // ==========================================
  // GAME 6: KHO-KHO
  // ==========================================
  khokho: {
    init(canvas) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const runner = { x: W/2, y: H/2, r: 20, speed: 6 };
      const chasers = [];
      for (let i = 0; i < 3; i++) {
        chasers.push({
          x: 80 + i * 120, y: 80,
          r: 20, speed: 3 + i * 0.5,
          vx: 0, vy: 0
        });
      }
      let timeAlive = 0, level = 1;
      const poles = [];
      for (let i = 0; i < 4; i++) {
        poles.push({ x: W*0.2 + i*(W*0.2), y: H/2 });
      }
      const loop = () => {
        animationId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, W, H);
        drawStarsBg(ctx, W, H);
        // Court
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, W-60, H-60);
        // Central line
        ctx.beginPath();
        ctx.moveTo(W/2, 30);
        ctx.lineTo(W/2, H-30);
        ctx.strokeStyle = '#ffaa00';
        ctx.stroke();
        // Poles
        poles.forEach(p => {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ffdd00';
          ctx.fillStyle = '#ffdd00';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        });
        // Runner controls
        if (keys['ArrowLeft']) runner.x = Math.max(40, runner.x - runner.speed);
        if (keys['ArrowRight']) runner.x = Math.min(W-40, runner.x + runner.speed);
        if (keys['ArrowUp']) runner.y = Math.max(40, runner.y - runner.speed);
        if (keys['ArrowDown']) runner.y = Math.min(H-40, runner.y + runner.speed);
        // Chasers AI
        chasers.forEach(c => {
          const dx = runner.x - c.x;
          const dy = runner.y - c.y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          c.vx += (dx/dist) * 0.4;
          c.vy += (dy/dist) * 0.4;
          c.vx *= 0.92;
          c.vy *= 0.92;
          const spd = Math.sqrt(c.vx*c.vx+c.vy*c.vy);
          if (spd > c.speed) {
            c.vx = (c.vx/spd)*c.speed;
            c.vy = (c.vy/spd)*c.speed;
          }
          c.x += c.vx;
          c.y += c.vy;
          c.x = Math.max(40, Math.min(W-40, c.x));
          c.y = Math.max(40, Math.min(H-40, c.y));
          // Caught
          const cdx = runner.x - c.x;
          const cdy = runner.y - c.y;
          if (Math.sqrt(cdx*cdx+cdy*cdy) < runner.r + c.r) {
            drawNeonText(ctx, 'CAUGHT! SCORE: '+score, W/2, H/2, '#ff3366', 48);
            drawNeonText(ctx, 'Survived: '+(timeAlive/60).toFixed(1)+'s', W/2, H/2+60, '#ffdd00', 28);
            cancelAnimationFrame(animationId);
            return;
          }
        });
        timeAlive++;
        if (timeAlive % 60 === 0) updateScore(2);
        if (timeAlive % 300 === 0) {
          level++;
          chasers.forEach(c => c.speed += 0.5);
        }
        // Draw chasers
        chasers.forEach((c, i) => {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff6600';
          ctx.fillStyle = '#ff6600';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
          ctx.fill();
          drawNeonText(ctx, 'C', c.x, c.y+5, '#fff', 13);
          ctx.restore();
        });
        // Draw runner
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(runner.x, runner.y, runner.r, 0, Math.PI*2);
        ctx.fill();
        drawNeonText(ctx, 'YOU', runner.x, runner.y+5, '#000', 11);
        ctx.restore();
        drawNeonText(ctx, `TIME: ${(timeAlive/60).toFixed(1)}s  LEVEL: ${level}`, W/2, H-15, '#ffdd00', 15);
      };
      loop();
    }
  }
};

// Fade out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);