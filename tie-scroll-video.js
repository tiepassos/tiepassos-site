class TieScrollVideo extends HTMLElement {
  connectedCallback() {
    var scroll = parseFloat(this.getAttribute('scroll-vh')) || 300;
    var smooth = parseFloat(this.getAttribute('smooth')) || 0.12;
    var caption = this.getAttribute('caption') || 'Designer Multimídia';
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
            'position:absolute;left:50%;bottom:8%;transform:translateX(-50%);' +
            'color:#fff;font-family:Helvetica,Arial,sans-serif;font-weight:700;' +
            'font-size:clamp(24px,4vw,56px);letter-spacing:0.04em;text-align:center;' +
            'text-shadow:0 2px 12px rgba(0,0,0,0.45),0 1px 3px rgba(0,0,0,0.6);' +
            'pointer-events:none;white-space:nowrap;">' + caption + '</div>' +
        '</div>' +
      '</div>';

    var wrap = this.querySelector('.tw');
    var video = this.querySelector('.tv');
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
    function onScroll() {
      if (!ready || dur === 0) return;
      target = progress() * dur;
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
