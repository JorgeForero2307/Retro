// ============================================
// JUEGO DE HABILIDADES - Sistema Profesional
// 16 Categorías | Preguntas Aleatorias | Multijugador
// ============================================

const playerList = document.getElementById('playerList');
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

// Elementos de la Pantalla de Bienvenida y Entregas
const welcomeScreen = document.getElementById('welcomeScreen');
const joinPlayerNameInput = document.getElementById('joinPlayerName');
const joinGameBtn = document.getElementById('joinGameBtn');
const submissionsList = document.getElementById('submissionsList');
const submissionsBox = document.getElementById('submissionsBox');

// Variables de Estado del Juego
const players = [];
let currentCategory = '';
let boardPosition = { row: 1, col: 1 };
let currentQuestions = [];
let answerSubmitted = false;
let challengeStartTime = 0;

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
let isHost = false;
let roomOwner = '';
const closeRoomBtn = document.getElementById('closeRoomBtn');

// TABLERO 4x4 CON 16 CATEGORÍAS
const boardLayout = [
  ['mecanografia', 'excel', 'formulas', 'peliculas'],
  ['futbol', 'start', 'codigo', 'agilidad'],
  ['python', 'animales', 'habilidades', 'javascript'],
  ['liderazgo', 'negocios', 'musica', 'cultura']
];



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
  const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  const medals = ['🥇', '🥈', '🥉'];
  
  sorted.forEach((player, idx) => {
    const li = document.createElement('li');
    li.className = 'player-item';
    if (idx === 0 && players.length > 0) li.classList.add('leader');
    
    // Presencia online
    let presenceHtml = '';
    const isMe = player.name === myPlayerName;
    if (isMultiplayerActive) {
      const isOnline = player.online !== false;
      const isHostText = player.name === roomOwner ? ' 👑' : '';
      presenceHtml = `<span class="player-presence ${isOnline ? 'online' : 'offline'}" title="${isOnline ? 'En línea' : 'Desconectado'}"></span>`;
      const isMeText = isMe ? ' <strong>(Tú)</strong>' : '';
      li.innerHTML = `${presenceHtml}<span class="rank">${medals[idx] || '·'}</span><span>${player.name}${isMeText}${isHostText}</span><small>${player.totalPoints}p · ${player.totalAnswers}r</small>`;
    } else {
      const isMeText = isMe ? ' <strong>(Tú)</strong>' : '';
      li.innerHTML = `${presenceHtml}<span class="rank">${medals[idx] || '·'}</span><span>${player.name}${isMeText}</span><small>${player.totalPoints}p · ${player.totalAnswers}r</small>`;
    }

    const canRemove = !isMultiplayerActive || isHost || isMe;

    if (canRemove) {
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.className = 'remove-btn';
      if (isMultiplayerActive && isMe && !isHost) {
        removeBtn.title = "Salir de la sala";
      } else if (isMultiplayerActive && isHost && !isMe) {
        removeBtn.title = "Eliminar de la sala";
      }
      removeBtn.addEventListener('click', () => {
        const confirmMsg = isMultiplayerActive && isMe && !isHost 
          ? "¿Seguro que deseas salir de la sala?" 
          : `¿Eliminar a ${player.name}?`;
        if (confirm(confirmMsg)) {
          if (isMultiplayerActive) {
            removePlayerFromFirebase(player.name);
          } else {
            const idx = players.indexOf(player);
            if (idx > -1) players.splice(idx, 1);
            renderPlayers();
            renderScoreboard();
            syncData();
          }
        }
      });
      li.appendChild(removeBtn);
    }
    playerList.appendChild(li);
  });
}

function renderScoreboard() {
  if (players.length === 0) {
    scoreboard.innerHTML = '<p class="empty-state">Esperando jugadores...</p>';
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
  if (!myPlayerName) {
    welcomeScreen.classList.remove('hidden');
    return;
  }

  if (isMultiplayerActive) {
    const questions = getRandomQuestions(cat, 3);
    
    database.ref(`rooms/${roomId}/gameState`).set({
      boardPosition: boardPosition,
      currentCategory: cat,
      currentQuestions: questions,
      challengeActive: true,
      challengeStartTime: firebase.database.ServerValue.TIMESTAMP,
      submissions: null
    });
  } else {
    currentCategory = cat;
    currentQuestions = getRandomQuestions(cat, 3);
    challengeStartTime = Date.now();
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

// Lógica de Ingreso (Bienvenida)
function joinGame() {
  const name = joinPlayerNameInput.value.trim();
  if (!name) return;
  
  myPlayerName = name;
  localStorage.setItem('myPlayerName', name);
  welcomeScreen.classList.add('hidden');
  
  if (isMultiplayerActive) {
    // Reclamar la sala si no tiene dueño
    database.ref(`rooms/${roomId}/owner`).transaction((currentOwner) => {
      if (!currentOwner) {
        return name;
      }
      return currentOwner;
    });

    database.ref(`rooms/${roomId}/players/${name}`).set({
      name: name,
      totalPoints: 0,
      totalAnswers: 0,
      online: true
    }).then(() => {
      setupMyPresence();
    });
  } else {
    // Modo Local: agregarlo a la lista
    players.length = 0;
    players.push(createPlayer(name));
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
    welcomeScreen.classList.remove('hidden');
  }
}

function clearChallenge() {
  challengeContent.innerHTML = '';
  resultsBox.classList.add('hidden');
  resultsText.textContent = '';
  submitAnswersBtn.disabled = false;
  submitAnswersBtn.style.opacity = '1';
  submitAnswersBtn.style.cursor = 'pointer';
  submitAnswersBtn.classList.remove('hidden');
  answerSubmitted = false;
}

function loadCategory() {
  const icons = {
    mecanografia: '⌨', excel: '📊', formulas: '∑', peliculas: '🎬',
    futbol: '⚽', codigo: '💻', agilidad: '🏃', python: '🐍',
    animales: '🦁', habilidades: '🎯', javascript: '✨', liderazgo: '👑',
    negocios: '💼', musica: '🎵', cultura: '🎭'
  };
  challengeSection.classList.remove('hidden');
  challengeTitle.textContent = `${icons[currentCategory] || ''} ${currentCategory.toUpperCase()}`;

  // Verificar si ya enviamos respuestas
  if (answerSubmitted) {
    return; // Mantener la vista de resultados
  }
  
  challengeContent.innerHTML = '';
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
    q.appendChild(inpElement);
    challengeContent.appendChild(q);
  });
}

function normalizeAnswer(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreAnswers() {
  if (!currentCategory || answerSubmitted) return;
  
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

  answerSubmitted = true;
  const pct = Math.round((score / currentQuestions.length) * 100);

  // Calcular tiempo transcurrido
  const startTime = challengeStartTime || Date.now();
  const timeTakenSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));

  if (isMultiplayerActive && myPlayerName) {
    // Registrar entrega en Firebase
    database.ref(`rooms/${roomId}/gameState/submissions/${myPlayerName}`).set({
      score: score,
      total: currentQuestions.length,
      timeTakenSeconds: timeTakenSeconds
    });

    // Actualizar puntaje del jugador en Firebase mediante transacción
    const playerRef = database.ref(`rooms/${roomId}/players/${myPlayerName}`);
    playerRef.transaction((player) => {
      if (player) {
        player.totalPoints = (player.totalPoints || 0) + score;
        player.totalAnswers = (player.totalAnswers || 0) + answered;
      }
      return player;
    });

    showIndividualResults(score, currentQuestions.length, pct);
  } else {
    // Modo Local
    const player = players[0] || { name: myPlayerName || "Local", totalPoints: 0, totalAnswers: 0 };
    player.totalPoints += score;
    player.totalAnswers += answered;
    
    if (players.length === 0) players.push(player);
    
    renderPlayers();
    renderScoreboard();
    syncData();

    showIndividualResults(score, currentQuestions.length, pct);
    
    // Crear simulación local de entrega en la UI
    submissionsList.innerHTML = `<li class="submission-item submitted">
      <span>✅ ${player.name}</span>
      <span class="sub-score">${score}/${currentQuestions.length} <span class="sub-time">(${timeTakenSeconds}s)</span></span>
    </li>`;
  }
}

function showIndividualResults(score, total, pct) {
  resultsText.innerHTML = `<span class="score">${score}/${total} (${pct}%)</span><p class="total">Respuestas enviadas correctamente en esta ronda.</p>`;
  resultsBox.classList.remove('hidden');
  submitAnswersBtn.disabled = true;
  submitAnswersBtn.style.opacity = '0.5';
  submitAnswersBtn.style.cursor = 'not-allowed';
  submitAnswersBtn.classList.add('hidden');
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

  // Comprobar pantalla de bienvenida
  if (!myPlayerName) {
    welcomeScreen.classList.remove('hidden');
  } else {
    welcomeScreen.classList.add('hidden');
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
  if (firebaseRefs.owner) firebaseRefs.owner.off();
  if (firebaseRefs.closed) firebaseRefs.closed.off();

  // Escuchar si la sala está cerrada
  firebaseRefs.closed = database.ref(`rooms/${roomId}/closed`);
  firebaseRefs.closed.on('value', (snapshot) => {
    const closed = snapshot.val();
    if (closed === true) {
      alert("La sala ha sido cerrada por el anfitrión.");
      localStorage.removeItem('roomName');
      localStorage.removeItem('myPlayerName');
      isMultiplayerActive = false;
      database = null;
      window.location.href = window.location.href.split('?')[0];
    }
  });

  // Escuchar dueño de la sala
  firebaseRefs.owner = database.ref(`rooms/${roomId}/owner`);
  firebaseRefs.owner.on('value', (snapshot) => {
    const owner = snapshot.val();
    roomOwner = owner || '';
    
    // Si no hay dueño y ya ingresamos nuestro nombre, reclamamos la sala
    if (!roomOwner && myPlayerName) {
      database.ref(`rooms/${roomId}/owner`).transaction((currentOwner) => {
        if (!currentOwner) {
          return myPlayerName;
        }
        return currentOwner;
      });
    }
    
    isHost = (myPlayerName && roomOwner === myPlayerName);
    updateHostUI();
    renderPlayers();
  });

  firebaseRefs.players = database.ref(`rooms/${roomId}/players`);
  firebaseRefs.players.on('value', (snapshot) => {
    const data = snapshot.val();
    players.length = 0;
    let stillInRoom = false;
    if (data) {
      Object.keys(data).forEach(key => {
        if (key === myPlayerName) stillInRoom = true;
        players.push({
          name: key,
          totalPoints: data[key].totalPoints || 0,
          totalAnswers: data[key].totalAnswers || 0,
          online: data[key].online !== false
        });
      });
    }

    // Si la sala tiene jugadores y mi nombre no está (y ya había ingresado), fui eliminado
    if (isMultiplayerActive && myPlayerName && !stillInRoom && data) {
      alert("Has sido eliminado de la sala por el anfitrión.");
      localStorage.removeItem('myPlayerName');
      localStorage.removeItem('roomName');
      isMultiplayerActive = false;
      database = null;
      window.location.href = window.location.href.split('?')[0];
      return;
    }

    renderPlayers();
    renderScoreboard();
  });

  firebaseRefs.gameState = database.ref(`rooms/${roomId}/gameState`);
  firebaseRefs.gameState.on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state || !state.challengeActive) {
      challengeSection.classList.add('hidden');
      clearChallenge();
      currentCategory = '';
      currentQuestions = [];
      renderBoard();
      return;
    }

    if (state.boardPosition) {
      boardPosition = state.boardPosition;
      renderBoard();
    }

    // Sincronizar desafío activo
    currentCategory = state.currentCategory || '';
    currentQuestions = state.currentQuestions || [];
    challengeStartTime = state.challengeStartTime || 0;
    challengeSection.classList.remove('hidden');

    // Comprobar si ya envié respuestas en esta ronda
    const subs = state.submissions || {};
    const mySub = subs[myPlayerName];
    
    if (mySub) {
      answerSubmitted = true;
      loadCategory();
      showIndividualResults(mySub.score, mySub.total, Math.round((mySub.score / mySub.total) * 100));
    } else {
      if (answerSubmitted && Object.keys(subs).length === 0) {
        answerSubmitted = false;
        clearChallenge();
      }
      loadCategory();
    }

    // Renderizar entregas de la ronda
    renderRoundSubmissions(subs);
  });
}

function renderRoundSubmissions(submissions) {
  submissionsList.innerHTML = '';
  players.forEach(p => {
    const sub = submissions[p.name];
    const li = document.createElement('li');
    
    if (sub) {
      li.className = 'submission-item submitted';
      li.innerHTML = `<span>✅ ${p.name}</span> <span class="sub-score">${sub.score}/${sub.total} <span class="sub-time">(${sub.timeTakenSeconds}s)</span></span>`;
    } else {
      li.className = 'submission-item pending';
      li.innerHTML = `<span>⌛ ${p.name}</span> <span class="sub-time">respondiendo...</span>`;
    }
    submissionsList.appendChild(li);
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

// Enlace limpio
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

submitAnswersBtn.addEventListener('click', scoreAnswers);

resetBtn.addEventListener('click', () => {
  if (isMultiplayerActive) {
    database.ref(`rooms/${roomId}/gameState`).set({
      challengeActive: false,
      currentCategory: '',
      submissions: null
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

closeRoomBtn.addEventListener('click', () => {
  if (confirm("¿Estás seguro de que deseas cerrar la sala permanentemente? Todos los jugadores serán desconectados.")) {
    if (isMultiplayerActive) {
      database.ref(`rooms/${roomId}/closed`).set(true);
    }
  }
});

function updateHostUI() {
  if (isMultiplayerActive && isHost) {
    closeRoomBtn.classList.remove('hidden');
  } else {
    closeRoomBtn.classList.add('hidden');
  }
}

joinGameBtn.addEventListener('click', joinGame);
joinPlayerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    joinGame();
  }
});

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
