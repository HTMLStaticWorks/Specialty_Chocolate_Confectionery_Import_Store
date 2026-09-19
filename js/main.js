/**
 * Maison du Cacao & Confectionery Import Co.
 * Main Interactive Javascript
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndDirection();
  initFullscreenMenu();
  initProductFilter();
  initFlavorQuiz();
  initGiftBoxBuilder();
  initCorporateCalculator();
  initEnquiryForms();
});

/* ==========================================================================
   1. Theme & RTL / LTR Direction Management
   ========================================================================== */
function initThemeAndDirection() {
  const currentTheme = localStorage.getItem('cacao_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);

  const currentDir = localStorage.getItem('cacao_dir') || 'ltr';
  document.documentElement.setAttribute('dir', currentDir);
  document.documentElement.setAttribute('lang', currentDir === 'rtl' ? 'ar' : 'en');

  // Theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', activeTheme);
      localStorage.setItem('cacao_theme', activeTheme);
      updateThemeIcons(activeTheme);
    });
  });

  // Direction toggle buttons
  document.querySelectorAll('.dir-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const activeDir = document.documentElement.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', activeDir);
      document.documentElement.setAttribute('lang', activeDir === 'rtl' ? 'ar' : 'en');
      localStorage.setItem('cacao_dir', activeDir);
    });
  });

  updateThemeIcons(currentTheme);
}

function updateThemeIcons(theme) {
  document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
    if (theme === 'dark') {
      icon.className = 'bi bi-sun-fill text-gold';
    } else {
      icon.className = 'bi bi-moon-stars-fill text-gold';
    }
  });
}

/* ==========================================================================
   2. Fullscreen Magnetic Menu & Hover Image Preview
   ========================================================================== */
function initFullscreenMenu() {
  const overlay = document.getElementById('fullscreenNavOverlay');
  const openBtns = document.querySelectorAll('.magnetic-menu-btn');
  const closeBtn = document.getElementById('navCloseBtn');

  if (!overlay) return;

  const openMenu = () => {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  openBtns.forEach(btn => btn.addEventListener('click', openMenu));
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Image preview on menu item hover
  const previewImgs = document.querySelectorAll('.overlay-preview-img');
  document.querySelectorAll('.overlay-menu-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const targetId = link.getAttribute('data-preview-img');
      previewImgs.forEach(img => img.classList.remove('active'));
      const targetImg = document.getElementById(targetId);
      if (targetImg) targetImg.classList.add('active');
    });
  });

  // Highlight active link based on URL and set initial preview
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.overlay-menu-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
      const activeImgId = link.getAttribute('data-preview-img');
      const activeImg = document.getElementById(activeImgId);
      if (activeImg) {
        previewImgs.forEach(img => img.classList.remove('active'));
        activeImg.classList.add('active');
      }
    }
  });

  // Restore active preview when mouse leaves menu
  const menuList = document.querySelector('.overlay-menu-list');
  if (menuList) {
    menuList.addEventListener('mouseleave', () => {
      const activeLink = document.querySelector('.overlay-menu-link.active');
      if (activeLink) {
        const activeImgId = activeLink.getAttribute('data-preview-img');
        const activeImg = document.getElementById(activeImgId);
        if (activeImg) {
          previewImgs.forEach(img => img.classList.remove('active'));
          activeImg.classList.add('active');
        }
      }
    });
  }
}

/* ==========================================================================
   3. Products Page Filtering & Quick View Modal
   ========================================================================== */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.origin-filter-btn');
  const productCards = document.querySelectorAll('.product-grid-col');

  if (!filterBtns.length || !productCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const origin = card.getAttribute('data-origin');
        const type = card.getAttribute('data-type');

        if (filterValue === 'all' || origin === filterValue || type === filterValue) {
          card.style.display = 'block';
          card.classList.add('fade-in-up');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. Interactive Flavor Matcher (Homepage Quiz)
   ========================================================================== */
function initFlavorQuiz() {
  const quizForm = document.getElementById('flavorMatcherForm');
  const resultCard = document.getElementById('flavorResultCard');

  if (!quizForm || !resultCard) return;

  quizForm.querySelectorAll('.quiz-option-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      const parentGroup = this.closest('.quiz-group');
      parentGroup.querySelectorAll('.quiz-option-pill').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
    });
  });

  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = quizForm.querySelector('button[type="submit"]');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Matching Grand Cru Terroirs...';

    setTimeout(() => {
      btn.innerHTML = '<i class="bi bi-check2-circle me-2"></i> Flavor Profile Matched!';
      resultCard.style.display = 'block';
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 800);
  });
}

/* ==========================================================================
   5. Interactive Custom Gift Box Builder (Gifting Page)
   ========================================================================== */
function initGiftBoxBuilder() {
  const boxSelects = document.querySelectorAll('.box-tier-option');
  const chocSelects = document.querySelectorAll('.choc-pick-item');
  const countBadge = document.getElementById('selectedChocCount');
  const totalDisplay = document.getElementById('giftTotalEstimate');
  const ribbonRadios = document.querySelectorAll('input[name="ribbonColor"]');

  if (!boxSelects.length) return;

  let basePrice = 68;
  let maxPicks = 6;
  let currentPicks = 0;

  boxSelects.forEach(box => {
    box.addEventListener('click', function() {
      boxSelects.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      basePrice = parseFloat(this.getAttribute('data-price')) || 68;
      maxPicks = parseInt(this.getAttribute('data-max')) || 6;
      updateGiftTotal();
    });
  });

  chocSelects.forEach(item => {
    item.addEventListener('click', function() {
      if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        currentPicks--;
      } else {
        if (currentPicks < maxPicks) {
          this.classList.add('selected');
          currentPicks++;
        } else {
          alert(`Your selected gift vault holds ${maxPicks} selections. Please upgrade the box size for more chocolates!`);
        }
      }
      if (countBadge) countBadge.textContent = `${currentPicks} / ${maxPicks}`;
      updateGiftTotal();
    });
  });

  function updateGiftTotal() {
    if (totalDisplay) {
      totalDisplay.textContent = `$${basePrice.toFixed(2)}`;
    }
  }
}

/* ==========================================================================
   6. Corporate Volume Tier Pricing Calculator (Corporate Page)
   ========================================================================== */
function initCorporateCalculator() {
  const recipientInput = document.getElementById('corpRecipients');
  const tierSelect = document.getElementById('corpTierSelect');
  const unitPriceDisplay = document.getElementById('corpUnitPrice');
  const discountDisplay = document.getElementById('corpDiscount');
  const totalDisplay = document.getElementById('corpTotalPrice');

  if (!recipientInput || !tierSelect) return;

  function calculateCorpPricing() {
    const qty = parseInt(recipientInput.value) || 25;
    const baseUnit = parseFloat(tierSelect.value) || 85;

    let discountPct = 0;
    if (qty >= 250) discountPct = 0.25;
    else if (qty >= 100) discountPct = 0.20;
    else if (qty >= 50) discountPct = 0.15;
    else if (qty >= 25) discountPct = 0.10;

    const unitPrice = baseUnit * (1 - discountPct);
    const totalPrice = unitPrice * qty;

    if (unitPriceDisplay) unitPriceDisplay.textContent = `$${unitPrice.toFixed(2)}`;
    if (discountDisplay) discountDisplay.textContent = `${(discountPct * 100)}% Volume Savings`;
    if (totalDisplay) totalDisplay.textContent = `$${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  recipientInput.addEventListener('input', calculateCorpPricing);
  tierSelect.addEventListener('change', calculateCorpPricing);
  calculateCorpPricing();
}

/* ==========================================================================
   7. Form Submissions
   ========================================================================== */
function initEnquiryForms() {
  document.querySelectorAll('.cacao-ajax-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Dispatching to Concierge...';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = '<i class="bi bi-check-lg me-2"></i> Enquiry Received — Thank You!';
        submitBtn.classList.remove('btn-cacao-gold', 'btn-cacao-primary');
        submitBtn.classList.add('btn-success');
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = origText;
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn-success');
          submitBtn.classList.add('btn-cacao-gold');
        }, 4000);
      }, 1000);
    });
  });
}
