/**
 * ASCD - Motor de Desenho e Caligrafia Digital com Suporte Nativo a Apple Pencil
 * Inclui: Detecção de Caneta, Rejeição de Palma (Palm Rejection),
 * Sensibilidade à Pressão, Suavização Bézier, Marca-texto, Borracha,
 * Papéis Pautado/Pontilhado/Pergaminho, Histórico Undo/Redo e Armazenamento IndexedDB.
 */

class AscdPencilEngine {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    // Configurações do estado do desenho
    this.tool = 'pen'; // 'pen', 'fountain', 'highlighter', 'eraser'
    this.color = '#1A1A1A';
    this.size = 3.5;
    this.highlighterColor = '#FEF08A';
    this.paperType = options.paperType || 'pautada';
    this.hasDrawn = false;
    
    // Suporte específico para Apple Pencil
    this.onlyPenMode = true; // Palm Rejection estrita por defeito: apenas Apple Pencil desenha!
    this.pressureEnabled = true;
    this.currentPointerType = 'unknown';

    // Rastreamento de traçado e suavização
    this.isDrawing = false;
    this.points = [];
    this.lastPressure = 0.5;
    
    // Histórico de Ações (Undo / Redo)
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 25;

    // Gerenciador de páginas
    this.currentPageId = 'pagina-padrao';
    this.pageTitle = 'Estudo & Devocional';

    // Inicialização
    this.initCanvasSize();
    this.attachEventListeners();
    this.renderPaper();
    this.saveState();
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2); // 2x ou mais para nitidez incrível no Retina display do iPad
    
    // Preservar conteúdo ao redimensionar se já houver imagem e traços
    let tempCanvas = null;
    if (this.hasDrawn && this.canvas.width > 0 && this.canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(this.canvas, 0, 0);
    }

    const width = rect.width > 50 ? rect.width : 900;
    const height = rect.height > 50 ? rect.height : 1100;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.dpr = dpr;

    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.ctx.clearRect(0, 0, width, height);

    if (tempCanvas) {
      const prevW = tempCanvas.width / (this.dpr || 1);
      const prevH = tempCanvas.height / (this.dpr || 1);
      const scale = Math.min(width / (prevW || 1), height / (prevH || 1));
      const drawW = prevW * scale;
      const drawH = prevH * scale;
      const drawX = Math.max(0, (width - drawW) / 2);
      this.ctx.drawImage(tempCanvas, drawX, 0, drawW, drawH);
    }
    this.renderPaper();
  }

  attachEventListeners() {
    // Pointer Events nativos do navegador (W3C Standard suportado pelo Safari no iPadOS)
    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e), { passive: false });
    this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e), { passive: false });
    this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e), { passive: false });
    this.canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e), { passive: false });
    this.canvas.addEventListener('pointerout', (e) => this.handlePointerUp(e), { passive: false });

    // Prevenir comportamentos padrão no iOS (seleção de texto, rolagem no canvas)
    const preventTouch = (e) => {
      if (this.onlyPenMode || this.tool !== 'scroll') {
        e.preventDefault();
      }
    };
    this.canvas.addEventListener('touchstart', preventTouch, { passive: false });
    this.canvas.addEventListener('touchmove', preventTouch, { passive: false });
    this.canvas.addEventListener('touchend', preventTouch, { passive: false });

    // Prevenir gestos de pinça e zoom nativo do Safari no iPad durante escrita
    this.canvas.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResizePreserve();
      }, 150);
    });

    window.addEventListener('orientationchange', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.handleResizePreserve();
      }, 300);
    });
  }

  handleResizePreserve() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    
    let newWidth = Math.round(rect.width > 50 ? rect.width : 900);
    let newHeight = Math.round(rect.height > 50 ? rect.height : (this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 700));

    const currentLogicalW = Math.round(this.canvas.width / (this.dpr || 1));
    const currentLogicalH = Math.round(this.canvas.height / (this.dpr || 1));

    if (newWidth === currentLogicalW && newHeight === currentLogicalH && this.dpr === dpr) {
      return;
    }

    // Se estiver saindo do ecrã inteiro e houver desenho prévio, adaptar a altura para manter a proporção nobre da folha
    const isFullscreen = !!this.canvas.closest('.pencil-section-fullscreen');
    if (!isFullscreen && this.hasDrawn && currentLogicalW > 0 && currentLogicalH > 0) {
      const aspect = currentLogicalW / currentLogicalH;
      if (aspect > 0) {
        const targetH = Math.round(newWidth / aspect);
        if (targetH >= 340 && Math.abs(targetH - newHeight) > 10) {
          this.canvas.style.height = `${targetH}px`;
          newHeight = targetH;
        }
      }
    } else if (isFullscreen) {
      this.canvas.style.height = '';
    }

    const prevData = this.canvas.toDataURL();

    this.dpr = dpr;
    this.canvas.width = newWidth * dpr;
    this.canvas.height = newHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    if (this.hasDrawn) {
      const img = new Image();
      img.onload = () => {
        const imgW = currentLogicalW || 1;
        const imgH = currentLogicalH || 1;
        const scale = Math.min(newWidth / imgW, newHeight / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = Math.max(0, (newWidth - drawW) / 2);
        const drawY = 0;
        this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        this.renderPaper();
      };
      img.src = prevData;
    } else {
      this.renderPaper();
    }
  }

  getCanvasPoint(e) {
    const rect = this.canvas.getBoundingClientRect();
    const currentLogicalW = this.canvas.width / (this.dpr || 1);
    const currentLogicalH = this.canvas.height / (this.dpr || 1);
    const scaleX = rect.width > 0 ? (currentLogicalW / rect.width) : 1;
    const scaleY = rect.height > 0 ? (currentLogicalH / rect.height) : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5,
      tiltX: e.tiltX || 0,
      tiltY: e.tiltY || 0,
      pointerType: e.pointerType || 'mouse'
    };
  }

  handlePointerDown(e) {
    this.currentPointerType = e.pointerType;

    // Palm Rejection: Se o modo apenas Apple Pencil estiver ativo e o toque for com o dedo (touch), ignora!
    if (this.onlyPenMode && e.pointerType === 'touch') {
      return;
    }

    e.preventDefault();
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    const pt = this.getCanvasPoint(e);
    this.isDrawing = true;
    this.points = [pt];
    this.lastPressure = pt.pressure;

    // Desenhar um pequeno ponto inicial no clique
    this.drawDot(pt);
  }

  handlePointerMove(e) {
    if (!this.isDrawing) return;

    if (this.onlyPenMode && e.pointerType === 'touch') {
      return;
    }

    e.preventDefault();

    // No iPadOS com Apple Pencil, getCoalescedEvents() captura todos os pontos intermediários a 240Hz
    const events = (typeof e.getCoalescedEvents === 'function') ? e.getCoalescedEvents() : [e];
    for (let i = 0; i < events.length; i++) {
      const pt = this.getCanvasPoint(events[i]);
      this.points.push(pt);

      if (this.points.length > 2) {
        this.drawSmoothStroke();
      }
    }
  }

  handlePointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.points = [];

    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch (_) {}

    this.saveState();
    this.notifyChange();
  }

  drawDot(pt) {
    this.hasDrawn = true;
    this.ctx.save();
    this.applyToolStyle(pt.pressure);

    const radius = Math.max(1, (this.calculateStrokeWidth(pt.pressure) / 2));
    this.ctx.beginPath();
    this.ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  calculateStrokeWidth(pressure) {
    let width = this.size;
    if (this.pressureEnabled && pressure > 0) {
      if (this.tool === 'fountain') {
        // Caneta-tinteiro: mais sensível à pressão com variação expressiva
        width = this.size * (0.35 + pressure * 1.5);
      } else if (this.tool === 'pen') {
        // Caneta comum: variação suave e elegante
        width = this.size * (0.7 + pressure * 0.7);
      } else if (this.tool === 'highlighter') {
        width = Math.max(this.size * 3.5, 18);
      } else if (this.tool === 'eraser') {
        width = Math.max(this.size * 6, 26);
      }
    } else {
      if (this.tool === 'highlighter') width = Math.max(this.size * 3.5, 18);
      if (this.tool === 'eraser') width = Math.max(this.size * 6, 26);
    }
    return width;
  }

  applyToolStyle(pressure) {
    if (this.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.calculateStrokeWidth(pressure);
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
      this.ctx.fillStyle = 'rgba(0,0,0,1)';
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    } else if (this.tool === 'highlighter') {
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.globalAlpha = 0.4;
      this.ctx.strokeStyle = this.highlighterColor;
      this.ctx.fillStyle = this.highlighterColor;
      this.ctx.lineWidth = this.calculateStrokeWidth(pressure);
      this.ctx.lineCap = 'square';
      this.ctx.lineJoin = 'miter';
    } else if (this.tool === 'fountain') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1.0;
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.lineWidth = this.calculateStrokeWidth(pressure);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    } else {
      // 'pen' padrão
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1.0;
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.lineWidth = this.calculateStrokeWidth(pressure);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  drawSmoothStroke() {
    const len = this.points.length;
    const p1 = this.points[len - 3];
    const p2 = this.points[len - 2];
    const p3 = this.points[len - 1];

    const midPoint1 = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };
    const midPoint2 = {
      x: (p2.x + p3.x) / 2,
      y: (p2.y + p3.y) / 2
    };

    const avgPressure = (p2.pressure + p3.pressure) / 2;

    this.ctx.save();
    this.applyToolStyle(avgPressure);

    this.hasDrawn = true;
    this.ctx.beginPath();
    this.ctx.moveTo(midPoint1.x, midPoint1.y);
    this.ctx.quadraticCurveTo(p2.x, p2.y, midPoint2.x, midPoint2.y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  // Atualiza as classes CSS no elemento container pai e no elemento canvas
  updateContainerPaperClass() {
    const paperCls = `paper-${this.paperType || 'pautada'}`;
    const allPaperClasses = ['paper-pautada', 'paper-quadriculada', 'paper-pontilhada', 'paper-pergaminho', 'paper-branca'];
    const parent = this.canvas.parentElement;
    if (parent) {
      allPaperClasses.forEach(c => parent.classList.remove(c));
      parent.classList.add(paperCls);
    }
    allPaperClasses.forEach(c => this.canvas.classList.remove(c));
    this.canvas.classList.add(paperCls);
  }

  // Desenha o padrão de folha especificado em qualquer contexto Canvas 2D (usado para exportação)
  drawPaperOnContext(targetCtx, width, height, paperType = this.paperType) {
    targetCtx.save();
    targetCtx.globalCompositeOperation = 'source-over';

    if (paperType === 'pergaminho') {
      // Papiro Antigo Elegante
      targetCtx.fillStyle = '#FDF8EE';
      targetCtx.fillRect(0, 0, width, height);

      // Linhas horizontais sépia
      targetCtx.strokeStyle = 'rgba(163, 131, 91, 0.35)';
      targetCtx.lineWidth = 1;
      const lineHeight = 34;
      for (let y = 42; y < height; y += lineHeight) {
        targetCtx.beginPath();
        targetCtx.moveTo(0, y);
        targetCtx.lineTo(width, y);
        targetCtx.stroke();
      }

      // Margem esquerda nobre de estudo bíblico
      targetCtx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(64, 0);
      targetCtx.lineTo(64, height);
      targetCtx.stroke();

    } else if (paperType === 'pautada') {
      // Caderno Pautado com Linhas Clássicas e Margem
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, 0, width, height);

      // Linhas horizontais azuis
      targetCtx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      targetCtx.lineWidth = 1;
      const lineHeight = 32;
      for (let y = 38; y < height; y += lineHeight) {
        targetCtx.beginPath();
        targetCtx.moveTo(0, y);
        targetCtx.lineTo(width, y);
        targetCtx.stroke();
      }

      // Margem vermelha clássica de caderno
      targetCtx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.moveTo(60, 0);
      targetCtx.lineTo(60, height);
      targetCtx.stroke();

    } else if (paperType === 'quadriculada') {
      // Caderno Quadriculado Matemática (Grade de precisão 5mm / 24px)
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, 0, width, height);

      targetCtx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
      targetCtx.lineWidth = 1;
      const grid = 24;

      for (let x = 0; x <= width; x += grid) {
        targetCtx.beginPath();
        targetCtx.moveTo(x, 0);
        targetCtx.lineTo(x, height);
        targetCtx.stroke();
      }
      for (let y = 0; y <= height; y += grid) {
        targetCtx.beginPath();
        targetCtx.moveTo(0, y);
        targetCtx.lineTo(width, y);
        targetCtx.stroke();
      }

    } else if (paperType === 'pontilhada') {
      // Caderno Pontilhado (Bullet Journal Dot Grid)
      targetCtx.fillStyle = '#FAFAFA';
      targetCtx.fillRect(0, 0, width, height);

      targetCtx.fillStyle = 'rgba(71, 85, 105, 0.5)';
      const step = 24;
      for (let x = 12; x < width; x += step) {
        for (let y = 12; y < height; y += step) {
          targetCtx.beginPath();
          targetCtx.arc(x, y, 1.5, 0, Math.PI * 2);
          targetCtx.fill();
        }
      }

    } else {
      // Folha Lisa Branca
      targetCtx.fillStyle = '#FFFFFF';
      targetCtx.fillRect(0, 0, width, height);
    }

    targetCtx.restore();
  }

  // Renderiza fundo do caderno na folha
  renderPaper() {
    this.updateContainerPaperClass();
  }

  // Altera o tipo de folha em tempo real
  changePaper(type) {
    this.paperType = type || 'pautada';
    this.renderPaper();
    this.notifyChange();
  }

  setPaperType(type) {
    this.changePaper(type);
  }

  // Define a ferramenta ativa (caneta, borracha, marca-texto) e atualiza o cursor
  setTool(tool) {
    this.tool = tool || 'pen';
    if (this.canvas) {
      this.canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
    }
  }

  // Gera imagem composta (Padrão de Folha de Fundo + Caligrafia do Usuário)
  getDataUrl(type = 'image/png') {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || (this.canvas.width / this.dpr);
    const height = rect.height || (this.canvas.height / this.dpr);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.scale(this.dpr, this.dpr);

    // 1. Desenha a folha de fundo
    this.drawPaperOnContext(tempCtx, width, height, this.paperType);

    // 2. Sobrepõe os traços do usuário
    tempCtx.drawImage(this.canvas, 0, 0, width, height);

    return tempCanvas.toDataURL(type);
  }

  // Controle de Histórico
  saveState() {
    const dataUrl = this.canvas.toDataURL();

    // Se estiver no meio do histórico, descarta o futuro
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(dataUrl);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }

    this.updateUndoRedoUI();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  restoreState(dataUrl) {
    if (!dataUrl) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || (this.canvas.width / this.dpr);
    const height = rect.height || (this.canvas.height / this.dpr);

    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, width, height);
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;
      if (imgW > 0 && imgH > 0) {
        const scale = Math.min(width / (imgW / this.dpr), height / (imgH / this.dpr));
        const drawW = (imgW / this.dpr) * scale;
        const drawH = (imgH / this.dpr) * scale;
        const drawX = Math.max(0, (width - drawW) / 2);
        this.ctx.drawImage(img, drawX, 0, drawW, drawH);
      } else {
        this.ctx.drawImage(img, 0, 0, width, height);
      }
      this.updateUndoRedoUI();
      this.notifyChange();
    };
    img.src = dataUrl;
  }

  clearCanvas() {
    this.hasDrawn = false;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || (this.canvas.width / this.dpr);
    const height = rect.height || (this.canvas.height / this.dpr);

    this.ctx.clearRect(0, 0, width, height);
    this.renderPaper();
    this.saveState();
    this.notifyChange();
  }

  updateUndoRedoUI() {
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    if (btnUndo) btnUndo.disabled = this.historyIndex <= 0;
    if (btnRedo) btnRedo.disabled = this.historyIndex >= this.history.length - 1;
  }

  notifyChange() {
    if (this.onCanvasChange) {
      this.onCanvasChange();
    }
  }

  // Exportar como imagem PNG em alta resolução com a folha escolhida
  exportImage(filename = 'ASCD_Estudo_Biblico.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.getDataUrl('image/png');
    link.click();
  }

  // Obter Blob para salvar em banco local
  toBlob() {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, 'image/png');
    });
  }

  loadFromDataUrl(dataUrl) {
    if (!dataUrl) return;
    const img = new Image();
    img.onload = () => {
      const isFullscreen = !!this.canvas.closest('.pencil-section-fullscreen');
      const rect = this.canvas.getBoundingClientRect();
      let width = rect.width > 50 ? rect.width : (this.canvas.width / (this.dpr || 1));
      let height = rect.height > 50 ? rect.height : (this.canvas.height / (this.dpr || 1));

      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      // Se não estiver em tela cheia, adaptar a altura para a proporção fiel da caligrafia guardada
      if (!isFullscreen && imgW > 0 && imgH > 0) {
        const aspect = imgW / imgH;
        const targetH = Math.round(width / aspect);
        if (targetH >= 340 && Math.abs(targetH - height) > 10) {
          this.canvas.style.height = `${targetH}px`;
          height = targetH;
          this.canvas.height = height * this.dpr;
          this.ctx.scale(this.dpr, this.dpr);
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
        }
      }

      this.ctx.clearRect(0, 0, width, height);

      if (imgW > 0 && imgH > 0) {
        const scale = Math.min(width / (imgW / this.dpr), height / (imgH / this.dpr));
        const drawW = (imgW / this.dpr) * scale;
        const drawH = (imgH / this.dpr) * scale;
        const drawX = Math.max(0, (width - drawW) / 2);
        this.ctx.drawImage(img, drawX, 0, drawW, drawH);
      } else {
        this.ctx.drawImage(img, 0, 0, width, height);
      }

      this.hasDrawn = true;
      this.renderPaper();
      this.saveState();
    };
    img.src = dataUrl;
  }
}

// Tornar disponível globalmente
window.AscdPencilEngine = AscdPencilEngine;
