// ============================================
// JUEGO DE HABILIDADES - Sistema Profesional
// 16 Categorías | Preguntas Aleatorias | Multijugador
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

// Elementos de la Barra Multijugador y Configuración
const multiplayerBar = document.getElementById('multiplayerBar');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const shareLinkBtn = document.getElementById('shareLinkBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');

const syncSettingsModal = document.getElementById('syncSettingsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const roomNameInput = document.getElementById('roomNameInput');
const randomRoomBtn = document.getElementById('randomRoomBtn');
const saveSyncSettingsBtn = document.getElementById('saveSyncSettingsBtn');
const disconnectSyncBtn = document.getElementById('disconnectSyncBtn');

// Variables de Estado del Juego
const players = [];
let currentCategory = '';
let selectedPlayer = '';
let boardPosition = { row: 1, col: 1 };
let currentQuestions = [];
let answerSubmitted = false;

// Variables de Estado de Firebase
let isMultiplayerActive = false;
let roomId = '';
let myPlayerName = localStorage.getItem('myPlayerName') || '';
let database = null;
const firebaseConfig = {
  apiKey: atob("QUl6YVN5RDBhbmkyQnlUdkxib0NYVm1HY2RFYk9BZzdxdXJyZGFR"),
  authDomain: "retro-e9a27.firebaseapp.com",
  projectId: "retro-e9a27",
  databaseURL: "https://retro-e9a27-default-rtdb.firebaseio.com",
  storageBucket: "retro-e9a27.firebasestorage.app",
  messagingSenderId: "51894964862",
  appId: "1:51894964862:web:43d30b9a1e5db4619e3e2f"
};
let firebaseRefs = {};

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
  return { name, totalPoints: 0, totalAnswers: 0, online: true };
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
    
    // Sincronización de estado online
    let presenceHtml = '';
    if (isMultiplayerActive) {
      const isOnline = player.online !== false;
      presenceHtml = `<span class="player-presence ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'En línea' : 'Desconectado'}"></span>`;
    }
    
    const isMeText = player.name === myPlayerName ? ' <strong>(Tú)</strong>' : '';
    li.innerHTML = `${presenceHtml}<span class="rank">${medals[idx] || '·'}</span><span>${player.name}${isMeText}</span><small>${player.totalPoints}p · ${player.totalAnswers}r</small>`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', () => {
      if (isMultiplayerActive) {
        removePlayerFromFirebase(player.name);
      } else {
        const idx = players.indexOf(player);
        if (idx > -1) players.splice(idx, 1);
        if (selectedPlayer === player.name) selectedPlayer = '';
        renderPlayers();
        renderScoreboard();
        syncData();
      }
    });

    li.appendChild(removeBtn);
    playerList.appendChild(li);

    const option = document.createElement('option');
    option.value = player.name;
    option.textContent = `${player.name} (${player.totalPoints}p)`;
    if (player.name === selectedPlayer) {
      option.selected = true;
    }
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
  if (players.length === 0) {
    alert('Agrega al menos un jugador');
    return;
  }
  
  if (isMultiplayerActive) {
    const activeP = selectedPlayer || (players[0] ? players[0].name : '');
    const questions = getRandomQuestions(cat, 3);
    
    database.ref(`rooms/${roomId}/gameState`).set({
      boardPosition: boardPosition,
      currentCategory: cat,
      currentQuestions: questions,
      selectedPlayer: activeP,
      challengeActive: true,
      answerSubmitted: false,
      results: null
    });
  } else {
    currentCategory = cat;
    currentQuestions = getRandomQuestions(cat, 3);
    loadCategory();
  }
}

function moveBoard(direction) {
  const next = { ...boardPosition };
  if (direction === 'ArrowUp') next.row = Math.max(0, next.row - 1);
  if (direction === 'ArrowDown') next.row = Math.min(3, next.row + 1);
  if (direction === 'ArrowLeft') next.col = Math.max(0, next.col - 1);
  if (direction === 'ArrowRight') next.col = Math.min(3, next.col + 1);
  boardPosition = next;
  
  if (isMultiplayerActive) {
    database.ref(`rooms/${roomId}/gameState/boardPosition`).set(boardPosition);
  } else {
    renderBoard();
  }
}

function selectBoardCell() {
  const node = boardLayout[boardPosition.row][boardPosition.col];
  if (node && node !== 'start') selectCategory(node);
}

function addPlayer() {
  const name = playerNameInput.value.trim();
  if (!name) return;
  
  if (isMultiplayerActive) {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert('Ya existe un jugador con ese nombre.');
      return;
    }
    
    myPlayerName = name;
    localStorage.setItem('myPlayerName', name);
    
    database.ref(`rooms/${roomId}/players/${name}`).set({
      name: name,
      totalPoints: 0,
      totalAnswers: 0,
      online: true
    }).then(() => {
      playerNameInput.value = '';
      setupMyPresence();
    });
  } else {
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) return;
    players.push(createPlayer(name));
    playerNameInput.value = '';
    renderPlayers();
    renderScoreboard();
    syncData();
  }
}

function removePlayerFromFirebase(name) {
  if (!isMultiplayerActive) return;
  database.ref(`rooms/${roomId}/players/${name}`).remove();
  if (myPlayerName === name) {
    myPlayerName = '';
    localStorage.removeItem('myPlayerName');
  }
}

function clearChallenge() {
  challengeContent.innerHTML = '';
  resultsBox.classList.add('hidden');
  resultsText.textContent = '';
  submitAnswersBtn.disabled = false;
  submitAnswersBtn.style.opacity = '1';
  submitAnswersBtn.style.cursor = 'pointer';
  answerSubmitted = false;
  
  const existingBanner = document.getElementById('waitBanner');
  if (existingBanner) existingBanner.remove();
}

function loadCategory() {
  if (players.length === 0) {
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

  const isMeActive = (myPlayerName && selectedPlayer && myPlayerName.toLowerCase() === selectedPlayer.toLowerCase());
  
  if (isMultiplayerActive && !isMeActive) {
    const banner = document.createElement('div');
    banner.id = 'waitBanner';
    banner.className = 'challenge-wait-banner';
    banner.innerHTML = `El jugador activo es <strong>${selectedPlayer}</strong>. Esperando a que envíe sus respuestas...`;
    challengeSection.insertBefore(banner, challengeSection.firstChild);
  }

  currentQuestions.forEach((item, idx) => {
    const q = document.createElement('div');
    q.className = 'challenge-question';
    const lbl = document.createElement('label');
    lbl.textContent = `${idx + 1}/${currentQuestions.length}: ${item.label || item.text}`;
    q.appendChild(lbl);

    let inpElement;
    if (item.type === 'typing') {
      inpElement = document.createElement('textarea');
      inpElement.placeholder = item.text;
    } else if (item.type === 'choice') {
      inpElement = document.createElement('select');
      inpElement.innerHTML = '<option value="">Selecciona...</option>' + item.options.map(o => `<option value="${o}">${o}</option>`).join('');
    } else {
      inpElement = document.createElement('input');
      inpElement.type = 'text';
      inpElement.placeholder = 'Respuesta...';
    }
    
    inpElement.id = `answer-${idx}`;
    inpElement.value = '';
    
    if (isMultiplayerActive && !isMeActive) {
      inpElement.disabled = true;
      inpElement.style.opacity = '0.7';
    }
    
    q.appendChild(inpElement);
    challengeContent.appendChild(q);
  });
  
  if (isMultiplayerActive && !isMeActive) {
    submitAnswersBtn.classList.add('hidden');
  } else {
    submitAnswersBtn.classList.remove('hidden');
  }
}

function normalizeAnswer(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreAnswers() {
  if (!currentCategory || players.length === 0 || answerSubmitted) return;
  answerSubmitted = true;
  
  const player = players.find(p => p.name.toLowerCase() === (selectedPlayer || '').toLowerCase()) || players[0];
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

  const newPoints = player.totalPoints + score;
  const newAnswers = player.totalAnswers + answered;
  const pct = Math.round((score / currentQuestions.length) * 100);

  if (isMultiplayerActive) {
    database.ref(`rooms/${roomId}/players/${player.name}`).update({
      totalPoints: newPoints,
      totalAnswers: newAnswers
    });
    
    database.ref(`rooms/${roomId}/gameState`).update({
      answerSubmitted: true,
      results: {
        playerName: player.name,
        score: score,
        total: currentQuestions.length,
        pct: pct,
        totalPoints: newPoints
      }
    });
  } else {
    player.totalPoints = newPoints;
    player.totalAnswers = newAnswers;
    selectedPlayer = player.name;
    renderPlayers();
    renderScoreboard();
    syncData();

    resultsText.innerHTML = `<div class="result-summary"><span class="player-name">${player.name}</span><span class="score">${score}/${currentQuestions.length} (${pct}%)</span><p class="total">Total: ${player.totalPoints}p</p></div>`;
    resultsBox.classList.remove('hidden');
    submitAnswersBtn.disabled = true;
    submitAnswersBtn.style.opacity = '0.5';
    submitAnswersBtn.style.cursor = 'not-allowed';
  }
}

function syncData() {
  if (!isMultiplayerActive) {
    localStorage.setItem('gameData', JSON.stringify(players));
  }
}

function loadData() {
  if (isMultiplayerActive) return;
  const saved = localStorage.getItem('gameData');
  if (saved) {
    const data = JSON.parse(saved);
    players.splice(0, players.length, ...data);
    renderPlayers();
    renderScoreboard();
  }
}

function openSpectatorMode() {
  const basePath = window.location.href.split('?')[0].split('#')[0].replace('index.html', '');
  let url = basePath + 'screen.html';
  if (isMultiplayerActive) {
    const params = new URLSearchParams();
    params.set('room', roomId);
    const configB64 = btoa(JSON.stringify(firebaseConfig));
    params.set('config', configB64);
    url += '?' + params.toString();
  }
  window.open(url, 'spectator', 'width=1280,height=720');
}

// ============================================
// FUNCIONES DE SINCRONIZACIÓN DE FIREBASE
// ============================================

function initFirebaseConnection() {
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get('room');
  let room = urlRoom || localStorage.getItem('roomName');

  if (room) {
    roomId = room;
    localStorage.setItem('roomName', room);
    connectToFirebase();
  } else {
    updateSyncUI('local', "Modo Local");
  }
}

function connectToFirebase() {
  updateSyncUI('connecting', "Conectando...");
  try {
    if (firebase.apps.length > 0) {
      firebase.app().delete().then(startFirebaseApp);
    } else {
      startFirebaseApp();
    }
  } catch (e) {
    console.error("Error de inicialización de Firebase:", e);
    updateSyncUI('error', "Error de Conexión");
  }
}

function startFirebaseApp() {
  try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    isMultiplayerActive = true;
    
    updateSyncUI('connected', `Sala: ${roomId}`);
    
    setupRoomListeners();
    setupMyPresence();
    
    roomNameInput.value = roomId;
  } catch (e) {
    console.error("Error al iniciar Firebase app:", e);
    updateSyncUI('error', "Error de Conexión");
  }
}

function updateSyncUI(status, text) {
  statusDot.className = "status-dot";
  statusDot.classList.add(status);
  statusText.textContent = text;
  
  if (status === 'connected') {
    shareLinkBtn.classList.remove('hidden');
    openSettingsBtn.textContent = "⚙️ Ajustes Sala";
  } else {
    shareLinkBtn.classList.add('hidden');
    openSettingsBtn.textContent = "🔌 Configurar Conexión";
  }
}

function setupRoomListeners() {
  if (firebaseRefs.players) firebaseRefs.players.off();
  if (firebaseRefs.gameState) firebaseRefs.gameState.off();

  firebaseRefs.players = database.ref(`rooms/${roomId}/players`);
  firebaseRefs.players.on('value', (snapshot) => {
    const data = snapshot.val();
    players.length = 0;
    if (data) {
      Object.keys(data).forEach(key => {
        players.push({
          name: key,
          totalPoints: data[key].totalPoints || 0,
          totalAnswers: data[key].totalAnswers || 0,
          online: data[key].online !== false
        });
      });
    }
    renderPlayers();
    renderScoreboard();
  });

  firebaseRefs.gameState = database.ref(`rooms/${roomId}/gameState`);
  firebaseRefs.gameState.on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state) {
      challengeSection.classList.add('hidden');
      currentCategory = '';
      currentQuestions = [];
      answerSubmitted = false;
      renderBoard();
      return;
    }

    if (state.boardPosition) {
      boardPosition = state.boardPosition;
      renderBoard();
    }

    if (state.selectedPlayer !== undefined) {
      selectedPlayer = state.selectedPlayer;
    }

    if (state.challengeActive) {
      currentCategory = state.currentCategory || '';
      currentQuestions = state.currentQuestions || [];
      answerSubmitted = state.answerSubmitted || false;
      
      challengeSection.classList.remove('hidden');
      
      if (state.answerSubmitted && state.results) {
        loadCategory();
        resultsText.innerHTML = `<div class="result-summary"><span class="player-name">${state.results.playerName}</span><span class="score">${state.results.score}/${state.results.total} (${state.results.pct}%)</span><p class="total">Total: ${state.results.totalPoints}p</p></div>`;
        resultsBox.classList.remove('hidden');
        submitAnswersBtn.disabled = true;
        submitAnswersBtn.style.opacity = '0.5';
        submitAnswersBtn.style.cursor = 'not-allowed';
        submitAnswersBtn.classList.add('hidden');
      } else {
        loadCategory();
      }
    } else {
      challengeSection.classList.add('hidden');
      clearChallenge();
      currentCategory = '';
      currentQuestions = [];
    }
  });
}

function setupMyPresence() {
  if (!isMultiplayerActive || !myPlayerName) return;

  const myConnectionsRef = database.ref(`rooms/${roomId}/players/${myPlayerName}/online`);
  const connectedRef = database.ref('.info/connected');
  
  connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
      myConnectionsRef.set(true);
      myConnectionsRef.onDisconnect().set(false);
    }
  });
}

function generateShareLink() {
  if (!isMultiplayerActive) return;
  const cleanUrl = window.location.href.split('?')[0].split('#')[0];
  const shareUrl = `${cleanUrl}?room=${encodeURIComponent(roomId)}`;
  
  navigator.clipboard.writeText(shareUrl).then(() => {
    showToast("¡Enlace de invitación copiado al portapapeles! 📋");
  }).catch(err => {
    console.error("Error al copiar enlace:", err);
    alert(`Comparte este enlace:\n${shareUrl}`);
  });
}

function showToast(message) {
  let toast = document.getElementById('copyToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copyToast';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function saveSyncSettings() {
  const room = roomNameInput.value.trim().replace(/[^a-zA-Z0-9-_]/g, '');

  if (!room) {
    alert("Por favor ingresa un nombre de sala válido.");
    return;
  }

  localStorage.setItem('roomName', room);
  syncSettingsModal.classList.add('hidden');
  
  const cleanUrl = window.location.href.split('?')[0].split('#')[0];
  window.location.href = `${cleanUrl}?room=${encodeURIComponent(room)}`;
}

function disconnectSync() {
  if (confirm("¿Estás seguro de que deseas desconectarte y volver al Modo Local?")) {
    localStorage.removeItem('roomName');
    localStorage.removeItem('myPlayerName');
    
    isMultiplayerActive = false;
    database = null;
    
    window.location.href = window.location.href.split('?')[0];
  }
}

function generateRandomRoom() {
  const randomId = 'CMG-' + Math.floor(1000 + Math.random() * 9000);
  roomNameInput.value = randomId;
}

// ============================================
// CONFIGURACIÓN DE LISTENERS DE EVENTOS
// ============================================

addPlayerBtn.addEventListener('click', addPlayer);
playerNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addPlayer(); });

activePlayerSelect.addEventListener('change', (e) => {
  selectedPlayer = e.target.value;
  if (isMultiplayerActive) {
    database.ref(`rooms/${roomId}/gameState/selectedPlayer`).set(selectedPlayer);
  }
});

submitAnswersBtn.addEventListener('click', scoreAnswers);

resetBtn.addEventListener('click', () => {
  if (isMultiplayerActive) {
    database.ref(`rooms/${roomId}/gameState`).update({
      challengeActive: false,
      currentCategory: '',
      answerSubmitted: false,
      results: null
    });
  } else {
    clearChallenge();
    challengeSection.classList.add('hidden');
    currentCategory = '';
  }
});

if (spectatorBtn) spectatorBtn.addEventListener('click', openSpectatorMode);
if (spectatorBtnMain) spectatorBtnMain.addEventListener('click', openSpectatorMode);

openSettingsBtn.addEventListener('click', () => {
  syncSettingsModal.classList.remove('hidden');
  roomNameInput.value = localStorage.getItem('roomName') || '';
});

closeModalBtn.addEventListener('click', () => {
  syncSettingsModal.classList.add('hidden');
});

randomRoomBtn.addEventListener('click', generateRandomRoom);
saveSyncSettingsBtn.addEventListener('click', saveSyncSettings);
disconnectSyncBtn.addEventListener('click', disconnectSync);

shareLinkBtn.addEventListener('click', generateShareLink);

window.addEventListener('click', (e) => {
  if (e.target === syncSettingsModal) {
    syncSettingsModal.classList.add('hidden');
  }
});

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

initFirebaseConnection();
loadData();
renderPlayers();
renderScoreboard();
renderBoard();
