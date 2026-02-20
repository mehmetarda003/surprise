# 🎮 Nostaljik Platform Oyunu

Süper Mario tarzında nostaljik bir platform oyunu. Mobil cihazlarda oynanabilir ve karakter resimlerinizi özelleştirebilirsiniz!

## 🎯 Özellikler

- ✅ Klasik platform oyunu mekanikleri (zıplama, hareket, çarpışma)
- ✅ Mobil dokunmatik kontroller
- ✅ Özelleştirilebilir karakter resimleri
- ✅ Skor sistemi ve can sistemi
- ✅ Düşmanlar ve altınlar
- ✅ Responsive tasarım (mobil ve masaüstü uyumlu)

## 🚀 Nasıl Oynanır?

1. `index.html` dosyasını bir web tarayıcısında açın
2. Karakter seçin (Mario, Luigi veya özel resim yükleyin)
3. "Oyunu Başlat" butonuna tıklayın
4. Klavye ile oynayın:
   - ⬅️ Sol ok / A: Sola git
   - ➡️ Sağ ok / D: Sağa git
   - ⬆️ Yukarı ok / Boşluk: Zıpla
5. Mobil cihazlarda ekrandaki butonları kullanın

## 📱 Mobil Kullanım

Oyun mobil cihazlarda otomatik olarak dokunmatik kontrolleri gösterir. Telefonunuzda oynamak için:

1. Oyunu bir web sunucusunda barındırın (GitHub Pages, Netlify, vb.)
2. Telefonunuzun tarayıcısından oyunu açın
3. Ekrandaki kontrol butonlarını kullanın

## 🎨 Karakter Resimleri Ekleme

1. `characters` klasörü oluşturun (eğer yoksa)
2. Karakter resimlerinizi bu klasöre ekleyin:
   - `mario.png` - Mario karakteri için
   - `luigi.png` - Luigi karakteri için
3. Veya oyun içinde "Özel Resim" seçeneğini kullanarak kendi resminizi yükleyin

**Not:** Resimler otomatik olarak 40x40 piksel boyutuna ölçeklenir. Pixel art tarzı resimler daha iyi görünür.

## 📦 GitHub'a Yükleme

### 1. Git Kurulumu

Eğer Git yüklü değilse, [Git'i indirin](https://git-scm.com/downloads) ve kurun.

### 2. GitHub'da Depo Oluşturma

1. [GitHub](https://github.com) hesabınıza giriş yapın
2. Sağ üst köşedeki "+" butonuna tıklayın
3. "New repository" seçin
4. Depo adını girin (örn: `nostaljik-platform-oyunu`)
5. "Public" veya "Private" seçin
6. "Create repository" butonuna tıklayın

### 3. Projeyi GitHub'a Yükleme

Terminal/PowerShell'de proje klasörünüzde şu komutları çalıştırın:

```bash
# Git deposunu başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit'i yap
git commit -m "İlk commit: Nostaljik platform oyunu"

# GitHub deponuzun URL'sini ekleyin (örnek)
git remote add origin https://github.com/KULLANICI_ADINIZ/depo-adi.git

# Dosyaları GitHub'a yükle
git branch -M main
git push -u origin main
```

**Önemli:** `KULLANICI_ADINIZ` ve `depo-adi` kısımlarını kendi GitHub kullanıcı adınız ve depo adınızla değiştirin!

### 4. GitHub Pages ile Yayınlama (Ücretsiz Hosting)

Oyunu GitHub Pages ile ücretsiz olarak yayınlayabilirsiniz:

1. GitHub deponuzda "Settings" sekmesine gidin
2. Sol menüden "Pages" seçin
3. "Source" altında "Deploy from a branch" seçin
4. Branch olarak "main" seçin
5. Folder olarak "/ (root)" seçin
6. "Save" butonuna tıklayın
7. Birkaç dakika sonra oyununuz şu adreste yayında olacak:
   `https://KULLANICI_ADINIZ.github.io/depo-adi/`

## 🛠️ Teknolojiler

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
- Responsive Design

## 📝 Dosya Yapısı

```
nostaljik-platform-oyunu/
│
├── index.html          # Ana HTML dosyası
├── style.css           # Stil dosyası
├── game.js             # Oyun mantığı
├── README.md           # Bu dosya
└── characters/         # Karakter resimleri (opsiyonel)
    ├── mario.png
    └── luigi.png
```

## 🎮 Oyun Mekanikleri

- **Zıplama:** Yerçekimi ve zıplama fizikleri
- **Platformlar:** Farklı yüksekliklerde platformlar
- **Düşmanlar:** Üzerine zıplayarak yok edebileceğiniz düşmanlar
- **Altınlar:** Toplanabilir altınlar (skor artırır)
- **Can Sistemi:** 3 can hakkınız var
- **Kamera:** Oyuncuyu takip eden kamera

## 🐛 Sorun Giderme

### Oyun açılmıyor
- Tarayıcı konsolunu kontrol edin (F12)
- Dosya yollarının doğru olduğundan emin olun

### Mobil kontroller çalışmıyor
- Tarayıcının dokunmatik olayları desteklediğinden emin olun
- Sayfayı yenileyin

### Karakter resimleri görünmüyor
- `characters` klasörünün doğru konumda olduğundan emin olun
- Resim dosyalarının adlarının doğru olduğundan emin olun
- Veya "Özel Resim" seçeneğini kullanın

## 📄 Lisans

Bu proje eğitim amaçlıdır ve özgürce kullanılabilir.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull request göndermekten çekinmeyin.

## 📧 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**İyi Oyunlar! 🎮**