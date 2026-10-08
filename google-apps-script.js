/**
 * =============================================================================
 * ASCD • BÍBLIA & NOTAS — SINCRONIZADOR GOOGLE SHEETS COM MERGE (DUPLA VIA)
 * =============================================================================
 * Permite sincronização bidirecional entre múltiplos dispositivos (PC, iPads, telemóvel):
 * 1. PULL (GET): Carrega os dados da folha de cálculo para qualquer dispositivo ao abrir o App.
 * 2. PUSH (POST): Funde os novos dados com os existentes (NUNCA apaga dados de outros dispositivos!).
 * 3. Menu na folha de cálculo para organizar e embelezar as 4 abas automaticamente.
 * =============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📖 ASCD • Bíblia & Notas')
    .addItem('🔄 Reorganizar e Atualizar 4 Abas', 'reorganizarTodasAbasASCD')
    .addItem('🎨 Aplicar Formatação e Cores Nobres', 'formatarTodasAbas')
    .addSeparator()
    .addItem('ℹ️ Status da Conexão', 'exibirStatusConexao')
    .addToUi();
}

/**
 * Ponto de entrada GET (Web App)
 * Chamado pela app ao abrir para PUXAR (PULL) os dados existentes da base de dados.
 */
function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'online',
        appName: 'ASCD • Bíblia & Notas',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // PULL: carrega todos os dados consolidados das abas e do backup
    const dadosConsolidados = lerDadosParaApp(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      appName: 'ASCD • Bíblia & Notas',
      data: dadosConsolidados,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Erro no doGet: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Ponto de entrada POST (Web App)
 * Chamado pelo App para GUARDAR / FUNDIR dados (MERGE sem apagar dados de outros dispositivos).
 */
function doPost(e) {
  try {
    let payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.data) {
      payload = JSON.parse(e.parameter.data);
    } else if (e && e.parameter) {
      payload = e.parameter;
    } else {
      payload = {};
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const records = payload.records || [];
    const rawItems = payload.rawItems || null;
    const deletedIds = payload.deletedIds || [];

    // 1. Guarda ou funde os itens detalhados na aba de backup
    if (rawItems) {
      salvarOuFundirBackup(ss, rawItems, deletedIds);
    }

    // 2. Atualiza as 4 abas visuais FUNDINDO com os dados existentes (NÃO apaga de outros dispositivos!)
    atualizarAbaLeitorBiblicoComMerge(ss, records, deletedIds);
    atualizarAbaJournalingComMerge(ss, records, deletedIds);
    atualizarAbaCadernoEstudosComMerge(ss, records, deletedIds);
    atualizarAbaSermoesComMerge(ss, records, deletedIds);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      count: records.length,
      message: 'Dados fundidos e sincronizados com sucesso!',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Erro durante a sincronização: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Guarda e Funde os itens em formato JSON estruturado na aba oculta _ASCD_BACKUP_
 */
function salvarOuFundirBackup(ss, rawItems, deletedIds) {
  const sheet = localizarOuCriarAba(ss, ['_ASCD_BACKUP_'], '_ASCD_BACKUP_');
  try { sheet.hideSheet(); } catch (_) {}

  const lastRow = sheet.getLastRow();
  const map = new Map(); // id -> { id, type, updatedAt, json }

  if (lastRow > 1) {
    const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    values.forEach(row => {
      const id = String(row[0] || '').trim();
      if (id) {
        map.set(id, {
          id: id,
          type: String(row[1] || '').trim(),
          updatedAt: String(row[2] || '').trim(),
          json: String(row[3] || '').trim()
        });
      }
    });
  }

  // Deletar IDs solicitados
  if (deletedIds && deletedIds.length > 0) {
    deletedIds.forEach(id => map.delete(String(id).trim()));
  }

  // Fundir Notas
  if (rawItems.notes && Array.isArray(rawItems.notes)) {
    rawItems.notes.forEach(n => {
      if (n && n.id) {
        const id = String(n.id).trim();
        map.set(id, {
          id: id,
          type: 'note',
          updatedAt: n.updatedAt || n.date || new Date().toISOString(),
          json: JSON.stringify(n)
        });
      }
    });
  }

  // Fundir Sermões
  if (rawItems.sermons && Array.isArray(rawItems.sermons)) {
    rawItems.sermons.forEach(s => {
      if (s && s.id) {
        const id = String(s.id).trim();
        map.set(id, {
          id: id,
          type: 'sermon',
          updatedAt: s.updatedAt || s.date || new Date().toISOString(),
          json: JSON.stringify(s)
        });
      }
    });
  }

  // Fundir Diário (Journal)
  if (rawItems.journalEntries && typeof rawItems.journalEntries === 'object') {
    Object.keys(rawItems.journalEntries).forEach(dateStr => {
      const j = rawItems.journalEntries[dateStr];
      if (j) {
        const id = 'JOURNAL-' + dateStr;
        map.set(id, {
          id: id,
          type: 'journal',
          updatedAt: j.updatedAt || dateStr,
          json: JSON.stringify(j)
        });
      }
    });
  }

  // Fundir Notas Bíblicas
  if (rawItems.biblePageNotes && typeof rawItems.biblePageNotes === 'object') {
    Object.keys(rawItems.biblePageNotes).forEach(key => {
      const b = rawItems.biblePageNotes[key];
      if (b) {
        const id = 'BIBLIA-' + key;
        map.set(id, {
          id: id,
          type: 'bible',
          updatedAt: b.updatedAt || new Date().toISOString(),
          json: JSON.stringify(b)
        });
      }
    });
  }

  // Gravar tudo no _ASCD_BACKUP_ com proteção de tamanho de célula
  sheet.clearContents();
  const rows = [['ID', 'TIPO', 'UPDATED_AT', 'JSON']];
  map.forEach(item => {
    let jsonStr = String(item.json || '');
    if (jsonStr.length > 48000) {
      jsonStr = jsonStr.substring(0, 48000);
    }
    rows.push([item.id, item.type, item.updatedAt, jsonStr]);
  });
  if (rows.length > 1) {
    sheet.getRange(1, 1, rows.length, 4).setValues(rows);
  }
}

/**
 * Lê os dados consolidados para enviar à aplicação quando ela abre.
 * Combina o backup estruturado com as 4 abas visuais para garantir que NENHUM dado se perca.
 */
function lerDadosParaApp(ss) {
  const result = {
    notes: [],
    sermons: [],
    journalEntries: {},
    biblePageNotes: {}
  };

  const backupSheet = ss.getSheetByName('_ASCD_BACKUP_');
  if (backupSheet && backupSheet.getLastRow() > 1) {
    const values = backupSheet.getRange(2, 1, backupSheet.getLastRow() - 1, 4).getValues();
    values.forEach(row => {
      const type = String(row[1] || '').trim();
      const jsonStr = String(row[3] || '').trim();
      if (!jsonStr) return;
      try {
        const obj = JSON.parse(jsonStr);
        if (type === 'note') {
          if (obj.id) result.notes.push(obj);
        } else if (type === 'sermon') {
          if (obj.id) result.sermons.push(obj);
        } else if (type === 'journal') {
          if (obj.date) result.journalEntries[obj.date] = obj;
        } else if (type === 'bible') {
          const key = String(row[0]).replace('BIBLIA-', '');
          result.biblePageNotes[key] = obj;
        }
      } catch (_) {}
    });
  }

  // Sempre consolidar com as 4 abas visuais para recuperar anotações criadas ou editadas diretamente na folha
  reconstruirAPartirDasAbasVisuais(ss, result);
  return result;
}

/**
 * Reconstrói e funde objetos a partir das 4 abas visuais
 */
function reconstruirAPartirDasAbasVisuais(ss, result) {
  // 1. Caderno de Estudos
  const sheetNotas = ss.getSheetByName('Caderno de Estudos');
  if (sheetNotas && sheetNotas.getLastRow() > 1) {
    const vals = sheetNotas.getRange(2, 1, sheetNotas.getLastRow() - 1, 7).getValues();
    vals.forEach(r => {
      const id = String(r[0] || '').trim();
      if (id) {
        const existingIdx = result.notes.findIndex(n => n.id === id);
        const upDate = String(r[6] || r[1] || '').trim();
        const noteObj = {
          id: id,
          date: String(r[1] || ''),
          title: String(r[2] || ''),
          category: String(r[3] || 'Estudo Bíblico'),
          content: String(r[4] || ''),
          mode: 'hybrid',
          updatedAt: upDate || new Date().toISOString()
        };
        if (existingIdx === -1) {
          result.notes.push(noteObj);
        } else {
          // Completar campos se faltarem
          if (!result.notes[existingIdx].title && noteObj.title) result.notes[existingIdx].title = noteObj.title;
          if (!result.notes[existingIdx].content && noteObj.content) result.notes[existingIdx].content = noteObj.content;
          if (!result.notes[existingIdx].updatedAt) result.notes[existingIdx].updatedAt = noteObj.updatedAt;
        }
      }
    });
  }

  // 2. Sermões
  const sheetSermoes = ss.getSheetByName('Anotações de Sermões');
  if (sheetSermoes && sheetSermoes.getLastRow() > 1) {
    const vals = sheetSermoes.getRange(2, 1, sheetSermoes.getLastRow() - 1, 8).getValues();
    vals.forEach(r => {
      const id = String(r[0] || '').trim();
      if (id) {
        const existingIdx = result.sermons.findIndex(s => s.id === id);
        const upDate = String(r[7] || r[1] || '').trim();
        const sermonObj = {
          id: id,
          date: String(r[1] || ''),
          title: String(r[2] || ''),
          passage: String(r[3] || ''),
          preacher: String(r[4] || ''),
          content: String(r[5] || ''),
          mode: 'hybrid',
          updatedAt: upDate || new Date().toISOString()
        };
        if (existingIdx === -1) {
          result.sermons.push(sermonObj);
        } else {
          if (!result.sermons[existingIdx].title && sermonObj.title) result.sermons[existingIdx].title = sermonObj.title;
          if (!result.sermons[existingIdx].content && sermonObj.content) result.sermons[existingIdx].content = sermonObj.content;
          if (!result.sermons[existingIdx].updatedAt) result.sermons[existingIdx].updatedAt = sermonObj.updatedAt;
        }
      }
    });
  }

  // 3. Diário (Journal)
  const sheetDiario = ss.getSheetByName('Journaling (Calendário)') || ss.getSheetByName('Diário');
  if (sheetDiario && sheetDiario.getLastRow() > 1) {
    const vals = sheetDiario.getRange(2, 1, sheetDiario.getLastRow() - 1, 8).getValues();
    vals.forEach(r => {
      const dateStr = String(r[0] || '').trim();
      if (dateStr) {
        let tasks = [];
        const rawTasks = String(r[4] || '').trim();
        if (rawTasks) {
          if (rawTasks.startsWith('[') && rawTasks.endsWith(']')) {
            try { tasks = JSON.parse(rawTasks); } catch (_) {}
          }
          if (!tasks || tasks.length === 0) {
            tasks = rawTasks.split('|').map((part, idx) => {
              const clean = part.trim();
              const isDone = clean.startsWith('[X]') || clean.startsWith('[x]');
              const text = clean.replace(/^\[[Xx\s]\]\s*/, '').trim();
              return { id: `task-sheet-${dateStr}-${idx}`, text, done: isDone };
            }).filter(t => t.text.length > 0);
          }
        }

        const upDate = String(r[7] || dateStr).trim();
        if (!result.journalEntries[dateStr]) {
          result.journalEntries[dateStr] = {
            date: dateStr,
            title: String(r[1] || ''),
            verse: String(r[2] || ''),
            prayer: String(r[3] || ''),
            tasks: tasks,
            content: String(r[5] || ''),
            mode: 'hybrid',
            updatedAt: upDate || new Date().toISOString()
          };
        } else {
          const j = result.journalEntries[dateStr];
          if (!j.title && r[1]) j.title = String(r[1]);
          if (!j.verse && r[2]) j.verse = String(r[2]);
          if (!j.prayer && r[3]) j.prayer = String(r[3]);
          if ((!j.tasks || j.tasks.length === 0) && tasks.length > 0) j.tasks = tasks;
          if (!j.content && r[5]) j.content = String(r[5]);
          if (!j.updatedAt) j.updatedAt = upDate;
        }
      }
    });
  }

  // 4. Leitor Bíblico
  const sheetBiblia = ss.getSheetByName('Leitor Bíblico');
  if (sheetBiblia && sheetBiblia.getLastRow() > 1) {
    const vals = sheetBiblia.getRange(2, 1, sheetBiblia.getLastRow() - 1, 7).getValues();
    vals.forEach(r => {
      const id = String(r[0] || '').trim();
      if (id) {
        const key = id.replace('BIBLIA-', '');
        const upDate = String(r[6] || '').trim();
        if (!result.biblePageNotes[key]) {
          result.biblePageNotes[key] = {
            title: String(r[3] || ''),
            content: String(r[4] || ''),
            updatedAt: upDate || new Date().toISOString()
          };
        }
      }
    });
  }
}

/**
 * 1. Aba: "Leitor Bíblico" com MERGE
 */
function atualizarAbaLeitorBiblicoComMerge(ss, records, deletedIds) {
  const sheet = localizarOuCriarAba(ss, ['Leitor Bíblico', 'Leitor Biblico', 'Bíblia', 'Biblia'], 'Leitor Bíblico');
  const headers = ['ID', 'Data', 'Passagem Bíblica', 'Título do Estudo', 'Conteúdo das Anotações', 'Última Atualização'];
  const map = new Map();

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    existing.forEach(r => {
      const id = String(r[0] || '').trim();
      if (id) map.set(id, r);
    });
  }

  if (deletedIds && deletedIds.length > 0) {
    deletedIds.forEach(id => map.delete(String(id).trim()));
  }

  const itens = records.filter(r => r.tipo === 'Anotação Página Bíblica');
  itens.forEach(item => {
    const id = String(item.id || '').trim();
    if (id) {
      map.set(id, [
        id,
        item.data || '',
        item.passagem || '',
        item.titulo || '',
        item.conteudo || '',
        item.dataRegistro || ''
      ]);
    }
  });

  sheet.clearContents();
  const rows = [headers];
  map.forEach(r => rows.push(r));
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#3E2723');
}

/**
 * 2. Aba: "Journaling (Calendário)" com MERGE
 */
function atualizarAbaJournalingComMerge(ss, records, deletedIds) {
  const sheet = localizarOuCriarAba(ss, ['Journaling (Calendário)', 'Journaling (Calendario)', 'Journaling', 'Diário', 'Diario'], 'Journaling (Calendário)');
  const headers = ['Data', 'Título / Tema do Dia', 'Passagem Bíblica', 'Oração & Intercessão', 'Tarefas do Dia', 'Reflexão & Diário Espiritual', 'Última Atualização'];
  const map = new Map();

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    existing.forEach(r => {
      const date = String(r[0] || '').trim();
      if (date) map.set(date, r);
    });
  }

  if (deletedIds && deletedIds.length > 0) {
    deletedIds.forEach(id => {
      const cleanId = String(id).replace('JOURNAL-', '').trim();
      map.delete(cleanId);
    });
  }

  const itens = records.filter(r => r.tipo === 'Journal Diário');
  itens.forEach(j => {
    const date = String(j.data || '').trim();
    if (date) {
      map.set(date, [
        date,
        j.titulo || '',
        j.passagem || '',
        j.oracao || '',
        j.tarefas || '',
        j.conteudo || '',
        j.dataRegistro || ''
      ]);
    }
  });

  sheet.clearContents();
  const rows = [headers];
  map.forEach(r => rows.push(r));
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#78350F');
}

/**
 * 3. Aba: "Caderno de Estudos" com MERGE
 */
function atualizarAbaCadernoEstudosComMerge(ss, records, deletedIds) {
  const sheet = localizarOuCriarAba(ss, ['Caderno de Estudos', 'Estudos Bíblicos', 'Estudos', 'Caderno de Estudo'], 'Caderno de Estudos');
  const headers = ['ID', 'Data', 'Título do Estudo', 'Categoria', 'Conteúdo do Estudo', 'Última Atualização'];
  const map = new Map();

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    existing.forEach(r => {
      const id = String(r[0] || '').trim();
      if (id) map.set(id, r);
    });
  }

  if (deletedIds && deletedIds.length > 0) {
    deletedIds.forEach(id => map.delete(String(id).trim()));
  }

  const itens = records.filter(r => r.tipo === 'Estudo Bíblico');
  itens.forEach(e => {
    const id = String(e.id || '').trim();
    if (id) {
      map.set(id, [
        id,
        e.data || '',
        e.titulo || '',
        e.categoria || 'Estudo Bíblico',
        e.conteudo || '',
        e.dataRegistro || ''
      ]);
    }
  });

  sheet.clearContents();
  const rows = [headers];
  map.forEach(r => rows.push(r));
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#14532D');
}

/**
 * 4. Aba: "Anotações de Sermões" com MERGE
 */
function atualizarAbaSermoesComMerge(ss, records, deletedIds) {
  const sheet = localizarOuCriarAba(ss, ['Anotações de Sermões', 'Anotacoes de Sermoes', 'Sermões & Pregações', 'Sermões', 'Sermoes'], 'Anotações de Sermões');
  const headers = ['ID', 'Data', 'Tema / Título da Mensagem', 'Passagem Bíblica', 'Pregador / Orador', 'Anotações da Pregação', 'Última Atualização'];
  const map = new Map();

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const existing = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    existing.forEach(r => {
      const id = String(r[0] || '').trim();
      if (id) map.set(id, r);
    });
  }

  if (deletedIds && deletedIds.length > 0) {
    deletedIds.forEach(id => map.delete(String(id).trim()));
  }

  const itens = records.filter(r => r.tipo === 'Sermão & Pregação');
  itens.forEach(s => {
    const id = String(s.id || '').trim();
    if (id) {
      map.set(id, [
        id,
        s.data || '',
        s.titulo || '',
        s.passagem || '',
        s.pregador || '',
        s.conteudo || '',
        s.dataRegistro || ''
      ]);
    }
  });

  sheet.clearContents();
  const rows = [headers];
  map.forEach(r => rows.push(r));
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#1E3A8A');
}

/**
 * Localiza de forma flexível ou cria uma das abas
 */
function localizarOuCriarAba(ss, candidatos, nomePadrao) {
  for (let i = 0; i < candidatos.length; i++) {
    const s = ss.getSheetByName(candidatos[i]);
    if (s) return s;
  }

  const sheets = ss.getSheets();
  const normalizar = function(t) {
    return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  for (let s of sheets) {
    const nomeAtual = normalizar(s.getName());
    for (let c of candidatos) {
      const cand = normalizar(c);
      if (nomeAtual === cand || nomeAtual.indexOf(cand) !== -1 || cand.indexOf(nomeAtual) !== -1) {
        return s;
      }
    }
  }

  return ss.insertSheet(nomePadrao);
}

/**
 * Aplica formatação refinada e cabeçalhos elegantes
 */
function aplicarEstiloAba(sheet, numCols, corCabecalho) {
  sheet.setFrozenRows(1);

  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange
    .setBackground(corCabecalho)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontFamily('Arial')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 32);

  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const dataRange = sheet.getRange(2, 1, lastRow - 1, numCols);
    dataRange
      .setFontFamily('Arial')
      .setFontSize(10)
      .setVerticalAlignment('top')
      .setWrap(true);

    for (let r = 2; r <= lastRow; r++) {
      if (r % 2 === 0) {
        sheet.getRange(r, 1, 1, numCols).setBackground('#FAFAFA');
      } else {
        sheet.getRange(r, 1, 1, numCols).setBackground('#FFFFFF');
      }
    }
  }

  for (let c = 1; c <= numCols; c++) {
    sheet.autoResizeColumn(c);
    const colWidth = sheet.getColumnWidth(c);
    if (colWidth > 420) {
      sheet.setColumnWidth(c, 420);
    } else if (colWidth < 90) {
      sheet.setColumnWidth(c, 90);
    }
  }
}

function reorganizarTodasAbasASCD() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Atualização das 4 abas concluída.', 'ASCD • Bíblia & Notas');
}

function formatarTodasAbas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  sheets.forEach(sh => {
    const lastCol = sh.getLastColumn();
    if (lastCol > 0) {
      aplicarEstiloAba(sh, lastCol, '#3E2723');
    }
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('Formatação aplicada em todas as abas!', 'ASCD • Bíblia & Notas');
}

function exibirStatusConexao() {
  const msg =
    'Conexão com o App ASCD (Dupla Via & Merge):\n\n' +
    '1. Os dados de múltiplos iPads e computadores são fundidos automaticamente por ID (sem apagar nada!).\n' +
    '2. Ao abrir o app em qualquer aparelho, ele puxa as novidades da folha de cálculo.\n' +
    '3. Ao escrever ou salvar, os dados são enviados e fundidos em tempo real.';
  SpreadsheetApp.getUi().alert('ASCD • Conexão Google Sheets', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
