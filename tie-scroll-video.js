class TieScrollVideo extends HTMLElement {
  connectedCallback() {
    var scroll = parseFloat(this.getAttribute('scroll-vh')) || 300;
    var smooth = parseFloat(this.getAttribute('smooth')) || 0.12;
    var line1 = this.getAttribute('line1') || 'Tiê Passos';
    var line2 = this.getAttribute('line2') || 'Designer Multimídia';
    var src = this.getAttribute('video-src') ||
      'https://video.wixstatic.com/video/8d49b9_057dda1340054c4882cf3e63fedb5a0a/1080p/mp4/file.mp4';

    var fontStack = "'Gotham','Gotham SSm','Montserrat','Helvetica Neue',Arial,sans-serif";

    // quebra cada linha em <span> por letra, pra animar uma a uma
    function splitLetters(text) {
      var html = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i] === ' ' ? '&nbsp;' : text[i];
        html += '<span class="ltr" data-i="' + i + '" style="display:inline-block;opacity:0;filter:blur(8px);transform:translateY(14px);will-change:opacity,filter,transform;">' + ch + '</span>';
      }
      return html;
    }

    this.innerHTML =
      '<div class="tw" style="position:relative;width:100%;height:' + scroll + 'vh;background:#fff;">' +
        '<div class="ts" style="position:sticky;top:0;width:100%;height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden;">' +
          '<video class="tv" playsinline muted preload="auto" webkit-playsinline ' +
            'style="width:100%;height:100%;object-fit:cover;background:#fff;pointer-events:none;display:block;">' +
            '<source src="' + src + '" type="video/mp4" />' +
          '</video>' +
          '<div class="tcap" style="' +
            'position:absolute;top:50%;left:42%;transform:translate(-50%,-50%);' +   // centro deslocado à esquerda
            'text-align:center;color:#fff;font-family:' + fontStack + ';' +
            'pointer-events:none;' +
            'text-shadow:0 2px 14px rgba(0,0,0,0.5),0 1px 3px rgba(0,0,0,0.65);">' +
            '<div class="tcap1" style="font-weight:700;font-size:clamp(32px,6vw,80px);letter-spacing:0.03em;line-height:1.05;">' + splitLetters(line1) + '</div>' +
            '<div class="tcap2" style="font-weight:400;font-size:clamp(16px,2.4vw,30px);letter-spacing:0.18em;text-transform:uppercase;margin-top:0.5em;">' + splitLetters(line2) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var wrap  = this.querySelector('.tw');
    var video = this.querySelector('.tv');
    var letters = this.querySelectorAll('.ltr');
    var totalLetters = letters.length;
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

    // O texto começa a aparecer só na METADE (0.5) e termina a entrada em 0.72.
    // Some depois de 0.85.
    var START = 0.50;   // começa a aparecer
    var END   = 0.72;   // todas as letras já entraram
    var FADE_OUT_START = 0.85;
    var FADE_OUT_END   = 0.95;

    function updateCaption(p) {
      // fase de saída
      if (p >= FADE_OUT_START) {
        var fo = 1 - Math.min((p - FADE_OUT_START) / (FADE_OUT_END - FADE_OUT_START), 1);
        for (var k = 0; k < totalLetters; k++) {
          letters[k].style.opacity = fo;
          letters[k].style.filter = 'blur(' + (1 - fo) * 6 + 'px)';
        }
        return;
      }
      // fase de entrada letra a letra
      var span = END - START;
      for (var i = 0; i < totalLetters; i++) {
        // cada letra tem sua própria janelinha dentro de [START, END]
        var lstart = START + (i / totalLetters) * span;
        var lend = lstart + span / totalLetters;
        var t = (p - lstart) / (lend - lstart);
        t = Math.min(Math.max(t, 0), 1);
        // easing suave
        var e = t * t * (3 - 2 * t);
        letters[i].style.opacity = e;
        letters[i].style.filter = 'blur(' + (1 - e) * 8 + 'px)';
        letters[i].style.transform = 'translateY(' + (14 - e * 14) + 'px)';
      }
    }

    function onScroll() {
      if (!ready || dur === 0) return;
      var p = progress();
      target = p * dur;
      updateCaption(p);
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
