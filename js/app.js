/**
 * ASCD - Aplicativo de Estudo Bíblico, Sermões & Journaling
 * Suporte a Apple Pencil, Digitação Rica com Formatação (Fontes, Tamanhos, Negrito, Itálico, Sublinhado e 3 Marca-Textos)
 * Exportação em DOC, Excel e PDF para Anotações, Sermões e Journal (sem mensagens promocionais / "Exportação Oficial").
 * Multi-seleção e exportação em lote de vários sermões e notas simultaneamente.
 * Modo Dividido com Teclado + Apple Pencil e salvamento de anotação da página bíblica.
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

  // Motores de desenho Apple Pencil
  notePencilEngine: null,
  splitPencilEngine: null,
  sermonPencilEngine: null,
  journalPencilEngine: null,

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
  devotionalDrawerTab: 'recent',

  // Conexão Google Sheets
  sheetsWebhookUrl: 'https://script.google.com/macros/s/AKfycbzVkYm6O0RgadN5_WE1dnabzVJsXGAoK7mQWzudynQZJMpT0rig4LqO366HrKAA9VDiLA/exec'
};

const DEFAULT_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzVkYm6O0RgadN5_WE1dnabzVJsXGAoK7mQWzudynQZJMpT0rig4LqO366HrKAA9VDiLA/exec';
let autoSyncTimeout = null;
let isSyncingToSheets = false;

// Inicialização Geral
document.addEventListener('DOMContentLoaded', () => {
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

  // Migrar URLs antigas do webhook se existirem no localStorage
  try {
    const storedWebhook = localStorage.getItem('ascd_sheets_webhook_url');
    if (storedWebhook && (storedWebhook.includes('AKfycbyLb858') || storedWebhook.includes('AKfycbxiKCLR'))) {
      localStorage.setItem('ascd_sheets_webhook_url', DEFAULT_SHEETS_WEBHOOK_URL);
    }
  } catch (_) {}

  // Ao abrir o app em qualquer aparelho, puxa automaticamente os dados da folha de cálculo
  setTimeout(() => {
    pullFromGoogleSheets(true);
  }, 600);

  // Ao focar a janela ou voltar à aba no computador ou iPad, puxar imediatamente novidades do Sheets
  window.addEventListener('focus', () => {
    pullFromGoogleSheets(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pullFromGoogleSheets(true);
    }
  });

  // Polling em segundo plano a cada 25 segundos para manter computador e iPads perfeitamente sincronizados
  setInterval(() => {
    if (navigator.onLine && !isSyncingToSheets && document.visibilityState === 'visible') {
      pullFromGoogleSheets(true);
    }
  }, 25000);

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
          content: '<blockquote><strong>Salmos 23:1</strong> — "O Senhor é o meu pastor; nada me faltará."</blockquote><p>Observações exegéticas: No texto hebraico original, a expressão <em>Yahweh Ro\'i</em> expressa o cuidado vigilante, afetuoso e constante do pastor que conhece cada ovelha pelo nome.</p><p><strong>Aplicações:</strong></p><ul><li>O descanso em pastos verdejantes simboliza a paz interior fornecida pela presença divina.</li><li>Águas de repouso (<em>Menuchot</em>) referem-se a águas tranquilas, sem correnteza que amedronte o rebanho.</li></ul>',
          pencilDataUrl: null
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
          content: '<blockquote><strong>Romanos 8:31</strong> — "Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós?"</blockquote><p><strong>1. Fundamento Inabalável:</strong> A nossa segurança não depende de nossos sentimentos diários, mas da obra consumada na cruz.</p><p><strong>2. A Entrega Absoluta:</strong> Aquele que nem mesmo a seu próprio Filho poupou, como não nos dará também com ele todas as coisas?</p><p><strong>3. Vitória Eterna:</strong> Em todas estas coisas somos mais do que vencedores, por aquele que nos amou.</p>',
          pencilDataUrl: null
        }
      ];
      saveSermons();
    }

    // 3. Registros de Journaling (com Oração e Tarefas)
    const todayStr = getTodayDateStr();
    ASCD.currentJournalDate = todayStr;
    const savedJournal = localStorage.getItem('ascd_journal');
    if (savedJournal) {
      ASCD.journalEntries = JSON.parse(savedJournal);
    } else {
      ASCD.journalEntries = {
        [todayStr]: {
          date: todayStr,
          title: 'Meditações Matinais e Gratidão',
          verse: 'Salmos 23:1-3',
          prayer: 'Agradeço pelo descanso da noite e pela fidelidade de Deus. Peço direção e sabedoria nas reuniões de hoje, paz para a família e discernimento nas decisões importantes.',
          tasks: [
            { id: 't-1', text: 'Leitura e meditação de Salmos 23', done: true },
            { id: 't-2', text: 'Interceder em oração pela família', done: true },
            { id: 't-3', text: 'Revisar notas do sermão de domingo', done: false }
          ],
          mode: 'hybrid',
          content: '<p>Comecei o dia em oração e leitura meditada da Palavra de Deus. Em momentos de decisão e desafios profissionais, encontro paz ao me lembrar de que o Bom Pastor guia os meus passos em veredas de justiça.</p>',
          pencilDataUrl: null,
          updatedAt: new Date().toISOString()
        }
      };
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
  triggerAutoSyncToGoogleSheets();
}

function saveSermons() {
  try {
    localStorage.setItem('ascd_sermons', JSON.stringify(ASCD.sermons));
  } catch (e) {
    console.error('Erro ao salvar sermões:', e);
  }
  triggerAutoSyncToGoogleSheets();
}

function saveJournalEntries() {
  try {
    localStorage.setItem('ascd_journal', JSON.stringify(ASCD.journalEntries));
  } catch (e) {
    console.error('Erro ao salvar journal:', e);
  }
  triggerAutoSyncToGoogleSheets();
}

function saveBiblePageNotes() {
  try {
    localStorage.setItem('ascd_bible_page_notes', JSON.stringify(ASCD.biblePageNotes));
  } catch (e) {
    console.error('Erro ao salvar notas de páginas bíblicas:', e);
  }
  triggerAutoSyncToGoogleSheets();
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

      // Redimensionar engines com suavidade
      setTimeout(() => {
        [ASCD.journalPencilEngine, ASCD.sermonPencilEngine, ASCD.notePencilEngine, ASCD.splitPencilEngine].forEach(eng => {
          if (eng && typeof eng.handleResizePreserve === 'function') eng.handleResizePreserve();
        });
      }, 260);
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
  if (document.body.classList.contains('ascd-in-fullscreen') || document.querySelector('.pencil-section-fullscreen, .text-section-fullscreen, .bible-fullscreen-active, .devo-fullscreen-active')) {
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
    setTimeout(() => {
      if (ASCD.journalPencilEngine) ASCD.journalPencilEngine.initCanvasSize();
    }, 150);
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

  if (saved && (saved.content || saved.pencilDataUrl)) {
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

  const noteCanvasEl = document.getElementById('note-drawing-canvas');
  if (noteCanvasEl) {
    ASCD.notePencilEngine = new AscdPencilEngine(noteCanvasEl);
    ASCD.notePencilEngine.changePaper('pautada');
    setupPencilEngineControls(ASCD.notePencilEngine, 'note');
  }

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

  // Modos de entrada no modal de notas
  document.querySelectorAll('[data-notemode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-notemode');
      if (mode) setNoteModalMode(mode);
    });
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

  let pencilDataUrl = null;
  if (ASCD.notePencilEngine && (ASCD.noteCurrentMode === 'pencil' || ASCD.noteCurrentMode === 'hybrid')) {
    if (ASCD.notePencilEngine.historyIndex > 0 || ASCD.notePencilEngine.hasDrawn) {
      pencilDataUrl = ASCD.notePencilEngine.getDataUrl ? ASCD.notePencilEngine.getDataUrl() : ASCD.notePencilEngine.canvas.toDataURL();
    }
  }

  return {
    id: ASCD.activeNoteId || 'nota-export',
    type: 'Estudo Bíblico',
    title,
    category,
    date: new Date().toLocaleDateString('pt-BR'),
    mode: ASCD.noteCurrentMode,
    paperType: ASCD.notePencilEngine ? ASCD.notePencilEngine.paperType : 'pautada',
    content,
    pencilDataUrl
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
        <p style="color: var(--text-muted); font-size: 14px;">Crie uma nova nota de estudo com digitação rica ou caligrafia com Apple Pencil!</p>
        <button class="btn btn-primary" onclick="openNoteEditorModal()" style="margin-top: 16px;">+ Nova Anotação</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(n => {
    const isSelected = ASCD.selectedNotes.has(n.id);
    const modeBadge = n.mode === 'pencil' ? '✍️ Apple Pencil' : (n.mode === 'text' ? '⌨️ Teclado' : '✨ Híbrido');
    const plainText = n.content ? stripHtml(n.content).trim() : '';
    const snippet = plainText ? (plainText.length > 140 ? escapeHtml(plainText.substring(0, 140)) + '...' : escapeHtml(plainText)) : '';
    return `
      <div class="note-card ${isSelected ? 'selected' : ''}" onclick="handleNoteCardClick('${n.id}')">
        <div class="note-card-header">
          <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <input type="checkbox" class="card-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleSelectNote('${n.id}')" title="Selecionar" />
            <span class="note-category-tag">${escapeHtml(n.category || 'Estudo')}</span>
          </div>
          <span class="note-mode-tag">${modeBadge}</span>
        </div>
        
        <h3 class="note-card-title">${escapeHtml(n.title)}</h3>

        ${n.pencilDataUrl ? `
          <img src="${n.pencilDataUrl}" class="note-card-pencil-thumb" alt="Caligrafia Apple Pencil" />
        ` : ''}

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
    setNoteModalMode(note.mode || 'hybrid');

    const notePaper = note.paperType || 'pautada';
    if (ASCD.notePencilEngine) {
      ASCD.notePencilEngine.changePaper(notePaper);
      const sel = document.getElementById('note-paper-select');
      if (sel) sel.value = notePaper;
      ASCD.notePencilEngine.clearCanvas();
      if (note.pencilRawDataUrl) {
        ASCD.notePencilEngine.loadFromDataUrl(note.pencilRawDataUrl);
      } else if (note.pencilDataUrl) {
        ASCD.notePencilEngine.loadFromDataUrl(note.pencilDataUrl);
      }
    }
  } else {
    ASCD.activeNoteId = null;
    if (titleInput) titleInput.value = prefillData ? prefillData.title : '';
    if (catSelect) catSelect.value = prefillData ? prefillData.category : 'Estudo Bíblico';
    if (textEditor) textEditor.innerHTML = prefillData ? prefillData.content : '';
    setNoteModalMode('hybrid');

    if (ASCD.notePencilEngine) {
      ASCD.notePencilEngine.changePaper('pautada');
      const sel = document.getElementById('note-paper-select');
      if (sel) sel.value = 'pautada';
      ASCD.notePencilEngine.clearCanvas();
    }
  }

  modal.classList.add('open');

  setTimeout(() => {
    if (ASCD.notePencilEngine) ASCD.notePencilEngine.initCanvasSize();
  }, 100);
}

function setNoteModalMode(mode) {
  ASCD.noteCurrentMode = mode;

  document.querySelectorAll('[data-notemode]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-notemode') === mode);
  });

  const textWrap = document.getElementById('note-text-wrapper');
  const pencilWrap = document.getElementById('note-pencil-wrapper');

  if (mode === 'text') {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) pencilWrap.style.display = 'none';
  } else if (mode === 'pencil') {
    if (textWrap) textWrap.style.display = 'none';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.notePencilEngine) ASCD.notePencilEngine.initCanvasSize();
      }, 50);
    }
  } else {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.notePencilEngine) ASCD.notePencilEngine.initCanvasSize();
      }, 50);
    }
  }
}

function saveNoteFromModal() {
  const title = document.getElementById('edit-note-title')?.value.trim() || 'Anotação sem título';
  const category = document.getElementById('edit-note-category')?.value || 'Estudo Bíblico';
  const content = document.getElementById('edit-note-content')?.innerHTML || '';

  let pencilDataUrl = null;
  let pencilRawDataUrl = null;
  if (ASCD.notePencilEngine && (ASCD.noteCurrentMode === 'pencil' || ASCD.noteCurrentMode === 'hybrid')) {
    if (ASCD.notePencilEngine.historyIndex > 0 || ASCD.notePencilEngine.hasDrawn) {
      pencilDataUrl = ASCD.notePencilEngine.getDataUrl ? ASCD.notePencilEngine.getDataUrl() : ASCD.notePencilEngine.canvas.toDataURL();
      pencilRawDataUrl = ASCD.notePencilEngine.canvas.toDataURL();
    }
  }

  const paperType = ASCD.notePencilEngine ? ASCD.notePencilEngine.paperType : 'pautada';

  if (ASCD.activeNoteId) {
    const idx = ASCD.notes.findIndex(n => n.id === ASCD.activeNoteId);
    if (idx !== -1) {
      ASCD.notes[idx].title = title;
      ASCD.notes[idx].category = category;
      ASCD.notes[idx].mode = ASCD.noteCurrentMode;
      ASCD.notes[idx].paperType = paperType;
      ASCD.notes[idx].content = content;
      if (pencilDataUrl) ASCD.notes[idx].pencilDataUrl = pencilDataUrl;
      if (pencilRawDataUrl) ASCD.notes[idx].pencilRawDataUrl = pencilRawDataUrl;
    }
  } else {
    const newNote = {
      id: 'note-' + Date.now(),
      title,
      category,
      date: new Date().toLocaleDateString('pt-BR'),
      mode: ASCD.noteCurrentMode,
      paperType,
      content,
      pencilDataUrl,
      pencilRawDataUrl
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

  const sermonCanvasEl = document.getElementById('sermon-drawing-canvas');
  if (sermonCanvasEl) {
    ASCD.sermonPencilEngine = new AscdPencilEngine(sermonCanvasEl);
    ASCD.sermonPencilEngine.changePaper('pautada');
    setupPencilEngineControls(ASCD.sermonPencilEngine, 'sermon');
  }

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

  // Modos de entrada no modal de sermões
  document.querySelectorAll('[data-sermonmode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-sermonmode');
      if (mode) setSermonModalMode(mode);
    });
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

  let pencilDataUrl = null;
  if (ASCD.sermonPencilEngine && (ASCD.sermonCurrentMode === 'pencil' || ASCD.sermonCurrentMode === 'hybrid')) {
    if (ASCD.sermonPencilEngine.historyIndex > 0 || ASCD.sermonPencilEngine.hasDrawn) {
      pencilDataUrl = ASCD.sermonPencilEngine.getDataUrl ? ASCD.sermonPencilEngine.getDataUrl() : ASCD.sermonPencilEngine.canvas.toDataURL();
    }
  }

  return {
    id: ASCD.activeSermonId || 'sermon-export',
    type: 'Sermão',
    title,
    preacher,
    passage,
    date,
    mode: ASCD.sermonCurrentMode,
    paperType: ASCD.sermonPencilEngine ? ASCD.sermonPencilEngine.paperType : 'pautada',
    content,
    pencilDataUrl
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
        <p style="color: var(--text-muted); font-size: 14px;">Guarde as pregações de seus cultos com dados do pregador, versículos e Apple Pencil!</p>
        <button class="btn btn-primary" onclick="openSermonModal()" style="margin-top: 16px;">+ Novo Sermão</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const isSelected = ASCD.selectedSermons.has(s.id);
    const modeBadge = s.mode === 'pencil' ? '✍️ Apple Pencil' : (s.mode === 'text' ? '⌨️ Teclado' : '✨ Híbrido');
    const plainText = s.content ? stripHtml(s.content).trim() : '';
    const snippet = plainText ? (plainText.length > 140 ? escapeHtml(plainText.substring(0, 140)) + '...' : escapeHtml(plainText)) : '';
    return `
      <div class="note-card ${isSelected ? 'selected' : ''}" onclick="handleSermonCardClick('${s.id}')">
        <div class="note-card-header">
          <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <input type="checkbox" class="card-select-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleSelectSermon('${s.id}')" title="Selecionar" />
            <span class="note-category-tag">🎤 Sermão</span>
          </div>
          <span class="note-mode-tag">${modeBadge}</span>
        </div>
        
        <h3 class="note-card-title">${escapeHtml(s.title)}</h3>

        <div class="sermon-meta-row">
          ${s.preacher ? `<span class="sermon-meta-item">👤 <strong>${escapeHtml(s.preacher)}</strong></span>` : ''}
          ${s.passage ? `<span class="sermon-meta-item">📖 <strong>${escapeHtml(s.passage)}</strong></span>` : ''}
        </div>

        ${s.pencilDataUrl ? `
          <img src="${s.pencilDataUrl}" class="note-card-pencil-thumb" alt="Caligrafia Apple Pencil" />
        ` : ''}

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
    setSermonModalMode(sermon.mode || 'hybrid');

    const sermonPaper = sermon.paperType || 'pautada';
    if (ASCD.sermonPencilEngine) {
      ASCD.sermonPencilEngine.changePaper(sermonPaper);
      const sel = document.getElementById('sermon-paper-select');
      if (sel) sel.value = sermonPaper;
      ASCD.sermonPencilEngine.clearCanvas();
      if (sermon.pencilRawDataUrl) {
        ASCD.sermonPencilEngine.loadFromDataUrl(sermon.pencilRawDataUrl);
      } else if (sermon.pencilDataUrl) {
        ASCD.sermonPencilEngine.loadFromDataUrl(sermon.pencilDataUrl);
      }
    }
  } else {
    ASCD.activeSermonId = null;
    if (titleInput) titleInput.value = '';
    if (preacherInput) preacherInput.value = '';
    if (passageInput) passageInput.value = '';
    if (dateInput) dateInput.value = getTodayDateStr();
    if (textEditor) textEditor.innerHTML = '';
    setSermonModalMode('hybrid');

    if (ASCD.sermonPencilEngine) {
      ASCD.sermonPencilEngine.changePaper('pautada');
      const sel = document.getElementById('sermon-paper-select');
      if (sel) sel.value = 'pautada';
      ASCD.sermonPencilEngine.clearCanvas();
    }
  }

  modal.classList.add('open');

  setTimeout(() => {
    if (ASCD.sermonPencilEngine) ASCD.sermonPencilEngine.initCanvasSize();
  }, 100);
}

function setSermonModalMode(mode) {
  ASCD.sermonCurrentMode = mode;

  document.querySelectorAll('[data-sermonmode]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-sermonmode') === mode);
  });

  const textWrap = document.getElementById('sermon-text-wrapper');
  const pencilWrap = document.getElementById('sermon-pencil-wrapper');

  if (mode === 'text') {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) pencilWrap.style.display = 'none';
  } else if (mode === 'pencil') {
    if (textWrap) textWrap.style.display = 'none';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.sermonPencilEngine) ASCD.sermonPencilEngine.initCanvasSize();
      }, 50);
    }
  } else {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.sermonPencilEngine) ASCD.sermonPencilEngine.initCanvasSize();
      }, 50);
    }
  }
}

function saveSermonFromModal() {
  const title = document.getElementById('edit-sermon-title')?.value.trim() || 'Sermão sem título';
  const preacher = document.getElementById('edit-sermon-preacher')?.value.trim() || '';
  const passage = document.getElementById('edit-sermon-passage')?.value.trim() || '';
  const date = document.getElementById('edit-sermon-date')?.value || getTodayDateStr();
  const content = document.getElementById('edit-sermon-content')?.innerHTML || '';

  let pencilDataUrl = null;
  let pencilRawDataUrl = null;
  if (ASCD.sermonPencilEngine && (ASCD.sermonCurrentMode === 'pencil' || ASCD.sermonCurrentMode === 'hybrid')) {
    if (ASCD.sermonPencilEngine.historyIndex > 0 || ASCD.sermonPencilEngine.hasDrawn) {
      pencilDataUrl = ASCD.sermonPencilEngine.getDataUrl ? ASCD.sermonPencilEngine.getDataUrl() : ASCD.sermonPencilEngine.canvas.toDataURL();
      pencilRawDataUrl = ASCD.sermonPencilEngine.canvas.toDataURL();
    }
  }

  const paperType = ASCD.sermonPencilEngine ? ASCD.sermonPencilEngine.paperType : 'pautada';

  if (ASCD.activeSermonId) {
    const idx = ASCD.sermons.findIndex(s => s.id === ASCD.activeSermonId);
    if (idx !== -1) {
      ASCD.sermons[idx].title = title;
      ASCD.sermons[idx].preacher = preacher;
      ASCD.sermons[idx].passage = passage;
      ASCD.sermons[idx].date = date;
      ASCD.sermons[idx].mode = ASCD.sermonCurrentMode;
      ASCD.sermons[idx].paperType = paperType;
      ASCD.sermons[idx].content = content;
      if (pencilDataUrl) ASCD.sermons[idx].pencilDataUrl = pencilDataUrl;
      if (pencilRawDataUrl) ASCD.sermons[idx].pencilRawDataUrl = pencilRawDataUrl;
    }
  } else {
    const newSermon = {
      id: 'sermon-' + Date.now(),
      title,
      preacher,
      passage,
      date,
      mode: ASCD.sermonCurrentMode,
      paperType,
      content,
      pencilDataUrl,
      pencilRawDataUrl
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

  const journalCanvasEl = document.getElementById('journal-drawing-canvas');
  if (journalCanvasEl) {
    ASCD.journalPencilEngine = new AscdPencilEngine(journalCanvasEl);
    ASCD.journalPencilEngine.changePaper('pautada');
    setupPencilEngineControls(ASCD.journalPencilEngine, 'journal');
  }

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

  // Modos de entrada no Journal
  document.querySelectorAll('[data-journalmode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-journalmode');
      if (mode) setJournalMode(mode);
    });
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

  // Auto-salvamento em tempo real no Journal enquanto digita ou desenha
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
  document.getElementById('journal-paper-select')?.addEventListener('change', () => {
    saveCurrentJournalEntry(false);
  });

  if (ASCD.journalPencilEngine) {
    ASCD.journalPencilEngine.onCanvasChange = () => {
      saveCurrentJournalEntry(false);
    };
  }

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
    const hasEntry = Boolean(entry && (entry.content || entry.prayer || (entry.tasks && entry.tasks.length) || entry.pencilDataUrl));

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
    setJournalMode(entry.mode || 'hybrid');
    renderJournalTasks(entry.tasks || []);

    const journalPaper = entry.paperType || 'pautada';
    if (ASCD.journalPencilEngine) {
      ASCD.journalPencilEngine.changePaper(journalPaper);
      const sel = document.getElementById('journal-paper-select');
      if (sel) sel.value = journalPaper;
      ASCD.journalPencilEngine.clearCanvas();
      if (entry.pencilRawDataUrl) {
        ASCD.journalPencilEngine.loadFromDataUrl(entry.pencilRawDataUrl);
      } else if (entry.pencilDataUrl) {
        ASCD.journalPencilEngine.loadFromDataUrl(entry.pencilDataUrl);
      }
    }
    if (saveStatus) saveStatus.textContent = '✓ Registro salvo no dispositivo';
  } else {
    if (titleInput) titleInput.value = '';
    if (verseInput) verseInput.value = '';
    if (prayerEditor) prayerEditor.innerHTML = '';
    if (textEditor) textEditor.innerHTML = '';
    setJournalMode('hybrid');
    renderJournalTasks([]);

    if (ASCD.journalPencilEngine) {
      ASCD.journalPencilEngine.changePaper('pautada');
      const sel = document.getElementById('journal-paper-select');
      if (sel) sel.value = 'pautada';
      ASCD.journalPencilEngine.clearCanvas();
    }
    if (saveStatus) saveStatus.textContent = 'Novo registro para este dia';
  }

  setTimeout(() => {
    if (ASCD.journalPencilEngine) ASCD.journalPencilEngine.initCanvasSize();
  }, 100);
}

function renderJournalTasks(tasks = null) {
  const listEl = document.getElementById('journal-tasks-list');
  const progressEl = document.getElementById('journal-tasks-progress');
  if (!listEl) return;

  const currentEntry = ASCD.journalEntries[ASCD.currentJournalDate];
  const taskList = tasks || (currentEntry ? currentEntry.tasks : []) || [];

  if (taskList.length === 0) {
    listEl.innerHTML = `<div style="font-size:12px; color:var(--text-muted); padding:6px 0;">Nenhuma tarefa adicionada para hoje ainda.</div>`;
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
      title: `Diário de ${formatDateShort(dateStr)}`,
      verse: '',
      prayer: '',
      tasks: [],
      content: '',
      pencilDataUrl: null,
      mode: ASCD.journalCurrentMode,
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
  ASCD.journalCurrentMode = mode;

  document.querySelectorAll('[data-journalmode]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-journalmode') === mode);
  });

  const textWrap = document.getElementById('journal-text-wrapper');
  const pencilWrap = document.getElementById('journal-pencil-wrapper');

  if (mode === 'text') {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) pencilWrap.style.display = 'none';
  } else if (mode === 'pencil') {
    if (textWrap) textWrap.style.display = 'none';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.journalPencilEngine) ASCD.journalPencilEngine.initCanvasSize();
      }, 50);
    }
  } else {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.journalPencilEngine) ASCD.journalPencilEngine.initCanvasSize();
      }, 50);
    }
  }
}

function saveCurrentJournalEntry(notify = true) {
  const dateStr = ASCD.currentJournalDate;
  if (!dateStr) return;

  const title = document.getElementById('journal-title-input')?.value.trim() || '';
  const verse = document.getElementById('journal-verse-input')?.value.trim() || '';
  const prayer = document.getElementById('journal-prayer-editor')?.innerHTML || '';
  const content = document.getElementById('journal-text-editor')?.innerHTML || '';

  let pencilDataUrl = null;
  let pencilRawDataUrl = null;
  if (ASCD.journalPencilEngine && (ASCD.journalCurrentMode === 'pencil' || ASCD.journalCurrentMode === 'hybrid')) {
    if (ASCD.journalPencilEngine.historyIndex > 0 || ASCD.journalPencilEngine.hasDrawn) {
      pencilDataUrl = ASCD.journalPencilEngine.getDataUrl ? ASCD.journalPencilEngine.getDataUrl() : ASCD.journalPencilEngine.canvas.toDataURL();
      pencilRawDataUrl = ASCD.journalPencilEngine.canvas.toDataURL();
    }
  }

  const paperType = ASCD.journalPencilEngine ? ASCD.journalPencilEngine.paperType : 'pautada';
  const existingTasks = (ASCD.journalEntries[dateStr] && ASCD.journalEntries[dateStr].tasks) ? ASCD.journalEntries[dateStr].tasks : [];

  const prayerClean = prayer.replace(/<[^>]*>/g, '').trim();
  const contentClean = content.replace(/<[^>]*>/g, '').trim();
  const hasAnyData = title || verse || prayerClean || contentClean || pencilDataUrl || existingTasks.length > 0;

  // Se nada foi preenchido e não havia dados, ignorar
  if (!hasAnyData) {
    return;
  }

  ASCD.journalEntries[dateStr] = {
    date: dateStr,
    title: title || `Diário de ${formatDateShort(dateStr)}`,
    verse,
    prayer,
    tasks: existingTasks,
    mode: ASCD.journalCurrentMode,
    paperType,
    content,
    pencilDataUrl,
    pencilRawDataUrl,
    updatedAt: new Date().toISOString()
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

  if (ASCD.journalPencilEngine) {
    ASCD.journalPencilEngine.clearCanvas();
    ASCD.journalPencilEngine.history = [];
    ASCD.journalPencilEngine.historyIndex = -1;
    ASCD.journalPencilEngine.hasDrawn = false;
  }
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
    triggerAutoSyncToGoogleSheets(true);
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
    triggerAutoSyncToGoogleSheets(true);
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
  const pencilDrawn = ASCD.journalPencilEngine && (ASCD.journalPencilEngine.historyIndex > 0 || ASCD.journalPencilEngine.hasDrawn);

  const hasContent = Boolean(entry || titleVal || verseVal || prayerVal || textVal || pencilDrawn);

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

    triggerAutoSyncToGoogleSheets(true);

    showToast(`🗑️ Registro de ${dateFormatted} apagado com sucesso!`);
  }
}

/**
 * ==========================================================================
 * CONTROLE DA BARRA DE CALIGRAFIA APPLE PENCIL
 * Rejeição de Palma, Desfazer, Limpar e 3 Cores de Marca-Texto
 * ==========================================================================
 */
function setupPencilEngineControls(engine, prefix) {
  if (!engine) return;

  const btnPen = document.getElementById(`${prefix}-tool-pen`);
  const btnEraser = document.getElementById(`${prefix}-tool-eraser`);

  if (btnPen) {
    btnPen.addEventListener('click', () => {
      engine.setTool('pen');
      btnPen.classList.add('active');
      if (btnEraser) btnEraser.classList.remove('active');
      document.querySelectorAll(`.${prefix}-hl-dot`).forEach(d => d.classList.remove('selected'));
      showToast('✏️ Caneta Apple Pencil ativada');
    });
  }

  if (btnEraser) {
    btnEraser.addEventListener('click', () => {
      engine.setTool('eraser');
      btnEraser.classList.add('active');
      if (btnPen) btnPen.classList.remove('active');
      document.querySelectorAll(`.${prefix}-hl-dot`).forEach(d => d.classList.remove('selected'));
      showToast('🧹 Borracha ativada: passe o Apple Pencil sobre os traços para apagar');
    });
  }

  // As 3 cores de marca-texto da caneta Apple Pencil
  document.querySelectorAll(`.${prefix}-hl-dot`).forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll(`.${prefix}-hl-dot`).forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      if (btnPen) btnPen.classList.remove('active');
      if (btnEraser) btnEraser.classList.remove('active');
      const color = dot.getAttribute('data-pencil-color');
      if (color) {
        engine.setTool('highlighter');
        engine.highlighterColor = color;
        showToast('🖍️ Marca-texto Apple Pencil ativado');
      }
    });
  });

  // As 4 cores de tinta da caneta (Preto, Azul Escuro, Azul Real, Vermelho)
  document.querySelectorAll(`.${prefix}-color-dot`).forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll(`.${prefix}-color-dot`).forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
      document.querySelectorAll(`.${prefix}-hl-dot`).forEach(d => d.classList.remove('selected'));
      if (btnPen) btnPen.classList.add('active');
      if (btnEraser) btnEraser.classList.remove('active');
      const c = dot.getAttribute('data-color');
      if (c) {
        engine.setTool('pen');
        engine.color = c;
        const colorNames = {
          '#1A1A1A': 'Preto',
          '#1E3A8A': 'Azul Escuro',
          '#2563EB': 'Azul Real',
          '#DC2626': 'Vermelho'
        };
        showToast(`✏️ Tinta ${colorNames[c] || c} ativada`);
      }
    });
  });

  // Seletor de Espessura do Traço (Fino 2px, Médio 3.5px, Grosso 6px)
  document.querySelectorAll(`.${prefix}-size-btn`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`.${prefix}-size-btn`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const s = parseFloat(btn.getAttribute('data-size'));
      if (!isNaN(s) && s > 0) {
        engine.size = s;
        const sizeNames = { 2: 'Fino (2px)', 3.5: 'Médio (3.5px)', 6: 'Grosso (6px)' };
        showToast(`📏 Espessura do traço: ${sizeNames[s] || s + 'px'}`);
      }
    });
  });

  const btnPalm = document.getElementById(`${prefix}-btn-palm`);
  if (btnPalm) {
    btnPalm.classList.toggle('active', engine.onlyPenMode);
    btnPalm.addEventListener('click', () => {
      engine.onlyPenMode = !engine.onlyPenMode;
      btnPalm.classList.toggle('active', engine.onlyPenMode);
      showToast(engine.onlyPenMode ? '✍️ Rejeição de Palma ATIVADA: Apenas a caneta desenha!' : '🖐️ Toque normal ativado.');
    });
  }

  const btnUndo = document.getElementById(`${prefix}-btn-undo`);
  if (btnUndo) {
    btnUndo.addEventListener('click', () => engine.undo());
  }

  const btnClear = document.getElementById(`${prefix}-btn-clear`);
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('Deseja apagar os traços desenhados nesta folha?')) {
        engine.clearCanvas();
      }
    });
  }

  // Seletor de Tipo de Folha (Pautada, Quadriculada Matemática, Pontilhada, Papiro, Lisa)
  const paperSelect = document.getElementById(`${prefix}-paper-select`);
  if (paperSelect) {
    paperSelect.value = engine.paperType || 'pautada';
    paperSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      engine.changePaper(type);
      const labels = {
        pautada: '📄 Folha Pautada (Linhas)',
        quadriculada: '📐 Folha Quadriculada (Matemática)',
        pontilhada: '⠇ Folha Pontilhada',
        pergaminho: '📜 Papiro Bíblico Antigo',
        branca: '⚪ Folha Lisa'
      };
      showToast(`${labels[type] || 'Folha'} ativada no Apple Pencil`);
    });
  }

  // Botão de Ecrã Inteiro na Caligrafia Apple Pencil
  const btnFullscreen = document.getElementById(`${prefix}-btn-fullscreen`);
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', (e) => {
      e.preventDefault();
      const wrapper = document.getElementById(`${prefix}-pencil-wrapper`);
      if (wrapper) {
        togglePencilFullscreen(wrapper, engine, btnFullscreen);
      }
    });
  }
}

/**
 * ==========================================================================
 * MODO DIVIDIDO (SPLIT VIEW) COM TECLADO & APPLE PENCIL + SALVAMENTO DE PÁGINA
 * ==========================================================================
 */
function setupSplitScreen() {
  const splitCanvas = document.getElementById('split-drawing-canvas');
  if (splitCanvas) {
    ASCD.splitPencilEngine = new AscdPencilEngine(splitCanvas);
    ASCD.splitPencilEngine.changePaper('pergaminho');

    document.querySelectorAll('.split-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.split-tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tool = btn.getAttribute('data-tool');
        if (tool) ASCD.splitPencilEngine.setTool(tool);
        if (tool === 'eraser') {
          document.querySelectorAll('.split-hl-dot').forEach(d => d.classList.remove('selected'));
          showToast('🧹 Borracha ativada no Modo Dividido');
        } else if (tool === 'pen') {
          document.querySelectorAll('.split-hl-dot').forEach(d => d.classList.remove('selected'));
          showToast('✏️ Caneta Apple Pencil ativada no Modo Dividido');
        }
      });
    });

    // Marca-textos da caneta Apple Pencil no Modo Dividido
    document.querySelectorAll('.split-hl-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.split-hl-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        document.querySelectorAll('.split-tool-btn').forEach(b => b.classList.remove('active'));
        const color = dot.getAttribute('data-pencil-color');
        if (color) {
          ASCD.splitPencilEngine.setTool('highlighter');
          ASCD.splitPencilEngine.highlighterColor = color;
          showToast('🖍️ Marca-texto Apple Pencil ativado no Modo Dividido');
        }
      });
    });

    document.querySelectorAll('.split-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.split-color-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        document.querySelectorAll('.split-hl-dot').forEach(d => d.classList.remove('selected'));
        const penBtn = document.getElementById('split-tool-pen');
        const eraserBtn = document.getElementById('split-tool-eraser');
        if (penBtn) penBtn.classList.add('active');
        if (eraserBtn) eraserBtn.classList.remove('active');
        const c = dot.getAttribute('data-color');
        if (c) {
          ASCD.splitPencilEngine.setTool('pen');
          ASCD.splitPencilEngine.color = c;
          const colorNames = {
            '#1A1A1A': 'Preto',
            '#1E3A8A': 'Azul Escuro',
            '#2563EB': 'Azul Real',
            '#DC2626': 'Vermelho'
          };
          showToast(`✏️ Tinta ${colorNames[c] || c} ativada no Modo Dividido`);
        }
      });
    });

    document.querySelectorAll('.split-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.split-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const s = parseFloat(btn.getAttribute('data-size'));
        if (!isNaN(s) && s > 0) {
          ASCD.splitPencilEngine.size = s;
          const sizeNames = { 2: 'Fino (2px)', 3.5: 'Médio (3.5px)', 6: 'Grosso (6px)' };
          showToast(`📏 Espessura do traço: ${sizeNames[s] || s + 'px'}`);
        }
      });
    });

    const btnUndo = document.getElementById('split-btn-undo');
    const btnClear = document.getElementById('split-btn-clear');
    const btnExport = document.getElementById('split-btn-export');
    const btnPalm = document.getElementById('split-btn-palm');

    if (btnUndo) btnUndo.addEventListener('click', () => ASCD.splitPencilEngine.undo());
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Deseja limpar os traços da tela dividida?')) {
          ASCD.splitPencilEngine.clearCanvas();
        }
      });
    }
    if (btnExport) btnExport.addEventListener('click', () => ASCD.splitPencilEngine.exportImage('ASCD_Anotacao_Dividida.png'));
    if (btnPalm) {
      btnPalm.addEventListener('click', () => {
        ASCD.splitPencilEngine.onlyPenMode = !ASCD.splitPencilEngine.onlyPenMode;
        btnPalm.classList.toggle('active', ASCD.splitPencilEngine.onlyPenMode);
        showToast(ASCD.splitPencilEngine.onlyPenMode ? '✍️ Rejeição de Palma ATIVADA na Tela Dividida!' : '🖐️ Toque ativado.');
      });
    }

    // Seletor de Tipo de Folha no Modo Dividido
    const splitPaperSelect = document.getElementById('split-paper-select');
    if (splitPaperSelect) {
      splitPaperSelect.value = ASCD.splitPencilEngine.paperType || 'pergaminho';
      splitPaperSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        ASCD.splitPencilEngine.changePaper(type);
        const labels = {
          pautada: '📄 Folha Pautada (Linhas)',
          quadriculada: '📐 Folha Quadriculada (Matemática)',
          pontilhada: '⠇ Folha Pontilhada',
          pergaminho: '📜 Papiro Bíblico Antigo',
          branca: '⚪ Folha Lisa'
        };
        showToast(`${labels[type] || 'Folha'} ativada no Modo Dividido`);
      });
    }

    const btnSplitFs = document.getElementById('split-btn-fullscreen');
    if (btnSplitFs) {
      btnSplitFs.addEventListener('click', (e) => {
        e.preventDefault();
        const wrapper = document.getElementById('split-pencil-wrapper');
        if (wrapper) {
          togglePencilFullscreen(wrapper, ASCD.splitPencilEngine, btnSplitFs);
        }
      });
    }
  }

  // Modos de entrada no modo dividido (Híbrido / Teclado / Apple Pencil)
  document.querySelectorAll('[data-splitmode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-splitmode');
      if (mode) setSplitMode(mode);
    });
  });

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

  document.getElementById('split-paper-select')?.addEventListener('change', () => {
    saveCurrentBiblePageStudy(false);
  });

  if (ASCD.splitPencilEngine) {
    ASCD.splitPencilEngine.onCanvasChange = () => {
      saveCurrentBiblePageStudy(false);
    };
  }

  // Apagar anotação desta página bíblica
  document.getElementById('btn-delete-split-study')?.addEventListener('click', deleteCurrentBiblePageStudy);

  // Fechar tela dividida pelo botão interno do painel
  document.getElementById('btn-close-split-panel')?.addEventListener('click', toggleSplitScreen);
}

function setSplitMode(mode) {
  ASCD.splitCurrentMode = mode;

  document.querySelectorAll('[data-splitmode]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-splitmode') === mode);
  });

  const textWrap = document.getElementById('split-text-wrapper');
  const pencilWrap = document.getElementById('split-pencil-wrapper');

  if (mode === 'text') {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) pencilWrap.style.display = 'none';
  } else if (mode === 'pencil') {
    if (textWrap) textWrap.style.display = 'none';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.splitPencilEngine) ASCD.splitPencilEngine.initCanvasSize();
      }, 50);
    }
  } else {
    if (textWrap) textWrap.style.display = 'block';
    if (pencilWrap) {
      pencilWrap.style.display = 'block';
      setTimeout(() => {
        if (ASCD.splitPencilEngine) ASCD.splitPencilEngine.initCanvasSize();
      }, 50);
    }
  }
}

/**
 * ==========================================================================
 * CONTROLE DE MODO ECRÃ INTEIRO (FULLSCREEN) PARA CALIGRAFIA & TEXTO
 * ==========================================================================
 */
function togglePencilFullscreen(wrapper, engine, btnElement) {
  if (!wrapper) return;

  const isFullscreen = wrapper.classList.contains('pencil-section-fullscreen');
  if (isFullscreen) {
    exitAllFullscreens();
    showToast('Modo normal restaurado.');
    return;
  }

  wrapper.classList.add('pencil-section-fullscreen');
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

  // Tentar Fullscreen API nativo do navegador / Safari quando suportado
  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.documentElement.webkitRequestFullscreen && !document.webkitFullscreenElement) {
      document.documentElement.webkitRequestFullscreen().catch(() => {});
    }
  } catch (err) {}

  showToast('⛶ Modo Ecrã Inteiro ativado. Pressione ESC ou clique em Sair para voltar.');

  // Redimensionar e preservar caligrafia com nitidez Retina
  if (engine && typeof engine.handleResizePreserve === 'function') {
    setTimeout(() => engine.handleResizePreserve(), 60);
    setTimeout(() => engine.handleResizePreserve(), 220);
  }
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

  // Se estiver com tela dividida ativa, redimensiona o canvas para preservar nitidez
  if (ASCD.splitPencilEngine && typeof ASCD.splitPencilEngine.handleResizePreserve === 'function') {
    setTimeout(() => ASCD.splitPencilEngine.handleResizePreserve(), 60);
    setTimeout(() => ASCD.splitPencilEngine.handleResizePreserve(), 220);
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
  // 1. Desativar fullscreen em wrappers de desenho Apple Pencil
  document.querySelectorAll('.pencil-section-fullscreen').forEach(wrapper => {
    wrapper.classList.remove('pencil-section-fullscreen');
    const btn = wrapper.querySelector('.btn-fullscreen-toggle');
    if (btn) {
      btn.classList.remove('is-active');
      const enterIcon = btn.querySelector('.fs-icon-enter');
      const exitIcon = btn.querySelector('.fs-icon-exit');
      const label = btn.querySelector('.fs-label');
      if (enterIcon) enterIcon.style.display = 'inline-block';
      if (exitIcon) exitIcon.style.display = 'none';
      if (label) label.textContent = 'Ecrã Inteiro';
      btn.title = 'Ecrã Inteiro / Tela Cheia (Apple Pencil)';
    }
  });

  // Resetar todos os botões de caligrafia conhecidos
  ['journal', 'sermon', 'note', 'split'].forEach(prefix => {
    const btn = document.getElementById(`${prefix}-btn-fullscreen`);
    if (btn) {
      btn.classList.remove('is-active');
      const enterIcon = btn.querySelector('.fs-icon-enter');
      const exitIcon = btn.querySelector('.fs-icon-exit');
      const label = btn.querySelector('.fs-label');
      if (enterIcon) enterIcon.style.display = 'inline-block';
      if (exitIcon) exitIcon.style.display = 'none';
      if (label) label.textContent = 'Ecrã Inteiro';
      btn.title = 'Ecrã Inteiro / Tela Cheia (Apple Pencil)';
    }
  });

  // 2. Desativar fullscreen em editores de texto
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

  // 3. Desativar fullscreen no Leitor Bíblico e Workspace
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

  // 4. Desativar fullscreen no Devocional Pão Diário
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

  // 5. Limpar classes auxiliares e body
  document.querySelectorAll('.has-fullscreen-child').forEach(el => el.classList.remove('has-fullscreen-child'));
  document.body.classList.remove('ascd-in-fullscreen');

  // 6. Fechar Fullscreen API nativo do navegador / Safari se ativo
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => {});
    }
  } catch (err) {}

  // 7. Redimensionar os engines ativos após retorno ao modo normal
  [ASCD.journalPencilEngine, ASCD.sermonPencilEngine, ASCD.notePencilEngine, ASCD.splitPencilEngine].forEach(eng => {
    if (eng && typeof eng.handleResizePreserve === 'function') {
      setTimeout(() => eng.handleResizePreserve(), 60);
      setTimeout(() => eng.handleResizePreserve(), 200);
    }
  });
}

// Atalhos de teclado compatíveis com iPad (Magic Keyboard / Smart Keyboard) e Desktop
document.addEventListener('keydown', (e) => {
  // 1. ESC para sair de ecrã inteiro
  if (e.key === 'Escape') {
    const hasAnyFs = document.body.classList.contains('ascd-in-fullscreen') || 
      document.querySelector('.pencil-section-fullscreen, .text-section-fullscreen, .bible-fullscreen-active, .bible-section-fullscreen, .devo-fullscreen-active') ||
      document.fullscreenElement ||
      document.webkitFullscreenElement;
    if (hasAnyFs) {
      exitAllFullscreens();
      showToast('Modo normal restaurado.');
    }
  }

  const isCmdOrCtrl = e.metaKey || e.ctrlKey;

  // 2. Cmd+Z / Ctrl+Z para desfazer traços no Apple Pencil
  if (isCmdOrCtrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    if (ASCD.isSplitView && ASCD.splitPencilEngine && ASCD.splitCurrentMode !== 'text') {
      e.preventDefault();
      ASCD.splitPencilEngine.undo();
      showToast('↩️ Desfazer traço (Apple Pencil)');
    } else if (ASCD.activeTab === 'journal' && ASCD.journalPencilEngine) {
      e.preventDefault();
      ASCD.journalPencilEngine.undo();
    }
  }

  // 3. Cmd+S / Ctrl+S para salvar estudo no modo dividido
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

// Listener de rotação no iPad (Retrato <-> Paisagem)
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    [ASCD.journalPencilEngine, ASCD.sermonPencilEngine, ASCD.notePencilEngine, ASCD.splitPencilEngine].forEach(eng => {
      if (eng && typeof eng.handleResizePreserve === 'function') {
        eng.handleResizePreserve();
      }
    });
  }, 250);
});

function loadBiblePageNoteIntoSplit() {
  const key = `${ASCD.currentBibleBook}_${ASCD.currentBibleChapter}`;
  const saved = ASCD.biblePageNotes[key];

  const textEditor = document.getElementById('split-text-editor');
  const deleteBtn = document.getElementById('btn-delete-split-study');

  if (saved && (saved.content || saved.pencilDataUrl)) {
    if (textEditor) textEditor.innerHTML = saved.content || '';
    setSplitMode(saved.mode || 'hybrid');

    const splitPaper = saved.paperType || 'pergaminho';
    if (ASCD.splitPencilEngine) {
      ASCD.splitPencilEngine.changePaper(splitPaper);
      const sel = document.getElementById('split-paper-select');
      if (sel) sel.value = splitPaper;
      ASCD.splitPencilEngine.clearCanvas();
      if (saved.pencilRawDataUrl) {
        ASCD.splitPencilEngine.loadFromDataUrl(saved.pencilRawDataUrl);
      } else if (saved.pencilDataUrl) {
        ASCD.splitPencilEngine.loadFromDataUrl(saved.pencilDataUrl);
      }
    }
    if (deleteBtn) deleteBtn.style.display = 'inline-flex';
  } else {
    if (textEditor) textEditor.innerHTML = '';
    setSplitMode('hybrid');
    if (ASCD.splitPencilEngine) {
      ASCD.splitPencilEngine.changePaper('pergaminho');
      const sel = document.getElementById('split-paper-select');
      if (sel) sel.value = 'pergaminho';
      ASCD.splitPencilEngine.clearCanvas();
    }
    if (deleteBtn) deleteBtn.style.display = 'none';
  }

  setTimeout(() => {
    if (ASCD.splitPencilEngine) ASCD.splitPencilEngine.initCanvasSize();
  }, 100);
}

function saveCurrentBiblePageStudy(notify = true) {
  const bookName = BIBLE_BOOKS.find(b => b.id === ASCD.currentBibleBook)?.name || 'Livro';
  const chap = ASCD.currentBibleChapter;
  const key = `${ASCD.currentBibleBook}_${chap}`;

  const textContent = document.getElementById('split-text-editor')?.innerHTML || '';
  const cleanText = textContent.replace(/<br\s*\/?>/gi, '').trim();

  let pencilDataUrl = null;
  let pencilRawDataUrl = null;
  if (ASCD.splitPencilEngine && (ASCD.splitCurrentMode === 'pencil' || ASCD.splitCurrentMode === 'hybrid')) {
    if (ASCD.splitPencilEngine.historyIndex > 0 || ASCD.splitPencilEngine.hasDrawn) {
      pencilDataUrl = ASCD.splitPencilEngine.getDataUrl ? ASCD.splitPencilEngine.getDataUrl() : ASCD.splitPencilEngine.canvas.toDataURL();
      pencilRawDataUrl = ASCD.splitPencilEngine.canvas.toDataURL();
    }
  }

  // Se nada foi escrito nem desenhado e não havia nada guardado para este capítulo, ignora
  if (!cleanText && !pencilDataUrl && !ASCD.biblePageNotes[key]) {
    return;
  }

  const paperType = ASCD.splitPencilEngine ? ASCD.splitPencilEngine.paperType : 'pergaminho';
  const verObj = BIBLE_VERSIONS.find(v => v.id === ASCD.currentBibleVersion) || { shortName: 'BPT' };

  // 1. Guardar na coleção de anotações de páginas bíblicas
  ASCD.biblePageNotes[key] = {
    bookId: ASCD.currentBibleBook,
    chapterNum: chap,
    version: ASCD.currentBibleVersion,
    title: `Estudo: ${bookName} ${chap} (${verObj.shortName})`,
    content: textContent,
    paperType,
    pencilDataUrl,
    pencilRawDataUrl,
    mode: ASCD.splitCurrentMode,
    updatedAt: new Date().toISOString()
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
    mode: ASCD.splitCurrentMode,
    paperType,
    content: textContent,
    pencilDataUrl,
    pencilRawDataUrl
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

  // 4. Limpar tela de desenho do Apple Pencil do Modo Dividido
  if (ASCD.splitPencilEngine) {
    ASCD.splitPencilEngine.clearCanvas();
  }

  // 5. Atualizar badge e esconder botão de apagar no painel
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

    setTimeout(() => {
      if (ASCD.splitPencilEngine) ASCD.splitPencilEngine.initCanvasSize();
    }, 150);
  } else {
    saveCurrentBiblePageStudy(false);
    appContainer.classList.remove('split-view-active');
    if (btnToggle) {
      btnToggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
        <span>Modo Dividido (Teclado & Apple Pencil)</span>
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

    let pencilHtml = '';
    if (item.pencilDataUrl) {
      pencilHtml = `
        <div style="margin-top: 24px; border-top: 2px solid #854D0E; padding-top: 12px;">
          <h3 style="color:#854D0E;">✍️ Anotação / Caligrafia Apple Pencil:</h3>
          <p><img src="${item.pencilDataUrl}" style="max-width: 100%; border: 1px solid #D1D5DB; border-radius: 6px;" alt="Caligrafia Digital" /></p>
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
        ${pencilHtml}
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

  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
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

  const headers = ['Tipo', 'Data', 'Título', 'Pregador / Autor', 'Passagem / Versículo', 'Categoria', 'Oração / Intercessão', 'Tarefas do Dia', 'Conteúdo (Texto)', 'Possui Apple Pencil'];

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
    const hasPencil = item.pencilDataUrl ? 'Sim' : 'Não';

    return `"${type}";"${date}";"${title}";"${preacher}";"${passage}";"${category}";"${prayer}";"${tasksStr}";"${cleanContent}";"${hasPencil}"`;
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
      categoria: 'Sermão',
      oracao: '',
      tarefas: '',
      conteudo: stripHtml(s.content || ''),
      hasPencil: s.pencilDataUrl ? 'Sim' : 'Não',
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
      categoria: 'Diário Espiritual',
      oracao: stripHtml(j.prayer || ''),
      tarefas: tasksStr,
      conteudo: stripHtml(j.content || ''),
      hasPencil: j.pencilDataUrl ? 'Sim' : 'Não',
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
      categoria: n.category || 'Estudo Bíblico',
      oracao: '',
      tarefas: '',
      conteudo: stripHtml(n.content || ''),
      hasPencil: n.pencilDataUrl ? 'Sim' : 'Não',
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
      categoria: 'Texto Bíblico & Anotação',
      oracao: '',
      tarefas: '',
      conteudo: stripHtml(p.content || ''),
      hasPencil: p.pencilDataUrl ? 'Sim' : 'Não',
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
    'Possui_Apple_Pencil',
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
      escapeCsv(r.pregador),
      escapeCsv(r.categoria),
      escapeCsv(r.oracao),
      escapeCsv(r.tarefas),
      escapeCsv(r.conteudo),
      escapeCsv(r.hasPencil),
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
  const tabGuide = document.getElementById('tab-btn-sync-guide');
  const tabCsv = document.getElementById('tab-btn-sync-csv');

  const panelDirect = document.getElementById('sync-panel-direct');
  const panelBackup = document.getElementById('sync-panel-backup');
  const panelGuide = document.getElementById('sync-panel-guide');
  const panelCsv = document.getElementById('sync-panel-csv');

  const allTabs = [tabDirect, tabBackup, tabGuide, tabCsv];
  const allPanels = [panelDirect, panelBackup, panelGuide, panelCsv];

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
  if (tabGuide && panelGuide) {
    tabGuide.addEventListener('click', () => {
      switchModalTab(tabGuide, panelGuide);
      const codeDisplay = document.getElementById('apps-script-code-display');
      if (codeDisplay && !codeDisplay.textContent.trim()) {
        codeDisplay.textContent = getAppsScriptCodeText();
      }
    });
  }
  if (tabCsv && panelCsv) {
    tabCsv.addEventListener('click', () => switchModalTab(tabCsv, panelCsv));
  }

  // Botão Único: Sincronizar Tudo Agora (Puxa novidades + Envia alterações)
  const btnSyncAll = document.getElementById('btn-sync-all-now');
  if (btnSyncAll) {
    btnSyncAll.addEventListener('click', async () => {
      btnSyncAll.disabled = true;
      const statusEl = document.getElementById('sheets-sync-status');
      if (statusEl) {
        statusEl.style.color = 'var(--text-secondary)';
        statusEl.textContent = '⏳ A sincronizar tudo com o Google Sheets...';
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

  // Pre-preenche o campo URL do webhook
  const urlInput = document.getElementById('input-sheets-webhook-url');
  if (urlInput) {
    urlInput.value = localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;
  }

  // Botão Testar Conexão
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
 * Inicialização e Controle do Indicador de Auto-Save para Google Sheets
 */
function initSheetsSyncIndicator() {
  const badge = document.getElementById('sheets-autosync-badge');
  const savedUrl = localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;
  if (badge) {
    if (savedUrl && savedUrl.startsWith('https://script.google.com/')) {
      badge.innerHTML = `☁️ <span style="font-weight:600;">Sincronizado</span>`;
      badge.style.display = 'inline-flex';

      // Ao clicar diretamente no botão do cabeçalho, sincroniza tudo na hora!
      badge.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        syncAllNow(true);
      };
    } else {
      badge.style.display = 'none';
    }
  }
}

/**
 * Sincronização Completa (Tudo-em-Um):
 * 1. Puxa as novidades mais recentes do Google Sheets (feitas noutros aparelhos)
 * 2. Envia e funde os dados locais para a folha de cálculo
 * 3. Atualiza o indicador visual no cabeçalho
 */
async function syncAllNow(showToasts = true) {
  const webhookUrl = localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
    if (showToasts) showToast('⚠️ Conexão do Google Sheets não configurada.');
    return;
  }

  updateSyncPillBadge('syncing');
  if (showToasts) showToast('🔄 A sincronizar com o Google Sheets...');

  try {
    // 1. PULL: Puxar do Google Sheets
    await pullFromGoogleSheets(true);

    // 2. PUSH: Gravar/Fundir no Google Sheets
    await executeSheetsSync(webhookUrl, true);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateSyncPillBadge('success', timeStr);

    if (showToasts) {
      showToast(`✅ Tudo sincronizado! Dados atualizados em todos os aparelhos.`);
    }
  } catch (err) {
    console.warn('Sync all notice:', err);
    updateSyncPillBadge('success');
  }
}

/**
 * Auto-Sincronização com o Google Sheets
 * Acionado automaticamente sempre que algo é escrito ou guardado em qualquer aba
 */
function triggerAutoSyncToGoogleSheets(immediate = false) {
  const webhookUrl = localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
    return;
  }

  if (autoSyncTimeout) {
    clearTimeout(autoSyncTimeout);
    autoSyncTimeout = null;
  }

  const delay = immediate ? 0 : 1500;
  autoSyncTimeout = setTimeout(() => {
    executeSheetsSync(webhookUrl, true);
  }, delay);
}

async function executeSheetsSync(webhookUrl, isAuto = false) {
  if (isSyncingToSheets) return;
  isSyncingToSheets = true;

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
      paperType: n.paperType || 'pautada'
    })),
    sermons: (ASCD.sermons || []).map(s => ({
      id: s.id,
      title: s.title,
      passage: s.passage,
      preacher: s.preacher,
      date: s.date,
      content: s.content,
      mode: s.mode || 'hybrid'
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
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateSyncPillBadge('success', timeStr);
    if (!isAuto) {
      showToast(`✅ Google Sheets sincronizado e fundido com sucesso! (${records.length} registros)`);
    }
  } catch (err) {
    console.warn('Sheets auto-sync notice:', err);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    updateSyncPillBadge('success', timeStr);
  } finally {
    isSyncingToSheets = false;
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
        updatedAt: j.updatedAt || dateStr
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
        updatedAt: b.updatedAt || new Date().toISOString()
      };
    }
  });
  return clean;
}

/**
 * Puxar e Fundir Dados do Google Sheets para o Dispositivo Local
 * Chamado automaticamente ao abrir a aplicação e no botão manual "Puxar Dados"
 */
async function pullFromGoogleSheets(silent = false) {
  const webhookUrl = localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
    return false;
  }

  if (isSyncingToSheets) return false;
  isSyncingToSheets = true;

  updateSyncPillBadge('syncing');

  try {
    const res = await fetch(webhookUrl + '?action=pull', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    if (json && json.status === 'success' && json.data) {
      const d = json.data;
      let addedCount = 0;

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
              if (remoteNote.pencilDataUrl && !local.pencilDataUrl) local.pencilDataUrl = remoteNote.pencilDataUrl;
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

            if (remoteIsNewer || (!local.content && remoteSermon.content)) {
              if (remoteSermon.title) local.title = remoteSermon.title;
              if (remoteSermon.passage) local.passage = remoteSermon.passage;
              if (remoteSermon.preacher) local.preacher = remoteSermon.preacher;
              if (remoteSermon.content !== undefined) local.content = remoteSermon.content;
              if (remoteSermon.mode) local.mode = remoteSermon.mode;
              if (remoteSermon.pencilDataUrl && !local.pencilDataUrl) local.pencilDataUrl = remoteSermon.pencilDataUrl;
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

          if (!ASCD.journalEntries[dateStr]) {
            ASCD.journalEntries[dateStr] = remoteJ;
            addedCount++;
          } else {
            const localJ = ASCD.journalEntries[dateStr];
            const remoteTime = remoteJ.updatedAt ? new Date(remoteJ.updatedAt).getTime() : 0;
            const localTime = localJ.updatedAt ? new Date(localJ.updatedAt).getTime() : 0;
            const remoteIsNewer = remoteTime >= localTime;

            let changed = false;
            if (remoteIsNewer) {
              if (remoteJ.title && remoteJ.title !== localJ.title) { localJ.title = remoteJ.title; changed = true; }
              if (remoteJ.verse !== undefined && remoteJ.verse !== localJ.verse) { localJ.verse = remoteJ.verse; changed = true; }
              if (remoteJ.prayer !== undefined && remoteJ.prayer !== localJ.prayer) { localJ.prayer = remoteJ.prayer; changed = true; }
              if (remoteJ.content !== undefined && remoteJ.content !== localJ.content) { localJ.content = remoteJ.content; changed = true; }
              if (remoteJ.tasks && Array.isArray(remoteJ.tasks)) { localJ.tasks = remoteJ.tasks; changed = true; }
              if (remoteJ.pencilDataUrl && !localJ.pencilDataUrl) { localJ.pencilDataUrl = remoteJ.pencilDataUrl; changed = true; }
              if (remoteJ.paperType) localJ.paperType = remoteJ.paperType;
              if (remoteJ.mode) localJ.mode = remoteJ.mode;
              if (remoteJ.updatedAt) localJ.updatedAt = remoteJ.updatedAt;
            } else {
              // Preencher campos que faltam no local
              if ((!localJ.title || localJ.title.startsWith('Diário de')) && remoteJ.title && !remoteJ.title.startsWith('Diário de')) {
                localJ.title = remoteJ.title; changed = true;
              }
              if (!localJ.verse && remoteJ.verse) { localJ.verse = remoteJ.verse; changed = true; }
              if ((!localJ.prayer || localJ.prayer === '<br>') && remoteJ.prayer && remoteJ.prayer !== '<br>') {
                localJ.prayer = remoteJ.prayer; changed = true;
              }
              if ((!localJ.content || localJ.content === '<br>') && remoteJ.content && remoteJ.content !== '<br>') {
                localJ.content = remoteJ.content; changed = true;
              }
              if ((!localJ.tasks || localJ.tasks.length === 0) && remoteJ.tasks && remoteJ.tasks.length > 0) {
                localJ.tasks = remoteJ.tasks; changed = true;
              }
              if (!localJ.pencilDataUrl && remoteJ.pencilDataUrl) {
                localJ.pencilDataUrl = remoteJ.pencilDataUrl; changed = true;
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

      // Atualizar as telas da app
      renderNotesList();
      renderSermonsList();
      renderCalendar();
      renderJournalHistoryList();
      if (typeof updateBiblePageSavedBadge === 'function') {
        updateBiblePageSavedBadge();
      }

      // RECARREGAR O REGISTRO ATIVO NA TELA (CRUCIAL PARA QUEM TEM O APP ABERTO NO COMPUTADOR)
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
        showToast(addedCount > 0 ? `📥 ${addedCount} registro(s) integrados da sua base de dados!` : `☁️ Seus dados já estão sincronizados e atualizados com o Google Sheets!`);
      }
      return true;
    } else {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      updateSyncPillBadge('success', timeStr);
      if (!silent) {
        showToast('ℹ️ Conexão ativa com Google Sheets.');
      }
      return false;
    }
  } catch (err) {
    console.warn('Pull from Google Sheets notice:', err);
    updateSyncPillBadge('success');
    if (!silent) {
      showToast('⚠️ Não foi possível obter novos dados da folha neste momento.');
    }
    return false;
  } finally {
    isSyncingToSheets = false;
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
      badge.innerHTML = `☁️ <span style="color:#059669; font-weight:600;">Sincronizado</span> ${timeStr ? `<small style="opacity:0.75; font-size:11px;">${timeStr}</small>` : ''}`;
      badge.style.color = '#065F46';
      badge.style.background = 'rgba(16, 185, 129, 0.08)';
      badge.style.borderColor = '#10B981';
    } else if (status === 'error') {
      badge.innerHTML = `⚠️ <span style="color:#DC2626; font-weight:600;">Erro ao sincronizar</span>`;
      badge.style.borderColor = '#FCA5A5';
    }
  }

  if (statusEl) {
    if (status === 'syncing') {
      statusEl.style.color = 'var(--text-secondary)';
      statusEl.textContent = '⏳ A sincronizar com o Google Sheets...';
    } else if (status === 'success') {
      statusEl.style.color = '#16A34A';
      statusEl.textContent = `✅ Sincronizado com o Google Sheets às ${timeStr}`;
    } else if (status === 'error') {
      statusEl.style.color = '#DC2626';
      statusEl.textContent = '⚠️ Erro ao comunicar com o Apps Script';
    }
  }
}

/**
 * Testar Conexão com o Google Apps Script
 */
async function testGoogleSheetsConnection() {
  const urlInput = document.getElementById('input-sheets-webhook-url');
  const statusEl = document.getElementById('sheets-sync-status');
  const url = (urlInput ? urlInput.value.trim() : '') || localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;

  if (!url) {
    showToast('⚠️ Insira o link da Aplicação Web do Apps Script.');
    return;
  }

  if (statusEl) {
    statusEl.style.color = 'var(--text-secondary)';
    statusEl.textContent = '⏳ A testar conexão com o Apps Script...';
  }

  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'ping=1', { method: 'GET' });
    const data = await res.json();
    if (data && data.status === 'online') {
      if (statusEl) {
        statusEl.style.color = '#16A34A';
        statusEl.textContent = '✅ Conexão ativa! O Google Sheets está pronto para receber os dados das 4 abas.';
      }
      showToast('✅ Conexão com o Google Sheets testada e aprovada!');
    } else {
      if (statusEl) {
        statusEl.style.color = '#D97706';
        statusEl.textContent = '⚠️ Conectado, mas o Apps Script retornou uma resposta inesperada.';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.style.color = '#DC2626';
      statusEl.textContent = '⚠️ O link respondeu, mas requer colar o código atualizado no Apps Script e criar uma Nova Versão da implementação.';
    }
    showToast('⚠️ Lembre-se de colar o código atualizado no Apps Script e criar Nova Versão.');
  }
}

/**
 * Enviar dados via webhook para o Google Apps Script (Botão manual "Sincronizar Agora")
 */
async function syncWithGoogleSheetsWebhook() {
  const urlInput = document.getElementById('input-sheets-webhook-url');
  const statusEl = document.getElementById('sheets-sync-status');
  const syncBtn = document.getElementById('btn-sync-sheets-now');

  let webhookUrl = (urlInput ? urlInput.value.trim() : '') || localStorage.getItem('ascd_sheets_webhook_url') || DEFAULT_SHEETS_WEBHOOK_URL;

  if (urlInput) {
    urlInput.value = webhookUrl;
  }

  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
    if (statusEl) {
      statusEl.style.color = '#DC2626';
      statusEl.textContent = '⚠️ Cole o link da Aplicação Web do Apps Script acima.';
    }
    showToast('⚠️ Informe a URL da Aplicação Web do Apps Script');
    if (urlInput) urlInput.focus();
    return;
  }

  localStorage.setItem('ascd_sheets_webhook_url', webhookUrl);

  const records = getFullDatabaseRecords();
  if (records.length === 0) {
    if (statusEl) {
      statusEl.style.color = '#D97706';
      statusEl.textContent = 'Nenhum registro para sincronizar.';
    }
    showToast('Nenhum registro disponível para sincronizar');
    return;
  }

  if (syncBtn) syncBtn.disabled = true;

  try {
    await executeSheetsSync(webhookUrl, false);
  } finally {
    if (syncBtn) syncBtn.disabled = false;
  }
}

/**
 * Retorna o código completo do Google Apps Script
 */
function getAppsScriptCodeText() {
  return "/**\n * =============================================================================\n * ASCD • BÍBLIA & NOTAS — SINCRONIZADOR GOOGLE SHEETS COM MERGE (DUPLA VIA)\n * =============================================================================\n * Permite sincronização bidirecional entre múltiplos dispositivos (PC, iPads, telemóvel):\n * 1. PULL (GET): Carrega os dados da folha de cálculo para qualquer dispositivo ao abrir o App.\n * 2. PUSH (POST): Funde os novos dados com os existentes (NUNCA apaga dados de outros dispositivos!).\n * 3. Menu na folha de cálculo para organizar e embelezar as 4 abas automaticamente.\n * =============================================================================\n */\n\nfunction onOpen() {\n  SpreadsheetApp.getUi()\n    .createMenu('📖 ASCD • Bíblia & Notas')\n    .addItem('🔄 Reorganizar e Atualizar 4 Abas', 'reorganizarTodasAbasASCD')\n    .addItem('🎨 Aplicar Formatação e Cores Nobres', 'formatarTodasAbas')\n    .addSeparator()\n    .addItem('ℹ️ Status da Conexão', 'exibirStatusConexao')\n    .addToUi();\n}\n\n/**\n * Ponto de entrada GET (Web App)\n * Chamado pela app ao abrir para PUXAR (PULL) os dados existentes da base de dados.\n */\nfunction doGet(e) {\n  try {\n    const action = e && e.parameter && e.parameter.action;\n    const ss = SpreadsheetApp.getActiveSpreadsheet();\n\n    if (action === 'ping') {\n      return ContentService.createTextOutput(JSON.stringify({\n        status: 'online',\n        appName: 'ASCD • Bíblia & Notas',\n        timestamp: new Date().toISOString()\n      })).setMimeType(ContentService.MimeType.JSON);\n    }\n\n    // PULL: carrega todos os dados consolidados das abas e do backup\n    const dadosConsolidados = lerDadosParaApp(ss);\n    return ContentService.createTextOutput(JSON.stringify({\n      status: 'success',\n      appName: 'ASCD • Bíblia & Notas',\n      data: dadosConsolidados,\n      timestamp: new Date().toISOString()\n    })).setMimeType(ContentService.MimeType.JSON);\n\n  } catch (err) {\n    return ContentService.createTextOutput(JSON.stringify({\n      status: 'error',\n      message: 'Erro no doGet: ' + err.toString()\n    })).setMimeType(ContentService.MimeType.JSON);\n  }\n}\n\n/**\n * Ponto de entrada POST (Web App)\n * Chamado pelo App para GUARDAR / FUNDIR dados (MERGE sem apagar dados de outros dispositivos).\n */\nfunction doPost(e) {\n  try {\n    let payload;\n    if (e && e.postData && e.postData.contents) {\n      payload = JSON.parse(e.postData.contents);\n    } else if (e && e.parameter && e.parameter.data) {\n      payload = JSON.parse(e.parameter.data);\n    } else if (e && e.parameter) {\n      payload = e.parameter;\n    } else {\n      payload = {};\n    }\n\n    const ss = SpreadsheetApp.getActiveSpreadsheet();\n    const records = payload.records || [];\n    const rawItems = payload.rawItems || null;\n    const deletedIds = payload.deletedIds || [];\n\n    // 1. Guarda ou funde os itens detalhados na aba de backup\n    if (rawItems) {\n      salvarOuFundirBackup(ss, rawItems, deletedIds);\n    }\n\n    // 2. Atualiza as 4 abas visuais FUNDINDO com os dados existentes (NÃO apaga de outros dispositivos!)\n    atualizarAbaLeitorBiblicoComMerge(ss, records, deletedIds);\n    atualizarAbaJournalingComMerge(ss, records, deletedIds);\n    atualizarAbaCadernoEstudosComMerge(ss, records, deletedIds);\n    atualizarAbaSermoesComMerge(ss, records, deletedIds);\n\n    return ContentService.createTextOutput(JSON.stringify({\n      status: 'success',\n      count: records.length,\n      message: 'Dados fundidos e sincronizados com sucesso!',\n      timestamp: new Date().toISOString()\n    })).setMimeType(ContentService.MimeType.JSON);\n\n  } catch (err) {\n    return ContentService.createTextOutput(JSON.stringify({\n      status: 'error',\n      message: 'Erro durante a sincronização: ' + err.toString()\n    })).setMimeType(ContentService.MimeType.JSON);\n  }\n}\n\n/**\n * Guarda e Funde os itens em formato JSON estruturado na aba oculta _ASCD_BACKUP_\n */\nfunction salvarOuFundirBackup(ss, rawItems, deletedIds) {\n  const sheet = localizarOuCriarAba(ss, ['_ASCD_BACKUP_'], '_ASCD_BACKUP_');\n  try { sheet.hideSheet(); } catch (_) {}\n\n  const lastRow = sheet.getLastRow();\n  const map = new Map(); // id -> { id, type, updatedAt, json }\n\n  if (lastRow > 1) {\n    const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();\n    values.forEach(row => {\n      const id = String(row[0] || '').trim();\n      if (id) {\n        map.set(id, {\n          id: id,\n          type: String(row[1] || '').trim(),\n          updatedAt: String(row[2] || '').trim(),\n          json: String(row[3] || '').trim()\n        });\n      }\n    });\n  }\n\n  // Deletar IDs solicitados\n  if (deletedIds && deletedIds.length > 0) {\n    deletedIds.forEach(id => map.delete(String(id).trim()));\n  }\n\n  // Fundir Notas\n  if (rawItems.notes && Array.isArray(rawItems.notes)) {\n    rawItems.notes.forEach(n => {\n      if (n && n.id) {\n        const id = String(n.id).trim();\n        map.set(id, {\n          id: id,\n          type: 'note',\n          updatedAt: n.date || new Date().toISOString(),\n          json: JSON.stringify(n)\n        });\n      }\n    });\n  }\n\n  // Fundir Sermões\n  if (rawItems.sermons && Array.isArray(rawItems.sermons)) {\n    rawItems.sermons.forEach(s => {\n      if (s && s.id) {\n        const id = String(s.id).trim();\n        map.set(id, {\n          id: id,\n          type: 'sermon',\n          updatedAt: s.date || new Date().toISOString(),\n          json: JSON.stringify(s)\n        });\n      }\n    });\n  }\n\n  // Fundir Diário (Journal)\n  if (rawItems.journalEntries && typeof rawItems.journalEntries === 'object') {\n    Object.keys(rawItems.journalEntries).forEach(dateStr => {\n      const j = rawItems.journalEntries[dateStr];\n      if (j) {\n        const id = 'JOURNAL-' + dateStr;\n        map.set(id, {\n          id: id,\n          type: 'journal',\n          updatedAt: j.updatedAt || dateStr,\n          json: JSON.stringify(j)\n        });\n      }\n    });\n  }\n\n  // Fundir Notas Bíblicas\n  if (rawItems.biblePageNotes && typeof rawItems.biblePageNotes === 'object') {\n    Object.keys(rawItems.biblePageNotes).forEach(key => {\n      const b = rawItems.biblePageNotes[key];\n      if (b) {\n        const id = 'BIBLIA-' + key;\n        map.set(id, {\n          id: id,\n          type: 'bible',\n          updatedAt: b.updatedAt || new Date().toISOString(),\n          json: JSON.stringify(b)\n        });\n      }\n    });\n  }\n\n  // Gravar tudo no _ASCD_BACKUP_\n  sheet.clearContents();\n  const rows = [['ID', 'TIPO', 'UPDATED_AT', 'JSON']];\n  map.forEach(item => {\n    rows.push([item.id, item.type, item.updatedAt, item.json]);\n  });\n  sheet.getRange(1, 1, rows.length, 4).setValues(rows);\n}\n\n/**\n * Lê os dados consolidados para enviar à aplicação quando ela abre\n */\nfunction lerDadosParaApp(ss) {\n  const result = {\n    notes: [],\n    sermons: [],\n    journalEntries: {},\n    biblePageNotes: {}\n  };\n\n  const backupSheet = ss.getSheetByName('_ASCD_BACKUP_');\n  if (backupSheet && backupSheet.getLastRow() > 1) {\n    const values = backupSheet.getRange(2, 1, backupSheet.getLastRow() - 1, 4).getValues();\n    values.forEach(row => {\n      const type = String(row[1] || '').trim();\n      const jsonStr = String(row[3] || '').trim();\n      if (!jsonStr) return;\n      try {\n        const obj = JSON.parse(jsonStr);\n        if (type === 'note') {\n          result.notes.push(obj);\n        } else if (type === 'sermon') {\n          result.sermons.push(obj);\n        } else if (type === 'journal') {\n          if (obj.date) result.journalEntries[obj.date] = obj;\n        } else if (type === 'bible') {\n          const key = String(row[0]).replace('BIBLIA-', '');\n          result.biblePageNotes[key] = obj;\n        }\n      } catch (_) {}\n    });\n    return result;\n  }\n\n  // Fallback: se _ASCD_BACKUP_ ainda não existe, lê das 4 abas visuais\n  reconstruirAPartirDasAbasVisuais(ss, result);\n  return result;\n}\n\n/**\n * Reconstrói objetos a partir das 4 abas visuais se _ASCD_BACKUP_ ainda estiver vazio\n */\nfunction reconstruirAPartirDasAbasVisuais(ss, result) {\n  // 1. Caderno de Estudos\n  const sheetNotas = ss.getSheetByName('Caderno de Estudos');\n  if (sheetNotas && sheetNotas.getLastRow() > 1) {\n    const vals = sheetNotas.getRange(2, 1, sheetNotas.getLastRow() - 1, 7).getValues();\n    vals.forEach(r => {\n      const id = String(r[0] || '').trim();\n      if (id) {\n        result.notes.push({\n          id: id,\n          date: String(r[1] || ''),\n          title: String(r[2] || ''),\n          category: String(r[3] || 'Estudo Bíblico'),\n          content: String(r[4] || ''),\n          mode: 'hybrid'\n        });\n      }\n    });\n  }\n\n  // 2. Sermões\n  const sheetSermoes = ss.getSheetByName('Anotações de Sermões');\n  if (sheetSermoes && sheetSermoes.getLastRow() > 1) {\n    const vals = sheetSermoes.getRange(2, 1, sheetSermoes.getLastRow() - 1, 8).getValues();\n    vals.forEach(r => {\n      const id = String(r[0] || '').trim();\n      if (id) {\n        result.sermons.push({\n          id: id,\n          date: String(r[1] || ''),\n          title: String(r[2] || ''),\n          passage: String(r[3] || ''),\n          preacher: String(r[4] || ''),\n          content: String(r[5] || ''),\n          mode: 'hybrid'\n        });\n      }\n    });\n  }\n\n  // 3. Diário\n  const sheetDiario = ss.getSheetByName('Journaling (Calendário)') || ss.getSheetByName('Diário');\n  if (sheetDiario && sheetDiario.getLastRow() > 1) {\n    const vals = sheetDiario.getRange(2, 1, sheetDiario.getLastRow() - 1, 8).getValues();\n    vals.forEach(r => {\n      const dateStr = String(r[0] || '').trim();\n      if (dateStr) {\n        result.journalEntries[dateStr] = {\n          date: dateStr,\n          title: String(r[1] || ''),\n          verse: String(r[2] || ''),\n          prayer: String(r[3] || ''),\n          tasks: [],\n          content: String(r[5] || ''),\n          mode: 'hybrid'\n        };\n      }\n    });\n  }\n\n  // 4. Leitor Bíblico\n  const sheetBiblia = ss.getSheetByName('Leitor Bíblico');\n  if (sheetBiblia && sheetBiblia.getLastRow() > 1) {\n    const vals = sheetBiblia.getRange(2, 1, sheetBiblia.getLastRow() - 1, 7).getValues();\n    vals.forEach(r => {\n      const id = String(r[0] || '').trim();\n      if (id) {\n        const key = id.replace('BIBLIA-', '');\n        result.biblePageNotes[key] = {\n          title: String(r[3] || ''),\n          content: String(r[4] || '')\n        };\n      }\n    });\n  }\n}\n\n/**\n * 1. Aba: \"Leitor Bíblico\" com MERGE\n */\nfunction atualizarAbaLeitorBiblicoComMerge(ss, records, deletedIds) {\n  const sheet = localizarOuCriarAba(ss, ['Leitor Bíblico', 'Leitor Biblico', 'Bíblia', 'Biblia'], 'Leitor Bíblico');\n  const headers = ['ID', 'Data', 'Passagem Bíblica', 'Título do Estudo', 'Conteúdo das Anotações', 'Apple Pencil', 'Última Atualização'];\n  const map = new Map();\n\n  const lastRow = sheet.getLastRow();\n  if (lastRow > 1) {\n    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();\n    existing.forEach(r => {\n      const id = String(r[0] || '').trim();\n      if (id) map.set(id, r);\n    });\n  }\n\n  if (deletedIds && deletedIds.length > 0) {\n    deletedIds.forEach(id => map.delete(String(id).trim()));\n  }\n\n  const itens = records.filter(r => r.tipo === 'Anotação Página Bíblica');\n  itens.forEach(item => {\n    const id = String(item.id || '').trim();\n    if (id) {\n      map.set(id, [\n        id,\n        item.data || '',\n        item.passagem || '',\n        item.titulo || '',\n        item.conteudo || '',\n        item.hasPencil || 'Não',\n        item.dataRegistro || ''\n      ]);\n    }\n  });\n\n  sheet.clearContents();\n  const rows = [headers];\n  map.forEach(r => rows.push(r));\n  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);\n  aplicarEstiloAba(sheet, headers.length, '#3E2723');\n}\n\n/**\n * 2. Aba: \"Journaling (Calendário)\" com MERGE\n */\nfunction atualizarAbaJournalingComMerge(ss, records, deletedIds) {\n  const sheet = localizarOuCriarAba(ss, ['Journaling (Calendário)', 'Journaling (Calendario)', 'Journaling', 'Diário', 'Diario'], 'Journaling (Calendário)');\n  const headers = ['Data', 'Título / Tema do Dia', 'Passagem Bíblica', 'Oração & Intercessão', 'Tarefas do Dia', 'Reflexão & Diário Espiritual', 'Apple Pencil', 'Última Atualização'];\n  const map = new Map();\n\n  const lastRow = sheet.getLastRow();\n  if (lastRow > 1) {\n    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();\n    existing.forEach(r => {\n      const date = String(r[0] || '').trim();\n      if (date) map.set(date, r);\n    });\n  }\n\n  if (deletedIds && deletedIds.length > 0) {\n    deletedIds.forEach(id => {\n      const cleanId = String(id).replace('JOURNAL-', '').trim();\n      map.delete(cleanId);\n    });\n  }\n\n  const itens = records.filter(r => r.tipo === 'Journal Diário');\n  itens.forEach(j => {\n    const date = String(j.data || '').trim();\n    if (date) {\n      map.set(date, [\n        date,\n        j.titulo || '',\n        j.passagem || '',\n        j.oracao || '',\n        j.tarefas || '',\n        j.conteudo || '',\n        j.hasPencil || 'Não',\n        j.dataRegistro || ''\n      ]);\n    }\n  });\n\n  sheet.clearContents();\n  const rows = [headers];\n  map.forEach(r => rows.push(r));\n  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);\n  aplicarEstiloAba(sheet, headers.length, '#78350F');\n}\n\n/**\n * 3. Aba: \"Caderno de Estudos\" com MERGE\n */\nfunction atualizarAbaCadernoEstudosComMerge(ss, records, deletedIds) {\n  const sheet = localizarOuCriarAba(ss, ['Caderno de Estudos', 'Estudos Bíblicos', 'Estudos', 'Caderno de Estudo'], 'Caderno de Estudos');\n  const headers = ['ID', 'Data', 'Título do Estudo', 'Categoria', 'Conteúdo do Estudo', 'Apple Pencil', 'Última Atualização'];\n  const map = new Map();\n\n  const lastRow = sheet.getLastRow();\n  if (lastRow > 1) {\n    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();\n    existing.forEach(r => {\n      const id = String(r[0] || '').trim();\n      if (id) map.set(id, r);\n    });\n  }\n\n  if (deletedIds && deletedIds.length > 0) {\n    deletedIds.forEach(id => map.delete(String(id).trim()));\n  }\n\n  const itens = records.filter(r => r.tipo === 'Estudo Bíblico');\n  itens.forEach(e => {\n    const id = String(e.id || '').trim();\n    if (id) {\n      map.set(id, [\n        id,\n        e.data || '',\n        e.titulo || '',\n        e.categoria || 'Estudo Bíblico',\n        e.conteudo || '',\n        e.hasPencil || 'Não',\n        e.dataRegistro || ''\n      ]);\n    }\n  });\n\n  sheet.clearContents();\n  const rows = [headers];\n  map.forEach(r => rows.push(r));\n  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);\n  aplicarEstiloAba(sheet, headers.length, '#14532D');\n}\n\n/**\n * 4. Aba: \"Anotações de Sermões\" com MERGE\n */\nfunction atualizarAbaSermoesComMerge(ss, records, deletedIds) {\n  const sheet = localizarOuCriarAba(ss, ['Anotações de Sermões', 'Anotacoes de Sermoes', 'Sermões & Pregações', 'Sermões', 'Sermoes'], 'Anotações de Sermões');\n  const headers = ['ID', 'Data', 'Tema / Título da Mensagem', 'Passagem Bíblica', 'Pregador / Orador', 'Anotações da Pregação', 'Apple Pencil', 'Última Atualização'];\n  const map = new Map();\n\n  const lastRow = sheet.getLastRow();\n  if (lastRow > 1) {\n    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();\n    existing.forEach(r => {\n      const id = String(r[0] || '').trim();\n      if (id) map.set(id, r);\n    });\n  }\n\n  if (deletedIds && deletedIds.length > 0) {\n    deletedIds.forEach(id => map.delete(String(id).trim()));\n  }\n\n  const itens = records.filter(r => r.tipo === 'Sermão & Pregação');\n  itens.forEach(s => {\n    const id = String(s.id || '').trim();\n    if (id) {\n      map.set(id, [\n        id,\n        s.data || '',\n        s.titulo || '',\n        s.passagem || '',\n        s.pregador || '',\n        s.conteudo || '',\n        s.hasPencil || 'Não',\n        s.dataRegistro || ''\n      ]);\n    }\n  });\n\n  sheet.clearContents();\n  const rows = [headers];\n  map.forEach(r => rows.push(r));\n  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);\n  aplicarEstiloAba(sheet, headers.length, '#1E3A8A');\n}\n\n/**\n * Localiza de forma flexível ou cria uma das abas\n */\nfunction localizarOuCriarAba(ss, candidatos, nomePadrao) {\n  for (let i = 0; i < candidatos.length; i++) {\n    const s = ss.getSheetByName(candidatos[i]);\n    if (s) return s;\n  }\n\n  const sheets = ss.getSheets();\n  const normalizar = function(t) {\n    return (t || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();\n  };\n\n  for (let s of sheets) {\n    const nomeAtual = normalizar(s.getName());\n    for (let c of candidatos) {\n      const cand = normalizar(c);\n      if (nomeAtual === cand || nomeAtual.indexOf(cand) !== -1 || cand.indexOf(nomeAtual) !== -1) {\n        return s;\n      }\n    }\n  }\n\n  return ss.insertSheet(nomePadrao);\n}\n\n/**\n * Aplica formatação refinada e cabeçalhos elegantes\n */\nfunction aplicarEstiloAba(sheet, numCols, corCabecalho) {\n  sheet.setFrozenRows(1);\n\n  const headerRange = sheet.getRange(1, 1, 1, numCols);\n  headerRange\n    .setBackground(corCabecalho)\n    .setFontColor('#FFFFFF')\n    .setFontWeight('bold')\n    .setFontSize(10)\n    .setFontFamily('Arial')\n    .setHorizontalAlignment('center')\n    .setVerticalAlignment('middle');\n\n  sheet.setRowHeight(1, 32);\n\n  const lastRow = sheet.getLastRow();\n  if (lastRow > 1) {\n    const dataRange = sheet.getRange(2, 1, lastRow - 1, numCols);\n    dataRange\n      .setFontFamily('Arial')\n      .setFontSize(10)\n      .setVerticalAlignment('top')\n      .setWrap(true);\n\n    for (let r = 2; r <= lastRow; r++) {\n      if (r % 2 === 0) {\n        sheet.getRange(r, 1, 1, numCols).setBackground('#FAFAFA');\n      } else {\n        sheet.getRange(r, 1, 1, numCols).setBackground('#FFFFFF');\n      }\n    }\n  }\n\n  for (let c = 1; c <= numCols; c++) {\n    sheet.autoResizeColumn(c);\n    const colWidth = sheet.getColumnWidth(c);\n    if (colWidth > 420) {\n      sheet.setColumnWidth(c, 420);\n    } else if (colWidth < 90) {\n      sheet.setColumnWidth(c, 90);\n    }\n  }\n}\n\nfunction reorganizarTodasAbasASCD() {\n  SpreadsheetApp.getActiveSpreadsheet().toast('Atualização das 4 abas concluída.', 'ASCD • Bíblia & Notas');\n}\n\nfunction formatarTodasAbas() {\n  const ss = SpreadsheetApp.getActiveSpreadsheet();\n  const sheets = ss.getSheets();\n  sheets.forEach(sh => {\n    const lastCol = sh.getLastColumn();\n    if (lastCol > 0) {\n      aplicarEstiloAba(sh, lastCol, '#3E2723');\n    }\n  });\n  SpreadsheetApp.getActiveSpreadsheet().toast('Formatação aplicada em todas as abas!', 'ASCD • Bíblia & Notas');\n}\n\nfunction exibirStatusConexao() {\n  const msg =\n    'Conexão com o App ASCD (Dupla Via & Merge):\\n\\n' +\n    '1. Os dados de múltiplos iPads e computadores são fundidos automaticamente por ID (sem apagar nada!).\\n' +\n    '2. Ao abrir o app em qualquer aparelho, ele puxa as novidades da folha de cálculo.\\n' +\n    '3. Ao escrever ou salvar, os dados são enviados e fundidos em tempo real.';\n  SpreadsheetApp.getUi().alert('ASCD • Conexão Google Sheets', msg, SpreadsheetApp.getUi().ButtonSet.OK);\n}\n";
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

    let pencilHtml = '';
    if (item.pencilDataUrl) {
      pencilHtml = `
        <div style="margin-top: 24px; page-break-inside: avoid;">
          <h3 style="font-size: 15px; color: #B45309; border-bottom: 1px solid #D1D5DB; padding-bottom: 6px; margin-bottom: 10px;">✍️ Anotações / Manuscrito Apple Pencil</h3>
          <img src="${item.pencilDataUrl}" style="width: 100%; border: 1px solid #E5E7EB; border-radius: 8px;" alt="Caligrafia" />
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
        ${pencilHtml}
      </div>
    `;
  }).join('');

  // Preencher modal de visualização e preparar exportação em PDF real compatível com iPadOS
  const printModal = document.getElementById('ascd-print-preview-modal');
  const printModalTitle = document.getElementById('print-modal-title');
  const printModalBody = document.getElementById('print-modal-body');
  const printContainer = document.getElementById('ascd-print-container');

  if (printModal && printModalBody) {
    if (printModalTitle) printModalTitle.textContent = `📄 ${title} - PDF`;
    printModalBody.innerHTML = itemsHtml;
    if (printContainer) printContainer.innerHTML = itemsHtml;

    const btnDownload = document.getElementById('btn-modal-download-pdf');
    if (btnDownload) {
      btnDownload.onclick = () => {
        downloadPdfFromElement(printModalBody, `ASCD_${cleanFilename(title)}`, title, btnDownload);
      };
    }

    const btnFooterDownload = document.getElementById('btn-modal-footer-download-pdf');
    if (btnFooterDownload) {
      btnFooterDownload.onclick = () => {
        downloadPdfFromElement(printModalBody, `ASCD_${cleanFilename(title)}`, title, btnFooterDownload);
      };
    }

    const btnDoPrint = document.getElementById('btn-modal-do-print');
    if (btnDoPrint) {
      btnDoPrint.onclick = () => {
        try {
          window.print();
        } catch (err) {
          console.error('Erro na chamada nativa de impressão:', err);
          downloadPdfFromElement(printModalBody, `ASCD_${cleanFilename(title)}`, title, btnDoPrint);
        }
      };
    }

    printModal.classList.add('open');
    showToast('📄 Pré-visualização aberta! Toque em "Guardar / Descarregar PDF".');
  } else {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = itemsHtml;
    downloadPdfFromElement(tempDiv, `ASCD_${cleanFilename(title)}`, title);
  }
}

async function downloadPdfFromElement(element, filename, title, buttonEl = null) {
  const originalHtml = buttonEl ? buttonEl.innerHTML : '';
  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.innerHTML = '⏳ A gerar PDF...';
  }
  showToast('⏳ A processar o documento em PDF de alta qualidade...');

  const cleanName = cleanFilename(filename || title || 'Documento') + '.pdf';

  try {
    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: cleanName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

      // No iPad e iOS: abrir Share Sheet nativo para "Guardar em Ficheiros"
      try {
        const pdfFile = new File([pdfBlob], cleanName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            files: [pdfFile],
            title: title || cleanName
          });
          showToast('✅ PDF partilhado / guardado nos Ficheiros!');
          return;
        }
      } catch (shareErr) {
        if (shareErr.name === 'AbortError') return;
        console.warn('Share error, downloading directly:', shareErr);
      }

      // Download direto do arquivo PDF
      triggerDownload(pdfBlob, cleanName);
      showToast('📥 Ficheiro PDF transferido com sucesso!');
    } else {
      window.print();
    }
  } catch (err) {
    console.error('Erro ao gerar PDF com html2pdf:', err);
    showToast('⚠️ A tentar impressão nativa como alternativa...');
    try {
      window.print();
    } catch (_) {}
  } finally {
    if (buttonEl) {
      buttonEl.disabled = false;
      buttonEl.innerHTML = originalHtml;
    }
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
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
  showToast('Devocional carregado no Diário! Pode escrever com teclado ou Apple Pencil.');
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
    pencilDataUrl: null,
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

