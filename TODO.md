# TODO - YouTube iframe ambient stabilizasyonu

- [ ] `src/pages/Focus.jsx` içine `getYoutubeEmbedUrl` fonksiyonunu ekle (mute + enablejsapi + tam autoplay/loop parametreleriyle).
- [ ] `src/pages/Focus.jsx` içinde YouTube ambient için ayrı `useState` ile `youtubeEmbedUrl` state’i oluştur (render’da yeniden oluşturmayı azalt).
- [ ] iframe JSX bloğunu ekle: `className="hidden"` kullanmadan opacity 0 + pointerEvents none + absolute ile görünmez yap.
- [ ] `allow` attribute’ünü `autoplay; encrypted-media` yap, `referrerPolicy="strict-origin-when-cross-origin"`, `allowFullScreen` ekle.
- [ ] `youtubeUrl` doluyken mevcut `Audio` çalmayı iframe’e bırak (preset/mp3 Audio durdurma) - Seçenek A.
- [ ] Local build/test: `npm run dev` çalıştır, verilen link ile autoplay dene:
  - https://www.youtube.com/watch?v=jfKfPfyJRdk
