import './style.css'

// Array of gardening-related emojis (flowers and plants)
const gardeningEmojis = [
  '🌱', '🌿', '🍀', '☘️', '🌾', '🌵', '🌴', '🌳', '🌲',
  '🌷', '🌸', '🌺', '🌻', '🌼', '🌹', '🥀', '🏵️', '💐',
   '🌰', '🍄', '🌷', '🌸', '🌻', '🌺'
];

// Grid settings - responsive
let TILE_SIZE = 60; // Size of each grid tile in pixels
let GRID_COLS = 10;
let GRID_ROWS = 8;

// Adjust grid for mobile devices
if (window.innerWidth <= 768) {
  TILE_SIZE = 35;
}
if (window.innerWidth <= 375) {
  TILE_SIZE = 32;
}

let gridData = {}; // Store occupied tiles as "x,y": true
let isDragging = false;
let dragAction = null; // 'place' or 'remove'
let noteButton = null; // Easter egg button

// Get a random emoji from the array
function getRandomEmoji() {
  return gardeningEmojis[Math.floor(Math.random() * gardeningEmojis.length)];
}

// Get the key for storing grid position
function getGridKey(gridX, gridY) {
  return `${gridX},${gridY}`;
}

// Initialize the canvas with tildes
function initCanvas() {
  const app = document.querySelector('#app');
  
  // Create border container
  const borderContainer = document.createElement('div');
  borderContainer.className = 'border-container';
  
  // Top border
  const topBorder = document.createElement('div');
  topBorder.className = 'top-border';
  topBorder.textContent = '𓈈 '.repeat(GRID_COLS + 6).trim();
  
  // Middle row with side borders and canvas
  const middleRow = document.createElement('div');
  middleRow.className = 'middle-row';
  
  const leftBorder = document.createElement('div');
  leftBorder.className = 'side-border';
  leftBorder.innerHTML = Array(GRID_ROWS + 4).fill('𓈈').join('<br>');
  
  // Create canvas
  const canvas = document.createElement('div');
  canvas.className = 'canvas';
  canvas.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${TILE_SIZE}px)`;
  canvas.style.gridTemplateRows = `repeat(${GRID_ROWS}, ${TILE_SIZE}px)`;
  
  // Fill canvas with tildes
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.row = row;
      tile.dataset.col = col;
      
      const tilde = document.createElement('span');
      tilde.className = 'tilde';
      tilde.textContent = '~';
      
      tile.appendChild(tilde);
      canvas.appendChild(tile);
    }
  }
  
  const rightBorder = document.createElement('div');
  rightBorder.className = 'side-border';
  rightBorder.innerHTML = Array(GRID_ROWS + 4).fill('𓈈').join('<br>');
  
  middleRow.appendChild(leftBorder);
  middleRow.appendChild(canvas);
  middleRow.appendChild(rightBorder);
  
  // Bottom border
  const bottomBorder = document.createElement('div');
  bottomBorder.className = 'bottom-border';
  bottomBorder.textContent = '𓈈 '.repeat(GRID_COLS + 6).trim();
  
  borderContainer.appendChild(topBorder);
  borderContainer.appendChild(middleRow);
  borderContainer.appendChild(bottomBorder);
  
  app.appendChild(borderContainer);
  
  // Add event handlers for dragging
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  
  // Touch events for mobile
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', handleTouchEnd);
  
  // Create hidden note button for easter egg
  noteButton = document.createElement('div');
  noteButton.className = 'note-button hidden';
  noteButton.textContent = '📝';
  noteButton.addEventListener('click', () => {
    window.location.href = '/secret.html';
  });
  app.appendChild(noteButton);
}

// Handle tile interaction (place or remove emoji)
function handleTileInteraction(tile) {
  if (!tile) return;
  
  const row = parseInt(tile.dataset.row);
  const col = parseInt(tile.dataset.col);
  const key = getGridKey(col, row);
  
  // Determine action on first tile
  if (dragAction === null) {
    dragAction = gridData[key] ? 'remove' : 'place';
  }
  
  // Perform the action
  if (dragAction === 'remove' && gridData[key]) {
    // Delete emoji and restore tilde
    gridData[key] = false;
    tile.innerHTML = '';
    
    const tilde = document.createElement('span');
    tilde.className = 'tilde';
    tilde.textContent = '~';
    tile.appendChild(tilde);
  } else if (dragAction === 'place' && !gridData[key]) {
    // Mark as occupied and replace tilde with emoji
    gridData[key] = true;
    tile.innerHTML = '';
    tile.textContent = getRandomEmoji();
  }
  
  // Check for easter egg after each interaction
  checkEasterEgg();
}

// Check if all 4 corners are filled
function checkEasterEgg() {
  const topLeft = gridData[getGridKey(0, 0)];
  const topRight = gridData[getGridKey(GRID_COLS - 1, 0)];
  const bottomLeft = gridData[getGridKey(0, GRID_ROWS - 1)];
  const bottomRight = gridData[getGridKey(GRID_COLS - 1, GRID_ROWS - 1)];
  
  if (topLeft && topRight && bottomLeft && bottomRight) {
    // All corners filled - show the note button
    noteButton.classList.remove('hidden');
  } else {
    // At least one corner empty - hide the note button
    noteButton.classList.add('hidden');
  }
}

// Mouse event handlers
function handleMouseDown(e) {
  isDragging = true;
  dragAction = null;
  const tile = e.target.closest('.tile');
  handleTileInteraction(tile);
}

function handleMouseMove(e) {
  if (!isDragging) return;
  const tile = e.target.closest('.tile');
  handleTileInteraction(tile);
}

function handleMouseUp() {
  isDragging = false;
  dragAction = null;
}

// Touch event handlers
function handleTouchStart(e) {
  e.preventDefault();
  isDragging = true;
  dragAction = null;
  const touch = e.touches[0];
  const tile = document.elementFromPoint(touch.clientX, touch.clientY).closest('.tile');
  handleTileInteraction(tile);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isDragging) return;
  const touch = e.touches[0];
  const tile = document.elementFromPoint(touch.clientX, touch.clientY).closest('.tile');
  handleTileInteraction(tile);
}

function handleTouchEnd(e) {
  e.preventDefault();
  isDragging = false;
  dragAction = null;
}

// Initialize the canvas when page loads
initCanvas();
