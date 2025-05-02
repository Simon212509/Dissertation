document.addEventListener('DOMContentLoaded', function() {
  // State variables
  let artifacts = [];
  let currentPage = 1;
  let artifactsPerPage = 12;
  let isSpeechEnabled = false;
  let speechSynthesis = window.speechSynthesis;
  let speechUtterance = null;
  
  // DOM Elements
  const galleryContainer = document.getElementById('artifacts-gallery');
  const loadingContainer = document.getElementById('loading');
  const errorContainer = document.getElementById('error-container');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const fontSizeSelect = document.getElementById('font-size');
  const contrastToggle = document.getElementById('toggle-contrast');
  const speechToggle = document.getElementById('toggle-speech');
  const stopSpeech = document.getElementById('stop-speech');
  const modal = document.getElementById('artifact-modal');
  const modalDetails = document.getElementById('modal-details');
  const closeModalButton = document.getElementById('close-modal');
  
  // Accessibility Features Implementation
  
  // Font Size
  fontSizeSelect.addEventListener('change', function() {
      document.body.className = document.body.className.replace(/font-\w+/g, '');
      document.body.classList.add(`font-${this.value}`);
      localStorage.setItem('preferredFontSize', this.value);
      
      // Announce font size change to screen readers
      announceToScreenReader(`Font size changed to ${this.value}`);
  });
  
  // High Contrast Toggle
  contrastToggle.addEventListener('click', function() {
      document.body.classList.toggle('high-contrast');
      const isHighContrast = document.body.classList.contains('high-contrast');
      this.setAttribute('aria-pressed', isHighContrast);
      localStorage.setItem('highContrast', isHighContrast);
      
      // Announce contrast change to screen readers
      announceToScreenReader(`High contrast mode ${isHighContrast ? 'enabled' : 'disabled'}`);
  });
  
  // Text-to-Speech
  speechToggle.addEventListener('click', function() {
      isSpeechEnabled = !isSpeechEnabled;
      this.setAttribute('aria-pressed', isSpeechEnabled);
      stopSpeech.disabled = !isSpeechEnabled;
      localStorage.setItem('speechEnabled', isSpeechEnabled);
      
      // Announce TTS change to screen readers
      announceToScreenReader(`Text to speech ${isSpeechEnabled ? 'enabled' : 'disabled'}`);
  });
  
  stopSpeech.addEventListener('click', function() {
      if (speechSynthesis && speechUtterance) {
          speechSynthesis.cancel();
          this.disabled = true;
          setTimeout(() => {
              this.disabled = isSpeechEnabled ? false : true;
          }, 100);
      }
  });
  
  // Function to speak text
  function speakText(text) {
      if (isSpeechEnabled && speechSynthesis) {
          // Cancel any current speech
          speechSynthesis.cancel();
          
          // Create new utterance
          speechUtterance = new SpeechSynthesisUtterance(text);
          
          // Get available voices
          const voices = speechSynthesis.getVoices();
          
          // Try to select an English voice if available
          const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
          if (englishVoice) {
              speechUtterance.voice = englishVoice;
          }
          
          // Speak
          speechSynthesis.speak(speechUtterance);
          stopSpeech.disabled = false;
      }
  }
  
  // Screen reader announcement
  function announceToScreenReader(message) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'assertive');
      announcer.classList.add('sr-only');
      document.body.appendChild(announcer);
      
      setTimeout(() => {
          announcer.textContent = message;
          
          // Clean up after announcement
          setTimeout(() => {
              document.body.removeChild(announcer);
          }, 1000);
      }, 100);
  }
  
  // Keyboard navigation
  function setupKeyboardNavigation() {
      // For gallery items
      const focusableElements = Array.from(document.querySelectorAll('.artifact-card'));
      
      focusableElements.forEach((element, index) => {
          element.addEventListener('keydown', (e) => {
              // Enter or Space to click
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  element.click();
              }
              
              // Arrow key navigation
              if (e.key === 'ArrowRight' && index < focusableElements.length - 1) {
                  e.preventDefault();
                  focusableElements[index + 1].focus();
              }
              
              if (e.key === 'ArrowLeft' && index > 0) {
                  e.preventDefault();
                  focusableElements[index - 1].focus();
              }
              
              if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextRowIndex = index + Math.floor(galleryContainer.offsetWidth / element.offsetWidth);
                  if (nextRowIndex < focusableElements.length) {
                      focusableElements[nextRowIndex].focus();
                  }
              }
              
              if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const prevRowIndex = index - Math.floor(galleryContainer.offsetWidth / element.offsetWidth);
                  if (prevRowIndex >= 0) {
                      focusableElements[prevRowIndex].focus();
                  }
              }
          });
      });
  }
  
  // Modal functionality
  function openModal(artifact) {
      // Create modal content
      modalDetails.innerHTML = `
          <div class="artifact-placeholder" aria-hidden="true">
              <span>No image available</span>
          </div>
          <h2 id="modal-title" class="modal-title">${artifact.title}</h2>
          <p class="modal-date">${artifact.date}</p>
          <div class="modal-description">
              ${artifact.description || 'No description available.'}
          </div>
      `;
      
      // If there's an image
      if (artifact.image) {
          const imgElement = document.createElement('img');
          imgElement.src = artifact.image;
          imgElement.alt = `Image of ${artifact.title}`;
          imgElement.classList.add('modal-image');
          
          // Replace placeholder with actual image
          const placeholder = modalDetails.querySelector('.artifact-placeholder');
          placeholder.parentNode.replaceChild(imgElement, placeholder);
      }
      
      // Show modal
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus the close button for accessibility
      closeModalButton.focus();
      
      // Add escape key listener
      document.addEventListener('keydown', closeModalOnEscape);
      
      // Speak the title and description if text-to-speech is enabled
      if (isSpeechEnabled) {
          speakText(`${artifact.title}. ${artifact.date}. ${artifact.description || 'No description available.'}`);
      }
  }
  
  function closeModal() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      
      // Remove escape key listener
      document.removeEventListener('keydown', closeModalOnEscape);
      
      // Stop speaking if active
      if (speechSynthesis && speechUtterance) {
          speechSynthesis.cancel();
      }
      
      // Return focus to the element that opened the modal
      if (document.activeArtifactElement) {
          document.activeArtifactElement.focus();
          document.activeArtifactElement = null;
      }
  }
  
  function closeModalOnEscape(e) {
      if (e.key === 'Escape') {
          closeModal();
      }
  }
  
  closeModalButton.addEventListener('click', closeModal);
  
  // API Handling Functions
  
  async function fetchTheatreArtifacts() {
      try {
          // Show loading state
          loadingContainer.style.display = 'block';
          galleryContainer.innerHTML = '';
          errorContainer.innerHTML = '';
          
          // V&A API endpoint for theatre and performance collection
          const response = await fetch('https://api.vam.ac.uk/v2/objects/search?images_exist=true&page_size=30&theme_id=mlt491419&images=true');
          
          if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          
          // Process the data
          artifacts = data.records.map(record => {
              const imageUrl = record._images && record._images._primary_thumbnail 
                  ? record._images._primary_thumbnail 
                  : null;
                  
              return {
                  id: record.systemNumber,
                  title: record.objectType || 'Unknown Artifact',
                  date: record.productionDates || 'Date unknown',
                  description: record.briefDescription || 'No description available.',
                  image: imageUrl
              };
          });
          
          // Display artifacts
          displayArtifacts();
          updatePagination();
          
          // Hide loading
          loadingContainer.style.display = 'none';
          
          // Announce to screen readers that content has loaded
          announceToScreenReader(`${artifacts.length} artifacts loaded from the V&A Theatre Collection`);
          
      } catch (error) {
          console.error('Error fetching artifacts:', error);
          
          // Hide loading and show error
          loadingContainer.style.display = 'none';
          errorContainer.innerHTML = `
              <div class="error-message">
                  <p>Sorry, we encountered an error while loading the artifacts. Please try again later.</p>
                  <button id="retry-button">Retry</button>
              </div>
          `;
          
          // Add retry functionality
          document.getElementById('retry-button').addEventListener('click', fetchTheatreArtifacts);
          
          // Announce error to screen readers
          announceToScreenReader('Error loading artifacts. A retry button is available.');
      }
  }
  
  function displayArtifacts() {
      galleryContainer.innerHTML = '';
      
      // Calculate items for current page
      const startIndex = (currentPage - 1) * artifactsPerPage;
      const endIndex = Math.min(startIndex + artifactsPerPage, artifacts.length);
      const currentArtifacts = artifacts.slice(startIndex, endIndex);
      
      if (currentArtifacts.length === 0) {
          galleryContainer.innerHTML = '<p>No artifacts found.</p>';
          return;
      }
      
      // Create artifact cards
      currentArtifacts.forEach((artifact, index) => {
          const card = document.createElement('div');
          card.className = 'artifact-card';
          card.setAttribute('tabindex', '0');
          card.setAttribute('role', 'button');
          card.setAttribute('aria-label', `${artifact.title}, ${artifact.date}`);
          
          // Construct card HTML
          let cardContent = '';
          
          if (artifact.image) {
              cardContent += `<img src="${artifact.image}" alt="" class="artifact-image" aria-hidden="true">`;
          } else {
              cardContent += `<div class="artifact-placeholder" aria-hidden="true"><span>No image</span></div>`;
          }
          
          cardContent += `
              <div class="artifact-info">
                  <h3 class="artifact-title">${artifact.title}</h3>
                  <p class="artifact-date">${artifact.date}</p>
              </div>
          `;
          
          card.innerHTML = cardContent;
          
          // Add event listeners
          card.addEventListener('click', function() {
              document.activeArtifactElement = this;
              openModal(artifact);
          });
          
          // Handle keyboard enter/space as click
          card.addEventListener('keydown', function(e) {
              if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.activeArtifactElement = this;
                  openModal(artifact);
              }
          });
          
          // Mouse hover for text-to-speech
          card.addEventListener('mouseenter', function() {
              if (isSpeechEnabled) {
                  speakText(`${artifact.title}, ${artifact.date}`);
              }
          });
          
          galleryContainer.appendChild(card);
      });
      
      // Setup keyboard navigation for the newly added cards
      setupKeyboardNavigation();
      
      // Announce page change to screen readers
      announceToScreenReader(`Page ${currentPage} loaded with ${currentArtifacts.length} artifacts`);
  }
  
  function updatePagination() {
      const totalPages = Math.ceil(artifacts.length / artifactsPerPage);
      
      // Enable/disable previous button
      prevPageButton.disabled = currentPage <= 1;
      
      // Enable/disable next button
      nextPageButton.disabled = currentPage >= totalPages;
      
      // Update button labels with page info for screen readers
      prevPageButton.setAttribute('aria-label', `Previous page, page ${currentPage - 1} of ${totalPages}`);
      nextPageButton.setAttribute('aria-label', `Next page, page ${currentPage + 1} of ${totalPages}`);
  }
  
  // Pagination event listeners
  prevPageButton.addEventListener('click', function() {
      if (currentPage > 1) {
          currentPage--;
          displayArtifacts();
          updatePagination();
          // Scroll to top of gallery
          galleryContainer.scrollIntoView({ behavior: 'smooth' });
      }
  });
  
  nextPageButton.addEventListener('click', function() {
      const totalPages = Math.ceil(artifacts.length / artifactsPerPage);
      if (currentPage < totalPages) {
          currentPage++;
          displayArtifacts();
          updatePagination();
          // Scroll to top of gallery
          galleryContainer.scrollIntoView({ behavior: 'smooth' });
      }
  });
  
  // Load user preferences from local storage
  function loadUserPreferences() {
      // Font size
      const savedFontSize = localStorage.getItem('preferredFontSize');
      if (savedFontSize) {
          fontSizeSelect.value = savedFontSize;
          document.body.classList.add(`font-${savedFontSize}`);
      } else {
          document.body.classList.add('font-medium');
      }
      
      // High contrast
      const savedHighContrast = localStorage.getItem('highContrast') === 'true';
      if (savedHighContrast) {
          document.body.classList.add('high-contrast');
          contrastToggle.setAttribute('aria-pressed', 'true');
      }
      
      // Speech
      isSpeechEnabled = localStorage.getItem('speechEnabled') === 'true';
      speechToggle.setAttribute('aria-pressed', isSpeechEnabled ? 'true' : 'false');
      stopSpeech.disabled = !isSpeechEnabled;
  }
  
  // Initialize speech synthesis
  if ('speechSynthesis' in window) {
      speechSynthesis = window.speechSynthesis;
      
      // Get voices
      let voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
          // Voices might not be loaded yet
          speechSynthesis.onvoiceschanged = function() {
              voices = speechSynthesis.getVoices();
          };
      }
  } else {
      // Text-to-speech not supported
      speechToggle.disabled = true;
      stopSpeech.disabled = true;
      speechToggle.textContent = 'Text-to-Speech Not Supported';
      
      const speechControls = document.querySelector('.speech-controls');
      const helpText = document.createElement('span');
      helpText.classList.add('sr-only');
      helpText.textContent = 'Your browser does not support text-to-speech functionality';
      speechControls.appendChild(helpText);
  }
  
  // Fetch data with mock fallback
  function fallbackToMockData() {
      // Mock data to use if the API fails
      artifacts = Array.from({ length: 30 }, (_, i) => ({
          id: `mock-${i + 1}`,
          title: `Theatre Artifact ${i + 1}`,
          date: `${1900 + i}`,
          description: `This is a mock description for artifact ${i + 1}. This represents a theatre or performance item from the V&A collection. The description would normally contain historical context, materials, dimensions, and other relevant information about the artifact.`,
          image: null
      }));
      
      // Display mock artifacts
      displayArtifacts();
      updatePagination();
      
      // Hide loading
      loadingContainer.style.display = 'none';
      
      // Show mock data notice
      errorContainer.innerHTML = `
          <div class="error-message">
              <p>Using sample data. The V&A API could not be reached. You are viewing mock artifacts.</p>
              <button id="retry-button">Try API Again</button>
          </div>
      `;
      
      // Add retry functionality
      document.getElementById('retry-button').addEventListener('click', fetchTheatreArtifacts);
      
      // Announce to screen readers
      announceToScreenReader('Using sample data. The V&A API could not be reached.');
  }
  
  // Initialize the application
  loadUserPreferences();
  fetchTheatreArtifacts().catch(error => {
      console.error('Failed to fetch from API, using mock data instead', error);
      fallbackToMockData();
  });
});



