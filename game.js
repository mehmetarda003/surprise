// Oyun Değişkenleri
let canvas, ctx;
let player;
let platforms = [];
let enemies = [];
let coins = [];
let gameState = 'menu'; // menu, playing, gameOver
let score = 0;
let lives = 3;
let selectedCharacter = 'mario';
let customCharacterImage = null;
let keys = {};
let camera = { x: 0, y: 0 };

// Canvas ve oyun başlatma
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Canvas boyutunu ayarla
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Karakter seçimi
    setupCharacterSelection();
    
    // Kontroller
    setupControls();
    
    // Oyun döngüsü
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
    
    // İlk karakteri seç
    options[0].classList.add('selected');
}

// Kontroller
function setupControls() {
    // Klavye kontrolleri
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'ArrowUp' || e.key === ' ') {
            e.preventDefault();
            if (player && player.onGround) {
                player.velocityY = -15;
                player.onGround = false;
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Mobil kontroller
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = true;
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = false;
    });
    
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = true;
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = false;
    });
    
    jumpBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (player && player.onGround) {
            player.velocityY = -15;
            player.onGround = false;
        }
    });
    
    // Butonlar
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('menuButton').addEventListener('click', () => {
        showScreen('menuScreen');
        gameState = 'menu';
    });
}

// Oyunu başlat
function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    showScreen('gameScreen');
    
    // Oyuncu oluştur
    player = {
        x: 100,
        y: 100,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        onGround: false,
        character: selectedCharacter,
        customImage: customCharacterImage
    };
    
    // Platformlar oluştur
    platforms = [];
    createPlatforms();
    
    // Düşmanlar oluştur
    enemies = [];
    createEnemies();
    
    // Altınlar oluştur
    coins = [];
    createCoins();
    
    // Kamera sıfırla
    camera.x = 0;
    camera.y = 0;
    
    updateUI();
}

function createPlatforms() {
    // Başlangıç platformları
    platforms.push({ x: 0, y: canvas.height - 50, width: 300, height: 50 });
    platforms.push({ x: 350, y: canvas.height - 150, width: 200, height: 30 });
    platforms.push({ x: 600, y: canvas.height - 250, width: 200, height: 30 });
    platforms.push({ x: 850, y: canvas.height - 200, width: 200, height: 30 });
    platforms.push({ x: 1100, y: canvas.height - 100, width: 300, height: 30 });
    platforms.push({ x: 1450, y: canvas.height - 300, width: 200, height: 30 });
    platforms.push({ x: 1700, y: canvas.height - 150, width: 200, height: 30 });
    
    // Zemin
    platforms.push({ x: 0, y: canvas.height - 20, width: 2000, height: 20 });
}

function createEnemies() {
    enemies.push({ x: 400, y: canvas.height - 200, width: 30, height: 30, speed: 2, direction: 1 });
    enemies.push({ x: 800, y: canvas.height - 300, width: 30, height: 30, speed: 2, direction: -1 });
    enemies.push({ x: 1200, y: canvas.height - 150, width: 30, height: 30, speed: 2, direction: 1 });
    enemies.push({ x: 1600, y: canvas.height - 200, width: 30, height: 30, speed: 2, direction: -1 });
}

function createCoins() {
    for (let i = 0; i < 20; i++) {
        coins.push({
            x: 200 + i * 100 + Math.random() * 50,
            y: canvas.height - 200 - Math.random() * 300,
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

// Oyun döngüsü
function gameLoop() {
    if (gameState === 'playing') {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    // Oyuncu hareketi
    player.velocityX = 0;
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.velocityX = -player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.velocityX = player.speed;
    }
    
    // Yerçekimi
    player.velocityY += 0.8;
    player.velocityY = Math.min(player.velocityY, 15);
    
    // Oyuncu pozisyonunu güncelle
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Platform çarpışmaları
    player.onGround = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Üstten çarpışma
            if (player.velocityY > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
            // Alttan çarpışma
            else if (player.velocityY < 0) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Yan çarpışmalar
            if (player.velocityX > 0) {
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
            }
        }
    });
    
    // Düşman güncelleme
    enemies.forEach(enemy => {
        enemy.x += enemy.speed * enemy.direction;
        
        // Platform kenarlarında dön
        let onPlatform = false;
        platforms.forEach(platform => {
            if (enemy.x + enemy.width >= platform.x && 
                enemy.x <= platform.x + platform.width &&
                enemy.y + enemy.height === platform.y) {
                onPlatform = true;
            }
        });
        
        if (!onPlatform || enemy.x < 0 || enemy.x > 2000) {
            enemy.direction *= -1;
        }
        
        // Oyuncu ile çarpışma
        if (checkCollision(player, enemy)) {
            // Oyuncu düşmanın üstündeyse
            if (player.velocityY > 0 && player.y < enemy.y) {
                // Düşmanı yok et
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                score += 100;
                player.velocityY = -10; // Zıplama efekti
            } else {
                // Oyuncuya hasar
                lives--;
                player.x = 100;
                player.y = 100;
                player.velocityY = 0;
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    });
    
    // Altın toplama
    coins.forEach(coin => {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            score += 50;
        }
        coin.rotation += 0.1;
    });
    
    // Kamera takibi
    camera.x = player.x - canvas.width / 2;
    camera.x = Math.max(0, Math.min(camera.x, 2000 - canvas.width));
    
    // Ekran dışına düşme kontrolü
    if (player.y > canvas.height + 100) {
        lives--;
        player.x = 100;
        player.y = 100;
        player.velocityY = 0;
        if (lives <= 0) {
            gameOver();
        }
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
    // Arka plan temizle
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bulutlar (arka plan)
    ctx.fillStyle = 'white';
    for (let i = 0; i < 5; i++) {
        drawCloud(100 + i * 400 - camera.x * 0.3, 50 + i * 20);
    }
    
    // Platformlar çiz
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x - camera.x, platform.y - camera.y, platform.width, platform.height);
        // Platform kenarı
        ctx.fillStyle = '#654321';
        ctx.fillRect(platform.x - camera.x, platform.y - camera.y, platform.width, 5);
        ctx.fillStyle = '#8B4513';
    });
    
    // Altınlar çiz
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
    
    // Düşmanlar çiz
    enemies.forEach(enemy => {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);
        // Gözler
        ctx.fillStyle = 'white';
        ctx.fillRect(enemy.x + 5 - camera.x, enemy.y + 5 - camera.y, 8, 8);
        ctx.fillRect(enemy.x + 17 - camera.x, enemy.y + 5 - camera.y, 8, 8);
        ctx.fillStyle = 'black';
        ctx.fillRect(enemy.x + 7 - camera.x, enemy.y + 7 - camera.y, 4, 4);
        ctx.fillRect(enemy.x + 19 - camera.x, enemy.y + 7 - camera.y, 4, 4);
    });
    
    // Oyuncu çiz
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
    
    // Eğer özel resim varsa onu kullan
    if (player.character === 'custom' && player.customImage) {
        ctx.drawImage(player.customImage, px, py, player.width, player.height);
    } else {
        // Varsayılan karakter çizimi
        if (player.character === 'mario') {
            // Kırmızı şapka
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(px + 5, py, player.width - 10, 15);
            // Yüz
            ctx.fillStyle = '#FFDBAC';
            ctx.fillRect(px + 5, py + 15, player.width - 10, player.height - 15);
            // Gözler
            ctx.fillStyle = '#000000';
            ctx.fillRect(px + 10, py + 20, 5, 5);
            ctx.fillRect(px + 25, py + 20, 5, 5);
            // Bıyık
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(px + 8, py + 28, 24, 3);
            // Kırmızı gövde
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(px + 8, py + 30, player.width - 16, 10);
        } else if (player.character === 'luigi') {
            // Yeşil şapka
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(px + 5, py, player.width - 10, 15);
            // Yüz
            ctx.fillStyle = '#FFDBAC';
            ctx.fillRect(px + 5, py + 15, player.width - 10, player.height - 15);
            // Gözler
            ctx.fillStyle = '#000000';
            ctx.fillRect(px + 10, py + 20, 5, 5);
            ctx.fillRect(px + 25, py + 20, 5, 5);
            // Bıyık
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(px + 8, py + 28, 24, 3);
            // Yeşil gövde
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(px + 8, py + 30, player.width - 16, 10);
        } else {
            // Varsayılan mavi karakter
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(px, py, player.width, player.height);
            ctx.fillStyle = '#FFDBAC';
            ctx.fillRect(px + 5, py + 5, player.width - 10, player.height - 15);
        }
    }
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    showScreen('gameOverScreen');
}

// Oyunu başlat
initGame();