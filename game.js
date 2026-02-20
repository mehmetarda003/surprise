// Oyun Değişkenleri
let canvas, ctx;
let player;
let platforms = [];
let enemies = [];
let coins = [];
let gameState = 'menu'; // menu, playing, gameOver
let score = 0;
let lives = 3;
let selectedCharacter = 'esrio';
let esrioImage = null;
let meugiImage = null;
let customCharacterImage = null;
let keys = {};
let camera = { x: 0, y: 0 };

// Ses Sistemi (Web Audio API)
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playCoinSound() {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine'; // Klasik ping sesi için dalga tipi
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 notası
    oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6 notasına kayış
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
}

// Canvas ve oyun başlatma
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupCharacterSelection();
    setupControls();
    gameLoop();
}

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Karakter seçimi
function setupCharacterSelection() {
    const options = document.querySelectorAll('.character-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            if (option.dataset.char === 'custom') {
                document.getElementById('customCharacter').click();
            } else {
                selectedCharacter = option.dataset.char;
            }
        });
    });
    
    document.getElementById('customCharacter').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                customCharacterImage = new Image();
                customCharacterImage.src = event.target.result;
                selectedCharacter = 'custom';
            };
            reader.readAsDataURL(file);
        }
    });
    
    if (options.length > 0) {
        options[0].classList.add('selected');
        selectedCharacter = 'esrio';
    }
}

// Kontroller
function setupControls() {
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        keys[e.key.toLowerCase()] = true;
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            if (player && player.onGround) {
                player.velocityY = -13;
                player.onGround = false;
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        keys[e.key.toLowerCase()] = false;
    });
    
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    
    const handleLeftStart = (e) => { e.preventDefault(); keys['ArrowLeft'] = true; };
    const handleLeftEnd = (e) => { e.preventDefault(); keys['ArrowLeft'] = false; };
    const handleRightStart = (e) => { e.preventDefault(); keys['ArrowRight'] = true; };
    const handleRightEnd = (e) => { e.preventDefault(); keys['ArrowRight'] = false; };
    const handleJump = (e) => {
        e.preventDefault();
        if (player && player.onGround) {
            player.velocityY = -13;
            player.onGround = false;
        }
    };
    
    leftBtn.addEventListener('touchstart', handleLeftStart);
    leftBtn.addEventListener('touchend', handleLeftEnd);
    leftBtn.addEventListener('mousedown', handleLeftStart);
    leftBtn.addEventListener('mouseup', handleLeftEnd);
    leftBtn.addEventListener('mouseleave', handleLeftEnd);
    
    rightBtn.addEventListener('touchstart', handleRightStart);
    rightBtn.addEventListener('touchend', handleRightEnd);
    rightBtn.addEventListener('mousedown', handleRightStart);
    rightBtn.addEventListener('mouseup', handleRightEnd);
    rightBtn.addEventListener('mouseleave', handleRightEnd);
    
    jumpBtn.addEventListener('touchstart', handleJump);
    jumpBtn.addEventListener('mousedown', handleJump);
    
    document.getElementById('startButton').addEventListener('click', () => {
        initAudio(); // Ses motorunu başlat
        startGame();
    });
    
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('menuButton').addEventListener('click', () => {
        showScreen('menuScreen');
        gameState = 'menu';
    });
}

function loadCharacterImages() {
    esrioImage = new Image();
    esrioImage.src = 'characters/esrio.37';
    esrioImage.onerror = function() { esrioImage.src = 'esrio.37'; };
    
    meugiImage = new Image();
    meugiImage.src = 'characters/meugi.11';
    meugiImage.onerror = function() { meugiImage.src = 'meugi.11'; };
}

function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 5;
    showScreen('gameScreen');
    
    loadCharacterImages();
    platforms = [];
    createPlatforms();
    
    const startPlatform = platforms.length > 0 ? platforms[0] : { x: 0, y: canvas.height - 40, width: 300, height: 40 };
    
    player = {
        x: 50, // Sabit ve güvenli bir başlangıç noktası
        y: startPlatform.y - 40,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        onGround: false,
        character: selectedCharacter,
        customImage: customCharacterImage
    };
    
    enemies = [];
    createEnemies();
    
    coins = [];
    createCoins();
    
    camera.x = 0;
    camera.y = 0;
    
    updateUI();
}

function createPlatforms() {
    // Çok daha mantıklı ve akıcı platform tasarımı
    platforms.push({ x: 0, y: canvas.height - 40, width: 3000, height: 40 }); // Ana Zemin (Biraz inceltildi)
    
    platforms.push({ x: 400, y: canvas.height - 140, width: 200, height: 30 }); // 1. Basamak
    platforms.push({ x: 700, y: canvas.height - 240, width: 200, height: 30 }); // 2. Basamak
    platforms.push({ x: 1050, y: canvas.height - 180, width: 250, height: 30 }); // Aşağı iniş
    platforms.push({ x: 1450, y: canvas.height - 280, width: 200, height: 30 }); // Yüksek basamak
    platforms.push({ x: 1800, y: canvas.height - 150, width: 300, height: 30 }); // Güvenli alan
    platforms.push({ x: 2300, y: canvas.height - 250, width: 200, height: 30 }); // Son zorluk
}

function createEnemies() {
    // Düşmanlar tam olarak platformların veya zeminin üzerine yerleştirildi
    enemies.push({ x: 550, y: canvas.height - 70, width: 30, height: 30, speed: 1.5, direction: 1 }); // Zeminde
    enemies.push({ x: 750, y: canvas.height - 270, width: 30, height: 30, speed: 1.2, direction: -1 }); // 2. Basamakta
    enemies.push({ x: 1100, y: canvas.height - 210, width: 30, height: 30, speed: 1.8, direction: 1 }); // 3. Platformda
    enemies.push({ x: 1550, y: canvas.height - 70, width: 30, height: 30, speed: 1.5, direction: -1 }); // Zeminde tünel
    enemies.push({ x: 1950, y: canvas.height - 180, width: 30, height: 30, speed: 2.0, direction: 1 }); // 5. Platformda (Hızlı)
    enemies.push({ x: 2500, y: canvas.height - 70, width: 30, height: 30, speed: 1.5, direction: -1 }); // Sona doğru
}

function createCoins() {
    // Altınları daha belirgin ve platformların üstüne yerleştir
    for (let i = 0; i < 35; i++) {
        let coinY = canvas.height - 100 - (Math.random() * 200);
        coins.push({
            x: 250 + (i * 75),
            y: coinY,
            width: 20,
            height: 20,
            collected: false,
            rotation: 0
        });
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function updateUI() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('livesValue').textContent = lives;
}

function gameLoop() {
    if (gameState === 'playing') {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    let moveLeft = keys['ArrowLeft'] || keys['a'] || keys['A'];
    let moveRight = keys['ArrowRight'] || keys['d'] || keys['D'];
    
    player.velocityX = 0;
    if (moveLeft && !moveRight) player.velocityX = -player.speed;
    if (moveRight && !moveLeft) player.velocityX = player.speed;
    
    if (!player.onGround) {
        player.velocityY += 0.6; 
    }
    player.velocityY = Math.min(player.velocityY, 15);
    
    // X Ekseninde Hareket
    player.x += player.velocityX;
    let hitboxX = {
        x: player.x,
        y: player.y + 2,
        width: player.width,
        height: player.height - 4
    };

    platforms.forEach(platform => {
        if (checkCollision(hitboxX, platform)) {
            if (player.velocityX > 0) { 
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) { 
                player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
        }
    });

    // Y Ekseninde Hareket
    player.y += player.velocityY;
    player.onGround = false;
    let hitboxY = {
        x: player.x + 2,
        y: player.y,
        width: player.width - 4,
        height: player.height
    };

    platforms.forEach(platform => {
        if (checkCollision(hitboxY, platform)) {
            if (player.velocityY > 0) { 
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            } else if (player.velocityY < 0) { 
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
        }
    });
    
    // Düşman Güncelleme
    enemies.forEach(enemy => {
        enemy.velocityY = (enemy.velocityY || 0) + 0.6;
        enemy.y += enemy.velocityY;
        
        let enemyOnGround = false;
        platforms.forEach(platform => {
            if (checkCollision(enemy, platform)) {
                if (enemy.velocityY > 0) {
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                    enemyOnGround = true;
                }
            }
        });

        if (enemyOnGround) {
            enemy.x += enemy.speed * enemy.direction;
        }

        let isOverEdge = true;
        platforms.forEach(platform => {
            let nextX = enemy.direction === 1 ? enemy.x + enemy.width : enemy.x;
            if (nextX >= platform.x && nextX <= platform.x + platform.width &&
                Math.abs((enemy.y + enemy.height) - platform.y) <= 2) {
                isOverEdge = false;
            }
        });
        
        if (isOverEdge || enemy.x < 0 || enemy.x > 3000) {
            enemy.direction *= -1;
            enemy.x += enemy.speed * enemy.direction; 
        }
        
        if (checkCollision(player, enemy)) {
            if (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                score += 100;
                player.velocityY = -10;
            } else {
                lives--;
                player.x = 50; // Ölünce sabit güvenli noktaya dön
                player.y = platforms[0].y - 40;
                player.velocityY = 0;
                if (lives <= 0) gameOver();
            }
        }
    });
    
    // Altın toplama ve Ses Efekti
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 50;
            playCoinSound(); // Altını alınca pıng sesini çal
        }
        coin.rotation += 0.1;
    });
    
    camera.x = player.x - canvas.width / 2;
    camera.x = Math.max(0, Math.min(camera.x, 3000 - canvas.width));
    
    if (player.y > canvas.height + 100) {
        lives--;
        player.x = 50;
        player.y = platforms[0].y - 40;
        player.velocityY = 0;
        if (lives <= 0) gameOver();
    }
    
    updateUI();
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function draw() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    for (let i = 0; i < 5; i++) {
        drawCloud(100 + i * 400 - camera.x * 0.3, 50 + i * 20);
    }
    
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x - camera.x, platform.y - camera.y, platform.width, platform.height);
        ctx.fillStyle = '#654321';
        ctx.fillRect(platform.x - camera.x, platform.y - camera.y, platform.width, 5);
        ctx.fillStyle = '#8B4513';
    });
    
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.save();
            ctx.translate(coin.x + coin.width/2 - camera.x, coin.y + coin.height/2 - camera.y);
            ctx.rotate(coin.rotation);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(0, 0, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
    });
    
    enemies.forEach(enemy => {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + 5 - camera.x, enemy.y + 5 - camera.y, 8, 8);
        ctx.fillRect(enemy.x + 17 - camera.x, enemy.y + 5 - camera.y, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 7 - camera.x, enemy.y + 7 - camera.y, 4, 4);
        ctx.fillRect(enemy.x + 19 - camera.x, enemy.y + 7 - camera.y, 4, 4);
    });
    
    drawPlayer();
}

function drawCloud(x, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    const px = player.x - camera.x;
    const py = player.y - camera.y;
    
    if (player.character === 'custom' && player.customImage && player.customImage.complete) {
        ctx.drawImage(player.customImage, px, py, player.width, player.height);
    } else if (player.character === 'esrio' && esrioImage && esrioImage.complete && esrioImage.naturalWidth > 0) {
        ctx.drawImage(esrioImage, px, py, player.width, player.height);
    } else if (player.character === 'meugi' && meugiImage && meugiImage.complete && meugiImage.naturalWidth > 0) {
        ctx.drawImage(meugiImage, px, py, player.width, player.height);
    } else {
        ctx.fillStyle = player.character === 'meugi' ? '#4ECDC4' : '#FF6B6B';
        ctx.fillRect(px, py, player.width, player.height);
        ctx.fillStyle = '#FFD93D';
        ctx.fillRect(px + 5, py + 5, player.width - 10, player.height - 10);
    }
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    showScreen('gameOverScreen');
}

initGame();
