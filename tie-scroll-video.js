class TieScrollVideo extends HTMLElement {
  connectedCallback() {
    var scroll = parseFloat(this.getAttribute('scroll-vh')) || 300;
    var smooth = parseFloat(this.getAttribute('smooth')) || 0.12;
    var line1 = this.getAttribute('line1') || 'Tiê Passos';
    var line2 = this.getAttribute('line2') || 'Designer Multimídia';
    var src = this.getAttribute('video-src') ||
      'https://video.wixstatic.com/video/8d49b9_057dda1340054c4882cf3e63fedb5a0a/1080p/mp4/file.mp4';

    this.innerHTML =
      '<div class="tw" style="position:relative;width:100%;height:' + scroll + 'vh;background:#fff;">' +
        '<div class="ts" style="position:sticky;top:0;width:100%;height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden;">' +
          '<video class="tv" playsinline muted preload="auto" webkit-playsinline ' +
            'style="width:100%;height:100%;object-fit:cover;background:#fff;pointer-events:none;display:block;">' +
            '<source src="' + src + '" type="video/mp4" />' +
          '</video>' +
          '<div class="tcap" style="' +
            'position:absolute;left:50%;bottom:10%;transform:translate(-50%,20px);' +
            'text-align:center;color:#fff;font-family:Helvetica,Arial,sans-serif;' +
            'pointer-events:none;opacity:0;will-change:opacity,transform;' +
            'text-shadow:0 2px 14px rgba(0,0,0,0.5),0 1px 3px rgba(0,0,0,0.65);">' +
            '<div class="tcap1" style="font-weight:700;font-size:clamp(32px,6vw,80px);letter-spacing:0.03em;line-height:1.05;">' + line1 + '</div>' +
            '<div class="tcap2" style="font-weight:400;font-size:clamp(16px,2.4vw,30px);letter-spacing:0.18em;text-transform:uppercase;margin-top:0.4em;opacity:0.92;">' + line2 + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var wrap  = this.querySelector('.tw');
    var video = this.querySelector('.tv');
    var cap   = this.querySelector('.tcap');
    var dur = 0, ready = false, target = 0, current = 0;

    video.addEventListener('loadedmetadata', function () {
      dur = video.duration || 0; ready = true;
    });
    video.pause();

    function progress() {
      var rect = wrap.getBoundingClientRect();
      var scrollable = wrap.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      var scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      return scrolled / scrollable;
    }

    // mapeia o texto: invisível -> fade in -> visível -> fade out
    function captionOpacity(p) {
      // p de 0 a 1 (progresso do scroll)
      if (p < 0.05) return p / 0.05;            // fade-in rápido no começo (0 a 0.05)
      if (p < 0.45) return 1;                    // visível (0.05 a 0.45)
      if (p < 0.65) return 1 - (p - 0.45) / 0.2; // fade-out (0.45 a 0.65)
      return 0;                                  // sumido no resto
    }

    function onScroll() {
      if (!ready || dur === 0) return;
      var p = progress();
      target = p * dur;
      var o = captionOpacity(p);
      cap.style.opacity = o;
      // sobe suavemente enquanto aparece
      cap.style.transform = 'translate(-50%,' + (20 - o * 20) + 'px)';
    }

    function tick() {
      if (ready && dur > 0) {
        current += (target - current) * smooth;
        if (Math.abs(target - current) < 0.001) current = target;
        if (video.readyState >= 2) { try { video.currentTime = current; } catch (e) {} }
      }
      requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    requestAnimationFrame(tick);
  }
}
if (!customElements.get('tie-scroll-video')) {
  customElements.define('tie-scroll-video', TieScrollVideo);
}
