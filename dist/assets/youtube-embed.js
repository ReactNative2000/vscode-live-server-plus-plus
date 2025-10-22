// Lightweight helper to create a privacy-enhanced YouTube embed with a consent toggle.
window.createYouTubeEmbed = function(containerId, videoId, {width = '560', height = '315'} = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const placeholder = document.createElement('div');
  placeholder.className = 'youtube-placeholder';
  placeholder.innerHTML = `
    <div style="position:relative;max-width:${width}px;">
      <img src="https://img.youtube-nocookie.com/vi/${videoId}/hqdefault.jpg" alt="YouTube video thumbnail" style="width:100%;height:auto;display:block;">
      <button class="youtube-consent" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:10px 16px;background:rgba(0,0,0,0.7);color:white;border:none;border-radius:4px;cursor:pointer;">Play on YouTube</button>
    </div>
  `;

  container.appendChild(placeholder);
  const btn = container.querySelector('.youtube-consent');
  btn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`);
    iframe.setAttribute('width', width);
    iframe.setAttribute('height', height);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    container.innerHTML = '';
    container.appendChild(iframe);
  });
};
