# TaskFlow

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

React tabanlı modern bir üretkenlik ve görev yönetimi uygulaması.  
TaskFlow; görev takibi, odaklanma zamanlayıcısı, Pomodoro geçmişi, rozet sistemi, profil yönetimi ve analitik ekranlarını tek bir arayüzde birleştirir.

---

# Özellikler

- Görev ekleme, düzenleme, silme ve durum değiştirme
- Dashboard üzerinden görevleri hızlı takip etme
- Odaklanma modu ve Pomodoro zamanlayıcısı
- Tamamlanan Pomodoro oturumlarını geçmişte görüntüleme
- Bildirim sesleri ve arka plan sesi ayarları
- YouTube veya direkt audio URL ile arka plan sesi kullanımı
- Rozet ve kazanım sistemi
- Profil bilgileri ve avatar yönetimi
- Analitik ekranı ve görev istatistikleri
- localStorage ile kullanıcı, görev, rozet ve odak ayarlarını kalıcı saklama
- Responsive sidebar ve mobil menü desteği
- Vitest ile helper ve context mantığı için temel unit testler

---

# Kullanılan Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Routing | React Router |
| State Management | Context API |
| Grafikler | Recharts |
| Kalıcılık | localStorage |
| Test | Vitest |
| Kod Kalitesi | ESLint |

---

# Proje Yapısı

```bash
taskflow/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── utils/
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

# Kurulum

## 1. Projeyi Klonla

```bash
git clone <repository-url>
cd taskflow
```

---

## 2. Bağımlılıkları Yükle

```bash
npm install
```

---

## 3. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama varsayılan olarak şu adreste çalışır:

```bash
http://localhost:5173
```

---

# Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Production build oluşturur |
| `npm run preview` | Production build'i yerelde önizler |
| `npm run lint` | ESLint kontrollerini çalıştırır |
| `npm test` | Vitest testlerini çalıştırır |

---

# Testler

Projede temel unit testler bulunur:

- Rozet kazanma mantığı
- Bildirim helper fonksiyonları
- Focus/Pomodoro yardımcı fonksiyonları

Test dosyaları:

```bash
src/context/BadgeContext.test.jsx
src/context/NotificationContext.test.jsx
src/pages/Focus.test.jsx
```

---

# Öne Çıkan Teknik Noktalar

- Global state yönetimi için Context API kullanıldı.
- Kullanıcı bilgileri ve uygulama ayarları localStorage ile saklanıyor.
- Focus sayfasındaki URL ve zaman helper'ları component dışına alınarak test edilebilir hale getirildi.
- Rozet hesaplama mantığı saf helper fonksiyonuna ayrıldı.
- Bildirim liste işlemleri küçük helper fonksiyonlarıyla test edildi.
- Uygulama route yapısı `MainLayout` altında merkezi olarak yönetiliyor.
- Responsive yapı sayesinde masaüstü ve mobil ekranlarda kullanılabilir arayüz sunuluyor.

---

# Ekranlar

Uygulamada yer alan temel ekranlar:

- Dashboard
- Tasks
- Focus
- Analytics
- Profile
- Badges

---
## Ekran Görüntüleri 

# Durum

Son kontroller için kullanılan komutlar:

```bash
npm test
npm run lint
npm run build
```

Proje bu komutlar başarıyla çalışacak şekilde yapılandırılmıştır.

---

# Not

TaskFlow, modern frontend geliştirme pratiklerini göstermek amacıyla hazırlanmış bir portföy projesidir. React ekosistemi, state yönetimi, test edilebilir helper yapısı ve responsive UI yaklaşımı üzerine pratik sunar.
