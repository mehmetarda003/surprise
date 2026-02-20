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
    
    // İlk karakteri seç (esrio)
    if (options.length > 0) {
        options[0].classList.add('selected');
        selectedCharacter = 'esrio';
    }
}

// Kontroller
function setupControls() {
    // Klavye kontrolleri
    document.addEventListener('keydown', (e) => {
        e.preventDefault();
        keys[e.key] = true;
        keys[e.key.toLowerCase()] = true;
        if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
            if (player && player.onGround) {
                player.velocityY = -16;
                player.onGround = false;
            }
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
        keys[e.key.toLowerCase()] = false;
    });
    
    // Mobil kontroller
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const jumpBtn = document.getElementById('jumpBtn');
    
    // Mouse/touch event'leri için
    const handleLeftStart = (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = true;
        keys['a'] = true;
    };
    const handleLeftEnd = (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = false;
        keys['a'] = false;
    };
    
    const handleRightStart = (e) => {
        e.preventDefault();
        keys['ArrowRight'] = true;
        keys['d'] = true;
    };
    const handleRightEnd = (e) => {
        e.preventDefault();
        keys['ArrowRight'] = false;
        keys['d'] = false;
    };
    
    const handleJump = (e) => {
        e.preventDefault();
        if (player && player.onGround) {
            player.velocityY = -16;
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
    
    // Butonlar
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('menuButton').addEventListener('click', () => {
        showScreen('menuScreen');
        gameState = 'menu';
    });
}

// Karakter resimlerini yükle
function loadCharacterImages() {
    esrioImage = new Image();
    esrioImage.src = 'characters/esrio.37';
    esrioImage.onerror = function() {
        // Dosya bulunamazsa alternatif yolları dene
        esrioImage.src = 'esrio.37';
    };
    
    meugiImage = new Image();
    meugiImage.src = 'characters/meugi.11';
    meugiImage.onerror = function() {
        meugiImage.src = 'meugi.11';
    };
}

// Oyunu başlat
function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 5;
    showScreen('gameScreen');
    
    // Karakter resimlerini yükle
    loadCharacterImages();
    
    // Oyuncu oluştur - direkt ilk platformun üzerinde başla
    const startPlatform = platforms.length > 0 ? platforms[0] : { x: 0, y: canvas.height - 50, width: 300, height: 50 };
    player = {
        x: startPlatform.x + 50,
        y: startPlatform.y - 40,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        speed: 6,
        onGround: false,
        character: selectedCharacter,
        customImage: customCharacterImage
    };
    
    // Platformlar oluştur
    platforms = [];
    createPlatforms();
    
    // Oyuncuyu platform üzerine yerleştir
    if (platforms.length > 0) {
        const startPlatform = platforms[0];
        player.x = startPlatform.x + 50;
        player.y = startPlatform.y - 40;
    }
    
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
    // Başlangıç platformları - daha eğlenceli ve dengeli
    platforms.push({ x: 0, y: canvas.height - 60, width: 400, height: 60 }); // Başlangıç platformu (daha geniş)
    platforms.push({ x: 450, y: canvas.height - 180, width: 250, height: 30 });
    platforms.push({ x: 750, y: canvas.height - 280, width: 200, height: 30 });
    platforms.push({ x: 1000, y: canvas.height - 200, width: 250, height: 30 });
    platforms.push({ x: 1300, y: canvas.height - 120, width: 300, height: 30 });
    platforms.push({ x: 1650, y: canvas.height - 320, width: 200, height: 30 });
    platforms.push({ x: 1900, y: canvas.height - 180, width: 250, height: 30 });
    platforms.push({ x: 2200, y: canvas.height - 100, width: 300, height: 30 });
    
    // Zemin
    platforms.push({ x: 0, y: canvas.height - 20, width: 3000, height: 20 });
}

function createEnemies() {
    // Daha dengeli düşman yerleşimi
    enemies.push({ x: 500, y: canvas.height - 220, width: 30, height: 30, speed: 1.5, direction: 1 });
    enemies.push({ x: 900, y: canvas.height - 320, width: 30, height: 30, speed: 1.5, direction: -1 });
    enemies.push({ x: 1350, y: canvas.height - 150, width: 30, height: 30, speed: 1.5, direction: 1 });
    enemies.push({ x: 1750, y: canvas.height - 350, width: 30, height: 30, speed: 1.5, direction: -1 });
    enemies.push({ x: 2100, y: canvas.height - 130, width: 30, height: 30, speed: 1.5, direction: 1 });
}

function createCoins() {
    // Daha fazla altın, daha iyi yerleşim
    for (let i = 0; i < 30; i++) {
        coins.push({
            x: 300 + i * 80 + Math.random() * 40,
            y: canvas.height - 150 - Math.random() * 350,
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
    // Oyuncu hareketi - daha responsive
    let moveLeft = keys['ArrowLeft'] || keys['a'] || keys['A'];
    let moveRight = keys['ArrowRight'] || keys['d'] || keys['D'];
    
    player.velocityX = 0;
    
    if (moveLeft) {
        player.velocityX = -player.speed;
    }
    if (moveRight) {
        player.velocityX = player.speed;
    }
    
    // Yerçekimi - daha dengeli
    if (!player.onGround) {
        player.velocityY += 0.7;
    }
    player.velocityY = Math.min(player.velocityY, 12);
    
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
        
        if (!onPlatform || enemy.x < 0 || enemy.x > 3000) {
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
                // Başlangıç platformuna geri dön
                if (platforms.length > 0) {
                    const startPlatform = platforms[0];
                    player.x = startPlatform.x + 50;
                    player.y = startPlatform.y - 40;
                } else {
                    player.x = 100;
                    player.y = 100;
                }
                player.velocityY = 0;
                player.velocityX = 0;
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
    
    // Kamera takibi - daha smooth
    camera.x = player.x - canvas.width / 2;
    camera.x = Math.max(0, Math.min(camera.x, 3000 - canvas.width));
    
    // Ekran dışına düşme kontrolü
    if (player.y > canvas.height + 100) {
        lives--;
        // Başlangıç platformuna geri dön
        if (platforms.length > 0) {
            const startPlatform = platforms[0];
            player.x = startPlatform.x + 50;
            player.y = startPlatform.y - 40;
        } else {
            player.x = 100;
            player.y = 100;
        }
        player.velocityY = 0;
        player.velocityX = 0;
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
        if (player.customImage.complete) {
            ctx.drawImage(player.customImage, px, py, player.width, player.height);
        }
    } else if (player.character === 'esrio' && esrioImage) {
        // Esrio karakteri (.37 dosyası)
        if (esrioImage.complete && esrioImage.naturalWidth > 0) {
            ctx.drawImage(esrioImage, px, py, player.width, player.height);
        } else {
            // Resim yüklenmediyse varsayılan çizim
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(px, py, player.width, player.height);
            ctx.fillStyle = '#FFD93D';
            ctx.fillRect(px + 5, py + 5, player.width - 10, player.height - 10);
        }
    } else if (player.character === 'meugi' && meugiImage) {
        // Meugi karakteri (.11 dosyası)
        if (meugiImage.complete && meugiImage.naturalWidth > 0) {
            ctx.drawImage(meugiImage, px, py, player.width, player.height);
        } else {
            // Resim yüklenmediyse varsayılan çizim
            ctx.fillStyle = '#4ECDC4';
            ctx.fillRect(px, py, player.width, player.height);
            ctx.fillStyle = '#FFD93D';
            ctx.fillRect(px + 5, py + 5, player.width - 10, player.height - 10);
        }
    } else {
        // Varsayılan karakter çizimi
        ctx.fillStyle = '#FF6B6B';
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

// Oyunu başlat
initGame();
