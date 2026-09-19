document.addEventListener('DOMContentLoaded', function () {
  // 0. Initialize Theme (Dark by default)
  const savedTheme = localStorage.getItem('sage_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sage_theme', newTheme);
      btn.innerHTML = newTheme === 'dark' ? '<i class="bi bi-sun-fill text-warning"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    });
  });

  // 1. Initialize Direction (LTR by default, switchable to RTL)
  const savedDir = localStorage.getItem('sage_direction') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);

  const toggleBtns = document.querySelectorAll('.dir-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('sage_direction', newDir);
    });
  });

  // 1. Initialize IEP Goal Progress Chart
  initGoalChart();

  // 2. Document Vault Filtering and Search
  initDocumentVault();

  // 3. Direct Chat Simulation with Advocate
  initAdvocateChat();

  // 4. Section Navigation (Single page tab-switching inside dashboard)
  initDashboardTabs();

  // 5. Sidebar toggle for mobile
  initSidebarToggle();
});

/**
 * Chart.js IEP Goal Progress Visualizer
 */
let goalChartInstance = null;

function initGoalChart() {
  const ctx = document.getElementById('iepGoalChart');
  if (!ctx) return;

  const dataSets = {
    all: {
      labels: ['Baseline (Sept)', 'Oct Milestone', 'Nov Review', 'Dec Benchmark', 'Jan Checkpoint', 'Current (Feb)'],
      targets: [40, 50, 60, 70, 80, 90],
      reading: [38, 48, 58, 68, 75, 82],
      speech: [30, 42, 54, 65, 78, 86],
      math: [45, 52, 60, 66, 72, 80],
      sensory: [35, 45, 55, 70, 80, 88]
    }
  };

  goalChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataSets.all.labels,
      datasets: [
        {
          label: 'Target Benchmark (Annual Mastery 90%)',
          data: dataSets.all.targets,
          borderColor: '#D4A373',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          pointRadius: 3,
          borderWidth: 2,
          tension: 0.1
        },
        {
          label: 'Reading Comprehension (SMART Goal #1)',
          data: dataSets.all.reading,
          borderColor: '#3D3045',
          backgroundColor: 'rgba(61, 48, 69, 0.05)',
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#3D3045',
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: 'Speech & Articulation Clarity (SMART Goal #2)',
          data: dataSets.all.speech,
          borderColor: '#C98F91',
          backgroundColor: 'rgba(201, 143, 145, 0.05)',
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#C98F91',
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: 'Sensory Self-Regulation & Breaks (SMART Goal #4)',
          data: dataSets.all.sensory,
          borderColor: '#52796F',
          backgroundColor: 'rgba(82, 121, 111, 0.05)',
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#52796F',
          borderWidth: 2.5,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '500' },
            color: '#3D3045',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: '#3D3045',
          titleFont: { family: "'Fraunces', serif", size: 14 },
          bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw}% Mastery`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 20,
          max: 100,
          ticks: {
            callback: value => value + '%',
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            color: '#726D74'
          },
          grid: { color: 'rgba(61, 48, 69, 0.06)' }
        },
        x: {
          ticks: {
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            color: '#726D74'
          },
          grid: { display: false }
        }
      }
    }
  });

  // Goal Selector filter
  const goalSelect = document.getElementById('goalFilterDropdown');
  if (goalSelect) {
    goalSelect.addEventListener('change', function () {
      const selected = this.value;
      if (selected === 'all') {
        goalChartInstance.data.datasets.forEach(ds => ds.hidden = false);
      } else {
        const index = parseInt(selected, 10);
        goalChartInstance.data.datasets.forEach((ds, idx) => {
          if (idx === 0 || idx === index) {
            ds.hidden = false;
          } else {
            ds.hidden = true;
          }
        });
      }
      goalChartInstance.update();
    });
  }
}

/**
 * Document Vault: Filter, Upload Simulation & Preview
 */
function initDocumentVault() {
  const filterPills = document.querySelectorAll('.doc-filter-pill');
  const docRows = document.querySelectorAll('.document-item-row');
  const searchInput = document.getElementById('docSearchInput');
  const uploadForm = document.getElementById('simulatedUploadForm');

  function applyFilters() {
    const activePill = document.querySelector('.doc-filter-pill.active');
    const category = activePill ? activePill.dataset.docCat : 'all';
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    docRows.forEach(row => {
      const rowCat = row.dataset.docCat || '';
      const text = row.textContent.toLowerCase();
      const matchesCat = (category === 'all' || rowCat === category);
      const matchesQuery = (!query || text.includes(query));

      if (matchesCat && matchesQuery) {
        row.style.display = 'flex';
      } else {
        row.style.display = 'none';
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', function () {
      filterPills.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // File Upload Simulation
  if (uploadForm) {
    uploadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const fileInput = document.getElementById('vaultFileInput');
      const docType = document.getElementById('vaultDocType').value;
      const notes = document.getElementById('vaultDocNotes').value;
      const progressWrap = document.getElementById('uploadProgressWrap');
      const progressBar = document.getElementById('uploadProgressBar');
      const statusText = document.getElementById('uploadStatusText');

      if (!fileInput || !fileInput.files.length) {
        alert('Please choose a file to upload (PDF, DOCX, or Image).');
        return;
      }

      const fileName = fileInput.files[0].name;
      progressWrap.classList.remove('d-none');
      let progress = 10;
      progressBar.style.width = `${progress}%`;
      statusText.textContent = `Encrypting & Uploading ${fileName}...`;

      const interval = setInterval(() => {
        progress += 25;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
          clearInterval(interval);
          statusText.innerHTML = `<i class="bi bi-shield-check text-success"></i> Upload complete & scanned for FERPA encryption. Notifying Advocate Lisa Anderson...`;
          setTimeout(() => {
            // Close modal
            const modalEl = document.getElementById('uploadDocModal');
            if (modalEl && typeof bootstrap !== 'undefined') {
              const modal = bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
            alert(`Document "${fileName}" successfully added to Leo's secure vault!`);
            location.reload();
          }, 1000);
        }
      }, 400);
    });
  }
}

/**
 * Direct Messaging Simulator
 */
function initAdvocateChat() {
  const chatForm = document.getElementById('advocateChatForm');
  const chatInput = document.getElementById('chatMessageInput');
  const threadBox = document.getElementById('chatThreadBox');
  if (!chatForm || !chatInput || !threadBox) return;

  chatForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    // Append parent message
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const parentBubble = document.createElement('div');
    parentBubble.className = 'chat-message sent';
    parentBubble.innerHTML = `
      <div>
        <div class="chat-bubble">
          ${escapeHTML(message)}
        </div>
        <div class="chat-timestamp text-end">${timeStr} · Sent & Encrypted</div>
      </div>
    `;
    threadBox.appendChild(parentBubble);
    chatInput.value = '';
    threadBox.scrollTop = threadBox.scrollHeight;

    // Simulate Advocate Typing indicator
    setTimeout(() => {
      const typingIndicator = document.createElement('div');
      typingIndicator.id = 'typingIndicator';
      typingIndicator.className = 'chat-message received';
      typingIndicator.innerHTML = `
        <div class="student-avatar-badge" style="background: var(--sage-plum); width: 34px; height: 34px; font-size: 0.8rem;">LA</div>
        <div>
          <div class="chat-bubble bg-white text-muted fst-italic py-2 px-3">
            <span class="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true"></span>
            Lisa Anderson is typing...
          </div>
        </div>
      `;
      threadBox.appendChild(typingIndicator);
      threadBox.scrollTop = threadBox.scrollHeight;

      setTimeout(() => {
        const ind = document.getElementById('typingIndicator');
        if (ind) ind.remove();

        const replyBubble = document.createElement('div');
        replyBubble.className = 'chat-message received';
        
        let replyText = "Thank you Sarah! I've noted this in Leo's case timeline. I'm cross-referencing this against the Speech Pathologist's last evaluation before next Tuesday's ARD meeting.";
        if (message.toLowerCase().includes('meeting') || message.toLowerCase().includes('ard')) {
          replyText = "I have our pre-meeting strategy checklist ready. I'll arrive on the Zoom call 15 minutes before the school administrators join so we can align our priority list.";
        } else if (message.toLowerCase().includes('goal') || message.toLowerCase().includes('reading')) {
          replyText = "Great catch on that benchmark! I'll demand baseline data in writing from the special ed coordinator per IDEA 34 CFR § 300.320.";
        }

        replyBubble.innerHTML = `
          <div class="student-avatar-badge" style="background: var(--sage-plum); width: 34px; height: 34px; font-size: 0.8rem;">LA</div>
          <div>
            <div class="chat-bubble">
              ${replyText}
            </div>
            <div class="chat-timestamp">Just now · Lisa Anderson, M.Ed.</div>
          </div>
        `;
        threadBox.appendChild(replyBubble);
        threadBox.scrollTop = threadBox.scrollHeight;
      }, 1800);
    }, 800);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/**
 * Tab Navigation in Dashboard
 */
function initDashboardTabs() {
  const navLinks = document.querySelectorAll('.dash-nav-link[data-section]');
  const sections = document.querySelectorAll('.dash-section-pane');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.dataset.section;
      
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      sections.forEach(sec => {
        if (sec.id === targetId) {
          sec.classList.remove('d-none');
        } else {
          sec.classList.add('d-none');
        }
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If opening goal progress, trigger chart resize
      if (targetId === 'sec-goals' && goalChartInstance) {
        setTimeout(() => goalChartInstance.resize(), 100);
      }
    });
  });
}

/**
 * Mobile Sidebar Toggle
 */
function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.querySelector('.dash-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}
