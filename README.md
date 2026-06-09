# ⚡ Juego de Habilidades del Equipo

Plataforma interactiva tipo Kahoot para competir en **16 categorías diferentes**. Preguntas aleatorias, leaderboard en vivo y modo espectador para que todo el equipo siga la competencia en tiempo real.

## 🎮 Características

✅ **16 Categorías** - Mecanografía, Excel, Fórmulas, Películas, Fútbol, Código, Agilidad, Python, Animales, Habilidades, JavaScript, Liderazgo, Negocios, Música, Cultura  
✅ **Preguntas Aleatorias** - +6 preguntas por categoría, nunca repiten  
✅ **Tablero Interactivo** - Grid 4x4 con navegación por flechas o clic  
✅ **Modo Espectador (Kahoot-style)** - Pantalla en vivo con leaderboard actualizado cada 2 segundos  
✅ **Sincronización Automática** - localStorage para múltiples ventanas  
✅ **Diseño Profesional** - Responsive, animaciones suaves, colores modernos  
✅ **Sin Dependencias** - Vanilla JavaScript puro, carga ultra rápida  

## 🎯 Cómo Jugar

### 1. **Agregar Jugadores**
- Escribe el nombre en el cuadro "Tu Equipo"
- Presiona `+` o `Enter`

### 2. **Seleccionar Categoría** (3 opciones)
- **Opción A**: Haz clic en un casillero del tablero 4x4
- **Opción B**: Usa flechas del teclado (↑ ↓ ← →) para navegar, presiona `Enter`
- **Opción C**: Selecciona un jugador en "Jugador activo"

### 3. **Responder Preguntas**
- Se generan 3 preguntas aleatorias de la categoría
- Tipos: Mecanografía, Opción múltiple, Texto libre

### 4. **Enviar y Ver Resultados**
- Presiona "Enviar respuestas"
- Ve tu puntaje, aciertos y total acumulado

### 5. **Ver Leaderboard en Vivo**
- Presiona "🔴 Comenzar transmisión"
- Se abre una nueva ventana con el ranking en vivo
- El leaderboard se actualiza automáticamente cada 2 segundos

## ⌨️ Controles del Tablero

| Acción | Tecla |
|--------|-------|
| Mover arriba | ↑ |
| Mover abajo | ↓ |
| Mover izquierda | ← |
| Mover derecha | → |
| Seleccionar categoría | Enter |
| Hacer clic | Mouse |

## 🎯 16 Categorías

| Categoría | Icono | Preguntas | Tipo |
|-----------|-------|-----------|------|
| Mecanografía | ⌨ | 6 | Tipeo |
| Excel | 📊 | 6 | Opción + Texto |
| Fórmulas | ∑ | 6 | Opción + Texto |
| Películas | 🎬 | 6 | Opción + Texto |
| Fútbol | ⚽ | 6 | Opción + Texto |
| Código | 💻 | 6 | Opción + Texto |
| Agilidad | 🏃 | 6 | Opción + Texto |
| Python | 🐍 | 6 | Opción + Texto |
| Animales | 🦁 | 6 | Opción + Texto |
| Habilidades | 🎯 | 6 | Opción + Texto |
| JavaScript | ✨ | 6 | Opción + Texto |
| Liderazgo | 👑 | 6 | Opción + Texto |
| Negocios | 💼 | 6 | Opción + Texto |
| Música | 🎵 | 6 | Opción + Texto |
| Cultura | 🎭 | 6 | Opción + Texto |
| **TOTAL** | | **96 preguntas** | **Variadas** |

## 🌐 Desplegar en Vercel

### Método 1: Dragging (Más rápido)

1. Entra a [vercel.com](https://vercel.com)
2. Arrastra la carpeta `/retro` al área de upload
3. ¡Listo en 30 segundos!

### Método 2: Git

```bash
# Inicia un repo Git
git init
git add .
git commit -m "Juego de Habilidades"

# Sube a GitHub
git push -u origin main

# Conecta en Vercel
# Vercel detecta automáticamente los archivos estáticos
```

### Archivos necesarios

```
retro/
├── index.html       (Página principal)
├── screen.html      (Pantalla espectador)
├── script.js        (Lógica del juego)
├── styles.css       (Estilos profesionales)
└── README.md        (Documentación)
```

✅ **No requiere backend** - Todo en el cliente  
✅ **Carga en &lt;1 segundo** - 100% optimizado  
✅ **Funciona offline** - LocalStorage permanente  

## 🎨 Personalización

### Agregar más preguntas

En `script.js`, busca `questionDatabase`:

```javascript
mecanografia: [
  { type: 'typing', text: 'Tu pregunta aquí.' },
  // Más preguntas...
]
```

### Cambiar colores

En `styles.css`, modifica las variables:

```css
:root {
  --accent: #38bdf8;  /* Color principal */
  --bg: #0f172a;      /* Fondo */
  --text: #f8fafc;    /* Texto */
}
```

## 📱 Responsive

- **Desktop**: Experiencia completa
- **Tablet**: Adaptada al tacto
- **Mobile**: Versión simplificada

## ⚙️ Especificaciones Técnicas

- **Framework**: Vanilla JavaScript (sin dependencias)
- **Almacenamiento**: LocalStorage
- **Sincronización**: En tiempo real entre pestañas
- **Tamaño total**: &lt;150KB
- **Compatibilidad**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)

## 🔒 Privacidad

- ✅ Todos los datos se guardan **localmente**
- ✅ No se envía información a servidores
- ✅ 100% privado y seguro
- ✅ Los datos persisten en el navegador

## 📞 Soporte

- **¿Preguntas no aparecen?** → Recarga la página (F5)
- **¿Datos se borran?** → Vacía el caché del navegador
- **¿Lento en Vercel?** → Los primeros 500ms son normales

## 📈 Próximas mejoras

- [ ] Base de datos con cientos de preguntas
- [ ] Sistema de equipos
- [ ] Gráficas de progreso
- [ ] Exportar resultados a CSV
- [ ] Modo multijugador online

---

**© 2026** - Juego de Habilidades | Hecho con ⚡ para Vercel

