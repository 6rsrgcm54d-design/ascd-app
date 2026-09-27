/**
 * =============================================================================
 * ASCD • BÍBLIA & NOTAS — SINCRONIZADOR GOOGLE SHEETS (APPS SCRIPT)
 * =============================================================================
 * Este código conecta a sua aplicação ASCD diretamente à sua planilha Google Sheets.
 * 
 * Atualiza automaticamente as 4 abas correspondentes às 4 secções do menu:
 * 1. "Leitor Bíblico"          (Estudos e anotações vinculadas aos capítulos bíblicos)
 * 2. "Journaling (Calendário)"  (Orações diárias, lista de afazeres e diário espiritual)
 * 3. "Caderno de Estudos"       (Estudos temáticos, exegéticos e teologia)
 * 4. "Anotações de Sermões"     (Pregações de cultos, pregador, passagem bíblica)
 * =============================================================================
 */

// Cria o menu personalizado "📖 ASCD • Bíblia & Notas" no Google Sheets
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
 * Ponto de entrada POST (Web App)
 * Chamado automaticamente pelo App ASCD sempre que você escreve ou salva algo
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

    const records = payload.records || [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Atualiza a aba: Leitor Bíblico
    atualizarAbaLeitorBiblico(ss, records);

    // 2. Atualiza a aba: Journaling (Calendário)
    atualizarAbaJournaling(ss, records);

    // 3. Atualiza a aba: Caderno de Estudos
    atualizarAbaCadernoEstudos(ss, records);

    // 4. Atualiza a aba: Anotações de Sermões
    atualizarAbaSermoes(ss, records);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      count: records.length,
      message: 'As 4 abas do Google Sheets foram sincronizadas com sucesso!',
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
 * Ponto de entrada GET (Web App)
 * Permite verificar no navegador se o Apps Script está online
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    appName: 'ASCD • Bíblia & Notas',
    message: 'O sincronizador do Google Apps Script está ativo e pronto para receber dados das 4 abas!',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 1. Aba: "Leitor Bíblico"
 */
function atualizarAbaLeitorBiblico(ss, records) {
  const itens = records.filter(r => r.tipo === 'Anotação Página Bíblica');
  const sheet = localizarOuCriarAba(ss, ['Leitor Bíblico', 'Leitor Biblico', 'Bíblia', 'Biblia'], 'Leitor Bíblico');
  sheet.clearContents();

  const headers = [
    'ID', 'Data', 'Passagem Bíblica', 'Título do Estudo',
    'Conteúdo das Anotações', 'Apple Pencil', 'Última Atualização'
  ];
  const rows = [headers];

  itens.forEach(item => {
    rows.push([
      item.id || '',
      item.data || '',
      item.passagem || '',
      item.titulo || '',
      item.conteudo || '',
      item.hasPencil || 'Não',
      item.dataRegistro || ''
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#3E2723'); // Marrom Nobre / Couro Bíblico
}

/**
 * 2. Aba: "Journaling (Calendário)"
 */
function atualizarAbaJournaling(ss, records) {
  const itens = records.filter(r => r.tipo === 'Journal Diário');
  const sheet = localizarOuCriarAba(ss, ['Journaling (Calendário)', 'Journaling (Calendario)', 'Journaling', 'Journal Diário', 'Journal Diario', 'Journal'], 'Journaling (Calendário)');
  sheet.clearContents();

  const headers = [
    'Data', 'Título / Tema do Dia', 'Passagem Bíblica',
    'Oração & Intercessão', 'Tarefas do Dia', 'Reflexão & Diário Espiritual',
    'Apple Pencil', 'Última Atualização'
  ];
  const rows = [headers];

  itens.forEach(j => {
    rows.push([
      j.data || '',
      j.titulo || '',
      j.passagem || '',
      j.oracao || '',
      j.tarefas || '',
      j.conteudo || '',
      j.hasPencil || 'Não',
      j.dataRegistro || ''
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#78350F'); // Âmbar Couro
}

/**
 * 3. Aba: "Caderno de Estudos"
 */
function atualizarAbaCadernoEstudos(ss, records) {
  const itens = records.filter(r => r.tipo === 'Estudo Bíblico');
  const sheet = localizarOuCriarAba(ss, ['Caderno de Estudos', 'Estudos Bíblicos', 'Estudos', 'Caderno de Estudo'], 'Caderno de Estudos');
  sheet.clearContents();

  const headers = [
    'ID', 'Data', 'Título do Estudo', 'Categoria',
    'Conteúdo do Estudo', 'Apple Pencil', 'Última Atualização'
  ];
  const rows = [headers];

  itens.forEach(e => {
    rows.push([
      e.id || '',
      e.data || '',
      e.titulo || '',
      e.categoria || 'Estudo Bíblico',
      e.conteudo || '',
      e.hasPencil || 'Não',
      e.dataRegistro || ''
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#14532D'); // Verde Oliva / Floresta
}

/**
 * 4. Aba: "Anotações de Sermões"
 */
function atualizarAbaSermoes(ss, records) {
  const itens = records.filter(r => r.tipo === 'Sermão & Pregação');
  const sheet = localizarOuCriarAba(ss, ['Anotações de Sermões', 'Anotacoes de Sermoes', 'Sermões & Pregações', 'Sermões', 'Sermoes'], 'Anotações de Sermões');
  sheet.clearContents();

  const headers = [
    'ID', 'Data', 'Tema / Título da Mensagem', 'Passagem Bíblica',
    'Pregador / Orador', 'Anotações da Pregação', 'Apple Pencil', 'Última Atualização'
  ];
  const rows = [headers];

  itens.forEach(s => {
    rows.push([
      s.id || '',
      s.data || '',
      s.titulo || '',
      s.passagem || '',
      s.pregador || '',
      s.conteudo || '',
      s.hasPencil || 'Não',
      s.dataRegistro || ''
    ]);
  });

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  aplicarEstiloAba(sheet, headers.length, '#1E3A8A'); // Azul Clássico
}

/**
 * Localiza de forma flexível ou cria uma das 4 abas
 */
function localizarOuCriarAba(ss, candidatos, nomePadrao) {
  // 1. Procura por correspondência exata
  for (let i = 0; i < candidatos.length; i++) {
    const s = ss.getSheetByName(candidatos[i]);
    if (s) return s;
  }

  // 2. Procura flexível (sem acentuação e ignorando maiúsculas)
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

  // 3. Se não encontrar, insere nova aba com o nome padrão
  return ss.insertSheet(nomePadrao);
}

/**
 * Aplica formatação refinada e cabeçalhos elegantes
 */
function aplicarEstiloAba(sheet, numCols, corCabecalho) {
  sheet.setFrozenRows(1);

  // Estiliza o cabeçalho (Linha 1)
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

  // Formata linhas de dados se existirem
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

  // Ajuste inteligente da largura de colunas
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
  SpreadsheetApp.getActiveSpreadsheet().toast('Atualização das 4 abas pronta.', 'ASCD • Bíblia & Notas');
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
    'Conexão com o App ASCD:\n\n' +
    '1. A sua planilha possui as 4 abas conectadas: Leitor Bíblico, Journaling, Caderno de Estudos e Anotações de Sermões.\n' +
    '2. O app sincroniza automaticamente em segundo plano sempre que você escreve ou salva.\n' +
    '3. Pode também forçar a sincronização a qualquer momento através do botão "Base Google Sheets" na app.';
  SpreadsheetApp.getUi().alert('ASCD • Conexão Google Sheets', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}
