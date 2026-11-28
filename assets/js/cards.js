// Card components - minimal implementation
export function createCard(data) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-content">
      <h3>${data.title || 'Untitled'}</h3>
      <p>${data.description || ''}</p>
    </div>
  `;
  return card;
}

export function createVideoCard(video) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.innerHTML = `
    <div class="video-thumbnail">
      <img src="${video.thumbnail || ''}" alt="${video.title}">
      <div class="video-duration">${video.duration || '0:00'}</div>
    </div>
    <div class="video-info">
      <h4>${video.title}</h4>
      <p>${video.speaker || ''}</p>
    </div>
  `;
  return card;
}
