# ASCD — Bíblia & Notas

Aplicação web moderna (HTML5, CSS3, JavaScript e PWA) desenvolvida para estudo bíblico, anotações de sermões e journaling diário, com suporte híbrido para **digitação no teclado com formatação rica** e **caligrafia com Apple Pencil**, além de **exportação para DOC (.doc), Excel (.csv), PDF (.pdf)** e **integração com Google Sheets / Google Drive**.

---

## 🌟 Principais Recursos da Aplicação ASCD

### 1. 📖 Leitor Bíblico com 3 Traduções de Domínio Público
O Leitor Bíblico do ASCD oferece navegação instantânea e comparativa entre as três mais famosas e consagradas traduções bíblicas em língua portuguesa de domínio público:
- **ARC — Almeida Revista e Corrigida (1911)**: A tradução evangélica mais lida e reverenciada da história em língua portuguesa, com estilo clássico e solenidade litúrgica.
- **AA — Almeida Atualizada (1993)**: Texto de Almeida com ortografia e vocabulário atualizados para máxima clareza e fluidez devocional.
- **TB — Tradução Brasileira (1917)**: Famosa pelo rigor exegético e assessoria literária de Rui Barbosa. Notável pela estrita fidelidade aos manuscritos originais e pelo uso de *"Jeová"* no Antigo Testamento.
- **Visualização da Tradução**:
  - Seletor de versão direto na barra superior (`ARC`, `AA`, `TB`).
  - Badge distintivo no cabeçalho do capítulo indicando a versão ativa (ex: `Salmos 23 • ARC`).
  - Subtítulo com o nome oficial da tradução e indicação de Domínio Público.
- **Troca Dinâmica de Livros e Capítulos**:
  - Seleção instantânea de qualquer livro (Antigo e Novo Testamento) e qualquer capítulo.
  - O texto é atualizado imediatamente na tela e sincronizado com o Modo Dividido.
- **Pesquisa Bíblica Integrada**:
  - Pesquisa em tempo real com realce de palavras-chave.
  - Clique direto na referência (ex: `Salmos 23:1`) para pular imediatamente ao capítulo e versículo correspondentes.

---

### 2. 📊 Base de Dados para Google Sheets & Google Drive
A aplicação possui um sistema de base de dados unificada de tudo o que você escreve:
- **Botão no Topo (*"Base Google Sheets"*):** Gera e descarrega com 1 clique o arquivo completo `ASCD_Base_de_Dados_Google_Sheets.csv` contendo:
  - Todas as anotações de Sermões e Pregações
  - Todos os registros de Journaling com as suas Orações e Tarefas diárias
  - Todas as anotações do Caderno de Estudos Bíblicos
  - Todas as anotações vinculadas aos capítulos do Leitor Bíblico
- **Arquivo Pré-configurado na pasta:** O arquivo `ASCD_Base_de_Dados_Google_Sheets.csv` já está pronto na raiz do projeto com colunas padronizadas (`ID`, `Tipo_Registro`, `Data`, `Titulo_Tema`, `Passagem_Biblica`, `Pregador_Autor`, `Categoria`, `Oracao_Intercessao`, `Tarefas_Do_Dia`, `Conteudo_Texto`, `Possui_Apple_Pencil`, `Data_Registro`).
- **Como Usar no Google Drive / Google Sheets:**
  1. Abra o [Google Drive](https://drive.google.com).
  2. Arraste o arquivo `ASCD_Base_de_Dados_Google_Sheets.csv` para a sua pasta no Google Drive.
  3. Dê dois cliques no arquivo ou clique em **"Abrir com o Planilhas Google"** (*Google Sheets*).
  4. Pronto! O Google Sheets abrirá automaticamente a tabela com todas as colunas alinhadas, acentuação em português correta e histórico completo.

---

### 3. ✍️ Formatação Completa de Texto (Notas, Sermões, Journal e Modo Dividido)
Todas as áreas de redação contam com barra visual de formatação:
- **Escolha de Tipos de Letra (Font Family)**:
  - *Playfair Display* (Serif clássica e bíblica)
  - *Plus Jakarta Sans* (Sans-serif moderna e nítida)
  - *Lora* (Serif literária e editorial)
  - *Caveat* (Estilo caligráfico / manuscrito cursivo)
  - *Fira Code* (Monoespaçada estilo máquina de escrever)
- **Escolha de Tamanho de Letra (Font Size)**:
  - 12px, 14px, 16px (Padrão), 18px, 22px, 26px e 32px.
- **Negrito** (`Ctrl + B` ou botão `B`)
- **Itálico** (`Ctrl + I` ou botão `I`)
- **Sublinhar** (`Ctrl + U` ou botão `U`)
- **Três Cores de Marca-Texto (Highlighter)**:
  - 🔴 **Vermelho Claro** (`#FECDD3`)
  - 🟢 **Verde** (`#BBF7D0`)
  - 🟡 **Amarelo** (`#FEF08A`)
  - ⚪ Botão para desmarcar/limpar o realce do texto selecionado.

---

### 4. 📦 Multi-Seleção e Exportação em Lote (Sermões e Estudos)
- **Seleção Múltipla**: botão *"☑️ Selecionar Vários"* permite escolher diversas anotações ou sermões simultaneamente com caixas de seleção nos cartões.
- **Exportação em Lote**:
  - 📄 **Exportar DOC**: combina todos os itens selecionados em um único documento Word (.doc), separados por quebra de página, com seus metadados, textos e desenhos do Apple Pencil incorporados.
  - 📊 **Exportar Excel**: exporta todas as anotações selecionadas para planilha .csv (com separador `;` e codificação UTF-8 com BOM).
  - 🖨️ **Exportar PDF**: gera visualização de impressão contendo todos os registros selecionados com paginação independente pronta para PDF.
  - 🗑️ **Excluir em Lote**: exclui itens selecionados com um clique após confirmação.
- **Exportação Limpa**: sem textos promocionais nem rodapés de *"Gerado por..."*, mantendo exclusivamente os títulos, datas, pregadores, versículos, orações, tarefas e anotações originais.

---

### 5. 🔀 Modo Dividido no Leitor Bíblico (Teclado + Apple Pencil + Guardar Estudo da Página)
- **Leitura e Anotação Lado a Lado**: leia o texto sagrado à esquerda enquanto redige suas anotações à direita.
- **Entrada com Teclado e Apple Pencil**:
  - ✨ **Híbrido**: editor de texto com barra de formatação completa em cima e folha de Apple Pencil em baixo.
  - ⌨️ **Teclado**: área focada em digitação com barra rica de formatação.
  - ✍️ **Apple Pencil**: tela cheia para escrita à mão e esboços com caneta, marca-texto e rejeição de palma.
- **💾 Guardar Estudo Desta Página**:
  - Salva a anotação vinculada àquele capítulo bíblico específico (ex: *Salmos 23*).
  - Adiciona e atualiza automaticamente o estudo no **Caderno de Estudos Bíblicos**.
  - Exibe um indicador visual (*"✓ Anotação desta página guardada"*) no cabeçalho do capítulo na Bíblia para reabertura imediata a qualquer momento.

---

### 6. 📅 Journaling Diário: Oração, Tarefas e Gestão de Dias com Registro
Secção dedicada ao diário espiritual com calendário interativo perpétuo:
- **Calendário Mensal**: navegação entre meses, marcação visual com ponto dourado nos dias gravados e atalho *"Ir para Hoje"*.
- **🗑️ Apagar Registros (Individual e em Lote)**:
  - **Apagar Dia Atual**: botão *"Apagar Dia"* no cabeçalho do registro ativo para remoção imediata.
  - **Apagar 1 Dia na Lista**: ícone de lixeira individual em cada dia listado em *"Dias com Registro"*.
  - **Multi-Seleção e Exclusão em Lote**: botão *"☑️ Selecionar"* permite marcar um ou mais dias (ou *"Todos"*) e clicar em *"🗑️ Excluir"* com confirmação de segurança.
- **🙏 Seção de Oração & Intercessão**: espaço dedicado para registrar motivos de oração do dia, pedidos e agradecimentos.
- **📋 O Que Fazer Nesse Dia (Tarefas & Prioridades)**:
  - Checklist interativo para adicionar metas diárias (`+ Adicionar`).
  - Marcar/desmarcar tarefas concluídas com riscado automático.
  - Contador de progresso em tempo real (*"X de Y concluída(s)"*).
- **📖 Reflexão & Diário Espiritual**: redação livre com formatação rica e folha de Apple Pencil integrada.
- **Exportação Completa**: exporta reflexão, orações e tarefas em DOC, Excel, PDF e na Base Google Sheets.

---

### 7. 🎤 Anotações de Sermões & Pregações
- Registre cultos e conferências com campos para **Tema / Título**, **Pregador / Orador**, **Passagem Bíblica** e **Data**.
- Modos Híbrido, Teclado ou Apple Pencil.
- Busca instantânea e exportações individuais e coletivas.

---

### 8. 🎨 Paleta de Temas
- **Papiro / Pergaminho**: Tons acolhedores de manuscritos antigos.
- **Claro**: Visual limpo e contemporâneo.
- **Escuro**: Fundo preto profundo para estudo noturno sem fadiga ocular.

---

## 📲 Como Utilizar no iPad como Aplicativo Nativo (PWA)

1. Inicie o servidor local através do arquivo `iniciar_ascd.bat` ou abra `index.html`.
2. No Safari do iPad, toque no ícone de compartilhamento (**Compartilhar** ⎋).
3. Selecione **"Adicionar ao Ecrã Principal"** (*Add to Home Screen*).
4. O **ASCD** funcionará em **ecrã inteiro**, com sensibilidade ao Apple Pencil, rejeição de palma e persistência 100% offline.
