(() => {
  'use strict';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Mobile navigation
  const navToggle = qs('#nav-toggle');
  const navMenu = qs('#nav-menu');

  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navMenu.classList.toggle('open', !isOpen);
      document.body.classList.toggle('menu-open', !isOpen);
    });

    qsa('a[href^="#"]', navMenu).forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 930) closeMenu();
    });
  }

  // Reading progress bar
  const progressBar = qs('#reading-progress-bar');
  const updateProgress = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0;
    progressBar.style.width = `${progress}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  // Reveal on scroll
  const revealItems = qsa('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 4) * 45, 135)}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  // Active navigation section
  const sectionIds = ['neuron', 'impuls', 'sinapsis', 'pusat', 'refleks', 'gangguan'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const navLinks = qsa('.nav-menu a[href^="#"]');

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', isActive);
      });
    }, { rootMargin: '-18% 0px -65% 0px', threshold: [0.05, 0.15, 0.3] });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Synapse stepper
  const synapseSteps = [
    {
      title: 'Impuls tiba di terminal akson',
      text: 'Impuls saraf sampai di terminal akson, kemudian kanal kalsium (Ca²⁺) terbuka.'
    },
    {
      title: 'Ion Ca²⁺ masuk',
      text: 'Ion (Ca²⁺) masuk yang memicu untuk bergerak dan berfusi dengan membran presinaptik Ion Ca²⁺ masuk dan memicu vesikel untuk bergerak serta berfusi dengan membran presinaptik.'
    },
    {
      title: 'Neurotransmitter dilepaskan',
      text: 'Neurotransmitter dilepaskan ke celah sinaptik melalui proses eksositosis.'
    },
    {
      title: 'Neurotransmitter berikatan',
      text: 'Neurotransmitter berikatan dengan reseptor yang berada pada membran postsinaptik.'
    },
    {
      title: 'Sel penerima merespons',
      text: 'Pada sel penerima terjadi respons berupa eksitasi atau inhibisi.'
    }
  ];

  let currentStep = 0;
  const stepContent = qs('#step-content');
  const stepIndicators = qsa('#step-indicators button');
  const prevButton = qs('#step-prev');
  const nextButton = qs('#step-next');

  const renderStep = (index) => {
    if (!stepContent || !synapseSteps[index]) return;
    currentStep = index;
    const step = synapseSteps[index];
    stepContent.innerHTML = `
      <span class="step-index">${String(index + 1).padStart(2, '0')} / ${String(synapseSteps.length).padStart(2, '0')}</span>
      <h4>${step.title}</h4>
      <p>${step.text}</p>
    `;

    stepIndicators.forEach((button, buttonIndex) => {
      button.classList.toggle('active', buttonIndex === index);
      button.classList.toggle('complete', buttonIndex < index);
      button.setAttribute('aria-current', buttonIndex === index ? 'step' : 'false');
    });
  };

  stepIndicators.forEach((button) => {
    button.addEventListener('click', () => {
      renderStep(Number(button.dataset.step));
    });
  });

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      renderStep((currentStep - 1 + synapseSteps.length) % synapseSteps.length);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      renderStep((currentStep + 1) % synapseSteps.length);
    });
  }

  // System pusat tabs
  const tabButtons = qsa('.tab-button');
  const tabPanels = qsa('.tab-panel');

  const activateTab = (tabName, shouldFocus = false) => {
    tabButtons.forEach((button) => {
      const selected = button.dataset.tab === tabName;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && shouldFocus) button.focus();
    });

    tabPanels.forEach((panel) => {
      const selected = panel.dataset.panel === tabName;
      panel.classList.toggle('active', selected);
      panel.hidden = !selected;
    });
  };

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => activateTab(button.dataset.tab));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabButtons.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabButtons.length - 1;

      activateTab(tabButtons[nextIndex].dataset.tab, true);
    });
  });

  // Quiz
  const quizForm = qs('#quiz-form');
  const quizScore = qs('#quiz-score strong');
  const quizFeedback = qs('#quiz-feedback');
  const quizQuestions = qsa('.quiz-question');

  if (quizForm) {
    quizForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let score = 0;
      let answered = 0;

      quizQuestions.forEach((question) => {
        const answer = question.dataset.answer;
        const checked = qs('input:checked', question);
        question.classList.remove('correct', 'wrong');

        if (!checked) return;
        answered += 1;
        const isCorrect = checked.value === answer;
        if (isCorrect) {
          score += 1;
          question.classList.add('correct');
        } else {
          question.classList.add('wrong');
        }
      });

      if (quizScore) quizScore.textContent = String(score);

      if (quizFeedback) {
        if (answered < quizQuestions.length) {
          quizFeedback.textContent = `Anda baru menjawab ${answered} dari ${quizQuestions.length} pertanyaan. Lengkapi semuanya untuk melihat hasil penuh.`;
        } else if (score === quizQuestions.length) {
          quizFeedback.textContent = 'Sempurna! Semua jawaban benar.';
        } else if (score >= 3) {
          quizFeedback.textContent = 'Bagus! Tinggal sedikit lagi untuk menguasai seluruh materi.';
        } else {
          quizFeedback.textContent = 'Coba tinjau kembali bagian materi yang terkait, lalu ulangi kuis.';
        }
      }
    });

    quizForm.addEventListener('reset', () => {
      setTimeout(() => {
        quizQuestions.forEach((question) => question.classList.remove('correct', 'wrong'));
        if (quizScore) quizScore.textContent = '0';
        if (quizFeedback) quizFeedback.textContent = '';
      }, 0);
    });

    // Reset feedback state on option change
    quizQuestions.forEach((question) => {
      question.addEventListener('change', () => {
        question.classList.remove('correct', 'wrong');
      });
    });
  }

  // Interactive Action Potential (Impuls Listrik) Stage Explorer
  const impulsStages = [
    {
      numText: 'Tahap 01 / 05',
      status: 'Resting State',
      title: 'Potensial Istirahat',
      voltage: '-70 mV',
      tooltip: '-70 mV (Istirahat)',
      markerClass: 'pos-step-0',
      summary: 'Bagian dalam neuron bermuatan negatif (-70 mV), dijaga aktif oleh pompa Na⁺/K⁺ yang memompa 3 Na⁺ keluar dan 2 K⁺ ke dalam sel dengan energi ATP.',
      text: 'Pada keadaan istirahat (<em>resting state</em>), bagian dalam neuron cenderung bermuatan negatif dibandingkan bagian luar sel. Kondisi ini disebut sebagai <strong>potensial istirahat (resting membrane potential)</strong>, yang umumnya berkisar sekitar <strong>-70 mV</strong>. Keadaan ini dipertahankan oleh kerja <strong>pompa natrium-kalium (Na⁺/K⁺ pump)</strong> yang secara aktif memompa ion natrium keluar sel dan ion kalium masuk ke dalam sel dengan menggunakan energi <strong>ATP</strong>.',
      naChannel: 'Tertutup',
      kChannel: 'Tertutup',
      pumpStatus: 'Aktif (ATP)',
      chips: [
        '<span>⚡</span> <strong>Muatan Dalam:</strong> Negatif (-70 mV)',
        '<span>🔋</span> <strong>Energi:</strong> ATP Hidrolisis Aktif',
        '<span>⚖️</span> <strong>Rasio Pompa:</strong> 3 Na⁺ Keluar : 2 K⁺ Masuk'
      ],
      nextAction: 'Lanjut ke Depolarisasi'
    },
    {
      numText: 'Tahap 02 / 05',
      status: 'Generasi Potensial Aksi',
      title: 'Depolarisasi',
      voltage: '+30 mV (Puncak)',
      tooltip: '+30 mV (Puncak)',
      markerClass: 'pos-step-1',
      summary: 'Kanal Na⁺ terbuka akibat rangsangan mencapai ambang batas, ion Na⁺ membanjiri masuk ke dalam sel hingga muatan dalam berubah drastis menjadi positif (+30 mV).',
      text: 'Pada tahap ini, kanal natrium terbuka sehingga ion Na⁺ masuk ke dalam sel dan menyebabkan bagian dalam sel menjadi lebih positif. Perubahan potensial ini memicu terbentuknya impuls listrik atau potensial aksi yang akan merambat sepanjang akson.',
      naChannel: 'Terbuka (Inflow)',
      kChannel: 'Tertutup',
      pumpStatus: 'Nonaktif Sementara',
      chips: [
        '<span>🌊</span> <strong>Aliran Ion:</strong> Na⁺ membanjiri masuk',
        '<span>📈</span> <strong>Voltase:</strong> Naik tajam hingga +30 mV',
        '<span>⚡</span> <strong>Efek:</strong> Impuls listrik tercipta'
      ],
      nextAction: 'Lanjut ke Repolarisasi'
    },
    {
      numText: 'Tahap 03 / 05',
      status: 'Pemulihan Muatan',
      title: 'Repolarisasi',
      voltage: 'Menuju Negatif',
      tooltip: 'K⁺ Keluar (Turun)',
      markerClass: 'pos-step-2',
      summary: 'Kanal Na⁺ menutup rapat dan kanal K⁺ terbuka lebar. Ion K⁺ keluar dari sel, mengembalikan muatan bagian dalam menjadi negatif.',
      text: 'Setelah depolarisasi mencapai puncaknya, kanal natrium akan menutup dan kanal kalium (K⁺) terbuka. Ion kalium keluar dari sel, sehingga muatan di dalam sel kembali menjadi negatif menuju batas istirahat.',
      naChannel: 'Tertutup (Inaktif)',
      kChannel: 'Terbuka (Outflow)',
      pumpStatus: 'Mulai Bekerja',
      chips: [
        '<span>🚪</span> <strong>Kanal Na⁺:</strong> Menutup rapat',
        '<span>💨</span> <strong>Aliran Ion:</strong> K⁺ keluar sel',
        '<span>📉</span> <strong>Muatan Dalam:</strong> Kembali negatif'
      ],
      nextAction: 'Lanjut ke Hiperpolarisasi'
    },
    {
      numText: 'Tahap 04 / 05',
      status: 'Periode Refrakter',
      title: 'Hiperpolarisasi',
      voltage: '< -70 mV',
      tooltip: '< -70 mV (Refrakter)',
      markerClass: 'pos-step-3',
      summary: 'Kanal K⁺ menutup lambat sehingga muatan dalam sel sempat turun lebih rendah dari batas istirahat (< -70 mV) sebelum distabilkan oleh pompa Na⁺/K⁺.',
      text: 'Penurunan muatan sesaat melebihi batas istirahat (menjadi lebih negatif dari -70 mV) sebelum kembali stabil ke potensial istirahat melalui aktivitas pemulihan oleh pompa Na⁺/K⁺. Periode ini memastikan impuls tidak merambat balik.',
      naChannel: 'Tertutup',
      kChannel: 'Menutup Perlahan',
      pumpStatus: 'Sangat Aktif',
      chips: [
        '<span>❄️</span> <strong>Periode:</strong> Refrakter (jeda respons)',
        '<span>🛡️</span> <strong>Proteksi:</strong> Impuls satu arah',
        '<span>🔄</span> <strong>Pemulihan:</strong> Pompa Na⁺/K⁺ aktif'
      ],
      nextAction: 'Lanjut ke Konduksi Saltatori'
    },
    {
      numText: 'Tahap 05 / 05',
      status: 'Transmisi Efisien',
      title: 'Konduksi Saltatori',
      voltage: 'Transmisi Cepat',
      tooltip: 'Nodus Ranvier',
      markerClass: 'pos-step-4',
      summary: 'Impuls listrik melompat antar Nodus Ranvier pada akson bermielin, melipatgandakan kecepatan hantar sinyal secara hemat energi.',
      text: 'Pada akson bermielin, impuls listrik “melompat” dari satu Nodus Ranvier ke Nodus Ranvier berikutnya sehingga kecepatan transmisi berlangsung jauh lebih cepat dan efisien dibandingkan serabut saraf tak bermielin.',
      naChannel: 'Terkonsentrasi di Nodus',
      kChannel: 'Terkonsentrasi di Nodus',
      pumpStatus: 'Hemat Energi',
      chips: [
        '<span>🦘</span> <strong>Metode:</strong> Loncatan Nodus Ranvier',
        '<span>⚡</span> <strong>Kecepatan:</strong> Sangat cepat & efisien',
        '<span>🛡️</span> <strong>Mielin:</strong> Isolator pelindung akson'
      ],
      nextAction: 'Ulangi dari Tahap 01 ↺'
    }
  ];

  let currentImpulsStage = 0;
  const stageNavItems = qsa('.stage-nav-item');
  const stageDots = qsa('#stage-progress-dots .p-dot');

  const diagramPhaseLabel = qs('#diagram-phase-label');
  const diagramVoltageLabel = qs('#diagram-voltage-label');
  const diagramVideo = qs('#diagram-video');
  const diagramMediaLabel = qs('#diagram-media-label');

  const metricVoltage = qs('#metric-voltage');
  const metricNa = qs('#metric-na');
  const metricK = qs('#metric-k');
  const metricPump = qs('#metric-pump');

  const stageCardNum = qs('#stage-card-num');
  const stageCardStatus = qs('#stage-card-status');
  const stageCardTitle = qs('#stage-card-title');
  const stageCardSummary = qs('#stage-card-summary');
  const stageCardText = qs('#stage-card-text');
  const stageCardChips = qs('#stage-card-chips');
  const stageForwardBtn = qs('#stage-forward-btn');
  const stagePrevBtn = qs('#stage-prev-btn');
  const stageNextBtn = qs('#stage-next-btn');

  const renderImpulsStage = (index) => {
    if (!impulsStages[index]) return;
    currentImpulsStage = index;
    const stage = impulsStages[index];

    // Nav tabs & dots active states
    stageNavItems.forEach((btn, idx) => {
      const isActive = idx === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    stageDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });

    // Diagram phase and voltage indicators
    if (diagramPhaseLabel) diagramPhaseLabel.textContent = `${stage.numText.split(' / ')[0]} · ${stage.title}`;
    if (diagramVoltageLabel) diagramVoltageLabel.textContent = stage.voltage;

    // Video02 continues seamlessly playing across all stages 01-05
    if (diagramVideo && diagramVideo.paused) {
      diagramVideo.play().catch(() => { });
    }

    // 4 Metrics (Row 1: Voltase & Na+, Row 2: K+ & Pompa)
    if (metricVoltage) metricVoltage.textContent = stage.voltage;
    if (metricNa) metricNa.textContent = stage.naChannel;
    if (metricK) metricK.textContent = stage.kChannel;
    if (metricPump) metricPump.textContent = stage.pumpStatus;

    // Active Stage Card Content
    if (stageCardNum) stageCardNum.textContent = stage.numText;
    if (stageCardStatus) stageCardStatus.textContent = stage.status;
    if (stageCardTitle) stageCardTitle.textContent = stage.title;
    if (stageCardSummary) stageCardSummary.textContent = stage.summary;
    if (stageCardText) stageCardText.innerHTML = stage.text;

    if (stageCardChips) {
      stageCardChips.innerHTML = stage.chips.map((chip) => `<div class="detail-chip">${chip}</div>`).join('');
    }

    if (stageForwardBtn) {
      stageForwardBtn.innerHTML = `<span>${stage.nextAction}</span> <span aria-hidden="true">→</span>`;
    }
  };

  stageNavItems.forEach((item) => {
    item.addEventListener('click', () => {
      renderImpulsStage(Number(item.dataset.stage));
    });
  });

  stageDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      renderImpulsStage(Number(dot.dataset.step));
    });
  });

  if (stagePrevBtn) {
    stagePrevBtn.addEventListener('click', () => {
      const prev = (currentImpulsStage - 1 + impulsStages.length) % impulsStages.length;
      renderImpulsStage(prev);
    });
  }

  if (stageNextBtn) {
    stageNextBtn.addEventListener('click', () => {
      const next = (currentImpulsStage + 1) % impulsStages.length;
      renderImpulsStage(next);
    });
  }

  if (stageForwardBtn) {
    stageForwardBtn.addEventListener('click', () => {
      const next = (currentImpulsStage + 1) % impulsStages.length;
      renderImpulsStage(next);
    });
  }

  // Google Maps Explorer canvas initialized cleanly
  const mapCanvas = qs('.gmaps-canvas');

  // Make smooth anchor scrolling respect keyboard, top links, and sticky header
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      // Special handling for top/back-to-top links
      if (targetId === '#top' || targetId === '#beranda' || link.classList.contains('back-top') || link.id === 'back-to-top-link') {
        event.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        if (history.pushState) history.pushState(null, '', window.location.pathname);
        return;
      }

      const target = qs(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.pushState) history.pushState(null, '', targetId);
    });
  });

  // Background Audio Controller with Floating Toggle Widget
  const bgAudio = qs('#bg-audio');
  const musicToggleBtn = qs('#music-toggle-btn');
  const musicStatusText = qs('#music-status-text');

  if (bgAudio && musicToggleBtn) {
    bgAudio.volume = 0.4;

    const updateAudioUI = (isPlaying) => {
      musicToggleBtn.classList.toggle('is-playing', isPlaying);
      musicToggleBtn.classList.toggle('is-paused', !isPlaying);
      musicToggleBtn.setAttribute('aria-label', isPlaying ? 'Matikan musik latar' : 'Nyalakan musik latar');
      musicToggleBtn.title = isPlaying ? 'Matikan Musik Latar' : 'Nyalakan Musik Latar';
      if (musicStatusText) {
        musicStatusText.textContent = isPlaying ? 'Aktif' : 'Mati';
      }
    };

    const playAudio = () => {
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            updateAudioUI(true);
          })
          .catch(() => {
            // Autoplay blocked by browser policy until user interacts
            updateAudioUI(false);
          });
      }
    };

    const pauseAudio = () => {
      bgAudio.pause();
      updateAudioUI(false);
    };

    // Toggle button click
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (bgAudio.paused) {
        playAudio();
      } else {
        pauseAudio();
      }
    });

    // Try autoplay immediately
    playAudio();

    // Fallback: start music on first user gesture if autoplay was blocked
    const startAudioOnFirstInteraction = () => {
      if (bgAudio.paused) {
        playAudio();
      }
      window.removeEventListener('click', startAudioOnFirstInteraction);
      window.removeEventListener('keydown', startAudioOnFirstInteraction);
      window.removeEventListener('touchstart', startAudioOnFirstInteraction);
      window.removeEventListener('scroll', startAudioOnFirstInteraction);
    };

    window.addEventListener('click', startAudioOnFirstInteraction, { once: true });
    window.addEventListener('keydown', startAudioOnFirstInteraction, { once: true });
    window.addEventListener('touchstart', startAudioOnFirstInteraction, { once: true });
    window.addEventListener('scroll', startAudioOnFirstInteraction, { once: true });
  }
})();

