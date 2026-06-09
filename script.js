// ============================================
// JUEGO DE HABILIDADES - Sistema Profesional
// 16 Categorías | Preguntas Aleatorias
// ============================================

const playerNameInput = document.getElementById('playerName');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerList = document.getElementById('playerList');
const activePlayerSelect = document.getElementById('activePlayerSelect');
const challengeSection = document.getElementById('challengeSection');
const challengeTitle = document.getElementById('challengeTitle');
const challengeContent = document.getElementById('challengeContent');
const submitAnswersBtn = document.getElementById('submitAnswersBtn');
const resultsBox = document.getElementById('resultsBox');
const resultsText = document.getElementById('resultsText');
const resetBtn = document.getElementById('resetBtn');
const scoreboard = document.getElementById('scoreboard');
const leaderboard = document.getElementById('leaderboard');
const gameBoard = document.getElementById('gameBoard');
const spectatorBtn = document.getElementById('spectatorBtn');
const spectatorBtnMain = document.getElementById('spectatorBtnMain');

const players = [];
let currentCategory = '';
let selectedPlayer = '';
let boardPosition = { row: 1, col: 1 };
let currentQuestions = [];
let answerSubmitted = false;

// TABLERO 4x4 CON 16 CATEGORÍAS
const boardLayout = [
  ['mecanografia', 'excel', 'formulas', 'peliculas'],
  ['futbol', 'start', 'codigo', 'agilidad'],
  ['python', 'animales', 'habilidades', 'javascript'],
  ['liderazgo', 'negocios', 'musica', 'cultura']
];

// BASE DE DATOS DE PREGUNTAS - 16 CATEGORÍAS
const questionDatabase = {
  mecanografia: [
    { type: 'typing', text: 'El equipo aprende rápido y trabaja con entusiasmo constante.' },
    { type: 'typing', text: 'La transformación digital impulsa el éxito empresarial moderno.' },
    { type: 'typing', text: 'Mecanografía rápida y precisa aumenta la productividad diaria.' },
    { type: 'typing', text: 'Practicar escritura es fundamental para dominar cualquier idioma.' },
    { type: 'typing', text: 'Los errores de tipeo pueden alterar el significado del mensaje.' },
    { type: 'typing', text: 'La velocidad en escritura es una habilidad profesional esencial.' }
  ],
  excel: [
    { type: 'choice', label: '¿Cuál es la fórmula para sumar A1:A5?', options: ['=SUMA(A1:A5)', '=SUM(A1,A5)', '=A1+A5', '=TOTAL(A1:A5)'], answer: '=SUMA(A1:A5)' },
    { type: 'choice', label: '¿Qué atajo copia el contenido?', options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + Z', 'Ctrl + S'], answer: 'Ctrl + C' },
    { type: 'text', label: 'Escribe la fórmula para el máximo de B2:B10.', answer: 'MAX' },
    { type: 'choice', label: '¿Cuál es el atajo para pegar?', options: ['Ctrl + A', 'Ctrl + X', 'Ctrl + V', 'Ctrl + Z'], answer: 'Ctrl + V' },
    { type: 'choice', label: '¿Qué función calcula el promedio?', options: ['SUMA', 'PROMEDIO', 'MAX', 'CONTAR'], answer: 'PROMEDIO' },
    { type: 'text', label: 'Escribe una fórmula para contar células no vacías.', answer: 'COUNTA' }
  ],
  formulas: [
    { type: 'choice', label: 'Si x=5 y y=3, ¿cuánto vale 2x+y?', options: ['10', '11', '13', '7'], answer: '13' },
    { type: 'choice', label: '¿Cuál es 12/4+3?', options: ['6', '0', '5', '10'], answer: '6' },
    { type: 'text', label: 'Escribe la fórmula del área de un rectángulo.', answer: 'base' },
    { type: 'choice', label: 'Si a=2 y b=3, ¿cuánto vale 3a+2b?', options: ['12', '13', '11', '14'], answer: '12' },
    { type: 'choice', label: '¿Cuál es 15% de 200?', options: ['30', '20', '40', '25'], answer: '30' },
    { type: 'text', label: 'Si área=50 y base=10, ¿cuál es la altura?', answer: '5' }
  ],
  peliculas: [
    { type: 'choice', label: '¿Quién dirigió La Guerra de las Galaxias?', options: ['Christopher Nolan', 'Steven Spielberg', 'George Lucas', 'Peter Jackson'], answer: 'George Lucas' },
    { type: 'choice', label: '¿Cuál serie pertenece a Marvel?', options: ['Stranger Things', 'Loki', 'Breaking Bad', 'The Crown'], answer: 'Loki' },
    { type: 'text', label: 'Película: arqueólogo busca el Arca Perdida.', answer: 'Indiana Jones' },
    { type: 'choice', label: '¿En qué año se estrenó Avatar?', options: ['2007', '2008', '2009', '2010'], answer: '2009' },
    { type: 'choice', label: '¿Quién dirigió Titanic?', options: ['Steven Spielberg', 'James Cameron', 'Christopher Nolan', 'Denis Villeneuve'], answer: 'James Cameron' },
    { type: 'text', label: 'Actor que juega Spider-Man en el MCU.', answer: 'Tom Holland' }
  ],
  futbol: [
    { type: 'choice', label: '¿Cuántos jugadores tiene un equipo de fútbol?', options: ['10', '11', '12', '13'], answer: '11' },
    { type: 'choice', label: '¿Cuánto dura un partido de fútbol?', options: ['60 minutos', '80 minutos', '90 minutos', '120 minutos'], answer: '90 minutos' },
    { type: 'text', label: '¿Quién ganó el Balón de Oro 2023?', answer: 'Messi' },
    { type: 'choice', label: '¿Cuál NO es un torneo importante?', options: ['Champions League', 'Copa Mundial', 'Amistoso', 'Eurocopa'], answer: 'Amistoso' },
    { type: 'choice', label: '¿Cuántos equipos hay en una liga profesional típica?', options: ['16', '18', '20', '22'], answer: '20' },
    { type: 'text', label: 'Equipo con más Championes League: Real Madrid o Liverpool.', answer: 'Real Madrid' }
  ],
  codigo: [
    { type: 'choice', label: '¿Qué lenguaje es más usado en web?', options: ['Python', 'JavaScript', 'C++', 'Java'], answer: 'JavaScript' },
    { type: 'text', label: 'Atajo para comentar línea en la mayoría de IDEs.', answer: 'Ctrl' },
    { type: 'choice', label: '¿Qué es un bug?', options: ['Programa malicioso', 'Error en el código', 'Tipo de dato', 'Función especial'], answer: 'Error en el código' },
    { type: 'choice', label: '¿Qué significa API?', options: ['Aplicación Pública', 'Interfaz de Programación', 'Archivo Principal', 'Acceso Público Ilimitado'], answer: 'Interfaz de Programación' },
    { type: 'text', label: 'El proceso de corregir errores en código.', answer: 'debugging' },
    { type: 'choice', label: '¿Cuál es la estructura básica de HTML?', options: ['<head>, <body>', '<html>, <head>, <body>', '<div>, <span>', '<p>, <a>'], answer: '<html>, <head>, <body>' }
  ],
  agilidad: [
    { type: 'choice', label: '¿Qué es Scrum?', options: ['Un juego', 'Metodología ágil', 'Lenguaje de programación', 'Base de datos'], answer: 'Metodología ágil' },
    { type: 'text', label: 'Reunión diaria de Scrum: Daily...', answer: 'standup' },
    { type: 'choice', label: '¿Cuánto dura un Sprint típico?', options: ['1 semana', '2 semanas', '1 mes', '3 meses'], answer: '2 semanas' },
    { type: 'choice', label: '¿Quién lidera un equipo Scrum?', options: ['Project Manager', 'Scrum Master', 'CEO', 'Director Técnico'], answer: 'Scrum Master' },
    { type: 'text', label: 'Otra metodología ágil además de Scrum.', answer: 'Kanban' },
    { type: 'choice', label: '¿Cuál es el objetivo del Daily Standup?', options: ['Reportes largos', 'Sincronización rápida', 'Revisión de código', 'Evaluación de desempeño'], answer: 'Sincronización rápida' }
  ],
  python: [
    { type: 'choice', label: '¿Quién creó Python?', options: ['Guido van Rossum', 'Bjarne Stroustrup', 'Dennis Ritchie', 'Brendan Eich'], answer: 'Guido van Rossum' },
    { type: 'text', label: 'Símbolo para comentar en Python.', answer: '#' },
    { type: 'choice', label: '¿Para qué es ideal Python?', options: ['Juegos 3D', 'Data Science', 'Sistemas operativos', 'Aplicaciones móviles'], answer: 'Data Science' },
    { type: 'choice', label: '¿Cuál es el índice inicial en Python?', options: ['1', '0', '-1', 'null'], answer: '0' },
    { type: 'text', label: 'Tipo de datos para listas en Python.', answer: 'list' },
    { type: 'choice', label: '¿Qué no es correcto en Python?', options: ['for i in range(10):', 'if x > 5:', 'while x = 10:', 'def funcion():'], answer: 'while x = 10:' }
  ],
  animales: [
    { type: 'choice', label: '¿Cuál es el animal más rápido?', options: ['Gato', 'Guepardo', 'Águila', 'Pez espada'], answer: 'Guepardo' },
    { type: 'text', label: '¿Cuántas patas tiene una araña?', answer: '8' },
    { type: 'choice', label: '¿Dónde vive el pingüino?', options: ['Ártico', 'Antártida', 'Madagascar', 'Islas Galápagos'], answer: 'Antártida' },
    { type: 'choice', label: '¿Cuál animal tiene el corazón más grande?', options: ['Elefante', 'Ballena azul', 'Jirafa', 'Oso polar'], answer: 'Ballena azul' },
    { type: 'text', label: 'Animal que pone huevos pero es mamífero.', answer: 'ornitorrinco' },
    { type: 'choice', label: '¿Cuál animal vive más años?', options: ['Loro', 'Tortuga', 'Humano', 'Ballena'], answer: 'Tortuga' }
  ],
  habilidades: [
    { type: 'choice', label: '¿Cuál es habilidad blanda importante?', options: ['Mecanografía', 'Comunicación', 'Excel avanzado', 'Programación'], answer: 'Comunicación' },
    { type: 'choice', label: '¿Qué busca información en Windows?', options: ['Explorador', 'Barra búsqueda', 'Calculadora', 'Bloc notas'], answer: 'Barra búsqueda' },
    { type: 'text', label: 'Habilidad para trabajar efectivamente en equipo.', answer: 'colaboracion' },
    { type: 'choice', label: '¿Habilidad más demandada en empleos?', options: ['Mecanografía', 'Pensamiento crítico', 'Dibujo', 'Música'], answer: 'Pensamiento crítico' },
    { type: 'choice', label: '¿Qué genera la organización?', options: ['Caos', 'Estrés', 'Productividad', 'Pérdida de tiempo'], answer: 'Productividad' },
    { type: 'text', label: 'Herramienta popular de gestión de tareas.', answer: 'Trello' }
  ],
  javascript: [
    { type: 'choice', label: '¿Dónde se ejecuta JavaScript principalmente?', options: ['Servidor', 'Navegador', 'Móvil', 'Consola'], answer: 'Navegador' },
    { type: 'text', label: 'Variable para crear en JavaScript: var, let o...', answer: 'const' },
    { type: 'choice', label: '¿Cuál es la función para parsear JSON?', options: ['parse()', 'stringify()', 'format()', 'convert()'], answer: 'parse()' },
    { type: 'choice', label: '¿Quién creó JavaScript?', options: ['Brendan Eich', 'Guido van Rossum', 'Denis Ritchie', 'Bjarne Stroustrup'], answer: 'Brendan Eich' },
    { type: 'text', label: 'Evento que se dispara al hacer clic en un elemento.', answer: 'click' },
    { type: 'choice', label: '¿Qué selecciona elementos por ID?', options: ['querySelector()', 'getElementById()', 'getElementByClass()', 'select()'], answer: 'getElementById()' }
  ],
  liderazgo: [
    { type: 'choice', label: '¿Qué es liderazgo transformacional?', options: ['Dictar órdenes', 'Inspirar cambio', 'Sólo dar dirección', 'Controlar'], answer: 'Inspirar cambio' },
    { type: 'text', label: 'Habilidad esencial para un líder.', answer: 'escucha' },
    { type: 'choice', label: '¿Cuál NO es un estilo de liderazgo?', options: ['Autocrático', 'Democrático', 'Laissez-faire', 'Omnisciente'], answer: 'Omnisciente' },
    { type: 'choice', label: '¿Cómo motiva un buen líder?', options: ['Con miedo', 'Por interés genuino', 'Amenazas', 'Castigos'], answer: 'Por interés genuino' },
    { type: 'text', label: 'Capacidad de entender emociones propias y ajenas.', answer: 'inteligencia emocional' },
    { type: 'choice', label: '¿Qué busca un líder coach?', options: ['Control total', 'Desarrollo del equipo', 'Poder personal', 'Autoridad absoluta'], answer: 'Desarrollo del equipo' }
  ],
  negocios: [
    { type: 'choice', label: '¿Qué es ROI?', options: ['Retorno Operativo', 'Retorno sobre Inversión', 'Riesgo Operativo', 'Rentabilidad Oficial'], answer: 'Retorno sobre Inversión' },
    { type: 'text', label: 'Estrategia: precio bajo, volumen alto.', answer: 'penetracion' },
    { type: 'choice', label: '¿Cuál es el ciclo de vida del producto?', options: ['Introducción, crecimiento, madurez, declive', 'Inicio, desarrollo, cierre', 'Lanzamiento, pico, fin', 'Idea, producto, venta'], answer: 'Introducción, crecimiento, madurez, declive' },
    { type: 'choice', label: '¿Qué significa FODA?', options: ['Fortalezas, Oportunidades, Debilidades, Amenazas', 'Finanzas, Operaciones, Datos, Activos', 'Función, Objetivo, Dirección, Análisis', 'Flujo, Orden, Decisión, Auditoría'], answer: 'Fortalezas, Oportunidades, Debilidades, Amenazas' },
    { type: 'text', label: 'Estudio para conocer necesidades del cliente.', answer: 'mercado' },
    { type: 'choice', label: '¿Cuál es el mejor precio?', options: ['El más bajo', 'El más alto', 'El que maximiza valor', 'Sin relación'], answer: 'El que maximiza valor' }
  ],
  musica: [
    { type: 'choice', label: '¿Cuántas notas tiene la escala musical?', options: ['5', '7', '8', '12'], answer: '7' },
    { type: 'text', label: '¿Quién compuso las Cuatro Estaciones?', answer: 'Vivaldi' },
    { type: 'choice', label: '¿Qué instrumento es de viento?', options: ['Violín', 'Flauta', 'Batería', 'Piano'], answer: 'Flauta' },
    { type: 'choice', label: '¿Cuántos elementos tiene un acorde tríada?', options: ['2', '3', '4', '5'], answer: '3' },
    { type: 'text', label: 'Velocidad de una canción en música.', answer: 'tempo' },
    { type: 'choice', label: '¿Cuál es el rango de un soprano?', options: ['Bajo', 'Tenor', 'Agudo', 'Barítono'], answer: 'Agudo' }
  ],
  cultura: [
    { type: 'choice', label: '¿Cuál es el monumento más visitado del mundo?', options: ['Big Ben', 'Torre Eiffel', 'Gran Muralla China', 'Coliseo'], answer: 'Gran Muralla China' },
    { type: 'text', label: 'País donde se originó el flamenco.', answer: 'España' },
    { type: 'choice', label: '¿Quién pintó la Persistencia de la Memoria?', options: ['Dalí', 'Picasso', 'Miró', 'Gaudí'], answer: 'Dalí' },
    { type: 'choice', label: '¿Cuál es la novela más leída del mundo?', options: ['Don Quijote', 'La Biblia', 'Harry Potter', 'Cien años de soledad'], answer: 'Don Quijote' },
    { type: 'text', label: '¿En qué año se firmó la Declaración de Independencia de EE.UU.?', answer: '1776' },
    { type: 'choice', label: '¿Cuál es la danza típica de Argentina?', options: ['Salsa', 'Tango', 'Samba', 'Flamenco'], answer: 'Tango' }
  ]
};

function createPlayer(name) {
  return { name, totalPoints: 0, totalAnswers: 0 };
}

function getRandomQuestions(category, count = 3) {
  const db = questionDatabase[category] || [];
  const shuffled = [...db].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function renderPlayers() {
  playerList.innerHTML = '';
  activePlayerSelect.innerHTML = '<option value="">Selecciona activo</option>';
  const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  const medals = ['🥇', '🥈', '🥉'];
  
  sorted.forEach((player, idx) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    if (idx === 0 && players.length > 0) li.classList.add('leader');
    li.innerHTML = `<span class="rank">${medals[idx] || '·'}</span><span>${player.name}</span><small>${player.totalPoints}p · ${player.totalAnswers}r</small>`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', () => {
      const idx = players.indexOf(player);
      if (idx > -1) players.splice(idx, 1);
      if (selectedPlayer === player.name) selectedPlayer = '';
      renderPlayers();
      renderScoreboard();
      syncData();
    });

    li.appendChild(removeBtn);
    playerList.appendChild(li);

    const option = document.createElement('option');
    option.value = player.name;
    option.textContent = `${player.name} (${player.totalPoints}p)`;
    activePlayerSelect.appendChild(option);
  });
}

function renderScoreboard() {
  if (players.length === 0) {
    scoreboard.innerHTML = '<p class="empty-state">Agrega jugadores</p>';
    leaderboard.innerHTML = '<p class="empty-state">-</p>';
    return;
  }

  const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  const medals = ['🥇', '🥈', '🥉'];
  const rows = sorted.map((p, i) => `<tr class="${i === 0 ? 'winner' : ''}"><td><span class="medal">${medals[i] || '·'}</span> ${p.name}</td><td class="points">${p.totalPoints}</td><td>${p.totalAnswers}</td></tr>`).join('');
  scoreboard.innerHTML = `<table><thead><tr><th>Jugador</th><th>Pts</th><th>Res</th></tr></thead><tbody>${rows}</tbody></table>`;

  if (sorted.length > 0) {
    const top = sorted[0];
    const topAns = sorted.reduce((a, b) => a.totalAnswers > b.totalAnswers ? a : b);
    leaderboard.innerHTML = `<div class="leader-stat"><p>🏆 <strong>${top.name}</strong> lidera con ${top.totalPoints}p</p><p>💬 <strong>${topAns.name}</strong> respondió ${topAns.totalAnswers}</p></div>`;
  }
}

function renderBoard() {
  gameBoard.innerHTML = '';
  boardLayout.forEach((row, ri) => {
    row.forEach((node, ci) => {
      const cell = document.createElement('button');
      cell.className = 'board-cell';
      if (boardPosition.row === ri && boardPosition.col === ci) cell.classList.add('active');
      if (!node) {
        cell.classList.add('empty');
        cell.innerHTML = '·';
      } else if (node === 'start') {
        cell.innerHTML = '⭐';
      } else {
        const icons = {
          mecanografia: '⌨', excel: '📊', formulas: '∑', peliculas: '🎬',
          futbol: '⚽', codigo: '💻', agilidad: '🏃', python: '🐍',
          animales: '🦁', habilidades: '🎯', javascript: '✨', liderazgo: '👑',
          negocios: '💼', musica: '🎵', cultura: '🎭'
        };
        cell.innerHTML = icons[node] || '?';
        cell.addEventListener('click', () => {
          boardPosition = { row: ri, col: ci };
          renderBoard();
          selectCategory(node);
        });
      }
      gameBoard.appendChild(cell);
    });
  });
}

function selectCategory(cat) {
  currentCategory = cat;
  currentQuestions = getRandomQuestions(cat, 3);
  loadCategory();
}

function moveBoard(direction) {
  const next = { ...boardPosition };
  if (direction === 'ArrowUp') next.row = Math.max(0, next.row - 1);
  if (direction === 'ArrowDown') next.row = Math.min(3, next.row + 1);
  if (direction === 'ArrowLeft') next.col = Math.max(0, next.col - 1);
  if (direction === 'ArrowRight') next.col = Math.min(3, next.col + 1);
  boardPosition = next;
  renderBoard();
}

function selectBoardCell() {
  const node = boardLayout[boardPosition.row][boardPosition.col];
  if (node && node !== 'start') selectCategory(node);
}

function addPlayer() {
  const name = playerNameInput.value.trim();
  if (!name || players.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
  players.push(createPlayer(name));
  playerNameInput.value = '';
  renderPlayers();
  renderScoreboard();
  syncData();
}

function clearChallenge() {
  challengeContent.innerHTML = '';
  resultsBox.classList.add('hidden');
  resultsText.textContent = '';
  submitAnswersBtn.disabled = false;
  submitAnswersBtn.style.opacity = '1';
  submitAnswersBtn.style.cursor = 'pointer';
  answerSubmitted = false;
}

function loadCategory() {
  if (players.length === 0) {
    alert('Agrega al menos un jugador');
    return;
  }
  const icons = {
    mecanografia: '⌨', excel: '📊', formulas: '∑', peliculas: '🎬',
    futbol: '⚽', codigo: '💻', agilidad: '🏃', python: '🐍',
    animales: '🦁', habilidades: '🎯', javascript: '✨', liderazgo: '👑',
    negocios: '💼', musica: '🎵', cultura: '🎭'
  };
  challengeSection.classList.remove('hidden');
  challengeTitle.textContent = `${icons[currentCategory] || ''} ${currentCategory.toUpperCase()}`;
  clearChallenge();

  currentQuestions.forEach((item, idx) => {
    const q = document.createElement('div');
    q.className = 'challenge-question';
    const lbl = document.createElement('label');
    lbl.textContent = `${idx + 1}/${currentQuestions.length}: ${item.label || item.text}`;
    q.appendChild(lbl);

    if (item.type === 'typing') {
      const ta = document.createElement('textarea');
      ta.id = `answer-${idx}`;
      ta.placeholder = item.text;
      ta.value = '';
      q.appendChild(ta);
    } else if (item.type === 'choice') {
      const sel = document.createElement('select');
      sel.id = `answer-${idx}`;
      sel.innerHTML = '<option value="">Selecciona...</option>' + item.options.map(o => `<option value="${o}">${o}</option>`).join('');
      q.appendChild(sel);
    } else {
      const inp = document.createElement('input');
      inp.id = `answer-${idx}`;
      inp.type = 'text';
      inp.placeholder = 'Respuesta...';
      q.appendChild(inp);
    }
    challengeContent.appendChild(q);
  });
}

function normalizeAnswer(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreAnswers() {
  if (!currentCategory || players.length === 0 || answerSubmitted) return;
  answerSubmitted = true;
  const player = players.find(p => p.name === selectedPlayer) || players[0];
  let score = 0, answered = 0;

  currentQuestions.forEach((item, idx) => {
    const inp = document.getElementById(`answer-${idx}`);
    if (!inp) return;
    const res = normalizeAnswer(inp.value || '');
    if (res) answered += 1;

    if (item.type === 'typing') {
      const exp = normalizeAnswer(item.text);
      const resWords = res.split(' ');
      const expWords = exp.split(' ');
      let correct = 0;
      expWords.forEach((w, i) => { if (resWords[i] === w) correct += 1; });
      if (correct >= expWords.length * 0.75) score += 1;
    } else if (item.type === 'choice') {
      if (res === normalizeAnswer(item.answer)) score += 1;
    } else {
      const exp = normalizeAnswer(item.answer);
      if (exp.includes(res) || res.includes(exp)) score += 1;
    }
  });

  player.totalPoints += score;
  player.totalAnswers += answered;
  selectedPlayer = player.name;
  renderPlayers();
  renderScoreboard();
  syncData();

  const pct = Math.round((score / currentQuestions.length) * 100);
  resultsText.innerHTML = `<div class="result-summary"><span class="player-name">${player.name}</span><span class="score">${score}/${currentQuestions.length} (${pct}%)</span><p class="total">Total: ${player.totalPoints}p</p></div>`;
  resultsBox.classList.remove('hidden');
  submitAnswersBtn.disabled = true;
  submitAnswersBtn.style.opacity = '0.5';
  submitAnswersBtn.style.cursor = 'not-allowed';
}

function syncData() {
  localStorage.setItem('gameData', JSON.stringify(players));
}

function loadData() {
  const saved = localStorage.getItem('gameData');
  if (saved) {
    const data = JSON.parse(saved);
    players.splice(0, players.length, ...data);
    renderPlayers();
    renderScoreboard();
  }
}

function openSpectatorMode() {
  const basePath = window.location.href.split('?')[0].replace('index.html', '');
  const screenUrl = basePath + 'screen.html';
  window.open(screenUrl, 'spectator', 'width=1280,height=720');
}

// EVENT LISTENERS
addPlayerBtn.addEventListener('click', addPlayer);
playerNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addPlayer(); });
activePlayerSelect.addEventListener('change', (e) => { selectedPlayer = e.target.value; });
submitAnswersBtn.addEventListener('click', scoreAnswers);
resetBtn.addEventListener('click', () => {
  clearChallenge();
  challengeSection.classList.add('hidden');
  currentCategory = '';
});

// Ambos botones de espectador funcionan
if (spectatorBtn) spectatorBtn.addEventListener('click', openSpectatorMode);
if (spectatorBtnMain) spectatorBtnMain.addEventListener('click', openSpectatorMode);

document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT') return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    moveBoard(e.key);
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    selectBoardCell();
  }
});

loadData();
renderPlayers();
renderScoreboard();
renderBoard();
