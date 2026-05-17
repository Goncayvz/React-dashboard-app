# TaskFlow

TaskFlow, görev yönetimi, odaklanma zamanlayıcısı, rozet sistemi, profil yönetimi ve analitik ekranlarını bir araya getiren React tabanlı bir üretkenlik uygulamasıdır. Proje; React Router, Context API, localStorage kalıcılığı, responsive arayüz ve temel unit test örnekleriyle modern frontend pratiklerini göstermek için geliştirilmiştir.

## Özellikler

- Görev ekleme, düzenleme, silme ve durum değiştirme
- Dashboard üzerinden görevlerin hızlı takibi
- Odaklanma modu ve Pomodoro zamanlayıcısı
- Tamamlanan Pomodoro oturumları geçmişi
- Bildirim sesleri ve arka plan sesi ayarları
- YouTube veya direkt audio URL ile arka plan sesi kullanımı
- Rozet/kazanım sistemi
- Profil bilgileri ve avatar yönetimi
- Analitik ekranı ve görev istatistikleri
- localStorage ile kalıcı kullanıcı, görev, rozet ve odak ayarları
- Responsive sidebar ve mobil menü desteği
- Vitest ile temel helper ve context mantığı testleri

## Teknolojiler

- React
- Vite
- React Router
- Context API
- Tailwind CSS
- Recharts
- Vitest
- ESLint

## Kurulum

Projeyi yerelde çalıştırmak için:

```bash
npm install
npm run dev
```

Vite geliştirme sunucusu varsayılan olarak şu adreste açılır:

```text
http://localhost:5173
```

## Komutlar

```bash
npm run dev
```

Geliştirme sunucusunu başlatır.

```bash
npm run build
```

Production build oluşturur.

```bash
npm run preview
```

Oluşturulan production build'i yerelde önizler.

```bash
npm run lint
```

ESLint kontrollerini çalıştırır.

```bash
npm test
```

Vitest testlerini çalıştırır.

## Testler

Projede temel unit testler bulunur:

- Rozet kazanma mantığı
- Bildirim helper fonksiyonları
- Focus/Pomodoro yardımcı fonksiyonları

Test dosyaları:

```text
src/context/BadgeContext.test.jsx
src/context/NotificationContext.test.jsx
src/pages/Focus.test.jsx
```

## Proje Yapısı

```text
src/
  components/      Ortak UI bileşenleri
  context/         User, Badge ve Notification context yapıları
  data/            Başlangıç verileri
  layouts/         Ana layout yapısı
  pages/           Dashboard, Tasks, Focus, Analytics, Profile, Badges sayfaları
  styles/          Sayfa bazlı CSS dosyaları
  utils/           Test edilebilir yardımcı fonksiyonlar
```

## Öne Çıkan Teknik Noktalar

- Global state için Context API kullanıldı.
- Kullanıcı ve uygulama ayarları localStorage ile saklanıyor.
- Focus sayfasındaki URL/time helper'ları component dışına alınarak test edilebilir hale getirildi.
- Rozet hesaplama mantığı saf helper fonksiyonuna ayrıldı.
- Bildirim liste işlemleri küçük helper fonksiyonlarıyla test edildi.
- Uygulama route yapısı `MainLayout` altında merkezi olarak yönetiliyor.

## Geliştirme Notları

Bu proje öğrenme ve portfolyo amacıyla geliştirilmiştir. Mevcut yapı çalışır durumdadır; daha ileri seviye geliştirme için şu adımlar değerlendirilebilir:

- Focus sayfasını daha küçük component'lara bölmek
- Görev işlemleri için ayrı custom hook yazmak
- Daha kapsamlı component testleri eklemek
- TypeScript'e geçmek
- localStorage yerine gerçek bir backend veya Firebase/Supabase entegrasyonu eklemek

## Durum

Son kontroller:

```bash
npm test
npm run lint
npm run build
```

Bu komutlar başarıyla çalışacak şekilde proje yapılandırılmıştır.
