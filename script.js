const artefactsContainer = document.getElementById('artefacts');
const contrastToggle = document.getElementById('contrast-toggle');
const increaseText = document.getElementById('increase-text');
const decreaseText = document.getElementById('decrease-text');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalClose = document.getElementById('modal-close');

let currentFontSize = 16;

contrastToggle.addEventListener('click', () => {
  document.body.classList.toggle('high-contrast');
});

increaseText.addEventListener('click', () => {
  currentFontSize += 2;
  document.body.style.fontSize = `${currentFontSize}px`;
});

decreaseText.addEventListener('click', () => {
  currentFontSize = Math.max(12, currentFontSize - 2);
  document.body.style.fontSize = `${currentFontSize}px`;
});

modalClose.addEventListener('click', () => {
  modal.hidden = true;
  modalTitle.textContent = '';
  modalDesc.textContent = '';
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) {
    modal.hidden = true;
    modalTitle.textContent = '';
    modalDesc.textContent = '';
  }
});

async function fetchArtefacts() {
  try {
    const response = await fetch('https://api.vam.ac.uk/v2/objects/search?q=fashion&page_size=30&images=true');
    const data = await response.json();
    displayArtefacts(data.records);
  } catch (error) {
    artefactsContainer.innerHTML = '<p>Error fetching artefacts.</p>';
    console.error(error);
  }
}

function displayArtefacts(artefacts) {
  artefactsContainer.innerHTML = '';
  artefacts.forEach(item => {
    const title = item.title || 'Untitled';
    const maker = item._primaryMaker || 'Unknown maker';
    const date = item.objectDate || 'Date not available';
    const description = item._primaryDescription || 'No description available.';
    const imageId = item._primaryImageId;
    const imageUrl = imageId
      ? `https://framemark.vam.ac.uk/collections/${imageId}/full/768,/0/default.jpg`
      : '';

    const article = document.createElement('article');
    article.className = 'artefact';
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-pressed', 'false');
    article.setAttribute('aria-label', `${title} by ${maker}, ${date}. Click for more information.`);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `${title} by ${maker}, ${date}`;

    const h2 = document.createElement('h2');
    h2.textContent = title;

    const pMaker = document.createElement('p');
    pMaker.textContent = `Maker: ${maker}`;

    const pDate = document.createElement('p');
    pDate.textContent = `Date: ${date}`;

    article.appendChild(img);
    article.appendChild(h2);
    article.appendChild(pMaker);
    article.appendChild(pDate);

    article.addEventListener('click', () => {
      modalTitle.textContent = title;
      modalDesc.textContent = description;
      modal.hidden = false;
    });

    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        modalTitle.textContent = title;
        modalDesc.textContent = description;
        modal.hidden = false;
      }
    });

    artefactsContainer.appendChild(article);
  });
}

fetchArtefacts();


