// Importing modern style files with Firebase theme
import './modern-firebase-theme.css';

// Exporting utility functions for animations
export const applyStaggerAnimation = (elements, delay = 100) => {
  if (!elements || elements.length === 0) return;
  
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('stagger-item-visible');
    }, index * delay);
  });
};

// Function to apply hover effects to cards
export const applyCardHoverEffects = (cardElements) => {
  if (!cardElements || cardElements.length === 0) return;
  
  cardElements.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = 'var(--shadow-lg), var(--shadow-glow)';
      card.style.borderColor = 'rgba(255, 152, 0, 0.3)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'var(--shadow-md)';
      card.style.borderColor = 'rgba(255, 255, 255, 0.06)';
    });
  });
};

// Apply glassmorphism effect
export const applyGlassmorphism = (element) => {
  if (!element) return;
  
  element.classList.add('glass-panel');
};

// Function to apply Firebase-specific effects
export const applyFirebaseEffects = (elements) => {
  if (!elements || elements.length === 0) return;
  
  elements.forEach(element => {
    // Add Firebase gradient border
    element.style.borderLeft = '3px solid var(--firebase-orange)';
    
    // Add subtle glow on hover
    element.addEventListener('mouseenter', () => {
      element.style.boxShadow = 'var(--shadow-glow)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.boxShadow = 'var(--shadow-md)';
    });
  });
};

// Function to create Firebase-styled badges
export const createFirebaseBadge = (container, text, type = 'default') => {
  if (!container) return;
  
  const badge = document.createElement('span');
  badge.innerText = text;
  badge.classList.add('firebase-chip');
  
  if (type === 'success') {
    badge.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
    badge.style.color = '#10B981';
  } else if (type === 'warning') {
    badge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
    badge.style.color = '#F59E0B';
  } else if (type === 'error') {
    badge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    badge.style.color = '#EF4444';
  }
  
  container.appendChild(badge);
};

// Apply gradient text effect
export const applyGradientText = (elements) => {
  if (!elements || elements.length === 0) return;
  
  elements.forEach(element => {
    element.classList.add('firebase-gradient-text');
  });
};