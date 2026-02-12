import './style.css'

// Array of gardening-related emojis (flowers and plants)
const gardeningEmojis = [
  '🌱', '🌿', '🍀', '☘️', '🌾', '🌵', '🌴', '🌳', '🌲',
  '🌷', '🌸', '🌺', '🌻', '🌼', '🌹', '🥀', '🏵️', '💐',
   '🌰', '🍄', '🌷', '🌸', '🌻', '🌺'
];

// Tree emojis for the cross pattern
const treeEmojis = ['🌳'];

// Flower emojis for the corner patterns
const flowerEmojis = ['🌷', '🌸', '🌺', '🌻', '🌼', '🌹'];

// Grid settings - responsive
let TILE_SIZE = 60; // Size of each grid tile in pixels
let GRID_COLS = 9;
let GRID_ROWS = 9;

// Adjust grid for mobile devices
if (window.innerWidth <= 768) {
  TILE_SIZE = 32;
}
if (window.innerWidth <= 375) {
  TILE_SIZE = 28;
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
  
  // Create clear button
  const clearButton = document.createElement('button');
  clearButton.className = 'clear-button';
  clearButton.textContent = 'Clear Garden';
  clearButton.addEventListener('click', clearGarden);
  app.appendChild(clearButton);
  
  // Create heart pattern button
  const heartButton = document.createElement('button');
  heartButton.className = 'pattern-button pattern-button-1';
  heartButton.textContent = '1';
  heartButton.addEventListener('click', fillHeartPattern);
  app.appendChild(heartButton);
  
  // Create random fill button
  const randomButton = document.createElement('button');
  randomButton.className = 'pattern-button pattern-button-2';
  randomButton.textContent = '2';
  randomButton.addEventListener('click', fillRandomPattern);
  app.appendChild(randomButton);
  
  // Animate the cross pattern with trees after a short delay
  setTimeout(() => {
    animateCrossPattern();
  }, 500);
}

// Clear all emojis and restore tildes
function clearGarden() {
  const tiles = document.querySelectorAll('.tile');
  
  tiles.forEach((tile, index) => {
    const row = Math.floor(index / GRID_COLS);
    const col = index % GRID_COLS;
    const key = getGridKey(col, row);
    
    // Reset grid data
    gridData[key] = false;
    
    // Restore tilde
    tile.innerHTML = '';
    const tilde = document.createElement('span');
    tilde.className = 'tilde';
    tilde.textContent = '~';
    tile.appendChild(tilde);
  });
  
  // Check easter egg (should hide it)
  checkEasterEgg();
}

// Fill board with heart pattern
function fillHeartPattern() {
  // First clear the garden
  clearGarden();
  
  // Define heart shape for 9x9 grid
  const heartPattern = [
    // Row 0: two bumps at top
    { col: 2, row: 0 }, { col: 3, row: 0 }, { col: 5, row: 0 }, { col: 6, row: 0 },
    // Row 1: wider
    { col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }, { col: 4, row: 1 },
    { col: 5, row: 1 }, { col: 6, row: 1 }, { col: 7, row: 1 },
    // Row 2: full width
    { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 }, { col: 3, row: 2 },
    { col: 4, row: 2 }, { col: 5, row: 2 }, { col: 6, row: 2 }, { col: 7, row: 2 }, { col: 8, row: 2 },
    // Row 3: full width
    { col: 0, row: 3 }, { col: 1, row: 3 }, { col: 2, row: 3 }, { col: 3, row: 3 },
    { col: 4, row: 3 }, { col: 5, row: 3 }, { col: 6, row: 3 }, { col: 7, row: 3 }, { col: 8, row: 3 },
    // Row 4: narrowing
    { col: 1, row: 4 }, { col: 2, row: 4 }, { col: 3, row: 4 }, { col: 4, row: 4 },
    { col: 5, row: 4 }, { col: 6, row: 4 }, { col: 7, row: 4 },
    // Row 5: narrowing more
    { col: 2, row: 5 }, { col: 3, row: 5 }, { col: 4, row: 5 }, { col: 5, row: 5 }, { col: 6, row: 5 },
    // Row 6: narrowing more
    { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 },
    // Row 7: point
    { col: 4, row: 7 }
  ];
  
  // Sort by row for top-to-bottom animation
  const sortedPattern = heartPattern.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });
  
  // Heart emoji for filling
    const heartEmojis = ['🌷', '🌸', '🌺',];
    
  // Animate each position appearing one by one from top to bottom
  sortedPattern.forEach(({ col, row }, index) => {
    setTimeout(() => {
      if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
        const key = getGridKey(col, row);
        const tileIndex = row * GRID_COLS + col;
        const tiles = document.querySelectorAll('.tile');
        const tile = tiles[tileIndex];
        
        if (tile) {
          // Mark as occupied
          gridData[key] = true;
          
          // Replace tilde with random heart emoji
          tile.innerHTML = '';
          const randomHeart = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
          tile.textContent = randomHeart;
          
          // Add animation class for fade-in effect
          tile.style.animation = 'fadeIn 0.3s ease-in';
        }
      }
      
      // Check easter egg after last heart is placed
      if (index === sortedPattern.length - 1) {
        setTimeout(() => checkEasterEgg(), 100);
      }
    }, index * 80); // 80ms delay between each heart
  });
}

// Fill board with random gardening emojis at random positions
function fillRandomPattern() {
  // First clear the garden
  clearGarden();
  
  // Generate random positions (about 40-50% of the grid)
  const totalTiles = GRID_COLS * GRID_ROWS;
  const numEmojis = Math.floor(totalTiles * 0.45); // 45% fill rate
  
  // Create array of all possible positions
  const allPositions = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      allPositions.push({ col, row });
    }
  }
  
  // Shuffle and take random positions
  const shuffled = allPositions.sort(() => Math.random() - 0.5);
  const randomPositions = shuffled.slice(0, numEmojis);
  
  // Fill all positions instantly (no animation)
  randomPositions.forEach(({ col, row }) => {
    if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
      const key = getGridKey(col, row);
      const tileIndex = row * GRID_COLS + col;
      const tiles = document.querySelectorAll('.tile');
      const tile = tiles[tileIndex];
      
      if (tile) {
        // Mark as occupied
        gridData[key] = true;
        
        // Replace tilde with random gardening emoji
        tile.innerHTML = '';
        tile.textContent = getRandomEmoji();
      }
    }
  });
  
  // Check easter egg after filling
  checkEasterEgg();
}

// Animate tree cross pattern and corner flowers appearing gradually from top to bottom
function animateCrossPattern() {
  // Calculate center position (grid is 9x9, so center is at index 4)
  const centerCol = Math.floor(GRID_COLS / 2); // Column 4 (0-indexed)
  const centerRow = Math.floor(GRID_ROWS / 2); // Row 4 (0-indexed)
  
  // Define cross pattern coordinates (trees)
  const crossPattern = [
    // Vertical arm
    { col: centerCol, row: centerRow - 1, type: 'tree' },
    { col: centerCol, row: centerRow, type: 'tree' },
    { col: centerCol, row: centerRow + 1, type: 'tree' },
    // Horizontal arm (excluding center which is already in vertical)
    { col: centerCol - 1, row: centerRow, type: 'tree' },
    { col: centerCol + 1, row: centerRow, type: 'tree' },
  ];
  
  // Define corner flower patterns (2x2 minus the actual corner)
  const cornerFlowers = [
    // Top-left corner (exclude 0,0)
    { col: 1, row: 0, type: 'flower' },
    { col: 0, row: 1, type: 'flower' },
    { col: 1, row: 1, type: 'flower' },
    // Top-right corner (exclude 8,0)
    { col: 7, row: 0, type: 'flower' },
    { col: 8, row: 1, type: 'flower' },
    { col: 7, row: 1, type: 'flower' },
    // Bottom-left corner (exclude 0,8)
    { col: 0, row: 7, type: 'flower' },
    { col: 1, row: 8, type: 'flower' },
    { col: 1, row: 7, type: 'flower' },
    // Bottom-right corner (exclude 8,8)
    { col: 7, row: 8, type: 'flower' },
    { col: 8, row: 7, type: 'flower' },
    { col: 7, row: 7, type: 'flower' },
  ];
  
  // Combine all patterns and sort by row (top to bottom)
  const allPatterns = [...crossPattern, ...cornerFlowers].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col; // If same row, sort by column
  });
  
  // Animate each emoji appearing one by one from top to bottom
  allPatterns.forEach(({ col, row, type }, index) => {
    setTimeout(() => {
      // Make sure coordinates are within bounds
      if (col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS) {
        const key = getGridKey(col, row);
        const tileIndex = row * GRID_COLS + col;
        const tiles = document.querySelectorAll('.tile');
        const tile = tiles[tileIndex];
        
        if (tile) {
          // Mark as occupied
          gridData[key] = true;
          
          // Replace tilde with random emoji based on type
          tile.innerHTML = '';
          if (type === 'tree') {
            const randomTree = treeEmojis[Math.floor(Math.random() * treeEmojis.length)];
            tile.textContent = randomTree;
          } else {
            const randomFlower = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
            tile.textContent = randomFlower;
          }
          
          // Add animation class for fade-in effect
          tile.style.animation = 'fadeIn 0.3s ease-in';
        }
      }
      
      // Check easter egg after last item is placed
      if (index === allPatterns.length - 1) {
        setTimeout(() => checkEasterEgg(), 100);
      }
    }, index * 100); // 100ms delay between each emoji
  });
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
