const collectionEl = document.getElementById("collection");
const ttsToggle = document.getElementById("tts-toggle");
const contrastToggle = document.getElementById("contrast-toggle");
let ttsEnabled = false;
let highContrastEnabled = false;

// Fetch data from V&A API for 30 artefacts related to Prints, Drawings & Paintings
async function fetchArtefacts() {
  try {
    // Fetch first 15 artefacts (page 1)
    const page1 = await fetch("https://api.vam.ac.uk/v2/objects/search?q=prints%20drawings%20paintings&limit=15&page=1");
    const data1 = await page1.json();
    
    // Fetch second 15 artefacts (page 2)
    const page2 = await fetch("https://api.vam.ac.uk/v2/objects/search?q=prints%20drawings%20paintings&limit=15&page=2");
    const data2 = await page2.json();

    // Combine the results from both pages
    const allItems = [...data1.records, ...data2.records];

    // Display artefacts once data is retrieved
    collectionEl.setAttribute("aria-busy", "false");
    allItems.forEach(item => displayArtefact(item));
  } catch (err) {
    console.error("Error fetching artefacts:", err);
    collectionEl.innerHTML = "<p role='alert'>Failed to load artefacts. Please try again later.</p>";
  }
}

// Display each artefact
function displayArtefact(item) {
  const artefactEl = document.createElement("article");
  artefactEl.className = "artefact";
  artefactEl.setAttribute("tabindex", "0"); // Make artefacts focusable for keyboard navigation

  const title = item.title || "Untitled Artefact";
  const description = item.description || "No description available for this artefact.";
  const imageUrl = item._primaryImageId ? `https://media.vam.ac.uk/media/thira/collection_images/${item._primaryImageId.slice(0, 6)}/${item._primaryImageId}.jpg` : '';
  
  // Create the HTML structure for the artefact
  artefactEl.innerHTML = `
    <h2>${title}</h2>
    ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="artefact-image">` : `<p>No image available</p>`}
    <p>${description}</p>
  `;

  collectionEl.appendChild(artefactEl);

  // Text-to-speech feature
  if (ttsEnabled) {
    artefactEl.addEventListener("focus", () => speakText(`${title}. ${description}`));
  }
}

// Text-to-Speech Function
function speakText(text) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.cancel(); // Cancel previous utterances
  speechSynthesis.speak(utterance);
}

// Toggle Text-to-Speech on and off
ttsToggle.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  ttsToggle.textContent = ttsEnabled ? "🔇 Disable Audio" : "🔊 Enable Audio";
  alert(ttsEnabled ? "Text-to-speech enabled." : "Text-to-speech disabled.");
});

// Toggle High Contrast Mode
contrastToggle.addEventListener("click", () => {
  highContrastEnabled = !highContrastEnabled;
  document.body.classList.toggle("high-contrast", highContrastEnabled);
  contrastToggle.textContent = highContrastEnabled ? "⚪ Normal Contrast" : "⚫ High Contrast";
});

// Initialize and fetch artefacts
fetchArtefacts();


