/**
 * ASCD - Aplicativo de Estudo Bíblico, Sermões & Journaling
 * Digitação Rica com Formatação (Fontes, Tamanhos, Negrito, Itálico, Sublinhado e Marca-Textos)
 * Exportação em DOC, Excel e PDF para Anotações, Sermões e Journal.
 * Multi-seleção e exportação em lote de vários sermões e notas simultaneamente.
 * Modo Dividido com salvamento de anotação da página bíblica.
 * Journal com Seção de Oração e Lista interativa de "O que Fazer Nesse Dia".
 */

// Estado Global da Aplicação
const ASCD = {
  activeTab: 'biblia',
  isSplitView: false,
  currentBibleBook: 'sl',
  currentBibleChapter: 23,
  currentBibleVersion: 'bpt',
  theme: 'pergaminho',

  // Caderno de Estudos Bíblicos
  notes: [],
  activeNoteId: null,
  noteCurrentMode: 'hybrid',
  selectedNotes: new Set(),
  notesSelectMode: false,

  // Anotações de Sermões
  sermons: [],
  activeSermonId: null,
  sermonCurrentMode: 'hybrid',
  selectedSermons: new Set(),
  sermonsSelectMode: false,

  // Journaling com Calendário
  journalEntries: {}, // chave: 'YYYY-MM-DD'
  currentJournalDate: '', // 'YYYY-MM-DD'
  journalCurrentMode: 'hybrid',
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(), // 0-indexed
  selectedJournalDates: new Set(),
  journalSelectMode: false,

  // Anotações de Páginas Bíblicas (Modo Dividido)
  biblePageNotes: {}, // chave: `${bookId}_${chapterNum}`
  splitCurrentMode: 'hybrid',

  // Devocional Diário (Our Daily Bread / Pão Diário)
  currentDevotionalDate: '',
  devotionalFavorites: [],
  devotionalFontSize: 100,
  devotionalAudioPlaying: false,
  devotionalAudioRate: 1.0,
  devotionalSpeechUtterance: null,
  devotionalDrawerTab: 'recent'
};

// Conexão de Base de Dados na Nuvem (Firebase Cloud Firestore)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBvUJfszFl9O8zgHJZ2zot2zw_SyVAVc00",
  projectId: "ascd-app",
  firestoreBaseUrl: "https://firestore.googleapis.com/v1/projects/ascd-app/databases/(default)/documents",
  syncDocUrl: "https://firestore.googleapis.com/v1/projects/ascd-app/databases/(default)/documents/ascd_data/sync?key=AIzaSyBvUJfszFl9O8zgHJZ2zot2zw_SyVAVc00"
};

let autoSyncTimeout = null;
let isSyncingCloud = false;

// Configuração de Segurança e Palavra-passe
const DEFAULT_AUTH_PASSWORD = 'ascd2026';

function initAppSecurity() {
  const lockScreen = document.getElementById('ascd-auth-lockscreen');
  const authInput = document.getElementById('ascd-auth-input');
  const authError = document.getElementById('ascd-auth-error');
  const rememberCheckbox = document.getElementById('ascd-auth-remember');
  const togglePwdBtn = document.getElementById('btn-toggle-auth-pwd');
  const lockAppBtn = document.getElementById('btn-lock-app');

  if (!lockScreen) return;

  // Verificar se o dispositivo já foi autenticado anteriormente com sucesso
  const isRemembered = localStorage.getItem('ascd_auth_unlocked') === 'true';
  if (isRemembered) {
    lockScreen.classList.add('unlocked');
  } else {
    lockScreen.classList.remove('unlocked');
    setTimeout(() => {
      if (authInput) authInput.focus();
    }, 150);
  }

  // Alternar visibilidade da senha (olho)
  if (togglePwdBtn && authInput) {
    togglePwdBtn.addEventListener('click', () => {
      const isPwd = authInput.type === 'password';
      authInput.type = isPwd ? 'text' : 'password';
      togglePwdBtn.innerHTML = isPwd
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  }

  // Botão na barra superior para bloquear a app manualmente
  if (lockAppBtn) {
    lockAppBtn.addEventListener('click', () => {
      localStorage.removeItem('ascd_auth_unlocked');
      lockScreen.classList.remove('unlocked');
      if (authInput) {
        authInput.value = '';
        authInput.classList.remove('error');
        authInput.focus();
      }
      if (authError) authError.textContent = '';
      showToast('🔒 Aplicação bloqueada');
    });
  }
}

function handleAuthSubmit() {
  const lockScreen = document.getElementById('ascd-auth-lockscreen');
  const authInput = document.getElementById('ascd-auth-input');
  const authError = document.getElementById('ascd-auth-error');
  const rememberCheckbox = document.getElementById('ascd-auth-remember');

  if (!authInput) return;

  const entered = (authInput.value || '').trim();
  const currentPassword = localStorage.getItem('ascd_custom_password') || DEFAULT_AUTH_PASSWORD;

  if (entered === currentPassword) {
    authInput.classList.remove('error');
    if (authError) authError.textContent = '';

    // Se assinalado para lembrar no iPad / dispositivo
    if (rememberCheckbox && rememberCheckbox.checked) {
      localStorage.setItem('ascd_auth_unlocked', 'true');
    } else {
      localStorage.removeItem('ascd_auth_unlocked');
    }

    if (lockScreen) {
      lockScreen.classList.add('unlocked');
    }
    showToast('✓ Acesso autorizado. Bem-vindo!');
  } else {
    authInput.classList.add('error');
    if (authError) authError.textContent = 'Palavra-passe incorreta. Tente novamente.';
    authInput.select();
  }
}

// Inicialização Geral
document.addEventListener('DOMContentLoaded', () => {
  initAppSecurity();
  loadStoredData();
  setupNavigation();
  setupThemes();
  setupBibleReader();
  setupDevotional();
  setupTextToolbars();
  setupHybridNotes();
  setupSermons();
  setupJournal();
  setupSplitScreen();
  setupSheetsSyncModal();
  initSheetsSyncIndicator();
  setupHardwareKeyboardMode();

  // Ao abrir o app em qualquer aparelho, puxa automaticamente os dados da nuvem Firebase
  setTimeout(() => {
    pullFromCloud(true);
  }, 400);

  // Ao focar a janela ou voltar à aba no computador ou iPad, puxar imediatamente novidades da nuvem
  window.addEventListener('focus', () => {
    pullFromCloud(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pullFromCloud(true);
    }
  });

  // Verificação periódica em segundo plano (a cada 20s) para manter todos os iPads e computadores sempre alinhados
  setInterval(() => {
    if (navigator.onLine && !isSyncingCloud && document.visibilityState === 'visible') {
      pullFromCloud(true);
    }
  }, 20000);

  // Salvar imediatamente se o usuário fechar a aba, recarregar ou suspender o app no iPad/telemóvel
  window.addEventListener('beforeunload', () => saveActiveWork());
  window.addEventListener('pagehide', () => saveActiveWork());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveActiveWork();
  });

  // Abrir na aba inicial (Bíblia)
  showTab('biblia');
});

function saveActiveWork() {
  try {
    if (ASCD.activeTab === 'journal') {
      saveCurrentJournalEntry(false);
    } else if (ASCD.activeTab === 'biblia' && ASCD.isSplitView) {
      saveCurrentBiblePageStudy(false);
    }
  } catch (e) {
    console.warn('Erro ao salvar trabalho ativo:', e);
  }
}

/**
 * ==========================================================================
 * SUPORTE A TECLADO EXTERNO / FÍSICO NO IPAD (Sem teclado virtual nem manchas)
 * ==========================================================================
 */
function setupHardwareKeyboardMode() {
  // Desativado por defeito. Só é ativado se o utilizador clicar expressamente no botão do cabeçalho
  const saved = localStorage.getItem('ascd_hardware_keyboard');
  const isEnabled = saved === 'true';
  applyHardwareKeyboardMode(isEnabled);

  const btnToggle = document.getElementById('btn-toggle-hardware-kb');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      const nextState = !ASCD.hardwareKeyboardMode;
      applyHardwareKeyboardMode(nextState);
      showToast(nextState
        ? '⌨️ Teclado Físico ATIVADO: O teclado virtual do iPad não subirá e não ocupará espaço no ecrã.'
        : '📱 Teclado Virtual ATIVADO: O teclado no ecrã do iPad voltará a aparecer.');
    });
  }

  // ATENÇÃO: NUNCA adicionar listener de keydown para autodetectar teclado físico,
  // pois no iPadOS tocar nas teclas do teclado de ecrã (virtual) também dispara eventos keydown,
  // o que fechava o teclado do iPad após digitar apenas uma letra!

  // Garantir que nenhum foco ative o teclado virtual do iPad apenas QUANDO o utilizador ativou expressamente o modo físico
  document.addEventListener('focusin', (e) => {
    if (ASCD.hardwareKeyboardMode && (e.target.isContentEditable || e.target.classList.contains('rich-editor-box'))) {
      e.target.setAttribute('inputmode', 'none');
    }
  });
}

function applyHardwareKeyboardMode(enabled) {
  ASCD.hardwareKeyboardMode = !!enabled;
  localStorage.setItem('ascd_hardware_keyboard', ASCD.hardwareKeyboardMode ? 'true' : 'false');

  const editors = document.querySelectorAll('.rich-editor-box, [contenteditable="true"]');
  editors.forEach(el => {
    if (ASCD.hardwareKeyboardMode) {
      el.setAttribute('inputmode', 'none');
    } else {
      el.removeAttribute('inputmode');
    }
  });

  const btn = document.getElementById('btn-toggle-hardware-kb');
  const label = document.getElementById('btn-toggle-hardware-kb-label');
  if (btn) {
    btn.classList.toggle('active', ASCD.hardwareKeyboardMode);
  }
  if (label) {
    label.textContent = ASCD.hardwareKeyboardMode ? '⌨️ Físico Ativo' : '⌨️ Teclado Físico';
  }
}

/**
 * ==========================================================================
 * PERSISTÊNCIA LOCAL (LOCALSTORAGE)
 * ==========================================================================
 */
function loadStoredData() {
  try {
    // 1. Caderno de Notas
    const savedNotes = localStorage.getItem('ascd_notes');
    if (savedNotes) {
      ASCD.notes = JSON.parse(savedNotes);
    } else {
      ASCD.notes = [
        {
          id: 'note-1',
          title: 'Estudo Exegético: Salmos 23 - O Bom Pastor',
          category: 'Estudo Bíblico',
          date: '26/09/2026',
          mode: 'hybrid',
          content: '<blockquote><strong>Salmos 23:1</strong> — "O Senhor é o meu pastor; nada me faltará."</blockquote><p>Observações exegéticas: No texto hebraico original, a expressão <em>Yahweh Ro\'i</em> expressa o cuidado vigilante, afetuoso e constante do pastor que conhece cada ovelha pelo nome.</p><p><strong>Aplicações:</strong></p><ul><li>O descanso em pastos verdejantes simboliza a paz interior fornecida pela presença divina.</li><li>Águas de repouso (<em>Menuchot</em>) referem-se a águas tranquilas, sem correnteza que amedronte o rebanho.</li></ul>'
        }
      ];
      saveNotes();
    }

    // 2. Anotações de Sermões
    const savedSermons = localStorage.getItem('ascd_sermons');
    if (savedSermons) {
      ASCD.sermons = JSON.parse(savedSermons);
    } else {
      ASCD.sermons = [
        {
          id: 'sermon-1',
          title: 'O Poder da Cruz e a Graça Imerecida',
          preacher: 'Pr. Lucas Ferreira',
          passage: 'Romanos 8:31-39',
          date: '2026-09-20',
          mode: 'hybrid',
          content: '<blockquote><strong>Romanos 8:31</strong> — "Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós?"</blockquote><p><strong>1. Fundamento Inabalável:</strong> A nossa segurança não depende de nossos sentimentos diários, mas da obra consumada na cruz.</p><p><strong>2. A Entrega Absoluta:</strong> Aquele que nem mesmo a seu próprio Filho poupou, como não nos dará também com ele todas as coisas?</p><p><strong>3. Vitória Eterna:</strong> Em todas estas coisas somos mais do que vencedores, por aquele que nos amou.</p>'
        }
      ];
      saveSermons();
    }

    // 3. Registros de Journaling (com Oração e Tarefas) — começar sempre do vazio
    const todayStr = getTodayDateStr();
    ASCD.currentJournalDate = todayStr;
    const savedJournal = localStorage.getItem('ascd_journal');
    if (savedJournal) {
      try {
        ASCD.journalEntries = JSON.parse(savedJournal) || {};
      } catch (_) {
        ASCD.journalEntries = {};
      }
    } else {
      ASCD.journalEntries = {};
    }

    // Limpeza de quaisquer registros ou tarefas pré-feitas de exemplo para começar sempre do vazio
    let cleanedLegacyJournal = false;
    Object.keys(ASCD.journalEntries).forEach(k => {
      const entry = ASCD.journalEntries[k];
      if (entry && (
        entry.title === 'Meditações Matinais e Gratidão' ||
        entry.verse === 'Salmos 23:1-3' ||
        (entry.tasks && entry.tasks.some(t => t.id === 't-1' || t.id === 't-2' || t.id === 't-3'))
      )) {
        delete ASCD.journalEntries[k];
        trackDeletedId('JOURNAL-' + k);
        cleanedLegacyJournal = true;
      }
    });
    if (cleanedLegacyJournal) {
      saveJournalEntries();
    }

    // 4. Anotações de Páginas Bíblicas (Modo Dividido)
    const savedBibleNotes = localStorage.getItem('ascd_bible_page_notes');
    if (savedBibleNotes) {
      ASCD.biblePageNotes = JSON.parse(savedBibleNotes);
    }

    // 5. Tema
    const savedTheme = localStorage.getItem('ascd_theme');
    if (savedTheme) ASCD.theme = savedTheme;

    // 6. Versão da Bíblia
    const savedVersion = localStorage.getItem('ascd_bible_version');
    if (savedVersion && ['bpt', 'ntlh', 'aa'].includes(savedVersion)) {
      ASCD.currentBibleVersion = savedVersion;
    } else {
      ASCD.currentBibleVersion = 'bpt';
      localStorage.setItem('ascd_bible_version', 'bpt');
    }

    // 7. Webhook do Google Sheets
    const savedWebhook = localStorage.getItem('ascd_sheets_webhook_url');
    if (!savedWebhook || !savedWebhook.includes('AKfycbzVkYm6O0RgadN5_WE1dnabzVJsXGAoK7mQWzudynQZJMpT0rig4LqO366HrKAA9VDiLA')) {
      localStorage.setItem('ascd_sheets_webhook_url', DEFAULT_SHEETS_WEBHOOK_URL);
    }

    // 8. Devocionais Favoritos & Tamanho de Letra
    const savedDevoFavs = localStorage.getItem('ascd_devotional_favs');
    if (savedDevoFavs) ASCD.devotionalFavorites = JSON.parse(savedDevoFavs);
    const savedDevoFontSize = localStorage.getItem('ascd_devotional_font_size');
    if (savedDevoFontSize) ASCD.devotionalFontSize = parseInt(savedDevoFontSize, 10);

    // 9. Rastreio de Itens Excluídos (para merge inteligente com Google Sheets)
    const savedDeletedIds = localStorage.getItem('ascd_deleted_ids');
    ASCD.deletedIds = savedDeletedIds ? JSON.parse(savedDeletedIds) : [];
  } catch (err) {
    console.warn('Erro ao carregar dados locais:', err);
  }
}

function trackDeletedId(id) {
  if (!id) return;
  if (!ASCD.deletedIds) ASCD.deletedIds = [];
  if (!ASCD.deletedIds.includes(id)) {
    ASCD.deletedIds.push(id);
    try {
      localStorage.setItem('ascd_deleted_ids', JSON.stringify(ASCD.deletedIds));
    } catch (_) {}
  }
}

function saveNotes() {
  try {
    localStorage.setItem('ascd_notes', JSON.stringify(ASCD.notes));
  } catch (e) {
    console.error('Erro ao salvar notas:', e);
  }
  triggerAutoSyncToCloud();
}

function saveSermons() {
  try {
    localStorage.setItem('ascd_sermons', JSON.stringify(ASCD.sermons));
  } catch (e) {
    console.error('Erro ao salvar sermões:', e);
  }
  triggerAutoSyncToCloud();
}

function saveJournalEntries() {
  try {
    localStorage.setItem('ascd_journal', JSON.stringify(ASCD.journalEntries));
  } catch (e) {
    console.error('Erro ao salvar journal:', e);
  }
  triggerAutoSyncToCloud();
}

function saveBiblePageNotes() {
  try {
    localStorage.setItem('ascd_bible_page_notes', JSON.stringify(ASCD.biblePageNotes));
  } catch (e) {
    console.error('Erro ao salvar notas de páginas bíblicas:', e);
  }
  triggerAutoSyncToCloud();
}

/**
 * ==========================================================================
 * NAVEGAÇÃO ENTRE ABAS
 * ==========================================================================
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) showTab(tab);
    });
  });

  const btnToggleSplit = document.getElementById('btn-toggle-split');
  if (btnToggleSplit) {
    btnToggleSplit.addEventListener('click', toggleSplitScreen);
  }

  const btnExportDb = document.getElementById('btn-export-database-sheets');
  if (btnExportDb) {
    btnExportDb.addEventListener('click', openSheetsSyncModal);
  }

  // Botão de Recolher/Expandir Barra Lateral (Mais espaço no iPad)
  const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => {
      const layout = document.querySelector('.app-layout');
      if (!layout) return;
      const isCollapsed = layout.classList.toggle('sidebar-collapsed');
      btnToggleSidebar.classList.toggle('is-collapsed', isCollapsed);
      btnToggleSidebar.title = isCollapsed ? 'Mostrar Barra Lateral' : 'Ocultar Barra Lateral (Mais espaço no iPad)';
      showToast(isCollapsed ? 'Barra lateral recolhida (Ecrã expandido)' : 'Barra lateral visível');

    });
  }

  // Botão de Guia de Otimização no iPad
  const btnIpadGuide = document.getElementById('btn-ipad-guide');
  if (btnIpadGuide) {
    btnIpadGuide.addEventListener('click', () => {
      const modal = document.getElementById('ipad-guide-modal');
      if (modal) modal.classList.add('open');
    });
  }

  // Botão de Forçar Atualização / Limpar Cache
  const btnForceUpdate = document.getElementById('btn-force-update-app');
  if (btnForceUpdate) {
    btnForceUpdate.addEventListener('click', async () => {
      showToast('🔄 A limpar cache e a atualizar para a versão mais recente...');
      try {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        }
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(r => r.unregister()));
        }
      } catch (err) {}
      setTimeout(() => {
        window.location.reload(true);
      }, 500);
    });
  }

  // Botão Flutuante Global de Sair do Ecrã Inteiro
  const btnGlobalExitFs = document.getElementById('global-exit-fullscreen-btn');
  if (btnGlobalExitFs) {
    const handleGlobalExit = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      exitAllFullscreens();
      showToast('Modo normal restaurado.');
    };
    btnGlobalExitFs.addEventListener('click', handleGlobalExit);
    btnGlobalExitFs.addEventListener('touchend', handleGlobalExit, { passive: false });
    btnGlobalExitFs.addEventListener('pointerup', handleGlobalExit);
  }
}

function showTab(tabId) {
  // Salvar os dados da aba atual antes de mudar para não perder o que foi escrito!
  if (ASCD.activeTab === 'journal') {
    saveCurrentJournalEntry(false);
  } else if (ASCD.activeTab === 'biblia' && ASCD.isSplitView) {
    saveCurrentBiblePageStudy(false);
  }

  // Sair de qualquer modo de ecrã inteiro ao mudar de aba
  if (document.body.classList.contains('ascd-in-fullscreen') || document.querySelector('.text-section-fullscreen, .bible-fullscreen-active, .devo-fullscreen-active')) {
    exitAllFullscreens();
  }

  ASCD.activeTab = tabId;

  // Se mudar para outra aba que não seja a Bíblia e a tela dividida estiver aberta, fecha a tela dividida
  if (tabId !== 'biblia' && ASCD.isSplitView) {
    toggleSplitScreen();
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.app-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSec = document.getElementById(`sec-${tabId}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  // Ações ao abrir abas específicas
  if (tabId === 'journal') {
    renderCalendar();
    loadJournalEntryForDate(ASCD.currentJournalDate);
    renderJournalHistoryList();
  } else if (tabId === 'devocional') {
    renderCurrentDevotional();
  } else if (tabId === 'sermoes') {
    renderSermonsList();
  } else if (tabId === 'notas') {
    renderNotesList();
  }

  // Fechar menu mobile se aberto
  const sidebar = document.querySelector('.app-sidebar');
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
  }
}

/**
 * ==========================================================================
 * BARRAS DE FORMATAÇÃO DE TEXTO (NOTAS, SERMÕES, JOURNAL E MODO DIVIDIDO)
 * Inclui: Fontes, Tamanhos, Negrito (B), Itálico (I), Sublinhado (U) e
 * 3 Cores de Marca-Texto (Vermelho Claro, Verde e Amarelo)
 * ==========================================================================
 */
function setupTextToolbars() {
  // 1. Caderno de Notas
  setupEditorToolbar({
    prefix: 'fmt',
    editorId: 'edit-note-content',
    hlPrefix: 'hl'
  });

  // 2. Anotações de Sermões
  setupEditorToolbar({
    prefix: 'sfmt',
    editorId: 'edit-sermon-content',
    hlPrefix: 'shl'
  });

  // 3. Journaling Diário
  setupEditorToolbar({
    prefix: 'jfmt',
    editorId: 'journal-text-editor',
    hlPrefix: 'jhl'
  });

  // 4. Modo Dividido (Split View)
  setupEditorToolbar({
    prefix: 'split-fmt',
    editorId: 'split-text-editor',
    hlPrefix: 'split-hl'
  });
}

function setupEditorToolbar({ prefix, editorId, hlPrefix }) {
  const editor = document.getElementById(editorId);
  if (!editor) return;

  // 1. Família da Fonte
  const fontSelect = document.getElementById(`${prefix}-font-family`);
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      applyFontFamily(editor, e.target.value);
    });
  }

  // 2. Tamanho da Fonte
  const sizeSelect = document.getElementById(`${prefix}-font-size`);
  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      applyFontSize(editor, e.target.value);
    });
  }

  // 3. Negrito (Bold)
  const btnBold = document.getElementById(`${prefix}-btn-bold`);
  if (btnBold) {
    btnBold.addEventListener('click', (e) => {
      e.preventDefault();
      editor.focus();
      document.execCommand('bold', false, null);
      updateToolbarActiveState(prefix);
    });
  }

  // 4. Itálico (Italic)
  const btnItalic = document.getElementById(`${prefix}-btn-italic`);
  if (btnItalic) {
    btnItalic.addEventListener('click', (e) => {
      e.preventDefault();
      editor.focus();
      document.execCommand('italic', false, null);
      updateToolbarActiveState(prefix);
    });
  }

  // 5. Sublinhar (Underline)
  const btnUnderline = document.getElementById(`${prefix}-btn-underline`);
  if (btnUnderline) {
    btnUnderline.addEventListener('click', (e) => {
      e.preventDefault();
      editor.focus();
      document.execCommand('underline', false, null);
      updateToolbarActiveState(prefix);
    });
  }

  // 6. As 3 Cores de Marca-Texto: Vermelho Claro, Verde e Amarelo
  const btnHlRed = document.getElementById(`${hlPrefix}-color-red`);
  const btnHlGreen = document.getElementById(`${hlPrefix}-color-green`);
  const btnHlYellow = document.getElementById(`${hlPrefix}-color-yellow`);
  const btnHlClear = document.getElementById(`${hlPrefix}-color-clear`);

  if (btnHlRed) {
    btnHlRed.addEventListener('click', (e) => {
      e.preventDefault();
      applyTextHighlight(editor, '#FECDD3');
      showToast('🖍️ Marca-texto Vermelho Claro aplicado');
    });
  }

  if (btnHlGreen) {
    btnHlGreen.addEventListener('click', (e) => {
      e.preventDefault();
      applyTextHighlight(editor, '#BBF7D0');
      showToast('🖍️ Marca-texto Verde aplicado');
    });
  }

  if (btnHlYellow) {
    btnHlYellow.addEventListener('click', (e) => {
      e.preventDefault();
      applyTextHighlight(editor, '#FEF08A');
      showToast('🖍️ Marca-texto Amarelo aplicado');
    });
  }

  if (btnHlClear) {
    btnHlClear.addEventListener('click', (e) => {
      e.preventDefault();
      applyTextHighlight(editor, 'transparent');
      showToast('Marcação removida');
    });
  }

  // 7. Botão de Ecrã Inteiro / Foco no Editor de Texto
  const btnFullscreen = document.getElementById(`${prefix}-btn-fullscreen`);
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', (e) => {
      e.preventDefault();
      const wrapper = editor.closest('.note-section-block, .journal-section-block') || editor.parentElement;
      if (wrapper) {
        toggleTextFullscreen(wrapper, btnFullscreen);
      }
    });
  }

  // Atualizar botões ativos ao digitar ou mover o cursor
  editor.addEventListener('keyup', () => updateToolbarActiveState(prefix));
  editor.addEventListener('mouseup', () => updateToolbarActiveState(prefix));

  // Limpar formatação de texto colado de fontes externas (Word, browser, email, etc.)
  // Mantém negrito, itálico, sublinhado e cores de destaque, mas remove font-family e font-size externos
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    let html = '';
    if (e.clipboardData && e.clipboardData.getData('text/html')) {
      html = e.clipboardData.getData('text/html');
    } else if (e.clipboardData && e.clipboardData.getData('text/plain')) {
      html = escapeHtml(e.clipboardData.getData('text/plain')).replace(/\n/g, '<br>');
    }
    // Limpar estilos de fonte externos, preservar negrito/itálico/sublinhado/marcações de cor
    html = cleanPastedHtml(html);
    document.execCommand('insertHTML', false, html);
    updateToolbarActiveState(prefix);
  });
}

/**
 * Limpa HTML colado de fontes externas (Word, browser, email).
 * Remove font-family, font-size, color, margin, padding externos.
 * Preserva: negrito, itálico, sublinhado, cores de fundo (marcações da app).
 */
function cleanPastedHtml(html) {
  // Remover tags de Word/Office e comentários
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<o:p[\s\S]*?<\/o:p>/gi, '');
  html = html.replace(/<\/?o:[^>]*>/gi, '');
  html = html.replace(/<\/?w:[^>]*>/gi, '');
  html = html.replace(/<\/?m:[^>]*>/gi, '');

  // Criar elemento temporário para processar o DOM
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Percorrer todos os elementos e limpar estilos externos
  temp.querySelectorAll('*').forEach(el => {
    // Preservar apenas estilos relevantes da app
    const bg = el.style.backgroundColor;
    const fw = el.style.fontWeight;
    const fs = el.style.fontStyle;
    const td = el.style.textDecoration;
    const ff = el.style.fontFamily;   // vem da app se definido pelo utilizador
    const fz = el.style.fontSize;     // vem da app se definido pelo utilizador

    // Limpar todos os atributos de estilo problemáticos externos
    el.removeAttribute('style');
    el.removeAttribute('class');
    el.removeAttribute('lang');
    el.removeAttribute('xml:lang');

    // Restaurar apenas estilos que a app gerencia (vêm de dentro, não do clipboard externo)
    // Preservar cor de fundo para marcações de texto da app
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'initial' && bg !== '') {
      el.style.backgroundColor = bg;
    }
    if (fw === 'bold' || fw === '700' || fw === '600') el.style.fontWeight = 'bold';
    if (fs === 'italic') el.style.fontStyle = 'italic';
    if (td && td.includes('underline')) el.style.textDecoration = 'underline';
  });

  // Remover tags vazias e wrappers desnecessários do Word
  const cleanHtml = temp.innerHTML
    .replace(/<span[^>]*>\s*<\/span>/gi, '')
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    .replace(/<div[^>]*>\s*<\/div>/gi, '');

  return cleanHtml;
}

function updateToolbarActiveState(prefix) {
  const btnBold = document.getElementById(`${prefix}-btn-bold`);
  const btnItalic = document.getElementById(`${prefix}-btn-italic`);
  const btnUnderline = document.getElementById(`${prefix}-btn-underline`);

  try {
    if (btnBold) btnBold.classList.toggle('active', document.queryCommandState('bold'));
    if (btnItalic) btnItalic.classList.toggle('active', document.queryCommandState('italic'));
    if (btnUnderline) btnUnderline.classList.toggle('active', document.queryCommandState('underline'));
  } catch (_) {}
}

function applyFontFamily(editor, fontFamily) {
  editor.focus();
  const sel = window.getSelection();

  if (sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    // Tem texto seleccionado: aplica só à selecção
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontFamily = fontFamily;
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.selectAllChildren(span);
    } catch (_) {
      document.execCommand('fontName', false, fontFamily);
    }
  } else {
    // Nada seleccionado: aplica ao editor todo (incluindo texto colado)
    editor.style.fontFamily = fontFamily;
    // Também aplica a todos os spans/elementos filhos que tenham font-family definido externamente
    editor.querySelectorAll('[style*="font-family"]').forEach(el => {
      el.style.fontFamily = fontFamily;
    });
  }
}

function applyFontSize(editor, size) {
  editor.focus();
  const sel = window.getSelection();

  if (sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    // Tem texto seleccionado: aplica só à selecção
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = size;
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      sel.selectAllChildren(span);
    } catch (_) {
      document.execCommand('fontSize', false, '4');
    }
  } else {
    // Nada seleccionado: aplica ao editor todo (incluindo texto colado)
    editor.style.fontSize = size;
    // Também aplica a todos os spans/elementos filhos que tenham font-size definido externamente
    editor.querySelectorAll('[style*="font-size"]').forEach(el => {
      el.style.fontSize = size;
    });
  }
}

function applyTextHighlight(editor, color) {
  editor.focus();
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) {
    return;
  }

  if (color === 'transparent' || !color) {
    document.execCommand('hiliteColor', false, 'transparent');
    document.execCommand('backColor', false, 'transparent');
  } else {
    let success = document.execCommand('hiliteColor', false, color);
    if (!success) {
      success = document.execCommand('backColor', false, color);
    }

    if (!success && !sel.isCollapsed) {
      const span = document.createElement('span');
      span.style.backgroundColor = color;
      span.style.padding = '2px 4px';
      span.style.borderRadius = '3px';
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      } catch (_) {}
    }
  }
}

/**
 * ==========================================================================
 * LEITOR BÍBLICO E INTEGRAÇÃO COM NOTAS
 * ==========================================================================
 */
function setupBibleReader() {
  // 1. Dropdown de Versões Bíblicas (BPT, NTLH, AA)
  const versionSelect = document.getElementById('bible-version-select');
  if (versionSelect) {
    versionSelect.innerHTML = BIBLE_VERSIONS.map(v => `
      <option value="${v.id}" ${v.id === ASCD.currentBibleVersion ? 'selected' : ''}>${v.shortName} - ${v.name}</option>
    `).join('');

    versionSelect.addEventListener('change', (e) => {
      ASCD.currentBibleVersion = e.target.value;
      try {
        localStorage.setItem('ascd_bible_version', ASCD.currentBibleVersion);
      } catch (err) {}
      loadBibleChapter(ASCD.currentBibleBook, ASCD.currentBibleChapter);
      const vObj = BIBLE_VERSIONS.find(v => v.id === ASCD.currentBibleVersion);
      if (vObj) {
        showToast(`📖 Tradução alterada para: ${vObj.shortName} (${vObj.name})`);
      }
    });
  }

  // 2. Dropdown de Livros Bíblicos (66 Livros organizados por Testamento)
  const bookSelect = document.getElementById('bible-book-select');
  if (bookSelect) {
    const atBooks = BIBLE_BOOKS.filter(b => b.test === 'AT');
    const ntBooks = BIBLE_BOOKS.filter(b => b.test === 'NT');

    bookSelect.innerHTML = `
      <optgroup label="— Antigo Testamento (39 Livros) —">
        ${atBooks.map(b => `<option value="${b.id}" ${b.id === ASCD.currentBibleBook ? 'selected' : ''}>${b.name}</option>`).join('')}
      </optgroup>
      <optgroup label="— Novo Testamento (27 Livros) —">
        ${ntBooks.map(b => `<option value="${b.id}" ${b.id === ASCD.currentBibleBook ? 'selected' : ''}>${b.name}</option>`).join('')}
      </optgroup>
    `;

    bookSelect.addEventListener('change', (e) => {
      const newBook = e.target.value;
      loadBibleChapter(newBook, 1);
    });
  }

  // 3. Dropdown de Capítulos
  const chapterSelect = document.getElementById('bible-chapter-select');
  if (chapterSelect) {
    chapterSelect.addEventListener('change', (e) => {
      const newChap = parseInt(e.target.value, 10) || 1;
      loadBibleChapter(ASCD.currentBibleBook, newChap);
    });
  }

  // 4. Botões de Navegação Anterior / Próximo (Topo e Fundo)
  const prevBtnTop = document.getElementById('btn-prev-chapter');
  if (prevBtnTop) prevBtnTop.addEventListener('click', navigateToPreviousChapter);

  const nextBtnTop = document.getElementById('btn-next-chapter');
  if (nextBtnTop) nextBtnTop.addEventListener('click', navigateToNextChapter);

  const prevBtnBottom = document.getElementById('btn-bottom-prev-chap');
  if (prevBtnBottom) {
    prevBtnBottom.addEventListener('click', () => {
      navigateToPreviousChapter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const nextBtnBottom = document.getElementById('btn-bottom-next-chap');
  if (nextBtnBottom) {
    nextBtnBottom.addEventListener('click', () => {
      navigateToNextChapter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 5. Inicializar Leitor com valores correntes
  loadBibleChapter(ASCD.currentBibleBook, ASCD.currentBibleChapter);

  // 6. Campo de Pesquisa Bíblica
  const searchInput = document.getElementById('bible-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length > 2) {
        performBibleSearch(q);
      } else if (q.length === 0) {
        loadBibleChapter(ASCD.currentBibleBook, ASCD.currentBibleChapter);
      }
    });
  }

  // 7. Botão de Alternar Modo Dividido / Anotações na barra do Leitor Bíblico
  const btnBibleToggleNotes = document.getElementById('bible-btn-toggle-notes');
  if (btnBibleToggleNotes) {
    btnBibleToggleNotes.addEventListener('click', () => {
      toggleSplitScreen();
    });
  }

  // 8. Botão de Ecrã Inteiro no Leitor Bíblico
  const btnBibleFs = document.getElementById('bible-btn-fullscreen');
  if (btnBibleFs) {
    btnBibleFs.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBibleFullscreen();
    });
  }
}

function updateChapterDropdown(bookId, selectedChap = 1) {
  const chapterSelect = document.getElementById('bible-chapter-select');
  const book = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  if (!chapterSelect || !book) return;

  const validChap = Math.min(Math.max(1, selectedChap), book.chapters);

  if (chapterSelect.dataset.bookId !== bookId || chapterSelect.options.length !== book.chapters) {
    let html = '';
    for (let i = 1; i <= book.chapters; i++) {
      html += `<option value="${i}">Capítulo ${i}</option>`;
    }
    chapterSelect.innerHTML = html;
    chapterSelect.dataset.bookId = bookId;
  }
  chapterSelect.value = validChap;
}

function updateBibleNavigationButtons(book, chap) {
  const prevBtnTop = document.getElementById('btn-prev-chapter');
  const nextBtnTop = document.getElementById('btn-next-chapter');
  const prevBtnBottom = document.getElementById('btn-bottom-prev-chap');
  const nextBtnBottom = document.getElementById('btn-bottom-next-chap');
  const indicator = document.getElementById('bible-bottom-chap-indicator');

  if (indicator) {
    indicator.textContent = `${book.name} — Capítulo ${chap} de ${book.chapters}`;
  }

  const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === book.id);
  const isFirst = (bookIndex === 0 && chap === 1);
  const isLast = (bookIndex === BIBLE_BOOKS.length - 1 && chap === book.chapters);

  [prevBtnTop, prevBtnBottom].forEach(btn => {
    if (btn) btn.disabled = isFirst;
  });
  [nextBtnTop, nextBtnBottom].forEach(btn => {
    if (btn) btn.disabled = isLast;
  });
}

function navigateToPreviousChapter() {
  const currentBook = BIBLE_BOOKS.find(b => b.id === ASCD.currentBibleBook) || BIBLE_BOOKS[0];
  const currentChap = ASCD.currentBibleChapter;

  if (currentChap > 1) {
    loadBibleChapter(currentBook.id, currentChap - 1);
  } else {
    const bookIdx = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
    if (bookIdx > 0) {
      const prevBook = BIBLE_BOOKS[bookIdx - 1];
      loadBibleChapter(prevBook.id, prevBook.chapters);
    }
  }
}

function navigateToNextChapter() {
  const currentBook = BIBLE_BOOKS.find(b => b.id === ASCD.currentBibleBook) || BIBLE_BOOKS[0];
  const currentChap = ASCD.currentBibleChapter;

  if (currentChap < currentBook.chapters) {
    loadBibleChapter(currentBook.id, currentChap + 1);
  } else {
    const bookIdx = BIBLE_BOOKS.findIndex(b => b.id === currentBook.id);
    if (bookIdx < BIBLE_BOOKS.length - 1) {
      const nextBook = BIBLE_BOOKS[bookIdx + 1];
      loadBibleChapter(nextBook.id, 1);
    }
  }
}

async function loadBibleChapter(bookId, chapterNum) {
  // Se o modo dividido estiver ativo, salva automaticamente as anotações do capítulo anterior
  if (ASCD.isSplitView) {
    saveCurrentBiblePageStudy(false);
  }

  const book = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  const validChap = Math.min(Math.max(1, chapterNum), book.chapters);

  ASCD.currentBibleBook = book.id;
  ASCD.currentBibleChapter = validChap;

  // 1. Sincronizar os seletores do DOM
  const bookSelect = document.getElementById('bible-book-select');
  if (bookSelect && bookSelect.value !== book.id) {
    bookSelect.value = book.id;
  }

  updateChapterDropdown(book.id, validChap);

  const versionSelect = document.getElementById('bible-version-select');
  if (versionSelect && versionSelect.value !== ASCD.currentBibleVersion) {
    versionSelect.value = ASCD.currentBibleVersion;
  }

  // 2. Atualizar cabeçalhos e botões
  const headerTitle = document.getElementById('bible-header-title');
  const headerSub = document.getElementById('bible-header-sub');
  const versionBadge = document.getElementById('bible-header-version-badge');
  const versionFullname = document.getElementById('bible-header-version-fullname');
  const vObj = BIBLE_VERSIONS.find(v => v.id === ASCD.currentBibleVersion) || BIBLE_VERSIONS[0];

  if (headerTitle) headerTitle.textContent = `${book.name} ${validChap}`;
  if (headerSub) headerSub.textContent = getChapterTitle(book, validChap);
  if (versionBadge) versionBadge.textContent = vObj.shortName || ASCD.currentBibleVersion.toUpperCase();
  if (versionFullname) versionFullname.textContent = `${vObj.name || 'Tradução Bíblica'} • Domínio Público`;

  updateBibleNavigationButtons(book, validChap);
  updateBiblePageSavedBadge();

  // 3. Atualizar título do Modo Dividido se ativo
  const splitStudyTitle = document.getElementById('split-study-title');
  if (splitStudyTitle) {
    splitStudyTitle.textContent = `Estudo: ${book.name} ${validChap} (${vObj.shortName || ''})`;
  }
  loadBiblePageNoteIntoSplit();

  // 4. Mostrar estado de carregamento se não estiver em cache
  const container = document.getElementById('bible-verses-display');
  const syncData = getBibleChapterData(book.id, validChap, ASCD.currentBibleVersion);

  if (syncData && syncData.verses && syncData.verses.length > 5) {
    renderVersesList(container, syncData);
  } else if (container) {
    container.innerHTML = `
      <div class="bible-loading-state">
        <div class="bible-spinner"></div>
        <div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-bottom:6px;">Carregando ${book.name} ${validChap}...</div>
        <div style="font-size:13px; color:var(--text-muted);">A obter o capítulo completo com todos os versículos (${vObj.shortName})</div>
      </div>
    `;
  }

  // 5. Carregamento assíncrono com garantia de todos os versículos
  const data = await getBibleChapterDataAsync(book.id, validChap, ASCD.currentBibleVersion);

  // Se o usuário mudou de capítulo antes de responder, descarta
  if (ASCD.currentBibleBook !== book.id || ASCD.currentBibleChapter !== validChap) {
    return;
  }

  if (headerSub) {
    headerSub.textContent = data.title || getChapterTitle(book, validChap);
  }

  if (container) {
    if (data.isOfflineNotice) {
      container.innerHTML = `
        <div style="background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:28px 24px; text-align:center; margin:20px 0;">
          <div style="font-size:32px; margin-bottom:12px;">📡</div>
          <h4 style="margin:0 0 8px 0; color:var(--text-primary);">Capítulo Completo Disponível Online</h4>
          <p style="font-size:14px; color:var(--text-secondary); max-width:540px; margin:0 auto 18px auto; line-height:1.6;">${data.verses[0].text}</p>
          <button type="button" class="btn btn-primary" onclick="loadBibleChapter('${book.id}', ${validChap})">
            🔄 Tentar Novamente
          </button>
        </div>
      `;
    } else {
      renderVersesList(container, data);
    }
  }
}

function renderVersesList(container, data) {
  if (!container || !data || !data.verses) return;
  container.innerHTML = data.verses.map(v => `
    <div class="verse-row" data-verse="${v.num}">
      <span class="verse-num">${v.num}</span>
      <span class="verse-text">${v.text}</span>
      <div class="verse-actions">
        <button class="verse-action-btn" title="Copiar versículo" onclick="copyVerse('${data.book}', ${data.chapter}, ${v.num}, '${escapeForJs(v.text)}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="verse-action-btn" title="Criar Anotação de Estudo" onclick="createNoteFromVerse('${data.book}', ${data.chapter}, ${v.num}, '${escapeForJs(v.text)}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function updateBiblePageSavedBadge() {
  const badgeContainer = document.getElementById('bible-chapter-badge-container');
  if (!badgeContainer) return;

  const key = `${ASCD.currentBibleBook}_${ASCD.currentBibleChapter}`;
  const saved = ASCD.biblePageNotes[key];

  if (saved && saved.content) {
    badgeContainer.innerHTML = `
      <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(16, 185, 129, 0.12); border:1px solid #10B981; border-radius:999px; padding:3px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <button type="button" class="split-study-badge" onclick="openSplitStudyFromBadge()" title="Esta página bíblica possui anotação salva. Clique para abrir!" style="background:transparent; border:none; padding:0; display:inline-flex; align-items:center; gap:6px; color:#065F46; font-weight:600; font-size:12px; cursor:pointer;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Anotação desta página guardada</span>
        </button>
        <span style="color:#A7F3D0; font-size:12px;">•</span>
        <button type="button" onclick="deleteCurrentBiblePageStudy(event)" title="Apagar definitivamente a anotação desta página" style="background:transparent; border:none; padding:2px 4px; display:inline-flex; align-items:center; gap:4px; color:#DC2626; font-weight:700; font-size:12px; cursor:pointer; border-radius:4px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          <span>Apagar</span>
        </button>
      </div>
    `;
  } else {
    badgeContainer.innerHTML = '';
  }
}

function openSplitStudyFromBadge() {
  if (!ASCD.isSplitView) {
    toggleSplitScreen();
  }
}

function copyVerse(book, chap, num, text) {
  const formatted = `"${text}" — ${book} ${chap}:${num}`;
  navigator.clipboard.writeText(formatted).then(() => {
    showToast(`✓ Versículo copiado para a área de transferência!`);
  }).catch(() => {
    showToast(`✓ ${book} ${chap}:${num}`);
  });
}

function createNoteFromVerse(book, chap, num, text) {
  openNoteEditorModal(null, {
    title: `Estudo: ${book} ${chap}:${num}`,
    category: 'Estudo Bíblico',
    content: `<blockquote><strong>${book} ${chap}:${num}</strong><br/>"${text}"</blockquote><p>Observações e reflexões espirituais deste versículo:</p>`
  });
  showToast(`📝 Nota de estudo criada para ${book} ${chap}:${num}`);
}

function performBibleSearch(term) {
  const container = document.getElementById('bible-verses-display');
  const headerTitle = document.getElementById('bible-header-title');
  const headerSub = document.getElementById('bible-header-sub');
  if (!container) return;

  const results = [];
  const currentVer = ASCD.currentBibleVersion || 'bpt';

  Object.keys(BIBLE_TEXTS).forEach(key => {
    const raw = BIBLE_TEXTS[key];
    const verses = (raw.versions && raw.versions[currentVer]) || (raw.versions && raw.versions.bpt) || (raw.versions && raw.versions.ntlh) || (raw.versions && raw.versions.aa) || raw.verses || [];
    verses.forEach(v => {
      if (v.text.toLowerCase().includes(term)) {
        results.push({
          book: raw.book,
          chapter: raw.chapter,
          num: v.num,
          text: v.text
        });
      }
    });
  });

  const vObj = BIBLE_VERSIONS.find(v => v.id === currentVer) || { shortName: 'Bíblia' };

  if (headerTitle) headerTitle.textContent = `Resultados para "${term}"`;
  if (headerSub) headerSub.textContent = `${results.length} versículo(s) encontrado(s) na versão ${vObj.shortName}`;

  if (results.length === 0) {
    container.innerHTML = `<div style="padding:24px; text-align:center; color:var(--text-muted);">Nenhum versículo encontrado na versão atual. Tente buscar por palavras como "Senhor", "paz", "pastor", "amor", "Deus", "graça".</div>`;
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="verse-row">
      <span class="verse-ref-tag" style="font-weight:700; color:var(--accent-gold); margin-right:8px; cursor:pointer;" onclick="goToVerseLocation('${r.book}', ${r.chapter})">${r.book} ${r.chapter}:${r.num}</span>
      <span class="verse-text">${highlightSearchTerm(r.text, term)}</span>
      <div class="verse-actions">
        <button class="verse-action-btn" title="Copiar" onclick="copyVerse('${r.book}', ${r.chapter}, ${r.num}, '${escapeForJs(r.text)}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="verse-action-btn" title="Criar Nota de Estudo" onclick="createNoteFromVerse('${r.book}', ${r.chapter}, ${r.num}, '${escapeForJs(r.text)}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function goToVerseLocation(bookName, chap) {
  const b = BIBLE_BOOKS.find(item => item.name.toLowerCase() === bookName.toLowerCase() || item.id === bookName.toLowerCase());
  if (b) {
    loadBibleChapter(b.id, chap);
    const searchInput = document.getElementById('bible-search-input');
    if (searchInput) searchInput.value = '';
    showToast(`📖 Aberto em ${b.name} ${chap}`);
  }
}

function highlightSearchTerm(text, term) {
  const regex = new RegExp(`(${term})`, 'gi');
  return text.replace(regex, '<mark style="background:#FEF08A; padding:1px 3px; border-radius:3px;">$1</mark>');
}

/**
 * ==========================================================================
 * CADERNO DE ESTUDOS BÍBLICOS (NOTAS GERAIS) COM MULTI-SELEÇÃO
 * ==========================================================================
 */
function setupHybridNotes() {
  renderNotesList();

  const btnNewNote = document.getElementById('btn-new-text-note');
  if (btnNewNote) {
    btnNewNote.addEventListener('click', () => openNoteEditorModal());
  }

  const searchInput = document.getElementById('notes-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderNotesList(e.target.value.toLowerCase());
    });
  }

  // Alternar modo de seleção de notas
  const btnToggleSelect = document.getElementById('btn-toggle-select-notes');
  if (btnToggleSelect) {
    btnToggleSelect.addEventListener('click', () => {
      ASCD.notesSelectMode = !ASCD.notesSelectMode;
      ASCD.selectedNotes.clear();
      updateNotesBatchBar();
      renderNotesList();
      btnToggleSelect.textContent = ASCD.notesSelectMode ? '✕ Cancelar Seleção' : '☑️ Selecionar Várias';
    });
  }

  // Selecionar Todas as notas
  document.getElementById('btn-select-all-notes')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      ASCD.notes.forEach(n => ASCD.selectedNotes.add(n.id));
    } else {
      ASCD.selectedNotes.clear();
    }
    updateNotesBatchBar();
    renderNotesList();
  });

  // Ações em lote para notas
  document.getElementById('btn-batch-notes-doc')?.addEventListener('click', () => {
    const items = getSelectedNotesItems();
    if (items.length) exportBatchToDoc(items, 'Estudos Bíblicos', 'ASCD_Estudos_Biblicos_Selecionados');
  });

  document.getElementById('btn-batch-notes-excel')?.addEventListener('click', () => {
    const items = getSelectedNotesItems();
    if (items.length) exportToExcel(items, 'ASCD_Estudos_Biblicos_Selecionados');
  });

  document.getElementById('btn-batch-notes-pdf')?.addEventListener('click', () => {
    const items = getSelectedNotesItems();
    if (items.length) exportBatchToPdf(items, 'Estudos Bíblicos Selecionados');
  });

  document.getElementById('btn-batch-notes-del')?.addEventListener('click', () => {
    deleteSelectedNotes();
  });

  const btnSaveModal = document.getElementById('btn-save-note-modal');
  if (btnSaveModal) {
    btnSaveModal.addEventListener('click', saveNoteFromModal);
  }

  const btnCloseModal = document.getElementById('btn-close-note-modal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      exitAllFullscreens();
      document.getElementById('note-editor-modal')?.classList.remove('open');
    });
  }

  // Exportações individuais do modal de notas
  document.getElementById('btn-export-note-doc')?.addEventListener('click', () => {
    const item = getActiveNoteObjectForExport();
    if (item) exportToDoc(item, 'Nota');
  });

  document.getElementById('btn-export-note-excel')?.addEventListener('click', () => {
    const item = getActiveNoteObjectForExport();
    if (item) exportToExcel([item], `ASCD_Nota_${cleanFilename(item.title)}`);
  });

  document.getElementById('btn-export-note-pdf')?.addEventListener('click', () => {
    const item = getActiveNoteObjectForExport();
    if (item) exportToPdf(item, 'Nota de Estudo Bíblico');
  });

  document.getElementById('btn-export-all-notes-excel')?.addEventListener('click', () => {
    exportToExcel(ASCD.notes.map(n => ({ ...n, type: 'Estudo Bíblico' })), 'ASCD_Todas_Notas_Estudo');
  });
}

function getSelectedNotesItems() {
  return ASCD.notes
    .filter(n => ASCD.selectedNotes.has(n.id))
    .map(n => ({ ...n, type: 'Estudo Bíblico' }));
}

function updateNotesBatchBar() {
  const bar = document.getElementById('notes-batch-bar');
  const counter = document.getElementById('notes-selected-counter');
  const count = ASCD.selectedNotes.size;

  if (bar) {
    bar.classList.toggle('active', ASCD.notesSelectMode || count > 0);
  }
  if (counter) {
    counter.textContent = `${count} selecionada(s)`;
  }
}

function deleteSelectedNotes() {
  const count = ASCD.selectedNotes.size;
  if (!count) return;
  if (confirm(`Deseja realmente excluir as ${count} anotações selecionadas?`)) {
    ASCD.selectedNotes.forEach(id => trackDeletedId(id));
    ASCD.notes = ASCD.notes.filter(n => !ASCD.selectedNotes.has(n.id));
    ASCD.selectedNotes.clear();
    saveNotes();
    updateNotesBatchBar();
    renderNotesList();
    showToast(`${count} anotação(ões) excluída(s)`);
  }
}

function getActiveNoteObjectForExport() {
  const title = document.getElementById('edit-note-title')?.value.trim() || 'Anotação sem título';
  const category = document.getElementById('edit-note-category')?.value || 'Estudo Bíblico';
  const content = document.getElementById('edit-note-content')?.innerHTML || '';

  return {
    id: ASCD.activeNoteId || 'nota-export',
    type: 'Estudo Bíblico',
    title,
    category,
    date: new Date().toLocaleDateString('pt-BR'),
    content
  };
}

function renderNotesList(filterQuery = '') {
  const container = document.getElementById('notes-cards-grid');
  if (!container) return;

  const filtered = ASCD.notes.filter(n => {
    return n.title.toLowerCase().includes(filterQuery) ||
           (n.content && n.content.toLowerCase().includes(filterQuery)) ||
           (n.category && n.category.toLowerCase().includes(filterQuery));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1; padding: 40px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <h3 style="margin-top: 12px;">Nenhuma anotação encontrada</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Crie uma nova nota de estudo com digitação rica e formatação completa!</p>
        <button class="btn btn-primary" onclick="openNoteEditorModal()" style="margin-top: 16px;">+ Nova Anotação</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(n => {
    const isSelected = ASCD.selectedNotes.has(n.id);
    const plainText = n.content ? stripHtml(n.content).trim() : '';
    const snippet = plainText ? (plainText.length > 140 ? escapeHtml(plainText.substring(0, 140)) + '...' : escapeHtml(plainText)) : '';
    return `
      <div class="note-card ${isSelected ? 'selected' : ''}" onclick="handleNoteCardClick('${n.id}')">
        <div class="note-card-header">
          <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <input type="checkbox" class="card-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleSelectNote('${n.id}')" title="Selecionar" />
            <span class="note-category-tag">${escapeHtml(n.category || 'Estudo')}</span>
          </div>
        </div>
        
        <h3 class="note-card-title">${escapeHtml(n.title)}</h3>

        ${snippet ? `
          <div class="note-card-preview">${snippet}</div>
        ` : ''}

        <div class="card-actions-row">
          <span class="note-date">${n.date}</span>
          
          <div class="card-export-mini-group" onclick="event.stopPropagation()">
            <button class="btn-mini-export" title="Exportar para DOC" onclick="exportNoteById('${n.id}', 'doc')">DOC</button>
            <button class="btn-mini-export" title="Exportar para Excel" onclick="exportNoteById('${n.id}', 'excel')">Excel</button>
            <button class="btn-mini-export" title="Exportar para PDF" onclick="exportNoteById('${n.id}', 'pdf')">PDF</button>
            <button class="btn-icon-subtle" onclick="deleteNote(event, '${n.id}')" title="Excluir Nota" style="margin-left: 4px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleNoteCardClick(id) {
  if (ASCD.notesSelectMode) {
    toggleSelectNote(id);
  } else {
    openNoteEditorModal(id);
  }
}

function toggleSelectNote(id) {
  if (ASCD.selectedNotes.has(id)) {
    ASCD.selectedNotes.delete(id);
  } else {
    ASCD.selectedNotes.add(id);
  }
  updateNotesBatchBar();
  renderNotesList();
}

function openNoteEditorModal(noteId = null, prefillData = null) {
  ASCD.activeNoteId = noteId;
  const modal = document.getElementById('note-editor-modal');
  if (!modal) return;

  let note = null;
  if (noteId) {
    note = ASCD.notes.find(n => n.id === noteId);
  }

  const titleInput = document.getElementById('edit-note-title');
  const catSelect = document.getElementById('edit-note-category');
  const textEditor = document.getElementById('edit-note-content');

  if (note) {
    if (titleInput) titleInput.value = note.title || '';
    if (catSelect) catSelect.value = note.category || 'Estudo Bíblico';
    if (textEditor) textEditor.innerHTML = note.content || '';
  } else {
    ASCD.activeNoteId = null;
    if (titleInput) titleInput.value = prefillData ? prefillData.title : '';
    if (catSelect) catSelect.value = prefillData ? prefillData.category : 'Estudo Bíblico';
    if (textEditor) textEditor.innerHTML = prefillData ? prefillData.content : '';
  }

  modal.classList.add('open');
}

function setNoteModalMode() {}

function saveNoteFromModal() {
  const title = document.getElementById('edit-note-title')?.value.trim() || 'Anotação sem título';
  const category = document.getElementById('edit-note-category')?.value || 'Estudo Bíblico';
  const content = document.getElementById('edit-note-content')?.innerHTML || '';

  if (ASCD.activeNoteId) {
    const idx = ASCD.notes.findIndex(n => n.id === ASCD.activeNoteId);
    if (idx !== -1) {
      ASCD.notes[idx].title = title;
      ASCD.notes[idx].category = category;
      ASCD.notes[idx].content = content;
      ASCD.notes[idx].updatedAt = new Date().toISOString();
    }
  } else {
    const newNote = {
      id: 'note-' + Date.now(),
      title,
      category,
      date: new Date().toLocaleDateString('pt-BR'),
      content,
      updatedAt: new Date().toISOString()
    };
    ASCD.notes.unshift(newNote);
  }

  saveNotes();
  renderNotesList();
  document.getElementById('note-editor-modal')?.classList.remove('open');
  showToast('💾 Anotação salva com sucesso!');
}

function deleteNote(event, noteId) {
  event.stopPropagation();
  if (confirm('Tem certeza que deseja apagar esta anotação?')) {
    trackDeletedId(noteId);
    ASCD.notes = ASCD.notes.filter(n => n.id !== noteId);
    ASCD.selectedNotes.delete(noteId);
    saveNotes();
    updateNotesBatchBar();
    renderNotesList();
    showToast('Anotação removida');
  }
}

function exportNoteById(noteId, format) {
  const note = ASCD.notes.find(n => n.id === noteId);
  if (!note) return;
  const item = { ...note, type: 'Estudo Bíblico' };
  if (format === 'doc') exportToDoc(item, 'Nota');
  if (format === 'excel') exportToExcel([item], `ASCD_Nota_${cleanFilename(item.title)}`);
  if (format === 'pdf') exportToPdf(item, 'Nota de Estudo Bíblico');
}

/**
 * ==========================================================================
 * ANOTAÇÕES DE SERMÕES & PREGAÇÕES COM MULTI-SELEÇÃO E EXPORTAÇÃO EM LOTE
 * ==========================================================================
 */
function setupSermons() {
  renderSermonsList();

  const btnNewSermon = document.getElementById('btn-new-sermon');
  if (btnNewSermon) {
    btnNewSermon.addEventListener('click', () => openSermonModal());
  }

  const searchInput = document.getElementById('sermons-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSermonsList(e.target.value.toLowerCase());
    });
  }

  // Alternar modo de seleção de sermões
  const btnToggleSelect = document.getElementById('btn-toggle-select-sermons');
  if (btnToggleSelect) {
    btnToggleSelect.addEventListener('click', () => {
      ASCD.sermonsSelectMode = !ASCD.sermonsSelectMode;
      ASCD.selectedSermons.clear();
      updateSermonsBatchBar();
      renderSermonsList();
      btnToggleSelect.textContent = ASCD.sermonsSelectMode ? '✕ Cancelar Seleção' : '☑️ Selecionar Vários';
    });
  }

  // Selecionar Todos os sermões
  document.getElementById('btn-select-all-sermons')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      ASCD.sermons.forEach(s => ASCD.selectedSermons.add(s.id));
    } else {
      ASCD.selectedSermons.clear();
    }
    updateSermonsBatchBar();
    renderSermonsList();
  });

  // Ações em lote para sermões selecionados
  document.getElementById('btn-batch-sermons-doc')?.addEventListener('click', () => {
    const items = getSelectedSermonsItems();
    if (items.length) exportBatchToDoc(items, 'Sermões', 'ASCD_Sermoes_Selecionados');
  });

  document.getElementById('btn-batch-sermons-excel')?.addEventListener('click', () => {
    const items = getSelectedSermonsItems();
    if (items.length) exportToExcel(items, 'ASCD_Sermoes_Selecionados');
  });

  document.getElementById('btn-batch-sermons-pdf')?.addEventListener('click', () => {
    const items = getSelectedSermonsItems();
    if (items.length) exportBatchToPdf(items, 'Sermões Selecionados');
  });

  document.getElementById('btn-batch-sermons-del')?.addEventListener('click', () => {
    deleteSelectedSermons();
  });

  const btnSaveModal = document.getElementById('btn-save-sermon-modal');
  if (btnSaveModal) {
    btnSaveModal.addEventListener('click', saveSermonFromModal);
  }

  const btnCloseModal = document.getElementById('btn-close-sermon-modal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      exitAllFullscreens();
      document.getElementById('sermon-editor-modal')?.classList.remove('open');
    });
  }

  // Exportações individuais do modal de sermões
  document.getElementById('btn-export-sermon-doc')?.addEventListener('click', () => {
    const item = getActiveSermonObjectForExport();
    if (item) exportToDoc(item, 'Sermao');
  });

  document.getElementById('btn-export-sermon-excel')?.addEventListener('click', () => {
    const item = getActiveSermonObjectForExport();
    if (item) exportToExcel([item], `ASCD_Sermao_${cleanFilename(item.title)}`);
  });

  document.getElementById('btn-export-sermon-pdf')?.addEventListener('click', () => {
    const item = getActiveSermonObjectForExport();
    if (item) exportToPdf(item, 'Anotação de Sermão');
  });

  document.getElementById('btn-export-all-sermons-excel')?.addEventListener('click', () => {
    exportToExcel(ASCD.sermons.map(s => ({ ...s, type: 'Sermão' })), 'ASCD_Todos_Sermoes');
  });
}

function getSelectedSermonsItems() {
  return ASCD.sermons
    .filter(s => ASCD.selectedSermons.has(s.id))
    .map(s => ({ ...s, type: 'Sermão' }));
}

function updateSermonsBatchBar() {
  const bar = document.getElementById('sermons-batch-bar');
  const counter = document.getElementById('sermons-selected-counter');
  const count = ASCD.selectedSermons.size;

  if (bar) {
    bar.classList.toggle('active', ASCD.sermonsSelectMode || count > 0);
  }
  if (counter) {
    counter.textContent = `${count} selecionado(s)`;
  }
}

function deleteSelectedSermons() {
  const count = ASCD.selectedSermons.size;
  if (!count) return;
  if (confirm(`Deseja realmente excluir os ${count} sermões selecionados?`)) {
    ASCD.selectedSermons.forEach(id => trackDeletedId(id));
    ASCD.sermons = ASCD.sermons.filter(s => !ASCD.selectedSermons.has(s.id));
    ASCD.selectedSermons.clear();
    saveSermons();
    updateSermonsBatchBar();
    renderSermonsList();
    showToast(`${count} sermão(ões) excluído(s)`);
  }
}

function getActiveSermonObjectForExport() {
  const title = document.getElementById('edit-sermon-title')?.value.trim() || 'Sermão sem título';
  const preacher = document.getElementById('edit-sermon-preacher')?.value.trim() || 'Pregador não informado';
  const passage = document.getElementById('edit-sermon-passage')?.value.trim() || 'Geral';
  const date = document.getElementById('edit-sermon-date')?.value || new Date().toISOString().split('T')[0];
  const content = document.getElementById('edit-sermon-content')?.innerHTML || '';

  return {
    id: ASCD.activeSermonId || 'sermon-export',
    type: 'Sermão',
    title,
    preacher,
    passage,
    date,
    content
  };
}

function renderSermonsList(filterQuery = '') {
  const container = document.getElementById('sermons-cards-grid');
  if (!container) return;

  const filtered = ASCD.sermons.filter(s => {
    return s.title.toLowerCase().includes(filterQuery) ||
           (s.preacher && s.preacher.toLowerCase().includes(filterQuery)) ||
           (s.passage && s.passage.toLowerCase().includes(filterQuery)) ||
           (s.content && s.content.toLowerCase().includes(filterQuery));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box" style="grid-column: 1 / -1; padding: 40px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <h3 style="margin-top: 12px;">Nenhum sermão registrado</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Guarde as pregações de seus cultos com dados do pregador, versículos e anotações completas!</p>
        <button class="btn btn-primary" onclick="openSermonModal()" style="margin-top: 16px;">+ Novo Sermão</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const isSelected = ASCD.selectedSermons.has(s.id);
    const plainText = s.content ? stripHtml(s.content).trim() : '';
    const snippet = plainText ? (plainText.length > 140 ? escapeHtml(plainText.substring(0, 140)) + '...' : escapeHtml(plainText)) : '';
    return `
      <div class="note-card ${isSelected ? 'selected' : ''}" onclick="handleSermonCardClick('${s.id}')">
        <div class="note-card-header">
          <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <input type="checkbox" class="card-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleSelectSermon('${s.id}')" title="Selecionar" />
            <span class="note-category-tag">🎤 Sermão</span>
          </div>
        </div>
        
        <h3 class="note-card-title">${escapeHtml(s.title)}</h3>

        <div class="sermon-meta-row">
          ${s.preacher ? `<span class="sermon-meta-item">👤 <strong>${escapeHtml(s.preacher)}</strong></span>` : ''}
          ${s.passage ? `<span class="sermon-meta-item">📖 <strong>${escapeHtml(s.passage)}</strong></span>` : ''}
        </div>

        ${snippet ? `
          <div class="note-card-preview">${snippet}</div>
        ` : ''}

        <div class="card-actions-row">
          <span class="note-date">${formatDateShort(s.date)}</span>
          
          <div class="card-export-mini-group" onclick="event.stopPropagation()">
            <button class="btn-mini-export" title="Exportar para DOC" onclick="exportSermonById('${s.id}', 'doc')">DOC</button>
            <button class="btn-mini-export" title="Exportar para Excel" onclick="exportSermonById('${s.id}', 'excel')">Excel</button>
            <button class="btn-mini-export" title="Exportar para PDF" onclick="exportSermonById('${s.id}', 'pdf')">PDF</button>
            <button class="btn-icon-subtle" onclick="deleteSermon(event, '${s.id}')" title="Excluir Sermão" style="margin-left: 4px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleSermonCardClick(id) {
  if (ASCD.sermonsSelectMode) {
    toggleSelectSermon(id);
  } else {
    openSermonModal(id);
  }
}

function toggleSelectSermon(id) {
  if (ASCD.selectedSermons.has(id)) {
    ASCD.selectedSermons.delete(id);
  } else {
    ASCD.selectedSermons.add(id);
  }
  updateSermonsBatchBar();
  renderSermonsList();
}

function openSermonModal(sermonId = null) {
  ASCD.activeSermonId = sermonId;
  const modal = document.getElementById('sermon-editor-modal');
  if (!modal) return;

  let sermon = null;
  if (sermonId) {
    sermon = ASCD.sermons.find(s => s.id === sermonId);
  }

  const titleInput = document.getElementById('edit-sermon-title');
  const preacherInput = document.getElementById('edit-sermon-preacher');
  const passageInput = document.getElementById('edit-sermon-passage');
  const dateInput = document.getElementById('edit-sermon-date');
  const textEditor = document.getElementById('edit-sermon-content');

  if (sermon) {
    if (titleInput) titleInput.value = sermon.title || '';
    if (preacherInput) preacherInput.value = sermon.preacher || '';
    if (passageInput) passageInput.value = sermon.passage || '';
    if (dateInput) dateInput.value = sermon.date || '';
    if (textEditor) textEditor.innerHTML = sermon.content || '';
  } else {
    ASCD.activeSermonId = null;
    if (titleInput) titleInput.value = '';
    if (preacherInput) preacherInput.value = '';
    if (passageInput) passageInput.value = '';
    if (dateInput) dateInput.value = getTodayDateStr();
    if (textEditor) textEditor.innerHTML = '';
  }

  modal.classList.add('open');
}

function setSermonModalMode() {}

function saveSermonFromModal() {
  const title = document.getElementById('edit-sermon-title')?.value.trim() || 'Sermão sem título';
  const preacher = document.getElementById('edit-sermon-preacher')?.value.trim() || '';
  const passage = document.getElementById('edit-sermon-passage')?.value.trim() || '';
  const date = document.getElementById('edit-sermon-date')?.value || getTodayDateStr();
  const content = document.getElementById('edit-sermon-content')?.innerHTML || '';

  if (ASCD.activeSermonId) {
    const idx = ASCD.sermons.findIndex(s => s.id === ASCD.activeSermonId);
    if (idx !== -1) {
      ASCD.notes[idx];
      ASCD.sermons[idx].title = title;
      ASCD.sermons[idx].preacher = preacher;
      ASCD.sermons[idx].passage = passage;
      ASCD.sermons[idx].date = date;
      ASCD.sermons[idx].content = content;
      ASCD.sermons[idx].updatedAt = new Date().toISOString();
    }
  } else {
    const newSermon = {
      id: 'sermon-' + Date.now(),
      title,
      preacher,
      passage,
      date,
      content,
      updatedAt: new Date().toISOString()
    };
    ASCD.sermons.unshift(newSermon);
  }

  saveSermons();
  renderSermonsList();
  document.getElementById('sermon-editor-modal')?.classList.remove('open');
  showToast('💾 Sermão gravado com sucesso!');
}

function deleteSermon(event, sermonId) {
  event.stopPropagation();
  if (confirm('Tem certeza que deseja apagar esta anotação de sermão?')) {
    trackDeletedId(sermonId);
    ASCD.sermons = ASCD.sermons.filter(s => s.id !== sermonId);
    ASCD.selectedSermons.delete(sermonId);
    saveSermons();
    updateSermonsBatchBar();
    renderSermonsList();
    showToast('Sermão excluído');
  }
}

function exportSermonById(sermonId, format) {
  const sermon = ASCD.sermons.find(s => s.id === sermonId);
  if (!sermon) return;
  const item = { ...sermon, type: 'Sermão' };
  if (format === 'doc') exportToDoc(item, 'Sermao');
  if (format === 'excel') exportToExcel([item], `ASCD_Sermao_${cleanFilename(item.title)}`);
  if (format === 'pdf') exportToPdf(item, 'Anotação de Sermão');
}

/**
 * ==========================================================================
 * JOURNALING DIÁRIO COM CALENDÁRIO, ORAÇÃO E TAREFAS ("O QUE FAZER NESSE DIA")
 * ==========================================================================
 */
function setupJournal() {
  const todayStr = getTodayDateStr();
  ASCD.currentJournalDate = todayStr;
  const d = new Date();
  ASCD.calendarYear = d.getFullYear();
  ASCD.calendarMonth = d.getMonth();

  // Navegação do Calendário
  document.getElementById('cal-prev-month')?.addEventListener('click', () => {
    ASCD.calendarMonth--;
    if (ASCD.calendarMonth < 0) {
      ASCD.calendarMonth = 11;
      ASCD.calendarYear--;
    }
    renderCalendar();
  });

  document.getElementById('cal-next-month')?.addEventListener('click', () => {
    ASCD.calendarMonth++;
    if (ASCD.calendarMonth > 11) {
      ASCD.calendarMonth = 0;
      ASCD.calendarYear++;
    }
    renderCalendar();
  });

  document.getElementById('cal-btn-today')?.addEventListener('click', () => {
    const now = new Date();
    ASCD.calendarYear = now.getFullYear();
    ASCD.calendarMonth = now.getMonth();
    selectJournalDate(getTodayDateStr());
    renderCalendar();
  });

  // Navegação de Dias Anteriores / Seguintes no Journal
  document.getElementById('journal-prev-day')?.addEventListener('click', () => {
    changeJournalDay(-1);
  });

  document.getElementById('journal-next-day')?.addEventListener('click', () => {
    changeJournalDay(1);
  });

  // Adicionar tarefa em "O que fazer nesse dia"
  const btnAddTask = document.getElementById('btn-add-journal-task');
  const taskInput = document.getElementById('journal-task-input');
  if (btnAddTask && taskInput) {
    btnAddTask.addEventListener('click', () => addJournalTask());
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addJournalTask();
      }
    });
  }

  // Salvar registro manual
  document.getElementById('btn-save-journal-entry')?.addEventListener('click', () => {
    saveCurrentJournalEntry();
    showToast('💾 Registro diário salvo no seu dispositivo!');
  });

  // Auto-salvamento em tempo real no Journal enquanto digita
  ASCD._journalDebounceTimer = null;
  const triggerJournalAutoSave = () => {
    if (ASCD._journalDebounceTimer) {
      clearTimeout(ASCD._journalDebounceTimer);
    }
    ASCD._journalDebounceTimer = setTimeout(() => {
      saveCurrentJournalEntry(false);
    }, 400);
  };

  ['journal-title-input', 'journal-verse-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', triggerJournalAutoSave);
  });
  ['journal-prayer-editor', 'journal-text-editor'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', triggerJournalAutoSave);
  });

  // Exportações do Journal
  document.getElementById('btn-export-journal-doc')?.addEventListener('click', () => {
    saveCurrentJournalEntry(false);
    const entry = ASCD.journalEntries[ASCD.currentJournalDate];
    if (entry) exportToDoc({ ...entry, type: 'Journal Diário' }, 'Journal');
  });

  document.getElementById('btn-export-journal-excel')?.addEventListener('click', () => {
    saveCurrentJournalEntry(false);
    const entry = ASCD.journalEntries[ASCD.currentJournalDate];
    if (entry) exportToExcel([{ ...entry, type: 'Journal Diário' }], `ASCD_Journal_${ASCD.currentJournalDate}`);
  });

  document.getElementById('btn-export-journal-pdf')?.addEventListener('click', () => {
    saveCurrentJournalEntry(false);
    const entry = ASCD.journalEntries[ASCD.currentJournalDate];
    if (entry) exportToPdf({ ...entry, type: 'Journal Diário' }, 'Diário Espiritual & Journaling');
  });

  document.getElementById('btn-export-all-journal-excel')?.addEventListener('click', () => {
    const list = Object.values(ASCD.journalEntries).map(j => ({ ...j, type: 'Journal Diário' }));
    exportToExcel(list, 'ASCD_Todo_Historico_Journal');
  });

  document.getElementById('btn-export-all-journal-pdf')?.addEventListener('click', () => {
    const list = Object.keys(ASCD.journalEntries).sort().reverse().map(d => ({
      ...ASCD.journalEntries[d],
      date: d,
      type: 'Journal Diário'
    }));
    if (list.length) {
      exportBatchToPdf(list, 'Todo o Histórico do Diário');
    } else {
      showToast('Nenhum registro no Diário para exportar.');
    }
  });

  // Alternar modo de seleção de dias de journaling
  const btnToggleSelectJ = document.getElementById('btn-toggle-select-journal');
  if (btnToggleSelectJ) {
    btnToggleSelectJ.addEventListener('click', () => {
      ASCD.journalSelectMode = !ASCD.journalSelectMode;
      ASCD.selectedJournalDates.clear();
      updateJournalBatchBar();
      renderJournalHistoryList();
      btnToggleSelectJ.textContent = ASCD.journalSelectMode ? '✕ Cancelar' : '☑️ Selecionar';
    });
  }

  // Selecionar todos os dias de journaling
  document.getElementById('btn-select-all-journal')?.addEventListener('change', (e) => {
    if (e.target.checked) {
      Object.keys(ASCD.journalEntries).forEach(d => ASCD.selectedJournalDates.add(d));
    } else {
      ASCD.selectedJournalDates.clear();
    }
    updateJournalBatchBar();
    renderJournalHistoryList();
  });

  // Exportar dias selecionados para PDF
  document.getElementById('btn-batch-journal-pdf')?.addEventListener('click', () => {
    const items = getSelectedJournalItems();
    if (items.length) {
      exportBatchToPdf(items, 'Diário Espiritual - Dias Selecionados');
    } else {
      showToast('Nenhum dia selecionado para exportar em PDF.');
    }
  });

  // Exportar dias selecionados para Excel
  document.getElementById('btn-batch-journal-excel')?.addEventListener('click', () => {
    const items = getSelectedJournalItems();
    if (items.length) {
      exportToExcel(items, 'ASCD_Journal_Selecionados');
    } else {
      showToast('Nenhum dia selecionado para exportar em Excel.');
    }
  });

  // Excluir dias selecionados em lote
  document.getElementById('btn-batch-journal-del')?.addEventListener('click', () => {
    deleteSelectedJournalDays();
  });

  // Botões de apagar o dia atual (no cabeçalho do diário e no rodapé do calendário)
  document.getElementById('btn-delete-current-journal-day')?.addEventListener('click', () => {
    deleteCurrentJournalDay();
  });
  document.getElementById('cal-btn-delete-day')?.addEventListener('click', () => {
    deleteCurrentJournalDay();
  });
}

function renderCalendar() {
  const titleEl = document.getElementById('cal-month-title');
  const daysGrid = document.getElementById('calendar-days-grid');
  if (!daysGrid) return;

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (titleEl) {
    titleEl.textContent = `${monthNames[ASCD.calendarMonth]} ${ASCD.calendarYear}`;
  }

  const firstDayIndex = new Date(ASCD.calendarYear, ASCD.calendarMonth, 1).getDay(); // 0 = Dom
  const daysInMonth = new Date(ASCD.calendarYear, ASCD.calendarMonth + 1, 0).getDate();
  const prevMonthDays = new Date(ASCD.calendarYear, ASCD.calendarMonth, 0).getDate();

  const todayStr = getTodayDateStr();
  let html = '';

  // Dias do mês anterior para completar o grid
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDayNum = prevMonthDays - i;
    html += `<div class="cal-day-cell other-month">${prevDayNum}</div>`;
  }

  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${ASCD.calendarYear}-${String(ASCD.calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dayStr === todayStr;
    const isSelected = dayStr === ASCD.currentJournalDate;
    const entry = ASCD.journalEntries[dayStr];
    const hasEntry = Boolean(entry && (entry.content || entry.prayer || (entry.tasks && entry.tasks.length)));

    let classes = 'cal-day-cell';
    if (isToday) classes += ' today';
    if (isSelected) classes += ' selected';
    if (hasEntry) classes += ' has-entry';

    html += `<div class="${classes}" onclick="selectJournalDate('${dayStr}')">${day}</div>`;
  }

  // Preencher resto da última semana
  const totalSlots = firstDayIndex + daysInMonth;
  const remaining = (7 - (totalSlots % 7)) % 7;
  for (let j = 1; j <= remaining; j++) {
    html += `<div class="cal-day-cell other-month">${j}</div>`;
  }

  daysGrid.innerHTML = html;
}

function selectJournalDate(dateStr) {
  if (ASCD.journalSelectMode) {
    toggleSelectJournalDate(dateStr);
    return;
  }
  // Salvar registro anterior antes de trocar de dia
  saveCurrentJournalEntry(false);

  ASCD.currentJournalDate = dateStr;
  renderCalendar();
  loadJournalEntryForDate(dateStr);
  renderJournalHistoryList();
}

function changeJournalDay(delta) {
  saveCurrentJournalEntry(false);
  const parts = ASCD.currentJournalDate.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + delta);

  ASCD.calendarYear = d.getFullYear();
  ASCD.calendarMonth = d.getMonth();
  const newDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  selectJournalDate(newDateStr);
}

function loadJournalEntryForDate(dateStr) {
  const displayDateEl = document.getElementById('journal-display-date');
  if (displayDateEl) {
    displayDateEl.textContent = formatDateDisplay(dateStr);
  }

  const titleInput = document.getElementById('journal-title-input');
  const verseInput = document.getElementById('journal-verse-input');
  const prayerEditor = document.getElementById('journal-prayer-editor');
  const textEditor = document.getElementById('journal-text-editor');
  const saveStatus = document.getElementById('journal-save-status');

  const entry = ASCD.journalEntries[dateStr];

  if (entry) {
    if (titleInput) titleInput.value = entry.title || '';
    if (verseInput) verseInput.value = entry.verse || '';
    if (prayerEditor) prayerEditor.innerHTML = entry.prayer || '';
    if (textEditor) textEditor.innerHTML = entry.content || '';
    renderJournalTasks(entry.tasks || []);
    if (saveStatus) saveStatus.textContent = '✓ Registro salvo no dispositivo';
  } else {
    if (titleInput) titleInput.value = '';
    if (verseInput) verseInput.value = '';
    if (prayerEditor) prayerEditor.innerHTML = '';
    if (textEditor) textEditor.innerHTML = '';
    renderJournalTasks([]);
    if (saveStatus) saveStatus.textContent = '';
  }
}

function renderJournalTasks(tasks = null) {
  const listEl = document.getElementById('journal-tasks-list');
  const progressEl = document.getElementById('journal-tasks-progress');
  if (!listEl) return;

  const currentEntry = ASCD.journalEntries[ASCD.currentJournalDate];
  const taskList = tasks || (currentEntry ? currentEntry.tasks : []) || [];

  if (taskList.length === 0) {
    listEl.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:6px 0;">Nenhuma tarefa adicionada ainda.</div>`;
    if (progressEl) progressEl.textContent = '0 tarefas';
    return;
  }

  const completedCount = taskList.filter(t => t.done).length;
  if (progressEl) {
    progressEl.textContent = `${completedCount} de ${taskList.length} concluída(s)`;
  }

  listEl.innerHTML = taskList.map(task => `
    <div class="journal-task-item">
      <div class="journal-task-left">
        <input type="checkbox" class="journal-task-checkbox" ${task.done ? 'checked' : ''} onchange="toggleJournalTask('${task.id}', this.checked)" />
        <span class="journal-task-text ${task.done ? 'completed' : ''}">${escapeHtml(task.text)}</span>
      </div>
      <button type="button" class="btn-icon-subtle" onclick="deleteJournalTask('${task.id}')" title="Excluir tarefa">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');
}

function addJournalTask() {
  const input = document.getElementById('journal-task-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const dateStr = ASCD.currentJournalDate;
  if (!ASCD.journalEntries[dateStr]) {
    ASCD.journalEntries[dateStr] = {
      date: dateStr,
      title: '',
      verse: '',
      prayer: '',
      tasks: [],
      content: '',
      updatedAt: new Date().toISOString()
    };
  }

  if (!ASCD.journalEntries[dateStr].tasks) {
    ASCD.journalEntries[dateStr].tasks = [];
  }

  ASCD.journalEntries[dateStr].tasks.push({
    id: 'task-' + Date.now(),
    text,
    done: false
  });

  input.value = '';
  saveJournalEntries();
  renderJournalTasks();
  renderCalendar();
}

function toggleJournalTask(taskId, isDone) {
  const dateStr = ASCD.currentJournalDate;
  const entry = ASCD.journalEntries[dateStr];
  if (!entry || !entry.tasks) return;

  const task = entry.tasks.find(t => t.id === taskId);
  if (task) {
    task.done = isDone;
    saveJournalEntries();
    renderJournalTasks();
  }
}

function deleteJournalTask(taskId) {
  const dateStr = ASCD.currentJournalDate;
  const entry = ASCD.journalEntries[dateStr];
  if (!entry || !entry.tasks) return;

  entry.tasks = entry.tasks.filter(t => t.id !== taskId);
  saveJournalEntries();
  renderJournalTasks();
}

function setJournalMode(mode) {
  ASCD.journalCurrentMode = mode || 'text';
  const textWrap = document.getElementById('journal-text-wrapper');
  if (textWrap) textWrap.style.display = 'block';
}

function saveCurrentJournalEntry(notify = true) {
  const dateStr = ASCD.currentJournalDate;
  if (!dateStr) return;

  const title = document.getElementById('journal-title-input')?.value.trim() || '';
  const verse = document.getElementById('journal-verse-input')?.value.trim() || '';
  const prayer = document.getElementById('journal-prayer-editor')?.innerHTML || '';
  const content = document.getElementById('journal-text-editor')?.innerHTML || '';

  const existingTasks = (ASCD.journalEntries[dateStr] && ASCD.journalEntries[dateStr].tasks) ? ASCD.journalEntries[dateStr].tasks : [];

  const prayerClean = prayer.replace(/<[^>]*>/g, '').trim();
  const contentClean = content.replace(/<[^>]*>/g, '').trim();
  const hasAnyData = title || verse || prayerClean || contentClean || existingTasks.length > 0;

  // Se nada foi preenchido e não havia dados, ignorar
  if (!hasAnyData) {
    return;
  }

  const old = ASCD.journalEntries[dateStr];
  const finalTitle = title;

  let isChanged = false;
  if (!old) {
    isChanged = true;
  } else {
    if (finalTitle !== (old.title || '')) isChanged = true;
    if (verse !== (old.verse || '')) isChanged = true;
    if (prayerClean !== (old.prayer ? old.prayer.replace(/<[^>]*>/g, '').trim() : '')) isChanged = true;
    if (contentClean !== (old.content ? old.content.replace(/<[^>]*>/g, '').trim() : '')) isChanged = true;
  }

  // Se nada foi alterado e é salvamento de fundo/mudança de aba, NÃO alterar updatedAt nem disparar auto-sync desnecessário
  if (!isChanged && !notify) {
    return;
  }

  const newUpdatedAt = isChanged ? new Date().toISOString() : (old && old.updatedAt ? old.updatedAt : new Date().toISOString());

  ASCD.journalEntries[dateStr] = {
    date: dateStr,
    title: finalTitle,
    verse,
    prayer,
    tasks: existingTasks,
    content,
    updatedAt: newUpdatedAt
  };

  saveJournalEntries();
  renderCalendar();
  renderJournalHistoryList();

  const statusEl = document.getElementById('journal-save-status');
  if (statusEl) {
    statusEl.textContent = '✓ Registro salvo no dispositivo às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  if (notify) {
    showToast('✓ Diário salvo com sucesso!');
  }
}

function toggleSelectJournalDate(dateStr) {
  if (ASCD.selectedJournalDates.has(dateStr)) {
    ASCD.selectedJournalDates.delete(dateStr);
  } else {
    ASCD.selectedJournalDates.add(dateStr);
  }
  updateJournalBatchBar();
  renderJournalHistoryList();
}

function getSelectedJournalItems() {
  const dates = Array.from(ASCD.selectedJournalDates).sort().reverse();
  return dates
    .filter(d => ASCD.journalEntries[d])
    .map(d => ({
      ...ASCD.journalEntries[d],
      date: d,
      type: 'Journal Diário'
    }));
}

function updateJournalBatchBar() {
  const bar = document.getElementById('journal-batch-bar');
  const counter = document.getElementById('journal-selected-counter');
  const count = ASCD.selectedJournalDates.size;
  const selectAll = document.getElementById('btn-select-all-journal');

  if (bar) {
    bar.style.display = (ASCD.journalSelectMode || count > 0) ? 'block' : 'none';
  }
  if (counter) {
    counter.textContent = `${count} selecionado(s)`;
  }
  if (selectAll) {
    const total = Object.keys(ASCD.journalEntries).length;
    selectAll.checked = total > 0 && count === total;
  }
}

function renderJournalHistoryList() {
  const container = document.getElementById('journal-history-list');
  if (!container) return;

  const dates = Object.keys(ASCD.journalEntries).sort().reverse();

  if (dates.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:12px;">Nenhum registro ainda.</div>`;
    const bar = document.getElementById('journal-batch-bar');
    if (bar) bar.style.display = 'none';
    return;
  }

  container.innerHTML = dates.map(dateStr => {
    const entry = ASCD.journalEntries[dateStr];
    const isCur = dateStr === ASCD.currentJournalDate;
    const isSel = ASCD.selectedJournalDates.has(dateStr);

    if (ASCD.journalSelectMode) {
      return `
        <div class="journal-history-item ${isCur ? 'active' : ''} ${isSel ? 'selected' : ''}" onclick="toggleSelectJournalDate('${dateStr}')">
          <input type="checkbox" class="card-select-checkbox" ${isSel ? 'checked' : ''} onclick="event.stopPropagation(); toggleSelectJournalDate('${dateStr}')" style="width:16px; height:16px; margin-right:6px; flex-shrink:0;">
          <div class="journal-history-info">
            <span class="journal-history-date">${formatDateShort(dateStr)}</span>
            <span class="journal-history-title">${escapeHtml(entry.title || 'Sem título')}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="journal-history-item ${isCur ? 'active' : ''}" onclick="selectJournalDate('${dateStr}')">
        <div class="journal-history-info">
          <span class="journal-history-date">${formatDateShort(dateStr)}</span>
          <span class="journal-history-title">${escapeHtml(entry.title || 'Sem título')}</span>
        </div>
        <button type="button" class="btn-delete-history-item" title="Apagar registro do dia ${formatDateShort(dateStr)}" onclick="deleteSingleJournalDay('${dateStr}', event)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      </div>
    `;
  }).join('');
}

function clearJournalInputs() {
  if (ASCD._journalDebounceTimer) {
    clearTimeout(ASCD._journalDebounceTimer);
    ASCD._journalDebounceTimer = null;
  }

  const titleInput = document.getElementById('journal-title-input');
  const verseInput = document.getElementById('journal-verse-input');
  const prayerEditor = document.getElementById('journal-prayer-editor');
  const textEditor = document.getElementById('journal-text-editor');
  const saveStatus = document.getElementById('journal-save-status');

  if (titleInput) titleInput.value = '';
  if (verseInput) verseInput.value = '';
  if (prayerEditor) prayerEditor.innerHTML = '';
  if (textEditor) textEditor.innerHTML = '';
  renderJournalTasks([]);

  if (saveStatus) saveStatus.textContent = 'O registro deste dia foi limpo/apagado.';
}

function deleteSingleJournalDay(dateStr, e) {
  if (e) e.stopPropagation();
  const dateFormatted = formatDateShort(dateStr);
  if (confirm(`Deseja realmente apagar o registro do diário do dia ${dateFormatted}? Esta ação limpará o dia e removerá da sincronização.`)) {
    if (ASCD._journalDebounceTimer) {
      clearTimeout(ASCD._journalDebounceTimer);
      ASCD._journalDebounceTimer = null;
    }

    trackDeletedId('JOURNAL-' + dateStr);
    delete ASCD.journalEntries[dateStr];
    ASCD.selectedJournalDates.delete(dateStr);
    saveJournalEntries();

    if (ASCD.currentJournalDate === dateStr) {
      clearJournalInputs();
    }

    renderCalendar();
    renderJournalHistoryList();
    updateJournalBatchBar();
    triggerAutoSyncToCloud(true);
    showToast(`🗑️ Registro de ${dateFormatted} apagado com sucesso!`);
  }
}

function deleteSelectedJournalDays() {
  const count = ASCD.selectedJournalDates.size;
  if (!count) {
    showToast('Nenhum dia selecionado para excluir.');
    return;
  }
  const msg = count === 1 
    ? `Deseja realmente apagar o registro do dia selecionado?`
    : `Deseja realmente apagar os registros dos ${count} dias selecionados? Esta ação não pode ser desfeita.`;

  if (confirm(msg)) {
    if (ASCD._journalDebounceTimer) {
      clearTimeout(ASCD._journalDebounceTimer);
      ASCD._journalDebounceTimer = null;
    }

    let currentCleared = false;
    ASCD.selectedJournalDates.forEach(dateStr => {
      trackDeletedId('JOURNAL-' + dateStr);
      delete ASCD.journalEntries[dateStr];
      if (ASCD.currentJournalDate === dateStr) {
        currentCleared = true;
      }
    });

    ASCD.selectedJournalDates.clear();
    ASCD.journalSelectMode = false;
    saveJournalEntries();

    if (currentCleared) {
      clearJournalInputs();
    }

    const btnToggle = document.getElementById('btn-toggle-select-journal');
    if (btnToggle) btnToggle.textContent = '☑️ Selecionar';

    updateJournalBatchBar();
    renderCalendar();
    renderJournalHistoryList();
    triggerAutoSyncToCloud(true);
    showToast(`🗑️ ${count} dia(s) de registro apagado(s) com sucesso!`);
  }
}

function deleteCurrentJournalDay() {
  const dateStr = ASCD.currentJournalDate;
  if (!dateStr) return;

  const dateFormatted = formatDateShort(dateStr);
  const entry = ASCD.journalEntries[dateStr];
  const titleVal = document.getElementById('journal-title-input')?.value.trim() || '';
  const verseVal = document.getElementById('journal-verse-input')?.value.trim() || '';
  const prayerVal = (document.getElementById('journal-prayer-editor')?.innerHTML || '').replace(/<[^>]*>/g, '').trim();
  const textVal = (document.getElementById('journal-text-editor')?.innerHTML || '').replace(/<[^>]*>/g, '').trim();

  const hasContent = Boolean(entry || titleVal || verseVal || prayerVal || textVal);

  if (!hasContent) {
    showToast(`O dia ${dateFormatted} já se encontra vazio.`);
    return;
  }

  if (confirm(`Deseja realmente apagar todo o registro do diário do dia ${dateFormatted}? Esta ação limpará o dia e removerá da sincronização.`)) {
    if (ASCD._journalDebounceTimer) {
      clearTimeout(ASCD._journalDebounceTimer);
      ASCD._journalDebounceTimer = null;
    }

    trackDeletedId('JOURNAL-' + dateStr);
    delete ASCD.journalEntries[dateStr];
    ASCD.selectedJournalDates.delete(dateStr);
    saveJournalEntries();

    clearJournalInputs();

    renderCalendar();
    renderJournalHistoryList();
    updateJournalBatchBar();

    triggerAutoSyncToCloud(true);

    showToast(`🗑️ Registro de ${dateFormatted} apagado com sucesso!`);
  }
}

/**
 * ==========================================================================
 * MODO DIVIDIDO (SPLIT VIEW) COM EDITOR DE TEXTO & SALVAMENTO DE PÁGINA
 * ==========================================================================
 */
function setupSplitScreen() {
  // Salvar anotação desta página bíblica (botão manual)
  document.getElementById('btn-save-split-study')?.addEventListener('click', () => saveCurrentBiblePageStudy(true));

  // Auto-salvamento em tempo real no Modo Dividido da Bíblia enquanto digita
  let splitDebounceTimer = null;
  const splitTextEditor = document.getElementById('split-text-editor');
  if (splitTextEditor) {
    splitTextEditor.addEventListener('input', () => {
      clearTimeout(splitDebounceTimer);
      splitDebounceTimer = setTimeout(() => {
        saveCurrentBiblePageStudy(false);
      }, 400);
    });
  }

  // Apagar anotação desta página bíblica
  document.getElementById('btn-delete-split-study')?.addEventListener('click', deleteCurrentBiblePageStudy);

  // Fechar tela dividida pelo botão interno do painel
  document.getElementById('btn-close-split-panel')?.addEventListener('click', toggleSplitScreen);
}

function setSplitMode(mode) {
  ASCD.splitCurrentMode = mode || 'text';
  const textWrap = document.getElementById('split-text-wrapper');
  if (textWrap) textWrap.style.display = 'block';
}

function toggleTextFullscreen(wrapper, btnElement) {
  if (!wrapper) return;

  const isFullscreen = wrapper.classList.contains('text-section-fullscreen');
  if (isFullscreen) {
    exitAllFullscreens();
    showToast('Modo normal restaurado.');
    return;
  }

  wrapper.classList.add('text-section-fullscreen');
  const modalDialog = wrapper.closest('.modal-dialog');
  const modalBody = wrapper.closest('.modal-body');
  const splitWorkspace = wrapper.closest('.split-workspace-panel');
  
  if (modalDialog) modalDialog.classList.add('has-fullscreen-child');
  if (modalBody) modalBody.classList.add('has-fullscreen-child');
  if (splitWorkspace) splitWorkspace.classList.add('has-fullscreen-child');

  document.body.classList.add('ascd-in-fullscreen');

  if (btnElement) {
    btnElement.classList.add('is-active');
    const enterIcon = btnElement.querySelector('.fs-icon-enter');
    const exitIcon = btnElement.querySelector('.fs-icon-exit');
    const label = btnElement.querySelector('.fs-label');
    if (enterIcon) enterIcon.style.display = 'none';
    if (exitIcon) exitIcon.style.display = 'inline-block';
    if (label) label.textContent = 'Sair';
    btnElement.title = 'Sair do Ecrã Inteiro (Pressione ESC ou clique em Sair)';
  }

  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.documentElement.webkitRequestFullscreen && !document.webkitFullscreenElement) {
      document.documentElement.webkitRequestFullscreen().catch(() => {});
    }
  } catch (err) {}

  showToast('⛶ Modo Ecrã Inteiro ativado. Pressione ESC ou clique em Sair para voltar.');
}

function toggleBibleFullscreen() {
  const mainWrapper = document.querySelector('.app-main-wrapper');
  if (!mainWrapper) return;

  const isFs = mainWrapper.classList.contains('bible-fullscreen-active');
  if (isFs) {
    exitAllFullscreens();
    showToast('Modo normal restaurado.');
    return;
  }

  mainWrapper.classList.add('bible-fullscreen-active');
  const secBiblia = document.getElementById('sec-biblia');
  if (secBiblia) secBiblia.classList.add('bible-section-fullscreen');
  document.body.classList.add('ascd-in-fullscreen');

  const btn = document.getElementById('bible-btn-fullscreen');
  if (btn) {
    btn.classList.add('is-active');
    const enterIcon = btn.querySelector('.fs-icon-enter');
    const exitIcon = btn.querySelector('.fs-icon-exit');
    const label = btn.querySelector('.fs-label');
    if (enterIcon) enterIcon.style.display = 'none';
    if (exitIcon) exitIcon.style.display = 'inline-block';
    if (label) label.textContent = 'Sair';
    btn.title = 'Sair do Ecrã Inteiro (Pressione ESC ou clique em Sair)';
  }

  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.documentElement.webkitRequestFullscreen && !document.webkitFullscreenElement) {
      document.documentElement.webkitRequestFullscreen().catch(() => {});
    }
  } catch (err) {}

  showToast('⛶ Leitor Bíblico em Ecrã Inteiro. Pressione ESC ou clique em Sair para voltar.');
}

function exitAllFullscreens() {
  // 1. Desativar fullscreen em editores de texto
  document.querySelectorAll('.text-section-fullscreen').forEach(wrapper => {
    wrapper.classList.remove('text-section-fullscreen');
    const btn = wrapper.querySelector('.btn-text-fullscreen');
    if (btn) {
      btn.classList.remove('is-active');
      const enterIcon = btn.querySelector('.fs-icon-enter');
      const exitIcon = btn.querySelector('.fs-icon-exit');
      const label = btn.querySelector('.fs-label');
      if (enterIcon) enterIcon.style.display = 'inline-block';
      if (exitIcon) exitIcon.style.display = 'none';
      if (label) label.textContent = 'Ecrã Inteiro';
      btn.title = 'Ecrã Inteiro / Foco de Escrita';
    }
  });

  ['jfmt', 'sfmt', 'fmt', 'split-fmt'].forEach(prefix => {
    const btn = document.getElementById(`${prefix}-btn-fullscreen`);
    if (btn) {
      btn.classList.remove('is-active');
      const enterIcon = btn.querySelector('.fs-icon-enter');
      const exitIcon = btn.querySelector('.fs-icon-exit');
      const label = btn.querySelector('.fs-label');
      if (enterIcon) enterIcon.style.display = 'inline-block';
      if (exitIcon) exitIcon.style.display = 'none';
      if (label) label.textContent = 'Ecrã Inteiro';
      btn.title = 'Ecrã Inteiro / Foco de Escrita';
    }
  });

  // 2. Desativar fullscreen no Leitor Bíblico e Workspace
  const mainWrapper = document.querySelector('.app-main-wrapper');
  if (mainWrapper) mainWrapper.classList.remove('bible-fullscreen-active');

  const secBiblia = document.getElementById('sec-biblia');
  if (secBiblia) secBiblia.classList.remove('bible-section-fullscreen');

  const bibleFsBtn = document.getElementById('bible-btn-fullscreen');
  if (bibleFsBtn) {
    bibleFsBtn.classList.remove('is-active');
    const enterIcon = bibleFsBtn.querySelector('.fs-icon-enter');
    const exitIcon = bibleFsBtn.querySelector('.fs-icon-exit');
    const label = bibleFsBtn.querySelector('.fs-label');
    if (enterIcon) enterIcon.style.display = 'inline-block';
    if (exitIcon) exitIcon.style.display = 'none';
    if (label) label.textContent = 'Ecrã Inteiro';
    bibleFsBtn.title = 'Ecrã Inteiro / Tela Cheia (Leitor Bíblico)';
  }

  // 3. Desativar fullscreen no Devocional Pão Diário
  const secDevo = document.getElementById('sec-devocional');
  if (secDevo) secDevo.classList.remove('devo-fullscreen-active');

  const btnDevoFs = document.getElementById('btn-devo-fullscreen');
  if (btnDevoFs) {
    btnDevoFs.classList.remove('is-active');
    const enterIcon = btnDevoFs.querySelector('.fs-icon-enter');
    const exitIcon = btnDevoFs.querySelector('.fs-icon-exit');
    const label = btnDevoFs.querySelector('.fs-label');
    if (enterIcon) enterIcon.style.display = 'inline-block';
    if (exitIcon) exitIcon.style.display = 'none';
    if (label) label.textContent = 'Ecrã Inteiro';
    btnDevoFs.title = 'Modo Foco / Ecrã Inteiro no iPad';
  }

  // 4. Limpar classes auxiliares e body
  document.querySelectorAll('.has-fullscreen-child').forEach(el => el.classList.remove('has-fullscreen-child'));
  document.body.classList.remove('ascd-in-fullscreen');

  // 5. Fechar Fullscreen API nativo do navegador / Safari se ativo
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => {});
    }
  } catch (err) {}
}

// Atalhos de teclado compatíveis com iPad (Magic Keyboard / Smart Keyboard) e Desktop
document.addEventListener('keydown', (e) => {
  // 1. ESC para sair de ecrã inteiro
  if (e.key === 'Escape') {
    const hasAnyFs = document.body.classList.contains('ascd-in-fullscreen') || 
      document.querySelector('.text-section-fullscreen, .bible-fullscreen-active, .bible-section-fullscreen, .devo-fullscreen-active') ||
      document.fullscreenElement ||
      document.webkitFullscreenElement;
    if (hasAnyFs) {
      exitAllFullscreens();
      showToast('Modo normal restaurado.');
    }
  }

  const isCmdOrCtrl = e.metaKey || e.ctrlKey;

  // 2. Cmd+S / Ctrl+S para salvar estudo no modo dividido
  if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (ASCD.isSplitView) {
      saveCurrentBiblePageStudy();
    }
  }
});

// Listener de saída do fullscreen nativo do navegador
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    exitAllFullscreens();
  }
});
document.addEventListener('webkitfullscreenchange', () => {
  if (!document.webkitFullscreenElement) {
    exitAllFullscreens();
  }
});

function loadBiblePageNoteIntoSplit() {
  const key = `${ASCD.currentBibleBook}_${ASCD.currentBibleChapter}`;
  const saved = ASCD.biblePageNotes[key];

  const textEditor = document.getElementById('split-text-editor');
  const deleteBtn = document.getElementById('btn-delete-split-study');

  if (saved && saved.content) {
    if (textEditor) textEditor.innerHTML = saved.content || '';
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';
  } else {
    if (textEditor) textEditor.innerHTML = '';
    if (deleteBtn) deleteBtn.style.display = 'none';
  }
}

function saveCurrentBiblePageStudy(notify = true) {
  const bookName = BIBLE_BOOKS.find(b => b.id === ASCD.currentBibleBook)?.name || 'Livro';
  const chap = ASCD.currentBibleChapter;
  const key = `${ASCD.currentBibleBook}_${chap}`;

  const textContent = document.getElementById('split-text-editor')?.innerHTML || '';
  const cleanText = textContent.replace(/<br\s*\/?>/gi, '').trim();

  // Se nada foi escrito e não havia nada guardado para este capítulo, ignora
  if (!cleanText && !ASCD.biblePageNotes[key]) {
    return;
  }

  const old = ASCD.biblePageNotes[key];
  let isChanged = false;
  if (!old) {
    isChanged = true;
  } else {
    if (cleanText !== (old.content ? old.content.replace(/<br\s*\/?>/gi, '').trim() : '')) isChanged = true;
  }

  if (!isChanged && !notify) {
    return;
  }

  const newUpdatedAt = isChanged ? new Date().toISOString() : (old && old.updatedAt ? old.updatedAt : new Date().toISOString());

  const verObj = BIBLE_VERSIONS.find(v => v.id === ASCD.currentBibleVersion) || { shortName: 'BPT' };

  // 1. Guardar na coleção de anotações de páginas bíblicas
  ASCD.biblePageNotes[key] = {
    bookId: ASCD.currentBibleBook,
    chapterNum: chap,
    version: ASCD.currentBibleVersion,
    title: `Estudo: ${bookName} ${chap} (${verObj.shortName})`,
    content: textContent,
    updatedAt: newUpdatedAt
  };
  saveBiblePageNotes();

  // 2. Guardar ou atualizar também no Caderno de Estudos Bíblicos para acesso fácil
  const studyNoteId = `bible-study-${key}`;
  const existingIdx = ASCD.notes.findIndex(n => n.id === studyNoteId);
  const notePayload = {
    id: studyNoteId,
    title: `Estudo Bíblico: ${bookName} ${chap} (${verObj.shortName})`,
    category: 'Estudo Bíblico',
    date: new Date().toLocaleDateString('pt-BR'),
    content: textContent,
    updatedAt: newUpdatedAt
  };

  if (existingIdx !== -1) {
    ASCD.notes[existingIdx] = notePayload;
  } else {
    ASCD.notes.unshift(notePayload);
  }
  saveNotes();

  updateBiblePageSavedBadge();
  const deleteBtn = document.getElementById('btn-delete-split-study');
  if (deleteBtn) deleteBtn.style.display = 'inline-flex';
  if (notify) {
    showToast(`💾 Estudo de ${bookName} ${chap} guardado com sucesso!`);
  }
}

function deleteCurrentBiblePageStudy(e) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  const bookName = BIBLE_BOOKS.find(b => b.id === ASCD.currentBibleBook)?.name || 'Livro';
  const chap = ASCD.currentBibleChapter;
  const key = `${ASCD.currentBibleBook}_${chap}`;

  if (!confirm(`Deseja realmente apagar a anotação guardada de ${bookName} ${chap}?`)) {
    return;
  }

  // 1. Remover da coleção de anotações de páginas bíblicas
  trackDeletedId('BIBLIA-' + key);
  trackDeletedId(`bible-study-${key}`);
  if (ASCD.biblePageNotes[key]) {
    delete ASCD.biblePageNotes[key];
    saveBiblePageNotes();
  }

  // 2. Remover também do Caderno de Estudos Bíblicos se foi espelhado lá
  const studyNoteId = `bible-study-${key}`;
  const noteIdx = ASCD.notes.findIndex(n => n.id === studyNoteId);
  if (noteIdx !== -1) {
    ASCD.notes.splice(noteIdx, 1);
    saveNotes();
    renderNotesList();
  }

  // 3. Limpar editor de texto do Modo Dividido
  const textEditor = document.getElementById('split-text-editor');
  if (textEditor) textEditor.innerHTML = '';

  // 4. Atualizar badge e esconder botão de apagar no painel
  updateBiblePageSavedBadge();
  const deleteBtn = document.getElementById('btn-delete-split-study');
  if (deleteBtn) deleteBtn.style.display = 'none';

  showToast(`🗑️ Anotação de ${bookName} ${chap} apagada com sucesso!`);
}

function toggleSplitScreen() {
  const appContainer = document.querySelector('.app-main-wrapper');
  const btnToggle = document.getElementById('btn-toggle-split');
  
  ASCD.isSplitView = !ASCD.isSplitView;

  const bibleBtnNotes = document.getElementById('bible-btn-toggle-notes');

  if (ASCD.isSplitView) {
    appContainer.classList.add('split-view-active');
    if (btnToggle) {
      btnToggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        <span>Fechar Tela Dividida</span>
      `;
      btnToggle.classList.add('btn-active-state');
    }
    if (bibleBtnNotes) {
      bibleBtnNotes.classList.add('is-active');
      bibleBtnNotes.classList.add('active');
    }

    if (ASCD.activeTab !== 'biblia') {
      showTab('biblia');
    }

    loadBiblePageNoteIntoSplit();
  } else {
    saveCurrentBiblePageStudy(false);
    appContainer.classList.remove('split-view-active');
    if (btnToggle) {
      btnToggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
        <span>Modo Dividido</span>
      `;
      btnToggle.classList.remove('btn-active-state');
    }
    if (bibleBtnNotes) {
      bibleBtnNotes.classList.remove('is-active');
      bibleBtnNotes.classList.remove('active');
    }
  }
}

/**
 * ==========================================================================
 * EXPORTAÇÃO COMPLETA: DOC (.doc), EXCEL (.csv) e PDF (.pdf)
 * Sem textos de "EXPORTAÇÃO OFICIAL" ou "Gerado por..."
 * Suporte a itens individuais e exportação em lote de múltiplos registros.
 * ==========================================================================
 */

/**
 * Exportar um único registro para documento Word (.doc)
 */
function exportToDoc(item, typeName = 'Registro') {
  exportBatchToDoc([item], typeName, `ASCD_${typeName}_${cleanFilename(item.title || 'Registro')}`);
}

/**
 * Exportar múltiplos registros selecionados para um único documento Word (.doc)
 */
function exportBatchToDoc(items, typeName = 'Registros', filename = 'ASCD_Export') {
  if (!items || items.length === 0) {
    showToast('Nenhum registro selecionado para exportar');
    return;
  }

  const itemsHtml = items.map((item, index) => {
    const dateStr = item.date ? formatDateShort(item.date) : new Date().toLocaleDateString('pt-BR');
    
    let metaHtml = `
      <p><strong>Tipo:</strong> ${item.type || typeName}</p>
      <p><strong>Data:</strong> ${dateStr}</p>
    `;

    if (item.preacher) metaHtml += `<p><strong>Pregador:</strong> ${item.preacher}</p>`;
    if (item.passage) metaHtml += `<p><strong>Passagem Bíblica:</strong> ${item.passage}</p>`;
    if (item.category) metaHtml += `<p><strong>Categoria:</strong> ${item.category}</p>`;
    if (item.verse) metaHtml += `<p><strong>Passagem / Tema:</strong> ${item.verse}</p>`;

    let prayerHtml = '';
    if (item.prayer && stripHtml(item.prayer).trim()) {
      prayerHtml = `
        <div style="margin-top: 16px; background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 10px 14px;">
          <h4 style="margin:0 0 6px 0; color:#92400E;">🙏 Motivos de Oração & Intercessão:</h4>
          <div>${item.prayer}</div>
        </div>
      `;
    }

    let tasksHtml = '';
    if (item.tasks && item.tasks.length > 0) {
      tasksHtml = `
        <div style="margin-top: 16px; background-color: #F3F4F6; border-left: 4px solid #4B5563; padding: 10px 14px;">
          <h4 style="margin:0 0 6px 0; color:#1F2937;">📋 O que Fazer Nesse Dia:</h4>
          <ul style="margin:0; padding-left:20px;">
            ${item.tasks.map(t => `<li>[${t.done ? 'X' : ' '}] ${escapeHtml(t.text)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    const isLast = index === items.length - 1;
    const pageBreak = isLast ? '' : '<div style="page-break-after: always; margin-bottom: 40px; border-bottom: 2px dashed #CBD5E1; padding-bottom: 30px;"></div>';

    return `
      <div class="doc-entry">
        <h1>${item.title || 'Anotação ASCD'}</h1>
        <div class="meta-box">
          ${metaHtml}
        </div>
        ${prayerHtml}
        ${tasksHtml}
        <div style="margin-top: 16px;">
          ${item.content || '<p><em>Nenhum texto adicional gravado.</em></p>'}
        </div>
      </div>
      ${pageBreak}
    `;
  }).join('');

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body {
          font-family: 'Georgia', 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #262626;
          margin: 40px;
        }
        h1 {
          font-size: 20pt;
          color: #1A1A1A;
          border-bottom: 2px solid #D97706;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .meta-box {
          background-color: #FEF3C7;
          border-left: 4px solid #D97706;
          padding: 8px 14px;
          margin-bottom: 18px;
          font-size: 10.5pt;
        }
        blockquote {
          background-color: #F3F4F6;
          border-left: 3px solid #9CA3AF;
          padding: 8px 14px;
          font-style: italic;
          margin: 14px 0;
        }
      </style>
    </head>
    <body>
      ${itemsHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
  triggerDownload(blob, `${cleanFilename(filename)}.doc`);
  showToast(`📄 Documento Word (.doc) com ${items.length} registro(s) exportado!`);
}

/**
 * Exportar para planilha Excel (.csv) com delimitador ';' e BOM UTF-8
 */
function exportToExcel(items, filename = 'ASCD_Export') {
  if (!items || items.length === 0) {
    showToast('Nenhum dado selecionado para exportar');
    return;
  }

  const headers = ['Tipo', 'Data', 'Título', 'Pregador / Autor', 'Passagem / Versículo', 'Categoria', 'Oração / Intercessão', 'Tarefas do Dia', 'Conteúdo (Texto)'];

  const rows = items.map(item => {
    const type = item.type || (item.preacher ? 'Sermão' : (item.verse ? 'Journal Diário' : 'Estudo Bíblico'));
    const date = item.date ? formatDateShort(item.date) : '';
    const title = (item.title || '').replace(/"/g, '""');
    const preacher = (item.preacher || '').replace(/"/g, '""');
    const passage = (item.passage || item.verse || '').replace(/"/g, '""');
    const category = (item.category || '').replace(/"/g, '""');
    const prayer = stripHtml(item.prayer || '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
    
    let tasksStr = '';
    if (item.tasks && item.tasks.length) {
      tasksStr = item.tasks.map(t => `[${t.done ? 'X' : ' '}] ${t.text}`).join(' | ').replace(/"/g, '""');
    }

    const cleanContent = stripHtml(item.content || '').replace(/\r?\n/g, ' ').replace(/"/g, '""');

    return `"${type}";"${date}";"${title}";"${preacher}";"${passage}";"${category}";"${prayer}";"${tasksStr}";"${cleanContent}"`;
  });

  const csvContent = [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${cleanFilename(filename)}.csv`);
  showToast(`📊 Planilha Excel (.csv) com ${items.length} registro(s) exportada!`);
}

/**
 * Obter todos os registros estruturados do ASCD
 * (Sermões, Journal Diário, Caderno de Estudos e Anotações de Páginas Bíblicas)
 */
function getFullDatabaseRecords() {
  const allRecords = [];

  // 1. Sermões
  ASCD.sermons.forEach((s, idx) => {
    allRecords.push({
      id: s.id || `SERMAO-${idx + 1}`,
      tipo: 'Sermão & Pregação',
      data: s.date ? formatDateShort(s.date) : '',
      titulo: s.title || '',
      passagem: s.passage || '',
      pregador: s.preacher || '',
      preacher: s.preacher || '',
      categoria: 'Sermão',
      oracao: '',
      tarefas: '',
      conteudo: stripHtml(s.content || ''),
      dataRegistro: s.date || ''
    });
  });

  // 2. Journal Diário (com Oração e Tarefas)
  Object.keys(ASCD.journalEntries).sort().reverse().forEach(dateStr => {
    const j = ASCD.journalEntries[dateStr];
    let tasksStr = '';
    if (j.tasks && j.tasks.length) {
      tasksStr = j.tasks.map(t => `[${t.done ? 'X' : ' '}] ${t.text}`).join(' | ');
    }

    allRecords.push({
      id: `JOURNAL-${dateStr}`,
      tipo: 'Journal Diário',
      data: formatDateShort(dateStr),
      titulo: j.title || `Diário de ${formatDateShort(dateStr)}`,
      passagem: j.verse || '',
      pregador: '',
      preacher: '',
      categoria: 'Diário Espiritual',
      oracao: stripHtml(j.prayer || ''),
      tarefas: tasksStr,
      conteudo: stripHtml(j.content || ''),
      dataRegistro: j.updatedAt || dateStr
    });
  });

  // 3. Caderno de Estudos Bíblicos
  ASCD.notes.forEach((n, idx) => {
    allRecords.push({
      id: n.id || `ESTUDO-${idx + 1}`,
      tipo: 'Estudo Bíblico',
      data: n.date ? formatDateShort(n.date) : '',
      titulo: n.title || '',
      passagem: '',
      pregador: '',
      preacher: '',
      categoria: n.category || 'Estudo Bíblico',
      oracao: '',
      tarefas: '',
      conteudo: stripHtml(n.content || ''),
      dataRegistro: n.date || ''
    });
  });

  // 4. Anotações de Páginas Bíblicas (Modo Dividido)
  Object.keys(ASCD.biblePageNotes).forEach(key => {
    const p = ASCD.biblePageNotes[key];
    const bookName = (typeof BIBLE_BOOKS !== 'undefined' ? BIBLE_BOOKS.find(b => b.id === p.bookId)?.name : null) || p.bookId;
    allRecords.push({
      id: `BIBLIA-${key}`,
      tipo: 'Anotação Página Bíblica',
      data: p.updatedAt ? formatDateShort(p.updatedAt.split('T')[0]) : '',
      titulo: p.title || `Estudo: ${bookName} ${p.chapterNum}`,
      passagem: `${bookName} ${p.chapterNum}`,
      pregador: '',
      preacher: '',
      categoria: 'Texto Bíblico & Anotação',
      oracao: '',
      tarefas: '',
      conteudo: stripHtml(p.content || ''),
      dataRegistro: p.updatedAt || ''
    });
  });

  return allRecords;
}

/**
 * Exportar Base de Dados Completa (Sermões, Journal, Oração, Tarefas, Estudos)
 * em formato otimizado para importar no Google Sheets / Google Drive
 */
function exportFullDatabaseForGoogleSheets() {
  const allRecords = getFullDatabaseRecords();

  if (allRecords.length === 0) {
    showToast('Ainda não existem registros para exportar');
    return;
  }

  // Cabeçalhos compatíveis com Google Sheets
  const headers = [
    'ID',
    'Tipo_Registro',
    'Data',
    'Titulo_Tema',
    'Passagem_Biblica',
    'Pregador_Autor',
    'Categoria',
    'Oracao_Intercessao',
    'Tarefas_Do_Dia',
    'Conteudo_Texto',
    'Data_Registro'
  ];

  const rows = allRecords.map(r => {
    const escapeCsv = (val) => `"${String(val || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    return [
      escapeCsv(r.id),
      escapeCsv(r.tipo),
      escapeCsv(r.data),
      escapeCsv(r.titulo),
      escapeCsv(r.passagem),
      escapeCsv(r.pregador || r.preacher),
      escapeCsv(r.categoria),
      escapeCsv(r.oracao),
      escapeCsv(r.tarefas),
      escapeCsv(r.conteudo),
      escapeCsv(r.dataRegistro)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'ASCD_Base_de_Dados_Google_Sheets.csv');
  showToast(`📊 Base de dados completa com ${allRecords.length} registro(s) exportada para o Google Sheets / Google Drive!`);
}

/**
 * Abrir Modal de Sincronização com o Google Sheets
 */
function openSheetsSyncModal() {
  const modal = document.getElementById('sheets-sync-modal');
  if (!modal) return;

  const urlInput = document.getElementById('input-sheets-webhook-url');
  if (urlInput) {
    const savedUrl = localStorage.getItem('ascd_sheets_webhook_url') || '';
    urlInput.value = savedUrl;
  }

  const codeDisplay = document.getElementById('apps-script-code-display');
  if (codeDisplay && !codeDisplay.textContent.trim()) {
    codeDisplay.textContent = getAppsScriptCodeText();
  }

  const statusEl = document.getElementById('sheets-sync-status');
  if (statusEl) {
    statusEl.textContent = '';
  }

  modal.classList.add('open');
}

/**
 * Configurar eventos do Modal de Sincronização Google Sheets
 */
function setupSheetsSyncModal() {
  const tabDirect = document.getElementById('tab-btn-sync-direct');
  const tabBackup = document.getElementById('tab-btn-sync-backup');
  const tabSecurity = document.getElementById('tab-btn-sync-security');
  const tabCsv = document.getElementById('tab-btn-sync-csv');

  const panelDirect = document.getElementById('sync-panel-direct');
  const panelBackup = document.getElementById('sync-panel-backup');
  const panelSecurity = document.getElementById('sync-panel-security');
  const panelCsv = document.getElementById('sync-panel-csv');

  const allTabs = [tabDirect, tabBackup, tabSecurity, tabCsv];
  const allPanels = [panelDirect, panelBackup, panelSecurity, panelCsv];

  function switchModalTab(activeBtn, activePanel) {
    allTabs.forEach(btn => {
      if (btn) {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      }
    });
    allPanels.forEach(panel => {
      if (panel) {
        panel.style.display = 'none';
        panel.classList.remove('active');
      }
    });

    if (activeBtn) {
      activeBtn.classList.add('btn-primary');
      activeBtn.classList.remove('btn-secondary');
    }
    if (activePanel) {
      activePanel.style.display = 'block';
      activePanel.classList.add('active');
    }
  }

  if (tabDirect && panelDirect) {
    tabDirect.addEventListener('click', () => switchModalTab(tabDirect, panelDirect));
  }
  if (tabBackup && panelBackup) {
    tabBackup.addEventListener('click', () => switchModalTab(tabBackup, panelBackup));
  }
  if (tabSecurity && panelSecurity) {
    tabSecurity.addEventListener('click', () => switchModalTab(tabSecurity, panelSecurity));
  }
  if (tabCsv && panelCsv) {
    tabCsv.addEventListener('click', () => switchModalTab(tabCsv, panelCsv));
  }

  // Gestão de Alteração de Palavra-passe
  const currentPwdInput = document.getElementById('input-current-app-pwd');
  const newPwdInput = document.getElementById('input-new-app-pwd');
  const confirmPwdInput = document.getElementById('input-confirm-app-pwd');
  const btnSavePwd = document.getElementById('btn-save-new-app-pwd');
  const btnResetPwd = document.getElementById('btn-reset-default-pwd');
  const pwdStatusEl = document.getElementById('security-pwd-status');

  if (btnSavePwd) {
    btnSavePwd.addEventListener('click', () => {
      const curVal = (currentPwdInput?.value || '').trim();
      const newVal = (newPwdInput?.value || '').trim();
      const confVal = (confirmPwdInput?.value || '').trim();
      const actualPwd = localStorage.getItem('ascd_custom_password') || DEFAULT_AUTH_PASSWORD;

      if (!curVal || !newVal || !confVal) {
        if (pwdStatusEl) {
          pwdStatusEl.style.color = '#DC2626';
          pwdStatusEl.textContent = 'Por favor, preencha todos os campos.';
        }
        return;
      }

      if (curVal !== actualPwd) {
        if (pwdStatusEl) {
          pwdStatusEl.style.color = '#DC2626';
          pwdStatusEl.textContent = 'A palavra-passe atual está incorreta.';
        }
        return;
      }

      if (newVal.length < 4) {
        if (pwdStatusEl) {
          pwdStatusEl.style.color = '#DC2626';
          pwdStatusEl.textContent = 'A nova palavra-passe deve ter pelo menos 4 caracteres.';
        }
        return;
      }

      if (newVal !== confVal) {
        if (pwdStatusEl) {
          pwdStatusEl.style.color = '#DC2626';
          pwdStatusEl.textContent = 'A nova palavra-passe e a confirmação não coincidem.';
        }
        return;
      }

      localStorage.setItem('ascd_custom_password', newVal);
      if (currentPwdInput) currentPwdInput.value = '';
      if (newPwdInput) newPwdInput.value = '';
      if (confirmPwdInput) confirmPwdInput.value = '';

      if (pwdStatusEl) {
        pwdStatusEl.style.color = '#059669';
        pwdStatusEl.textContent = '✅ Palavra-passe alterada com sucesso!';
      }
      showToast('✓ Palavra-passe atualizada com sucesso!');
    });
  }

  if (btnResetPwd) {
    btnResetPwd.addEventListener('click', () => {
      if (confirm('Deseja restaurar a palavra-passe padrão ("ascd2026")?')) {
        localStorage.removeItem('ascd_custom_password');
        if (currentPwdInput) currentPwdInput.value = '';
        if (newPwdInput) newPwdInput.value = '';
        if (confirmPwdInput) confirmPwdInput.value = '';
        if (pwdStatusEl) {
          pwdStatusEl.style.color = '#059669';
          pwdStatusEl.textContent = '✅ Palavra-passe restaurada para a predefinida (ascd2026).';
        }
        showToast('Palavra-passe restaurada para ascd2026');
      }
    });
  }

  // Botão Único: Sincronizar Tudo Agora (Puxa novidades + Envia alterações)
  const btnSyncAll = document.getElementById('btn-sync-all-now');
  if (btnSyncAll) {
    btnSyncAll.addEventListener('click', async () => {
      btnSyncAll.disabled = true;
      const statusEl = document.getElementById('sheets-sync-status');
      if (statusEl) {
        statusEl.style.color = 'var(--text-secondary)';
        statusEl.textContent = '⏳ A sincronizar com a Nuvem Firebase...';
      }
      try {
        await syncAllNow(true);
        if (statusEl) {
          statusEl.style.color = '#059669';
          statusEl.textContent = '✅ Sincronização concluída com sucesso!';
        }
      } catch (err) {
        if (statusEl) {
          statusEl.style.color = '#DC2626';
          statusEl.textContent = 'Erro ao sincronizar: ' + err.message;
        }
      } finally {
        btnSyncAll.disabled = false;
      }
    });
  }

  // Botão Testar Conexão com a Nuvem
  const btnTestConn = document.getElementById('btn-test-sheets-connection');
  if (btnTestConn) {
    btnTestConn.addEventListener('click', testGoogleSheetsConnection);
  }

  // Botão Descarregar CSV dentro do modal
  const btnDownloadCsv = document.getElementById('btn-download-sheets-csv');
  if (btnDownloadCsv) {
    btnDownloadCsv.addEventListener('click', exportFullDatabaseForGoogleSheets);
  }

  // Botão Copiar Código Apps Script
  const btnCopyCode = document.getElementById('btn-copy-apps-script');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const code = getAppsScriptCodeText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
          const origText = btnCopyCode.innerHTML;
          btnCopyCode.innerHTML = '✅ Código Copiado!';
          showToast('📋 Código do Apps Script copiado para a área de transferência!');
          setTimeout(() => {
            btnCopyCode.innerHTML = origText;
          }, 2500);
        }).catch(() => {
          fallbackCopyText(code, btnCopyCode);
        });
      } else {
        fallbackCopyText(code, btnCopyCode);
      }
    });
  }

  function fallbackCopyText(text, btn) {
    const codeDisplay = document.getElementById('apps-script-code-display');
    if (codeDisplay) {
      const range = document.createRange();
      range.selectNodeContents(codeDisplay);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast('Código selecionado! Pressione Ctrl+C para copiar.');
    }
  }

  // Fechar modal ao clicar no botão X ou fora
  const btnClose = document.getElementById('btn-close-sheets-modal');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      const modal = document.getElementById('sheets-sync-modal');
      if (modal) modal.classList.remove('open');
    });
  }

  const modal = document.getElementById('sheets-sync-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  // ─── BACKUP ENTRE DISPOSITIVOS ───────────────────────────────────────
  const btnExportBackup = document.getElementById('btn-export-backup');
  if (btnExportBackup) {
    btnExportBackup.addEventListener('click', exportFullBackup);
  }

  const inputImportBackup = document.getElementById('input-import-backup');
  if (inputImportBackup) {
    inputImportBackup.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importFullBackup(file);
      e.target.value = '';
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// BACKUP COMPLETO — EXPORTAR / IMPORTAR ENTRE DISPOSITIVOS
// ═══════════════════════════════════════════════════════════════

function exportFullBackup() {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    device: navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Macintosh') ? 'iPad/Mac' : 'Computador',
    data: {
      notes: ASCD.notes || [],
      sermons: ASCD.sermons || [],
      journalEntries: ASCD.journalEntries || {},
      biblePageNotes: ASCD.biblePageNotes || {},
      devotionalFavorites: ASCD.devotionalFavorites || [],
      settings: {
        bibleVersion: ASCD.currentBibleVersion || 'bpt',
        theme: localStorage.getItem('ascd_theme') || 'light',
        devotionalFontSize: ASCD.devotionalFontSize || 100
      }
    }
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ASCD_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  // Mostrar info do backup
  const info = document.getElementById('export-backup-info');
  if (info) {
    const total = (ASCD.notes?.length || 0) + (ASCD.sermons?.length || 0) +
                  Object.keys(ASCD.journalEntries || {}).length +
                  Object.keys(ASCD.biblePageNotes || {}).length;
    info.textContent = `✅ ${total} registos exportados — ${(json.length / 1024).toFixed(1)} KB`;
  }
  showToast('📦 Backup exportado com sucesso! Transfira o ficheiro para o outro dispositivo.');
}

function importFullBackup(file) {
  const status = document.getElementById('import-backup-status');
  if (status) status.textContent = '⏳ A importar...';

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);

      // Validar estrutura mínima
      if (!backup.data) {
        throw new Error('Ficheiro de backup inválido ou corrompido.');
      }

      const d = backup.data;

      // Confirmar antes de substituir
      const total = (d.notes?.length || 0) + (d.sermons?.length || 0) +
                    Object.keys(d.journalEntries || {}).length +
                    Object.keys(d.biblePageNotes || {}).length;
      const exportDate = backup.exportedAt ? new Date(backup.exportedAt).toLocaleString('pt-PT') : 'data desconhecida';

      if (!confirm(`Importar backup de ${exportDate}?\n\n${total} registos serão restaurados.\n\nOs dados actuais deste dispositivo serão substituídos. Continuar?`)) {
        if (status) status.textContent = '⚠️ Importação cancelada.';
        return;
      }

      // Restaurar dados
      if (d.notes)             ASCD.notes = d.notes;
      if (d.sermons)           ASCD.sermons = d.sermons;
      if (d.journalEntries)    ASCD.journalEntries = d.journalEntries;
      if (d.biblePageNotes)    ASCD.biblePageNotes = d.biblePageNotes;
      if (d.devotionalFavorites) ASCD.devotionalFavorites = d.devotionalFavorites;

      // Guardar tudo no localStorage
      try { localStorage.setItem('ascd_notes', JSON.stringify(ASCD.notes)); } catch (_) {}
      try { localStorage.setItem('ascd_sermons', JSON.stringify(ASCD.sermons)); } catch (_) {}
      try { localStorage.setItem('ascd_journal', JSON.stringify(ASCD.journalEntries)); } catch (_) {}
      try { localStorage.setItem('ascd_bible_page_notes', JSON.stringify(ASCD.biblePageNotes)); } catch (_) {}
      try { localStorage.setItem('ascd_devotional_favs', JSON.stringify(ASCD.devotionalFavorites)); } catch (_) {}

      // Restaurar definições se existirem
      if (d.settings) {
        if (d.settings.theme) {
          localStorage.setItem('ascd_theme', d.settings.theme);
        }
        if (d.settings.bibleVersion) {
          const v = ['bpt', 'ntlh', 'aa'].includes(d.settings.bibleVersion) ? d.settings.bibleVersion : 'bpt';
          ASCD.currentBibleVersion = v;
          localStorage.setItem('ascd_bible_version', v);
        }
      }

      // Atualizar interface
      renderNotesList();
      renderSermonsList();
      renderCalendar();
      renderJournalHistoryList();

      if (status) status.textContent = `✅ ${total} registos importados com sucesso!`;
      showToast(`✅ Backup importado! ${total} registos restaurados. Dados prontos a usar.`);

      // Fechar modal após 2 segundos
      setTimeout(() => {
        document.getElementById('sheets-sync-modal')?.classList.remove('open');
      }, 2000);

    } catch (err) {
      if (status) status.textContent = `❌ Erro: ${err.message}`;
      showToast('❌ Erro ao importar o backup: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Inicialização e Controle do Indicador de Sincronização em Nuvem (Firebase)
 */
function initSheetsSyncIndicator() {
  const badge = document.getElementById('sheets-autosync-badge');
  if (badge) {
    badge.innerHTML = `⚡ <span style="font-weight:600;">Nuvem Ativa</span>`;
    badge.style.display = 'inline-flex';

    // Ao clicar diretamente no botão do cabeçalho, sincroniza tudo na hora!
    badge.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      syncAllNow(true);
    };
  }
}

/**
 * Sincronização Completa (Tudo-em-Um com Firebase Cloud Firestore):
 * 1. Puxa as novidades mais recentes da nuvem (feitas noutros iPads/computadores)
 * 2. Envia e funde os dados locais para a nuvem
 * 3. Atualiza o indicador visual no cabeçalho
 */
async function syncAllNow(showToasts = true) {
  if (!navigator.onLine) {
    if (showToasts) showToast('⚠️ Sem ligação à Internet no momento.');
    return;
  }

  updateSyncPillBadge('syncing');
  if (showToasts) showToast('🔄 A sincronizar com a Nuvem Firebase...');

  try {
    // 1. PULL: Puxar da Nuvem Firebase
    await pullFromCloud(true);

    // 2. PUSH: Gravar/Fundir na Nuvem Firebase
    await executeCloudSync(true);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateSyncPillBadge('success', timeStr);

    if (showToasts) {
      showToast('✅ Nuvem atualizada! Todos os seus iPads e computadores estão sincronizados.');
    }
  } catch (err) {
    console.warn('Sync all notice:', err);
    updateSyncPillBadge('success');
  }
}

/**
 * Auto-Sincronização com o Firebase Cloud Firestore
 * Acionado automaticamente sempre que algo é escrito ou guardado em qualquer aba
 */
function triggerAutoSyncToCloud(immediate = false) {
  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout = null;
  }

  const delay = immediate ? 0 : 1200;
  autoSyncTimeout = setTimeout(() => {
    executeCloudSync(true);
  }, delay);
}

async function executeCloudSync(isAuto = false) {
  if (!navigator.onLine) return;
  if (isSyncingCloud) return;
  isSyncingCloud = true;

  updateSyncPillBadge('syncing');

  const records = getFullDatabaseRecords();
  const rawItems = {
    notes: (ASCD.notes || []).map(n => ({
      id: n.id,
      title: n.title,
      category: n.category,
      date: n.date,
      content: n.content,
      mode: n.mode || 'hybrid',
      paperType: n.paperType || 'pautada',
      updatedAt: n.updatedAt || n.date || new Date().toISOString()
    })),
    sermons: (ASCD.sermons || []).map(s => ({
      id: s.id,
      title: s.title,
      passage: s.passage,
      preacher: s.preacher,
      date: s.date,
      content: s.content,
      mode: s.mode || 'hybrid',
      updatedAt: s.updatedAt || s.date || new Date().toISOString()
    })),
    journalEntries: getCleanJournalEntriesForSync(),
    biblePageNotes: getCleanBibleNotesForSync()
  };

  const payload = {
    records: records,
    rawItems: rawItems,
    deletedIds: ASCD.deletedIds || [],
    timestamp: new Date().toISOString(),
    source: 'ASCD • Bíblia & Notas'
  };

  try {
    const res = await fetch(FIREBASE_CONFIG.syncDocUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          payload: {
            stringValue: JSON.stringify(payload)
          },
          updatedAt: {
            stringValue: new Date().toISOString()
          }
        }
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateSyncPillBadge('success', timeStr);
    if (!isAuto) {
      showToast(`✅ Sincronizado com a Nuvem com sucesso! (${records.length} registros consolidados)`);
    }
  } catch (err) {
    console.warn('Firebase sync notice:', err);
    updateSyncPillBadge('error');
  } finally {
    isSyncingCloud = false;
  }
}

function getCleanJournalEntriesForSync() {
  const clean = {};
  if (!ASCD.journalEntries) return clean;
  Object.keys(ASCD.journalEntries).forEach(dateStr => {
    const j = ASCD.journalEntries[dateStr];
    if (j) {
      clean[dateStr] = {
        date: j.date || dateStr,
        title: j.title || '',
        verse: j.verse || '',
        prayer: j.prayer || '',
        tasks: j.tasks || [],
        content: j.content || '',
        mode: j.mode || 'hybrid',
        paperType: j.paperType || 'pautada',
        updatedAt: j.updatedAt || dateStr || new Date().toISOString()
      };
    }
  });
  return clean;
}

function getCleanBibleNotesForSync() {
  const clean = {};
  if (!ASCD.biblePageNotes) return clean;
  Object.keys(ASCD.biblePageNotes).forEach(key => {
    const b = ASCD.biblePageNotes[key];
    if (b) {
      clean[key] = {
        bookId: b.bookId || '',
        chapterNum: b.chapterNum || 1,
        title: b.title || '',
        content: b.content || '',
        mode: b.mode || 'text',
        updatedAt: b.updatedAt || new Date().toISOString()
      };
    }
  });
  return clean;
}

/**
 * Puxar e Fundir Dados do Firebase Cloud Firestore para o Dispositivo Local
 * Chamado automaticamente ao abrir a aplicação, focar na janela e periodicamente
 */
async function pullFromCloud(silent = false) {
  if (!navigator.onLine) return false;
  if (isSyncingCloud) return false;
  isSyncingCloud = true;

  updateSyncPillBadge('syncing');

  try {
    const res = await fetch(FIREBASE_CONFIG.syncDocUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        updateSyncPillBadge('success');
        return true;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const doc = await res.json();
    if (!doc || !doc.fields || !doc.fields.payload || !doc.fields.payload.stringValue) {
      updateSyncPillBadge('success');
      return false;
    }

    const remotePayload = JSON.parse(doc.fields.payload.stringValue);
    const d = remotePayload.rawItems || {};
    const remoteDeletedIds = remotePayload.deletedIds || [];
    let addedCount = 0;

    // Sincronizar deletedIds bidirecionalmente
    if (Array.isArray(remoteDeletedIds)) {
      if (!ASCD.deletedIds) ASCD.deletedIds = [];
      remoteDeletedIds.forEach(id => {
        if (!ASCD.deletedIds.includes(id)) ASCD.deletedIds.push(id);
      });
      // Remover itens locais marcados como apagados
      ASCD.notes = (ASCD.notes || []).filter(n => !ASCD.deletedIds.includes(n.id));
      ASCD.sermons = (ASCD.sermons || []).filter(s => !ASCD.deletedIds.includes(s.id));
      Object.keys(ASCD.journalEntries || {}).forEach(dateStr => {
        if (ASCD.deletedIds.includes('JOURNAL-' + dateStr)) {
          delete ASCD.journalEntries[dateStr];
        }
      });
      Object.keys(ASCD.biblePageNotes || {}).forEach(key => {
        if (ASCD.deletedIds.includes('BIBLIA-' + key)) {
          delete ASCD.biblePageNotes[key];
        }
      });
    }

    // 1. Fundir Caderno de Notas
    if (d.notes && Array.isArray(d.notes)) {
      d.notes.forEach(remoteNote => {
        if (!remoteNote || !remoteNote.id) return;
        if (ASCD.deletedIds && ASCD.deletedIds.includes(remoteNote.id)) return;

        const localIdx = ASCD.notes.findIndex(n => n.id === remoteNote.id);
        if (localIdx === -1) {
          ASCD.notes.unshift(remoteNote);
          addedCount++;
        } else {
          const local = ASCD.notes[localIdx];
          const remoteTime = remoteNote.updatedAt ? new Date(remoteNote.updatedAt).getTime() : 0;
          const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
          const remoteIsNewer = remoteTime >= localTime;

          if (remoteIsNewer || (!local.content && remoteNote.content)) {
            if (remoteNote.title) local.title = remoteNote.title;
            if (remoteNote.content !== undefined) local.content = remoteNote.content;
            if (remoteNote.category) local.category = remoteNote.category;
            if (remoteNote.mode) local.mode = remoteNote.mode;
            if (remoteNote.paperType) local.paperType = remoteNote.paperType;
            if (remoteNote.updatedAt) local.updatedAt = remoteNote.updatedAt;
            addedCount++;
          }
        }
      });
    }

    // 2. Fundir Sermões
    if (d.sermons && Array.isArray(d.sermons)) {
      d.sermons.forEach(remoteSermon => {
        if (!remoteSermon || !remoteSermon.id) return;
        if (ASCD.deletedIds && ASCD.deletedIds.includes(remoteSermon.id)) return;

        const localIdx = ASCD.sermons.findIndex(s => s.id === remoteSermon.id);
        if (localIdx === -1) {
          ASCD.sermons.unshift(remoteSermon);
          addedCount++;
        } else {
          const local = ASCD.sermons[localIdx];
          const remoteTime = remoteSermon.updatedAt ? new Date(remoteSermon.updatedAt).getTime() : 0;
          const localTime = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
          const remoteIsNewer = remoteTime >= localTime;

          if (remoteIsNewer || (!local.content && remoteNote.content)) {
            if (remoteSermon.title) local.title = remoteSermon.title;
            if (remoteSermon.passage) local.passage = remoteSermon.passage;
            if (remoteSermon.preacher) local.preacher = remoteSermon.preacher;
            if (remoteSermon.content !== undefined) local.content = remoteSermon.content;
            if (remoteSermon.mode) local.mode = remoteSermon.mode;
            if (remoteSermon.updatedAt) local.updatedAt = remoteSermon.updatedAt;
            addedCount++;
          }
        }
      });
    }

    // 3. Fundir Diário (Journal)
    if (d.journalEntries && typeof d.journalEntries === 'object') {
      Object.keys(d.journalEntries).forEach(dateStr => {
        if (ASCD.deletedIds && ASCD.deletedIds.includes('JOURNAL-' + dateStr)) return;
        const remoteJ = d.journalEntries[dateStr];
        if (!remoteJ) return;

        // Ignorar registros de exemplo/mock para começar sempre do vazio
        if (remoteJ.title === 'Meditações Matinais e Gratidão' || (remoteJ.tasks && remoteJ.tasks.some(t => t.id === 't-1' || t.id === 't-2' || t.id === 't-3'))) {
          return;
        }

        if (!ASCD.journalEntries[dateStr]) {
          ASCD.journalEntries[dateStr] = remoteJ;
          addedCount++;
        } else {
          const localJ = ASCD.journalEntries[dateStr];
          const remoteTime = remoteJ.updatedAt ? new Date(remoteJ.updatedAt).getTime() : 0;
          const localTime = localJ.updatedAt ? new Date(localJ.updatedAt).getTime() : 0;
          const remoteIsNewer = remoteTime >= localTime;

          let changed = false;

          // Merge inteligente de tarefas por ID (nunca apaga tarefas existentes)
          const taskMap = new Map();
          (remoteJ.tasks || []).forEach(t => { if (t && t.id) taskMap.set(t.id, t); });
          (localJ.tasks || []).forEach(t => {
            if (t && t.id) {
              if (!taskMap.has(t.id) || !remoteIsNewer) {
                taskMap.set(t.id, t);
              }
            }
          });
          const mergedTasks = Array.from(taskMap.values());
          if (JSON.stringify(mergedTasks) !== JSON.stringify(localJ.tasks || [])) {
            localJ.tasks = mergedTasks;
            changed = true;
          }

          if (remoteIsNewer) {
            if (remoteJ.title && remoteJ.title !== localJ.title) { localJ.title = remoteJ.title; changed = true; }
            if (remoteJ.verse !== undefined && remoteJ.verse !== localJ.verse) { localJ.verse = remoteJ.verse; changed = true; }
            if (remoteJ.prayer !== undefined && remoteJ.prayer !== localJ.prayer) { localJ.prayer = remoteJ.prayer; changed = true; }
            if (remoteJ.content !== undefined && remoteJ.content !== localJ.content) { localJ.content = remoteJ.content; changed = true; }
            if (remoteJ.mode) localJ.mode = remoteJ.mode;
            if (remoteJ.paperType) localJ.paperType = remoteJ.paperType;
            if (remoteJ.updatedAt) localJ.updatedAt = remoteJ.updatedAt;
          } else {
            // Preencher campos que faltam no local mesmo que o local pareça mais recente
            if (!localJ.title && remoteJ.title) {
              localJ.title = remoteJ.title; changed = true;
            }
            if (!localJ.verse && remoteJ.verse) { localJ.verse = remoteJ.verse; changed = true; }
            if ((!localJ.prayer || localJ.prayer === '<br>' || localJ.prayer === '<p><br></p>') && remoteJ.prayer && remoteJ.prayer !== '<br>') {
              localJ.prayer = remoteJ.prayer; changed = true;
            }
            if ((!localJ.content || localJ.content === '<br>' || localJ.content === '<p><br></p>') && remoteJ.content && remoteJ.content !== '<br>') {
              localJ.content = remoteJ.content; changed = true;
            }
          }
          if (changed) addedCount++;
        }
      });
    }

    // 4. Fundir Notas de Páginas Bíblicas
    if (d.biblePageNotes && typeof d.biblePageNotes === 'object') {
      Object.keys(d.biblePageNotes).forEach(key => {
        if (ASCD.deletedIds && ASCD.deletedIds.includes('BIBLIA-' + key)) return;
        const remoteB = d.biblePageNotes[key];
        if (!remoteB) return;

        if (!ASCD.biblePageNotes[key]) {
          ASCD.biblePageNotes[key] = remoteB;
          addedCount++;
        } else {
          const localB = ASCD.biblePageNotes[key];
          const remoteTime = remoteB.updatedAt ? new Date(remoteB.updatedAt).getTime() : 0;
          const localTime = localB.updatedAt ? new Date(localB.updatedAt).getTime() : 0;
          if (remoteTime >= localTime || (!localB.content && remoteB.content)) {
            if (remoteB.title) localB.title = remoteB.title;
            if (remoteB.content !== undefined) localB.content = remoteB.content;
            if (remoteB.updatedAt) localB.updatedAt = remoteB.updatedAt;
            addedCount++;
          }
        }
      });
    }

    // Salvar nos dados locais do dispositivo
    try { localStorage.setItem('ascd_notes', JSON.stringify(ASCD.notes)); } catch (_) {}
    try { localStorage.setItem('ascd_sermons', JSON.stringify(ASCD.sermons)); } catch (_) {}
    try { localStorage.setItem('ascd_journal', JSON.stringify(ASCD.journalEntries)); } catch (_) {}
    try { localStorage.setItem('ascd_bible_page_notes', JSON.stringify(ASCD.biblePageNotes)); } catch (_) {}
    try { localStorage.setItem('ascd_deleted_ids', JSON.stringify(ASCD.deletedIds)); } catch (_) {}

    // Atualizar as telas da app
    renderNotesList();
    renderSermonsList();
    renderCalendar();
    renderJournalHistoryList();
    if (typeof updateBiblePageSavedBadge === 'function') {
      updateBiblePageSavedBadge();
    }

    // RECARREGAR O REGISTRO ATIVO NA TELA
    if (ASCD.activeTab === 'journal' && ASCD.currentJournalDate) {
      const isEditingJournal = document.activeElement && (
        document.activeElement.id === 'journal-title-input' ||
        document.activeElement.id === 'journal-verse-input' ||
        document.activeElement.id === 'journal-prayer-editor' ||
        document.activeElement.id === 'journal-text-editor'
      );
      if (!isEditingJournal) {
        loadJournalEntryForDate(ASCD.currentJournalDate);
      }
    } else if (ASCD.activeTab === 'caderno' && ASCD.activeNoteId) {
      const isEditingNote = document.activeElement && (
        document.activeElement.id === 'note-title-input' ||
        document.activeElement.id === 'note-rich-editor'
      );
      if (!isEditingNote) {
        const curNote = ASCD.notes.find(n => n.id === ASCD.activeNoteId);
        if (curNote) {
          const titleEl = document.getElementById('note-title-input');
          const editorEl = document.getElementById('note-rich-editor');
          if (titleEl) titleEl.value = curNote.title || '';
          if (editorEl) editorEl.innerHTML = curNote.content || '';
        }
      }
    } else if (ASCD.activeTab === 'sermoes' && ASCD.activeSermonId) {
      const isEditingSermon = document.activeElement && (
        document.activeElement.id === 'sermon-title-input' ||
        document.activeElement.id === 'sermon-rich-editor'
      );
      if (!isEditingSermon) {
        const curSermon = ASCD.sermons.find(s => s.id === ASCD.activeSermonId);
        if (curSermon) {
          const titleEl = document.getElementById('sermon-title-input');
          const editorEl = document.getElementById('sermon-rich-editor');
          if (titleEl) titleEl.value = curSermon.title || '';
          if (editorEl) editorEl.innerHTML = curSermon.content || '';
        }
      }
    } else if (ASCD.activeTab === 'biblia' && ASCD.isSplitView) {
      if (typeof loadBibleStudyForCurrentChapter === 'function') {
        loadBibleStudyForCurrentChapter();
      }
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateSyncPillBadge('success', timeStr);

    if (!silent) {
      showToast(addedCount > 0 ? `📥 ${addedCount} registro(s) integrados da Nuvem!` : `☁️ Seus dados já estão perfeitamente sincronizados com a Nuvem.`);
    }
    return true;
  } catch (err) {
    console.warn('Pull from Cloud notice:', err);
    updateSyncPillBadge('success');
    if (!silent) {
      showToast('⚠️ Não foi possível sincronizar com a Nuvem neste momento.');
    }
    return false;
  } finally {
    isSyncingCloud = false;
  }
}

function updateSyncPillBadge(status, timeStr = '') {
  const badge = document.getElementById('sheets-autosync-badge');
  const statusEl = document.getElementById('sheets-sync-status');

  if (badge) {
    if (status === 'syncing') {
      badge.innerHTML = `🔄 <span style="font-weight:600;">A sincronizar...</span>`;
      badge.style.color = 'var(--text-secondary)';
      badge.style.background = 'var(--bg-surface-elevated)';
      badge.style.borderColor = 'var(--accent-gold)';
    } else if (status === 'success') {
      badge.innerHTML = `⚡ <span style="color:#059669; font-weight:600;">Nuvem Ativa</span> ${timeStr ? `<small style="opacity:0.75; font-size:11px;">${timeStr}</small>` : ''}`;
      badge.style.color = '#065F46';
      badge.style.background = 'rgba(16, 185, 129, 0.08)';
      badge.style.borderColor = '#10B981';
    } else if (status === 'error') {
      badge.innerHTML = `⚠️ <span style="color:#DC2626; font-weight:600;">Erro na Nuvem</span>`;
      badge.style.borderColor = '#FCA5A5';
    }
  }

  if (statusEl) {
    if (status === 'syncing') {
      statusEl.style.color = 'var(--text-secondary)';
      statusEl.textContent = '⏳ A sincronizar com a Nuvem Firebase...';
    } else if (status === 'success') {
      statusEl.style.color = '#16A34A';
      statusEl.textContent = `✅ Sincronizado com a Nuvem às ${timeStr}`;
    } else if (status === 'error') {
      statusEl.style.color = '#DC2626';
      statusEl.textContent = '⚠️ Falha temporária na comunicação com a Nuvem';
    }
  }
}

/**
 * Testar Conexão com o Firebase Cloud Firestore
 */
async function testGoogleSheetsConnection() {
  const statusEl = document.getElementById('sheets-sync-status');
  if (statusEl) {
    statusEl.style.color = 'var(--text-secondary)';
    statusEl.textContent = '⏳ A testar conexão com a Nuvem Firebase...';
  }

  try {
    const res = await fetch(FIREBASE_CONFIG.syncDocUrl, { method: 'GET' });
    if (res.ok) {
      if (statusEl) {
        statusEl.style.color = '#16A34A';
        statusEl.textContent = '✅ Conexão ativa! A Nuvem Firebase está conectada e operacional.';
      }
      showToast('✅ Conexão com a Nuvem Firebase testada e aprovada!');
    } else {
      if (statusEl) {
        statusEl.style.color = '#D97706';
        statusEl.textContent = `⚠️ Conexão respondeu com código ${res.status}.`;
      }
      showToast(`⚠️ Resposta da Nuvem: ${res.status}`);
    }
  } catch (err) {
    if (statusEl) {
      statusEl.style.color = '#DC2626';
      statusEl.textContent = '⚠️ Falha na conexão com a Nuvem: ' + err.message;
    }
    showToast('⚠️ Falha ao contactar a Nuvem Firebase.');
  }
}

async function syncWithGoogleSheetsWebhook() {
  await syncAllNow(true);
}

function getAppsScriptCodeText() {
  return "";
}

/**
 * Exportar um único registro para PDF
 */
function exportToPdf(item, typeName = 'Registro') {
  exportBatchToPdf([item], item.title || typeName);
}

/**
 * Exportar múltiplos registros selecionados para PDF
 */
function exportBatchToPdf(items, title = 'Registros ASCD') {
  if (!items || items.length === 0) {
    showToast('Nenhum registro selecionado para exportar');
    return;
  }

  const itemsHtml = items.map((item, index) => {
    const dateStr = item.date ? formatDateShort(item.date) : new Date().toLocaleDateString('pt-BR');
    
    let metaHtml = `
      <div style="font-size: 13px; color: #4B5563; margin-bottom: 16px; line-height: 1.6; background:#FEF3C7; border-left:4px solid #D97706; padding:8px 12px; border-radius:4px;">
        <div><strong>Tipo:</strong> ${item.type || 'Registro'} &nbsp;|&nbsp; <strong>Data:</strong> ${dateStr}</div>
        ${item.preacher ? `<div><strong>Pregador / Orador:</strong> ${item.preacher}</div>` : ''}
        ${item.passage ? `<div><strong>Passagem Bíblica:</strong> ${item.passage}</div>` : ''}
        ${item.category ? `<div><strong>Categoria:</strong> ${item.category}</div>` : ''}
        ${item.verse ? `<div><strong>Passagem / Tema:</strong> ${item.verse}</div>` : ''}
      </div>
    `;

    let prayerHtml = '';
    if (item.prayer && stripHtml(item.prayer).trim()) {
      prayerHtml = `
        <div style="margin-top: 14px; background: #FDF4E3; border-left: 4px solid #B45309; padding: 10px 14px; border-radius: 4px;">
          <h4 style="margin:0 0 6px 0; color:#78350F; font-size:14px;">🙏 Motivos de Oração & Intercessão:</h4>
          <div>${item.prayer}</div>
        </div>
      `;
    }

    let tasksHtml = '';
    if (item.tasks && item.tasks.length > 0) {
      tasksHtml = `
        <div style="margin-top: 14px; background: #F3F4F6; border-left: 4px solid #4B5563; padding: 10px 14px; border-radius: 4px;">
          <h4 style="margin:0 0 6px 0; color:#1F2937; font-size:14px;">📋 O que Fazer Nesse Dia:</h4>
          <ul style="margin:0; padding-left:20px; font-size:13px;">
            ${item.tasks.map(t => `<li style="margin-bottom:3px;">${t.done ? '☑️' : '◻️'} ${escapeHtml(t.text)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <div class="document-page">
        <h2 class="title">${item.title || 'Anotação'}</h2>
        ${metaHtml}
        ${prayerHtml}
        ${tasksHtml}
        <div class="content" style="margin-top:14px;">
          ${item.content || '<p><em>Sem anotação de texto.</em></p>'}
        </div>
      </div>
    `;
  }).join('');

  // Preencher modal de visualização e preparar exportação em PDF real compatível com iPadOS
  const printModal = document.getElementById('ascd-print-preview-modal');
  const printModalTitle = document.getElementById('print-modal-title');
  const printModalBody = document.getElementById('print-modal-body');
  const printContainer = document.getElementById('ascd-print-container');

  if (printModal && printModalBody) {
    if (printModalTitle) printModalTitle.textContent = `📄 ${title}`;
    printModalBody.innerHTML = itemsHtml;
    if (printContainer) printContainer.innerHTML = itemsHtml;

    // Remover qualquer banner de PDF pronto antigo
    const oldBanner = document.getElementById('ascd-pdf-ready-banner');
    if (oldBanner) oldBanner.remove();

    // Botão Principal: Guardar / Descarregar em PDF
    const btnSavePdf = document.getElementById('btn-modal-save-pdf') || document.getElementById('btn-modal-download-direct-pdf');
    if (btnSavePdf) {
      btnSavePdf.onclick = () => {
        downloadDirectPdf(itemsHtml, title);
      };
    }

    // Botão de Impressão Direta (AirPrint / Impressora)
    const btnPrint = document.getElementById('btn-modal-print') || document.getElementById('btn-modal-single-print');
    if (btnPrint) {
      btnPrint.onclick = () => {
        triggerCleanPrint(itemsHtml, title);
      };
    }

    // Suporte retrocompatível para qualquer elemento residual
    document.getElementById('btn-modal-single-print')?.addEventListener('click', () => {
      downloadDirectPdf(itemsHtml, title);
    });

    printModal.classList.add('open');
    showToast('📄 Documento pronto! Toque em "Guardar em PDF" para descarregar');
  } else {
    downloadDirectPdf(itemsHtml, title);
  }
}

/**
 * Disparar impressão nativa do sistema (AirPrint no iPad e diálogo de impressão no desktop)
 * Executado DIRECTAMENTE de forma síncrona para que o WebKit/Safari nunca bloqueie a ação do utilizador
 */
function triggerCleanPrint(itemsHtml, title) {
  // 1. Atualizar o container de impressão dedicado
  const printContainer = document.getElementById('ascd-print-container');
  if (printContainer) {
    printContainer.innerHTML = itemsHtml;
  }

  // 2. Colocar o DOM ativo em modo de impressão dedicado
  // Remove temporariamente restrições de overflow:hidden e flexbox do iPadOS
  document.documentElement.classList.add('ascd-printing');
  document.body.classList.add('ascd-printing');

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.documentElement.classList.remove('ascd-printing');
    document.body.classList.remove('ascd-printing');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // 3. Chamar window.print() de forma síncrona directa dentro do clique do utilizador
  try {
    window.print();
  } catch (err) {
    console.error('Erro na impressão nativa:', err);
    showToast('⚠️ A transferir ficheiro PDF diretamente...');
    downloadDirectPdf(itemsHtml, title);
  }

  // Fallback de limpeza caso o evento afterprint não seja emitido no Safari móvel
  setTimeout(cleanup, 1200);
}

/**
 * Descarregar ficheiro .PDF diretamente via biblioteca html2pdf
 * 100% funcional no iPad, Safari, Chrome e Desktop
 */
function downloadDirectPdf(itemsHtml, title) {
  showToast('⏳ A gerar ficheiro PDF...');
  const element = document.getElementById('print-modal-body');
  if (!element) {
    triggerCleanPrint(itemsHtml, title);
    return;
  }

  if (typeof html2pdf !== 'undefined') {
    const filename = cleanFilename(title || 'ASCD_Documento') + '.pdf';
    const opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      showToast('✅ Ficheiro PDF transferido com sucesso!');
    }).catch(err => {
      console.warn('html2pdf encontrou um erro, a recorrer à impressão nativa:', err);
      triggerCleanPrint(itemsHtml, title);
    });
  } else {
    triggerCleanPrint(itemsHtml, title);
  }
}

/**
 * Disparador universal de download compatível com iPadOS, iOS Safari e Desktop
 * Utiliza Web Share API com File para DOC/CSV no iPad (evita o bloqueio WebKitBlobResource error 1)
 */
async function triggerDownload(blob, filename) {
  const isIOS = (typeof navigator !== 'undefined') && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  // 1. Tentar Web Share API nativa com File (Permite Salvar em Ficheiros / Abrir no Pages/Word no iPad)
  if (typeof navigator !== 'undefined' && navigator.canShare && typeof File !== 'undefined') {
    try {
      const cleanMime = (blob.type || '').split(';')[0].trim() || 'application/octet-stream';
      const file = new File([blob], filename, { 
        type: cleanMime,
        lastModified: Date.now()
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Utilizador apenas fechou o painel de partilha da Apple
        return;
      }
      console.warn('Web Share API não disponível para este tipo de ficheiro, a usar fallback de download:', err);
    }
  }

  // 2. Método padrão via elemento âncora <a> (Desktop Windows, Mac, Chrome, Edge, Firefox)
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();

    // No iOS, se a.click() for bloqueado pelo WebKit em certos formatos, abrir numa nova janela como salvaguarda
    if (isIOS) {
      setTimeout(() => {
        window.open(url, '_blank');
      }, 350);
    }

    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 10000);
  } catch (err) {
    console.error('Erro no download via âncora:', err);
  }
}

function cleanFilename(str) {
  return (str || 'documento')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .substring(0, 40);
}

/**
 * ==========================================================================
 * TEMAS VISUAIS
 * ==========================================================================
 */
function setupThemes() {
  applyTheme(ASCD.theme);

  document.querySelectorAll('.theme-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      if (theme) {
        applyTheme(theme);
        ASCD.theme = theme;
        localStorage.setItem('ascd_theme', theme);
      }
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-opt-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
}

/**
 * ==========================================================================
 * UTILITÁRIOS E NOTIFICAÇÕES
 * ==========================================================================
 */
function showToast(msg) {
  let toast = document.getElementById('ascd-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ascd-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.className = 'show';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.className = '';
  }, 2800);
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeForJs(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const weekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return `${weekDays[d.getDay()]}, ${d.getDate()} de ${monthNames[d.getMonth()]} de ${d.getFullYear()}`;
}

/**
 * ==========================================================================
 * DEVOCIONAL DIÁRIO (OUR DAILY BREAD / PÃO DIÁRIO)
 * ==========================================================================
 */

function setupDevotional() {
  if (!ASCD.currentDevotionalDate) {
    ASCD.currentDevotionalDate = getTodayDateStr();
  }

  // 1. Navegação de Datas
  const btnPrev = document.getElementById('btn-devo-prev-day');
  const btnToday = document.getElementById('btn-devo-today');
  const btnNext = document.getElementById('btn-devo-next-day');
  const dateInput = document.getElementById('devo-date-input');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => changeDevotionalDay(-1));
  }
  if (btnToday) {
    btnToday.addEventListener('click', () => {
      ASCD.currentDevotionalDate = getTodayDateStr();
      loadDevotionalForDate(ASCD.currentDevotionalDate);
      showToast('Exibindo o devocional de hoje.');
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => changeDevotionalDay(1));
  }
  if (dateInput) {
    dateInput.value = ASCD.currentDevotionalDate;
    dateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        ASCD.currentDevotionalDate = e.target.value;
        loadDevotionalForDate(ASCD.currentDevotionalDate);
      }
    });
  }

  // 2. Controles de Tamanho de Fonte
  const btnDecFont = document.getElementById('btn-devo-font-decrease');
  const btnIncFont = document.getElementById('btn-devo-font-increase');
  if (btnDecFont) {
    btnDecFont.addEventListener('click', () => adjustDevotionalFontSize(-10));
  }
  if (btnIncFont) {
    btnIncFont.addEventListener('click', () => adjustDevotionalFontSize(10));
  }

  // 3. Ecrã Inteiro no Devocional (iPad)
  const btnFullscreen = document.getElementById('btn-devo-fullscreen');
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleDevotionalFullscreen);
  }

  // 4. Áudio / Narração
  const btnAudioPlay = document.getElementById('btn-devo-audio-play');
  const btnAudioSpeed = document.getElementById('btn-devo-audio-speed');
  const btnAudioStop = document.getElementById('btn-devo-audio-stop');

  if (btnAudioPlay) {
    btnAudioPlay.addEventListener('click', () => {
      const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
      if (devo) toggleDevotionalAudio(devo);
    });
  }
  if (btnAudioSpeed) {
    btnAudioSpeed.addEventListener('click', () => {
      const rates = [1.0, 1.25, 1.5];
      const curIdx = rates.indexOf(ASCD.devotionalAudioRate || 1.0);
      const nextIdx = (curIdx + 1) % rates.length;
      ASCD.devotionalAudioRate = rates[nextIdx];
      btnAudioSpeed.textContent = `${ASCD.devotionalAudioRate.toFixed(2).replace('.00', '.0')}x`;
      if (ASCD.devotionalAudioPlaying) {
        stopDevotionalAudio();
        const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
        if (devo) toggleDevotionalAudio(devo);
      }
    });
  }
  if (btnAudioStop) {
    btnAudioStop.addEventListener('click', stopDevotionalAudio);
  }

  // 5. Abrir Leitura Bíblica Direta (no Leitor Bíblico da App)
  const openBibleHandler = (e) => {
    if (e) e.preventDefault();
    const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
    if (devo && (devo.scripture || devo.bibleVerse)) {
      openDevotionalInBible(devo.scripture || devo.bibleVerse);
    }
  };

  const btnOpenBible = document.getElementById('btn-devo-open-bible');
  if (btnOpenBible) {
    btnOpenBible.addEventListener('click', openBibleHandler);
  }

  const passageEl = document.getElementById('devo-card-passage');
  if (passageEl) {
    passageEl.style.cursor = 'pointer';
    passageEl.title = 'Abrir este livro e capítulo no Leitor Bíblico';
    passageEl.addEventListener('click', openBibleHandler);
  }

  const verseRefEl = document.getElementById('devo-card-verse-ref');
  if (verseRefEl) {
    verseRefEl.style.cursor = 'pointer';
    verseRefEl.title = 'Ler este versículo no contexto bíblico';
    verseRefEl.addEventListener('click', openBibleHandler);
  }

  const planEl = document.getElementById('devo-card-plan');
  if (planEl) {
    planEl.style.cursor = 'pointer';
    planEl.title = 'Abrir leitura do plano anual no Leitor Bíblico';
    planEl.addEventListener('click', () => {
      const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
      if (devo && devo.bibleInAYear) {
        const firstPassage = devo.bibleInAYear.split(';')[0].trim();
        openDevotionalInBible(firstPassage);
      }
    });
  }

  // 6. Ações Integradas
  const btnToJournal = document.getElementById('btn-devo-to-journal');
  if (btnToJournal) {
    btnToJournal.addEventListener('click', () => {
      const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
      if (devo) writeDevotionalInJournal(devo);
    });
  }

  const btnToStudy = document.getElementById('btn-devo-to-study');
  if (btnToStudy) {
    btnToStudy.addEventListener('click', () => {
      const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
      if (devo) createStudyFromDevotional(devo);
    });
  }

  const btnFav = document.getElementById('btn-devo-fav');
  if (btnFav) {
    btnFav.addEventListener('click', () => {
      toggleDevotionalFavorite(ASCD.currentDevotionalDate);
    });
  }

  const btnShare = document.getElementById('btn-devo-share');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(ASCD.currentDevotionalDate) : null;
      if (devo) copyDevotionalText(devo);
    });
  }

  // 7. Abas da Gaveta Inferior (Recentes / Favoritos)
  const tabRecent = document.getElementById('tab-btn-devo-recent');
  const tabFavs = document.getElementById('tab-btn-devo-favs');
  if (tabRecent) {
    tabRecent.addEventListener('click', () => {
      ASCD.devotionalDrawerTab = 'recent';
      tabRecent.classList.add('active');
      if (tabFavs) tabFavs.classList.remove('active');
      renderDevotionalDrawer();
    });
  }
  if (tabFavs) {
    tabFavs.addEventListener('click', () => {
      ASCD.devotionalDrawerTab = 'favs';
      tabFavs.classList.add('active');
      if (tabRecent) tabRecent.classList.remove('active');
      renderDevotionalDrawer();
    });
  }

  // Aplicar tamanho de fonte salvo se houver
  if (ASCD.devotionalFontSize && ASCD.devotionalFontSize !== 100) {
    adjustDevotionalFontSize(0);
  }

  // Carregar inicial
  loadDevotionalForDate(ASCD.currentDevotionalDate);
}

function changeDevotionalDay(delta) {
  stopDevotionalAudio();
  const parts = ASCD.currentDevotionalDate.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + delta);
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  ASCD.currentDevotionalDate = `${y}-${m}-${day}`;
  
  loadDevotionalForDate(ASCD.currentDevotionalDate);
}

function loadDevotionalForDate(dateStr) {
  ASCD.currentDevotionalDate = dateStr;
  const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(dateStr) : null;
  if (!devo) return;

  // Atualizar input date
  const dateInput = document.getElementById('devo-date-input');
  if (dateInput && dateInput.value !== dateStr) {
    dateInput.value = dateStr;
  }

  // Preencher cabeçalhos do cartão
  const dateEl = document.getElementById('devo-card-date');
  if (dateEl) {
    dateEl.textContent = devo.date || (typeof formatDevotionalDateDisplay === 'function' ? formatDevotionalDateDisplay(dateStr) : formatDateDisplay(dateStr));
  }

  const authorEl = document.getElementById('devo-card-author');
  if (authorEl) {
    authorEl.textContent = devo.author ? `Por ${devo.author}` : 'Ministérios Pão Diário';
  }

  const titleEl = document.getElementById('devo-card-title');
  if (titleEl) {
    titleEl.textContent = devo.title || 'Devocional Diário';
  }

  const passageEl = document.getElementById('devo-card-passage');
  if (passageEl) {
    passageEl.textContent = devo.scripture || devo.bibleVerse || 'Salmos 23';
  }

  const planEl = document.getElementById('devo-card-plan');
  if (planEl) {
    planEl.textContent = devo.bibleInAYear || 'Leitura diária';
  }

  // Versículo em destaque
  const quoteEl = document.getElementById('devo-card-verse-quote');
  const refEl = document.getElementById('devo-card-verse-ref');
  if (quoteEl) {
    quoteEl.textContent = devo.keyVerseText || (devo.body ? extractFirstKeyQuote(devo.body) : 'Guarda o teu coração, porque dele procedem as fontes da vida.');
  }
  if (refEl) {
    refEl.textContent = `— ${devo.bibleVerse || devo.scripture || ''}`;
  }

  // Corpo da mensagem
  const bodyEl = document.getElementById('devo-card-body');
  if (bodyEl) {
    bodyEl.innerHTML = devo.body || '<p>Medite na palavra do Senhor neste dia.</p>';
  }

  // Para Meditar
  const reflectBox = document.getElementById('devo-reflect-box');
  const reflectEl = document.getElementById('devo-card-reflect');
  if (reflectEl) {
    if (devo.reflect && devo.reflect.trim()) {
      reflectEl.innerHTML = devo.reflect;
      if (reflectBox) reflectBox.style.display = 'block';
    } else {
      if (reflectBox) reflectBox.style.display = 'none';
    }
  }

  // Oração do Dia
  const prayerBox = document.getElementById('devo-prayer-box');
  const prayerEl = document.getElementById('devo-card-prayer');
  if (prayerEl) {
    if (devo.prayer && devo.prayer.trim()) {
      prayerEl.innerHTML = devo.prayer;
      if (prayerBox) prayerBox.style.display = 'block';
    } else {
      if (prayerBox) prayerBox.style.display = 'none';
    }
  }

  // Link Oficial
  const linkOfficial = document.getElementById('btn-devo-link-official');
  if (linkOfficial) {
    linkOfficial.href = devo.url || 'https://paodiario.org';
  }

  updateDevotionalFavButton();
  renderDevotionalDrawer();
}

function extractFirstKeyQuote(html) {
  const match = html.match(/“([^”]+)”/);
  if (match) return match[1];
  const pMatch = html.match(/<p>([\s\S]*?)<\/p>/);
  if (pMatch) {
    const text = pMatch[1].replace(/<[^>]+>/g, '');
    return text.length > 150 ? text.slice(0, 147) + '...' : text;
  }
  return 'Lâmpada para os meus pés é tua palavra e luz, para o meu caminho.';
}

function renderCurrentDevotional() {
  loadDevotionalForDate(ASCD.currentDevotionalDate || getTodayDateStr());
}

function adjustDevotionalFontSize(delta) {
  let cur = ASCD.devotionalFontSize || 100;
  if (delta !== 0) {
    cur = Math.min(Math.max(80, cur + delta), 150);
    ASCD.devotionalFontSize = cur;
    localStorage.setItem('ascd_devotional_font_size', cur);
  }

  const indicator = document.getElementById('devo-font-indicator');
  if (indicator) indicator.textContent = `${cur}%`;

  const bodyEl = document.getElementById('devo-card-body');
  if (bodyEl) {
    bodyEl.style.fontSize = `${(17 * cur) / 100}px`;
  }
}

function toggleDevotionalFullscreen() {
  const sec = document.getElementById('sec-devocional');
  const btn = document.getElementById('btn-devo-fullscreen');
  if (!sec) return;

  const isFullscreen = sec.classList.contains('devo-fullscreen-active');
  if (isFullscreen) {
    exitAllFullscreens();
    showToast('Modo normal restaurado.');
    return;
  }

  sec.classList.add('devo-fullscreen-active');
  document.body.classList.add('ascd-in-fullscreen');

  if (btn) {
    btn.classList.add('is-active');
    const enterIcon = btn.querySelector('.fs-icon-enter');
    const exitIcon = btn.querySelector('.fs-icon-exit');
    const label = btn.querySelector('.fs-label');
    if (enterIcon) enterIcon.style.display = 'none';
    if (exitIcon) exitIcon.style.display = 'inline-block';
    if (label) label.textContent = 'Sair do Ecrã Inteiro';
    btn.title = 'Sair do Ecrã Inteiro (Pressione ESC ou toque para sair)';
  }

  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.documentElement.webkitRequestFullscreen && !document.webkitFullscreenElement) {
      document.documentElement.webkitRequestFullscreen().catch(() => {});
    }
  } catch (err) {}

  showToast('⛶ Modo Foco em Ecrã Inteiro ativado. Pressione ESC ou clique em Sair para voltar.');
}

function toggleDevotionalAudio(devotional) {
  if (!('speechSynthesis' in window)) {
    showToast('A síntese de voz em áudio não é suportada pelo seu navegador.');
    return;
  }

  if (ASCD.devotionalAudioPlaying) {
    window.speechSynthesis.pause();
    ASCD.devotionalAudioPlaying = false;
    updateDevotionalAudioUI(false, true);
    showToast('Áudio pausado.');
    return;
  }

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    ASCD.devotionalAudioPlaying = true;
    updateDevotionalAudioUI(true, false);
    showToast('Retomando leitura...');
    return;
  }

  // Iniciar nova leitura
  window.speechSynthesis.cancel();

  const title = devotional.title || '';
  const passage = devotional.scripture || devotional.bibleVerse || '';
  const verseText = devotional.keyVerseText || '';
  const bodyText = (devotional.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const reflectText = (devotional.reflect || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const prayerText = (devotional.prayer || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  const fullTextToSpeak = `${title}. Leitura bíblica: ${passage}. ${verseText ? 'Versículo-chave: ' + verseText + '.' : ''} ${bodyText} ${reflectText ? 'Para meditar: ' + reflectText : ''} ${prayerText ? 'Oração: ' + prayerText : ''}`;

  const utterance = new SpeechSynthesisUtterance(fullTextToSpeak);
  utterance.lang = 'pt-PT';
  utterance.rate = ASCD.devotionalAudioRate || 1.0;

  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith('pt') || v.name.toLowerCase().includes('portuguese'));
  if (ptVoice) utterance.voice = ptVoice;

  utterance.onstart = () => {
    ASCD.devotionalAudioPlaying = true;
    updateDevotionalAudioUI(true, false);
  };
  utterance.onend = () => {
    ASCD.devotionalAudioPlaying = false;
    updateDevotionalAudioUI(false, false);
  };
  utterance.onerror = () => {
    ASCD.devotionalAudioPlaying = false;
    updateDevotionalAudioUI(false, false);
  };

  ASCD.devotionalSpeechUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  showToast('A reproduzir narração em Português...');
}

function stopDevotionalAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  ASCD.devotionalAudioPlaying = false;
  updateDevotionalAudioUI(false, false);
}

function updateDevotionalAudioUI(isPlaying, isPaused) {
  const icon = document.getElementById('devo-play-icon');
  const statusEl = document.getElementById('devo-audio-status');
  const stopBtn = document.getElementById('btn-devo-audio-stop');

  if (icon) {
    icon.textContent = isPlaying ? '⏸' : '▶';
  }
  if (statusEl) {
    if (isPlaying) {
      statusEl.textContent = 'A reproduzir narração em Português...';
    } else if (isPaused) {
      statusEl.textContent = 'Narração em pausa (toque para retomar)';
    } else {
      statusEl.textContent = 'Ouvir Devocional em Áudio';
    }
  }
  if (stopBtn) {
    stopBtn.style.display = (isPlaying || isPaused) ? 'inline-flex' : 'none';
  }
}

const BIBLE_BOOK_ALIASES = {
  'salmo': 'sl',
  'salmos': 'sl',
  'psalms': 'sl',
  'proverbios': 'pv',
  'proverbio': 'pv',
  'cantico dos canticos': 'ct',
  'canticos': 'ct',
  'cantares': 'ct',
  'genesis': 'gn',
  'exodo': 'ex',
  'levitico': 'lv',
  'numeros': 'nm',
  'deuteronomio': 'dt',
  'josue': 'js',
  'juizes': 'jz',
  'rute': 'rt',
  '1 samuel': '1sm',
  '2 samuel': '2sm',
  '1 reis': '1rs',
  '2 reis': '2rs',
  '1 cronicas': '1cr',
  '2 cronicas': '2cr',
  'esdras': 'ed',
  'neemias': 'ne',
  'ester': 'et',
  'jo': 'job',
  'eclesiastes': 'ec',
  'isaias': 'is',
  'jeremias': 'jr',
  'lamentacoes': 'lm',
  'ezequiel': 'ez',
  'daniel': 'dn',
  'oseias': 'os',
  'joel': 'jl',
  'amos': 'am',
  'obadias': 'ob',
  'jonas': 'jn',
  'miqueias': 'mq',
  'naum': 'na',
  'habacuque': 'hc',
  'sofonias': 'sf',
  'ageu': 'ag',
  'zacarias': 'zc',
  'malaquias': 'ml',
  'mateus': 'mt',
  'marcos': 'mc',
  'lucas': 'lc',
  'joao': 'jo',
  'atos': 'at',
  'romanos': 'rm',
  '1 corintios': '1co',
  '2 corintios': '2co',
  'galatas': 'gl',
  'efesios': 'ef',
  'filipenses': 'fl',
  'colossenses': 'cl',
  '1 tessalonicenses': '1ts',
  '2 tessalonicenses': '2ts',
  '1 timoteo': '1tm',
  '2 timoteo': '2tm',
  'tito': 'tt',
  'filemom': 'fm',
  'hebreus': 'hb',
  'tiago': 'tg',
  '1 pedro': '1pe',
  '2 pedro': '2pe',
  '1 joao': '1jo',
  '2 joao': '2jo',
  '3 joao': '3jo',
  'judas': 'jd',
  'apocalipse': 'ap'
};

function normalizeBibleStr(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseBibleReference(refStr) {
  if (!refStr) return null;

  let clean = refStr.trim().replace(/^[(\[]+|[)\]]+$/g, '');
  // Capturar livro (com dígito inicial 1-3 se houver) seguido de capítulo e versículos opcionais
  const m = clean.match(/^((?:[1-3]\s+)?[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+?)\s+(\d+)(?:[:,\.]\s*(\d+)(?:[–\-](\d+))?)?/i);
  if (!m) return null;

  const rawBook = m[1].trim();
  const chapter = parseInt(m[2], 10);
  const startVerse = m[3] ? parseInt(m[3], 10) : 1;
  const endVerse = m[4] ? parseInt(m[4], 10) : startVerse;

  const norm = normalizeBibleStr(rawBook);

  // 1. Procurar em BIBLE_BOOK_ALIASES
  let bookId = BIBLE_BOOK_ALIASES[norm];

  // 2. Se não achou no alias, buscar na lista global BIBLE_BOOKS
  if (!bookId && typeof BIBLE_BOOKS !== 'undefined') {
    const found = BIBLE_BOOKS.find(b => {
      const bNorm = normalizeBibleStr(b.name);
      return bNorm === norm || bNorm.startsWith(norm) || norm.startsWith(bNorm);
    });
    if (found) bookId = found.id;
  }

  // 3. Fallback: procurar livro que contenha a palavra-chave
  if (!bookId && typeof BIBLE_BOOKS !== 'undefined') {
    const found = BIBLE_BOOKS.find(b => normalizeBibleStr(b.name).includes(norm) || norm.includes(normalizeBibleStr(b.name)));
    if (found) bookId = found.id;
  }

  const bookObj = (typeof BIBLE_BOOKS !== 'undefined') ? BIBLE_BOOKS.find(b => b.id === bookId) : null;

  return {
    bookId: bookId || null,
    bookName: bookObj ? bookObj.name : rawBook,
    chapter: chapter,
    startVerse: startVerse,
    endVerse: endVerse
  };
}

async function openDevotionalInBible(refStr) {
  if (!refStr) {
    showToast('Nenhuma passagem bíblica identificada.');
    showTab('biblia');
    return;
  }

  const parsed = parseBibleReference(refStr);
  if (!parsed || !parsed.bookId) {
    showToast(`Passagem "${refStr}" aberta no Leitor Bíblico.`);
    showTab('biblia');
    return;
  }

  // 1. Alternar para a aba do Leitor Bíblico
  showTab('biblia');

  // 2. Carregar o livro e capítulo da Bíblia
  await loadBibleChapter(parsed.bookId, parsed.chapter);

  // 3. Rolar a página suavemente até ao versículo inicial e aplicar destaque visual
  setTimeout(() => {
    const targetVerseRow = document.querySelector(`.verse-row[data-verse="${parsed.startVerse}"]`);
    if (targetVerseRow) {
      targetVerseRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Destacar o intervalo de versículos da passagem devocional
    for (let v = parsed.startVerse; v <= parsed.endVerse; v++) {
      const row = document.querySelector(`.verse-row[data-verse="${v}"]`);
      if (row) {
        row.classList.add('verse-devotional-highlight');
        setTimeout(() => row.classList.remove('verse-devotional-highlight'), 6000);
      }
    }
  }, 350);

  const verseRangeText = parsed.startVerse === parsed.endVerse 
    ? `versículo ${parsed.startVerse}` 
    : `versículos ${parsed.startVerse} a ${parsed.endVerse}`;
  showToast(`Bíblia aberta em ${parsed.bookName} ${parsed.chapter} (${verseRangeText})`);
}

function writeDevotionalInJournal(devotional) {
  if (!devotional) return;
  showTab('journal');
  selectJournalDate(devotional.dateIso || ASCD.currentDevotionalDate);

  const titleInput = document.getElementById('journal-title-input');
  const verseInput = document.getElementById('journal-verse-input');
  const contentEditor = document.getElementById('journal-content-editor');

  if (titleInput && (!titleInput.value || titleInput.value.startsWith('Diário de') || titleInput.value.startsWith('Devocional:'))) {
    titleInput.value = `Devocional: ${devotional.title}`;
  }
  if (verseInput && (!verseInput.value || verseInput.value.startsWith('Provérbios') || verseInput.value.startsWith('Salmo') || verseInput.value === '')) {
    verseInput.value = `${devotional.scripture || ''} — "${devotional.keyVerseText || devotional.bibleVerse || ''}"`;
  }
  if (contentEditor && (!contentEditor.innerHTML || contentEditor.innerHTML === '<p><br></p>' || contentEditor.innerHTML.trim() === '')) {
    contentEditor.innerHTML = `
      <p><strong>📖 Leitura Bíblica:</strong> ${devotional.scripture || ''}</p>
      <blockquote style="border-left:3px solid var(--accent-gold); padding-left:12px; margin:8px 0; color:var(--text-secondary); font-style:italic;">
        "${devotional.keyVerseText || devotional.bibleVerse || ''}"
      </blockquote>
      <p><strong>💡 Para Meditar:</strong> ${devotional.reflect ? devotional.reflect.replace(/<[^>]+>/g, '') : ''}</p>
      <p><strong>Minhas Reflexões & Aplicação Pessoal:</strong></p>
      <p></p>
    `;
  }
  saveCurrentJournalEntry(false);
  showToast('Devocional carregado no Diário! Pode começar a escrever.');
}

function createStudyFromDevotional(devotional) {
  if (!devotional) return;
  const newNote = {
    id: 'note_' + Date.now(),
    title: `Estudo: ${devotional.title}`,
    category: 'Estudo Bíblico',
    date: formatDateShort(getTodayDateStr()),
    tags: ['Devocional', 'Pão Diário', (devotional.scripture ? devotional.scripture.split(' ')[0] : 'Bíblia')],
    content: `
      <h2>${devotional.title}</h2>
      <p><strong>Passagem Bíblica:</strong> ${devotional.scripture || ''}</p>
      <blockquote style="border-left:3px solid var(--accent-gold); padding-left:12px; color:var(--text-secondary); font-style:italic;">
        "${devotional.keyVerseText || devotional.bibleVerse || ''}"
      </blockquote>
      <hr style="margin:16px 0; border:none; border-top:1px solid var(--border-subtle);">
      <h3>Reflexão & Mensagem:</h3>
      ${devotional.body || ''}
      <hr style="margin:16px 0; border:none; border-top:1px solid var(--border-subtle);">
      <h3>Anotações Pessoais & Aplicação Teológica:</h3>
      <p></p>
    `,
    updatedAt: new Date().toISOString()
  };
  ASCD.notes.unshift(newNote);
  saveNotes();
  showTab('notas');
  openNoteEditor(newNote.id);
  showToast('Estudo criado com sucesso no Caderno de Estudos!');
}

function toggleDevotionalFavorite(dateIso) {
  if (!ASCD.devotionalFavorites) ASCD.devotionalFavorites = [];
  const idx = ASCD.devotionalFavorites.indexOf(dateIso);
  if (idx !== -1) {
    ASCD.devotionalFavorites.splice(idx, 1);
    showToast('Devocional removido dos favoritos.');
  } else {
    ASCD.devotionalFavorites.push(dateIso);
    showToast('Devocional guardado nos seus favoritos! ⭐');
  }
  localStorage.setItem('ascd_devotional_favs', JSON.stringify(ASCD.devotionalFavorites));
  updateDevotionalFavButton();
  renderDevotionalDrawer();
}

function updateDevotionalFavButton() {
  const btnLabel = document.getElementById('devo-fav-btn-label');
  const favCount = document.getElementById('devo-fav-count');
  const isFav = (ASCD.devotionalFavorites || []).includes(ASCD.currentDevotionalDate);

  if (btnLabel) {
    btnLabel.textContent = isFav ? '⭐ Em Favoritos (Remover)' : '⭐ Guardar nos Favoritos';
  }
  if (favCount) {
    favCount.textContent = (ASCD.devotionalFavorites || []).length;
  }
}

function copyDevotionalText(devotional) {
  if (!devotional) return;
  const text = `🍞 Nosso Pão Diário — ${devotional.date || ''}\n` +
    `📖 ${devotional.title}\n\n` +
    `📜 Leitura Bíblica: ${devotional.scripture || ''}\n` +
    (devotional.keyVerseText ? `"${devotional.keyVerseText}"\n\n` : '\n') +
    (devotional.body ? devotional.body.replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '').trim() : '') + '\n\n' +
    (devotional.reflect ? `💡 Para Meditar: ${devotional.reflect.replace(/<[^>]+>/g, '').trim()}\n\n` : '') +
    (devotional.prayer ? `🙏 Oração: ${devotional.prayer.replace(/<[^>]+>/g, '').trim()}\n\n` : '') +
    (devotional.bibleInAYear ? `🗓️ Plano Anual: ${devotional.bibleInAYear}\n\n` : '') +
    `ASCD • Bíblia & Notas`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Devocional completo copiado para a área de transferência!');
    }).catch(() => {
      showToast('Texto preparado para cópia.');
    });
  } else {
    showToast('Área de transferência não disponível.');
  }
}

function renderDevotionalDrawer() {
  const container = document.getElementById('devo-drawer-items');
  if (!container) return;

  const mode = ASCD.devotionalDrawerTab || 'recent';
  let datesToRender = [];

  if (mode === 'favs') {
    datesToRender = [...(ASCD.devotionalFavorites || [])].reverse();
    if (datesToRender.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; padding:16px; text-align:center; color:var(--text-muted); font-size:13px;">Nenhum devocional guardado nos favoritos ainda. Toque em "⭐ Guardar nos Favoritos" para salvar aqui.</div>`;
      return;
    }
  } else {
    const allDates = typeof getAvailableDevotionalDates === 'function' ? getAvailableDevotionalDates() : [];
    datesToRender = allDates.slice().reverse().slice(0, 12);
  }

  container.innerHTML = datesToRender.map(dateStr => {
    const devo = typeof getDevotionalForDate === 'function' ? getDevotionalForDate(dateStr) : null;
    const isCur = dateStr === ASCD.currentDevotionalDate;
    return `
      <div class="devo-drawer-card ${isCur ? 'active-devo' : ''}" onclick="selectDevotionalFromDrawer('${dateStr}')">
        <span class="devo-drawer-date">${formatDateShort(dateStr)}</span>
        <strong class="devo-drawer-title">${devo ? devo.title : 'Devocional'}</strong>
        <span class="devo-drawer-ref">📖 ${devo ? (devo.scripture || '') : ''}</span>
      </div>
    `;
  }).join('');
}

function selectDevotionalFromDrawer(dateStr) {
  loadDevotionalForDate(dateStr);
  const card = document.getElementById('devotional-main-card');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

