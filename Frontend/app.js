/* =====================================================================
   CourseNav AI — app.js
   ===================================================================== */

// ─────────────────────────────────────────────────────────────────────
// DATA — 20 pre-loaded courses
// ─────────────────────────────────────────────────────────────────────
const INITIAL_COURSES = [
  { id:1,  name:"Data Structures & Algorithms", topic:"DSA",      duration:15, rating:4.8, difficulty:4, relevance:9.5 },
  { id:2,  name:"Machine Learning Fundamentals",topic:"ML/AI",    duration:12, rating:4.7, difficulty:3, relevance:9.0 },
  { id:3,  name:"React & Modern Frontend",       topic:"Web Dev",  duration:8,  rating:4.6, difficulty:2, relevance:8.0 },
  { id:4,  name:"System Design",                 topic:"Systems",  duration:10, rating:4.9, difficulty:5, relevance:9.8 },
  { id:5,  name:"Deep Learning with PyTorch",    topic:"ML/AI",    duration:14, rating:4.8, difficulty:4, relevance:9.2 },
  { id:6,  name:"Operating Systems",             topic:"Systems",  duration:12, rating:4.5, difficulty:4, relevance:7.5 },
  { id:7,  name:"Computer Networks",             topic:"Systems",  duration:9,  rating:4.4, difficulty:3, relevance:7.0 },
  { id:8,  name:"Database Systems",              topic:"Systems",  duration:10, rating:4.6, difficulty:3, relevance:8.5 },
  { id:9,  name:"Linear Algebra for ML",         topic:"Math",     duration:6,  rating:4.7, difficulty:3, relevance:8.8 },
  { id:10, name:"AWS Cloud Practitioner",        topic:"Cloud",    duration:5,  rating:4.3, difficulty:2, relevance:7.5 },
  { id:11, name:"Cybersecurity Fundamentals",    topic:"Security", duration:8,  rating:4.5, difficulty:3, relevance:7.8 },
  { id:12, name:"Node.js Backend Development",   topic:"Web Dev",  duration:7,  rating:4.4, difficulty:2, relevance:7.2 },
  { id:13, name:"Kubernetes & Docker",           topic:"Cloud",    duration:6,  rating:4.6, difficulty:3, relevance:8.0 },
  { id:14, name:"Statistics for Data Science",   topic:"Math",     duration:5,  rating:4.7, difficulty:3, relevance:9.0 },
  { id:15, name:"NLP with Transformers",         topic:"ML/AI",    duration:11, rating:4.8, difficulty:5, relevance:9.5 },
  { id:16, name:"Compiler Design",               topic:"Systems",  duration:13, rating:4.2, difficulty:5, relevance:6.0 },
  { id:17, name:"iOS Development Swift",         topic:"Mobile",   duration:9,  rating:4.4, difficulty:3, relevance:6.5 },
  { id:18, name:"GraphQL APIs",                  topic:"Web Dev",  duration:4,  rating:4.3, difficulty:2, relevance:6.8 },
  { id:19, name:"Reinforcement Learning",        topic:"ML/AI",    duration:13, rating:4.6, difficulty:5, relevance:8.5 },
  { id:20, name:"Git & DevOps Workflows",        topic:"Other",    duration:3,  rating:4.5, difficulty:1, relevance:7.0 },
];

const TOPIC_COLORS = {
  "DSA":     "#7c6dff",
  "ML/AI":   "#4fa3f7",
  "Web Dev": "#30d98a",
  "Systems": "#f5a623",
  "Math":    "#ff5c6c",
  "Cloud":   "#2ec4b6",
  "Security":"#ff7eb3",
  "Mobile":  "#a8e063",
  "Other":   "#8b93b0",
};

// ─────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────
let courses     = INITIAL_COURSES.map(c => ({ ...c }));
let nextId      = 21;
let weights     = { rel: 0.40, rat: 0.35, dif: 0.25 };
let budget      = 20;
let lastDP      = null;
let dpCurStep   = 0;
let dpPlaying   = false;
let dpSteps     = [];
let dpPlayInt   = null;
let selectedIds = new Set();

// ─────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────
function computeScore(c) {
  const normRel    = c.relevance / 10;
  const normRat    = c.rating / 5;
  const diffPenalty = c.difficulty / 5;
  return 100 * (weights.rel * normRel + weights.rat * normRat - weights.dif * diffPenalty);
}

function scoredCourses() {
  return courses
    .map(c => ({ ...c, score: parseFloat(computeScore(c).toFixed(2)) }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────
// AVL TREE
// ─────────────────────────────────────────────────────────────────────
class AVLNode {
  constructor(course) {
    this.course = course;
    this.left   = null;
    this.right  = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() { this.root = null; }

  _h(n)    { return n ? n.height : 0; }
  _bf(n)   { return n ? this._h(n.left) - this._h(n.right) : 0; }
  _updH(n) { n.height = 1 + Math.max(this._h(n.left), this._h(n.right)); }

  _rr(y) {
    const x = y.left, T = x.right;
    x.right = y; y.left = T;
    this._updH(y); this._updH(x);
    return x;
  }

  _lr(y) {
    const x = y.right, T = x.left;
    x.left = y; y.right = T;
    this._updH(y); this._updH(x);
    return y;
  }

  _balance(n, s) {
    this._updH(n);
    const b = this._bf(n);
    if (b >  1 && s < n.left.course.score)  return this._rr(n);
    if (b < -1 && s > n.right.course.score) return this._lr(n);
    if (b >  1 && s > n.left.course.score)  { n.left  = this._lr(n.left);  return this._rr(n); }
    if (b < -1 && s < n.right.course.score) { n.right = this._rr(n.right); return this._lr(n); }
    return n;
  }

  _insert(n, c) {
    if (!n) return new AVLNode(c);
    if      (c.score < n.course.score) n.left  = this._insert(n.left, c);
    else if (c.score > n.course.score) n.right = this._insert(n.right, c);
    else                               n.right = this._insert(n.right, c);
    return this._balance(n, c.score);
  }

  insert(c)    { this.root = this._insert(this.root, c); }
  height()     { return this._h(this.root); }

  _inorder(n, res) {
    if (!n) return;
    this._inorder(n.left, res);
    res.push(n.course);
    this._inorder(n.right, res);
  }
  inorder() { const r = []; this._inorder(this.root, r); return r; }
}

function buildAVL() {
  const tree = new AVLTree();
  scoredCourses().forEach(c => tree.insert(c));
  return tree;
}

// ─────────────────────────────────────────────────────────────────────
// MIN-HEAP HELPERS (Top-K)
// ─────────────────────────────────────────────────────────────────────
function topKQuickWins(k = 3) {
  return scoredCourses().filter(c => c.duration < 6).slice(0, k);
}

function hardHighImpact() {
  return scoredCourses().filter(c => c.difficulty >= 4).slice(0, 3);
}

// ─────────────────────────────────────────────────────────────────────
// 0/1 KNAPSACK DP
// ─────────────────────────────────────────────────────────────────────
function knapsack() {
  const sc = scoredCourses();
  const n  = sc.length;
  const W  = budget;

  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = sc[i - 1].duration;
    const v = sc[i - 1].score;
    for (let j = 0; j <= W; j++) {
      dp[i][j] = dp[i - 1][j];
      if (w <= j && dp[i - 1][j - w] + v > dp[i][j]) {
        dp[i][j] = dp[i - 1][j - w] + v;
      }
    }
  }

  const picked = [];
  let j = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][j] !== dp[i - 1][j]) {
      picked.push(sc[i - 1]);
      j -= sc[i - 1].duration;
    }
  }

  const skipped = sc.filter(c => !picked.find(p => p.id === c.id));
  return { dp, courses: sc, selected: picked, skipped, n, W };
}

// ─────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────
function notify(msg, type = 'success') {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.className = `notif ${type} show`;
  setTimeout(() => el.classList.remove('show'), 2800);
}

function updateBudget(v) {
  budget = parseInt(v);
  document.getElementById('budget-display').textContent = v + ' hrs';
  refreshCourseList();
}

function updateWeights() {
  weights.rel = parseFloat(document.getElementById('w-rel').value);
  weights.rat = parseFloat(document.getElementById('w-rat').value);
  weights.dif = parseFloat(document.getElementById('w-dif').value);
  document.getElementById('w-rel-v').textContent = weights.rel.toFixed(2);
  document.getElementById('w-rat-v').textContent = weights.rat.toFixed(2);
  document.getElementById('w-dif-v').textContent = weights.dif.toFixed(2);
  refreshCourseList();
}

function switchTab(t) {
  const tabs = ['dashboard', 'avl', 'dp', 'stats'];
  document.querySelectorAll('.tab').forEach((el, i) => {
    el.classList.toggle('active', tabs[i] === t);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + t).classList.add('active');
  if (t === 'avl')   drawAVL();
  if (t === 'stats') renderCharts();
}

// ─────────────────────────────────────────────────────────────────────
// COURSE LIST (sidebar)
// ─────────────────────────────────────────────────────────────────────
function refreshCourseList() {
  const sc = scoredCourses();
  const el = document.getElementById('course-list');
  el.innerHTML = '';
  document.getElementById('course-count').textContent = courses.length + ' courses';
  document.getElementById('s-total').textContent = courses.length;

  sc.forEach(c => {
    const div = document.createElement('div');
    div.className = 'course-item' + (selectedIds.has(c.id) ? ' selected' : '');
    const col = TOPIC_COLORS[c.topic] || '#8b93b0';
    div.innerHTML = `
      <div class="ci-dot" style="background:${col}"></div>
      <div class="ci-body">
        <div class="ci-name">${c.name}</div>
        <div class="ci-meta">${c.topic} · ${c.duration}h · ⭐${c.rating}</div>
      </div>
      <div class="ci-score">${c.score.toFixed(1)}</div>
      <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id}, event)">×</button>
    `;
    el.appendChild(div);
  });
}

function addCourse() {
  const name = document.getElementById('add-name').value.trim();
  if (!name) { notify('Enter a course name', 'error'); return; }

  const dur   = parseInt(document.getElementById('add-dur').value)   || 10;
  const rat   = parseFloat(document.getElementById('add-rat').value) || 4.0;
  const topic = document.getElementById('add-topic').value;
  const diff  = parseInt(document.getElementById('add-diff').value)  || 3;
  const rel   = parseFloat(document.getElementById('add-rel').value) || 7.0;

  const c = { id: nextId++, name, topic, duration: dur, rating: rat, difficulty: diff, relevance: rel };
  courses.push(c);
  document.getElementById('add-name').value = '';
  notify(`"${name}" inserted into AVL Tree`, 'success');
  refreshCourseList();
  if (document.getElementById('tab-avl').classList.contains('active')) drawAVL();
}

function deleteCourse(id, e) {
  e.stopPropagation();
  const c = courses.find(x => x.id === id);
  courses = courses.filter(x => x.id !== id);
  selectedIds.delete(id);
  notify(`"${c.name}" removed`, 'info');
  refreshCourseList();
}

// ─────────────────────────────────────────────────────────────────────
// RECOMMENDATION ENGINE
// ─────────────────────────────────────────────────────────────────────
function runRecommendation() {
  const btn = document.querySelector('.btn-green');
  btn.innerHTML = '<span class="spinner"></span> Computing…';
  btn.disabled  = true;
  document.getElementById('status-badge').textContent = '● Computing';

  setTimeout(() => {
    lastDP      = knapsack();
    selectedIds = new Set(lastDP.selected.map(c => c.id));
    renderDashboard(lastDP);
    renderDPTable(lastDP);
    updateStatsNumbers(lastDP);
    btn.innerHTML = '▶ Run Recommendation Engine';
    btn.disabled  = false;
    document.getElementById('status-badge').textContent = '● Ready';
    notify('Optimal selection computed!', 'success');
    refreshCourseList();
  }, 400);
}

function resetResults() {
  lastDP      = null;
  selectedIds = new Set();
  document.getElementById('rec-output').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🤖</div>
      <div class="empty-text">Click "Run Recommendation Engine" to compute optimal course selection using DP Knapsack</div>
    </div>`;
  refreshCourseList();
}

function renderDashboard(dp) {
  const { selected, skipped } = dp;
  const qw = topKQuickWins(3);
  const hi = hardHighImpact();
  const totalHours = selected.reduce((a, c) => a + c.duration, 0);
  const totalScore = selected.reduce((a, c) => a + c.score, 0);

  let html = `
    <div class="stats-row" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${selected.length}</div><div class="stat-lbl">Optimal Courses</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--green)">${totalHours}h</div><div class="stat-lbl">Hours Used</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--amber)">${budget - totalHours}h</div><div class="stat-lbl">Hours Free</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--blue)">${totalScore.toFixed(0)}</div><div class="stat-lbl">Total DP Score</div></div>
    </div>`;

  const pct = Math.round((totalHours / budget) * 100);
  html += `
    <div style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);margin-bottom:6px;font-family:var(--font-mono)">
        <span>Time Budget Utilization</span><span>${totalHours}h / ${budget}h (${pct}%)</span>
      </div>
      <div style="height:8px;background:var(--bg4);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--blue));border-radius:4px;transition:width 1s ease"></div>
      </div>
    </div>`;

  html += `<div class="sec-header"><h2>🎯 DP Optimal Selection</h2><div class="sec-line"></div></div>`;
  html += `<div class="rec-grid">`;
  selected.forEach((c, i) => {
    const col  = TOPIC_COLORS[c.topic] || '#8b93b0';
    const fill = Math.min(100, (c.score / 100) * 100);
    html += `
      <div class="rec-card optimal fade-in" style="animation-delay:${i * 0.08}s">
        <div class="rc-rank" style="background:rgba(124,109,255,0.2);color:var(--accent2)">#${i + 1}</div>
        <div class="rc-tag" style="background:rgba(124,109,255,0.15);color:var(--accent2)">DP OPTIMAL</div>
        <div class="rc-name">${c.name}</div>
        <div class="rc-topic" style="color:${col}">● ${c.topic}</div>
        <div class="rc-stats">
          <div class="rc-stat"><div class="rc-stat-label">Score</div><div class="rc-stat-val" style="color:var(--accent2)">${c.score.toFixed(1)}</div></div>
          <div class="rc-stat"><div class="rc-stat-label">Duration</div><div class="rc-stat-val">${c.duration}h</div></div>
          <div class="rc-stat"><div class="rc-stat-label">Rating</div><div class="rc-stat-val" style="color:var(--amber)">⭐ ${c.rating}</div></div>
          <div class="rc-stat"><div class="rc-stat-label">Difficulty</div><div class="rc-stat-val">${['','★','★★','★★★','★★★★','★★★★★'][c.difficulty]}</div></div>
        </div>
        <div class="rc-score-bar"><div class="rc-score-fill" style="width:${fill}%;background:linear-gradient(90deg,var(--accent),var(--blue))"></div></div>
      </div>`;
  });
  html += `</div>`;

  html += `<div class="sec-header"><h2>⚡ Top-K Quick Wins (Min-Heap)</h2><div class="sec-line"></div></div>`;
  html += `<div class="rec-grid">`;
  qw.forEach((c, i) => {
    const col = TOPIC_COLORS[c.topic] || '#8b93b0';
    html += `
      <div class="rec-card quick fade-in" style="animation-delay:${i * 0.08}s">
        <div class="rc-rank" style="background:rgba(48,217,138,0.15);color:var(--green)">#${i + 1}</div>
        <div class="rc-tag" style="background:rgba(48,217,138,0.12);color:var(--green)">QUICK WIN (&lt;6h)</div>
        <div class="rc-name">${c.name}</div>
        <div class="rc-topic" style="color:${col}">● ${c.topic}</div>
        <div class="rc-stats">
          <div class="rc-stat"><div class="rc-stat-label">Score</div><div class="rc-stat-val" style="color:var(--green)">${c.score.toFixed(1)}</div></div>
          <div class="rc-stat"><div class="rc-stat-label">Duration</div><div class="rc-stat-val">${c.duration}h</div></div>
        </div>
      </div>`;
  });
  html += `</div>`;

  html += `<div class="sec-header"><h2>🔥 Hard but High Impact (AVL Traversal)</h2><div class="sec-line"></div></div>`;
  html += `<div class="rec-grid">`;
  hi.forEach((c, i) => {
    const col = TOPIC_COLORS[c.topic] || '#8b93b0';
    html += `
      <div class="rec-card hard fade-in" style="animation-delay:${i * 0.08}s">
        <div class="rc-rank" style="background:rgba(245,166,35,0.15);color:var(--amber)">#${i + 1}</div>
        <div class="rc-tag" style="background:rgba(245,166,35,0.12);color:var(--amber)">HARD &amp; IMPACTFUL</div>
        <div class="rc-name">${c.name}</div>
        <div class="rc-topic" style="color:${col}">● ${c.topic}</div>
        <div class="rc-stats">
          <div class="rc-stat"><div class="rc-stat-label">Score</div><div class="rc-stat-val" style="color:var(--amber)">${c.score.toFixed(1)}</div></div>
          <div class="rc-stat"><div class="rc-stat-label">Difficulty</div><div class="rc-stat-val" style="color:var(--red)">${['','★','★★','★★★','★★★★','★★★★★'][c.difficulty]}</div></div>
        </div>
      </div>`;
  });
  html += `</div>`;

  if (skipped.length) {
    html += `<div class="sec-header"><h2>⏭ Skipped Courses</h2><div class="sec-line"></div></div>`;
    html += `<div class="skipped-list">`;
    skipped.slice(0, 6).forEach(c => {
      const reason = c.duration > budget ? 'Exceeds budget' : 'DP selected higher-value subset';
      html += `
        <div class="skip-item">
          <div class="ci-dot" style="background:var(--text3)"></div>
          <div style="flex:1">
            <div style="font-weight:500">${c.name}</div>
            <div class="skip-reason">${reason}</div>
          </div>
          <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3)">${c.duration}h · ${c.score.toFixed(1)} pts</div>
        </div>`;
    });
    if (skipped.length > 6) {
      html += `<div style="font-size:11px;color:var(--text3);text-align:center;padding:8px;font-family:var(--font-mono)">+${skipped.length - 6} more skipped</div>`;
    }
    html += `</div>`;
  }

  document.getElementById('rec-output').innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────
// DP TABLE VISUALIZER
// ─────────────────────────────────────────────────────────────────────
let dpTableData = null;

function renderDPTable(dp) {
  dpTableData = dp;
  dpCurStep   = 0;
  dpSteps     = [];

  const stride = Math.max(1, Math.floor(dp.W / 20));
  for (let i = 1; i <= dp.n; i++) {
    for (let j = stride; j <= dp.W; j += stride) {
      dpSteps.push({ i, j });
    }
  }

  const maxCols = Math.min(dp.W, 30);
  const stride2 = Math.max(1, Math.floor(dp.W / maxCols));

  let html = `<table class="dp-table"><thead><tr><th>Course \\ W</th>`;
  for (let j = 0; j <= dp.W; j += stride2) html += `<th>${j}</th>`;
  html += `</tr></thead><tbody>`;

  for (let i = 0; i <= dp.n; i++) {
    const label = i === 0 ? '∅' : (dp.courses[i - 1].name.substring(0, 14) + '…');
    html += `<tr><td style="text-align:left;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;color:var(--text2)">${label}</td>`;
    for (let j = 0; j <= dp.W; j += stride2) {
      const v = dp.dp[i][j];
      html += `<td id="dpc-${i}-${j}">${v > 0 ? v.toFixed(0) : '0'}</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;
  document.getElementById('dp-table-wrap').innerHTML = html;
  document.getElementById('dp-step-info').textContent =
    `Step 0 / ${dpSteps.length} — Click Next to step through`;
}

function dpStepNext() {
  if (!dpTableData) { notify('Run recommendation first', 'error'); return; }
  if (dpCurStep >= dpSteps.length) return;

  const s = dpSteps[dpCurStep];
  if (dpCurStep > 0) {
    const prev = dpSteps[dpCurStep - 1];
    const el   = document.getElementById(`dpc-${prev.i}-${prev.j}`);
    if (el) el.className = '';
  }
  const el = document.getElementById(`dpc-${s.i}-${s.j}`);
  if (el) el.className = 'cur-cell';
  dpCurStep++;

  document.getElementById('dp-step-info').textContent =
    `Step ${dpCurStep}/${dpSteps.length} — Course: "${dpTableData.courses[s.i - 1].name.substring(0, 20)}", W=${s.j}, Value=${dpTableData.dp[s.i][s.j].toFixed(1)}`;
}

function dpStepPrev() {
  if (dpCurStep <= 1) return;
  dpCurStep--;
  const s  = dpSteps[dpCurStep];
  const el = document.getElementById(`dpc-${s.i}-${s.j}`);
  if (el) el.className = 'cur-cell';
}

function dpReset() {
  dpCurStep = 0;
  document.querySelectorAll('.dp-table td').forEach(el => el.className = '');
  document.getElementById('dp-step-info').textContent =
    `Step 0 / ${dpSteps.length} — Click Next to step through`;
}

function dpShowTraceback() {
  if (!dpTableData) return;
  document.querySelectorAll('.dp-table td').forEach(el => el.className = '');

  const dp = dpTableData;
  let j    = dp.W;
  for (let i = dp.n; i > 0; i--) {
    const el = document.getElementById(`dpc-${i}-${j}`);
    if (dp.dp[i][j] !== dp.dp[i - 1][j]) {
      if (el) el.className = 'traceback';
      j -= dp.courses[i - 1].duration;
    } else {
      if (el) el.className = 'highlight';
    }
  }
  notify('Traceback path highlighted in green', 'info');
}

function dpAutoPlay() {
  if (dpPlaying) { clearInterval(dpPlayInt); dpPlaying = false; return; }
  dpPlaying = true;
  dpCurStep = 0;
  dpPlayInt = setInterval(() => {
    if (dpCurStep >= dpSteps.length) { clearInterval(dpPlayInt); dpPlaying = false; return; }
    dpStepNext();
  }, 60);
}

// ─────────────────────────────────────────────────────────────────────
// AVL TREE VISUALIZER
// ─────────────────────────────────────────────────────────────────────
function drawAVL() {
  const tree = buildAVL();
  const svg  = document.getElementById('avl-canvas');
  svg.innerHTML = '';

  const h   = tree.height();
  const vbH = Math.max(400, h * 90 + 60);
  svg.setAttribute('viewBox', `0 0 900 ${vbH}`);

  if (!tree.root) {
    svg.innerHTML = `<text x="450" y="200" text-anchor="middle" fill="var(--text3)" font-size="14">No courses in tree</text>`;
    return;
  }

  const positions = new Map();
  assignPositions(tree.root, 0, 0, 1, positions, 900);
  drawEdges(svg, tree.root, positions);
  drawNodes(svg, tree.root, positions);

  const n = tree.inorder().length;
  document.getElementById('avl-info').textContent = `${n} nodes · Height: ${h} · Balanced: ✓`;
  document.getElementById('s-avl-h').textContent  = h;
}

function assignPositions(node, depth, left, right, map, width) {
  if (!node) return;
  const mid = (left + right) / 2;
  map.set(node, { x: mid * width, y: 60 + depth * 85 });
  assignPositions(node.left,  depth + 1, left, mid,   map, width);
  assignPositions(node.right, depth + 1, mid,  right, map, width);
}

function drawEdges(svg, node, map) {
  if (!node) return;
  const p = map.get(node);

  [node.left, node.right].forEach(child => {
    if (!child) return;
    const c    = map.get(child);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', p.x);    line.setAttribute('y1', p.y + 24);
    line.setAttribute('x2', c.x);    line.setAttribute('y2', c.y - 24);
    line.setAttribute('stroke',       'var(--border2)');
    line.setAttribute('stroke-width', '1.5');
    svg.appendChild(line);
    drawEdges(svg, child, map);
  });
}

function drawNodes(svg, node, map) {
  if (!node) return;
  const pos        = map.get(node);
  const c          = node.course;
  const isSelected = selectedIds.has(c.id);
  const score      = c.score || computeScore(c);

  let fill   = isSelected ? 'var(--green2)' : score >= 70 ? 'var(--accent)'  : score >= 50 ? 'var(--blue2)'   : 'var(--bg4)';
  let stroke = isSelected ? 'var(--green)'  : score >= 70 ? 'var(--accent2)' : score >= 50 ? 'var(--blue)'    : 'var(--border2)';

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.style.cursor = 'pointer';
  g.addEventListener('mouseenter', e => showNodePopup(e, node, pos));
  g.addEventListener('mouseleave', ()  => hideNodePopup());

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', pos.x); circle.setAttribute('cy', pos.y); circle.setAttribute('r', 22);
  circle.setAttribute('fill', fill); circle.setAttribute('stroke', stroke); circle.setAttribute('stroke-width', '2');
  g.appendChild(circle);

  const scoreT = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  scoreT.setAttribute('x', pos.x); scoreT.setAttribute('y', pos.y - 5);
  scoreT.setAttribute('text-anchor', 'middle'); scoreT.setAttribute('dominant-baseline', 'central');
  scoreT.setAttribute('fill', '#fff'); scoreT.setAttribute('font-size', '9');
  scoreT.setAttribute('font-weight', '700'); scoreT.setAttribute('font-family', 'DM Mono, monospace');
  scoreT.textContent = score.toFixed(0);
  g.appendChild(scoreT);

  const ht = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  ht.setAttribute('x', pos.x); ht.setAttribute('y', pos.y + 8);
  ht.setAttribute('text-anchor', 'middle'); ht.setAttribute('dominant-baseline', 'central');
  ht.setAttribute('fill', 'rgba(255,255,255,0.5)'); ht.setAttribute('font-size', '7');
  ht.setAttribute('font-family', 'DM Mono, monospace');
  ht.textContent = `h=${node.height}`;
  g.appendChild(ht);

  const name  = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const short = c.name.length > 12 ? c.name.substring(0, 12) + '…' : c.name;
  name.setAttribute('x', pos.x); name.setAttribute('y', pos.y + 34);
  name.setAttribute('text-anchor', 'middle'); name.setAttribute('fill', 'var(--text2)');
  name.setAttribute('font-size', '8'); name.setAttribute('font-family', 'DM Sans, sans-serif');
  name.textContent = short;
  g.appendChild(name);

  svg.appendChild(g);
  drawNodes(svg, node.left,  map);
  drawNodes(svg, node.right, map);
}

function showNodePopup(e, node, pos) {
  const popup = document.getElementById('node-popup');
  const c     = node.course;
  const score = (c.score || computeScore(c)).toFixed(2);
  const bf    = (node.left ? node.left.height : 0) - (node.right ? node.right.height : 0);

  document.getElementById('np-name').textContent  = c.name.substring(0, 20);
  document.getElementById('np-score').textContent = score;
  document.getElementById('np-dur').textContent   = c.duration + 'h';
  document.getElementById('np-rat').textContent   = c.rating + '★';
  document.getElementById('np-ht').textContent    = node.height;
  document.getElementById('np-bal').textContent   = bf;

  const svgEl  = document.getElementById('avl-canvas');
  const rect   = svgEl.getBoundingClientRect();
  const svgH   = parseFloat(svgEl.getAttribute('viewBox').split(' ')[3]);
  const svgX   = (pos.x / 900)  * rect.width;
  const svgY   = (pos.y / svgH) * rect.height;

  popup.style.left     = (rect.left + svgX + 30) + 'px';
  popup.style.top      = (rect.top  + svgY)       + 'px';
  popup.style.position = 'fixed';
  popup.style.display  = 'block';
}

function hideNodePopup() {
  document.getElementById('node-popup').style.display = 'none';
}

function animateAVLBuild() {
  const tree = new AVLTree();
  const sc   = scoredCourses();
  const svg  = document.getElementById('avl-canvas');
  svg.innerHTML = '';
  let idx = 0;

  function step() {
    if (idx >= sc.length) return;
    tree.insert(sc[idx]); idx++;
    svg.innerHTML = '';

    const h   = tree.height();
    const vbH = Math.max(400, h * 90 + 60);
    svg.setAttribute('viewBox', `0 0 900 ${vbH}`);

    if (tree.root) {
      const positions = new Map();
      assignPositions(tree.root, 0, 0, 1, positions, 900);
      drawEdges(svg, tree.root, positions);
      drawNodes(svg, tree.root, positions);
    }

    document.getElementById('avl-info').textContent = `Inserting ${idx}/${sc.length} · Height: ${h}`;
    setTimeout(step, 200);
  }
  step();
}

function avlFitView() { drawAVL(); }

// ─────────────────────────────────────────────────────────────────────
// ANALYTICS CHARTS  — fixed rendering
// ─────────────────────────────────────────────────────────────────────
let scoreChartInst = null;
let topicChartInst = null;

// Shared Chart.js defaults for dark theme
const CHART_DEFAULTS = {
  color: '#8b93b0',
  borderColor: 'rgba(255,255,255,0.05)',
};

function destroyChart(inst) {
  if (inst) {
    try { inst.destroy(); } catch (e) { /* ignore */ }
  }
  return null;
}

function renderCharts() {
  const sc = scoredCourses();

  // ── Score Distribution Bar Chart ──────────────────────────────────
  const bins       = [0, 0, 0, 0, 0];
  const binLabels  = ['< 35', '35–50', '50–65', '65–80', '80+'];
  const binColors  = ['#4a5270', '#4fa3f7', '#7c6dff', '#a08bff', '#c5b8ff'];

  sc.forEach(c => {
    const s = computeScore(c);
    if      (s >= 80) bins[4]++;
    else if (s >= 65) bins[3]++;
    else if (s >= 50) bins[2]++;
    else if (s >= 35) bins[1]++;
    else              bins[0]++;
  });

  scoreChartInst = destroyChart(scoreChartInst);

  const sCanvas = document.getElementById('score-chart');
  scoreChartInst = new Chart(sCanvas, {
    type: 'bar',
    data: {
      labels: binLabels,
      datasets: [{
        label: 'Courses',
        data:  bins,
        backgroundColor: binColors,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,   // CRITICAL — lets the .chart-wrap height control size
      animation: { duration: 600, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1f2b',
          borderColor: '#3a4560',
          borderWidth: 1,
          titleColor: '#e8eaf2',
          bodyColor: '#8b93b0',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.parsed.y} course${ctx.parsed.y !== 1 ? 's' : ''}`,
          },
        },
      },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#8b93b0', font: { family: 'DM Mono, monospace', size: 11 } },
          border: { display: false },
        },
        y: {
          grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: {
            color: '#8b93b0',
            font: { family: 'DM Mono, monospace', size: 11 },
            stepSize: 1,
            precision: 0,
          },
          border: { display: false },
          beginAtZero: true,
        },
      },
    },
  });

  // ── Topic Coverage Doughnut Chart ─────────────────────────────────
  const topicCounts = {};
  sc.forEach(c => { topicCounts[c.topic] = (topicCounts[c.topic] || 0) + 1; });

  const tLabels = Object.keys(topicCounts);
  const tData   = Object.values(topicCounts);
  const tColors = tLabels.map(t => TOPIC_COLORS[t] || '#8b93b0');

  // Slightly transparent border to separate slices cleanly
  const tBorderColors = tColors.map(c => c + '33');

  topicChartInst = destroyChart(topicChartInst);

  const tCanvas = document.getElementById('topic-chart');
  topicChartInst = new Chart(tCanvas, {
    type: 'doughnut',
    data: {
      labels: tLabels,
      datasets: [{
        data:            tData,
        backgroundColor: tColors,
        borderColor:     '#12161f',   // matches --bg2, creates clean slice separation
        borderWidth:     3,
        hoverOffset:     8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,   // CRITICAL
      animation: { duration: 700, easing: 'easeOutQuart' },
      cutout: '60%',
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: '#8b93b0',
            font: { family: 'DM Mono, monospace', size: 10 },
            boxWidth: 10,
            boxHeight: 10,
            borderRadius: 3,
            padding: 10,
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          backgroundColor: '#1a1f2b',
          borderColor: '#3a4560',
          borderWidth: 1,
          titleColor: '#e8eaf2',
          bodyColor: '#8b93b0',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} course${ctx.parsed !== 1 ? 's' : ''}`,
          },
        },
      },
    },
  });

  // ── Complexity Table ──────────────────────────────────────────────
  const rows = [
    ['Insert Course',       'AVL Tree',        'O(log n)',                                  'O(n)',   'var(--accent)'],
    ['Score All Courses',   'Linear Scan',     'O(n)',                                      'O(1)',   'var(--blue)'],
    ['Optimal Selection',   '0/1 Knapsack DP', `O(n·W) = O(${courses.length}·${budget})`,  'O(n·W)', 'var(--green)'],
    ['Top-K Quick Wins',    'Min-Heap',        'O(n log k)',                                'O(k)',   'var(--amber)'],
    ['Sorted Traversal',    'AVL In-Order',    'O(n)',                                      'O(n)',   'var(--teal)'],
    ['Hard & High Impact',  'AVL Filter',      'O(n)',                                      'O(k)',   'var(--red)'],
  ];

  document.getElementById('complexity-table').innerHTML = rows.map(r => `
    <tr style="border-bottom:1px solid var(--border)">
      <td style="padding:8px 12px;font-weight:500">${r[0]}</td>
      <td style="padding:8px 12px;color:var(--text2)">${r[1]}</td>
      <td style="padding:8px 12px;text-align:center">
        <span style="background:rgba(124,109,255,0.12);color:${r[4]};padding:3px 8px;border-radius:5px;font-size:11px">${r[2]}</span>
      </td>
      <td style="padding:8px 12px;text-align:center">
        <span style="background:rgba(79,163,247,0.1);color:var(--blue);padding:3px 8px;border-radius:5px;font-size:11px">${r[3]}</span>
      </td>
    </tr>`).join('');
}

// ─────────────────────────────────────────────────────────────────────
// STATS UPDATE
// ─────────────────────────────────────────────────────────────────────
function updateStatsNumbers(dp) {
  document.getElementById('s-selected').textContent = dp.selected.length;
  document.getElementById('s-hours').textContent    = dp.selected.reduce((a, c) => a + c.duration, 0) + 'h';
  document.getElementById('s-avl-h').textContent    = buildAVL().height();
}

// ─────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────
function init() {
  refreshCourseList();
  drawAVL();
  // Defer chart render until fonts/layout are ready
  requestAnimationFrame(() => {
    setTimeout(renderCharts, 50);
  });
}

init();