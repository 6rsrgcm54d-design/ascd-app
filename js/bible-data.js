/**
 * ASCD - Banco de Dados de Textos Bíblicos e Traduções em Português
 * Suporte às versões bíblicas:
 * 1. BPT  - Bíblia para Todos (Sociedade Bíblica de Portugal)
 * 2. NTLH - Nova Tradução na Linguagem de Hoje (SBB)
 * 3. AA   - Almeida Atualizada
 */

const BIBLE_VERSIONS = [
  {
    id: 'bpt',
    shortName: 'BPT',
    name: 'Bíblia para Todos',
    year: '2009',
    description: 'Tradução em português contemporâneo da Sociedade Bíblica de Portugal. Clara, viva e de fácil compreensão.',
    publicDomain: false
  },
  {
    id: 'ntlh',
    shortName: 'NTLH',
    name: 'Nova Tradução na Linguagem de Hoje',
    year: '2000',
    description: 'Tradução com linguagem simples, direta e acessível, ideal para leitura devocional fluida e compreensão clara.',
    publicDomain: false
  },
  {
    id: 'aa',
    shortName: 'AA',
    name: 'Almeida Atualizada',
    year: '1993',
    description: 'Texto clássico de João Ferreira de Almeida com ortografia e vocabulário atualizados, preservando rigor e reverência.',
    publicDomain: true
  }
];

const BIBLE_BOOKS = [
  // Antigo Testamento (39 Livros)
  { id: 'gn', name: 'Gênesis', test: 'AT', chapters: 50, usfm: 'GEN' },
  { id: 'ex', name: 'Êxodo', test: 'AT', chapters: 40, usfm: 'EXO' },
  { id: 'lv', name: 'Levítico', test: 'AT', chapters: 27, usfm: 'LEV' },
  { id: 'nm', name: 'Números', test: 'AT', chapters: 36, usfm: 'NUM' },
  { id: 'dt', name: 'Deuteronômio', test: 'AT', chapters: 34, usfm: 'DEU' },
  { id: 'js', name: 'Josué', test: 'AT', chapters: 24, usfm: 'JOS' },
  { id: 'jz', name: 'Juízes', test: 'AT', chapters: 21, usfm: 'JDG' },
  { id: 'rt', name: 'Rute', test: 'AT', chapters: 4, usfm: 'RUT' },
  { id: '1sm', name: '1 Samuel', test: 'AT', chapters: 31, usfm: '1SA' },
  { id: '2sm', name: '2 Samuel', test: 'AT', chapters: 24, usfm: '2SA' },
  { id: '1rs', name: '1 Reis', test: 'AT', chapters: 22, usfm: '1KI' },
  { id: '2rs', name: '2 Reis', test: 'AT', chapters: 25, usfm: '2KI' },
  { id: '1cr', name: '1 Crônicas', test: 'AT', chapters: 29, usfm: '1CH' },
  { id: '2cr', name: '2 Crônicas', test: 'AT', chapters: 36, usfm: '2CH' },
  { id: 'ed', name: 'Esdras', test: 'AT', chapters: 10, usfm: 'EZR' },
  { id: 'ne', name: 'Neemias', test: 'AT', chapters: 13, usfm: 'NEH' },
  { id: 'et', name: 'Ester', test: 'AT', chapters: 10, usfm: 'EST' },
  { id: 'job', name: 'Jó', test: 'AT', chapters: 42, usfm: 'JOB' },
  { id: 'sl', name: 'Salmos', test: 'AT', chapters: 150, usfm: 'PSA' },
  { id: 'pv', name: 'Provérbios', test: 'AT', chapters: 31, usfm: 'PRO' },
  { id: 'ec', name: 'Eclesiastes', test: 'AT', chapters: 12, usfm: 'ECC' },
  { id: 'ct', name: 'Cantares', test: 'AT', chapters: 8, usfm: 'SNG' },
  { id: 'is', name: 'Isaías', test: 'AT', chapters: 66, usfm: 'ISA' },
  { id: 'jr', name: 'Jeremias', test: 'AT', chapters: 52, usfm: 'JER' },
  { id: 'lm', name: 'Lamentações', test: 'AT', chapters: 5, usfm: 'LAM' },
  { id: 'ez', name: 'Ezequiel', test: 'AT', chapters: 48, usfm: 'EZK' },
  { id: 'dn', name: 'Daniel', test: 'AT', chapters: 12, usfm: 'DAN' },
  { id: 'os', name: 'Oseias', test: 'AT', chapters: 14, usfm: 'HOS' },
  { id: 'jl', name: 'Joel', test: 'AT', chapters: 3, usfm: 'JOL' },
  { id: 'am', name: 'Amós', test: 'AT', chapters: 9, usfm: 'AMO' },
  { id: 'ob', name: 'Obadias', test: 'AT', chapters: 1, usfm: 'OBA' },
  { id: 'jn', name: 'Jonas', test: 'AT', chapters: 4, usfm: 'JON' },
  { id: 'mq', name: 'Miqueias', test: 'AT', chapters: 7, usfm: 'MIC' },
  { id: 'na', name: 'Naum', test: 'AT', chapters: 3, usfm: 'NAM' },
  { id: 'hc', name: 'Habacuque', test: 'AT', chapters: 3, usfm: 'HAB' },
  { id: 'sf', name: 'Sofonias', test: 'AT', chapters: 3, usfm: 'ZEP' },
  { id: 'ag', name: 'Ageu', test: 'AT', chapters: 2, usfm: 'HAG' },
  { id: 'zc', name: 'Zacarias', test: 'AT', chapters: 14, usfm: 'ZEC' },
  { id: 'ml', name: 'Malaquias', test: 'AT', chapters: 4, usfm: 'MAL' },

  // Novo Testamento (27 Livros)
  { id: 'mt', name: 'Mateus', test: 'NT', chapters: 28, usfm: 'MAT' },
  { id: 'mc', name: 'Marcos', test: 'NT', chapters: 16, usfm: 'MRK' },
  { id: 'lc', name: 'Lucas', test: 'NT', chapters: 24, usfm: 'LUK' },
  { id: 'jo', name: 'João', test: 'NT', chapters: 21, usfm: 'JHN' },
  { id: 'at', name: 'Atos', test: 'NT', chapters: 28, usfm: 'ACT' },
  { id: 'rm', name: 'Romanos', test: 'NT', chapters: 16, usfm: 'ROM' },
  { id: '1co', name: '1 Coríntios', test: 'NT', chapters: 16, usfm: '1CO' },
  { id: '2co', name: '2 Coríntios', test: 'NT', chapters: 13, usfm: '2CO' },
  { id: 'gl', name: 'Gálatas', test: 'NT', chapters: 6, usfm: 'GAL' },
  { id: 'ef', name: 'Efésios', test: 'NT', chapters: 6, usfm: 'EPH' },
  { id: 'fl', name: 'Filipenses', test: 'NT', chapters: 4, usfm: 'PHP' },
  { id: 'cl', name: 'Colossenses', test: 'NT', chapters: 4, usfm: 'COL' },
  { id: '1ts', name: '1 Tessalonicenses', test: 'NT', chapters: 5, usfm: '1TH' },
  { id: '2ts', name: '2 Tessalonicenses', test: 'NT', chapters: 3, usfm: '2TH' },
  { id: '1tm', name: '1 Timóteo', test: 'NT', chapters: 6, usfm: '1TI' },
  { id: '2tm', name: '2 Timóteo', test: 'NT', chapters: 4, usfm: '2TI' },
  { id: 'tt', name: 'Tito', test: 'NT', chapters: 3, usfm: 'TIT' },
  { id: 'fm', name: 'Filemom', test: 'NT', chapters: 1, usfm: 'PHM' },
  { id: 'hb', name: 'Hebreus', test: 'NT', chapters: 13, usfm: 'HEB' },
  { id: 'tg', name: 'Tiago', test: 'NT', chapters: 5, usfm: 'JAS' },
  { id: '1pe', name: '1 Pedro', test: 'NT', chapters: 5, usfm: '1PE' },
  { id: '2pe', name: '2 Pedro', test: 'NT', chapters: 3, usfm: '2PE' },
  { id: '1jo', name: '1 João', test: 'NT', chapters: 5, usfm: '1JN' },
  { id: '2jo', name: '2 João', test: 'NT', chapters: 1, usfm: '2JN' },
  { id: '3jo', name: '3 João', test: 'NT', chapters: 1, usfm: '3JN' },
  { id: 'jd', name: 'Judas', test: 'NT', chapters: 1, usfm: 'JUD' },
  { id: 'ap', name: 'Apocalipse', test: 'NT', chapters: 22, usfm: 'REV' }
];

const BIBLE_TEXTS = {
  "sl-23": {
    "book": "Salmos",
    "chapter": 23,
    "title": "O Bom Pastor",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Salmo da coleção de David. O Senhor é o meu pastor : nada me falta."
        },
        {
          "num": 2,
          "text": "Em verdes pastos me faz descansar e conduz-me a lugares de águas tranquilas."
        },
        {
          "num": 3,
          "text": "Conforta a minha alma e leva-me por caminhos retos, honrando o seu bom nome."
        },
        {
          "num": 4,
          "text": "Ainda que eu atravesse o vale da sombra da morte, não terei receio de nada, porque tu, Senhor , estás comigo. O teu bordão e o teu cajado dão-me segurança."
        },
        {
          "num": 5,
          "text": "Preparaste-me um banquete à frente dos meus inimigos. Recebeste-me com todas as honras e a minha taça transborda."
        },
        {
          "num": 6,
          "text": "A tua bondade e o teu amor acompanham-me todos os dias da minha vida. E habitarei na casa do Senhor , ao longo dos meus dias."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "O SENHOR é o meu pastor: nada me faltará."
        },
        {
          "num": 2,
          "text": "Ele me faz descansar em pastos verdes e me leva a águas tranquilas."
        },
        {
          "num": 3,
          "text": "O SENHOR renova as minhas forças e me guia por caminhos certos, como ele mesmo prometeu."
        },
        {
          "num": 4,
          "text": "Ainda que eu ande por um vale escuro como a morte, não terei medo de nada. Pois tu, ó SENHOR Deus, estás comigo; tu me proteges e me diriges."
        },
        {
          "num": 5,
          "text": "Preparas um banquete para mim, onde os meus inimigos me podem ver. Tu me recebes como convidado de honra e enches o meu copo até derramar."
        },
        {
          "num": 6,
          "text": "Certamente a tua bondade e o teu amor ficarão comigo enquanto eu viver. E na tua casa, ó SENHOR, morarei todos os dias da minha vida."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "O SENHOR é o meu pastor; nada me faltará."
        },
        {
          "num": 2,
          "text": "Ele me faz repousar em pastos verdejantes. Leva-me para junto das águas de descanso;"
        },
        {
          "num": 3,
          "text": "refrigera-me a alma. Guia-me pelas veredas da justiça por amor do seu nome."
        },
        {
          "num": 4,
          "text": "Ainda que eu ande pelo vale da sombra da morte, não temerei mal nenhum, porque tu estás comigo; o teu bordão e o teu cajado me consolam."
        },
        {
          "num": 5,
          "text": "Preparas-me uma mesa na presença dos meus adversários, unges-me a cabeça com óleo; o meu cálice transborda."
        },
        {
          "num": 6,
          "text": "Bondade e misericórdia certamente me seguirão todos os dias da minha vida; e habitarei na Casa do SENHOR para todo o sempre."
        }
      ]
    }
  },
  "sl-91": {
    "book": "Salmos",
    "chapter": 91,
    "title": "A Segurança Daquele que Confia em Deus",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Aquele que habita sob a proteção do Altíssimo e mora à sombra do Omnipotente,"
        },
        {
          "num": 2,
          "text": "pode exclamar: «Ó Senhor , tu és o meu refúgio, o meu castelo, o meu Deus, em quem confio!»"
        },
        {
          "num": 3,
          "text": "Na verdade, ele há de livrar-te de armadilhas ocultas e proteger-te contra venenos mortais."
        },
        {
          "num": 4,
          "text": "Ele te cobrirá com as suas asas e ficarás seguro sob os seus cuidados; com o seu poder te protegerá e defenderá!"
        },
        {
          "num": 5,
          "text": "Não tenhas medo dos perigos da noite, nem das setas lançadas de dia,"
        },
        {
          "num": 6,
          "text": "nem da peste que alastra nas trevas, nem dos males que matam em pleno dia;"
        },
        {
          "num": 7,
          "text": "mil cairão mortos à tua esquerda e dez mil à tua direita, mas tu não serás atingido."
        },
        {
          "num": 8,
          "text": "Basta que abras os olhos, para veres como os maus são punidos."
        },
        {
          "num": 9,
          "text": "Porque tu fizeste do Senhor o refúgio; do Altíssimo a tua proteção."
        },
        {
          "num": 10,
          "text": "Por isso, nenhum mal te acontecerá, nenhuma doença chegará à tua casa,"
        },
        {
          "num": 11,
          "text": "porque Deus há de enviar-te os seus anjos , para que te guardem em todos os teus caminhos."
        },
        {
          "num": 12,
          "text": "Eles segurar-te-ão com as suas mãos, para que não tropeces em pedra nenhuma ."
        },
        {
          "num": 13,
          "text": "Poderás caminhar por cima de serpentes e víboras e calcar aos pés leões e dragões."
        },
        {
          "num": 14,
          "text": "Deus diz: «hei de livrar aqueles que me amam, hei de protegê-los, porque reconhecem o meu nome."
        },
        {
          "num": 15,
          "text": "Quando me invocarem, hei de responder-lhes, quando estiverem aflitos, estarei com eles; hei de livrá-los e enchê-los de honras."
        },
        {
          "num": 16,
          "text": "Hei de recompensá-los com uma vida longa e ficarão a conhecer a minha salvação.»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "A pessoa que procura segurança no Deus Altíssimo e se abriga na sombra protetora do Todo-Poderoso"
        },
        {
          "num": 2,
          "text": "pode dizer a ele: “Ó SENHOR Deus, tu és o meu defensor e o meu protetor. Tu és o meu Deus; eu confio em ti.”"
        },
        {
          "num": 3,
          "text": "Deus livrará você de perigos escondidos e de doenças mortais."
        },
        {
          "num": 4,
          "text": "Ele o cobrirá com as suas asas, e debaixo delas você estará seguro. A fidelidade de Deus o protegerá como um escudo."
        },
        {
          "num": 5,
          "text": "Você não terá medo dos perigos da noite nem de assaltos durante o dia."
        },
        {
          "num": 6,
          "text": "Não terá medo da peste que se espalha na escuridão nem dos males que matam ao meio-dia."
        },
        {
          "num": 7,
          "text": "Ainda que mil pessoas sejam mortas ao seu lado, e dez mil, ao seu redor, você não sofrerá nada."
        },
        {
          "num": 8,
          "text": "Você olhará e verá como os maus são castigados."
        },
        {
          "num": 9,
          "text": "Você fez do SENHOR Deus o seu protetor e, do Altíssimo, o seu defensor;"
        },
        {
          "num": 10,
          "text": "por isso, nenhum desastre lhe acontecerá, e a violência não chegará perto da sua casa."
        },
        {
          "num": 11,
          "text": "Deus mandará que os anjos dele cuidem de você para protegê-lo aonde quer que você for."
        },
        {
          "num": 12,
          "text": "Eles vão segurá-lo com as suas mãos, para que nem mesmo os seus pés sejam feridos nas pedras."
        },
        {
          "num": 13,
          "text": "Com os pés você esmagará leões e cobras, leões ferozes e serpentes venenosas."
        },
        {
          "num": 14,
          "text": "Deus diz: “Eu salvarei aqueles que me amam e protegerei os que reconhecem que eu sou Deus, o SENHOR."
        },
        {
          "num": 15,
          "text": "Quando eles me chamarem, eu responderei e estarei com eles nas horas de aflição. Eu os livrarei e farei com que sejam respeitados."
        },
        {
          "num": 16,
          "text": "Como recompensa, eu lhes darei vida longa e mostrarei que sou o seu Salvador.”"
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "O que habita no esconderijo do Altíssimo e descansa à sombra do Onipotente"
        },
        {
          "num": 2,
          "text": "diz ao SENHOR: Meu refúgio e meu baluarte, Deus meu, em quem confio."
        },
        {
          "num": 3,
          "text": "Pois ele te livrará do laço do passarinheiro e da peste perniciosa."
        },
        {
          "num": 4,
          "text": "Cobrir-te-á com as suas penas, e, sob suas asas, estarás seguro; a sua verdade é pavês e escudo."
        },
        {
          "num": 5,
          "text": "Não te assustarás do terror noturno, nem da seta que voa de dia,"
        },
        {
          "num": 6,
          "text": "nem da peste que se propaga nas trevas, nem da mortandade que assola ao meio-dia."
        },
        {
          "num": 7,
          "text": "Caiam mil ao teu lado, e dez mil, à tua direita; tu não serás atingido."
        },
        {
          "num": 8,
          "text": "Somente com os teus olhos contemplarás e verás o castigo dos ímpios."
        },
        {
          "num": 9,
          "text": "Pois disseste: O SENHOR é o meu refúgio. Fizeste do Altíssimo a tua morada."
        },
        {
          "num": 10,
          "text": "Nenhum mal te sucederá, praga nenhuma chegará à tua tenda."
        },
        {
          "num": 11,
          "text": "Porque aos seus anjos dará ordens a teu respeito, para que te guardem em todos os teus caminhos."
        },
        {
          "num": 12,
          "text": "Eles te sustentarão nas suas mãos, para não tropeçares nalguma pedra."
        },
        {
          "num": 13,
          "text": "Pisarás o leão e a áspide, calcarás aos pés o leãozinho e a serpente."
        },
        {
          "num": 14,
          "text": "Porque a mim se apegou com amor, eu o livrarei; pô-lo-ei a salvo, porque conhece o meu nome."
        },
        {
          "num": 15,
          "text": "Ele me invocará, e eu lhe responderei; na sua angústia eu estarei com ele, livrá-lo-ei e o glorificarei."
        },
        {
          "num": 16,
          "text": "Saciá-lo-ei com longevidade e lhe mostrarei a minha salvação."
        }
      ]
    }
  },
  "sl-121": {
    "book": "Salmos",
    "chapter": 121,
    "title": "O Socorro que Vem do Alto",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Cântico de peregrinação. Levanto os olhos para a montanha, de onde me virá o auxílio."
        },
        {
          "num": 2,
          "text": "O meu auxílio vem do Senhor , que fez o céu e a terra."
        },
        {
          "num": 3,
          "text": "Ele não te deixará cair; aquele que te protege está sempre alerta!"
        },
        {
          "num": 4,
          "text": "Aquele que protege Israel não dorme, está sempre alerta."
        },
        {
          "num": 5,
          "text": "É o Senhor que te protege e está ao teu lado, para te guardar."
        },
        {
          "num": 6,
          "text": "O Sol não te fará mal durante o dia, nem de noite a Lua te incomodará."
        },
        {
          "num": 7,
          "text": "O Senhor protege-te de todo o mal; é ele que protege a tua vida."
        },
        {
          "num": 8,
          "text": "O Senhor te protege quando sais e quando voltas, agora e para sempre."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Olho para os montes e pergunto: “De onde virá o meu socorro?”"
        },
        {
          "num": 2,
          "text": "O meu socorro vem do SENHOR Deus, que fez o céu e a terra."
        },
        {
          "num": 3,
          "text": "Ele, o seu protetor, está sempre alerta e não deixará que você caia."
        },
        {
          "num": 4,
          "text": "O protetor do povo de Israel nunca dorme, nem cochila."
        },
        {
          "num": 5,
          "text": "O SENHOR guardará você; ele está sempre ao seu lado para protegê-lo."
        },
        {
          "num": 6,
          "text": "O sol não lhe fará mal de dia, nem a lua, de noite."
        },
        {
          "num": 7,
          "text": "O SENHOR guardará você de todo perigo; ele protegerá a sua vida."
        },
        {
          "num": 8,
          "text": "Ele o guardará quando você for e quando voltar, agora e sempre."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Elevo os olhos para os montes: de onde me virá o socorro?"
        },
        {
          "num": 2,
          "text": "O meu socorro vem do SENHOR, que fez o céu e a terra."
        },
        {
          "num": 3,
          "text": "Ele não permitirá que os teus pés vacilem; não dormitará aquele que te guarda."
        },
        {
          "num": 4,
          "text": "É certo que não dormita, nem dorme o guarda de Israel."
        },
        {
          "num": 5,
          "text": "O SENHOR é quem te guarda; o SENHOR é a tua sombra à tua direita."
        },
        {
          "num": 6,
          "text": "De dia não te molestará o sol, nem de noite, a lua."
        },
        {
          "num": 7,
          "text": "O SENHOR te guardará de todo mal; guardará a tua alma."
        },
        {
          "num": 8,
          "text": "O SENHOR guardará a tua saída e a tua entrada, desde agora e para sempre."
        }
      ]
    }
  },
  "sl-1": {
    "book": "Salmos",
    "chapter": 1,
    "title": "O Justo e o Ímpio",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Feliz o homem que não segue o conselho dos maus, não se detém no caminho dos pecadores, nem toma parte na reunião dos provocadores!"
        },
        {
          "num": 2,
          "text": "Antes põe toda a sua alegria na lei do Senhor e nela medita de dia e de noite."
        },
        {
          "num": 3,
          "text": "Ele é como uma árvore plantada à beira da água corrente, que dá o seu fruto na estação própria e cujas folhas não murcham . Em tudo o que faz é bem sucedido."
        },
        {
          "num": 4,
          "text": "Mas os maus não são assim; são como a palha que o vento leva."
        },
        {
          "num": 5,
          "text": "Pois os maus não resistirão no julgamento , nem os pecadores na assembleia dos justos ."
        },
        {
          "num": 6,
          "text": "O Senhor protege o caminho dos justos , mas o caminho dos maus conduz à perdição."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Felizes são aqueles que não se deixam levar pelos conselhos dos maus, que não seguem o exemplo dos que não querem saber de Deus e que não se juntam com os que zombam de tudo o que é sagrado!"
        },
        {
          "num": 2,
          "text": "Pelo contrário, o prazer deles está na lei do SENHOR, e nessa lei eles meditam dia e noite."
        },
        {
          "num": 3,
          "text": "Essas pessoas são como árvores que crescem na beira de um riacho; elas dão frutas no tempo certo, e as suas folhas não murcham. Assim também tudo o que essas pessoas fazem dá certo."
        },
        {
          "num": 4,
          "text": "O mesmo não acontece com os maus; eles são como a palha que o vento leva."
        },
        {
          "num": 5,
          "text": "No Dia do Juízo eles serão condenados e ficarão separados dos que obedecem a Deus."
        },
        {
          "num": 6,
          "text": "Pois o SENHOR dirige e abençoa a vida daqueles que lhe obedecem, porém o fim dos maus são a desgraça e a morte."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Bem-aventurado o homem que não anda no conselho dos ímpios, não se detém no caminho dos pecadores, nem se assenta na roda dos escarnecedores."
        },
        {
          "num": 2,
          "text": "Antes, o seu prazer está na lei do SENHOR, e na sua lei medita de dia e de noite."
        },
        {
          "num": 3,
          "text": "Ele é como árvore plantada junto a corrente de águas, que, no devido tempo, dá o seu fruto, e cuja folhagem não murcha; e tudo quanto ele faz será bem-sucedido."
        },
        {
          "num": 4,
          "text": "Os ímpios não são assim; são, porém, como a palha que o vento dispersa."
        },
        {
          "num": 5,
          "text": "Por isso, os perversos não prevalecerão no juízo, nem os pecadores, na congregação dos justos."
        },
        {
          "num": 6,
          "text": "Pois o SENHOR conhece o caminho dos justos, mas o caminho dos ímpios perecerá."
        }
      ]
    }
  },
  "sl-46": {
    "book": "Salmos",
    "chapter": 46,
    "title": "Deus é o Nosso Refúgio e Fortaleza",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Ao diretor do coro. Cântico da coleção dos descendentes de Corá."
        },
        {
          "num": 2,
          "text": "Deus é o nosso refúgio e a nossa força; é a nossa ajuda nos momentos de angústia."
        },
        {
          "num": 3,
          "text": "Por isso, não temos medo, mesmo que a terra se ponha a tremer, mesmo que as montanhas se afundem no mar;"
        },
        {
          "num": 4,
          "text": "mesmo que as águas rujam furiosas e os montes tremam com o seu embate."
        },
        {
          "num": 5,
          "text": "Um rio alegra com os seus canais a cidade de Deus, a mais santa entre as moradas do Altíssimo."
        },
        {
          "num": 6,
          "text": "Deus está no meio dela, não pode vacilar; Deus irá em seu auxílio ao romper do dia."
        },
        {
          "num": 7,
          "text": "As nações murmuram, os reinos agitam-se. Ele faz ouvir a sua voz e a terra estremece."
        },
        {
          "num": 8,
          "text": "O Senhor todo-poderoso está connosco! O Deus de Jacob é o nosso refúgio!"
        },
        {
          "num": 9,
          "text": "Venham contemplar as obras do Senhor , as coisas surpreendentes que ele fez sobre a terra."
        },
        {
          "num": 10,
          "text": "Ele acaba com as guerras no mundo inteiro; quebra os arcos e despedaça as lanças; põe fogo aos escudos !"
        },
        {
          "num": 11,
          "text": "«Parem! Reconheçam que eu sou Deus! Serei supremo entre as nações, supremo em toda a terra!»"
        },
        {
          "num": 12,
          "text": "O Senhor todo-poderoso está connosco! O Deus de Jacob é o nosso refúgio!"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Deus é o nosso refúgio e a nossa força, socorro que não falta em tempos de aflição."
        },
        {
          "num": 2,
          "text": "Por isso, não teremos medo, ainda que a terra seja abalada, e as montanhas caiam nas profundezas do oceano."
        },
        {
          "num": 3,
          "text": "Não teremos medo, ainda que os mares se agitem e rujam, e os montes tremam violentamente."
        },
        {
          "num": 4,
          "text": "Há um rio que alegra a cidade de Deus, a casa sagrada do Altíssimo."
        },
        {
          "num": 5,
          "text": "Deus vive nessa cidade, e ela nunca será destruída; de manhã bem cedo, Deus a ajudará."
        },
        {
          "num": 6,
          "text": "As nações ficam apavoradas, e os reinos são abalados. Deus troveja, e a terra se desfaz."
        },
        {
          "num": 7,
          "text": "O SENHOR Todo-Poderoso está do nosso lado; o Deus de Jacó é o nosso refúgio."
        },
        {
          "num": 8,
          "text": "Venham, vejam o que o SENHOR tem feito! Vejam que coisas espantosas ele tem feito na terra!"
        },
        {
          "num": 9,
          "text": "Ele acaba com as guerras no mundo inteiro; quebra os arcos, despedaça as lanças e destrói os escudos no fogo."
        },
        {
          "num": 10,
          "text": "Ele diz: “Parem de lutar e fiquem sabendo que eu sou Deus. Eu sou o Rei das nações, o Rei do mundo inteiro.”"
        },
        {
          "num": 11,
          "text": "O SENHOR Todo-Poderoso está do nosso lado; o Deus de Jacó é o nosso refúgio."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Deus é o nosso refúgio e fortaleza, socorro bem-presente nas tribulações."
        },
        {
          "num": 2,
          "text": "Portanto, não temeremos ainda que a terra se transtorne e os montes se abalem no seio dos mares;"
        },
        {
          "num": 3,
          "text": "ainda que as águas tumultuem e espumejem e na sua fúria os montes se estremeçam."
        },
        {
          "num": 4,
          "text": "Há um rio, cujas correntes alegram a cidade de Deus, o santuário das moradas do Altíssimo."
        },
        {
          "num": 5,
          "text": "Deus está no meio dela; jamais será abalada; Deus a ajudará desde antemanhã."
        },
        {
          "num": 6,
          "text": "Bramam nações, reinos se abalam; ele faz ouvir a sua voz, e a terra se dissolve."
        },
        {
          "num": 7,
          "text": "O SENHOR dos Exércitos está conosco; o Deus de Jacó é o nosso refúgio."
        },
        {
          "num": 8,
          "text": "Vinde, contemplai as obras do SENHOR, que assolações efetuou na terra."
        },
        {
          "num": 9,
          "text": "Ele põe termo à guerra até aos confins do mundo, quebra o arco e despedaça a lança; queima os carros no fogo."
        },
        {
          "num": 10,
          "text": "Aquietai-vos e sabei que eu sou Deus; sou exaltado entre as nações, sou exaltado na terra."
        },
        {
          "num": 11,
          "text": "O SENHOR dos Exércitos está conosco; o Deus de Jacó é o nosso refúgio."
        }
      ]
    }
  },
  "sl-100": {
    "book": "Salmos",
    "chapter": 100,
    "title": "Ação de Graças e Louvor",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Salmo de ação de graças. Cantem ao Senhor com entusiasmo, habitantes de toda a terra!"
        },
        {
          "num": 2,
          "text": "Adorem o Senhor com alegria, vão à sua presença com cânticos de júbilo!"
        },
        {
          "num": 3,
          "text": "Não se esqueçam que o Senhor é Deus; foi ele que nos criou e nós pertencemos-lhe; somos o seu povo e ele é o nosso pastor !"
        },
        {
          "num": 4,
          "text": "Entrem no seu templo em ação de graças; entrem nos seus átrios com hinos; louvem-no e bendigam o seu nome!"
        },
        {
          "num": 5,
          "text": "O Senhor é bom! O seu amor é eterno! Ele permanecerá fiel para sempre."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Cantem hinos a Deus, o SENHOR, todos os moradores da terra!"
        },
        {
          "num": 2,
          "text": "Adorem o SENHOR com alegria e venham cantando até a sua presença."
        },
        {
          "num": 3,
          "text": "Lembrem que o SENHOR é Deus. Ele nos fez, e nós somos dele; somos o seu povo, o seu rebanho."
        },
        {
          "num": 4,
          "text": "Entrem pelos portões do Templo com ações de graças, entrem nos seus pátios com louvor. Louvem a Deus e sejam agradecidos a ele."
        },
        {
          "num": 5,
          "text": "Pois o SENHOR é bom; o seu amor dura para sempre, e a sua fidelidade não tem fim."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Celebrai com júbilo ao SENHOR, todas as terras."
        },
        {
          "num": 2,
          "text": "Servi ao SENHOR com alegria, apresentai-vos diante dele com cântico."
        },
        {
          "num": 3,
          "text": "Sabei que o SENHOR é Deus; foi ele quem nos fez, e dele somos; somos o seu povo e rebanho do seu pastoreio."
        },
        {
          "num": 4,
          "text": "Entrai por suas portas com ações de graças e nos seus átrios, com hinos de louvor; rendei-lhe graças e bendizei-lhe o nome."
        },
        {
          "num": 5,
          "text": "Porque o SENHOR é bom, a sua misericórdia dura para sempre, e, de geração em geração, a sua fidelidade."
        }
      ]
    }
  },
  "gn-1": {
    "book": "Gênesis",
    "chapter": 1,
    "title": "A Criação dos Céus e da Terra",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "No princípio, quando Deus criou o céu e a terra ,"
        },
        {
          "num": 2,
          "text": "a terra estava sem forma e sem ordem. Era um mar profundo coberto de escuridão; mas sobre as águas pairava o Espírito de Deus ."
        },
        {
          "num": 3,
          "text": "Então Deus disse: «Que a luz exista!» E a luz começou a existir."
        },
        {
          "num": 4,
          "text": "Deus achou que a luz era uma coisa boa e separou-a da escuridão."
        },
        {
          "num": 5,
          "text": "E Deus chamou à luz dia e à escuridão, noite. Passou uma tarde e veio a manhã: o dia um."
        },
        {
          "num": 6,
          "text": "Depois Deus disse: «Que exista um firmamento entre as águas, para as separar umas das outras.»"
        },
        {
          "num": 7,
          "text": "E Deus fez então o firmamento, separando assim as águas que estão do lado de baixo das que estão do lado de cima . E assim aconteceu."
        },
        {
          "num": 8,
          "text": "Deus chamou céu a este firmamento. Passou uma tarde e veio a manhã: o segundo dia."
        },
        {
          "num": 9,
          "text": "Deus disse então: «Que as águas que estão debaixo do céu se juntem num único lugar e que fique à vista a terra firme.» E assim aconteceu."
        },
        {
          "num": 10,
          "text": "Deus chamou terra à terra firme e chamou mar às águas assim reunidas. E achou que tudo aquilo eram coisas boas."
        },
        {
          "num": 11,
          "text": "Deus disse ainda: «Que a terra produza ervas e plantas que deem semente e árvores que deem fruto, cada uma conforme a sua qualidade e que o fruto contenha a semente própria.» E assim aconteceu."
        },
        {
          "num": 12,
          "text": "A terra produziu toda a espécie de ervas, que dão semente, conforme a sua qualidade, e árvores de fruto, com a semente própria de cada uma. E Deus achou que aquilo eram coisas boas."
        },
        {
          "num": 13,
          "text": "Passou uma tarde e veio a manhã: o terceiro dia."
        },
        {
          "num": 14,
          "text": "Deus disse então: «Que existam luzeiros no firmamento, para distinguirem o dia da noite; e que eles sirvam de sinal para marcar as divisões do tempo, os dias e os anos."
        },
        {
          "num": 15,
          "text": "E que esses luzeiros, colocados no céu , sirvam também para iluminar a terra.» E assim aconteceu."
        },
        {
          "num": 16,
          "text": "Deus fez os dois grandes luzeiros: o maior deles, o Sol, para presidir ao dia, e o mais pequeno, a Lua, para presidir à noite, e ainda as estrelas."
        },
        {
          "num": 17,
          "text": "Colocou-os no firmamento, para iluminarem a terra"
        },
        {
          "num": 18,
          "text": "e presidirem ao dia e à noite, fazendo assim a separação entre a luz e a escuridão. E Deus achou que aquilo eram coisas boas."
        },
        {
          "num": 19,
          "text": "Passou uma tarde e veio a manhã: o quarto dia."
        },
        {
          "num": 20,
          "text": "Deus disse depois: «Que as águas sejam povoadas de seres vivos e que entre a terra e o firmamento haja aves a voar.»"
        },
        {
          "num": 21,
          "text": "E Deus criou os grandes cetáceos e toda a espécie de seres vivos que se movem e povoam as águas e ainda todas as espécies de aves. E Deus achou que eram coisas boas"
        },
        {
          "num": 22,
          "text": "e abençoou-os desta maneira: «Sejam férteis e cresçam; encham as águas do mar e que, em terra, as aves se multipliquem também.»"
        },
        {
          "num": 23,
          "text": "Passou uma tarde e veio a manhã: o quinto dia."
        },
        {
          "num": 24,
          "text": "Depois Deus disse: «Que a terra produza toda a espécie de seres vivos: animais domésticos, animais selvagens e todos os bichos, conforme as suas diferentes espécies.» E assim aconteceu."
        },
        {
          "num": 25,
          "text": "Deus criou todas as espécies de animais selvagens, de animais domésticos e todos os bichos. E achou que todos eram coisas boas."
        },
        {
          "num": 26,
          "text": "Deus disse ainda: «Façamos o ser humano à nossa imagem e semelhança. Que ele tenha poder sobre os peixes do mar e as aves do céu; sobre os animais domésticos e selvagens e sobre todos os bichos que andam sobre a terra.»"
        },
        {
          "num": 27,
          "text": "Deus criou então o ser humano à sua imagem; criou-o como verdadeira imagem de Deus . E este ser humano criado por Deus é o homem e a mulher ."
        },
        {
          "num": 28,
          "text": "Deus abençoou-os desta maneira: «Sejam férteis e cresçam; encham a terra e dominem-na; dominem sobre os peixes do mar e as aves do céu e sobre todos os animais que andam sobre a terra.»"
        },
        {
          "num": 29,
          "text": "Deus continuou: «Dou-vos todas as plantas que produzem semente e que existem em qualquer parte da terra e todas as árvores de fruto, com a sua semente própria. É isso que devem comer."
        },
        {
          "num": 30,
          "text": "Dou todas as verduras como alimento aos animais e aves, a todos os seres vivos que andam sobre a terra.» E assim aconteceu."
        },
        {
          "num": 31,
          "text": "E Deus achou que tudo aquilo que tinha feito era muito bom. Passou uma tarde e veio a manhã: o sexto dia."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "No começo Deus criou os céus e a terra."
        },
        {
          "num": 2,
          "text": "A terra era um vazio, sem nenhum ser vivente, e estava coberta por um mar profundo. A escuridão cobria o mar, e o Espírito de Deus se movia por cima da água."
        },
        {
          "num": 3,
          "text": "Então Deus disse: — Que haja luz! E a luz começou a existir."
        },
        {
          "num": 4,
          "text": "Deus viu que a luz era boa e a separou da escuridão."
        },
        {
          "num": 5,
          "text": "Deus pôs na luz o nome de “dia” e na escuridão pôs o nome de “noite”. A noite passou, e veio a manhã. Esse foi o primeiro dia."
        },
        {
          "num": 6,
          "text": "Então Deus disse: — Que haja no meio da água uma divisão para separá-la em duas partes!"
        },
        {
          "num": 7,
          "text": "E assim aconteceu. Deus fez uma divisão que separou a água em duas partes: uma parte ficou do lado de baixo da divisão, e a outra parte ficou do lado de cima."
        },
        {
          "num": 8,
          "text": "Nessa divisão Deus pôs o nome de “céu”. A noite passou, e veio a manhã. Esse foi o segundo dia."
        },
        {
          "num": 9,
          "text": "Aí Deus disse: — Que a água que está debaixo do céu se ajunte num só lugar a fim de que apareça a terra seca! E assim aconteceu."
        },
        {
          "num": 10,
          "text": "Deus pôs na parte seca o nome de “terra” e nas águas que se haviam ajuntado ele pôs o nome de “mares”. E Deus viu que o que havia feito era bom."
        },
        {
          "num": 11,
          "text": "Em seguida ele disse: — Que a terra produza todo tipo de vegetais, isto é, plantas que deem sementes e árvores que deem frutas! E assim aconteceu."
        },
        {
          "num": 12,
          "text": "A terra produziu todo tipo de vegetais: plantas que dão sementes e árvores que dão frutas. E Deus viu que o que havia feito era bom."
        },
        {
          "num": 13,
          "text": "A noite passou, e veio a manhã. Esse foi o terceiro dia."
        },
        {
          "num": 14,
          "text": "Então Deus disse: — Que haja luzes no céu para separarem o dia da noite e para marcarem os dias, os anos e as estações!"
        },
        {
          "num": 15,
          "text": "Essas luzes brilharão no céu para iluminar a terra. E assim aconteceu."
        },
        {
          "num": 16,
          "text": "Deus fez as duas grandes luzes: a maior para governar o dia e a menor para governar a noite. E fez também as estrelas."
        },
        {
          "num": 17,
          "text": "Deus pôs essas luzes no céu para iluminarem a terra,"
        },
        {
          "num": 18,
          "text": "para governarem o dia e a noite e para separarem a luz da escuridão. E Deus viu que o que havia feito era bom."
        },
        {
          "num": 19,
          "text": "A noite passou, e veio a manhã. Esse foi o quarto dia."
        },
        {
          "num": 20,
          "text": "Depois Deus disse: — Que as águas fiquem cheias de todo tipo de seres vivos, e que na terra haja aves que voem no ar!"
        },
        {
          "num": 21,
          "text": "Assim Deus criou os grandes monstros do mar, e todas as espécies de seres vivos que em grande quantidade se movem nas águas, e criou também todas as espécies de aves. E Deus viu que o que havia feito era bom."
        },
        {
          "num": 22,
          "text": "Ele abençoou os seres vivos do mar e disse: — Aumentem muito em número e encham as águas dos mares! E que as aves se multipliquem na terra!"
        },
        {
          "num": 23,
          "text": "A noite passou, e veio a manhã. Esse foi o quinto dia."
        },
        {
          "num": 24,
          "text": "Então Deus disse: — Que a terra produza todo tipo de animais: domésticos, selvagens e os que se arrastam pelo chão, cada um de acordo com a sua espécie! E assim aconteceu."
        },
        {
          "num": 25,
          "text": "Deus fez os animais, cada um de acordo com a sua espécie: os animais domésticos, os selvagens e os que se arrastam pelo chão. E Deus viu que o que havia feito era bom."
        },
        {
          "num": 26,
          "text": "Aí ele disse: — Agora vamos fazer os seres humanos, que serão como nós, que se parecerão conosco. Eles terão poder sobre os peixes, sobre as aves, sobre os animais domésticos e selvagens e sobre os animais que se arrastam pelo chão."
        },
        {
          "num": 27,
          "text": "Assim Deus criou os seres humanos; ele os criou parecidos com Deus. Ele os criou homem e mulher"
        },
        {
          "num": 28,
          "text": "e os abençoou, dizendo: — Tenham muitos e muitos filhos; espalhem-se por toda a terra e a dominem. E tenham poder sobre os peixes do mar, sobre as aves que voam no ar e sobre os animais que se arrastam pelo chão."
        },
        {
          "num": 29,
          "text": "Para vocês se alimentarem, eu lhes dou todas as plantas que produzem sementes e todas as árvores que dão frutas."
        },
        {
          "num": 30,
          "text": "Mas, para todos os animais selvagens, para as aves e para os animais que se arrastam pelo chão, dou capim e verduras como alimento. E assim aconteceu."
        },
        {
          "num": 31,
          "text": "E Deus viu que tudo o que havia feito era muito bom. A noite passou, e veio a manhã. Esse foi o sexto dia."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "No princípio, criou Deus os céus e a terra."
        },
        {
          "num": 2,
          "text": "A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas."
        },
        {
          "num": 3,
          "text": "Disse Deus: Haja luz; e houve luz."
        },
        {
          "num": 4,
          "text": "E viu Deus que a luz era boa; e fez separação entre a luz e as trevas."
        },
        {
          "num": 5,
          "text": "Chamou Deus à luz Dia e às trevas, Noite. Houve tarde e manhã, o primeiro dia."
        },
        {
          "num": 6,
          "text": "E disse Deus: Haja firmamento no meio das águas e separação entre águas e águas."
        },
        {
          "num": 7,
          "text": "Fez, pois, Deus o firmamento e separação entre as águas debaixo do firmamento e as águas sobre o firmamento. E assim se fez."
        },
        {
          "num": 8,
          "text": "E chamou Deus ao firmamento Céus. Houve tarde e manhã, o segundo dia."
        },
        {
          "num": 9,
          "text": "Disse também Deus: Ajuntem-se as águas debaixo dos céus num só lugar, e apareça a porção seca. E assim se fez."
        },
        {
          "num": 10,
          "text": "À porção seca chamou Deus Terra e ao ajuntamento das águas, Mares. E viu Deus que isso era bom."
        },
        {
          "num": 11,
          "text": "E disse: Produza a terra relva, ervas que deem semente e árvores frutíferas que deem fruto segundo a sua espécie, cuja semente esteja nele, sobre a terra. E assim se fez."
        },
        {
          "num": 12,
          "text": "A terra, pois, produziu relva, ervas que davam semente segundo a sua espécie e árvores que davam fruto, cuja semente estava nele, conforme a sua espécie. E viu Deus que isso era bom."
        },
        {
          "num": 13,
          "text": "Houve tarde e manhã, o terceiro dia."
        },
        {
          "num": 14,
          "text": "Disse também Deus: Haja luzeiros no firmamento dos céus, para fazerem separação entre o dia e a noite; e sejam eles para sinais, para estações, para dias e anos."
        },
        {
          "num": 15,
          "text": "E sejam para luzeiros no firmamento dos céus, para alumiar a terra. E assim se fez."
        },
        {
          "num": 16,
          "text": "Fez Deus os dois grandes luzeiros: o maior para governar o dia, e o menor para governar a noite; e fez também as estrelas."
        },
        {
          "num": 17,
          "text": "E os colocou no firmamento dos céus para alumiarem a terra,"
        },
        {
          "num": 18,
          "text": "para governarem o dia e a noite e fazerem separação entre a luz e as trevas. E viu Deus que isso era bom."
        },
        {
          "num": 19,
          "text": "Houve tarde e manhã, o quarto dia."
        },
        {
          "num": 20,
          "text": "Disse também Deus: Povoem-se as águas de enxames de seres viventes; e voem as aves sobre a terra, sob o firmamento dos céus."
        },
        {
          "num": 21,
          "text": "Criou, pois, Deus os grandes animais marinhos e todos os seres viventes que rastejam, os quais povoavam as águas, segundo as suas espécies; e todas as aves, segundo as suas espécies. E viu Deus que isso era bom."
        },
        {
          "num": 22,
          "text": "E Deus os abençoou, dizendo: Sede fecundos, multiplicai-vos e enchei as águas dos mares; e, na terra, se multipliquem as aves."
        },
        {
          "num": 23,
          "text": "Houve tarde e manhã, o quinto dia."
        },
        {
          "num": 24,
          "text": "Disse também Deus: Produza a terra seres viventes, conforme a sua espécie: animais domésticos, répteis e animais selváticos, segundo a sua espécie. E assim se fez."
        },
        {
          "num": 25,
          "text": "E fez Deus os animais selváticos, segundo a sua espécie, e os animais domésticos, conforme a sua espécie, e todos os répteis da terra, conforme a sua espécie. E viu Deus que isso era bom."
        },
        {
          "num": 26,
          "text": "Também disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; tenha ele domínio sobre os peixes do mar, sobre as aves dos céus, sobre os animais domésticos, sobre toda a terra e sobre todos os répteis que rastejam pela terra."
        },
        {
          "num": 27,
          "text": "Criou Deus, pois, o homem à sua imagem, à imagem de Deus o criou; homem e mulher os criou."
        },
        {
          "num": 28,
          "text": "E Deus os abençoou e lhes disse: Sede fecundos, multiplicai-vos, enchei a terra e sujeitai-a; dominai sobre os peixes do mar, sobre as aves dos céus e sobre todo animal que rasteja pela terra."
        },
        {
          "num": 29,
          "text": "E disse Deus ainda: Eis que vos tenho dado todas as ervas que dão semente e se acham na superfície de toda a terra e todas as árvores em que há fruto que dê semente; isso vos será para mantimento."
        },
        {
          "num": 30,
          "text": "E a todos os animais da terra, e a todas as aves dos céus, e a todos os répteis da terra, em que há fôlego de vida, toda erva verde lhes será para mantimento. E assim se fez."
        },
        {
          "num": 31,
          "text": "Viu Deus tudo quanto fizera, e eis que era muito bom. Houve tarde e manhã, o sexto dia."
        }
      ]
    }
  },
  "gn-2": {
    "book": "Gênesis",
    "chapter": 2,
    "title": "O Sétimo Dia e a Criação do Homem",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Assim ficaram completos o céu e a terra, com tudo aquilo que contêm."
        },
        {
          "num": 2,
          "text": "No sétimo dia, Deus tinha completado a sua obra e nesse sétimo dia Deus descansou dos trabalhos que tinha vindo a fazer."
        },
        {
          "num": 3,
          "text": "Deus abençoou o sétimo dia e fez dele um dia sagrado, pois foi o dia em que ele descansou de todo o trabalho de criação que tinha feito."
        },
        {
          "num": 4,
          "text": "É esta a história da criação do céu e da terra. A terra era um jardim Quando o Senhor Deus fez a terra e o céu,"
        },
        {
          "num": 5,
          "text": "ainda não havia plantas na terra nem tinha brotado a erva. É que o Senhor Deus não tinha feito cair a chuva sobre a terra nem existia nenhum ser humano para trabalhar nela,"
        },
        {
          "num": 6,
          "text": "mas uma corrente de água começava a brotar da terra e regava os campos."
        },
        {
          "num": 7,
          "text": "O Senhor Deus modelou o homem com barro da terra. Soprou-lhe nas narinas e deu-lhe respiração e vida. E o homem tornou-se um ser vivo."
        },
        {
          "num": 8,
          "text": "O Senhor Deus preparou um jardim em Éden , lá para o oriente, e colocou nele o homem que tinha modelado."
        },
        {
          "num": 9,
          "text": "Da terra, fez nascer toda a espécie de árvores que eram agradáveis à vista e davam bons frutos para comer. No meio do jardim estava a árvore da vida e a árvore do conhecimento do bem e do mal ."
        },
        {
          "num": 10,
          "text": "Em Éden nasce um rio que rega o jardim e depois se divide em quatro rios diferentes."
        },
        {
          "num": 11,
          "text": "O nome do primeiro é o Pichon, que rodeia a terra de Havilá, onde há muito ouro."
        },
        {
          "num": 12,
          "text": "O ouro daquela terra é muito bom e há lá também âmbar e lápis-lazúli."
        },
        {
          "num": 13,
          "text": "O segundo rio chama-se Guion, que rodeia toda a terra de Cuche ."
        },
        {
          "num": 14,
          "text": "O terceiro rio chama-se Hidéquel , que passa na zona oriental da Assíria . E o quarto rio é o Eufrates."
        },
        {
          "num": 15,
          "text": "O Senhor Deus colocou o homem no jardim do Éden, para nele trabalhar e para o guardar."
        },
        {
          "num": 16,
          "text": "E deu-lhe estas ordens: «Podes comer do fruto de qualquer árvore, menos do fruto da árvore do conhecimento do bem e do mal."
        },
        {
          "num": 17,
          "text": "Deste não podes comer de maneira nenhuma. No dia em que dele comeres, ficas condenado a morrer .»"
        },
        {
          "num": 18,
          "text": "O Senhor Deus disse ainda: «Não é bom que o homem fique sozinho. Vou-lhe arranjar uma companhia apropriada.»"
        },
        {
          "num": 19,
          "text": "E o Senhor Deus modelou também de terra muitas espécies de animais selvagens e de aves e apresentou-os ao homem, para ver que nome ele lhes dava. O nome que ele dava a cada um desses seres vivos é o nome com que ficaram."
        },
        {
          "num": 20,
          "text": "O homem deu nome a todos os animais domésticos, às aves e aos animais selvagens, mas nenhum era a companhia apropriada para ele."
        },
        {
          "num": 21,
          "text": "O Senhor Deus fez com que o homem adormecesse e dormisse um sono muito profundo. Durante o sono, tirou-lhe uma das costelas e fez crescer de novo a carne naquele lugar."
        },
        {
          "num": 22,
          "text": "Da costela que tinha tirado do homem, o Senhor Deus fez a mulher e apresentou-a ao homem ."
        },
        {
          "num": 23,
          "text": "Este declarou: «Desta vez, aqui está alguém feito dos meus próprios ossos e da minha própria carne. Vai chamar-se mulher; porque foi formada do homem .»"
        },
        {
          "num": 24,
          "text": "Por isso, o homem deixa a casa do pai e da mãe para se unir com a sua mulher e ficam a ser um só corpo ."
        },
        {
          "num": 25,
          "text": "Tanto o homem como a mulher andavam nus, sem sentirem nenhuma vergonha por isso."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Assim terminou a criação do céu, e da terra, e de tudo o que há neles."
        },
        {
          "num": 2,
          "text": "No sétimo dia Deus acabou de fazer todas as coisas e descansou de todo o trabalho que havia feito."
        },
        {
          "num": 3,
          "text": "Então abençoou o sétimo dia e o separou como um dia sagrado, pois nesse dia ele acabou de fazer todas as coisas e descansou."
        },
        {
          "num": 4,
          "text": "E foi assim que o céu e a terra foram criados. Quando o SENHOR Deus fez o céu e a terra,"
        },
        {
          "num": 5,
          "text": "não haviam brotado nem capim nem plantas, pois o SENHOR ainda não tinha mandado chuvas, e não havia ninguém para cultivar a terra."
        },
        {
          "num": 6,
          "text": "Mas da terra saía uma corrente de água que regava o chão."
        },
        {
          "num": 7,
          "text": "Então, do pó da terra, o SENHOR formou o ser humano. O SENHOR soprou no nariz dele uma respiração de vida, e assim ele se tornou um ser vivo."
        },
        {
          "num": 8,
          "text": "Depois o SENHOR Deus plantou um jardim na região do Éden, no Leste, e ali pôs o ser humano que ele havia formado."
        },
        {
          "num": 9,
          "text": "O SENHOR fez com que ali crescessem árvores lindas de todos os tipos, que davam frutas boas de se comer. No meio do jardim ficava a árvore que dá vida e também a árvore que dá o conhecimento do bem e do mal."
        },
        {
          "num": 10,
          "text": "No Éden nascia um rio que regava o jardim e que, saindo dali, se dividia, formando quatro rios."
        },
        {
          "num": 11,
          "text": "O primeiro é o Pisom, que rodeia a região de Havilá, onde há ouro."
        },
        {
          "num": 12,
          "text": "O ouro dessa região é puro, e ali também há um perfume raro e pedras preciosas."
        },
        {
          "num": 13,
          "text": "O segundo rio se chama Giom; ele dá volta por toda a região de Cuche."
        },
        {
          "num": 14,
          "text": "O terceiro rio é o Tigre, que passa a leste da Assíria. E o quarto rio é o Eufrates."
        },
        {
          "num": 15,
          "text": "Então o SENHOR Deus pôs o homem no jardim do Éden, para cuidar dele e nele fazer plantações."
        },
        {
          "num": 16,
          "text": "E o SENHOR deu ao homem a seguinte ordem: — Você pode comer as frutas de qualquer árvore do jardim,"
        },
        {
          "num": 17,
          "text": "menos da árvore que dá o conhecimento do bem e do mal. Não coma a fruta dessa árvore; pois, no dia em que você a comer, certamente morrerá."
        },
        {
          "num": 18,
          "text": "Depois o SENHOR disse: — Não é bom que o homem viva sozinho. Vou fazer para ele alguém que o ajude como se fosse a sua outra metade."
        },
        {
          "num": 19,
          "text": "Depois que o SENHOR Deus formou da terra todos os animais selvagens e todas as aves, ele os levou ao homem para que pusesse nome neles. E eles ficaram com o nome que o homem lhes deu."
        },
        {
          "num": 20,
          "text": "Ele pôs nomes nas aves e em todos os animais domésticos e selvagens. Mas para Adão não se achava uma ajudadora que fosse como a sua outra metade."
        },
        {
          "num": 21,
          "text": "Então o SENHOR Deus fez com que o homem caísse num sono profundo. Enquanto ele dormia, Deus tirou uma das suas costelas e fechou a carne naquele lugar."
        },
        {
          "num": 22,
          "text": "Dessa costela o SENHOR formou uma mulher e a levou ao homem."
        },
        {
          "num": 23,
          "text": "Então o homem disse: “Agora sim! Esta é carne da minha carne e osso dos meus ossos. Ela será chamada de ‘mulher’ porque Deus a tirou do homem.”"
        },
        {
          "num": 24,
          "text": "É por isso que o homem deixa o seu pai e a sua mãe para se unir com a sua mulher, e os dois se tornam uma só pessoa."
        },
        {
          "num": 25,
          "text": "Tanto o homem como a sua mulher estavam nus, mas não sentiam vergonha."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Assim, pois, foram acabados os céus e a terra e todo o seu exército."
        },
        {
          "num": 2,
          "text": "E, havendo Deus terminado no dia sétimo a sua obra, que fizera, descansou nesse dia de toda a sua obra que tinha feito."
        },
        {
          "num": 3,
          "text": "E abençoou Deus o dia sétimo e o santificou; porque nele descansou de toda a obra que, como Criador, fizera."
        },
        {
          "num": 4,
          "text": "Esta é a gênese dos céus e da terra quando foram criados, quando o SENHOR Deus os criou."
        },
        {
          "num": 5,
          "text": "Não havia ainda nenhuma planta do campo na terra, pois ainda nenhuma erva do campo havia brotado; porque o SENHOR Deus não fizera chover sobre a terra, e também não havia homem para lavrar o solo."
        },
        {
          "num": 6,
          "text": "Mas uma neblina subia da terra e regava toda a superfície do solo."
        },
        {
          "num": 7,
          "text": "Então, formou o SENHOR Deus ao homem do pó da terra e lhe soprou nas narinas o fôlego de vida, e o homem passou a ser alma vivente."
        },
        {
          "num": 8,
          "text": "E plantou o SENHOR Deus um jardim no Éden, na direção do Oriente, e pôs nele o homem que havia formado."
        },
        {
          "num": 9,
          "text": "Do solo fez o SENHOR Deus brotar toda sorte de árvores agradáveis à vista e boas para alimento; e também a árvore da vida no meio do jardim e a árvore do conhecimento do bem e do mal."
        },
        {
          "num": 10,
          "text": "E saía um rio do Éden para regar o jardim e dali se dividia, repartindo-se em quatro braços."
        },
        {
          "num": 11,
          "text": "O primeiro chama-se Pisom; é o que rodeia a terra de Havilá, onde há ouro."
        },
        {
          "num": 12,
          "text": "O ouro dessa terra é bom; também se encontram lá o bdélio e a pedra de ônix."
        },
        {
          "num": 13,
          "text": "O segundo rio chama-se Giom; é o que circunda a terra de Cuxe."
        },
        {
          "num": 14,
          "text": "O nome do terceiro rio é Tigre; é o que corre pelo oriente da Assíria. E o quarto é o Eufrates."
        },
        {
          "num": 15,
          "text": "Tomou, pois, o SENHOR Deus ao homem e o colocou no jardim do Éden para o cultivar e o guardar."
        },
        {
          "num": 16,
          "text": "E o SENHOR Deus lhe deu esta ordem: De toda árvore do jardim comerás livremente,"
        },
        {
          "num": 17,
          "text": "mas da árvore do conhecimento do bem e do mal não comerás; porque, no dia em que dela comeres, certamente morrerás."
        },
        {
          "num": 18,
          "text": "Disse mais o SENHOR Deus: Não é bom que o homem esteja só; far-lhe-ei uma auxiliadora que lhe seja idônea."
        },
        {
          "num": 19,
          "text": "Havendo, pois, o SENHOR Deus formado da terra todos os animais do campo e todas as aves dos céus, trouxe-os ao homem, para ver como este lhes chamaria; e o nome que o homem desse a todos os seres viventes, esse seria o nome deles."
        },
        {
          "num": 20,
          "text": "Deu nome o homem a todos os animais domésticos, às aves dos céus e a todos os animais selváticos; para o homem, todavia, não se achava uma auxiliadora que lhe fosse idônea."
        },
        {
          "num": 21,
          "text": "Então, o SENHOR Deus fez cair pesado sono sobre o homem, e este adormeceu; tomou uma das suas costelas e fechou o lugar com carne."
        },
        {
          "num": 22,
          "text": "E a costela que o SENHOR Deus tomara ao homem, transformou-a numa mulher e lha trouxe."
        },
        {
          "num": 23,
          "text": "E disse o homem: Esta, afinal, é osso dos meus ossos e carne da minha carne; chamar-se-á varoa, porquanto do varão foi tomada."
        },
        {
          "num": 24,
          "text": "Por isso, deixa o homem pai e mãe e se une à sua mulher, tornando-se os dois uma só carne."
        },
        {
          "num": 25,
          "text": "Ora, um e outro, o homem e sua mulher, estavam nus e não se envergonhavam."
        }
      ]
    }
  },
  "pv-3": {
    "book": "Provérbios",
    "chapter": 3,
    "title": "Confiança no Senhor e os Frutos da Sabedoria",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Meu filho, não te esqueças dos meus ensinamentos e guarda no teu coração os meus preceitos;"
        },
        {
          "num": 2,
          "text": "eles aumentarão os teus dias de vida e te darão mais anos de prosperidade."
        },
        {
          "num": 3,
          "text": "Pratica sempre a bondade e a lealdade: trá-las contigo como um colar e grava-as no teu coração."
        },
        {
          "num": 4,
          "text": "Assim terás o favor e o apreço da parte de Deus e dos homens."
        },
        {
          "num": 5,
          "text": "Confia no Senhor de todo o teu coração: não te fies na tua própria inteligência."
        },
        {
          "num": 6,
          "text": "Apoia-te nele em tudo o que empreenderes e ele te mostrará como deves agir."
        },
        {
          "num": 7,
          "text": "Não te julgues demasiado sábio; respeita o Senhor e afasta-te do mal."
        },
        {
          "num": 8,
          "text": "Isso será como remédio para a tua saúde: dará força e vigor ao teu corpo."
        },
        {
          "num": 9,
          "text": "Honra o Senhor com os teus haveres e com os primeiros frutos das tuas colheitas;"
        },
        {
          "num": 10,
          "text": "os teus celeiros se encherão de trigo e os teus lagares transbordarão de vinho."
        },
        {
          "num": 11,
          "text": "Meu filho, não rejeites a correção do Senhor nem te desgostes com as suas repreensões,"
        },
        {
          "num": 12,
          "text": "porque o Senhor corrige as faltas daqueles que ama, como um pai a um filho querido."
        },
        {
          "num": 13,
          "text": "Feliz o homem que atinge a sabedoria; feliz aquele que adquire inteligência;"
        },
        {
          "num": 14,
          "text": "pois isso vale mais do que a prata e rende mais do que o ouro puro."
        },
        {
          "num": 15,
          "text": "A sabedoria é mais preciosa do que as joias; nada do que possas desejar se lhe pode comparar."
        },
        {
          "num": 16,
          "text": "A sabedoria oferece-te, por um lado, longa vida e, por outro, riquezas e glória."
        },
        {
          "num": 17,
          "text": "Seguir os seus passos é agradável; pelos seus caminhos vai-se em segurança."
        },
        {
          "num": 18,
          "text": "A sabedoria é uma árvore de vida para aqueles que a praticam; felizes os que a alcançam."
        },
        {
          "num": 19,
          "text": "Pela sua sabedoria o Senhor firmou a terra e pela sua inteligência criou o céu."
        },
        {
          "num": 20,
          "text": "Pelo seu conhecimento brotam as águas da terra, e das nuvens faz sair a chuva."
        },
        {
          "num": 21,
          "text": "Conserva a ponderação e a prudência; nunca as percas de vista, meu filho."
        },
        {
          "num": 22,
          "text": "Elas serão para ti uma fonte de vida e um motivo mais de encanto."
        },
        {
          "num": 23,
          "text": "Assim caminharás com segurança, sem tropeçar em nenhum obstáculo."
        },
        {
          "num": 24,
          "text": "À noite deitar-te-ás sem receios; descansarás e o teu sono será tranquilo."
        },
        {
          "num": 25,
          "text": "Não temerás os perigos imprevistos nem a desgraça que cairá sobre os malfeitores,"
        },
        {
          "num": 26,
          "text": "porque o Senhor te guardará em segurança e evitará que caias em alguma cilada."
        },
        {
          "num": 27,
          "text": "Se estiver na tua mão poder fazê-lo, nunca negues um favor a quem dele precisa."
        },
        {
          "num": 28,
          "text": "Não digas ao teu semelhante que volte amanhã, se o podes ajudar já hoje."
        },
        {
          "num": 29,
          "text": "Não intentes fazer mal ao vizinho que deposita toda a confiança em ti."
        },
        {
          "num": 30,
          "text": "Não litigues com ninguém sem razão, se ninguém te fez mal."
        },
        {
          "num": 31,
          "text": "Não tenhas inveja das pessoas violentas, nem imites o seu procedimento."
        },
        {
          "num": 32,
          "text": "O Senhor abomina os perversos, mas dá a sua amizade aos homens justos ."
        },
        {
          "num": 33,
          "text": "O Senhor amaldiçoa a casa dos maus, mas abençoa a habitação dos justos."
        },
        {
          "num": 34,
          "text": "Ele despreza os que o desprezam, mas trata os humildes com bondade."
        },
        {
          "num": 35,
          "text": "A honra é o prémio dos sábios; aos insensatos está reservada a desonra."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Filho, não esqueça os meus ensinamentos; lembre sempre dos meus conselhos."
        },
        {
          "num": 2,
          "text": "Os meus ensinamentos lhe darão uma vida longa e cheia de sucesso."
        },
        {
          "num": 3,
          "text": "Não abandone a lealdade e a fidelidade; guarde-as sempre bem-gravadas no coração."
        },
        {
          "num": 4,
          "text": "Se você fizer isso, agradará tanto a Deus como aos seres humanos."
        },
        {
          "num": 5,
          "text": "Confie no SENHOR de todo o coração e não se apoie na sua própria inteligência."
        },
        {
          "num": 6,
          "text": "Lembre de Deus em tudo o que fizer, e ele lhe mostrará o caminho certo."
        },
        {
          "num": 7,
          "text": "Não fique pensando que você é sábio; tema o SENHOR e não faça nada que seja errado."
        },
        {
          "num": 8,
          "text": "Pois isso será como um bom remédio para curar as suas feridas e aliviar os seus sofrimentos."
        },
        {
          "num": 9,
          "text": "Adore a Deus, oferecendo-lhe o que a sua terra produz de melhor."
        },
        {
          "num": 10,
          "text": "Faça isso, e os seus depósitos ficarão cheios de cereais, e você terá tanto vinho, que não será capaz de armazenar."
        },
        {
          "num": 11,
          "text": "Filho, preste atenção quando o SENHOR Deus o castiga e não se desanime quando ele o repreende."
        },
        {
          "num": 12,
          "text": "Porque o SENHOR corrige quem ele ama, assim como um pai corrige o filho a quem ele quer bem."
        },
        {
          "num": 13,
          "text": "Feliz é a pessoa que acha a sabedoria e que consegue compreender as coisas,"
        },
        {
          "num": 14,
          "text": "pois isso é melhor do que a prata e tem mais valor do que o ouro."
        },
        {
          "num": 15,
          "text": "A sabedoria é mais preciosa do que as joias; tudo o que a gente deseja não se pode comparar com ela."
        },
        {
          "num": 16,
          "text": "A sabedoria oferece uma vida longa e também riquezas e honras."
        },
        {
          "num": 17,
          "text": "Ela torna a vida agradável e guia a pessoa com segurança em tudo o que faz."
        },
        {
          "num": 18,
          "text": "Os que se tornam sábios são felizes, e a sabedoria lhes dará vida."
        },
        {
          "num": 19,
          "text": "Com a Sabedoria o SENHOR Deus criou a terra; e com o seu conhecimento colocou o céu no lugar próprio."
        },
        {
          "num": 20,
          "text": "A sua sabedoria fez os rios nascerem e fez as nuvens darem chuva à terra."
        },
        {
          "num": 21,
          "text": "Filho, tenha sempre sabedoria e compreensão e nunca deixe que elas se afastem de você."
        },
        {
          "num": 22,
          "text": "Elas lhe darão vida, uma vida agradável e feliz."
        },
        {
          "num": 23,
          "text": "Você caminhará seguro e não tropeçará."
        },
        {
          "num": 24,
          "text": "Quando se deitar, não terá medo, e o seu sono será tranquilo a noite inteira."
        },
        {
          "num": 25,
          "text": "Você não ficará preocupado com os desastres que caem de repente como uma tempestade sobre os maus."
        },
        {
          "num": 26,
          "text": "Pois o SENHOR Deus lhe dará segurança e nunca deixará você cair numa armadilha."
        },
        {
          "num": 27,
          "text": "Sempre que puder, ajude os necessitados."
        },
        {
          "num": 28,
          "text": "Não diga ao seu vizinho que espere até amanhã, se você pode ajudá-lo hoje."
        },
        {
          "num": 29,
          "text": "Não planeje nenhum mal contra o seu vizinho; ele mora ao seu lado e confia em você."
        },
        {
          "num": 30,
          "text": "Nunca discuta sem motivo com alguém que não lhe fez nenhum mal."
        },
        {
          "num": 31,
          "text": "Não tenha inveja dos violentos, nem faça o que eles fazem,"
        },
        {
          "num": 32,
          "text": "pois o SENHOR Deus detesta os que praticam o mal, mas é amigo dos que são direitos."
        },
        {
          "num": 33,
          "text": "O SENHOR amaldiçoa a casa dos maus, porém abençoa o lar dos que são corretos."
        },
        {
          "num": 34,
          "text": "Ele zomba dos que zombam dele, mas ajuda os humildes."
        },
        {
          "num": 35,
          "text": "Os sábios ganharão prestígio, mas os que não têm juízo passarão cada vez mais vergonha."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Filho meu, não te esqueças dos meus ensinos, e o teu coração guarde os meus mandamentos;"
        },
        {
          "num": 2,
          "text": "porque eles aumentarão os teus dias e te acrescentarão anos de vida e paz."
        },
        {
          "num": 3,
          "text": "Não te desamparem a benignidade e a fidelidade; ata-as ao pescoço; escreve-as na tábua do teu coração"
        },
        {
          "num": 4,
          "text": "e acharás graça e boa compreensão diante de Deus e dos homens."
        },
        {
          "num": 5,
          "text": "Confia no SENHOR de todo o teu coração e não te estribes no teu próprio entendimento."
        },
        {
          "num": 6,
          "text": "Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas."
        },
        {
          "num": 7,
          "text": "Não sejas sábio aos teus próprios olhos; teme ao SENHOR e aparta-te do mal;"
        },
        {
          "num": 8,
          "text": "será isto saúde para o teu corpo e refrigério, para os teus ossos."
        },
        {
          "num": 9,
          "text": "Honra ao SENHOR com os teus bens e com as primícias de toda a tua renda;"
        },
        {
          "num": 10,
          "text": "e se encherão fartamente os teus celeiros, e transbordarão de vinho os teus lagares."
        },
        {
          "num": 11,
          "text": "Filho meu, não rejeites a disciplina do SENHOR, nem te enfades da sua repreensão."
        },
        {
          "num": 12,
          "text": "Porque o SENHOR repreende a quem ama, assim como o pai, ao filho a quem quer bem."
        },
        {
          "num": 13,
          "text": "Feliz o homem que acha sabedoria, e o homem que adquire conhecimento;"
        },
        {
          "num": 14,
          "text": "porque melhor é o lucro que ela dá do que o da prata, e melhor a sua renda do que o ouro mais fino."
        },
        {
          "num": 15,
          "text": "Mais preciosa é do que pérolas, e tudo o que podes desejar não é comparável a ela."
        },
        {
          "num": 16,
          "text": "O alongar-se da vida está na sua mão direita, na sua esquerda, riquezas e honra."
        },
        {
          "num": 17,
          "text": "Os seus caminhos são caminhos deliciosos, e todas as suas veredas, paz."
        },
        {
          "num": 18,
          "text": "É árvore de vida para os que a alcançam, e felizes são todos os que a retêm."
        },
        {
          "num": 19,
          "text": "O SENHOR com sabedoria fundou a terra, com inteligência estabeleceu os céus."
        },
        {
          "num": 20,
          "text": "Pelo seu conhecimento os abismos se rompem, e as nuvens destilam orvalho."
        },
        {
          "num": 21,
          "text": "Filho meu, não se apartem estas coisas dos teus olhos; guarda a verdadeira sabedoria e o bom siso;"
        },
        {
          "num": 22,
          "text": "porque serão vida para a tua alma e adorno ao teu pescoço."
        },
        {
          "num": 23,
          "text": "Então, andarás seguro no teu caminho, e não tropeçará o teu pé."
        },
        {
          "num": 24,
          "text": "Quando te deitares, não temerás; deitar-te-ás, e o teu sono será suave."
        },
        {
          "num": 25,
          "text": "Não temas o pavor repentino, nem a arremetida dos perversos, quando vier."
        },
        {
          "num": 26,
          "text": "Porque o SENHOR será a tua segurança e guardará os teus pés de serem presos."
        },
        {
          "num": 27,
          "text": "Não te furtes a fazer o bem a quem de direito, estando na tua mão o poder de fazê-lo."
        },
        {
          "num": 28,
          "text": "Não digas ao teu próximo: Vai e volta amanhã; então, to darei, se o tens agora contigo."
        },
        {
          "num": 29,
          "text": "Não maquines o mal contra o teu próximo, pois habita junto de ti confiadamente."
        },
        {
          "num": 30,
          "text": "Jamais pleiteies com alguém sem razão, se te não houver feito mal."
        },
        {
          "num": 31,
          "text": "Não tenhas inveja do homem violento, nem sigas nenhum de seus caminhos;"
        },
        {
          "num": 32,
          "text": "porque o SENHOR abomina o perverso, mas aos retos trata com intimidade."
        },
        {
          "num": 33,
          "text": "A maldição do SENHOR habita na casa do perverso, porém a morada dos justos ele abençoa."
        },
        {
          "num": 34,
          "text": "Certamente, ele escarnece dos escarnecedores, mas dá graça aos humildes."
        },
        {
          "num": 35,
          "text": "Os sábios herdarão honra, mas os loucos tomam sobre si a ignomínia."
        }
      ]
    }
  },
  "pv-4": {
    "book": "Provérbios",
    "chapter": 4,
    "title": "Instrução Paternal e a Guarda do Coração",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Filhos, oiçam as advertências dum pai; estejam atentos para adquirirem conhecimento."
        },
        {
          "num": 2,
          "text": "Pois a instrução que vos dou é boa; não abandonem os meus ensinamentos."
        },
        {
          "num": 3,
          "text": "Também eu tive um pai para me educar e fui amado ternamente por minha mãe."
        },
        {
          "num": 4,
          "text": "Meu pai ensinava-me assim: «Grava as minhas palavras no teu coração , faz o que te ordeno e viverás."
        },
        {
          "num": 5,
          "text": "Adquire sabedoria e entendimento; não esqueças nem te desvies dos meus conselhos."
        },
        {
          "num": 6,
          "text": "Não abandones a sabedoria e ela te guardará; ama-a e ela te protegerá."
        },
        {
          "num": 7,
          "text": "Acima de tudo, adquire sabedoria e conhecimento, ainda que te custem tudo o que possuis."
        },
        {
          "num": 8,
          "text": "Conquista-a e ela te engrandecerá; abraça-a e ela te honrará,"
        },
        {
          "num": 9,
          "text": "e colocará um diadema na tua cabeça, coroando-te, assim, de esplendor.»"
        },
        {
          "num": 10,
          "text": "Escuta e acolhe as minhas palavras, meu filho; fá-las tuas e terás mais anos de vida."
        },
        {
          "num": 11,
          "text": "Ensinei-te o caminho da sabedoria e a maneira de te comportares com retidão."
        },
        {
          "num": 12,
          "text": "Assim não terás dificuldades no teu caminho, nem tropeçarás, quando correres."
        },
        {
          "num": 13,
          "text": "Mantém-te fiel a esta instrução e não a deixes; põe-na em prática e ela te dará vida."
        },
        {
          "num": 14,
          "text": "Não sigas os passos dos malfeitores, nem imites o procedimento dos maus."
        },
        {
          "num": 15,
          "text": "Evita-os, não passes por eles; desvia-te deles e passa de largo;"
        },
        {
          "num": 16,
          "text": "pois eles não adormecem sem terem feito mal; perdem o sono, se não fizerem cair alguém."
        },
        {
          "num": 17,
          "text": "De facto, a maldade e a violência são para eles como comida e bebida."
        },
        {
          "num": 18,
          "text": "O caminho dos justos é como a luz da aurora, que vai aumentando até ser dia claro;"
        },
        {
          "num": 19,
          "text": "o caminho dos malfeitores é só escuridão: nem conseguem ver aquilo em que tropeçam."
        },
        {
          "num": 20,
          "text": "Meu filho, escuta as minhas palavras e presta atenção aos meus conselhos."
        },
        {
          "num": 21,
          "text": "Não se afastem deles os teus olhos e grava-os bem no teu coração."
        },
        {
          "num": 22,
          "text": "Pois eles são vida para quem os alcança e saúde para todas as suas doenças."
        },
        {
          "num": 23,
          "text": "Vigia acima de tudo o teu pensamento, porque dele depende a tua vida."
        },
        {
          "num": 24,
          "text": "Evita dizer falsidades; afasta-te da mentira."
        },
        {
          "num": 25,
          "text": "Olha sempre em frente, sem desviar os olhos do teu caminho."
        },
        {
          "num": 26,
          "text": "Vê bem onde pões os pés e que o terreno que pisas seja sempre firme."
        },
        {
          "num": 27,
          "text": "Não te desvies para a direita nem para a esquerda; afasta os teus passos do mal."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Filhos, escutem o que o seu pai ensina. Prestem atenção e compreenderão as coisas."
        },
        {
          "num": 2,
          "text": "O que eu ensino é bom; portanto, lembrem dos meus conselhos."
        },
        {
          "num": 3,
          "text": "Quando eu era menino, filho único dos meus pais,"
        },
        {
          "num": 4,
          "text": "o meu pai me ensinava, dizendo: — Lembre das minhas palavras e nunca as esqueça. Faça o que eu digo e você viverá."
        },
        {
          "num": 5,
          "text": "Procure conseguir sabedoria e compreensão. Não esqueça, nem se afaste do que eu digo."
        },
        {
          "num": 6,
          "text": "Não abandone a sabedoria, e ela protegerá você. Ame-a, e ela lhe dará segurança."
        },
        {
          "num": 7,
          "text": "Para ter sabedoria, é preciso primeiro pagar o seu preço. Use tudo o que você tem para conseguir a compreensão."
        },
        {
          "num": 8,
          "text": "Ame a sabedoria, e ela o tornará importante; abrace-a e você será respeitado."
        },
        {
          "num": 9,
          "text": "A sabedoria será para você um enfeite, como se fosse uma linda coroa."
        },
        {
          "num": 10,
          "text": "Escute, meu filho. Aceite o que estou dizendo e você terá uma vida longa."
        },
        {
          "num": 11,
          "text": "Eu lhe tenho ensinado o caminho da sabedoria e a maneira certa de viver."
        },
        {
          "num": 12,
          "text": "Se você andar sabiamente, nada atrapalhará o seu caminho, e você não tropeçará quando correr."
        },
        {
          "num": 13,
          "text": "Lembre sempre daquilo que aprendeu. A sua educação é a sua vida; guarde-a bem."
        },
        {
          "num": 14,
          "text": "Não vá aonde vão os maus. Não siga o exemplo deles."
        },
        {
          "num": 15,
          "text": "Não faça o que eles fazem. Afaste-se do mal. Desvie-se dele e passe de lado."
        },
        {
          "num": 16,
          "text": "Os maus não podem dormir sem ter feito alguma coisa má; eles ficam acordados até conseguirem prejudicar alguém."
        },
        {
          "num": 17,
          "text": "Porque para eles a maldade e a violência são comida e bebida."
        },
        {
          "num": 18,
          "text": "A estrada em que caminham as pessoas direitas é como a luz da aurora, que brilha cada vez mais até ser dia claro."
        },
        {
          "num": 19,
          "text": "Mas a estrada dos maus é escura como a noite; eles caem e não podem ver no que foi que tropeçaram."
        },
        {
          "num": 20,
          "text": "Filho, preste atenção no que eu digo. Escute as minhas palavras."
        },
        {
          "num": 21,
          "text": "Nunca deixe que elas se afastem de você. Lembre delas e ame-as."
        },
        {
          "num": 22,
          "text": "Elas darão vida longa e saúde a quem entendê-las."
        },
        {
          "num": 23,
          "text": "Tenha cuidado com o que você pensa, pois a sua vida é dirigida pelos seus pensamentos."
        },
        {
          "num": 24,
          "text": "Nunca fale mentiras, nem diga palavras perversas."
        },
        {
          "num": 25,
          "text": "Olhe firme para a frente, com toda a confiança; não abaixe a cabeça, envergonhado."
        },
        {
          "num": 26,
          "text": "Pense bem no que você vai fazer, e todos os seus planos darão certo."
        },
        {
          "num": 27,
          "text": "Evite o mal e caminhe sempre em frente; não se desvie nem um só passo do caminho certo."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Ouvi, filhos, a instrução do pai e estai atentos para conhecerdes o entendimento;"
        },
        {
          "num": 2,
          "text": "porque vos dou boa doutrina; não deixeis o meu ensino."
        },
        {
          "num": 3,
          "text": "Quando eu era filho em companhia de meu pai, tenro e único diante de minha mãe,"
        },
        {
          "num": 4,
          "text": "então, ele me ensinava e me dizia: Retenha o teu coração as minhas palavras; guarda os meus mandamentos e vive;"
        },
        {
          "num": 5,
          "text": "adquire a sabedoria, adquire o entendimento e não te esqueças das palavras da minha boca, nem delas te apartes."
        },
        {
          "num": 6,
          "text": "Não desampares a sabedoria, e ela te guardará; ama-a, e ela te protegerá."
        },
        {
          "num": 7,
          "text": "O princípio da sabedoria é: Adquire a sabedoria; sim, com tudo o que possuis, adquire o entendimento."
        },
        {
          "num": 8,
          "text": "Estima-a, e ela te exaltará; se a abraçares, ela te honrará;"
        },
        {
          "num": 9,
          "text": "dará à tua cabeça um diadema de graça e uma coroa de glória te entregará."
        },
        {
          "num": 10,
          "text": "Ouve, filho meu, e aceita as minhas palavras, e se te multiplicarão os anos de vida."
        },
        {
          "num": 11,
          "text": "No caminho da sabedoria, te ensinei e pelas veredas da retidão te fiz andar."
        },
        {
          "num": 12,
          "text": "Em andando por elas, não se embaraçarão os teus passos; se correres, não tropeçarás."
        },
        {
          "num": 13,
          "text": "Retém a instrução e não a largues; guarda-a, porque ela é a tua vida."
        },
        {
          "num": 14,
          "text": "Não entres na vereda dos perversos, nem sigas pelo caminho dos maus."
        },
        {
          "num": 15,
          "text": "Evita-o; não passes por ele; desvia-te dele e passa de largo;"
        },
        {
          "num": 16,
          "text": "pois não dormem, se não fizerem mal, e foge deles o sono, se não fizerem tropeçar alguém;"
        },
        {
          "num": 17,
          "text": "porque comem o pão da impiedade e bebem o vinho das violências."
        },
        {
          "num": 18,
          "text": "Mas a vereda dos justos é como a luz da aurora, que vai brilhando mais e mais até ser dia perfeito."
        },
        {
          "num": 19,
          "text": "O caminho dos perversos é como a escuridão; nem sabem eles em que tropeçam."
        },
        {
          "num": 20,
          "text": "Filho meu, atenta para as minhas palavras; aos meus ensinamentos inclina os ouvidos."
        },
        {
          "num": 21,
          "text": "Não os deixes apartar-se dos teus olhos; guarda-os no mais íntimo do teu coração."
        },
        {
          "num": 22,
          "text": "Porque são vida para quem os acha e saúde, para o seu corpo."
        },
        {
          "num": 23,
          "text": "Sobre tudo o que se deve guardar, guarda o coração, porque dele procedem as fontes da vida."
        },
        {
          "num": 24,
          "text": "Desvia de ti a falsidade da boca e afasta de ti a perversidade dos lábios."
        },
        {
          "num": 25,
          "text": "Os teus olhos olhem direito, e as tuas pálpebras, diretamente diante de ti."
        },
        {
          "num": 26,
          "text": "Pondera a vereda de teus pés, e todos os teus caminhos sejam retos."
        },
        {
          "num": 27,
          "text": "Não declines nem para a direita nem para a esquerda; retira o teu pé do mal."
        }
      ]
    }
  },
  "is-40": {
    "book": "Isaías",
    "chapter": 40,
    "title": "Conforto para o Povo e Força Aos Cansados",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Consolem, consolem o meu povo, é o vosso Deus quem o pede."
        },
        {
          "num": 2,
          "text": "Falem ao coração de Jerusalém e proclamem que acabaram os seus trabalhos forçados e está pago o seu crime; que já recebeu do Senhor o dobro do castigo pelos seus pecados ."
        },
        {
          "num": 3,
          "text": "Ouço uma voz gritar: «Preparem no deserto o caminho do Senhor , na estepe, abram uma calçada para o nosso Deus ."
        },
        {
          "num": 4,
          "text": "Que os vales sejam levantados e as montanhas e colinas, rebaixadas; que os cimos dos montes sejam aplanados e os terrenos escarpados sejam nivelados."
        },
        {
          "num": 5,
          "text": "O Senhor vai mostrar a sua grandeza e toda a gente a verá. É o Senhor quem o declara!»"
        },
        {
          "num": 6,
          "text": "Ouço uma voz a pedir: «Faz uma proclamação!» Mas eu respondo: «Que proclamação?» «Que toda a gente é como erva e a sua beleza como flor do campo."
        },
        {
          "num": 7,
          "text": "A erva seca e a flor murcha, quando o sopro do Senhor passa por elas. É bem certo! As pessoas são erva caduca!"
        },
        {
          "num": 8,
          "text": "Sim! A erva seca e a flor murcha, mas a palavra do nosso Deus permanece para sempre.» A boa nova"
        },
        {
          "num": 9,
          "text": "Sobe a um alto monte, pregoeiro de Sião , levanta com força a tua voz, pregoeiro de Jerusalém; levanta bem a voz, não tenhas medo e diz às cidades de Judá: «Vem aí o vosso Deus!»"
        },
        {
          "num": 10,
          "text": "O Senhor Deus vem aí, cheio de força e pronto para reinar, traz consigo, como sinal de vitória o povo que ele resgatou ."
        },
        {
          "num": 11,
          "text": "Ele é como um pastor que apascenta o seu rebanho e o reúne com o cajado na mão. Leva os cordeiros ao colo e cuida das ovelhas que têm crias . A sabedoria de Deus"
        },
        {
          "num": 12,
          "text": "Quem mediu as águas do mar com a mão, ou o diâmetro do céu a palmo, ou o pó da terra com o alqueire? Quem pesou as montanhas e as colinas na balança?"
        },
        {
          "num": 13,
          "text": "Quem mediu o Espírito do Senhor e quem foi o homem que estabeleceu o seu plano ?"
        },
        {
          "num": 14,
          "text": "Com quem ele se aconselhou, para o esclarecer, ou para lhe ensinar o caminho certo? Quem é que lhe ensinou a ciência e lhe deu a conhecer a sabedoria?"
        },
        {
          "num": 15,
          "text": "Diante do Senhor , as nações são uma gota de água que cai num balde, ou um grão de poeira, no prato duma balança. E os povos das ilhas não pesam mais que um pouco de pó."
        },
        {
          "num": 16,
          "text": "As florestas do Líbano não chegam para o fogo do seu altar , nem os seus animais, para os holocaustos ."
        },
        {
          "num": 17,
          "text": "Diante dele, todas as nações são como se não existissem, elas contam menos que nada."
        },
        {
          "num": 18,
          "text": "A quem quereis comparar Deus? Com que imagem o podeis confrontar?"
        },
        {
          "num": 19,
          "text": "Um ídolo, é um artista que o modela; depois, vem o ourives que o cobre de ouro e lhe põe alguns retoques de prata."
        },
        {
          "num": 20,
          "text": "Aquele que tem menos posses para uma tal oferta escolhe um pedaço de madeira sem caruncho, e contrata um bom artista, para lhe fazer um ídolo que possa durar."
        },
        {
          "num": 21,
          "text": "Será que não sabem nem aprenderam? Não vo-lo anunciaram desde o princípio? Ainda não compreenderam quem fez o mundo?"
        },
        {
          "num": 22,
          "text": "Foi aquele que está sentado sobre a cúpula da terra, olhando os seus habitantes como se fossem gafanhotos. Foi ele que estendeu os céus como um grande véu, e os desdobrou como uma tenda, para neles habitar,"
        },
        {
          "num": 23,
          "text": "ele que reduz a nada os dirigentes do mundo e converte em nulidade os governantes."
        },
        {
          "num": 24,
          "text": "Logo que estejam plantados ou semeados, mal tenham criado raízes na terra, o Senhor sopra sobre eles e secam imediatamente; Depois são levados como palha por um vendaval."
        },
        {
          "num": 25,
          "text": "«A quem podereis comparar-me? Quem será igual a mim?» — pergunta o Deus santo ."
        },
        {
          "num": 26,
          "text": "Levantem os olhos para o céu e vejam! Quem é que criou as estrelas? Foi aquele que as põe em movimento como se fosse um exército bem ordenado. A todas, ele chama pelo seu nome. O seu poder é tão grande e a sua força é tal, que nenhuma falta à chamada. Polémica de Deus com o povo"
        },
        {
          "num": 27,
          "text": "Por que é que dizes, Jacob, e por que repetes, Israel: «O Senhor não compreende o meu destino, o meu Deus ignora a minha causa!»"
        },
        {
          "num": 28,
          "text": "Porventura não o sabes? Será que não ouviste dizer? O Senhor é um Deus eterno; criou a terra dum extremo ao outro. Não se cansa nem perde as forças. A sua sabedoria é insondável."
        },
        {
          "num": 29,
          "text": "Ele dá forças ao cansado e enche de vigor aquele que é fraco."
        },
        {
          "num": 30,
          "text": "Até os jovens se cansam e fatigam, e os mais valentes também tropeçam."
        },
        {
          "num": 31,
          "text": "Mas os que confiam no Senhor renovam as suas forças; lançam-se como as águias, correm sem se cansarem, andam sempre sem se fatigarem."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "O SENHOR, nosso Deus, diz: “Consolem, consolem o meu povo."
        },
        {
          "num": 2,
          "text": "Falem carinhosamente aos moradores de Jerusalém e digam-lhes que já terminou a sua escravidão e que os seus pecados foram perdoados. Eles receberam de mim duas vezes mais castigos do que os pecados que cometeram.”"
        },
        {
          "num": 3,
          "text": "Alguém está gritando: “Preparem no deserto um caminho para o SENHOR, abram ali uma estrada reta para o nosso Deus passar!"
        },
        {
          "num": 4,
          "text": "Todos os vales serão aterrados, e todos os morros e montes serão aplanados; os terrenos cheios de altos e baixos ficarão planos, e as regiões montanhosas virarão planícies."
        },
        {
          "num": 5,
          "text": "Então o SENHOR mostrará a sua glória, e toda a humanidade a verá. O próprio SENHOR Deus prometeu que vai fazer isso.”"
        },
        {
          "num": 6,
          "text": "Alguém diz: “Anuncie a mensagem!” “O que devo anunciar?” — eu pergunto. “Anuncie que todos os seres humanos são como a erva do campo e toda a força deles é como uma flor do mato."
        },
        {
          "num": 7,
          "text": "A erva seca, e as flores caem quando o sopro do SENHOR passa por elas. De fato, o povo é como a erva."
        },
        {
          "num": 8,
          "text": "A erva seca, a flor cai, mas a palavra do nosso Deus dura para sempre.”"
        },
        {
          "num": 9,
          "text": "Você, mensageiro de boas notícias para Jerusalém, suba um alto monte; você, mensageiro de boas notícias para Sião, entregue a sua mensagem em voz alta. Fale sem medo com as cidades de Judá e anuncie bem alto: “O seu Deus está chegando!”"
        },
        {
          "num": 10,
          "text": "O SENHOR Deus vem vindo cheio de força; com o seu braço poderoso, ele conseguiu a vitória. E ele traz consigo o povo que ele salvou."
        },
        {
          "num": 11,
          "text": "Como um pastor cuida do seu rebanho, assim o SENHOR cuidará do seu povo; ele juntará os carneirinhos, e os carregará no colo, e guiará com carinho as ovelhas que estão amamentando."
        },
        {
          "num": 12,
          "text": "Quem mediu a água do mar com as conchas das mãos ou mediu o céu com os dedos? Quem, usando uma vasilha, calculou quanta terra existe no mundo inteiro ou pesou as montanhas e os morros numa balança?"
        },
        {
          "num": 13,
          "text": "Quem pode conhecer a mente do SENHOR? Quem é capaz de lhe dar conselhos?"
        },
        {
          "num": 14,
          "text": "Quem lhe deu lições ou ensinamentos? Quem lhe ensinou a julgar com justiça ou quis fazê-lo aprender mais coisas ou procurou lhe mostrar como ser sábio?"
        },
        {
          "num": 15,
          "text": "Para o SENHOR, todas as nações do mundo são como uma gota de água num balde, como um grão de poeira na balança; ele carrega as ilhas distantes como se fossem um grão de areia."
        },
        {
          "num": 16,
          "text": "Em toda a região do Líbano, não há animais suficientes para um sacrifício como Deus merece, nem árvores que cheguem para os queimar."
        },
        {
          "num": 17,
          "text": "Para ele, as nações não são nada; na presença dele, elas não têm nenhum valor."
        },
        {
          "num": 18,
          "text": "Com quem Deus pode ser comparado? Com o que ele se parece?"
        },
        {
          "num": 19,
          "text": "Ele não é como uma imagem feita por um artista, que um ourives reveste de ouro e cobre de enfeites de prata."
        },
        {
          "num": 20,
          "text": "Quem não pode comprar ouro ou prata escolhe madeira de lei e procura um artista competente que faça uma imagem que fique firme no seu lugar."
        },
        {
          "num": 21,
          "text": "Será que vocês não sabem? Será que nunca ouviram falar disso? Não lhes contaram há muito tempo como o mundo foi criado?"
        },
        {
          "num": 22,
          "text": "O Criador de todas as coisas é aquele que se assenta no seu trono no céu; ele está tão longe da terra, que os seres humanos lhe parecem tão pequenos como formigas. Foi ele quem estendeu os céus como um véu, quem os armou como uma barraca para neles morar."
        },
        {
          "num": 23,
          "text": "É ele quem rebaixa reis poderosos e tira altas autoridades do poder."
        },
        {
          "num": 24,
          "text": "Eles são como plantas que brotaram há pouco e quase não têm raízes. Quando Deus sopra neles, eles murcham, e a ventania os leva para longe, como se fossem palha."
        },
        {
          "num": 25,
          "text": "Com quem vocês vão comparar o Santo Deus? Quem é igual a ele?"
        },
        {
          "num": 26,
          "text": "Olhem para o céu e vejam as estrelas. Quem foi que as criou? Foi aquele que as faz sair em ordem como um exército; ele sabe quantas são e chama cada uma pelo seu nome. A sua força e o seu poder são tão grandes, que nenhuma delas deixa de responder."
        },
        {
          "num": 27,
          "text": "Povo de Israel, por que você se queixa, dizendo: “O SENHOR não se importa conosco, o nosso Deus não se interessa pela nossa situação”?"
        },
        {
          "num": 28,
          "text": "Será que vocês não sabem? Será que nunca ouviram falar disso? O SENHOR é o Deus Eterno, ele criou o mundo inteiro. Ele não se cansa, não fica fatigado; ninguém pode medir a sua sabedoria."
        },
        {
          "num": 29,
          "text": "Aos cansados ele dá novas forças e enche de energia os fracos."
        },
        {
          "num": 30,
          "text": "Até os jovens se cansam, e os moços tropeçam e caem;"
        },
        {
          "num": 31,
          "text": "mas os que confiam no SENHOR recebem sempre novas forças. Voam nas alturas como águias, correm e não perdem as forças, andam e não se cansam."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Consolai, consolai o meu povo, diz o vosso Deus."
        },
        {
          "num": 2,
          "text": "Falai ao coração de Jerusalém, bradai-lhe que já é findo o tempo da sua milícia, que a sua iniquidade está perdoada e que já recebeu em dobro das mãos do SENHOR por todos os seus pecados."
        },
        {
          "num": 3,
          "text": "Voz do que clama no deserto: Preparai o caminho do SENHOR; endireitai no ermo vereda a nosso Deus."
        },
        {
          "num": 4,
          "text": "Todo vale será aterrado, e nivelados, todos os montes e outeiros; o que é tortuoso será retificado, e os lugares escabrosos, aplanados."
        },
        {
          "num": 5,
          "text": "A glória do SENHOR se manifestará, e toda a carne a verá, pois a boca do SENHOR o disse."
        },
        {
          "num": 6,
          "text": "Uma voz diz: Clama; e alguém pergunta: Que hei de clamar? Toda a carne é erva, e toda a sua glória, como a flor da erva;"
        },
        {
          "num": 7,
          "text": "seca-se a erva, e caem as flores, soprando nelas o hálito do SENHOR. Na verdade, o povo é erva;"
        },
        {
          "num": 8,
          "text": "seca-se a erva, e cai a sua flor, mas a palavra de nosso Deus permanece eternamente."
        },
        {
          "num": 9,
          "text": "Tu, ó Sião, que anuncias boas-novas, sobe a um monte alto! Tu, que anuncias boas-novas a Jerusalém, ergue a tua voz fortemente; levanta-a, não temas e dize às cidades de Judá: Eis aí está o vosso Deus!"
        },
        {
          "num": 10,
          "text": "Eis que o SENHOR Deus virá com poder, e o seu braço dominará; eis que o seu galardão está com ele, e diante dele, a sua recompensa."
        },
        {
          "num": 11,
          "text": "Como pastor, apascentará o seu rebanho; entre os seus braços recolherá os cordeirinhos e os levará no seio; as que amamentam ele guiará mansamente."
        },
        {
          "num": 12,
          "text": "Quem na concha de sua mão mediu as águas e tomou a medida dos céus a palmos? Quem recolheu na terça parte de um efa o pó da terra e pesou os montes em romana e os outeiros em balança de precisão?"
        },
        {
          "num": 13,
          "text": "Quem guiou o Espírito do SENHOR? Ou, como seu conselheiro, o ensinou?"
        },
        {
          "num": 14,
          "text": "Com quem tomou ele conselho, para que lhe desse compreensão? Quem o instruiu na vereda do juízo, e lhe ensinou sabedoria, e lhe mostrou o caminho de entendimento?"
        },
        {
          "num": 15,
          "text": "Eis que as nações são consideradas por ele como um pingo que cai de um balde e como um grão de pó na balança; as ilhas são como pó fino que se levanta."
        },
        {
          "num": 16,
          "text": "Nem todo o Líbano basta para queimar, nem os seus animais, para um holocausto."
        },
        {
          "num": 17,
          "text": "Todas as nações são perante ele como coisa que não é nada; ele as considera menos do que nada, como um vácuo."
        },
        {
          "num": 18,
          "text": "Com quem comparareis a Deus? Ou que coisa semelhante confrontareis com ele?"
        },
        {
          "num": 19,
          "text": "O artífice funde a imagem, e o ourives a cobre de ouro e cadeias de prata forja para ela."
        },
        {
          "num": 20,
          "text": "O sacerdote idólatra escolhe madeira que não se corrompe e busca um artífice perito para assentar uma imagem esculpida que não oscile."
        },
        {
          "num": 21,
          "text": "Acaso, não sabeis? Porventura, não ouvis? Não vos tem sido anunciado desde o princípio? Ou não atentastes para os fundamentos da terra?"
        },
        {
          "num": 22,
          "text": "Ele é o que está assentado sobre a redondeza da terra, cujos moradores são como gafanhotos; é ele quem estende os céus como cortina e os desenrola como tenda para neles habitar;"
        },
        {
          "num": 23,
          "text": "é ele quem reduz a nada os príncipes e torna em nulidade os juízes da terra."
        },
        {
          "num": 24,
          "text": "Mal foram plantados e semeados, mal se arraigou na terra o seu tronco, já se secam, quando um sopro passa por eles, e uma tempestade os leva como palha."
        },
        {
          "num": 25,
          "text": "A quem, pois, me comparareis para que eu lhe seja igual? — diz o Santo."
        },
        {
          "num": 26,
          "text": "Levantai ao alto os olhos e vede. Quem criou estas coisas? Aquele que faz sair o seu exército de estrelas, todas bem-contadas, as quais ele chama pelo nome; por ser ele grande em força e forte em poder, nem uma só vem a faltar."
        },
        {
          "num": 27,
          "text": "Por que, pois, dizes, ó Jacó, e falas, ó Israel: O meu caminho está encoberto ao SENHOR, e o meu direito passa despercebido ao meu Deus?"
        },
        {
          "num": 28,
          "text": "Não sabes, não ouviste que o eterno Deus, o SENHOR, o Criador dos fins da terra, nem se cansa, nem se fatiga? Não se pode esquadrinhar o seu entendimento."
        },
        {
          "num": 29,
          "text": "Faz forte ao cansado e multiplica as forças ao que não tem nenhum vigor."
        },
        {
          "num": 30,
          "text": "Os jovens se cansam e se fatigam, e os moços de exaustos caem,"
        },
        {
          "num": 31,
          "text": "mas os que esperam no SENHOR renovam as suas forças, sobem com asas como águias, correm e não se cansam, caminham e não se fatigam."
        }
      ]
    }
  },
  "is-53": {
    "book": "Isaías",
    "chapter": 53,
    "title": "O Servo Sofredor e a Redenção",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Quem acreditou naquilo que ouvimos? A quem foi revelada a intervenção do Senhor ?"
        },
        {
          "num": 2,
          "text": "O servo cresceu diante do Senhor como um simples rebento, ou raiz em terra árida sem aparências nem beleza para poder dar nas vistas. O seu aspeto não tinha qualquer atrativo."
        },
        {
          "num": 3,
          "text": "Era desprezado e abandonado pelos homens, como alguém cheio de dores e habituado ao sofrimento, e para o qual se evita olhar. Era desprezado e tratado sem nenhuma consideração."
        },
        {
          "num": 4,
          "text": "Na verdade ele suportava os nossos sofrimentos e carregava as dores, que nos eram devidas. E nós pensávamos que Deus é que assim o castigava e humilhava duramente ."
        },
        {
          "num": 5,
          "text": "Mas ele foi trespassado por causa das nossas faltas, aniquilado por causa das nossas culpas. O castigo que nos devia redimir caiu sobre ele; ele recebeu os golpes e nós fomos poupados."
        },
        {
          "num": 6,
          "text": "Todos nós vagueávamos como rebanho perdido , cada qual seguindo o seu caminho; mas o Senhor carregou sobre ele as consequências de todas as nossas faltas."
        },
        {
          "num": 7,
          "text": "Foi vexado e humilhado, mas a sua boca não se abriu para protestar; como um cordeiro que é levado ao matadouro ou como uma ovelha emudecida nas mãos do tosquiador, a sua boca não se abriu para protestar."
        },
        {
          "num": 8,
          "text": "Levaram-no à força e sem resistência nem defesa; quem é que se preocupou com a sua sorte? De facto, foi suprimido da terra dos vivos, mas por causa dos pecados do meu povo é que ele foi maltratado ."
        },
        {
          "num": 9,
          "text": "Foi-lhe dada sepultura entre os ímpios e um túmulo entre os malfeitores, embora não tenha cometido qualquer crime, nem praticado qualquer fraude."
        },
        {
          "num": 10,
          "text": "Mas o Senhor quis esmagá-lo com o sofrimento, para que a sua vida fosse uma oferta de expiação. Mas o servo verá a sua descendência e viverá por muito tempo, e o desígnio do Senhor realizar-se-á por meio dele."
        },
        {
          "num": 11,
          "text": "Por causa do sofrimento da sua vida verá a recompensa, e ficará satisfeito com a experiência que teve. «O meu servo, que é justo , fará com que muitos se tornem justos diante de mim, pois ele mesmo carregou com os crimes deles."
        },
        {
          "num": 12,
          "text": "Por isso, receberá a sua parte entre os grandes e repartirá os despojos com os mais poderosos, já que expôs a sua vida à morte e foi contado entre os malfeitores, ele que carregou com o pecado de muitos e intercedeu pelos pecadores.»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "O povo diz: “Quem poderia crer naquilo que acabamos de ouvir? Quem diria que o SENHOR estava agindo?"
        },
        {
          "num": 2,
          "text": "Pois o SENHOR quis que o seu servo aparecesse como uma plantinha que brota e vai crescendo em terra seca. Ele não era bonito nem simpático, nem tinha nenhuma beleza que chamasse a nossa atenção ou que nos agradasse."
        },
        {
          "num": 3,
          "text": "Ele foi rejeitado e desprezado por todos; ele suportou dores e sofrimentos sem fim. Era como alguém que não queremos ver; nós nem mesmo olhávamos para ele e o desprezávamos."
        },
        {
          "num": 4,
          "text": "“No entanto, era o nosso sofrimento que ele estava carregando, era a nossa dor que ele estava suportando. E nós pensávamos que era por causa das suas próprias culpas que Deus o estava castigando, que Deus o estava maltratando e ferindo."
        },
        {
          "num": 5,
          "text": "Porém ele estava sofrendo por causa dos nossos pecados, estava sendo castigado por causa das nossas maldades. Nós somos curados pelo castigo que ele sofreu, somos sarados pelos ferimentos que ele recebeu."
        },
        {
          "num": 6,
          "text": "Todos nós éramos como ovelhas que se haviam perdido; cada um de nós seguia o seu próprio caminho. Mas o SENHOR castigou o seu servo; fez com que ele sofresse o castigo que nós merecíamos."
        },
        {
          "num": 7,
          "text": "“Ele foi maltratado, mas aguentou tudo humildemente e não disse uma só palavra. Ficou calado como um cordeiro que vai ser morto, como uma ovelha quando cortam a sua lã."
        },
        {
          "num": 8,
          "text": "Foi preso, condenado e levado para ser morto, e ninguém se importou com o que ia acontecer com ele. Ele foi expulso do mundo dos vivos, foi morto por causa dos pecados do nosso povo."
        },
        {
          "num": 9,
          "text": "Foi sepultado ao lado de criminosos, foi enterrado com os ricos, embora nunca tivesse cometido crime nenhum, nem tivesse dito uma só mentira.”"
        },
        {
          "num": 10,
          "text": "O SENHOR Deus diz: “Eu quis maltratá-lo, quis fazê-lo sofrer. Ele ofereceu a sua vida como sacrifício para tirar pecados e por isso terá uma vida longa e verá os seus descendentes. Ele fará com que o meu plano dê certo."
        },
        {
          "num": 11,
          "text": "Depois de tanto sofrimento, ele será feliz; por causa da sua dedicação, ele ficará completamente satisfeito. O meu servo não tem pecado, mas ele sofrerá o castigo que muitos merecem, e assim os pecados deles serão perdoados."
        },
        {
          "num": 12,
          "text": "Por isso, eu lhe darei um lugar de honra; ele receberá a sua recompensa junto com os grandes e os poderosos. Pois ele deu a sua própria vida e foi tratado como se fosse um criminoso. Ele levou a culpa dos pecados de muitos e orou pedindo que eles fossem perdoados.”"
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Quem creu em nossa pregação? E a quem foi revelado o braço do SENHOR?"
        },
        {
          "num": 2,
          "text": "Porque foi subindo como renovo perante ele e como raiz de uma terra seca; não tinha aparência nem formosura; olhamo-lo, mas nenhuma beleza havia que nos agradasse."
        },
        {
          "num": 3,
          "text": "Era desprezado e o mais rejeitado entre os homens; homem de dores e que sabe o que é padecer; e, como um de quem os homens escondem o rosto, era desprezado, e dele não fizemos caso."
        },
        {
          "num": 4,
          "text": "Certamente, ele tomou sobre si as nossas enfermidades e as nossas dores levou sobre si; e nós o reputávamos por aflito, ferido de Deus e oprimido."
        },
        {
          "num": 5,
          "text": "Mas ele foi traspassado pelas nossas transgressões e moído pelas nossas iniquidades; o castigo que nos traz a paz estava sobre ele, e pelas suas pisaduras fomos sarados."
        },
        {
          "num": 6,
          "text": "Todos nós andávamos desgarrados como ovelhas; cada um se desviava pelo caminho, mas o SENHOR fez cair sobre ele a iniquidade de nós todos."
        },
        {
          "num": 7,
          "text": "Ele foi oprimido e humilhado, mas não abriu a boca; como cordeiro foi levado ao matadouro; e, como ovelha muda perante os seus tosquiadores, ele não abriu a boca."
        },
        {
          "num": 8,
          "text": "Por juízo opressor foi arrebatado, e de sua linhagem, quem dela cogitou? Porquanto foi cortado da terra dos viventes; por causa da transgressão do meu povo, foi ele ferido."
        },
        {
          "num": 9,
          "text": "Designaram-lhe a sepultura com os perversos, mas com o rico esteve na sua morte, posto que nunca fez injustiça, nem dolo algum se achou em sua boca."
        },
        {
          "num": 10,
          "text": "Todavia, ao SENHOR agradou moê-lo, fazendo-o enfermar; quando der ele a sua alma como oferta pelo pecado, verá a sua posteridade e prolongará os seus dias; e a vontade do SENHOR prosperará nas suas mãos."
        },
        {
          "num": 11,
          "text": "Ele verá o fruto do penoso trabalho de sua alma e ficará satisfeito; o meu Servo, o Justo, com o seu conhecimento, justificará a muitos, porque as iniquidades deles levará sobre si."
        },
        {
          "num": 12,
          "text": "Por isso, eu lhe darei muitos como a sua parte, e com os poderosos repartirá ele o despojo, porquanto derramou a sua alma na morte; foi contado com os transgressores; contudo, levou sobre si o pecado de muitos e pelos transgressores intercedeu."
        }
      ]
    }
  },
  "mt-5": {
    "book": "Mateus",
    "chapter": 5,
    "title": "O Sermão do Monte e as Bem-Aventuranças",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Ao ver a multidão, Jesus subiu ao monte. Sentou-se e os seus discípulos foram para junto dele."
        },
        {
          "num": 2,
          "text": "Jesus começou então a ensiná-los desta maneira:"
        },
        {
          "num": 3,
          "text": "«Felizes os que têm espírito de pobres, porque é deles o reino dos céus !"
        },
        {
          "num": 4,
          "text": "Felizes os que choram, porque Deus os consolará!"
        },
        {
          "num": 5,
          "text": "Felizes os humildes, porque terão como herança a Terra!"
        },
        {
          "num": 6,
          "text": "Felizes os que têm fome e sede de ver cumprida a vontade de Deus, porque Deus os satisfará!"
        },
        {
          "num": 7,
          "text": "Felizes os que usam de misericórdia para com os outros, porque Deus os tratará com misericórdia!"
        },
        {
          "num": 8,
          "text": "Felizes os íntegros de coração , porque hão de ver Deus!"
        },
        {
          "num": 9,
          "text": "Felizes os que promovem a paz, porque Deus lhes chamará seus filhos!"
        },
        {
          "num": 10,
          "text": "Felizes os que são perseguidos por procurarem que se cumpra a vontade de Deus, porque é deles o reino dos céus!"
        },
        {
          "num": 11,
          "text": "Felizes serão quando vos insultarem, perseguirem e caluniarem, por serem meus discípulos!"
        },
        {
          "num": 12,
          "text": "Alegrem-se e encham-se de satisfação porque é grande a recompensa que vos espera no céu. Pois assim também foram tratados os profetas que vos precederam .» O sal e a luz ( Marcos 9,50 ; Lucas 14,34–35)"
        },
        {
          "num": 13,
          "text": "«Vocês são o sal do mundo. Mas se o sal perder as suas qualidades, poderá novamente salgar? Já não presta para nada, senão para se deitar fora e ser pisado por quem passa."
        },
        {
          "num": 14,
          "text": "Vocês são a luz do mundo. Uma cidade situada no alto de um monte não se pode esconder."
        },
        {
          "num": 15,
          "text": "Também não se acende um candeeiro para o pôr debaixo da caixa. Pelo contrário, põe-se mas é num lugar em que alumie bem a todos os que estiverem em casa ."
        },
        {
          "num": 16,
          "text": "Do mesmo modo, façam brilhar a vossa luz diante de toda a gente, para que vejam as vossas boas ações e deem louvores ao vosso Pai que está nos céus.» A lei e o reino dos céus"
        },
        {
          "num": 17,
          "text": "«Não pensem que vim anular a Lei de Moisés ou o ensino dos profetas . Não vim para anular mas para dar cumprimento."
        },
        {
          "num": 18,
          "text": "Saibam que enquanto o Céu e a Terra existirem, nem uma letra, nem sequer um acento se hão de tirar da lei, sem que tudo se cumpra."
        },
        {
          "num": 19,
          "text": "Por isso quem desobedecer ainda que seja a um só destes mandamentos mais pequenos e ensinar os outros a fazerem o mesmo, será considerado o menor no reino dos céus . Mas aquele que obedecer à lei e ensinar os outros a fazerem o mesmo, será tido por grande no reino dos céus."
        },
        {
          "num": 20,
          "text": "Digo-vos mais: vocês não entrarão de maneira nenhuma no reino dos céus, se não cumprirem a vontade de Deus com mais fidelidade do que os doutores da lei e os fariseus .» Reconciliação com o semelhante (Lucas 12,57–59)"
        },
        {
          "num": 21,
          "text": "«Ouviram o que foi dito aos antigos: Não matarás . E ainda: Aquele que matar alguém terá de responder em julgamento."
        },
        {
          "num": 22,
          "text": "Mas eu digo-vos: Todo aquele que se irritar contra o seu semelhante terá de responder em julgamento; aquele que insultar o seu semelhante, chamando-lhe “imbecil”, será julgado pelo tribunal ; e aquele que lhe chamar “estúpido” merece ir para o fogo do inferno."
        },
        {
          "num": 23,
          "text": "Por isso, quando fores ao templo levar a tua oferta a Deus, e ali te lembrares que o teu semelhante tem alguma razão de queixa contra ti,"
        },
        {
          "num": 24,
          "text": "deixa a oferta diante do altar e vai primeiro fazer as pazes com o teu semelhante. Depois volta e apresenta a tua oferta."
        },
        {
          "num": 25,
          "text": "Faz as pazes com o teu adversário enquanto vão os dois a caminho do tribunal. Senão o adversário entrega-te ao juiz, este entrega-te ao oficial de justiça e metem-te na cadeia."
        },
        {
          "num": 26,
          "text": "Garanto-te que não sais de lá enquanto não pagares o último cêntimo.» Perigo das más intenções"
        },
        {
          "num": 27,
          "text": "«Ouviram o que foi dito: Não cometerás adultério ."
        },
        {
          "num": 28,
          "text": "Mas eu digo-vos: Todo aquele que olhar para uma mulher com más intenções já cometeu adultério no seu coração ."
        },
        {
          "num": 29,
          "text": "Portanto, se o teu olho direito te leva a pecar, arranca-o e atira-o para longe de ti. Mais vale perderes uma parte do teu corpo do que ele ser todo inteiro lançado no inferno."
        },
        {
          "num": 30,
          "text": "De igual modo, se a tua mão direita te leva a pecar, corta-a e atira-a para longe de ti. Mais vale perderes uma parte do teu corpo do que ele ir todo inteiro para o inferno.» Sobre o divórcio ( Mateus 19,9 ; Marcos 10,11–12; Lucas 16,18 )"
        },
        {
          "num": 31,
          "text": "«Também foi dito: Todo o homem que se divorciar da sua mulher deve passar-lhe uma declaração ."
        },
        {
          "num": 32,
          "text": "Mas eu digo-vos: Todo o homem que se divorciar da sua mulher, exceto no caso de adultério , é culpado de a expor ao adultério. E o homem que casar com ela também comete adultério.» Evitar juramentos"
        },
        {
          "num": 33,
          "text": "«Também ouviram o que foi dito aos antigos: Não farás juramentos falsos, mas cumprirás diante do Senhor o que juraste ."
        },
        {
          "num": 34,
          "text": "Mas eu digo-vos que não devem jurar de modo nenhum. Não jurem pelo Céu, porque é o trono de Deus;"
        },
        {
          "num": 35,
          "text": "nem pela Terra, porque é o estrado para os seus pés; nem por Jerusalém, porque é a cidade do grande Rei."
        },
        {
          "num": 36,
          "text": "Nem mesmo pela tua cabeça deves jurar, porque não és capaz de tornar um só dos teus cabelos branco ou preto."
        },
        {
          "num": 37,
          "text": "Basta que digas sim, quando for sim, e não, quando for não. Tudo o que vai além disso é obra do Maligno .» Paciência e generosidade (Lucas 6,29–30)"
        },
        {
          "num": 38,
          "text": "«Ouviram o que foi dito: Olho por olho e dente por dente ."
        },
        {
          "num": 39,
          "text": "Mas eu digo-vos: Não resistam a quem vos fizer mal. Se alguém te bater na face direita, apresenta-lhe também a outra."
        },
        {
          "num": 40,
          "text": "Se alguém te quiser levar a tribunal para te tirar a camisa, dá-lhe também o casaco."
        },
        {
          "num": 41,
          "text": "Se alguém te obrigar a levar alguma coisa até a um quilómetro de distância, acompanha-o dois quilómetros ."
        },
        {
          "num": 42,
          "text": "Se alguém te pedir qualquer coisa, dá-lha; e a quem te pedir emprestado não lhe voltes as costas.» Amor aos inimigos (Lucas 6,27–28.32–36)"
        },
        {
          "num": 43,
          "text": "«Ouviram o que foi dito: Amarás o teu próximo e desprezarás o teu inimigo."
        },
        {
          "num": 44,
          "text": "Mas eu digo-vos: Tenham amor aos vossos inimigos e peçam a Deus por aqueles que vos perseguem."
        },
        {
          "num": 45,
          "text": "É deste modo que se tornarão filhos do vosso Pai que está nos céus, porque ele faz brilhar o Sol tanto sobre os bons como sobre os maus, e faz cair a chuva tanto para os justos como para os injustos."
        },
        {
          "num": 46,
          "text": "Se amarem apenas aqueles que vos amam que recompensa poderão esperar? Não fazem também isso os cobradores de impostos?"
        },
        {
          "num": 47,
          "text": "E se saudarem apenas os vossos amigos, que há nisso de extraordinário? Qualquer pagão faz o mesmo!"
        },
        {
          "num": 48,
          "text": "Portanto, sejam perfeitos como o vosso Pai celestial é perfeito.»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Quando Jesus viu aquelas multidões, subiu um monte e sentou-se. Os seus discípulos chegaram perto dele,"
        },
        {
          "num": 2,
          "text": "e ele começou a ensiná-los. Jesus disse:"
        },
        {
          "num": 3,
          "text": "— Felizes as pessoas que sabem que são espiritualmente pobres, pois o Reino do Céu é delas."
        },
        {
          "num": 4,
          "text": "— Felizes as pessoas que choram, pois Deus as consolará."
        },
        {
          "num": 5,
          "text": "— Felizes as pessoas humildes, pois receberão o que Deus tem prometido."
        },
        {
          "num": 6,
          "text": "— Felizes as pessoas que têm fome e sede de fazer a vontade de Deus, pois ele as deixará completamente satisfeitas."
        },
        {
          "num": 7,
          "text": "— Felizes as pessoas que têm misericórdia dos outros, pois Deus terá misericórdia delas."
        },
        {
          "num": 8,
          "text": "— Felizes as pessoas que têm o coração puro, pois elas verão a Deus."
        },
        {
          "num": 9,
          "text": "— Felizes as pessoas que trabalham pela paz, pois Deus as tratará como seus filhos."
        },
        {
          "num": 10,
          "text": "— Felizes as pessoas que sofrem perseguições por fazerem a vontade de Deus, pois o Reino do Céu é delas."
        },
        {
          "num": 11,
          "text": "— Felizes são vocês quando os insultam, perseguem e dizem todo tipo de calúnia contra vocês por serem meus seguidores."
        },
        {
          "num": 12,
          "text": "Fiquem alegres e felizes, pois uma grande recompensa está guardada no céu para vocês. Porque foi assim mesmo que perseguiram os profetas que viveram antes de vocês."
        },
        {
          "num": 13,
          "text": "— Vocês são o sal para a humanidade; mas, se o sal perde o gosto, deixa de ser sal e não serve para mais nada. É jogado fora e pisado pelas pessoas que passam."
        },
        {
          "num": 14,
          "text": "— Vocês são a luz para o mundo. Não se pode esconder uma cidade construída sobre um monte."
        },
        {
          "num": 15,
          "text": "Ninguém acende uma lamparina para colocá-la debaixo de um cesto. Pelo contrário, ela é colocada no lugar próprio para que ilumine todos os que estão na casa."
        },
        {
          "num": 16,
          "text": "Assim também a luz de vocês deve brilhar para que os outros vejam as coisas boas que vocês fazem e louvem o Pai de vocês, que está no céu."
        },
        {
          "num": 17,
          "text": "— Não pensem que eu vim para acabar com a Lei de Moisés ou com os ensinamentos dos Profetas. Não vim para acabar com eles, mas para dar o seu sentido completo."
        },
        {
          "num": 18,
          "text": "Eu afirmo a vocês que isto é verdade: enquanto o céu e a terra durarem, nada será tirado da Lei — nem a menor letra, nem qualquer acento. E assim será até o fim de todas as coisas."
        },
        {
          "num": 19,
          "text": "Portanto, qualquer um que desobedecer ao menor mandamento e ensinar os outros a fazerem o mesmo será considerado o menor no Reino do Céu. Por outro lado, quem obedecer à Lei e ensinar os outros a fazerem o mesmo será considerado grande no Reino do Céu."
        },
        {
          "num": 20,
          "text": "Pois eu afirmo a vocês que só entrarão no Reino do Céu se forem mais fiéis em fazer a vontade de Deus do que os mestres da Lei e os fariseus."
        },
        {
          "num": 21,
          "text": "— Vocês ouviram o que foi dito aos seus antepassados: “Não mate. Quem matar será julgado.”"
        },
        {
          "num": 22,
          "text": "Mas eu lhes digo que qualquer um que ficar com raiva do seu irmão será julgado. Quem disser ao seu irmão: “Você não vale nada” será julgado pelo tribunal. E quem chamar o seu irmão de idiota estará em perigo de ir para o fogo do inferno."
        },
        {
          "num": 23,
          "text": "Portanto, se você estiver oferecendo no altar a sua oferta a Deus e lembrar que o seu irmão tem alguma queixa contra você,"
        },
        {
          "num": 24,
          "text": "deixe a sua oferta ali, na frente do altar, e vá logo fazer as pazes com o seu irmão. Depois volte e ofereça a sua oferta a Deus."
        },
        {
          "num": 25,
          "text": "— Se alguém fizer uma acusação contra você e levá-lo ao tribunal, entre em acordo com essa pessoa enquanto ainda é tempo, antes de chegarem lá. Porque, depois de chegarem ao tribunal, você será entregue ao juiz, o juiz o entregará ao carcereiro, e você será jogado na cadeia."
        },
        {
          "num": 26,
          "text": "Eu afirmo a você que isto é verdade: você não sairá dali enquanto não pagar a multa toda."
        },
        {
          "num": 27,
          "text": "— Vocês ouviram o que foi dito: “Não cometa adultério.”"
        },
        {
          "num": 28,
          "text": "Mas eu lhes digo: quem olhar para uma mulher e desejar possuí-la já cometeu adultério no seu coração."
        },
        {
          "num": 29,
          "text": "Portanto, se o seu olho direito faz com que você peque, arranque-o e jogue-o fora. Pois é melhor perder uma parte do seu corpo do que o corpo inteiro ser atirado no inferno."
        },
        {
          "num": 30,
          "text": "Se a sua mão direita faz com que você peque, corte-a e jogue-a fora. Pois é melhor perder uma parte do seu corpo do que o corpo inteiro ir para o inferno."
        },
        {
          "num": 31,
          "text": "— Foi dito também: “Quem mandar a sua esposa embora deverá dar a ela um documento de divórcio.”"
        },
        {
          "num": 32,
          "text": "Mas eu lhes digo: todo homem que mandar a sua esposa embora, a não ser em caso de adultério, será culpado de fazer com que ela se torne adúltera, se ela casar de novo. E o homem que casar com ela também cometerá adultério."
        },
        {
          "num": 33,
          "text": "— Vocês ouviram o que foi dito aos seus antepassados: “Não quebre a sua promessa, mas cumpra o que você jurou ao Senhor que ia fazer.”"
        },
        {
          "num": 34,
          "text": "Mas eu lhes digo: não jurem de jeito nenhum. Não jurem pelo céu, pois é o trono de Deus;"
        },
        {
          "num": 35,
          "text": "nem pela terra, pois é o estrado onde ele descansa os seus pés; nem por Jerusalém, pois é a cidade do grande Rei."
        },
        {
          "num": 36,
          "text": "Não jurem nem mesmo pela sua cabeça, pois vocês não podem fazer com que um só fio dos seus cabelos fique branco ou preto."
        },
        {
          "num": 37,
          "text": "Que o “sim” de vocês seja sim, e o “não”, não, pois qualquer coisa a mais que disserem vem do Maligno."
        },
        {
          "num": 38,
          "text": "— Vocês ouviram o que foi dito: “Olho por olho, dente por dente.”"
        },
        {
          "num": 39,
          "text": "Mas eu lhes digo: não se vinguem dos que fazem mal a vocês. Se alguém lhe der um tapa na cara, vire o outro lado para ele bater também."
        },
        {
          "num": 40,
          "text": "Se alguém processar você para tomar a sua túnica, deixe que leve também a capa."
        },
        {
          "num": 41,
          "text": "Se um dos soldados estrangeiros forçá-lo a carregar uma carga um quilômetro, carregue-a dois quilômetros."
        },
        {
          "num": 42,
          "text": "Se alguém lhe pedir alguma coisa, dê; e, se alguém lhe pedir emprestado, empreste."
        },
        {
          "num": 43,
          "text": "— Vocês ouviram o que foi dito: “Ame os seus amigos e odeie os seus inimigos.”"
        },
        {
          "num": 44,
          "text": "Mas eu lhes digo: amem os seus inimigos e orem pelos que perseguem vocês,"
        },
        {
          "num": 45,
          "text": "para que vocês se tornem filhos do Pai de vocês, que está no céu. Porque ele faz com que o sol brilhe sobre os bons e sobre os maus e dá chuvas tanto para os que fazem o bem como para os que fazem o mal."
        },
        {
          "num": 46,
          "text": "Se vocês amam somente aqueles que os amam, por que esperam que Deus lhes dê alguma recompensa? Até os cobradores de impostos amam as pessoas que os amam!"
        },
        {
          "num": 47,
          "text": "Se vocês falam somente com os seus amigos, o que é que estão fazendo de mais? Até os pagãos fazem isso!"
        },
        {
          "num": 48,
          "text": "Portanto, sejam perfeitos, assim como é perfeito o Pai de vocês, que está no céu."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Vendo Jesus as multidões, subiu ao monte, e, como se assentasse, aproximaram-se os seus discípulos;"
        },
        {
          "num": 2,
          "text": "e ele passou a ensiná-los, dizendo:"
        },
        {
          "num": 3,
          "text": "Bem-aventurados os humildes de espírito, porque deles é o reino dos céus."
        },
        {
          "num": 4,
          "text": "Bem-aventurados os que choram, porque serão consolados."
        },
        {
          "num": 5,
          "text": "Bem-aventurados os mansos, porque herdarão a terra."
        },
        {
          "num": 6,
          "text": "Bem-aventurados os que têm fome e sede de justiça, porque serão fartos."
        },
        {
          "num": 7,
          "text": "Bem-aventurados os misericordiosos, porque alcançarão misericórdia."
        },
        {
          "num": 8,
          "text": "Bem-aventurados os limpos de coração, porque verão a Deus."
        },
        {
          "num": 9,
          "text": "Bem-aventurados os pacificadores, porque serão chamados filhos de Deus."
        },
        {
          "num": 10,
          "text": "Bem-aventurados os perseguidos por causa da justiça, porque deles é o reino dos céus."
        },
        {
          "num": 11,
          "text": "Bem-aventurados sois quando, por minha causa, vos injuriarem, e vos perseguirem, e, mentindo, disserem todo mal contra vós."
        },
        {
          "num": 12,
          "text": "Regozijai-vos e exultai, porque é grande o vosso galardão nos céus; pois assim perseguiram aos profetas que viveram antes de vós."
        },
        {
          "num": 13,
          "text": "Vós sois o sal da terra; ora, se o sal vier a ser insípido, como lhe restaurar o sabor? Para nada mais presta senão para, lançado fora, ser pisado pelos homens."
        },
        {
          "num": 14,
          "text": "Vós sois a luz do mundo. Não se pode esconder a cidade edificada sobre um monte;"
        },
        {
          "num": 15,
          "text": "nem se acende uma candeia para colocá-la debaixo do alqueire, mas no velador, e alumia a todos os que se encontram na casa."
        },
        {
          "num": 16,
          "text": "Assim brilhe também a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem a vosso Pai que está nos céus."
        },
        {
          "num": 17,
          "text": "Não penseis que vim revogar a Lei ou os Profetas; não vim para revogar, vim para cumprir."
        },
        {
          "num": 18,
          "text": "Porque em verdade vos digo: até que o céu e a terra passem, nem um i ou um til jamais passará da Lei, até que tudo se cumpra."
        },
        {
          "num": 19,
          "text": "Aquele, pois, que violar um destes mandamentos, posto que dos menores, e assim ensinar aos homens, será considerado mínimo no reino dos céus; aquele, porém, que os observar e ensinar, esse será considerado grande no reino dos céus."
        },
        {
          "num": 20,
          "text": "Porque vos digo que, se a vossa justiça não exceder em muito a dos escribas e fariseus, jamais entrareis no reino dos céus."
        },
        {
          "num": 21,
          "text": "Ouvistes que foi dito aos antigos: Não matarás; e: Quem matar estará sujeito a julgamento."
        },
        {
          "num": 22,
          "text": "Eu, porém, vos digo que todo aquele que [sem motivo] se irar contra seu irmão estará sujeito a julgamento; e quem proferir um insulto a seu irmão estará sujeito a julgamento do tribunal; e quem lhe chamar: Tolo, estará sujeito ao inferno de fogo."
        },
        {
          "num": 23,
          "text": "Se, pois, ao trazeres ao altar a tua oferta, ali te lembrares de que teu irmão tem alguma coisa contra ti,"
        },
        {
          "num": 24,
          "text": "deixa perante o altar a tua oferta, vai primeiro reconciliar-te com teu irmão; e, então, voltando, faze a tua oferta."
        },
        {
          "num": 25,
          "text": "Entra em acordo sem demora com o teu adversário, enquanto estás com ele a caminho, para que o adversário não te entregue ao juiz, o juiz, ao oficial de justiça, e sejas recolhido à prisão."
        },
        {
          "num": 26,
          "text": "Em verdade te digo que não sairás dali, enquanto não pagares o último centavo."
        },
        {
          "num": 27,
          "text": "Ouvistes que foi dito: Não adulterarás."
        },
        {
          "num": 28,
          "text": "Eu, porém, vos digo: qualquer que olhar para uma mulher com intenção impura, no coração, já adulterou com ela."
        },
        {
          "num": 29,
          "text": "Se o teu olho direito te faz tropeçar, arranca-o e lança-o de ti; pois te convém que se perca um dos teus membros, e não seja todo o teu corpo lançado no inferno."
        },
        {
          "num": 30,
          "text": "E, se a tua mão direita te faz tropeçar, corta-a e lança-a de ti; pois te convém que se perca um dos teus membros, e não vá todo o teu corpo para o inferno."
        },
        {
          "num": 31,
          "text": "Também foi dito: Aquele que repudiar sua mulher, dê-lhe carta de divórcio."
        },
        {
          "num": 32,
          "text": "Eu, porém, vos digo: qualquer que repudiar sua mulher, exceto em caso de relações sexuais ilícitas, a expõe a tornar-se adúltera; e aquele que casar com a repudiada comete adultério."
        },
        {
          "num": 33,
          "text": "Também ouvistes que foi dito aos antigos: Não jurarás falso, mas cumprirás rigorosamente para com o Senhor os teus juramentos."
        },
        {
          "num": 34,
          "text": "Eu, porém, vos digo: de modo algum jureis; nem pelo céu, por ser o trono de Deus;"
        },
        {
          "num": 35,
          "text": "nem pela terra, por ser estrado de seus pés; nem por Jerusalém, por ser cidade do grande Rei;"
        },
        {
          "num": 36,
          "text": "nem jures pela tua cabeça, porque não podes tornar um cabelo branco ou preto."
        },
        {
          "num": 37,
          "text": "Seja, porém, a tua palavra: Sim, sim; não, não. O que disto passar vem do maligno."
        },
        {
          "num": 38,
          "text": "Ouvistes que foi dito: Olho por olho, dente por dente."
        },
        {
          "num": 39,
          "text": "Eu, porém, vos digo: não resistais ao perverso; mas, a qualquer que te ferir na face direita, volta-lhe também a outra;"
        },
        {
          "num": 40,
          "text": "e, ao que quer demandar contigo e tirar-te a túnica, deixa-lhe também a capa."
        },
        {
          "num": 41,
          "text": "Se alguém te obrigar a andar uma milha, vai com ele duas."
        },
        {
          "num": 42,
          "text": "Dá a quem te pede e não voltes as costas ao que deseja que lhe emprestes."
        },
        {
          "num": 43,
          "text": "Ouvistes que foi dito: Amarás o teu próximo e odiarás o teu inimigo."
        },
        {
          "num": 44,
          "text": "Eu, porém, vos digo: amai os vossos inimigos e orai pelos que vos perseguem;"
        },
        {
          "num": 45,
          "text": "para que vos torneis filhos do vosso Pai celeste, porque ele faz nascer o seu sol sobre maus e bons e vir chuvas sobre justos e injustos."
        },
        {
          "num": 46,
          "text": "Porque, se amardes os que vos amam, que recompensa tendes? Não fazem os publicanos também o mesmo?"
        },
        {
          "num": 47,
          "text": "E, se saudardes somente os vossos irmãos, que fazeis de mais? Não fazem os gentios também o mesmo?"
        },
        {
          "num": 48,
          "text": "Portanto, sede vós perfeitos como perfeito é o vosso Pai celeste."
        }
      ]
    }
  },
  "mt-6": {
    "book": "Mateus",
    "chapter": 6,
    "title": "A Oração do Pai Nosso e a Ansiedade",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "«Quando praticarem o bem, procurem não o fazer diante dos outros para dar nas vistas. Se assim fizerem, já não terão nenhuma recompensa a receber do vosso Pai que está nos céus."
        },
        {
          "num": 2,
          "text": "Portanto, quando deres esmola, não faças alarde à tua volta, como é costume das pessoas fingidas, nas sinagogas e nas ruas, para serem elogiadas. Garanto-vos que essas pessoas já receberam a sua recompensa."
        },
        {
          "num": 3,
          "text": "Mas tu, quando deres esmola, procura que a tua mão esquerda nem saiba o que faz a direita."
        },
        {
          "num": 4,
          "text": "Deste modo, a tua esmola ficará em segredo; e o teu Pai, que vê o que se passa em segredo, há de recompensar-te.» Jesus ensina a orar (Lucas 11,2–4)"
        },
        {
          "num": 5,
          "text": "«Quando orarem, não façam como as pessoas fingidas que gostam de orar de pé, nas sinagogas e às esquinas das ruas, para toda a gente as ver . Garanto-vos que essas pessoas já receberam a sua recompensa."
        },
        {
          "num": 6,
          "text": "Tu, porém, quando quiseres fazer oração, entra no teu quarto, fecha a porta e ora a teu Pai que está presente sem ser visto. E o teu Pai, que vê o que se passa em segredo, há de recompensar-te."
        },
        {
          "num": 7,
          "text": "Quando orarem, não usem muitas palavras, como fazem os pagãos , que pensam que é por muito falarem que serão mais facilmente ouvidos."
        },
        {
          "num": 8,
          "text": "Não sejam como eles pois o vosso Pai sabe muito bem do que vocês precisam, antes de lho pedirem."
        },
        {
          "num": 9,
          "text": "Portanto, devem orar assim: “Pai nosso que estás nos Céus, Santificado seja o teu nome ;"
        },
        {
          "num": 10,
          "text": "venha o teu reino ; seja feita a tua vontade, assim na Terra como no Céu."
        },
        {
          "num": 11,
          "text": "Dá-nos hoje o pão de que precisamos."
        },
        {
          "num": 12,
          "text": "Perdoa-nos as nossas ofensas, como nós perdoámos aos que nos ofenderam."
        },
        {
          "num": 13,
          "text": "E não nos deixes cair em tentação, mas livra-nos do Maligno , [porque teu é o reino, o poder e a glória para sempre. Ámen! ]”"
        },
        {
          "num": 14,
          "text": "De facto, se perdoarem aos outros as suas ofensas, o vosso Pai celestial também vos perdoará."
        },
        {
          "num": 15,
          "text": "Mas se não perdoarem aos outros, o vosso Pai também vos não perdoará.» Acerca do jejum"
        },
        {
          "num": 16,
          "text": "«Quando jejuarem não andem de cara triste, como as pessoas fingidas, que até desfiguram a cara para toda a gente ver que andam a jejuar. Garanto-vos que essas pessoas já receberam a sua recompensa."
        },
        {
          "num": 17,
          "text": "Mas tu, quando jejuares, lava a cara e penteia-te bem."
        },
        {
          "num": 18,
          "text": "Deste modo, ninguém saberá que andas a jejuar, a não ser o teu Pai que está presente sem ser visto. Ele, que vê tudo o que se passa em segredo, te dará a recompensa.» A verdadeira riqueza (Lucas 12,33–34)"
        },
        {
          "num": 19,
          "text": "«Não se preocupem em juntar riquezas neste mundo, onde a traça e a ferrugem destroem e onde os ladrões assaltam e roubam."
        },
        {
          "num": 20,
          "text": "Preocupem-se antes em juntar riquezas no céu, onde não há traça nem ferrugem para as destruir, nem ladrões para assaltar e roubar."
        },
        {
          "num": 21,
          "text": "Onde estiver a vossa riqueza, aí estará o vosso coração .» Luz e escuridão (Lucas 11,34–36)"
        },
        {
          "num": 22,
          "text": "«A luz do corpo são os olhos. Por isso, se o teu olhar for bom, todo o teu corpo tem luz."
        },
        {
          "num": 23,
          "text": "Mas se o teu olhar for mau, todo o teu corpo fica às escuras. Ora se a luz que há em ti não passa de escuridão, que grande será essa escuridão!» Deus e as riquezas ( Lucas 16,13 )"
        },
        {
          "num": 24,
          "text": "«Ninguém pode servir a dois patrões: ou não gosta de um deles e estima o outro, ou há de ser leal para um e desprezar o outro. Não podem servir a Deus e ao dinheiro.» Deus cuida dos seus filhos (Lucas 12,22–31)"
        },
        {
          "num": 25,
          "text": "«É por isso que eu vos digo: Não andem preocupados com o que hão de comer ou beber, nem com a roupa de que precisam para vestir. Não será que a vida vale mais do que a comida e o corpo mais do que a roupa?"
        },
        {
          "num": 26,
          "text": "Olhem para as aves do céu, que não semeiam, nem colhem, nem amontoam grão nos celeiros. E no entanto, o vosso Pai dá-lhes de comer. Não valem vocês muito mais do que as aves?"
        },
        {
          "num": 27,
          "text": "Qual de vós, por mais que se preocupe, poderá prolongar um pouco o tempo da sua vida ?"
        },
        {
          "num": 28,
          "text": "E por que hão de andar preocupados por causa da roupa? Reparem como crescem os lírios do campo! E eles não trabalham nem fiam."
        },
        {
          "num": 29,
          "text": "Contudo digo-vos que nem o rei Salomão, com toda a sua riqueza, se vestiu como qualquer deles."
        },
        {
          "num": 30,
          "text": "Ora se Deus veste assim a erva do campo, que hoje existe e amanhã é queimada, quanto mais vos há de vestir a vocês, ó gente sem fé?"
        },
        {
          "num": 31,
          "text": "Não andem preocupados a dizer: “Que havemos de comer? Que havemos de beber? Que havemos de vestir?”"
        },
        {
          "num": 32,
          "text": "Os pagãos , esses é que se preocupam com todas essas coisas. O vosso Pai celestial sabe muito bem que vocês precisam de tudo isso."
        },
        {
          "num": 33,
          "text": "Procurem primeiro o reino de Deus e a sua vontade e tudo isso vos será dado."
        },
        {
          "num": 34,
          "text": "Portanto, não devem andar preocupados com o dia de amanhã, porque o dia de amanhã já terá as suas preocupações. Basta a cada dia a sua dificuldade.»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "— Tenham o cuidado de não praticarem os seus deveres religiosos em público a fim de serem vistos pelos outros. Se vocês agirem assim, não receberão nenhuma recompensa do Pai de vocês, que está no céu."
        },
        {
          "num": 2,
          "text": "— Quando você der alguma coisa a uma pessoa necessitada, não fique contando o que fez, como os hipócritas fazem nas sinagogas e nas ruas. Eles fazem isso para serem elogiados pelos outros. Eu afirmo a vocês que isto é verdade: eles já receberam a sua recompensa."
        },
        {
          "num": 3,
          "text": "Mas você, quando ajudar alguma pessoa necessitada, faça isso de tal modo que nem mesmo o seu amigo mais íntimo fique sabendo do que você fez."
        },
        {
          "num": 4,
          "text": "Isso deve ficar em segredo; e o seu Pai, que vê o que você faz em segredo, lhe dará a recompensa."
        },
        {
          "num": 5,
          "text": "— Quando vocês orarem, não sejam como os hipócritas. Eles gostam de orar de pé nas sinagogas e nas esquinas das ruas para serem vistos pelos outros. Eu afirmo a vocês que isto é verdade: eles já receberam a sua recompensa."
        },
        {
          "num": 6,
          "text": "Mas você, quando orar, vá para o seu quarto, feche a porta e ore ao seu Pai, que não pode ser visto. E o seu Pai, que vê o que você faz em segredo, lhe dará a recompensa."
        },
        {
          "num": 7,
          "text": "— Nas suas orações, não fiquem repetindo o que vocês já disseram, como fazem os pagãos. Eles pensam que Deus os ouvirá porque fazem orações compridas."
        },
        {
          "num": 8,
          "text": "Não sejam como eles, pois, antes de vocês pedirem, o Pai de vocês já sabe o que vocês precisam."
        },
        {
          "num": 9,
          "text": "Portanto, orem assim: “Pai nosso, que estás no céu, que todos reconheçam que o teu nome é santo."
        },
        {
          "num": 10,
          "text": "Venha o teu Reino. Que a tua vontade seja feita aqui na terra como é feita no céu!"
        },
        {
          "num": 11,
          "text": "Dá-nos hoje o alimento que precisamos."
        },
        {
          "num": 12,
          "text": "Perdoa as nossas ofensas como também nós perdoamos as pessoas que nos ofenderam."
        },
        {
          "num": 13,
          "text": "E não deixes que sejamos tentados, mas livra-nos do mal. [Pois teu é o Reino, o poder e a glória, para sempre. Amém!]”"
        },
        {
          "num": 14,
          "text": "— Porque, se vocês perdoarem as pessoas que ofenderem vocês, o Pai de vocês, que está no céu, também perdoará vocês."
        },
        {
          "num": 15,
          "text": "Mas, se não perdoarem essas pessoas, o Pai de vocês também não perdoará as ofensas de vocês."
        },
        {
          "num": 16,
          "text": "— Quando vocês jejuarem, não façam uma cara triste como fazem os hipócritas, pois eles fazem isso para todos saberem que eles estão jejuando. Eu afirmo a vocês que isto é verdade: eles já receberam a sua recompensa."
        },
        {
          "num": 17,
          "text": "Mas você, quando jejuar, lave o rosto e penteie o cabelo"
        },
        {
          "num": 18,
          "text": "para os outros não saberem que você está jejuando. E somente o seu Pai, que não pode ser visto, saberá que você está jejuando. E o seu Pai, que vê o que você faz em segredo, lhe dará a recompensa."
        },
        {
          "num": 19,
          "text": "— Não ajuntem riquezas aqui na terra, onde as traças e a ferrugem destroem, e onde os ladrões arrombam e roubam."
        },
        {
          "num": 20,
          "text": "Pelo contrário, ajuntem riquezas no céu, onde as traças e a ferrugem não podem destruí-las, e os ladrões não podem arrombar e roubá-las."
        },
        {
          "num": 21,
          "text": "Pois onde estiverem as suas riquezas, aí estará o coração de vocês."
        },
        {
          "num": 22,
          "text": "— Os olhos são como uma luz para o corpo: quando os olhos de vocês são bons, todo o seu corpo fica cheio de luz."
        },
        {
          "num": 23,
          "text": "Porém, se os seus olhos forem maus, o seu corpo ficará cheio de escuridão. Assim, se a luz que está em você virar escuridão, como será terrível essa escuridão!"
        },
        {
          "num": 24,
          "text": "— Um escravo não pode servir a dois donos ao mesmo tempo, pois vai rejeitar um e preferir o outro; ou será fiel a um e desprezará o outro. Vocês não podem servir a Deus e também servir ao dinheiro."
        },
        {
          "num": 25,
          "text": "— Por isso eu digo a vocês: não se preocupem com a comida e com a bebida que precisam para viver nem com a roupa que precisam para se vestir. Afinal, será que a vida não é mais importante do que a comida? E será que o corpo não é mais importante do que as roupas?"
        },
        {
          "num": 26,
          "text": "Vejam os passarinhos que voam pelo céu: eles não semeiam, não colhem, nem guardam comida em depósitos. No entanto, o Pai de vocês, que está no céu, dá de comer a eles. Será que vocês não valem muito mais do que os passarinhos?"
        },
        {
          "num": 27,
          "text": "E nenhum de vocês pode encompridar a sua vida, por mais que se preocupe com isso."
        },
        {
          "num": 28,
          "text": "— E por que vocês se preocupam com roupas? Vejam como crescem as flores do campo: elas não trabalham, nem fazem roupas para si mesmas."
        },
        {
          "num": 29,
          "text": "Mas eu afirmo a vocês que nem mesmo Salomão, sendo tão rico, usava roupas tão bonitas como essas flores."
        },
        {
          "num": 30,
          "text": "É Deus quem veste a erva do campo, que hoje dá flor e amanhã desaparece, queimada no forno. Então é claro que ele vestirá também vocês, que têm uma fé tão pequena!"
        },
        {
          "num": 31,
          "text": "Portanto, não fiquem preocupados, perguntando: “Onde é que vamos arranjar comida?” ou “Onde é que vamos arranjar bebida?” ou “Onde é que vamos arranjar roupas?”"
        },
        {
          "num": 32,
          "text": "Pois os pagãos é que estão sempre procurando essas coisas. O Pai de vocês, que está no céu, sabe que vocês precisam de tudo isso."
        },
        {
          "num": 33,
          "text": "Portanto, ponham em primeiro lugar na sua vida o Reino de Deus e aquilo que Deus quer, e ele lhes dará todas essas coisas."
        },
        {
          "num": 34,
          "text": "Por isso, não fiquem preocupados com o dia de amanhã, pois o dia de amanhã trará as suas próprias preocupações. Para cada dia bastam as suas próprias dificuldades."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Guardai-vos de exercer a vossa justiça diante dos homens, com o fim de serdes vistos por eles; doutra sorte, não tereis galardão junto de vosso Pai celeste."
        },
        {
          "num": 2,
          "text": "Quando, pois, deres esmola, não toques trombeta diante de ti, como fazem os hipócritas, nas sinagogas e nas ruas, para serem glorificados pelos homens. Em verdade vos digo que eles já receberam a recompensa."
        },
        {
          "num": 3,
          "text": "Tu, porém, ao dares a esmola, ignore a tua mão esquerda o que faz a tua mão direita;"
        },
        {
          "num": 4,
          "text": "para que a tua esmola fique em secreto; e teu Pai, que vê em secreto, te recompensará."
        },
        {
          "num": 5,
          "text": "E, quando orardes, não sereis como os hipócritas; porque gostam de orar em pé nas sinagogas e nos cantos das praças, para serem vistos dos homens. Em verdade vos digo que eles já receberam a recompensa."
        },
        {
          "num": 6,
          "text": "Tu, porém, quando orares, entra no teu quarto e, fechada a porta, orarás a teu Pai, que está em secreto; e teu Pai, que vê em secreto, te recompensará."
        },
        {
          "num": 7,
          "text": "E, orando, não useis de vãs repetições, como os gentios; porque presumem que pelo seu muito falar serão ouvidos."
        },
        {
          "num": 8,
          "text": "Não vos assemelheis, pois, a eles; porque Deus, o vosso Pai, sabe o de que tendes necessidade, antes que lho peçais."
        },
        {
          "num": 9,
          "text": "Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome;"
        },
        {
          "num": 10,
          "text": "venha o teu reino; faça-se a tua vontade, assim na terra como no céu;"
        },
        {
          "num": 11,
          "text": "o pão nosso de cada dia dá-nos hoje;"
        },
        {
          "num": 12,
          "text": "e perdoa-nos as nossas dívidas, assim como nós temos perdoado aos nossos devedores;"
        },
        {
          "num": 13,
          "text": "e não nos deixes cair em tentação; mas livra-nos do mal [pois teu é o reino, o poder e a glória para sempre. Amém]!"
        },
        {
          "num": 14,
          "text": "Porque, se perdoardes aos homens as suas ofensas, também vosso Pai celeste vos perdoará;"
        },
        {
          "num": 15,
          "text": "se, porém, não perdoardes aos homens [as suas ofensas], tampouco vosso Pai vos perdoará as vossas ofensas."
        },
        {
          "num": 16,
          "text": "Quando jejuardes, não vos mostreis contristados como os hipócritas; porque desfiguram o rosto com o fim de parecer aos homens que jejuam. Em verdade vos digo que eles já receberam a recompensa."
        },
        {
          "num": 17,
          "text": "Tu, porém, quando jejuares, unge a cabeça e lava o rosto,"
        },
        {
          "num": 18,
          "text": "com o fim de não parecer aos homens que jejuas, e sim ao teu Pai, em secreto; e teu Pai, que vê em secreto, te recompensará."
        },
        {
          "num": 19,
          "text": "Não acumuleis para vós outros tesouros sobre a terra, onde a traça e a ferrugem corroem e onde ladrões escavam e roubam;"
        },
        {
          "num": 20,
          "text": "mas ajuntai para vós outros tesouros no céu, onde traça nem ferrugem corrói, e onde ladrões não escavam, nem roubam;"
        },
        {
          "num": 21,
          "text": "porque, onde está o teu tesouro, aí estará também o teu coração."
        },
        {
          "num": 22,
          "text": "São os olhos a lâmpada do corpo. Se os teus olhos forem bons, todo o teu corpo será luminoso;"
        },
        {
          "num": 23,
          "text": "se, porém, os teus olhos forem maus, todo o teu corpo estará em trevas. Portanto, caso a luz que em ti há sejam trevas, que grandes trevas serão!"
        },
        {
          "num": 24,
          "text": "Ninguém pode servir a dois senhores; porque ou há de aborrecer-se de um e amar ao outro, ou se devotará a um e desprezará ao outro. Não podeis servir a Deus e às riquezas."
        },
        {
          "num": 25,
          "text": "Por isso, vos digo: não andeis ansiosos pela vossa vida, quanto ao que haveis de comer ou beber; nem pelo vosso corpo, quanto ao que haveis de vestir. Não é a vida mais do que o alimento, e o corpo, mais do que as vestes?"
        },
        {
          "num": 26,
          "text": "Observai as aves do céu: não semeiam, não colhem, nem ajuntam em celeiros; contudo, vosso Pai celeste as sustenta. Porventura, não valeis vós muito mais do que as aves?"
        },
        {
          "num": 27,
          "text": "Qual de vós, por ansioso que esteja, pode acrescentar um côvado ao curso da sua vida?"
        },
        {
          "num": 28,
          "text": "E por que andais ansiosos quanto ao vestuário? Considerai como crescem os lírios do campo: eles não trabalham, nem fiam."
        },
        {
          "num": 29,
          "text": "Eu, contudo, vos afirmo que nem Salomão, em toda a sua glória, se vestiu como qualquer deles."
        },
        {
          "num": 30,
          "text": "Ora, se Deus veste assim a erva do campo, que hoje existe e amanhã é lançada no forno, quanto mais a vós outros, homens de pequena fé?"
        },
        {
          "num": 31,
          "text": "Portanto, não vos inquieteis, dizendo: Que comeremos? Que beberemos? Ou: Com que nos vestiremos?"
        },
        {
          "num": 32,
          "text": "Porque os gentios é que procuram todas estas coisas; pois vosso Pai celeste sabe que necessitais de todas elas;"
        },
        {
          "num": 33,
          "text": "buscai, pois, em primeiro lugar, o seu reino e a sua justiça, e todas estas coisas vos serão acrescentadas."
        },
        {
          "num": 34,
          "text": "Portanto, não vos inquieteis com o dia de amanhã, pois o amanhã trará os seus cuidados; basta ao dia o seu próprio mal."
        }
      ]
    }
  },
  "mc-1": {
    "book": "Marcos",
    "chapter": 1,
    "title": "O Princípio do Evangelho e o Ministério de Jesus",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Este é o princípio da boa nova , o evangelho de Jesus Cristo , Filho de Deus ."
        },
        {
          "num": 2,
          "text": "É como está escrito no livro do profeta Isaías: Enviarei o meu mensageiro à tua frente, para te preparar o caminho."
        },
        {
          "num": 3,
          "text": "É a voz daquele que clama no deserto: Preparem o caminho do Senhor e abram-lhe estradas direitas."
        },
        {
          "num": 4,
          "text": "Assim apareceu João no deserto a batizar e a proclamar o batismo em sinal de arrependimento para perdão dos pecados ."
        },
        {
          "num": 5,
          "text": "Toda a gente da Judeia e os habitantes de Jerusalém iam ouvir João Batista. Confessavam os seus pecados e ele batizava-os no rio Jordão."
        },
        {
          "num": 6,
          "text": "João usava uma vestimenta de pelo de camelo com cintura de couro e alimentava-se de gafanhotos e de mel apanhado no campo."
        },
        {
          "num": 7,
          "text": "E dizia assim ao povo: «Depois de mim virá alguém com mais autoridade do que eu, e nem sequer mereço a honra de me curvar diante dele para lhe desatar as correias das sandálias."
        },
        {
          "num": 8,
          "text": "Eu batizei-vos em água, mas ele há de batizar-vos no Espírito Santo .» Batismo e tentação de Jesus ( Mateus 3,13—4,11 ; Lucas 3,21–22; 4,1–13)"
        },
        {
          "num": 9,
          "text": "Por essa altura, Jesus veio de Nazaré, na província da Galileia, e foi batizado por João no rio Jordão."
        },
        {
          "num": 10,
          "text": "No momento em que saía da água, Jesus viu abrir-se o céu e o Espírito Santo a descer sobre si, como uma pomba,"
        },
        {
          "num": 11,
          "text": "e ouviu-se do céu uma voz: «Tu és o meu Filho querido; com a maior satisfação te escolhi .»"
        },
        {
          "num": 12,
          "text": "Logo a seguir, o Espírito conduziu Jesus para o deserto."
        },
        {
          "num": 13,
          "text": "Ficou no deserto quarenta dias sendo tentado por Satanás . Estava entre os animais selvagens e os anjos o serviam. Início da pregação e discípulos de Jesus (Mateus 4,12–22; Lucas 4,14–15; 5,1–11)"
        },
        {
          "num": 14,
          "text": "Depois de João Batista ser preso, Jesus voltou para a Galileia; proclamava o evangelho de Deus"
        },
        {
          "num": 15,
          "text": "e dizia: «É chegada a hora! O reino de Deus está próximo. Arrependam-se dos pecados e creiam nesta boa nova .»"
        },
        {
          "num": 16,
          "text": "Ao passar junto do lago da Galileia , Jesus viu Simão e o seu irmão André que lançavam as redes, pois eram pescadores."
        },
        {
          "num": 17,
          "text": "E disse-lhes: «Venham comigo e eu vos farei pescadores de homens.»"
        },
        {
          "num": 18,
          "text": "Largaram imediatamente as redes e foram com ele."
        },
        {
          "num": 19,
          "text": "Um pouco mais adiante, viu Tiago e o seu irmão João, filhos de Zebedeu, que estavam no barco a consertar as redes."
        },
        {
          "num": 20,
          "text": "Jesus chamou-os; eles deixaram logo o pai no barco com o seu pessoal e foram com ele. O homem com um espírito mau (Lucas 4,31–37)"
        },
        {
          "num": 21,
          "text": "Jesus e os discípulos seguiram depois para Cafarnaum. Chegado o sábado , Jesus entrou na sinagoga dos judeus e começou a ensinar."
        },
        {
          "num": 22,
          "text": "Os que o ouviam ficaram muito admirados com o seu ensino, porque falava como quem tem autoridade e não como os doutores da lei ."
        },
        {
          "num": 23,
          "text": "Nisto, apareceu na sinagoga um homem possuído dum espírito mau , o qual, aos gritos, disse:"
        },
        {
          "num": 24,
          "text": "«Que temos nós a ver contigo, Jesus de Nazaré? Vieste aqui para nos destruir? Eu sei quem tu és; és o Santo de Deus!»"
        },
        {
          "num": 25,
          "text": "Jesus repreendeu-o: «Cala-te e sai deste homem.»"
        },
        {
          "num": 26,
          "text": "O espírito mau sacudiu fortemente o homem, deu um grande grito e saiu dele."
        },
        {
          "num": 27,
          "text": "Ficaram todos tão admirados, que perguntavam uns aos outros: «Que será isto?» Outros diziam: «Isto é doutrina nova, mas apresentada com autoridade! Pois ele até dá ordens aos espíritos maus, e eles obedecem-lhe!»"
        },
        {
          "num": 28,
          "text": "A fama de Jesus espalhou-se rapidamente por toda a região da Galileia. Jesus cura muitos doentes (Mateus 8,14–17; Lucas 4,38–41)"
        },
        {
          "num": 29,
          "text": "Depois disto, saíram da sinagoga e foram com Tiago e João para a casa de Simão e André."
        },
        {
          "num": 30,
          "text": "Como a sogra de Pedro estava de cama com febre, falaram logo dela a Jesus."
        },
        {
          "num": 31,
          "text": "Ele aproximou-se, pegou-lhe na mão e ajudou-a a levantar-se. A febre passou-lhe e ela começou a servi-los."
        },
        {
          "num": 32,
          "text": "Ao entardecer, quando o sol se punha, traziam-lhe todos os doentes e os que tinham espíritos maus."
        },
        {
          "num": 33,
          "text": "Todos os moradores da cidade se juntaram à porta de casa."
        },
        {
          "num": 34,
          "text": "Jesus curou muitos que sofriam de várias doenças e expulsou muitos espíritos maus. Não os deixava falar porque eles sabiam quem ele era. Jesus anuncia a boa nova (Lucas 4,42–44)"
        },
        {
          "num": 35,
          "text": "Jesus levantou-se muito antes de nascer o dia, saiu de casa e foi para um lugar isolado, onde ficou em oração."
        },
        {
          "num": 36,
          "text": "Simão foi com os companheiros à procura dele"
        },
        {
          "num": 37,
          "text": "e, quando o encontraram, disseram-lhe: «Andam todos à tua procura!»"
        },
        {
          "num": 38,
          "text": "Jesus disse-lhes: «Vamos a outras povoações das redondezas para eu lá também pregar, pois foi para isso que eu vim.»"
        },
        {
          "num": 39,
          "text": "Jesus andava por toda a Galileia, pregava nas suas sinagogas e expulsava espíritos maus. Cura de um homem com lepra (Mateus 8,1–4; Lucas 5,12–16)"
        },
        {
          "num": 40,
          "text": "Veio depois um homem com lepra procurar Jesus e pediu-lhe de joelhos: «Se quiseres, podes purificar-me da lepra.»"
        },
        {
          "num": 41,
          "text": "Jesus teve muita pena dele, estendeu a mão, tocou-lhe e disse: «Quero, sim! Estás purificado .»"
        },
        {
          "num": 42,
          "text": "E naquele mesmo instante a lepra desapareceu e ficou purificado ."
        },
        {
          "num": 43,
          "text": "Então Jesus dirigiu-se-lhe em tom firme, mandou-o embora"
        },
        {
          "num": 44,
          "text": "e disse: «Escuta! Não fales disto a ninguém. Vai primeiro ao sacerdote para ele te examinar, e pela tua purificação oferece o sacrifício que Moisés determinou, para que saibam que estás purificado .»"
        },
        {
          "num": 45,
          "text": "Porém o homem, mal saiu dali, começou a proclamar abertamente o que se tinha passado. E a notícia correu de tal maneira que Jesus já não podia entrar à vontade nas povoações. Ficava de fora, em lugares isolados, mas ia lá gente de toda a parte procurá-lo."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "A boa notícia que fala a respeito de Jesus Cristo, Filho de Deus, começou a ser dada"
        },
        {
          "num": 2,
          "text": "como o profeta Isaías tinha escrito. Ele escreveu o seguinte: “Deus disse: Eu enviarei o meu mensageiro adiante de você para preparar o seu caminho.”"
        },
        {
          "num": 3,
          "text": "E o profeta escreveu também: “Alguém está gritando no deserto: Preparem o caminho para o Senhor passar! Abram estradas retas para ele!”"
        },
        {
          "num": 4,
          "text": "E foi assim que João Batista apareceu no deserto, batizando o povo e anunciando esta mensagem: — Arrependam-se dos seus pecados e sejam batizados, que Deus perdoará vocês."
        },
        {
          "num": 5,
          "text": "Muitos moradores da região da Judeia e da cidade de Jerusalém iam ouvir João. Eles confessavam os seus pecados, e João os batizava no rio Jordão."
        },
        {
          "num": 6,
          "text": "Ele usava uma roupa feita de pelos de camelo e um cinto de couro e comia gafanhotos e mel do mato."
        },
        {
          "num": 7,
          "text": "Ele dizia ao povo: — Depois de mim vem alguém que é mais importante do que eu, e eu não mereço a honra de me abaixar e desamarrar as correias das sandálias dele."
        },
        {
          "num": 8,
          "text": "Eu batizo vocês com água, mas ele os batizará com o Espírito Santo."
        },
        {
          "num": 9,
          "text": "Nessa ocasião Jesus veio de Nazaré, uma pequena cidade da região da Galileia, e foi batizado por João Batista no rio Jordão."
        },
        {
          "num": 10,
          "text": "No momento em que estava saindo da água, Jesus viu o céu se abrir e o Espírito de Deus descer como uma pomba sobre ele."
        },
        {
          "num": 11,
          "text": "E do céu veio uma voz, que disse: — Tu és o meu Filho querido e me dás muita alegria."
        },
        {
          "num": 12,
          "text": "Logo depois o Espírito Santo fez com que Jesus fosse para o deserto."
        },
        {
          "num": 13,
          "text": "Jesus ficou lá durante quarenta dias, sendo tentado por Satanás. Ali havia animais selvagens, e os anjos cuidavam de Jesus."
        },
        {
          "num": 14,
          "text": "Depois que João foi preso, Jesus seguiu para a região da Galileia e ali anunciava a boa notícia que vem de Deus."
        },
        {
          "num": 15,
          "text": "Ele dizia: — Chegou a hora, e o Reino de Deus está perto. Arrependam-se dos seus pecados e creiam no evangelho."
        },
        {
          "num": 16,
          "text": "Jesus estava andando pela beira do lago da Galileia quando viu dois pescadores. Eram Simão e o seu irmão André, que estavam no lago, pescando com redes."
        },
        {
          "num": 17,
          "text": "Jesus lhes disse: — Venham comigo, que eu ensinarei vocês a pescar gente."
        },
        {
          "num": 18,
          "text": "Então eles largaram logo as redes e foram com Jesus."
        },
        {
          "num": 19,
          "text": "Um pouco mais adiante Jesus viu outros dois irmãos. Eram Tiago e João, filhos de Zebedeu, que estavam no barco deles, consertando as redes."
        },
        {
          "num": 20,
          "text": "Jesus chamou os dois, e eles deixaram Zebedeu, o seu pai, e os empregados no barco e foram com ele."
        },
        {
          "num": 21,
          "text": "Jesus e os discípulos chegaram à cidade de Cafarnaum, e, no sábado, ele foi ensinar na sinagoga."
        },
        {
          "num": 22,
          "text": "As pessoas que o escutavam ficaram muito admiradas com a sua maneira de ensinar. É que Jesus ensinava com a autoridade dele mesmo e não como os mestres da Lei."
        },
        {
          "num": 23,
          "text": "Então chegou ali um homem que estava dominado por um espírito mau. O homem gritou:"
        },
        {
          "num": 24,
          "text": "— O que quer de nós, Jesus de Nazaré? Você veio para nos destruir? Sei muito bem quem é você: é o Santo que Deus enviou!"
        },
        {
          "num": 25,
          "text": "Então Jesus ordenou ao espírito mau: — Cale a boca e saia desse homem!"
        },
        {
          "num": 26,
          "text": "Aí o espírito sacudiu o homem com violência e, dando um grito, saiu dele."
        },
        {
          "num": 27,
          "text": "Todos ficaram espantados e diziam uns para os outros: — Que quer dizer isso? É um novo ensinamento dado com autoridade. Ele manda até nos espíritos maus, e eles obedecem."
        },
        {
          "num": 28,
          "text": "E a fama de Jesus se espalhou depressa por toda a região da Galileia."
        },
        {
          "num": 29,
          "text": "Logo depois, Jesus, Simão, André, Tiago e João saíram da sinagoga e foram até a casa de Simão e de André."
        },
        {
          "num": 30,
          "text": "A sogra de Simão estava de cama, com febre. Assim que Jesus chegou, contaram a ele que ela estava doente."
        },
        {
          "num": 31,
          "text": "Ele chegou perto dela, segurou a mão dela e ajudou-a a se levantar. A febre saiu da mulher, e ela começou a cuidar deles."
        },
        {
          "num": 32,
          "text": "À tarde, depois do pôr do sol, levaram até Jesus todos os doentes e as pessoas que estavam dominadas por demônios."
        },
        {
          "num": 33,
          "text": "Todo o povo da cidade se reuniu em frente da casa."
        },
        {
          "num": 34,
          "text": "Jesus curou muitas pessoas de todo tipo de doenças e expulsou muitos demônios. Ele não deixava que os demônios falassem, pois eles sabiam quem Jesus era."
        },
        {
          "num": 35,
          "text": "De manhã bem cedo, quando ainda estava escuro, Jesus se levantou, saiu da cidade, foi para um lugar deserto e ficou ali orando."
        },
        {
          "num": 36,
          "text": "Simão e os seus companheiros procuraram Jesus por toda parte."
        },
        {
          "num": 37,
          "text": "Quando o encontraram, disseram: — Todos estão procurando o senhor."
        },
        {
          "num": 38,
          "text": "Jesus respondeu: — Vamos aos povoados que ficam perto daqui, para que eu possa anunciar o evangelho ali também, pois foi para isso que eu vim."
        },
        {
          "num": 39,
          "text": "Jesus andava por toda a Galileia, anunciando o evangelho nas sinagogas e expulsando demônios."
        },
        {
          "num": 40,
          "text": "Um leproso chegou perto de Jesus, ajoelhou-se e disse: — Senhor, eu sei que o senhor pode me curar se quiser."
        },
        {
          "num": 41,
          "text": "Jesus ficou com muita pena dele, tocou nele e disse: — Sim! Eu quero. Você está curado."
        },
        {
          "num": 42,
          "text": "No mesmo instante a lepra desapareceu, e ele ficou curado."
        },
        {
          "num": 43,
          "text": "[43-44] E Jesus ordenou duramente: — Olhe! Não conte isso para ninguém, mas vá pedir ao sacerdote que examine você. Depois, a fim de provar para todos que você está curado, vá oferecer o sacrifício que Moisés ordenou. Então Jesus o mandou embora."
        },
        {
          "num": 44,
          "text": "[43-44] E Jesus ordenou duramente: — Olhe! Não conte isso para ninguém, mas vá pedir ao sacerdote que examine você. Depois, a fim de provar para todos que você está curado, vá oferecer o sacrifício que Moisés ordenou. Então Jesus o mandou embora."
        },
        {
          "num": 45,
          "text": "Mas o homem começou a falar muito e espalhou a notícia. Por isso Jesus não podia mais entrar abertamente em qualquer cidade, mas ficava fora, em lugares desertos. E gente de toda parte vinha procurá-lo."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Princípio do evangelho de Jesus Cristo, Filho de Deus."
        },
        {
          "num": 2,
          "text": "Conforme está escrito na profecia de Isaías: Eis aí envio diante da tua face o meu mensageiro, o qual preparará o teu caminho;"
        },
        {
          "num": 3,
          "text": "voz do que clama no deserto: Preparai o caminho do Senhor, endireitai as suas veredas;"
        },
        {
          "num": 4,
          "text": "apareceu João Batista no deserto, pregando batismo de arrependimento para remissão de pecados."
        },
        {
          "num": 5,
          "text": "Saíam a ter com ele toda a província da Judeia e todos os habitantes de Jerusalém; e, confessando os seus pecados, eram batizados por ele no rio Jordão."
        },
        {
          "num": 6,
          "text": "As vestes de João eram feitas de pelos de camelo; ele trazia um cinto de couro e se alimentava de gafanhotos e mel silvestre."
        },
        {
          "num": 7,
          "text": "E pregava, dizendo: Após mim vem aquele que é mais poderoso do que eu, do qual não sou digno de, curvando-me, desatar-lhe as correias das sandálias."
        },
        {
          "num": 8,
          "text": "Eu vos tenho batizado com água; ele, porém, vos batizará com o Espírito Santo."
        },
        {
          "num": 9,
          "text": "Naqueles dias, veio Jesus de Nazaré da Galileia e por João foi batizado no rio Jordão."
        },
        {
          "num": 10,
          "text": "Logo ao sair da água, viu os céus rasgarem-se e o Espírito descendo como pomba sobre ele."
        },
        {
          "num": 11,
          "text": "Então, foi ouvida uma voz dos céus: Tu és o meu Filho amado, em ti me comprazo."
        },
        {
          "num": 12,
          "text": "E logo o Espírito o impeliu para o deserto,"
        },
        {
          "num": 13,
          "text": "onde permaneceu quarenta dias, sendo tentado por Satanás; estava com as feras, mas os anjos o serviam."
        },
        {
          "num": 14,
          "text": "Depois de João ter sido preso, foi Jesus para a Galileia, pregando o evangelho de Deus,"
        },
        {
          "num": 15,
          "text": "dizendo: O tempo está cumprido, e o reino de Deus está próximo; arrependei-vos e crede no evangelho."
        },
        {
          "num": 16,
          "text": "Caminhando junto ao mar da Galileia, viu os irmãos Simão e André, que lançavam a rede ao mar, porque eram pescadores."
        },
        {
          "num": 17,
          "text": "Disse-lhes Jesus: Vinde após mim, e eu vos farei pescadores de homens."
        },
        {
          "num": 18,
          "text": "Então, eles deixaram imediatamente as redes e o seguiram."
        },
        {
          "num": 19,
          "text": "Pouco mais adiante, viu Tiago, filho de Zebedeu, e João, seu irmão, que estavam no barco consertando as redes."
        },
        {
          "num": 20,
          "text": "E logo os chamou. Deixando eles no barco a seu pai Zebedeu com os empregados, seguiram após Jesus."
        },
        {
          "num": 21,
          "text": "Depois, entraram em Cafarnaum, e, logo no sábado, foi ele ensinar na sinagoga."
        },
        {
          "num": 22,
          "text": "Maravilhavam-se da sua doutrina, porque os ensinava como quem tem autoridade e não como os escribas."
        },
        {
          "num": 23,
          "text": "Não tardou que aparecesse na sinagoga um homem possesso de espírito imundo, o qual bradou:"
        },
        {
          "num": 24,
          "text": "Que temos nós contigo, Jesus Nazareno? Vieste para perder-nos? Bem sei quem és: o Santo de Deus!"
        },
        {
          "num": 25,
          "text": "Mas Jesus o repreendeu, dizendo: Cala-te e sai desse homem."
        },
        {
          "num": 26,
          "text": "Então, o espírito imundo, agitando-o violentamente e bradando em alta voz, saiu dele."
        },
        {
          "num": 27,
          "text": "Todos se admiraram, a ponto de perguntarem entre si: Que vem a ser isto? Uma nova doutrina! Com autoridade ele ordena aos espíritos imundos, e eles lhe obedecem!"
        },
        {
          "num": 28,
          "text": "Então, correu célere a fama de Jesus em todas as direções, por toda a circunvizinhança da Galileia."
        },
        {
          "num": 29,
          "text": "E, saindo eles da sinagoga, foram, com Tiago e João, diretamente para a casa de Simão e André."
        },
        {
          "num": 30,
          "text": "A sogra de Simão achava-se acamada, com febre; e logo lhe falaram a respeito dela."
        },
        {
          "num": 31,
          "text": "Então, aproximando-se, tomou-a pela mão; e a febre a deixou, passando ela a servi-los."
        },
        {
          "num": 32,
          "text": "À tarde, ao cair do sol, trouxeram a Jesus todos os enfermos e endemoninhados."
        },
        {
          "num": 33,
          "text": "Toda a cidade estava reunida à porta."
        },
        {
          "num": 34,
          "text": "E ele curou muitos doentes de toda sorte de enfermidades; também expeliu muitos demônios, não lhes permitindo que falassem, porque sabiam quem ele era."
        },
        {
          "num": 35,
          "text": "Tendo-se levantado alta madrugada, saiu, foi para um lugar deserto e ali orava."
        },
        {
          "num": 36,
          "text": "Procuravam-no diligentemente Simão e os que com ele estavam."
        },
        {
          "num": 37,
          "text": "Tendo-o encontrado, lhe disseram: Todos te buscam."
        },
        {
          "num": 38,
          "text": "Jesus, porém, lhes disse: Vamos a outros lugares, às povoações vizinhas, a fim de que eu pregue também ali, pois para isso é que eu vim."
        },
        {
          "num": 39,
          "text": "Então, foi por toda a Galileia, pregando nas sinagogas deles e expelindo os demônios."
        },
        {
          "num": 40,
          "text": "Aproximou-se dele um leproso rogando-lhe, de joelhos: Se quiseres, podes purificar-me."
        },
        {
          "num": 41,
          "text": "Jesus, profundamente compadecido, estendeu a mão, tocou-o e disse-lhe: Quero, fica limpo!"
        },
        {
          "num": 42,
          "text": "No mesmo instante, lhe desapareceu a lepra, e ficou limpo."
        },
        {
          "num": 43,
          "text": "Fazendo-lhe, então, veemente advertência, logo o despediu"
        },
        {
          "num": 44,
          "text": "e lhe disse: Olha, não digas nada a ninguém; mas vai, mostra-te ao sacerdote e oferece pela tua purificação o que Moisés determinou, para servir de testemunho ao povo."
        },
        {
          "num": 45,
          "text": "Mas, tendo ele saído, entrou a propalar muitas coisas e a divulgar a notícia, a ponto de não mais poder Jesus entrar publicamente em qualquer cidade, mas permanecia fora, em lugares ermos; e de toda parte vinham ter com ele."
        }
      ]
    }
  },
  "lc-2": {
    "book": "Lucas",
    "chapter": 2,
    "title": "O Nascimento de Jesus em Belém",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Por essa altura, o imperador Augusto decretou que se fizesse o recenseamento de toda a população do império romano."
        },
        {
          "num": 2,
          "text": "Foi o primeiro recenseamento quando Quirino era governador da Síria ."
        },
        {
          "num": 3,
          "text": "Todos iam inscrever-se, cada um na sua cidade."
        },
        {
          "num": 4,
          "text": "Por isso José partiu de Nazaré, na província da Galileia, e foi para a cidade de David que se chama Belém, na província da Judeia. Como José era descendente de David,"
        },
        {
          "num": 5,
          "text": "foi lá inscrever-se levando consigo Maria, sua noiva , que estava grávida."
        },
        {
          "num": 6,
          "text": "Enquanto estavam em Belém, chegou o momento de Maria dar à luz."
        },
        {
          "num": 7,
          "text": "Nasceu-lhe então o menino, que era o seu primeiro filho. Envolveu-o em panos e deitou-o numa manjedoura, por não conseguirem arranjar lugar na casa. Os anjos e os pastores"
        },
        {
          "num": 8,
          "text": "Naquela região havia pastores que passavam a noite no campo guardando os rebanhos."
        },
        {
          "num": 9,
          "text": "Apareceu-lhes um anjo e a luz gloriosa do Senhor envolveu-os. Ficaram muito assustados,"
        },
        {
          "num": 10,
          "text": "mas o anjo disse-lhes: «Não tenham medo! Venho aqui trazer-vos uma boa nova que será motivo de grande alegria para todo o povo."
        },
        {
          "num": 11,
          "text": "Pois nasceu hoje, na cidade de David , o vosso Salvador que é Cristo , o Senhor!"
        },
        {
          "num": 12,
          "text": "Poderão reconhecê-lo por este sinal: encontrarão o menino envolvido em panos e deitado numa manjedoura.»"
        },
        {
          "num": 13,
          "text": "Nisto, juntaram-se ao anjo muitos outros anjos do céu louvando a Deus e cantando:"
        },
        {
          "num": 14,
          "text": "«Glória a Deus no mais alto dos céus e paz na Terra aos homens a quem ele quer bem!»"
        },
        {
          "num": 15,
          "text": "Mal os anjos partiram para o Céu, os pastores disseram uns para os outros: «Vamos a Belém para vermos o que o Senhor nos deu a conhecer.»"
        },
        {
          "num": 16,
          "text": "Foram a toda a pressa e lá encontraram Maria e José, e o menino, que estava deitado na manjedoura."
        },
        {
          "num": 17,
          "text": "Depois de verem tudo isto, puseram-se a contar a toda a gente o que lhes fora dito a respeito daquele menino."
        },
        {
          "num": 18,
          "text": "Todos os que ouviram o que os pastores diziam ficavam muito admirados."
        },
        {
          "num": 19,
          "text": "Porém Maria guardava todas estas coisas no seu coração e meditava nelas."
        },
        {
          "num": 20,
          "text": "Os pastores foram-se embora, e pelo caminho cantavam louvores a Deus, por tudo o que tinham ouvido e visto, exatamente como lhes fora anunciado. Circuncisão e apresentação de Jesus"
        },
        {
          "num": 21,
          "text": "Quando o menino tinha oito dias, circuncidaram-no e puseram-lhe então o nome de Jesus, tal como o anjo indicara antes de ele ser concebido."
        },
        {
          "num": 22,
          "text": "Chegado o tempo da cerimónia da sua purificação , conforme a Lei de Moisés , levaram o menino ao templo de Jerusalém para o apresentarem ao Senhor."
        },
        {
          "num": 23,
          "text": "É que na lei de Deus está escrito: Se o primeiro filho que nascer for menino, deverá ser consagrado ao Senhor ."
        },
        {
          "num": 24,
          "text": "José e Maria ofereceram também um sacrifício , como manda a lei: um par de rolas ou dois pombinhos ."
        },
        {
          "num": 25,
          "text": "Ora vivia nessa altura em Jerusalém um homem chamado Simeão. Era justo e muito piedoso e esperava a consolação de Israel. O Espírito Santo estava com ele"
        },
        {
          "num": 26,
          "text": "e tinha-lhe assegurado que não havia de morrer sem ver o Messias enviado por Deus."
        },
        {
          "num": 27,
          "text": "Simeão foi ao templo guiado pelo Espírito Santo. E quando os pais do menino Jesus o iam apresentar, para cumprir o que a lei mandava a respeito dele,"
        },
        {
          "num": 28,
          "text": "Simeão tomou-o nos braços, deu graças a Deus e disse:"
        },
        {
          "num": 29,
          "text": "«Agora, Senhor, já podes deixar partir em paz o teu servo conforme a tua palavra!"
        },
        {
          "num": 30,
          "text": "Já vi com os meus olhos a tua salvação"
        },
        {
          "num": 31,
          "text": "que preparaste para todos os povos."
        },
        {
          "num": 32,
          "text": "Luz de revelação para os pagãos e glória para Israel, teu povo.»"
        },
        {
          "num": 33,
          "text": "Tanto o pai como a mãe de Jesus estavam admirados com o que se dizia dele."
        },
        {
          "num": 34,
          "text": "Simeão abençoou-os e disse a Maria sua mãe: «Este menino é para muitos em Israel motivo de ruína ou salvação. Ele é sinal de divisão entre os homens,"
        },
        {
          "num": 35,
          "text": "para revelar os pensamentos escondidos de muitos. Uma grande dor, como golpe de espada, trespassará a tua alma.»"
        },
        {
          "num": 36,
          "text": "Vivia também em Jerusalém uma profetisa chamada Ana, filha de Fanuel, da tribo de Asser. Já tinha oitenta e quatro anos de idade e tinha-lhe morrido o marido ao fim de sete anos de casada."
        },
        {
          "num": 37,
          "text": "Depois continuou sempre viúva e não saía do templo, onde adorava a Deus, de dia e de noite, com jejuns e orações."
        },
        {
          "num": 38,
          "text": "Ana apareceu naquele momento e começou também a louvar a Deus. E falava do menino a todos os que esperavam que Deus salvasse Jerusalém."
        },
        {
          "num": 39,
          "text": "Depois de terem cumprido tudo o que a lei de Deus manda fazer, José e Maria voltaram com Jesus para a sua terra, Nazaré da Galileia."
        },
        {
          "num": 40,
          "text": "O menino crescia e tornava-se mais forte e cheio de sabedoria. E a graça de Deus estava com ele. Jesus aos doze anos"
        },
        {
          "num": 41,
          "text": "Todos os anos os pais de Jesus iam a Jerusalém à festa da Páscoa ."
        },
        {
          "num": 42,
          "text": "Quando o menino tinha doze anos, foram lá como de costume."
        },
        {
          "num": 43,
          "text": "Passados os dias da festa, José e Maria voltaram para casa, mas Jesus ficou em Jerusalém sem os pais darem por isso."
        },
        {
          "num": 44,
          "text": "Julgavam que ele vinha com algum grupo pelo caminho. Ao fim de um dia de viagem, começaram a procurá-lo entre os parentes e os amigos,"
        },
        {
          "num": 45,
          "text": "mas não o encontraram. Voltaram por isso a Jerusalém à sua procura."
        },
        {
          "num": 46,
          "text": "Ao fim de três dias descobriram-no dentro do templo , sentado entre os doutores. Escutava o que eles diziam e fazia-lhes perguntas."
        },
        {
          "num": 47,
          "text": "Todos os que o ouviam ficavam maravilhados com a sua inteligência e as suas respostas."
        },
        {
          "num": 48,
          "text": "Quando os pais o viram, ficaram muito impressionados e a mãe disse-lhe: «Filho, por que nos fizeste isso? O teu pai e eu temos andado aflitos à tua procura.»"
        },
        {
          "num": 49,
          "text": "Jesus respondeu-lhes: «Por que é que me procuravam? Não sabiam que eu tinha de estar na casa de meu Pai ?»"
        },
        {
          "num": 50,
          "text": "Mas eles não compreenderam o que lhes disse."
        },
        {
          "num": 51,
          "text": "Jesus voltou então com eles para Nazaré, e continuou a ser-lhes obediente. Sua mãe guardava atentamente todas estas coisas no coração ."
        },
        {
          "num": 52,
          "text": "Jesus crescia em sabedoria, idade e graça diante de Deus e dos homens."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Naquele tempo o imperador Augusto mandou uma ordem para todos os povos do Império. Todas as pessoas deviam se registrar a fim de ser feita uma contagem da população."
        },
        {
          "num": 2,
          "text": "Quando foi feito esse primeiro recenseamento, Cirênio era governador da Síria."
        },
        {
          "num": 3,
          "text": "Então todos foram se registrar, cada um na sua própria cidade."
        },
        {
          "num": 4,
          "text": "Por isso José foi de Nazaré, na Galileia, para a região da Judeia, a uma cidade chamada Belém, onde tinha nascido o rei Davi. José foi registrar-se lá porque era descendente de Davi."
        },
        {
          "num": 5,
          "text": "Levou consigo Maria, com quem tinha casamento contratado. Ela estava grávida,"
        },
        {
          "num": 6,
          "text": "e aconteceu que, enquanto se achavam em Belém, chegou o tempo de a criança nascer."
        },
        {
          "num": 7,
          "text": "Então Maria deu à luz o seu primeiro filho. Enrolou o menino em panos e o deitou numa manjedoura, pois não havia lugar para eles na pensão."
        },
        {
          "num": 8,
          "text": "Naquela região havia pastores que estavam passando a noite nos campos, tomando conta dos rebanhos de ovelhas."
        },
        {
          "num": 9,
          "text": "Então um anjo do Senhor apareceu, e a luz gloriosa do Senhor brilhou por cima dos pastores. Eles ficaram com muito medo,"
        },
        {
          "num": 10,
          "text": "mas o anjo disse: — Não tenham medo! Estou aqui a fim de trazer uma boa notícia para vocês, e ela será motivo de grande alegria também para todo o povo!"
        },
        {
          "num": 11,
          "text": "Hoje mesmo, na cidade de Davi, nasceu o Salvador de vocês — o Messias, o Senhor!"
        },
        {
          "num": 12,
          "text": "Esta será a prova: vocês encontrarão uma criancinha enrolada em panos e deitada numa manjedoura."
        },
        {
          "num": 13,
          "text": "No mesmo instante apareceu junto com o anjo uma multidão de outros anjos, como se fosse um exército celestial. Eles cantavam hinos de louvor a Deus, dizendo:"
        },
        {
          "num": 14,
          "text": "— Glória a Deus nas maiores alturas do céu! E paz na terra para as pessoas a quem ele quer bem!"
        },
        {
          "num": 15,
          "text": "Quando os anjos voltaram para o céu, os pastores disseram uns aos outros: — Vamos até Belém para ver o que aconteceu; vamos ver aquilo que o Senhor nos contou."
        },
        {
          "num": 16,
          "text": "Eles foram depressa, e encontraram Maria e José, e viram o menino deitado na manjedoura."
        },
        {
          "num": 17,
          "text": "Então contaram o que os anjos tinham dito a respeito dele."
        },
        {
          "num": 18,
          "text": "Todos os que ouviram o que os pastores disseram ficaram muito admirados."
        },
        {
          "num": 19,
          "text": "Maria guardava todas essas coisas no seu coração e pensava muito nelas."
        },
        {
          "num": 20,
          "text": "Então os pastores voltaram para os campos, cantando hinos de louvor a Deus pelo que tinham ouvido e visto. E tudo tinha acontecido como o anjo havia falado."
        },
        {
          "num": 21,
          "text": "Uma semana depois, quando chegou o dia de circuncidar o menino, puseram nele o nome de Jesus. Pois o anjo tinha dado esse nome ao menino antes de ele nascer."
        },
        {
          "num": 22,
          "text": "Chegou o dia de Maria e José cumprirem a cerimônia da purificação, conforme manda a Lei de Moisés. Então eles levaram a criança para Jerusalém a fim de apresentá-la ao Senhor."
        },
        {
          "num": 23,
          "text": "Pois está escrito na Lei do Senhor: “Todo primeiro filho será separado e dedicado ao Senhor.”"
        },
        {
          "num": 24,
          "text": "Eles foram lá também para oferecer em sacrifício duas rolinhas ou dois pombinhos, como a Lei do Senhor manda."
        },
        {
          "num": 25,
          "text": "Em Jerusalém morava um homem chamado Simeão. Ele era bom e piedoso e esperava a salvação do povo de Israel. O Espírito Santo estava com ele,"
        },
        {
          "num": 26,
          "text": "e o próprio Espírito lhe tinha prometido que, antes de morrer, ele iria ver o Messias enviado pelo Senhor."
        },
        {
          "num": 27,
          "text": "Guiado pelo Espírito, Simeão foi ao Templo. Quando os pais levaram o menino Jesus ao Templo para fazer o que a Lei manda,"
        },
        {
          "num": 28,
          "text": "Simeão pegou o menino no colo e louvou a Deus. Ele disse:"
        },
        {
          "num": 29,
          "text": "— Agora, Senhor, cumpriste a promessa que fizeste e já podes deixar este teu servo partir em paz."
        },
        {
          "num": 30,
          "text": "Pois eu já vi com os meus próprios olhos a tua salvação,"
        },
        {
          "num": 31,
          "text": "que preparaste na presença de todos os povos:"
        },
        {
          "num": 32,
          "text": "uma luz para mostrar o teu caminho a todos os que não são judeus e para dar glória ao teu povo de Israel."
        },
        {
          "num": 33,
          "text": "O pai e a mãe do menino ficaram admirados com o que Simeão disse a respeito dele."
        },
        {
          "num": 34,
          "text": "Simeão os abençoou e disse a Maria, a mãe de Jesus: — Este menino foi escolhido por Deus tanto para a destruição como para a salvação de muita gente em Israel. Ele vai ser um sinal de Deus; muitas pessoas falarão contra ele,"
        },
        {
          "num": 35,
          "text": "e assim os pensamentos secretos delas serão conhecidos. E a tristeza, como uma espada afiada, cortará o seu coração, Maria."
        },
        {
          "num": 36,
          "text": "Havia ali também uma profetisa chamada Ana, que era viúva e muito idosa. Ela era filha de Fanuel, da tribo de Aser. Sete anos depois que ela havia casado, o seu marido morreu."
        },
        {
          "num": 37,
          "text": "Agora ela estava com oitenta e quatro anos de idade. Nunca saía do pátio do Templo e adorava a Deus dia e noite, jejuando e fazendo orações."
        },
        {
          "num": 38,
          "text": "Naquele momento ela chegou e começou a louvar a Deus e a falar a respeito do menino para todos os que esperavam a libertação de Jerusalém."
        },
        {
          "num": 39,
          "text": "Quando terminaram de fazer tudo o que a Lei do Senhor manda, José e Maria voltaram para a Galileia, para a casa deles na cidade de Nazaré."
        },
        {
          "num": 40,
          "text": "O menino crescia e ficava forte; tinha muita sabedoria e era abençoado por Deus."
        },
        {
          "num": 41,
          "text": "Todos os anos os pais de Jesus iam a Jerusalém para a Festa da Páscoa."
        },
        {
          "num": 42,
          "text": "Quando Jesus tinha doze anos, eles foram à Festa, conforme o seu costume."
        },
        {
          "num": 43,
          "text": "Depois que a Festa acabou, eles começaram a viagem de volta para casa. Mas Jesus tinha ficado em Jerusalém, e os seus pais não sabiam disso."
        },
        {
          "num": 44,
          "text": "Eles pensavam que ele estivesse no grupo de pessoas que vinha voltando e por isso viajaram o dia todo. Então começaram a procurá-lo entre os parentes e amigos."
        },
        {
          "num": 45,
          "text": "Como não o encontraram, voltaram a Jerusalém para procurá-lo."
        },
        {
          "num": 46,
          "text": "Três dias depois encontraram o menino num dos pátios do Templo, sentado no meio dos mestres da Lei, ouvindo-os e fazendo perguntas a eles."
        },
        {
          "num": 47,
          "text": "Todos os que o ouviam estavam muito admirados com a sua inteligência e com as respostas que dava."
        },
        {
          "num": 48,
          "text": "Quando os pais viram o menino, também ficaram admirados. E a sua mãe lhe disse: — Meu filho, por que foi que você fez isso conosco? O seu pai e eu estávamos muito aflitos procurando você."
        },
        {
          "num": 49,
          "text": "Jesus respondeu: — Por que vocês estavam me procurando? Não sabiam que eu devia estar na casa do meu Pai?"
        },
        {
          "num": 50,
          "text": "Mas eles não entenderam o que ele disse."
        },
        {
          "num": 51,
          "text": "Então Jesus voltou com os seus pais para Nazaré e continuava a ser obediente a eles. E a sua mãe guardava tudo isso no coração."
        },
        {
          "num": 52,
          "text": "Conforme crescia, Jesus ia crescendo também em sabedoria, e tanto Deus como as pessoas gostavam cada vez mais dele."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Naqueles dias, foi publicado um decreto de César Augusto, convocando toda a população do império para recensear-se."
        },
        {
          "num": 2,
          "text": "Este, o primeiro recenseamento, foi feito quando Quirino era governador da Síria."
        },
        {
          "num": 3,
          "text": "Todos iam alistar-se, cada um à sua própria cidade."
        },
        {
          "num": 4,
          "text": "José também subiu da Galileia, da cidade de Nazaré, para a Judeia, à cidade de Davi, chamada Belém, por ser ele da casa e família de Davi,"
        },
        {
          "num": 5,
          "text": "a fim de alistar-se com Maria, sua esposa, que estava grávida."
        },
        {
          "num": 6,
          "text": "Estando eles ali, aconteceu completarem-se-lhe os dias,"
        },
        {
          "num": 7,
          "text": "e ela deu à luz o seu filho primogênito, enfaixou-o e o deitou numa manjedoura, porque não havia lugar para eles na hospedaria."
        },
        {
          "num": 8,
          "text": "Havia, naquela mesma região, pastores que viviam nos campos e guardavam o seu rebanho durante as vigílias da noite."
        },
        {
          "num": 9,
          "text": "E um anjo do Senhor desceu aonde eles estavam, e a glória do Senhor brilhou ao redor deles; e ficaram tomados de grande temor."
        },
        {
          "num": 10,
          "text": "O anjo, porém, lhes disse: Não temais; eis aqui vos trago boa-nova de grande alegria, que o será para todo o povo:"
        },
        {
          "num": 11,
          "text": "é que hoje vos nasceu, na cidade de Davi, o Salvador, que é Cristo, o Senhor."
        },
        {
          "num": 12,
          "text": "E isto vos servirá de sinal: encontrareis uma criança envolta em faixas e deitada em manjedoura."
        },
        {
          "num": 13,
          "text": "E, subitamente, apareceu com o anjo uma multidão da milícia celestial, louvando a Deus e dizendo:"
        },
        {
          "num": 14,
          "text": "Glória a Deus nas maiores alturas, e paz na terra entre os homens, a quem ele quer bem."
        },
        {
          "num": 15,
          "text": "E, ausentando-se deles os anjos para o céu, diziam os pastores uns aos outros: Vamos até Belém e vejamos os acontecimentos que o Senhor nos deu a conhecer."
        },
        {
          "num": 16,
          "text": "Foram apressadamente e acharam Maria e José e a criança deitada na manjedoura."
        },
        {
          "num": 17,
          "text": "E, vendo-o, divulgaram o que lhes tinha sido dito a respeito deste menino."
        },
        {
          "num": 18,
          "text": "Todos os que ouviram se admiraram das coisas referidas pelos pastores."
        },
        {
          "num": 19,
          "text": "Maria, porém, guardava todas estas palavras, meditando-as no coração."
        },
        {
          "num": 20,
          "text": "Voltaram, então, os pastores glorificando e louvando a Deus por tudo o que tinham ouvido e visto, como lhes fora anunciado."
        },
        {
          "num": 21,
          "text": "Completados oito dias para ser circuncidado o menino, deram-lhe o nome de JESUS, como lhe chamara o anjo, antes de ser concebido."
        },
        {
          "num": 22,
          "text": "Passados os dias da purificação deles segundo a Lei de Moisés, levaram-no a Jerusalém para o apresentarem ao Senhor,"
        },
        {
          "num": 23,
          "text": "conforme o que está escrito na Lei do Senhor: Todo primogênito ao Senhor será consagrado;"
        },
        {
          "num": 24,
          "text": "e para oferecer um sacrifício, segundo o que está escrito na referida Lei: Um par de rolas ou dois pombinhos."
        },
        {
          "num": 25,
          "text": "Havia em Jerusalém um homem chamado Simeão; homem este justo e piedoso que esperava a consolação de Israel; e o Espírito Santo estava sobre ele."
        },
        {
          "num": 26,
          "text": "Revelara-lhe o Espírito Santo que não passaria pela morte antes de ver o Cristo do Senhor."
        },
        {
          "num": 27,
          "text": "Movido pelo Espírito, foi ao templo; e, quando os pais trouxeram o menino Jesus para fazerem com ele o que a Lei ordenava,"
        },
        {
          "num": 28,
          "text": "Simeão o tomou nos braços e louvou a Deus, dizendo:"
        },
        {
          "num": 29,
          "text": "Agora, Senhor, podes despedir em paz o teu servo, segundo a tua palavra;"
        },
        {
          "num": 30,
          "text": "porque os meus olhos já viram a tua salvação,"
        },
        {
          "num": 31,
          "text": "a qual preparaste diante de todos os povos:"
        },
        {
          "num": 32,
          "text": "luz para revelação aos gentios, e para glória do teu povo de Israel."
        },
        {
          "num": 33,
          "text": "E estavam o pai e a mãe do menino admirados do que dele se dizia."
        },
        {
          "num": 34,
          "text": "Simeão os abençoou e disse a Maria, mãe do menino: Eis que este menino está destinado tanto para ruína como para levantamento de muitos em Israel e para ser alvo de contradição"
        },
        {
          "num": 35,
          "text": "(também uma espada traspassará a tua própria alma), para que se manifestem os pensamentos de muitos corações."
        },
        {
          "num": 36,
          "text": "Havia uma profetisa, chamada Ana, filha de Fanuel, da tribo de Aser, avançada em dias, que vivera com seu marido sete anos desde que se casara"
        },
        {
          "num": 37,
          "text": "e que era viúva de oitenta e quatro anos. Esta não deixava o templo, mas adorava noite e dia em jejuns e orações."
        },
        {
          "num": 38,
          "text": "E, chegando naquela hora, dava graças a Deus e falava a respeito do menino a todos os que esperavam a redenção de Jerusalém."
        },
        {
          "num": 39,
          "text": "Cumpridas todas as ordenanças segundo a Lei do Senhor, voltaram para a Galileia, para a sua cidade de Nazaré."
        },
        {
          "num": 40,
          "text": "Crescia o menino e se fortalecia, enchendo-se de sabedoria; e a graça de Deus estava sobre ele."
        },
        {
          "num": 41,
          "text": "Ora, anualmente iam seus pais a Jerusalém, para a Festa da Páscoa."
        },
        {
          "num": 42,
          "text": "Quando ele atingiu os doze anos, subiram a Jerusalém, segundo o costume da festa."
        },
        {
          "num": 43,
          "text": "Terminados os dias da festa, ao regressarem, permaneceu o menino Jesus em Jerusalém, sem que seus pais o soubessem."
        },
        {
          "num": 44,
          "text": "Pensando, porém, estar ele entre os companheiros de viagem, foram caminho de um dia e, então, passaram a procurá-lo entre os parentes e os conhecidos;"
        },
        {
          "num": 45,
          "text": "e, não o tendo encontrado, voltaram a Jerusalém à sua procura."
        },
        {
          "num": 46,
          "text": "Três dias depois, o acharam no templo, assentado no meio dos doutores, ouvindo-os e interrogando-os."
        },
        {
          "num": 47,
          "text": "E todos os que o ouviam muito se admiravam da sua inteligência e das suas respostas."
        },
        {
          "num": 48,
          "text": "Logo que seus pais o viram, ficaram maravilhados; e sua mãe lhe disse: Filho, por que fizeste assim conosco? Teu pai e eu, aflitos, estamos à tua procura."
        },
        {
          "num": 49,
          "text": "Ele lhes respondeu: Por que me procuráveis? Não sabíeis que me cumpria estar na casa de meu Pai?"
        },
        {
          "num": 50,
          "text": "Não compreenderam, porém, as palavras que lhes dissera."
        },
        {
          "num": 51,
          "text": "E desceu com eles para Nazaré; e era-lhes submisso. Sua mãe, porém, guardava todas estas coisas no coração."
        },
        {
          "num": 52,
          "text": "E crescia Jesus em sabedoria, estatura e graça, diante de Deus e dos homens."
        }
      ]
    }
  },
  "lc-15": {
    "book": "Lucas",
    "chapter": 15,
    "title": "A Ovelha Perdida e o Filho Pródigo",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Todos os cobradores de impostos e outros pecadores se chegavam a Jesus para o ouvir."
        },
        {
          "num": 2,
          "text": "Por isso, os fariseus e os doutores da lei o criticavam: «Este recebe pecadores e come com eles .»"
        },
        {
          "num": 3,
          "text": "Jesus apresentou-lhes uma parábola :"
        },
        {
          "num": 4,
          "text": "«Suponham que algum de vós tem cem ovelhas e perde uma delas. Não deixará logo as noventa e nove no deserto, para ir à procura da ovelha perdida até a encontrar?"
        },
        {
          "num": 5,
          "text": "Quando a encontra, põe-na aos ombros todo satisfeito"
        },
        {
          "num": 6,
          "text": "e, ao chegar a casa, diz aos amigos e vizinhos: “Alegrem-se comigo porque já encontrei a minha ovelha que andava perdida.”"
        },
        {
          "num": 7,
          "text": "Da mesma maneira, digo-vos que haverá mais alegria no Céu por um pecador que se arrepende do que por noventa e nove justos que não precisam de se arrepender.» Alegria pela moeda achada"
        },
        {
          "num": 8,
          "text": "«Suponham também que uma mulher tem dez moedas de prata e perde uma delas. Que é que ela faz? Acende a lâmpada, varre a casa e procura cuidadosamente até a encontrar."
        },
        {
          "num": 9,
          "text": "Quando a encontra, diz às amigas e vizinhas: “Alegrem-se comigo, porque já encontrei a moeda perdida.”"
        },
        {
          "num": 10,
          "text": "Da mesma maneira, digo-vos que há alegria entre os anjos de Deus cada vez que um pecador se arrepende.» Regresso do filho pródigo"
        },
        {
          "num": 11,
          "text": "E prosseguiu: «Um certo homem tinha dois filhos."
        },
        {
          "num": 12,
          "text": "O mais novo pediu ao pai: “Pai, dá-me a parte da herança que me pertence.” E o pai repartiu os bens pelos dois filhos."
        },
        {
          "num": 13,
          "text": "Poucos dias depois, o mais novo reuniu tudo o que era dele e partiu para uma terra muito distante, onde gastou o que possuía."
        },
        {
          "num": 14,
          "text": "Depois de ter gasto tudo, e como houve muita fome naquela região, começou a ter necessidade."
        },
        {
          "num": 15,
          "text": "Foi pedir trabalho a um homem da região que o mandou para os seus campos guardar porcos."
        },
        {
          "num": 16,
          "text": "Desejava encher o estômago mesmo com as bolotas que os porcos comiam, mas ninguém lhas dava."
        },
        {
          "num": 17,
          "text": "Foi então que caiu em si e pensou: “Tantos trabalhadores do meu pai têm quanta comida querem e eu estou para aqui a morrer de fome!"
        },
        {
          "num": 18,
          "text": "Vou mas é ter com o meu pai e digo-lhe: Pai, pequei contra Deus e contra ti."
        },
        {
          "num": 19,
          "text": "Já nem mereço ser teu filho, mas aceita-me como um dos teus trabalhadores.”"
        },
        {
          "num": 20,
          "text": "Levantou-se e voltou para o pai. Mas ainda ele vinha longe de casa e já o pai o tinha visto. Cheio de ternura, correu para ele, apertou-o nos braços e cobriu-o de beijos."
        },
        {
          "num": 21,
          "text": "O filho disse-lhe: “Pai, pequei contra Deus e contra ti. Já nem mereço ser teu filho.”"
        },
        {
          "num": 22,
          "text": "Mas o pai ordenou logo aos empregados: “Tragam depressa o melhor fato e vistam-lho. Ponham-lhe também um anel no dedo e sandálias nos pés."
        },
        {
          "num": 23,
          "text": "Tragam o bezerro mais gordo e matem-no. Vamos fazer um banquete,"
        },
        {
          "num": 24,
          "text": "porque este meu filho estava morto e voltou a viver, estava perdido e apareceu.” E começaram com a festa."
        },
        {
          "num": 25,
          "text": "Ora o filho mais velho estava no campo. Ao regressar, quando se aproximava de casa, ouviu a música e as danças."
        },
        {
          "num": 26,
          "text": "Chamou um dos empregados e perguntou-lhe o que era aquilo."
        },
        {
          "num": 27,
          "text": "E o empregado disse-lhe: “Foi o teu irmão que voltou e o teu pai matou o bezerro mais gordo, por ele ter chegado são e salvo.”"
        },
        {
          "num": 28,
          "text": "Ao ouvir isto, ficou zangado e nem queria entrar. O pai saiu para o convencer."
        },
        {
          "num": 29,
          "text": "Mas ele respondeu: “Sirvo-te há tantos anos, sem nunca ter desobedecido às tuas ordens, e não me deste sequer um cabrito para fazer uma festa com os meus amigos."
        },
        {
          "num": 30,
          "text": "Vem agora este teu filho, que desperdiçou o teu dinheiro com prostitutas, e mataste logo o bezerro mais gordo.”"
        },
        {
          "num": 31,
          "text": "“Meu filho”, respondeu-lhe, “tu estás sempre comigo e tudo o que eu tenho é teu,"
        },
        {
          "num": 32,
          "text": "mas era preciso fazermos uma festa e alegrarmo-nos, porque o teu irmão estava morto e voltou a viver, estava perdido e reapareceu.”»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Certa ocasião, muitos cobradores de impostos e outras pessoas de má fama chegaram perto de Jesus para o ouvir."
        },
        {
          "num": 2,
          "text": "Os fariseus e os mestres da Lei criticavam Jesus, dizendo: — Este homem se mistura com gente de má fama e toma refeições com eles."
        },
        {
          "num": 3,
          "text": "Então Jesus contou esta parábola:"
        },
        {
          "num": 4,
          "text": "— Se algum de vocês tem cem ovelhas e perde uma, por acaso não vai procurá-la? Assim, deixa no campo as outras noventa e nove e vai procurar a ovelha perdida até achá-la."
        },
        {
          "num": 5,
          "text": "Quando a encontra, fica muito contente e volta com ela nos ombros."
        },
        {
          "num": 6,
          "text": "Chegando à sua casa, chama os amigos e vizinhos e diz: “Alegrem-se comigo porque achei a minha ovelha perdida.”"
        },
        {
          "num": 7,
          "text": "— Pois eu lhes digo que assim também vai haver mais alegria no céu por um pecador que se arrepende dos seus pecados do que por noventa e nove pessoas boas que não precisam se arrepender."
        },
        {
          "num": 8,
          "text": "Jesus continuou: — Se uma mulher que tem dez moedas de prata perder uma, vai procurá-la, não é? Ela acende uma lamparina, varre a casa e procura com muito cuidado até achá-la."
        },
        {
          "num": 9,
          "text": "E, quando a encontra, convida as amigas e vizinhas e diz: “Alegrem-se comigo porque achei a minha moeda perdida.”"
        },
        {
          "num": 10,
          "text": "— Pois eu digo a vocês que assim também os anjos de Deus se alegrarão por causa de um pecador que se arrepende dos seus pecados."
        },
        {
          "num": 11,
          "text": "E Jesus disse ainda: — Um homem tinha dois filhos."
        },
        {
          "num": 12,
          "text": "Certo dia o mais moço disse ao pai: “Pai, quero que o senhor me dê agora a minha parte da herança.” — E o pai repartiu os bens entre os dois."
        },
        {
          "num": 13,
          "text": "Poucos dias depois, o filho mais moço ajuntou tudo o que era seu e partiu para um país que ficava muito longe. Ali viveu uma vida cheia de pecado e desperdiçou tudo o que tinha."
        },
        {
          "num": 14,
          "text": "— O rapaz já havia gastado tudo, quando houve uma grande fome naquele país, e ele começou a passar necessidade."
        },
        {
          "num": 15,
          "text": "Então procurou um dos moradores daquela terra e pediu ajuda. Este o mandou para a sua fazenda a fim de tratar dos porcos."
        },
        {
          "num": 16,
          "text": "Ali, com fome, ele tinha vontade de comer o que os porcos comiam, mas ninguém lhe dava nada."
        },
        {
          "num": 17,
          "text": "Caindo em si, ele pensou: “Quantos trabalhadores do meu pai têm comida de sobra, e eu estou aqui morrendo de fome!"
        },
        {
          "num": 18,
          "text": "Vou voltar para a casa do meu pai e dizer: ‘Pai, pequei contra Deus e contra o senhor"
        },
        {
          "num": 19,
          "text": "e não mereço mais ser chamado de seu filho. Me aceite como um dos seus trabalhadores.’”"
        },
        {
          "num": 20,
          "text": "Então saiu dali e voltou para a casa do pai. — Quando o rapaz ainda estava longe de casa, o pai o avistou. E, com muita pena do filho, correu, e o abraçou, e beijou."
        },
        {
          "num": 21,
          "text": "E o filho disse: “Pai, pequei contra Deus e contra o senhor e não mereço mais ser chamado de seu filho!”"
        },
        {
          "num": 22,
          "text": "— Mas o pai ordenou aos empregados: “Depressa! Tragam a melhor roupa e vistam nele. Ponham um anel no dedo dele e sandálias nos seus pés."
        },
        {
          "num": 23,
          "text": "Também tragam e matem o bezerro gordo. Vamos começar a festejar"
        },
        {
          "num": 24,
          "text": "porque este meu filho estava morto e viveu de novo; estava perdido e foi achado.” — E começaram a festa."
        },
        {
          "num": 25,
          "text": "— Enquanto isso, o filho mais velho estava no campo. Quando ele voltou e chegou perto da casa, ouviu a música e o barulho da dança."
        },
        {
          "num": 26,
          "text": "Então chamou um empregado e perguntou: “O que é que está acontecendo?”"
        },
        {
          "num": 27,
          "text": "— O empregado respondeu: “O seu irmão voltou para casa vivo e com saúde. Por isso o seu pai mandou matar o bezerro gordo.”"
        },
        {
          "num": 28,
          "text": "— O filho mais velho ficou zangado e não quis entrar. Então o pai veio para fora e insistiu com ele para que entrasse."
        },
        {
          "num": 29,
          "text": "Mas ele respondeu: “Faz tantos anos que trabalho como um escravo para o senhor e nunca desobedeci a uma ordem sua. Mesmo assim o senhor nunca me deu nem ao menos um cabrito para eu fazer uma festa com os meus amigos."
        },
        {
          "num": 30,
          "text": "Porém esse seu filho desperdiçou tudo o que era do senhor, gastando dinheiro com prostitutas. E agora ele volta, e o senhor manda matar o bezerro gordo!”"
        },
        {
          "num": 31,
          "text": "— Então o pai respondeu: “Meu filho, você está sempre comigo, e tudo o que é meu é seu."
        },
        {
          "num": 32,
          "text": "Mas era preciso fazer esta festa para mostrar a nossa alegria. Pois este seu irmão estava morto e viveu de novo; estava perdido e foi achado.”"
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Aproximavam-se de Jesus todos os publicanos e pecadores para o ouvir."
        },
        {
          "num": 2,
          "text": "E murmuravam os fariseus e os escribas, dizendo: Este recebe pecadores e come com eles."
        },
        {
          "num": 3,
          "text": "Então, lhes propôs Jesus esta parábola:"
        },
        {
          "num": 4,
          "text": "Qual, dentre vós, é o homem que, possuindo cem ovelhas e perdendo uma delas, não deixa no deserto as noventa e nove e vai em busca da que se perdeu, até encontrá-la?"
        },
        {
          "num": 5,
          "text": "Achando-a, põe-na sobre os ombros, cheio de júbilo."
        },
        {
          "num": 6,
          "text": "E, indo para casa, reúne os amigos e vizinhos, dizendo-lhes: Alegrai-vos comigo, porque já achei a minha ovelha perdida."
        },
        {
          "num": 7,
          "text": "Digo-vos que, assim, haverá maior júbilo no céu por um pecador que se arrepende do que por noventa e nove justos que não necessitam de arrependimento."
        },
        {
          "num": 8,
          "text": "Ou qual é a mulher que, tendo dez dracmas, se perder uma, não acende a candeia, varre a casa e a procura diligentemente até encontrá-la?"
        },
        {
          "num": 9,
          "text": "E, tendo-a achado, reúne as amigas e vizinhas, dizendo: Alegrai-vos comigo, porque achei a dracma que eu tinha perdido."
        },
        {
          "num": 10,
          "text": "Eu vos afirmo que, de igual modo, há júbilo diante dos anjos de Deus por um pecador que se arrepende."
        },
        {
          "num": 11,
          "text": "Continuou: Certo homem tinha dois filhos;"
        },
        {
          "num": 12,
          "text": "o mais moço deles disse ao pai: Pai, dá-me a parte dos bens que me cabe. E ele lhes repartiu os haveres."
        },
        {
          "num": 13,
          "text": "Passados não muitos dias, o filho mais moço, ajuntando tudo o que era seu, partiu para uma terra distante e lá dissipou todos os seus bens, vivendo dissolutamente."
        },
        {
          "num": 14,
          "text": "Depois de ter consumido tudo, sobreveio àquele país uma grande fome, e ele começou a passar necessidade."
        },
        {
          "num": 15,
          "text": "Então, ele foi e se agregou a um dos cidadãos daquela terra, e este o mandou para os seus campos a guardar porcos."
        },
        {
          "num": 16,
          "text": "Ali, desejava ele fartar-se das alfarrobas que os porcos comiam; mas ninguém lhe dava nada."
        },
        {
          "num": 17,
          "text": "Então, caindo em si, disse: Quantos trabalhadores de meu pai têm pão com fartura, e eu aqui morro de fome!"
        },
        {
          "num": 18,
          "text": "Levantar-me-ei, e irei ter com o meu pai, e lhe direi: Pai, pequei contra o céu e diante de ti;"
        },
        {
          "num": 19,
          "text": "já não sou digno de ser chamado teu filho; trata-me como um dos teus trabalhadores."
        },
        {
          "num": 20,
          "text": "E, levantando-se, foi para seu pai. Vinha ele ainda longe, quando seu pai o avistou, e, compadecido dele, correndo, o abraçou, e beijou."
        },
        {
          "num": 21,
          "text": "E o filho lhe disse: Pai, pequei contra o céu e diante de ti; já não sou digno de ser chamado teu filho."
        },
        {
          "num": 22,
          "text": "O pai, porém, disse aos seus servos: Trazei depressa a melhor roupa, vesti-o, ponde-lhe um anel no dedo e sandálias nos pés;"
        },
        {
          "num": 23,
          "text": "trazei também e matai o novilho cevado. Comamos e regozijemo-nos,"
        },
        {
          "num": 24,
          "text": "porque este meu filho estava morto e reviveu, estava perdido e foi achado. E começaram a regozijar-se."
        },
        {
          "num": 25,
          "text": "Ora, o filho mais velho estivera no campo; e, quando voltava, ao aproximar-se da casa, ouviu a música e as danças."
        },
        {
          "num": 26,
          "text": "Chamou um dos criados e perguntou-lhe que era aquilo."
        },
        {
          "num": 27,
          "text": "E ele informou: Veio teu irmão, e teu pai mandou matar o novilho cevado, porque o recuperou com saúde."
        },
        {
          "num": 28,
          "text": "Ele se indignou e não queria entrar; saindo, porém, o pai, procurava conciliá-lo."
        },
        {
          "num": 29,
          "text": "Mas ele respondeu a seu pai: Há tantos anos que te sirvo sem jamais transgredir uma ordem tua, e nunca me deste um cabrito sequer para alegrar-me com os meus amigos;"
        },
        {
          "num": 30,
          "text": "vindo, porém, esse teu filho, que desperdiçou os teus bens com meretrizes, tu mandaste matar para ele o novilho cevado."
        },
        {
          "num": 31,
          "text": "Então, lhe respondeu o pai: Meu filho, tu sempre estás comigo; tudo o que é meu é teu."
        },
        {
          "num": 32,
          "text": "Entretanto, era preciso que nos regozijássemos e nos alegrássemos, porque esse teu irmão estava morto e reviveu, estava perdido e foi achado."
        }
      ]
    }
  },
  "jo-1": {
    "book": "João",
    "chapter": 1,
    "title": "O Verbo se Fez Carne",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "No princípio era a Palavra . A Palavra estava com Deus , e a Palavra era Deus."
        },
        {
          "num": 2,
          "text": "Aquele que é a Palavra estava no princípio com Deus."
        },
        {
          "num": 3,
          "text": "Todas as coisas foram feitas por meio dele, e sem ele nada foi criado ."
        },
        {
          "num": 4,
          "text": "Nele estava a vida, vida que era a luz dos homens ."
        },
        {
          "num": 5,
          "text": "A luz brilha nas trevas, trevas que a não venceram."
        },
        {
          "num": 6,
          "text": "Houve um homem enviado por Deus que se chamava João ."
        },
        {
          "num": 7,
          "text": "Ele veio para dar testemunho, para dar testemunho da luz, para que todos cressem por meio dele."
        },
        {
          "num": 8,
          "text": "João não era a luz, mas foi enviado para dar testemunho da luz."
        },
        {
          "num": 9,
          "text": "Aquele que é a Palavra era a luz verdadeira; Ele ilumina toda a gente ao vir a este mundo."
        },
        {
          "num": 10,
          "text": "Ele estava no mundo, mundo que foi feito por ele. O mundo não o conheceu ."
        },
        {
          "num": 11,
          "text": "Ele veio para o seu próprio povo e o seu povo não o recebeu ."
        },
        {
          "num": 12,
          "text": "Mas a todos quantos o receberam, aos que creem nele, deu-lhes o poder de se tornarem filhos de Deus ."
        },
        {
          "num": 13,
          "text": "Estes não nasceram de laços de sangue, nem da vontade da carne, nem da vontade do homem, mas nasceram de Deus."
        },
        {
          "num": 14,
          "text": "A Palavra fez-se homem e veio habitar no meio de nós, e nós contemplámos a sua glória , como glória do Filho único do Pai , cheio de graça e de verdade."
        },
        {
          "num": 15,
          "text": "João deu testemunho dele ao proclamar: «Era deste que eu dizia: Aquele que vem depois de mim é mais importante do que eu, porque já existia antes de mim .»"
        },
        {
          "num": 16,
          "text": "Todos nós participámos da abundância dos seus bens divinos e recebemos continuamente as suas bênçãos."
        },
        {
          "num": 17,
          "text": "É que a lei foi-nos dada por intermédio de Moisés , mas a graça e a verdade vieram por Jesus Cristo ."
        },
        {
          "num": 18,
          "text": "Nunca ninguém viu Deus . Só o Deus único , que está no seio do Pai, o deu a conhecer. Testemunho de João Batista (Mateus 3,1–12; Marcos 1,1–8; Lucas 3,1–18)"
        },
        {
          "num": 19,
          "text": "Foi este o testemunho de João quando as autoridades judaicas de Jerusalém enviaram sacerdotes e levitas para lhe perguntarem: «Quem és tu?»"
        },
        {
          "num": 20,
          "text": "E ele confessou-lhes abertamente: «Eu não sou o Messias .» Mas eles insistiram:"
        },
        {
          "num": 21,
          "text": "«Quem és então? És o profeta Elias?» Ele disse-lhes que não e eles perguntaram: «És o profeta que há de vir ?» Ele tornou a responder-lhes que não."
        },
        {
          "num": 22,
          "text": "Mas eles insistiram novamente: «Diz-nos então quem és, para podermos dar uma resposta aos que nos mandaram ter contigo. Que dizes de ti mesmo?»"
        },
        {
          "num": 23,
          "text": "João respondeu-lhes: «Eu sou a voz do que clama no deserto: preparem o caminho do Senhor , como disse o profeta Isaías .»"
        },
        {
          "num": 24,
          "text": "Alguns dos enviados que estavam a falar com João eram fariseus"
        },
        {
          "num": 25,
          "text": "e perguntaram-lhe: «Se não és o Messias, nem Elias, nem o profeta, por que é que batizas?»"
        },
        {
          "num": 26,
          "text": "«Eu batizo em água, mas no vosso meio encontra-se alguém que ainda não conhecem;"
        },
        {
          "num": 27,
          "text": "é aquele que vem depois de mim», respondeu João. «Mas eu nem sequer sou digno de lhe desatar as correias das sandálias.»"
        },
        {
          "num": 28,
          "text": "Isto passou-se em Betânia , do outro lado do rio Jordão, onde João estava a batizar. João apresenta Jesus ao povo"
        },
        {
          "num": 29,
          "text": "No dia seguinte, João viu Jesus encaminhar-se para ele e disse: «Este é o Cordeiro de Deus que tira o pecado do mundo."
        },
        {
          "num": 30,
          "text": "Era deste que eu dizia: aquele que vem depois de mim é mais importante do que eu, porque já existia antes de mim."
        },
        {
          "num": 31,
          "text": "Nem eu próprio sabia quem ele era, mas eu vim para batizar em água para que ele fosse manifestado ao povo de Israel.»"
        },
        {
          "num": 32,
          "text": "João declarou ainda: «Eu vi o Espírito descer do céu como uma pomba e ficar sobre ele ."
        },
        {
          "num": 33,
          "text": "Eu não sabia que era ele, mas aquele que me enviou a batizar em água, tinha-me anunciado: “Tu hás de ver o Espírito descer e ficar sobre um homem. Esse é o que batiza no Espírito Santo.”"
        },
        {
          "num": 34,
          "text": "Eu vi e dou testemunho de que este é o Filho de Deus.» Primeiros companheiros"
        },
        {
          "num": 35,
          "text": "No dia seguinte, estava João no mesmo lugar com dois dos seus discípulos ,"
        },
        {
          "num": 36,
          "text": "quando viu Jesus passar por ali, e disse: «É este o Cordeiro de Deus!»"
        },
        {
          "num": 37,
          "text": "Os dois discípulos, ouvindo isto, seguiram Jesus."
        },
        {
          "num": 38,
          "text": "Jesus voltou-se, reparou que eles o seguiam e perguntou-lhes: «Que é que procuram?» Eles responderam: «Onde é que moras, Rabi?» Rabi significa Mestre."
        },
        {
          "num": 39,
          "text": "«Venham ver», respondeu-lhes Jesus. Eles foram. Viram onde morava e passaram o resto daquele dia com ele. Eram mais ou menos quatro horas da tarde."
        },
        {
          "num": 40,
          "text": "André, irmão de Simão Pedro, era um dos dois que ouviram João e seguiram Jesus."
        },
        {
          "num": 41,
          "text": "A primeira pessoa que André encontrou foi o seu irmão Simão e disse-lhe: «Encontrámos o Messias !» Messias significa Cristo ."
        },
        {
          "num": 42,
          "text": "André levou o irmão a Jesus, que olhou bem para ele e disse: «Tu, Simão, filho de João, serás chamado Cefas.» Cefas quer dizer Pedro. Filipe leva Natanael a Jesus"
        },
        {
          "num": 43,
          "text": "No dia seguinte, Jesus quis ir para a Galileia. Encontrou Filipe e disse-lhe: «Segue-me!»"
        },
        {
          "num": 44,
          "text": "Filipe era de Betsaida , a cidade donde eram também André e Pedro."
        },
        {
          "num": 45,
          "text": "Filipe encontrou Natanael e disse: «Encontrámos aquele de quem Moisés escreveu nos livros da lei e de quem os profetas também falaram . É Jesus de Nazaré, filho de José.»"
        },
        {
          "num": 46,
          "text": "Disse-lhe Natanael: «Pode vir alguma coisa boa de Nazaré?» Filipe respondeu-lhe: «Vem e vê!»"
        },
        {
          "num": 47,
          "text": "Jesus viu Natanael aproximar-se e disse: «Aí vem um autêntico israelita, em quem não há fingimento!»"
        },
        {
          "num": 48,
          "text": "Natanael perguntou-lhe: «Donde é que me conheces?» «Antes de Filipe te chamar, quando estavas debaixo da figueira , já eu te tinha visto», respondeu-lhe Jesus."
        },
        {
          "num": 49,
          "text": "Então Natanael disse-lhe: «Mestre, tu és o Filho de Deus! És o rei de Israel !»"
        },
        {
          "num": 50,
          "text": "Jesus respondeu-lhe: «Acreditas em mim apenas por eu dizer que te vi debaixo da figueira? Pois hás de ver coisas maiores!»"
        },
        {
          "num": 51,
          "text": "E acrescentou: «Fiquem sabendo que ainda hão de ver o céu aberto e os anjos de Deus subirem e descerem ao encontro do Filho do Homem .»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "No começo aquele que é a Palavra já existia. Ele estava com Deus e era Deus."
        },
        {
          "num": 2,
          "text": "Desde o princípio, a Palavra estava com Deus."
        },
        {
          "num": 3,
          "text": "Por meio da Palavra, Deus fez todas as coisas, e nada do que existe foi feito sem ela."
        },
        {
          "num": 4,
          "text": "A Palavra era a fonte da vida, e essa vida trouxe a luz para todas as pessoas."
        },
        {
          "num": 5,
          "text": "A luz brilha na escuridão, e a escuridão não conseguiu apagá-la."
        },
        {
          "num": 6,
          "text": "Houve um homem chamado João, que foi enviado por Deus"
        },
        {
          "num": 7,
          "text": "para falar a respeito da luz. Ele veio para que por meio dele todos pudessem ouvir a mensagem e crer nela."
        },
        {
          "num": 8,
          "text": "João não era a luz, mas veio para falar a respeito da luz,"
        },
        {
          "num": 9,
          "text": "a luz verdadeira que veio ao mundo e ilumina todas as pessoas."
        },
        {
          "num": 10,
          "text": "A Palavra estava no mundo, e por meio dela Deus fez o mundo, mas o mundo não a conheceu."
        },
        {
          "num": 11,
          "text": "Aquele que é a Palavra veio para o seu próprio país, mas o seu povo não o recebeu."
        },
        {
          "num": 12,
          "text": "Porém alguns creram nele e o receberam, e a estes ele deu o direito de se tornarem filhos de Deus."
        },
        {
          "num": 13,
          "text": "Eles não se tornaram filhos de Deus pelos meios naturais, isto é, não nasceram como nascem os filhos de um pai humano; o próprio Deus é quem foi o Pai deles."
        },
        {
          "num": 14,
          "text": "A Palavra se tornou um ser humano e morou entre nós, cheia de amor e de verdade. E nós vimos a revelação da sua natureza divina, natureza que ele recebeu como Filho único do Pai."
        },
        {
          "num": 15,
          "text": "João disse o seguinte a respeito de Jesus: — Este é aquele de quem eu disse: “Ele vem depois de mim, mas é mais importante do que eu, pois antes de eu nascer ele já existia.”"
        },
        {
          "num": 16,
          "text": "Porque todos nós temos sido abençoados com as riquezas do seu amor, com bênçãos e mais bênçãos."
        },
        {
          "num": 17,
          "text": "A lei foi dada por meio de Moisés, mas o amor e a verdade vieram por meio de Jesus Cristo."
        },
        {
          "num": 18,
          "text": "Ninguém nunca viu Deus. Somente o Filho único, que é Deus e está ao lado do Pai, foi quem nos mostrou quem é Deus."
        },
        {
          "num": 19,
          "text": "Os líderes judeus enviaram de Jerusalém alguns sacerdotes e levitas para perguntarem a João quem ele era."
        },
        {
          "num": 20,
          "text": "João afirmou claramente: — Eu não sou o Messias."
        },
        {
          "num": 21,
          "text": "Eles tornaram a perguntar: — Então, quem é você? Você é Elias? — Não, eu não sou! — respondeu João. — Você é o Profeta que estamos esperando? — Não! — respondeu ele."
        },
        {
          "num": 22,
          "text": "Aí eles disseram a João: — Diga quem é você para podermos levar uma resposta aos que nos enviaram. O que é que você diz a respeito de você mesmo?"
        },
        {
          "num": 23,
          "text": "João respondeu, citando o profeta Isaías: — “Eu sou aquele que grita assim no deserto: preparem o caminho para o Senhor passar.”"
        },
        {
          "num": 24,
          "text": "Os que foram enviados eram do grupo dos fariseus;"
        },
        {
          "num": 25,
          "text": "eles perguntaram a João: — Se você não é o Messias, nem Elias, nem o Profeta que estamos esperando, por que é que você batiza?"
        },
        {
          "num": 26,
          "text": "João respondeu: — Eu batizo com água, mas no meio de vocês está alguém que vocês não conhecem."
        },
        {
          "num": 27,
          "text": "Ele vem depois de mim, mas eu não mereço a honra de desamarrar as correias das sandálias dele."
        },
        {
          "num": 28,
          "text": "Isso aconteceu no povoado de Betânia, no lado leste do rio Jordão, onde João estava batizando."
        },
        {
          "num": 29,
          "text": "No dia seguinte, João viu Jesus vindo na direção dele e disse: — Aí está o Cordeiro de Deus, que tira o pecado do mundo!"
        },
        {
          "num": 30,
          "text": "Eu estava falando a respeito dele quando disse: “Depois de mim vem um homem que é mais importante do que eu, pois antes de eu nascer ele já existia.”"
        },
        {
          "num": 31,
          "text": "Eu mesmo não sabia quem ele era, mas vim, batizando com água para que o povo de Israel saiba quem ele é."
        },
        {
          "num": 32,
          "text": "João continuou: — Eu vi o Espírito descer do céu como uma pomba e parar sobre ele."
        },
        {
          "num": 33,
          "text": "Eu não sabia quem ele era, mas Deus, que me mandou batizar com água, me disse: “Você vai ver o Espírito descer e parar sobre um homem. Esse é quem batiza com o Espírito Santo.”"
        },
        {
          "num": 34,
          "text": "E eu vi isso e por esse motivo tenho declarado que ele é o Filho de Deus."
        },
        {
          "num": 35,
          "text": "No dia seguinte, João estava outra vez ali com dois dos seus discípulos."
        },
        {
          "num": 36,
          "text": "Quando viu Jesus passar, disse: — Aí está o Cordeiro de Deus!"
        },
        {
          "num": 37,
          "text": "Quando os dois discípulos de João ouviram isso, saíram seguindo Jesus."
        },
        {
          "num": 38,
          "text": "Então Jesus olhou para trás, viu que eles o seguiam e perguntou: — O que é que vocês estão procurando? Eles perguntaram: — Rabi, onde é que o senhor mora? (“Rabi” quer dizer “mestre”.)"
        },
        {
          "num": 39,
          "text": "— Venham ver! — disse Jesus. Então eles foram, viram onde Jesus estava morando e ficaram com ele o resto daquele dia. Isso aconteceu mais ou menos às quatro horas da tarde."
        },
        {
          "num": 40,
          "text": "André, irmão de Simão Pedro, era um dos dois homens que tinham ouvido João falar a respeito de Jesus e por isso o haviam seguido."
        },
        {
          "num": 41,
          "text": "A primeira coisa que André fez foi procurar o seu irmão Simão e dizer a ele: — Achamos o Messias. (“Messias” quer dizer “Cristo”.)"
        },
        {
          "num": 42,
          "text": "Então André levou o seu irmão a Jesus. Jesus olhou para Simão e disse: — Você é Simão, filho de João, mas de agora em diante o seu nome será Cefas. (“Cefas” é o mesmo que “Pedro” e quer dizer “pedra”.)"
        },
        {
          "num": 43,
          "text": "No dia seguinte, Jesus resolveu ir para a região da Galileia. Antes de ir, foi procurar Filipe e disse: — Venha comigo!"
        },
        {
          "num": 44,
          "text": "Filipe era de Betsaida, de onde eram também André e Pedro."
        },
        {
          "num": 45,
          "text": "Filipe foi procurar Natanael e disse: — Achamos aquele a respeito de quem Moisés escreveu no Livro da Lei e sobre quem os profetas também escreveram. É Jesus, filho de José, da cidade de Nazaré."
        },
        {
          "num": 46,
          "text": "Natanael perguntou: — E será que pode sair alguma coisa boa de Nazaré? — Venha ver! — respondeu Filipe."
        },
        {
          "num": 47,
          "text": "Quando Jesus viu Natanael chegando, disse a respeito dele: — Aí está um verdadeiro israelita, um homem realmente sincero."
        },
        {
          "num": 48,
          "text": "Então Natanael perguntou a Jesus: — De onde o senhor me conhece? Jesus respondeu: — Antes que Filipe chamasse você, eu já tinha visto você sentado debaixo daquela figueira."
        },
        {
          "num": 49,
          "text": "Então Natanael exclamou: — Mestre, o senhor é o Filho de Deus! O senhor é o Rei de Israel!"
        },
        {
          "num": 50,
          "text": "Jesus respondeu: — Você crê em mim só porque eu disse que tinha visto você debaixo da figueira? Pois você verá coisas maiores do que esta."
        },
        {
          "num": 51,
          "text": "Eu afirmo a vocês que isto é verdade: vocês verão o céu aberto e os anjos de Deus subindo e descendo sobre o Filho do Homem."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus."
        },
        {
          "num": 2,
          "text": "Ele estava no princípio com Deus."
        },
        {
          "num": 3,
          "text": "Todas as coisas foram feitas por intermédio dele, e, sem ele, nada do que foi feito se fez."
        },
        {
          "num": 4,
          "text": "A vida estava nele e a vida era a luz dos homens."
        },
        {
          "num": 5,
          "text": "A luz resplandece nas trevas, e as trevas não prevaleceram contra ela."
        },
        {
          "num": 6,
          "text": "Houve um homem enviado por Deus cujo nome era João."
        },
        {
          "num": 7,
          "text": "Este veio como testemunha para que testificasse a respeito da luz, a fim de todos virem a crer por intermédio dele."
        },
        {
          "num": 8,
          "text": "Ele não era a luz, mas veio para que testificasse da luz,"
        },
        {
          "num": 9,
          "text": "a saber, a verdadeira luz, que, vinda ao mundo, ilumina a todo homem."
        },
        {
          "num": 10,
          "text": "O Verbo estava no mundo, o mundo foi feito por intermédio dele, mas o mundo não o conheceu."
        },
        {
          "num": 11,
          "text": "Veio para o que era seu, e os seus não o receberam."
        },
        {
          "num": 12,
          "text": "Mas, a todos quantos o receberam, deu-lhes o poder de serem feitos filhos de Deus, a saber, aos que creem no seu nome;"
        },
        {
          "num": 13,
          "text": "os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas de Deus."
        },
        {
          "num": 14,
          "text": "E o Verbo se fez carne e habitou entre nós, cheio de graça e de verdade, e vimos a sua glória, glória como do unigênito do Pai."
        },
        {
          "num": 15,
          "text": "João testemunha a respeito dele e exclama: Este é o de quem eu disse: o que vem depois de mim tem, contudo, a primazia, porquanto já existia antes de mim."
        },
        {
          "num": 16,
          "text": "Porque todos nós temos recebido da sua plenitude e graça sobre graça."
        },
        {
          "num": 17,
          "text": "Porque a lei foi dada por intermédio de Moisés; a graça e a verdade vieram por meio de Jesus Cristo."
        },
        {
          "num": 18,
          "text": "Ninguém jamais viu a Deus; o Deus unigênito, que está no seio do Pai, é quem o revelou."
        },
        {
          "num": 19,
          "text": "Este foi o testemunho de João, quando os judeus lhe enviaram de Jerusalém sacerdotes e levitas para lhe perguntarem: Quem és tu?"
        },
        {
          "num": 20,
          "text": "Ele confessou e não negou; confessou: Eu não sou o Cristo."
        },
        {
          "num": 21,
          "text": "Então, lhe perguntaram: Quem és, pois? És tu Elias? Ele disse: Não sou. És tu o profeta? Respondeu: Não."
        },
        {
          "num": 22,
          "text": "Disseram-lhe, pois: Declara-nos quem és, para que demos resposta àqueles que nos enviaram; que dizes a respeito de ti mesmo?"
        },
        {
          "num": 23,
          "text": "Então, ele respondeu: Eu sou a voz do que clama no deserto: Endireitai o caminho do Senhor, como disse o profeta Isaías."
        },
        {
          "num": 24,
          "text": "Ora, os que haviam sido enviados eram de entre os fariseus."
        },
        {
          "num": 25,
          "text": "E perguntaram-lhe: Então, por que batizas, se não és o Cristo, nem Elias, nem o profeta?"
        },
        {
          "num": 26,
          "text": "Respondeu-lhes João: Eu batizo com água; mas, no meio de vós, está quem vós não conheceis,"
        },
        {
          "num": 27,
          "text": "o qual vem após mim, do qual não sou digno de desatar-lhe as correias das sandálias."
        },
        {
          "num": 28,
          "text": "Estas coisas se passaram em Betânia, do outro lado do Jordão, onde João estava batizando."
        },
        {
          "num": 29,
          "text": "No dia seguinte, viu João a Jesus, que vinha para ele, e disse: Eis o Cordeiro de Deus, que tira o pecado do mundo!"
        },
        {
          "num": 30,
          "text": "É este a favor de quem eu disse: após mim vem um varão que tem a primazia, porque já existia antes de mim."
        },
        {
          "num": 31,
          "text": "Eu mesmo não o conhecia, mas, a fim de que ele fosse manifestado a Israel, vim, por isso, batizando com água."
        },
        {
          "num": 32,
          "text": "E João testemunhou, dizendo: Vi o Espírito descer do céu como pomba e pousar sobre ele."
        },
        {
          "num": 33,
          "text": "Eu não o conhecia; aquele, porém, que me enviou a batizar com água me disse: Aquele sobre quem vires descer e pousar o Espírito, esse é o que batiza com o Espírito Santo."
        },
        {
          "num": 34,
          "text": "Pois eu, de fato, vi e tenho testificado que ele é o Filho de Deus."
        },
        {
          "num": 35,
          "text": "No dia seguinte, estava João outra vez na companhia de dois dos seus discípulos"
        },
        {
          "num": 36,
          "text": "e, vendo Jesus passar, disse: Eis o Cordeiro de Deus!"
        },
        {
          "num": 37,
          "text": "Os dois discípulos, ouvindo-o dizer isto, seguiram Jesus."
        },
        {
          "num": 38,
          "text": "E Jesus, voltando-se e vendo que o seguiam, disse-lhes: Que buscais? Disseram-lhe: Rabi (que quer dizer Mestre), onde assistes?"
        },
        {
          "num": 39,
          "text": "Respondeu-lhes: Vinde e vede. Foram, pois, e viram onde Jesus estava morando; e ficaram com ele aquele dia, sendo mais ou menos a hora décima."
        },
        {
          "num": 40,
          "text": "Era André, o irmão de Simão Pedro, um dos dois que tinham ouvido o testemunho de João e seguido Jesus."
        },
        {
          "num": 41,
          "text": "Ele achou primeiro o seu próprio irmão, Simão, a quem disse: Achamos o Messias (que quer dizer Cristo),"
        },
        {
          "num": 42,
          "text": "e o levou a Jesus. Olhando Jesus para ele, disse: Tu és Simão, o filho de João; tu serás chamado Cefas (que quer dizer Pedro)."
        },
        {
          "num": 43,
          "text": "No dia imediato, resolveu Jesus partir para a Galileia e encontrou a Filipe, a quem disse: Segue-me."
        },
        {
          "num": 44,
          "text": "Ora, Filipe era de Betsaida, cidade de André e de Pedro."
        },
        {
          "num": 45,
          "text": "Filipe encontrou a Natanael e disse-lhe: Achamos aquele de quem Moisés escreveu na lei, e a quem se referiram os profetas: Jesus, o Nazareno, filho de José."
        },
        {
          "num": 46,
          "text": "Perguntou-lhe Natanael: De Nazaré pode sair alguma coisa boa? Respondeu-lhe Filipe: Vem e vê."
        },
        {
          "num": 47,
          "text": "Jesus viu Natanael aproximar-se e disse a seu respeito: Eis um verdadeiro israelita, em quem não há dolo!"
        },
        {
          "num": 48,
          "text": "Perguntou-lhe Natanael: Donde me conheces? Respondeu-lhe Jesus: Antes de Filipe te chamar, eu te vi, quando estavas debaixo da figueira."
        },
        {
          "num": 49,
          "text": "Então, exclamou Natanael: Mestre, tu és o Filho de Deus, tu és o Rei de Israel!"
        },
        {
          "num": 50,
          "text": "Ao que Jesus lhe respondeu: Porque te disse que te vi debaixo da figueira, crês? Pois maiores coisas do que estas verás."
        },
        {
          "num": 51,
          "text": "E acrescentou: Em verdade, em verdade vos digo que vereis o céu aberto e os anjos de Deus subindo e descendo sobre o Filho do Homem."
        }
      ]
    }
  },
  "jo-3": {
    "book": "João",
    "chapter": 3,
    "title": "O Novo Nascimento e o Amor de Deus",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Havia entre os fariseus um homem chamado Nicodemos, que era um dos chefes dos judeus."
        },
        {
          "num": 2,
          "text": "Durante a noite foi ter com Jesus e disse-lhe: «Mestre, sabemos que Deus te enviou para nos ensinares. Ninguém pode realizar os sinais que tu fazes, se Deus não estiver com ele.»"
        },
        {
          "num": 3,
          "text": "Jesus respondeu-lhe: «Fica sabendo que ninguém pode ver o reino de Deus se não nascer de novo .»"
        },
        {
          "num": 4,
          "text": "Nicodemos perguntou-lhe então: «Como é que um homem idoso pode voltar a nascer? Pode entrar no ventre de sua mãe e nascer outra vez?»"
        },
        {
          "num": 5,
          "text": "Jesus respondeu: «Fica sabendo que só quem nascer da água e do Espírito é que pode entrar no reino de Deus."
        },
        {
          "num": 6,
          "text": "O que nasce de pais humanos é apenas humano, o que nasce do espírito é espiritual."
        },
        {
          "num": 7,
          "text": "Não te admires por eu te dizer: é preciso nascer de novo."
        },
        {
          "num": 8,
          "text": "O vento sopra onde quer; ouves o seu ruído, mas não sabes donde vem nem para onde vai. Assim acontece também com aquele que nasce do Espírito.»"
        },
        {
          "num": 9,
          "text": "Nicodemos insistiu: «Como é que isso pode ser?»"
        },
        {
          "num": 10,
          "text": "Jesus respondeu: «Tu és um dos mestres do povo de Israel e não sabes estas coisas?"
        },
        {
          "num": 11,
          "text": "Repara bem no que te vou dizer: quando falamos é porque sabemos e quando afirmamos alguma coisa é porque vimos, mas não querem aceitar o que eu vos digo."
        },
        {
          "num": 12,
          "text": "Se não acreditam em mim quando vos falo das coisas deste mundo, como podem crer quando vos falar das do Céu?"
        },
        {
          "num": 13,
          "text": "Ninguém subiu ao céu a não ser o Filho do Homem que veio do Céu ."
        },
        {
          "num": 14,
          "text": "Assim como Moisés levantou a serpente de bronze no deserto , assim também é necessário que o Filho do Homem seja levantado"
        },
        {
          "num": 15,
          "text": "para que todo aquele que nele crer tenha a vida eterna."
        },
        {
          "num": 16,
          "text": "Deus amou de tal modo o mundo que entregou o seu Filho único, para que todo o que nele crer não se perca, mas tenha a vida eterna."
        },
        {
          "num": 17,
          "text": "Não foi para condenar o mundo que Deus lhe enviou o seu Filho, mas sim para que o mundo fosse salvo por ele."
        },
        {
          "num": 18,
          "text": "Quem crê nele não é condenado, mas quem não crê já está condenado, porque não acreditou no nome do Filho único de Deus."
        },
        {
          "num": 19,
          "text": "O motivo da condenação é este: a luz veio ao mundo, mas o mundo preferiu as trevas porque as suas obras eram más."
        },
        {
          "num": 20,
          "text": "De facto, quem faz o mal detesta a luz e foge dela, para que as suas más obras não sejam descobertas;"
        },
        {
          "num": 21,
          "text": "mas o que pratica a verdade, aproxima-se da luz e assim mostra publicamente que as suas obras foram feitas segundo a vontade de Deus.» Jesus e João Batista"
        },
        {
          "num": 22,
          "text": "Jesus foi mais tarde para a região da Judeia, com os discípulos . Passou lá algum tempo com eles e batizava ."
        },
        {
          "num": 23,
          "text": "João estava também a batizar em Enon, perto de Salim , pois havia ali muita água, e o povo ia ter com ele para ser batizado."
        },
        {
          "num": 24,
          "text": "Nessa altura, ainda João não tinha sido preso ."
        },
        {
          "num": 25,
          "text": "Um certo dia, levantou-se uma discussão entre alguns discípulos de João e um judeu a respeito das cerimónias de purificação ."
        },
        {
          "num": 26,
          "text": "Foram por isso ter com João e disseram-lhe: «Mestre, aquele homem que estava contigo na outra margem do Jordão e do qual deste testemunho, anda agora a batizar e toda a gente vai ter com ele.»"
        },
        {
          "num": 27,
          "text": "João respondeu: «O homem não pode conseguir nada se não lhe for dado por Deus."
        },
        {
          "num": 28,
          "text": "Vós mesmos sois testemunhas de que eu disse: Eu não sou o Messias mas apenas o que foi enviado adiante dele ."
        },
        {
          "num": 29,
          "text": "O noivo é aquele a quem pertence a noiva e o amigo do noivo participa na boda e escuta a voz do noivo e regozija-se em ouvi-lo. Assim, também a minha alegria está agora completa."
        },
        {
          "num": 30,
          "text": "Ele é que deve crescer em importância e eu diminuir."
        },
        {
          "num": 31,
          "text": "Aquele que vem lá do alto está acima de todos os outros. Quem vem da Terra pertence à Terra e fala das coisas terrenas. O que vem do céu está acima de todos os outros;"
        },
        {
          "num": 32,
          "text": "fala como testemunha do que lá viu e ouviu, mas ninguém aceita o que ele diz."
        },
        {
          "num": 33,
          "text": "Aceitar o seu testemunho é reconhecer que Deus é verdadeiro,"
        },
        {
          "num": 34,
          "text": "porque aquele que Deus enviou fala as palavras de Deus e não dá o Espírito por medida."
        },
        {
          "num": 35,
          "text": "O Pai ama o Filho e deu-lhe poder sobre todas as coisas."
        },
        {
          "num": 36,
          "text": "Aquele que acredita no Filho tem a vida eterna; quem não se deixa convencer pelo Filho não tem parte nessa vida, mas sobre ele recai o castigo de Deus.»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Havia um fariseu chamado Nicodemos, que era líder dos judeus."
        },
        {
          "num": 2,
          "text": "Uma noite ele foi visitar Jesus e disse: — Rabi, nós sabemos que o senhor é um mestre que Deus enviou, pois ninguém pode fazer esses milagres se Deus não estiver com ele."
        },
        {
          "num": 3,
          "text": "Jesus respondeu: — Eu afirmo ao senhor que isto é verdade: ninguém pode ver o Reino de Deus se não nascer de novo."
        },
        {
          "num": 4,
          "text": "Nicodemos perguntou: — Como é que um homem velho pode nascer de novo? Será que ele pode voltar para a barriga da sua mãe e nascer outra vez?"
        },
        {
          "num": 5,
          "text": "Jesus disse: — Eu afirmo ao senhor que isto é verdade: ninguém pode entrar no Reino de Deus se não nascer da água e do Espírito."
        },
        {
          "num": 6,
          "text": "Quem nasce de pais humanos é um ser de natureza humana; quem nasce do Espírito é um ser de natureza espiritual."
        },
        {
          "num": 7,
          "text": "Por isso não fique admirado porque eu disse que todos vocês precisam nascer de novo."
        },
        {
          "num": 8,
          "text": "O vento sopra onde quer, e ouve-se o barulho que ele faz, mas não se sabe de onde ele vem, nem para onde vai. A mesma coisa acontece com todos os que nascem do Espírito."
        },
        {
          "num": 9,
          "text": "— Como pode ser isso? — perguntou Nicodemos."
        },
        {
          "num": 10,
          "text": "Jesus respondeu: — O senhor é professor do povo de Israel e não entende isso?"
        },
        {
          "num": 11,
          "text": "Pois eu afirmo ao senhor que isto é verdade: nós falamos daquilo que sabemos e contamos o que temos visto, mas vocês não querem aceitar a nossa mensagem."
        },
        {
          "num": 12,
          "text": "Se vocês não creem quando falo das coisas deste mundo, como vão crer se eu falar das coisas do céu?"
        },
        {
          "num": 13,
          "text": "Ninguém subiu ao céu, a não ser o Filho do Homem, que desceu do céu."
        },
        {
          "num": 14,
          "text": "— Assim como Moisés, no deserto, levantou a cobra de bronze numa estaca, assim também o Filho do Homem tem de ser levantado,"
        },
        {
          "num": 15,
          "text": "para que todos os que crerem nele tenham a vida eterna."
        },
        {
          "num": 16,
          "text": "Porque Deus amou o mundo tanto, que deu o seu único Filho, para que todo aquele que nele crer não morra, mas tenha a vida eterna."
        },
        {
          "num": 17,
          "text": "Pois Deus mandou o seu Filho para salvar o mundo e não para julgá-lo."
        },
        {
          "num": 18,
          "text": "— Aquele que crê no Filho não é julgado; mas quem não crê já está julgado porque não crê no Filho único de Deus."
        },
        {
          "num": 19,
          "text": "E é assim que o julgamento é feito: Deus mandou a luz ao mundo, mas as pessoas preferiram a escuridão porque fazem o que é mau."
        },
        {
          "num": 20,
          "text": "Pois todos os que fazem o mal odeiam a luz e fogem dela, para que ninguém veja as coisas más que eles fazem."
        },
        {
          "num": 21,
          "text": "Mas os que vivem de acordo com a verdade procuram a luz, a fim de que possa ser visto claramente que as suas ações são feitas de acordo com a vontade de Deus."
        },
        {
          "num": 22,
          "text": "Depois disso, Jesus e os seus discípulos foram para a região da Judeia. Ele ficou algum tempo com eles ali e batizava as pessoas."
        },
        {
          "num": 23,
          "text": "João também estava batizando em Enom, perto de Salim, porque lá havia muita água."
        },
        {
          "num": 24,
          "text": "(João ainda não tinha sido preso.)"
        },
        {
          "num": 25,
          "text": "Alguns discípulos de João tiveram uma discussão com um judeu sobre a cerimônia de purificação."
        },
        {
          "num": 26,
          "text": "Eles foram dizer a João: — Mestre, aquele homem que estava com o senhor no outro lado do rio Jordão está batizando as pessoas. O senhor falou sobre ele, lembra? E todos estão indo atrás dele."
        },
        {
          "num": 27,
          "text": "João respondeu: — Ninguém pode ter alguma coisa se ela não for dada por Deus."
        },
        {
          "num": 28,
          "text": "Vocês são testemunhas de que eu disse: “Eu não sou o Messias, mas fui enviado adiante dele.”"
        },
        {
          "num": 29,
          "text": "Num casamento, o noivo é aquele a quem a noiva pertence. O amigo do noivo está ali, e o escuta, e se alegra quando ouve a voz dele. Assim também o que está acontecendo com Jesus me faz ficar completamente alegre."
        },
        {
          "num": 30,
          "text": "Ele tem de ficar cada vez mais importante, e eu, menos importante."
        },
        {
          "num": 31,
          "text": "Aquele que vem de cima é o mais importante de todos, e quem vem da terra é da terra e fala das coisas terrenas. Quem vem do céu é o mais importante de todos."
        },
        {
          "num": 32,
          "text": "Ele fala daquilo que viu e ouviu, mas ninguém aceita a sua mensagem."
        },
        {
          "num": 33,
          "text": "Quem aceita a sua mensagem dá prova de que o que Deus diz é verdade."
        },
        {
          "num": 34,
          "text": "Aquele que Deus enviou diz as palavras de Deus porque Deus dá do seu Espírito sem medida."
        },
        {
          "num": 35,
          "text": "O Pai ama o Filho e pôs tudo nas mãos dele."
        },
        {
          "num": 36,
          "text": "Por isso quem crê no Filho tem a vida eterna; porém quem desobedece ao Filho nunca terá a vida eterna, mas sofrerá para sempre o castigo de Deus."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Havia, entre os fariseus, um homem chamado Nicodemos, um dos principais dos judeus."
        },
        {
          "num": 2,
          "text": "Este, de noite, foi ter com Jesus e lhe disse: Rabi, sabemos que és Mestre vindo da parte de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não estiver com ele."
        },
        {
          "num": 3,
          "text": "A isto, respondeu Jesus: Em verdade, em verdade te digo que, se alguém não nascer de novo, não pode ver o reino de Deus."
        },
        {
          "num": 4,
          "text": "Perguntou-lhe Nicodemos: Como pode um homem nascer, sendo velho? Pode, porventura, voltar ao ventre materno e nascer segunda vez?"
        },
        {
          "num": 5,
          "text": "Respondeu Jesus: Em verdade, em verdade te digo: quem não nascer da água e do Espírito não pode entrar no reino de Deus."
        },
        {
          "num": 6,
          "text": "O que é nascido da carne é carne; e o que é nascido do Espírito é espírito."
        },
        {
          "num": 7,
          "text": "Não te admires de eu te dizer: importa-vos nascer de novo."
        },
        {
          "num": 8,
          "text": "O vento sopra onde quer, ouves a sua voz, mas não sabes donde vem, nem para onde vai; assim é todo o que é nascido do Espírito."
        },
        {
          "num": 9,
          "text": "Então, lhe perguntou Nicodemos: Como pode suceder isto? Acudiu Jesus:"
        },
        {
          "num": 10,
          "text": "Tu és mestre em Israel e não compreendes estas coisas?"
        },
        {
          "num": 11,
          "text": "Em verdade, em verdade te digo que nós dizemos o que sabemos e testificamos o que temos visto; contudo, não aceitais o nosso testemunho."
        },
        {
          "num": 12,
          "text": "Se, tratando de coisas terrenas, não me credes, como crereis, se vos falar das celestiais?"
        },
        {
          "num": 13,
          "text": "Ora, ninguém subiu ao céu, senão aquele que de lá desceu, a saber, o Filho do Homem [que está no céu]."
        },
        {
          "num": 14,
          "text": "E do modo por que Moisés levantou a serpente no deserto, assim importa que o Filho do Homem seja levantado,"
        },
        {
          "num": 15,
          "text": "para que todo o que nele crê tenha a vida eterna."
        },
        {
          "num": 16,
          "text": "Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna."
        },
        {
          "num": 17,
          "text": "Porquanto Deus enviou o seu Filho ao mundo, não para que julgasse o mundo, mas para que o mundo fosse salvo por ele."
        },
        {
          "num": 18,
          "text": "Quem nele crê não é julgado; o que não crê já está julgado, porquanto não crê no nome do unigênito Filho de Deus."
        },
        {
          "num": 19,
          "text": "O julgamento é este: que a luz veio ao mundo, e os homens amaram mais as trevas do que a luz; porque as suas obras eram más."
        },
        {
          "num": 20,
          "text": "Pois todo aquele que pratica o mal aborrece a luz e não se chega para a luz, a fim de não serem arguidas as suas obras."
        },
        {
          "num": 21,
          "text": "Quem pratica a verdade aproxima-se da luz, a fim de que as suas obras sejam manifestas, porque feitas em Deus."
        },
        {
          "num": 22,
          "text": "Depois disto, foi Jesus com seus discípulos para a terra da Judeia; ali permaneceu com eles e batizava."
        },
        {
          "num": 23,
          "text": "Ora, João estava também batizando em Enom, perto de Salim, porque havia ali muitas águas, e para lá concorria o povo e era batizado."
        },
        {
          "num": 24,
          "text": "Pois João ainda não tinha sido encarcerado."
        },
        {
          "num": 25,
          "text": "Ora, entre os discípulos de João e um judeu suscitou-se uma contenda com respeito à purificação."
        },
        {
          "num": 26,
          "text": "E foram ter com João e lhe disseram: Mestre, aquele que estava contigo além do Jordão, do qual tens dado testemunho, está batizando, e todos lhe saem ao encontro."
        },
        {
          "num": 27,
          "text": "Respondeu João: O homem não pode receber coisa alguma se do céu não lhe for dada."
        },
        {
          "num": 28,
          "text": "Vós mesmos sois testemunhas de que vos disse: eu não sou o Cristo, mas fui enviado como seu precursor."
        },
        {
          "num": 29,
          "text": "O que tem a noiva é o noivo; o amigo do noivo que está presente e o ouve muito se regozija por causa da voz do noivo. Pois esta alegria já se cumpriu em mim."
        },
        {
          "num": 30,
          "text": "Convém que ele cresça e que eu diminua."
        },
        {
          "num": 31,
          "text": "Quem vem das alturas certamente está acima de todos; quem vem da terra é terreno e fala da terra; quem veio do céu está acima de todos"
        },
        {
          "num": 32,
          "text": "e testifica o que tem visto e ouvido; contudo, ninguém aceita o seu testemunho."
        },
        {
          "num": 33,
          "text": "Quem, todavia, lhe aceita o testemunho, por sua vez, certifica que Deus é verdadeiro."
        },
        {
          "num": 34,
          "text": "Pois o enviado de Deus fala as palavras dele, porque Deus não dá o Espírito por medida."
        },
        {
          "num": 35,
          "text": "O Pai ama ao Filho, e todas as coisas tem confiado às suas mãos."
        },
        {
          "num": 36,
          "text": "Por isso, quem crê no Filho tem a vida eterna; o que, todavia, se mantém rebelde contra o Filho não verá a vida, mas sobre ele permanece a ira de Deus."
        }
      ]
    }
  },
  "jo-14": {
    "book": "João",
    "chapter": 14,
    "title": "Jesus, o Caminho, a Verdade e a Vida",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Jesus disse depois aos seus discípulos : «Não estejam preocupados. Uma vez que têm fé em Deus, tenham também fé em mim!"
        },
        {
          "num": 2,
          "text": "Na casa de meu Pai há muitos lugares; se assim não fosse, ter-vos-ia dito que vou preparar-vos um lugar?"
        },
        {
          "num": 3,
          "text": "Eu vou à vossa frente para vos preparar lugar. E depois de vos ir preparar um lugar, hei de voltar para vos levar para junto de mim, de modo que estejam onde eu estiver."
        },
        {
          "num": 4,
          "text": "E o caminho para o lugar onde eu estiver, já o conhecem.»"
        },
        {
          "num": 5,
          "text": "Tomé disse a Jesus: «Senhor, nós nem sequer sabemos para onde é que tu vais! Como é que podemos saber qual é o caminho?»"
        },
        {
          "num": 6,
          "text": "«Eu sou o caminho, a verdade e a vida», respondeu Jesus. «Ninguém pode chegar ao Pai sem ser por mim."
        },
        {
          "num": 7,
          "text": "E já que me conhecem ficam a conhecer também o Pai. E desde agora ficam a conhecê-lo porque o viram.»"
        },
        {
          "num": 8,
          "text": "Filipe pediu-lhe: «Senhor, mostra-nos o Pai e isso nos basta.»"
        },
        {
          "num": 9,
          "text": "Jesus respondeu-lhe: «Filipe, há tanto tempo que vivo convosco e ainda não me conheces? Aquele que me viu, viu também o Pai. Como é que tu me pedes: Mostra-nos o Pai?"
        },
        {
          "num": 10,
          "text": "Não acreditas que eu estou no Pai e que o Pai está em mim? As palavras que vos digo não as digo por mim. O Pai que está em mim é quem realiza as suas obras."
        },
        {
          "num": 11,
          "text": "Acreditem que eu estou no Pai e o Pai está comigo. Mas se não querem crer em mim pelas minhas palavras, creiam em mim ao menos pelas minhas ações."
        },
        {
          "num": 12,
          "text": "Digo-vos com toda a verdade que aquele que crê em mim faz tudo aquilo que eu faço e há de fazer coisas maiores ainda, porque eu vou para o Pai."
        },
        {
          "num": 13,
          "text": "E hei de conceder tudo o que pedirem em meu nome para que o Pai seja glorificado no Filho."
        },
        {
          "num": 14,
          "text": "Por isso, hei de fazer tudo o que me pedirem.» Jesus promete o Espírito Santo"
        },
        {
          "num": 15,
          "text": "«Se me amarem hão de cumprir os meus mandamentos,"
        },
        {
          "num": 16,
          "text": "e eu pedirei ao Pai para vos enviar um outro Defensor que esteja sempre convosco."
        },
        {
          "num": 17,
          "text": "O Espírito de verdade que o mundo não pode receber, porque não o vê nem o conhece. Ele está convosco e habitará em vós, por isso o conhecem."
        },
        {
          "num": 18,
          "text": "Não vos hei de deixar órfãos pois voltarei para junto de vós."
        },
        {
          "num": 19,
          "text": "Dentro em pouco o mundo não me verá mais. Mas vocês hão de ver-me, porque da vida que eu vivo hão de viver também."
        },
        {
          "num": 20,
          "text": "Naquele dia saberão que eu estou no meu Pai, vós em mim e eu em vós."
        },
        {
          "num": 21,
          "text": "Aquele que conhece os meus mandamentos e os segue, esse é que me tem verdadeiro amor. E aquele que me ama é também amado por meu Pai; eu amá-lo-ei também e dar-me-ei a conhecer a ele inteiramente.»"
        },
        {
          "num": 22,
          "text": "Então Judas (não o Iscariotes) disse a Jesus: «Por que é que tu te queres mostrar apenas a nós e não a toda a gente?»"
        },
        {
          "num": 23,
          "text": "Jesus explicou-lhe: «Quem me tem amor vive segundo aquilo que eu digo e o meu Pai também o há de amar e iremos ambos viver nele."
        },
        {
          "num": 24,
          "text": "Quem não me tem amor não guarda as minhas palavras. E a palavra que eu vos digo não é doutrina minha, mas do Pai, que me enviou."
        },
        {
          "num": 25,
          "text": "Digo estas coisas enquanto estou ainda no meio de vós."
        },
        {
          "num": 26,
          "text": "Mas o Defensor, o Espírito Santo que o Pai vos irá enviar em meu nome, há de ensinar-vos tudo e fará com que recordem tudo o que eu vos ensinei."
        },
        {
          "num": 27,
          "text": "A paz vos deixo, a minha paz vos dou. Mas não a dou como a dá o mundo. Não se preocupem nem tenham medo."
        },
        {
          "num": 28,
          "text": "Ouviram aquilo que eu disse: Deixo-vos, mas volto outra vez para junto de vós. Se me amassem alegrar-se-iam com a minha ida para o Pai, porque o Pai é mais do que eu."
        },
        {
          "num": 29,
          "text": "Disse-vos tudo isto agora, antes que as coisas aconteçam, para que quando acontecerem acreditem em mim."
        },
        {
          "num": 30,
          "text": "Já não tenho tempo para falar muito mais convosco. Aquele que domina este mundo está quase a chegar. Ele não tem nenhum poder sobre mim,"
        },
        {
          "num": 31,
          "text": "mas desta maneira dou a conhecer ao mundo que amo o Pai e que tenho feito aquilo que o Pai me mandou. Levantem-se! Vamos embora.»"
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Jesus disse: — Não fiquem aflitos. Creiam em Deus e creiam também em mim."
        },
        {
          "num": 2,
          "text": "Na casa do meu Pai há muitos quartos, e eu vou preparar um lugar para vocês. Se não fosse assim, eu já lhes teria dito."
        },
        {
          "num": 3,
          "text": "E, depois que eu for e preparar um lugar para vocês, voltarei e os levarei comigo para que onde eu estiver vocês estejam também."
        },
        {
          "num": 4,
          "text": "E vocês conhecem o caminho para o lugar aonde eu vou."
        },
        {
          "num": 5,
          "text": "Então Tomé perguntou: — Senhor, nós não sabemos aonde é que o senhor vai. Como podemos saber o caminho?"
        },
        {
          "num": 6,
          "text": "Jesus respondeu: — Eu sou o caminho, a verdade e a vida; ninguém pode chegar até o Pai a não ser por mim."
        },
        {
          "num": 7,
          "text": "Agora que vocês me conhecem, conhecerão também o meu Pai. E desde agora vocês o conhecem e o têm visto."
        },
        {
          "num": 8,
          "text": "Filipe disse a Jesus: — Senhor, mostre-nos o Pai, e assim não precisaremos de mais nada."
        },
        {
          "num": 9,
          "text": "Jesus respondeu: — Faz tanto tempo que estou com vocês, Filipe, e você ainda não me conhece? Quem me vê vê também o Pai. Por que é que você diz: “Mostre-nos o Pai”?"
        },
        {
          "num": 10,
          "text": "Será que você não crê que eu estou no Pai e que o Pai está em mim? Então Jesus disse aos discípulos: — O que eu digo a vocês não digo em meu próprio nome; o Pai, que está em mim, é quem faz o seu trabalho."
        },
        {
          "num": 11,
          "text": "Creiam no que lhes digo: eu estou no Pai e o Pai está em mim. Se vocês não creem por causa das minhas palavras, creiam pelo menos por causa das coisas que eu faço."
        },
        {
          "num": 12,
          "text": "Eu afirmo a vocês que isto é verdade: quem crê em mim fará as coisas que eu faço e até maiores do que estas, pois eu vou para o meu Pai."
        },
        {
          "num": 13,
          "text": "E tudo o que vocês pedirem em meu nome eu farei, a fim de que o Filho revele a natureza gloriosa do Pai."
        },
        {
          "num": 14,
          "text": "Eu farei qualquer coisa que vocês me pedirem em meu nome."
        },
        {
          "num": 15,
          "text": "Jesus continuou: — Se vocês me amam, obedeçam aos meus mandamentos."
        },
        {
          "num": 16,
          "text": "Eu pedirei ao Pai, e ele lhes dará outro Auxiliador, o Espírito da verdade, para ficar com vocês para sempre."
        },
        {
          "num": 17,
          "text": "O mundo não pode receber esse Espírito porque não o pode ver, nem conhecer. Mas vocês o conhecem porque ele está com vocês e viverá em vocês."
        },
        {
          "num": 18,
          "text": "— Não vou deixá-los abandonados, mas voltarei para ficar com vocês."
        },
        {
          "num": 19,
          "text": "Daqui a pouco o mundo não me verá mais, mas vocês me verão. E, porque eu vivo, vocês também viverão."
        },
        {
          "num": 20,
          "text": "Quando chegar aquele dia, vocês ficarão sabendo que eu estou no meu Pai e que vocês estão em mim, assim como eu estou em vocês."
        },
        {
          "num": 21,
          "text": "— A pessoa que aceita e obedece aos meus mandamentos prova que me ama. E a pessoa que me ama será amada pelo meu Pai, e eu também a amarei e lhe mostrarei quem sou."
        },
        {
          "num": 22,
          "text": "Então Judas, não o Judas Iscariotes, perguntou: — Senhor, como será possível que o senhor mostre somente a nós e não ao mundo quem o senhor é?"
        },
        {
          "num": 23,
          "text": "Jesus respondeu: — A pessoa que me ama obedecerá à minha mensagem, e o meu Pai a amará. E o meu Pai e eu viremos viver com ela."
        },
        {
          "num": 24,
          "text": "A pessoa que não me ama não obedece à minha mensagem. E a mensagem que vocês estão escutando não é minha, mas do Pai, que me enviou."
        },
        {
          "num": 25,
          "text": "— Tenho dito isso enquanto estou com vocês."
        },
        {
          "num": 26,
          "text": "Mas o Auxiliador, o Espírito Santo, que o Pai vai enviar em meu nome, ensinará a vocês todas as coisas e fará com que lembrem de tudo o que eu disse a vocês."
        },
        {
          "num": 27,
          "text": "— Deixo com vocês a paz. É a minha paz que eu lhes dou; não lhes dou a paz como o mundo a dá. Não fiquem aflitos, nem tenham medo."
        },
        {
          "num": 28,
          "text": "Vocês ouviram o que eu disse: “Eu vou, mas voltarei para ficar com vocês.” Se vocês me amassem, ficariam alegres, sabendo que vou para o Pai, pois o Pai é mais poderoso do que eu."
        },
        {
          "num": 29,
          "text": "Digo isso agora, antes que essas coisas aconteçam, para que, quando acontecerem, vocês creiam."
        },
        {
          "num": 30,
          "text": "Não posso continuar a falar com vocês por muito tempo, pois está chegando aquele que manda neste mundo. Ele não tem poder sobre mim;"
        },
        {
          "num": 31,
          "text": "mas o mundo precisa saber que eu amo o Pai e que, por isso, faço tudo o que ele manda. — Levantem-se, vamos sair daqui!"
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Não se turbe o vosso coração; credes em Deus, crede também em mim."
        },
        {
          "num": 2,
          "text": "Na casa de meu Pai há muitas moradas. Se assim não fora, eu vo-lo teria dito. Pois vou preparar-vos lugar."
        },
        {
          "num": 3,
          "text": "E, quando eu for e vos preparar lugar, voltarei e vos receberei para mim mesmo, para que, onde eu estou, estejais vós também."
        },
        {
          "num": 4,
          "text": "E vós sabeis o caminho para onde eu vou."
        },
        {
          "num": 5,
          "text": "Disse-lhe Tomé: Senhor, não sabemos para onde vais; como saber o caminho?"
        },
        {
          "num": 6,
          "text": "Respondeu-lhe Jesus: Eu sou o caminho, e a verdade, e a vida; ninguém vem ao Pai senão por mim."
        },
        {
          "num": 7,
          "text": "Se vós me tivésseis conhecido, conheceríeis também a meu Pai. Desde agora o conheceis e o tendes visto."
        },
        {
          "num": 8,
          "text": "Replicou-lhe Filipe: Senhor, mostra-nos o Pai, e isso nos basta."
        },
        {
          "num": 9,
          "text": "Disse-lhe Jesus: Filipe, há tanto tempo estou convosco, e não me tens conhecido? Quem me vê a mim vê o Pai; como dizes tu: Mostra-nos o Pai?"
        },
        {
          "num": 10,
          "text": "Não crês que eu estou no Pai e que o Pai está em mim? As palavras que eu vos digo não as digo por mim mesmo; mas o Pai, que permanece em mim, faz as suas obras."
        },
        {
          "num": 11,
          "text": "Crede-me que estou no Pai, e o Pai, em mim; crede ao menos por causa das mesmas obras."
        },
        {
          "num": 12,
          "text": "Em verdade, em verdade vos digo que aquele que crê em mim fará também as obras que eu faço e outras maiores fará, porque eu vou para junto do Pai."
        },
        {
          "num": 13,
          "text": "E tudo quanto pedirdes em meu nome, isso farei, a fim de que o Pai seja glorificado no Filho."
        },
        {
          "num": 14,
          "text": "Se me pedirdes alguma coisa em meu nome, eu o farei."
        },
        {
          "num": 15,
          "text": "Se me amais, guardareis os meus mandamentos."
        },
        {
          "num": 16,
          "text": "E eu rogarei ao Pai, e ele vos dará outro Consolador, a fim de que esteja para sempre convosco,"
        },
        {
          "num": 17,
          "text": "o Espírito da verdade, que o mundo não pode receber, porque não o vê, nem o conhece; vós o conheceis, porque ele habita convosco e estará em vós."
        },
        {
          "num": 18,
          "text": "Não vos deixarei órfãos, voltarei para vós outros."
        },
        {
          "num": 19,
          "text": "Ainda por um pouco, e o mundo não me verá mais; vós, porém, me vereis; porque eu vivo, vós também vivereis."
        },
        {
          "num": 20,
          "text": "Naquele dia, vós conhecereis que eu estou em meu Pai, e vós, em mim, e eu, em vós."
        },
        {
          "num": 21,
          "text": "Aquele que tem os meus mandamentos e os guarda, esse é o que me ama; e aquele que me ama será amado por meu Pai, e eu também o amarei e me manifestarei a ele."
        },
        {
          "num": 22,
          "text": "Disse-lhe Judas, não o Iscariotes: Donde procede, Senhor, que estás para manifestar-te a nós e não ao mundo?"
        },
        {
          "num": 23,
          "text": "Respondeu Jesus: Se alguém me ama, guardará a minha palavra; e meu Pai o amará, e viremos para ele e faremos nele morada."
        },
        {
          "num": 24,
          "text": "Quem não me ama não guarda as minhas palavras; e a palavra que estais ouvindo não é minha, mas do Pai, que me enviou."
        },
        {
          "num": 25,
          "text": "Isto vos tenho dito, estando ainda convosco;"
        },
        {
          "num": 26,
          "text": "mas o Consolador, o Espírito Santo, a quem o Pai enviará em meu nome, esse vos ensinará todas as coisas e vos fará lembrar de tudo o que vos tenho dito."
        },
        {
          "num": 27,
          "text": "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como a dá o mundo. Não se turbe o vosso coração, nem se atemorize."
        },
        {
          "num": 28,
          "text": "Ouvistes que eu vos disse: vou e volto para junto de vós. Se me amásseis, alegrar-vos-íeis de que eu vá para o Pai, pois o Pai é maior do que eu."
        },
        {
          "num": 29,
          "text": "Disse-vos agora, antes que aconteça, para que, quando acontecer, vós creiais."
        },
        {
          "num": 30,
          "text": "Já não falarei muito convosco, porque aí vem o príncipe do mundo; e ele nada tem em mim;"
        },
        {
          "num": 31,
          "text": "contudo, assim procedo para que o mundo saiba que eu amo o Pai e que faço como o Pai me ordenou. Levantai-vos, vamo-nos daqui."
        }
      ]
    }
  },
  "jo-15": {
    "book": "João",
    "chapter": 15,
    "title": "A Videira Verdadeira",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "«Eu sou a videira verdadeira e o meu Pai é quem trata da vinha."
        },
        {
          "num": 2,
          "text": "Ele corta todos os ramos que em mim não dão fruto, e limpa os que dão fruto, para que deem ainda mais."
        },
        {
          "num": 3,
          "text": "Vocês já estão limpos pelo ensino que eu vos deixei."
        },
        {
          "num": 4,
          "text": "Permaneçam em mim, que eu permaneço em vós. Um ramo não pode dar fruto por si só, se não estiver unido à videira. Por isso, não podem dar fruto se não estiverem unidos a mim."
        },
        {
          "num": 5,
          "text": "Eu sou a videira e vós os ramos. Aquele que estiver unido comigo dá muito fruto porque sem mim nada podem fazer."
        },
        {
          "num": 6,
          "text": "Todo aquele que não estiver unido a mim, é lançado fora como um ramo e seca. Tais ramos são enfeixados e lançados ao fogo para arderem."
        },
        {
          "num": 7,
          "text": "Se continuarem unidos a mim e não esquecerem as minhas palavras, hão de receber tudo quanto pedirem."
        },
        {
          "num": 8,
          "text": "Nisto consiste a glória de meu Pai: que deem muito fruto e que se comportem como meus discípulos."
        },
        {
          "num": 9,
          "text": "Eu tenho-vos amor como o Pai me tem a mim. Continuem sempre unidos no meu amor!"
        },
        {
          "num": 10,
          "text": "Se observarem os meus mandamentos, como eu observo os do meu Pai, permanecereis no meu amor como eu no do meu Pai."
        },
        {
          "num": 11,
          "text": "Falo-vos desta maneira para que se alegrem comigo e para que tenham uma alegria perfeita."
        },
        {
          "num": 12,
          "text": "O meu mandamento é este: amem-se uns aos outros como eu sempre vos amei."
        },
        {
          "num": 13,
          "text": "Não há maior amor do que dar a vida por aqueles a quem se ama."
        },
        {
          "num": 14,
          "text": "Se fizerem aquilo que eu vos mando, serão meus amigos."
        },
        {
          "num": 15,
          "text": "Agora já não vos chamo servos, porque o servo não sabe o que faz o seu senhor. Chamo-vos amigos, porque vos dei a conhecer tudo quanto aprendi de meu Pai."
        },
        {
          "num": 16,
          "text": "Não foram vocês que me escolheram, mas sim eu que vos escolhi e enviei para produzirem muito fruto; não um fruto passageiro, mas um fruto que dure para sempre. Desta maneira, o Pai vos há de dar tudo quanto lhe pedirem em meu nome."
        },
        {
          "num": 17,
          "text": "E recomendo-vos isto: amem-se uns aos outros.» O mundo odeia Jesus e os seus"
        },
        {
          "num": 18,
          "text": "«Se o mundo vos tem ódio, fiquem a saber que me odiou primeiro a mim."
        },
        {
          "num": 19,
          "text": "Se pertencessem ao mundo, ele havia de vos estimar como filhos. Mas como foram escolhidos por mim, o mundo tem-vos ódio, porque já não pertencem ao mundo."
        },
        {
          "num": 20,
          "text": "Lembrem-se daquilo que vos disse: nenhum servo é maior que o seu senhor . Se a mim me perseguiram, também vos hão de perseguir. E se eles fizeram tão pouco caso da minha palavra, o mesmo vai acontecer convosco."
        },
        {
          "num": 21,
          "text": "Tudo isto vos há de suceder por minha causa, porque eles não conhecem aquele que me enviou."
        },
        {
          "num": 22,
          "text": "Eles não teriam culpa nenhuma se eu não tivesse vindo falar-lhes. Assim não têm qualquer desculpa."
        },
        {
          "num": 23,
          "text": "Quem me odeia, odeia também o meu Pai ."
        },
        {
          "num": 24,
          "text": "Não eram culpados, se eu não tivesse feito no meio deles coisas que nenhum outro fez. A verdade é que eles viram isso e, mesmo assim, odiaram-me tanto a mim como ao meu Pai."
        },
        {
          "num": 25,
          "text": "Mas assim tinha de ser para que se cumprisse o que está escrito na sua lei : Eles odiaram-me sem qualquer motivo ."
        },
        {
          "num": 26,
          "text": "Quando vier o Defensor que vos hei de enviar de junto do Pai, o Espírito de verdade que procede do Pai, há de dar testemunho acerca de mim."
        },
        {
          "num": 27,
          "text": "Também vocês hão de dar testemunho de mim, porque estão comigo desde o princípio."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Jesus disse: — Eu sou a videira verdadeira, e o meu Pai é o lavrador."
        },
        {
          "num": 2,
          "text": "Todos os ramos que não dão uvas ele corta, embora eles estejam em mim. Mas os ramos que dão uvas ele poda a fim de que fiquem limpos e deem mais uvas ainda."
        },
        {
          "num": 3,
          "text": "Vocês já estão limpos por meio dos ensinamentos que eu lhes tenho dado."
        },
        {
          "num": 4,
          "text": "Continuem unidos comigo, e eu continuarei unido com vocês. Pois, assim como o ramo só dá uvas quando está unido com a planta, assim também vocês só podem dar fruto se ficarem unidos comigo."
        },
        {
          "num": 5,
          "text": "— Eu sou a videira, e vocês são os ramos. Quem está unido comigo e eu com ele, esse dá muito fruto porque sem mim vocês não podem fazer nada."
        },
        {
          "num": 6,
          "text": "Quem não ficar unido comigo será jogado fora e secará; será como os ramos secos que são juntados e jogados no fogo, onde são queimados."
        },
        {
          "num": 7,
          "text": "Se vocês ficarem unidos comigo, e as minhas palavras continuarem em vocês, vocês receberão tudo o que pedirem."
        },
        {
          "num": 8,
          "text": "E a natureza gloriosa do meu Pai se revela quando vocês produzem muitos frutos e assim mostram que são meus discípulos."
        },
        {
          "num": 9,
          "text": "Assim como o meu Pai me ama, eu amo vocês; portanto, continuem unidos comigo por meio do meu amor por vocês."
        },
        {
          "num": 10,
          "text": "Se obedecerem aos meus mandamentos, eu continuarei amando vocês, assim como eu obedeço aos mandamentos do meu Pai e ele continua a me amar."
        },
        {
          "num": 11,
          "text": "— Eu estou dizendo isso para que a minha alegria esteja em vocês, e a alegria de vocês seja completa."
        },
        {
          "num": 12,
          "text": "O meu mandamento é este: amem uns aos outros como eu amo vocês."
        },
        {
          "num": 13,
          "text": "Ninguém tem mais amor pelos seus amigos do que aquele que dá a sua vida por eles."
        },
        {
          "num": 14,
          "text": "Vocês são meus amigos se fazem o que eu mando."
        },
        {
          "num": 15,
          "text": "Eu não chamo mais vocês de empregados, pois o empregado não sabe o que o seu patrão faz; mas chamo vocês de amigos, pois tenho dito a vocês tudo o que ouvi do meu Pai."
        },
        {
          "num": 16,
          "text": "Não foram vocês que me escolheram; pelo contrário, fui eu que os escolhi para que vão e deem fruto e que esse fruto não se perca. Isso a fim de que o Pai lhes dê tudo o que pedirem em meu nome."
        },
        {
          "num": 17,
          "text": "O que eu mando a vocês é isto: amem uns aos outros."
        },
        {
          "num": 18,
          "text": "Jesus continuou: — Se o mundo odeia vocês, lembrem que ele me odiou primeiro."
        },
        {
          "num": 19,
          "text": "Se vocês fossem do mundo, o mundo os amaria por vocês serem dele. Mas eu os escolhi entre as pessoas do mundo, e vocês não são mais dele. Por isso o mundo odeia vocês."
        },
        {
          "num": 20,
          "text": "Lembrem do que eu disse: “O empregado não é mais importante do que o patrão”. Se as pessoas que são do mundo me perseguiram, também perseguirão vocês; se elas obedeceram aos meus ensinamentos, também obedecerão aos ensinamentos de vocês."
        },
        {
          "num": 21,
          "text": "Por causa de mim, essas pessoas vão lhes fazer tudo isso porque não conhecem aquele que me enviou."
        },
        {
          "num": 22,
          "text": "Elas não teriam nenhum pecado se eu não tivesse vindo e falado a elas. Mas agora essas pessoas não têm desculpa para o seu pecado."
        },
        {
          "num": 23,
          "text": "Quem me odeia odeia também o meu Pai."
        },
        {
          "num": 24,
          "text": "Se eu não tivesse feito entre elas essas coisas que nenhum outro fez, elas não teriam nenhum pecado. Mas agora viram o que eu fiz e continuam a odiar tanto a mim como o meu Pai."
        },
        {
          "num": 25,
          "text": "Mas isso é para que se cumpra o que está escrito na Lei deles: “Eles me odiaram sem motivo.”"
        },
        {
          "num": 26,
          "text": "— Quando chegar o Auxiliador, o Espírito da verdade, que vem do Pai, ele falará a respeito de mim. E sou eu quem enviará esse Auxiliador a vocês da parte do Pai."
        },
        {
          "num": 27,
          "text": "E vocês também falarão a meu respeito porque estão comigo desde o começo."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Eu sou a videira verdadeira, e meu Pai é o agricultor."
        },
        {
          "num": 2,
          "text": "Todo ramo que, estando em mim, não der fruto, ele o corta; e todo o que dá fruto limpa, para que produza mais fruto ainda."
        },
        {
          "num": 3,
          "text": "Vós já estais limpos pela palavra que vos tenho falado;"
        },
        {
          "num": 4,
          "text": "permanecei em mim, e eu permanecerei em vós. Como não pode o ramo produzir fruto de si mesmo, se não permanecer na videira, assim, nem vós o podeis dar, se não permanecerdes em mim."
        },
        {
          "num": 5,
          "text": "Eu sou a videira, vós, os ramos. Quem permanece em mim, e eu, nele, esse dá muito fruto; porque sem mim nada podeis fazer."
        },
        {
          "num": 6,
          "text": "Se alguém não permanecer em mim, será lançado fora, à semelhança do ramo, e secará; e o apanham, lançam no fogo e o queimam."
        },
        {
          "num": 7,
          "text": "Se permanecerdes em mim, e as minhas palavras permanecerem em vós, pedireis o que quiserdes, e vos será feito."
        },
        {
          "num": 8,
          "text": "Nisto é glorificado meu Pai, em que deis muito fruto; e assim vos tornareis meus discípulos."
        },
        {
          "num": 9,
          "text": "Como o Pai me amou, também eu vos amei; permanecei no meu amor."
        },
        {
          "num": 10,
          "text": "Se guardardes os meus mandamentos, permanecereis no meu amor; assim como também eu tenho guardado os mandamentos de meu Pai e no seu amor permaneço."
        },
        {
          "num": 11,
          "text": "Tenho-vos dito estas coisas para que o meu gozo esteja em vós, e o vosso gozo seja completo."
        },
        {
          "num": 12,
          "text": "O meu mandamento é este: que vos ameis uns aos outros, assim como eu vos amei."
        },
        {
          "num": 13,
          "text": "Ninguém tem maior amor do que este: de dar alguém a própria vida em favor dos seus amigos."
        },
        {
          "num": 14,
          "text": "Vós sois meus amigos, se fazeis o que eu vos mando."
        },
        {
          "num": 15,
          "text": "Já não vos chamo servos, porque o servo não sabe o que faz o seu senhor; mas tenho-vos chamado amigos, porque tudo quanto ouvi de meu Pai vos tenho dado a conhecer."
        },
        {
          "num": 16,
          "text": "Não fostes vós que me escolhestes a mim; pelo contrário, eu vos escolhi a vós outros e vos designei para que vades e deis fruto, e o vosso fruto permaneça; a fim de que tudo quanto pedirdes ao Pai em meu nome, ele vo-lo conceda."
        },
        {
          "num": 17,
          "text": "Isto vos mando: que vos ameis uns aos outros."
        },
        {
          "num": 18,
          "text": "Se o mundo vos odeia, sabei que, primeiro do que a vós outros, me odiou a mim."
        },
        {
          "num": 19,
          "text": "Se vós fôsseis do mundo, o mundo amaria o que era seu; como, todavia, não sois do mundo, pelo contrário, dele vos escolhi, por isso, o mundo vos odeia."
        },
        {
          "num": 20,
          "text": "Lembrai-vos da palavra que eu vos disse: não é o servo maior do que seu senhor. Se me perseguiram a mim, também perseguirão a vós outros; se guardaram a minha palavra, também guardarão a vossa."
        },
        {
          "num": 21,
          "text": "Tudo isto, porém, vos farão por causa do meu nome, porquanto não conhecem aquele que me enviou."
        },
        {
          "num": 22,
          "text": "Se eu não viera, nem lhes houvera falado, pecado não teriam; mas, agora, não têm desculpa do seu pecado."
        },
        {
          "num": 23,
          "text": "Quem me odeia odeia também a meu Pai."
        },
        {
          "num": 24,
          "text": "Se eu não tivesse feito entre eles tais obras, quais nenhum outro fez, pecado não teriam; mas, agora, não somente têm eles visto, mas também odiado, tanto a mim como a meu Pai."
        },
        {
          "num": 25,
          "text": "Isto, porém, é para que se cumpra a palavra escrita na sua lei: Odiaram-me sem motivo."
        },
        {
          "num": 26,
          "text": "Quando, porém, vier o Consolador, que eu vos enviarei da parte do Pai, o Espírito da verdade, que dele procede, esse dará testemunho de mim;"
        },
        {
          "num": 27,
          "text": "e vós também testemunhareis, porque estais comigo desde o princípio."
        }
      ]
    }
  },
  "rm-8": {
    "book": "Romanos",
    "chapter": 8,
    "title": "A Vida no Espírito e Mais que Vencedores",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Mas agora não há condenação para os que estão unidos a Jesus Cristo ."
        },
        {
          "num": 2,
          "text": "Com efeito, a lei do Espírito que dá a vida pela união com Jesus Cristo libertou-me da lei do pecado e da morte."
        },
        {
          "num": 3,
          "text": "De facto, Deus fez aquilo que a Lei de Moisés não podia fazer, por causa da fraqueza humana. Deus condenou o pecado na natureza humana ao enviar o seu Filho que veio com uma natureza semelhante à do homem pecador. Deste modo condenou o pecado."
        },
        {
          "num": 4,
          "text": "Deus fez assim para que pudéssemos cumprir o que a lei manda, pois já não vivemos conforme as inclinações da natureza humana, mas de acordo com o Espírito."
        },
        {
          "num": 5,
          "text": "Os que vivem conforme as inclinações da natureza humana deixam-se arrastar por elas, mas aqueles que vivem de acordo com o Espírito preocupam-se com aquilo que o Espírito quer."
        },
        {
          "num": 6,
          "text": "De facto, as inclinações da natureza humana levam à morte, mas aquilo que é do Espírito leva à vida e à paz."
        },
        {
          "num": 7,
          "text": "Os nossos instintos são inimigos de Deus, pois não obedecem à sua lei nem o podem fazer."
        },
        {
          "num": 8,
          "text": "Os que estão sujeitos a esses instintos são incapazes de agradar a Deus."
        },
        {
          "num": 9,
          "text": "Ora vocês já não estão sujeitos a esses instintos, mas ao Espírito, se de facto possuem o Espírito de Deus. Se alguém não tem o Espírito de Cristo não é de Cristo."
        },
        {
          "num": 10,
          "text": "Se Cristo está em vós, embora o vosso corpo esteja morto por causa do pecado, o Espírito dá-lhe vida por causa da justificação."
        },
        {
          "num": 11,
          "text": "Realmente, se têm o Espírito daquele que fez passar Jesus da morte para a vida, ele que o ressuscitou, também fará viver os vossos corpos mortais pelo seu Espírito que habita em vós."
        },
        {
          "num": 12,
          "text": "Portanto, meus irmãos, nós não devemos viver segundo as inclinações da natureza humana."
        },
        {
          "num": 13,
          "text": "Se viverem conforme tais inclinações, estão a caminhar para a morte; mas se pelo Espírito fizerem morrer as ações pecaminosas, então viverão."
        },
        {
          "num": 14,
          "text": "Todos os que são guiados pelo Espírito são filhos de Deus."
        },
        {
          "num": 15,
          "text": "E o Espírito que receberam não vos torna escravos nem medrosos, mas torna-vos filhos de Deus. É ele que nos faz exclamar: «Abba», que quer dizer «meu Pai »."
        },
        {
          "num": 16,
          "text": "É o próprio Espírito que testemunha com o nosso espírito que somos filhos de Deus."
        },
        {
          "num": 17,
          "text": "E se nós somos seus filhos também somos seus herdeiros. Somos herdeiros de Deus juntamente com Cristo. Se sofremos com ele também tomaremos parte na sua glória. Esperança na felicidade futura"
        },
        {
          "num": 18,
          "text": "Julgo que os nossos sofrimentos de agora não têm comparação com a glória que depois havemos de ter."
        },
        {
          "num": 19,
          "text": "O mundo todo espera e deseja com ânsia essa manifestação dos filhos de Deus."
        },
        {
          "num": 20,
          "text": "Na verdade, o mundo ficou sujeito ao fracasso, não por sua vontade, mas porque era esse o plano de Deus . Entretanto, Deus manteve-o sempre nesta esperança:"
        },
        {
          "num": 21,
          "text": "Um dia, o mundo será libertado da escravidão e da destruição, para tomar parte na gloriosa liberdade dos filhos de Deus."
        },
        {
          "num": 22,
          "text": "Bem sabemos que até agora o mundo todo geme e sofre como se fossem dores de parto."
        },
        {
          "num": 23,
          "text": "Não é só o Universo, mas também nós que já começámos a receber os dons do Espírito. Nós sofremos e esperamos a hora de sermos adotados como filhos de Deus, a hora da nossa total libertação."
        },
        {
          "num": 24,
          "text": "De facto, nós já fomos salvos, mas é na esperança. Quando se vê aquilo que se espera, então já não é esperança. Pois como é que alguém espera aquilo que já está a ver?"
        },
        {
          "num": 25,
          "text": "Mas se nós esperamos aquilo que ainda não vemos, esperamo-lo com paciência."
        },
        {
          "num": 26,
          "text": "Da mesma maneira, também o Espírito nos ajuda a nós que somos fracos. Com efeito, nós não sabemos orar como convém, mas o próprio Espírito pede a Deus por nós com gemidos indescritíveis."
        },
        {
          "num": 27,
          "text": "E Deus, que vê mesmo dentro dos próprios corações , conhece o que o Espírito deseja, porque este pede conforme os desejos de Deus em favor dos que lhe pertencem."
        },
        {
          "num": 28,
          "text": "Nós sabemos que tudo contribui para o bem daqueles que amam a Deus, dos que são chamados segundo o seu plano."
        },
        {
          "num": 29,
          "text": "Pois aqueles que Deus de antemão conheceu também os predestinou para serem semelhantes ao seu Filho. Desse modo, o Filho é o primeiro entre muitos irmãos ."
        },
        {
          "num": 30,
          "text": "Deus chamou aqueles que predestinou. Aos que chamou, também justificou e aos que justificou também glorificou. O maravilhoso amor de Deus"
        },
        {
          "num": 31,
          "text": "Que mais diremos sobre isto? Se Deus está por nós, quem poderá estar contra nós?"
        },
        {
          "num": 32,
          "text": "Ele que não nos recusou o seu próprio Filho, mas o ofereceu por todos nós, não nos concederá com ele todos os dons?"
        },
        {
          "num": 33,
          "text": "Quem poderá acusar aqueles que Deus escolheu, se Deus os declara inocentes?!"
        },
        {
          "num": 34,
          "text": "Quem é que os pode condenar? Será porventura Cristo Jesus que morreu, e mais, que ressuscitou e está à direita de Deus, o qual também intercede por nós?"
        },
        {
          "num": 35,
          "text": "Quem nos poderá separar do amor de Cristo? O sofrimento, as dificuldades, a perseguição, a fome, a pobreza, os perigos, a morte?"
        },
        {
          "num": 36,
          "text": "Como diz a Sagrada Escritura : Por causa de ti estamos expostos à morte todos os dias. Tratam-nos como ovelhas para o matadouro ."
        },
        {
          "num": 37,
          "text": "Mas em tudo isto nós saímos mais que vencedores, por meio daquele que nos amou."
        },
        {
          "num": 38,
          "text": "Com efeito, eu tenho a certeza de que não há nada que nos possa separar do amor de Deus: Nem a morte nem a vida; nem os anjos nem outras forças ou poderes espirituais; nem o presente nem o futuro;"
        },
        {
          "num": 39,
          "text": "nem as forças do alto nem as do abismo . Não há nada nem ninguém que nos possa separar do amor que Deus nos deu a conhecer por nosso Senhor Jesus Cristo."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Agora já não existe nenhuma condenação para as pessoas que estão unidas com Cristo Jesus."
        },
        {
          "num": 2,
          "text": "Pois a lei do Espírito de Deus, que nos trouxe vida por estarmos unidos com Cristo Jesus, livrou você da lei do pecado e da morte."
        },
        {
          "num": 3,
          "text": "Deus fez o que a lei não pôde fazer porque a natureza humana era fraca. Deus condenou o pecado na natureza humana, enviando o seu próprio Filho, que veio na forma da nossa natureza pecaminosa a fim de acabar com o pecado."
        },
        {
          "num": 4,
          "text": "Deus fez isso para que as ordens justas da lei pudessem ser completamente cumpridas por nós, que vivemos de acordo com o Espírito de Deus e não de acordo com a natureza humana."
        },
        {
          "num": 5,
          "text": "Porque as pessoas que vivem de acordo com a natureza humana têm a sua mente controlada por essa mesma natureza. Mas as que vivem de acordo com o Espírito de Deus têm a sua mente controlada pelo Espírito."
        },
        {
          "num": 6,
          "text": "As pessoas que têm a mente controlada pela natureza humana acabarão morrendo espiritualmente; mas as que têm a mente controlada pelo Espírito de Deus terão a vida eterna e a paz."
        },
        {
          "num": 7,
          "text": "Por isso as pessoas que têm a mente controlada pela natureza humana se tornam inimigas de Deus, pois não obedecem à lei de Deus e, de fato, não podem obedecer a ela."
        },
        {
          "num": 8,
          "text": "As pessoas que vivem de acordo com a sua natureza humana não podem agradar a Deus."
        },
        {
          "num": 9,
          "text": "Vocês, porém, não vivem como manda a natureza humana, mas como o Espírito de Deus quer, se é que o Espírito de Deus vive realmente em vocês. Quem não tem o Espírito de Cristo não pertence a ele."
        },
        {
          "num": 10,
          "text": "Mas, se Cristo vive em vocês, então, embora o corpo de vocês vá morrer por causa do pecado, o Espírito de Deus é vida para vocês porque vocês foram aceitos por Deus."
        },
        {
          "num": 11,
          "text": "Se em vocês vive o Espírito daquele que ressuscitou Jesus, então aquele que ressuscitou Jesus Cristo dará também vida ao corpo mortal de vocês, por meio do seu Espírito, que vive em vocês."
        },
        {
          "num": 12,
          "text": "Portanto, meus irmãos, nós temos uma obrigação, que é a de não vivermos de acordo com a nossa natureza humana."
        },
        {
          "num": 13,
          "text": "Porque, se vocês viverem de acordo com a natureza humana, vocês morrerão espiritualmente; mas, se pelo Espírito de Deus vocês matarem as suas ações pecaminosas, vocês viverão espiritualmente."
        },
        {
          "num": 14,
          "text": "Pois aqueles que são guiados pelo Espírito de Deus são filhos de Deus."
        },
        {
          "num": 15,
          "text": "Porque o Espírito que vocês receberam de Deus não torna vocês escravos e não faz com que tenham medo. Pelo contrário, o Espírito torna vocês filhos de Deus; e pelo poder do Espírito dizemos com fervor a Deus: “Pai, meu Pai!”"
        },
        {
          "num": 16,
          "text": "O Espírito de Deus se une com o nosso espírito para afirmar que somos filhos de Deus."
        },
        {
          "num": 17,
          "text": "Nós somos seus filhos, e por isso receberemos as bênçãos que ele guarda para o seu povo, e também receberemos com Cristo aquilo que Deus tem guardado para ele. Porque, se tomamos parte nos sofrimentos de Cristo, também tomaremos parte na sua glória."
        },
        {
          "num": 18,
          "text": "Eu penso que o que sofremos durante a nossa vida não pode ser comparado, de modo nenhum, com a glória que nos será revelada no futuro."
        },
        {
          "num": 19,
          "text": "O Universo todo espera com muita impaciência o momento em que Deus vai revelar o que os seus filhos realmente são."
        },
        {
          "num": 20,
          "text": "Pois o Universo se tornou inútil, não pela sua própria vontade, mas porque Deus quis que fosse assim. Porém existe esta esperança:"
        },
        {
          "num": 21,
          "text": "Um dia o próprio Universo ficará livre do poder destruidor que o mantém escravo e tomará parte na gloriosa liberdade dos filhos de Deus."
        },
        {
          "num": 22,
          "text": "Pois sabemos que até agora o Universo todo geme e sofre como uma mulher que está em trabalho de parto."
        },
        {
          "num": 23,
          "text": "E não somente o Universo, mas nós, que temos o Espírito Santo como o primeiro presente que recebemos de Deus, nós também gememos dentro de nós mesmos enquanto esperamos que Deus faça com que sejamos seus filhos e nos liberte completamente."
        },
        {
          "num": 24,
          "text": "Pois foi por meio da esperança que fomos salvos. Mas, se já estamos vendo aquilo que esperamos, então isso não é mais uma esperança. Pois quem é que fica esperando por alguma coisa que está vendo?"
        },
        {
          "num": 25,
          "text": "Porém, se estamos esperando alguma coisa que ainda não podemos ver, então esperamos com paciência."
        },
        {
          "num": 26,
          "text": "Assim também o Espírito de Deus vem nos ajudar na nossa fraqueza. Pois não sabemos como devemos orar, mas o Espírito de Deus, com gemidos que não podem ser explicados por palavras, pede a Deus em nosso favor."
        },
        {
          "num": 27,
          "text": "E Deus, que vê o que está dentro do coração, sabe qual é o pensamento do Espírito. Porque o Espírito pede em favor do povo de Deus e pede de acordo com a vontade de Deus."
        },
        {
          "num": 28,
          "text": "Pois sabemos que todas as coisas trabalham juntas para o bem daqueles que amam a Deus, daqueles a quem ele chamou de acordo com o seu plano."
        },
        {
          "num": 29,
          "text": "Porque aqueles que já tinham sido escolhidos por Deus ele também separou a fim de se tornarem parecidos com o seu Filho. Ele fez isso para que o Filho fosse o primeiro entre muitos irmãos."
        },
        {
          "num": 30,
          "text": "Assim Deus chamou os que havia separado. Não somente os chamou, mas também os aceitou; e não somente os aceitou, mas também repartiu a sua glória com eles."
        },
        {
          "num": 31,
          "text": "Diante de tudo isso, o que mais podemos dizer? Se Deus está do nosso lado, quem poderá nos vencer? Ninguém!"
        },
        {
          "num": 32,
          "text": "Porque ele nem mesmo deixou de entregar o próprio Filho, mas o ofereceu por todos nós! Se ele nos deu o seu Filho, será que não nos dará também todas as coisas?"
        },
        {
          "num": 33,
          "text": "Quem acusará aqueles que Deus escolheu? Ninguém! Porque o próprio Deus declara que eles não são culpados."
        },
        {
          "num": 34,
          "text": "Será que alguém poderá condená-los? Ninguém! Pois foi Cristo Jesus quem morreu, ou melhor, quem foi ressuscitado e está à direita de Deus. E ele pede a Deus em favor de nós."
        },
        {
          "num": 35,
          "text": "Então quem pode nos separar do amor de Cristo? Serão os sofrimentos, as dificuldades, a perseguição, a fome, a pobreza, o perigo ou a morte?"
        },
        {
          "num": 36,
          "text": "Como dizem as Escrituras Sagradas: “Por causa de ti estamos em perigo de morte o dia inteiro; somos tratados como ovelhas que vão para o matadouro.”"
        },
        {
          "num": 37,
          "text": "Em todas essas situações temos a vitória completa por meio daquele que nos amou."
        },
        {
          "num": 38,
          "text": "Pois eu tenho a certeza de que nada pode nos separar do amor de Deus: nem a morte, nem a vida; nem os anjos, nem outras autoridades ou poderes celestiais; nem o presente, nem o futuro;"
        },
        {
          "num": 39,
          "text": "nem o mundo lá de cima, nem o mundo lá de baixo. Em todo o Universo não há nada que possa nos separar do amor de Deus, que é nosso por meio de Cristo Jesus, o nosso Senhor."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Agora, pois, já nenhuma condenação há para os que estão em Cristo Jesus."
        },
        {
          "num": 2,
          "text": "Porque a lei do Espírito da vida, em Cristo Jesus, te livrou da lei do pecado e da morte."
        },
        {
          "num": 3,
          "text": "Porquanto o que fora impossível à lei, no que estava enferma pela carne, isso fez Deus enviando o seu próprio Filho em semelhança de carne pecaminosa e no tocante ao pecado; e, com efeito, condenou Deus, na carne, o pecado,"
        },
        {
          "num": 4,
          "text": "a fim de que o preceito da lei se cumprisse em nós, que não andamos segundo a carne, mas segundo o Espírito."
        },
        {
          "num": 5,
          "text": "Porque os que se inclinam para a carne cogitam das coisas da carne; mas os que se inclinam para o Espírito, das coisas do Espírito."
        },
        {
          "num": 6,
          "text": "Porque o pendor da carne dá para a morte, mas o do Espírito, para a vida e paz."
        },
        {
          "num": 7,
          "text": "Por isso, o pendor da carne é inimizade contra Deus, pois não está sujeito à lei de Deus, nem mesmo pode estar."
        },
        {
          "num": 8,
          "text": "Portanto, os que estão na carne não podem agradar a Deus."
        },
        {
          "num": 9,
          "text": "Vós, porém, não estais na carne, mas no Espírito, se, de fato, o Espírito de Deus habita em vós. E, se alguém não tem o Espírito de Cristo, esse tal não é dele."
        },
        {
          "num": 10,
          "text": "Se, porém, Cristo está em vós, o corpo, na verdade, está morto por causa do pecado, mas o espírito é vida, por causa da justiça."
        },
        {
          "num": 11,
          "text": "Se habita em vós o Espírito daquele que ressuscitou a Jesus dentre os mortos, esse mesmo que ressuscitou a Cristo Jesus dentre os mortos vivificará também o vosso corpo mortal, por meio do seu Espírito, que em vós habita."
        },
        {
          "num": 12,
          "text": "Assim, pois, irmãos, somos devedores, não à carne como se constrangidos a viver segundo a carne."
        },
        {
          "num": 13,
          "text": "Porque, se viverdes segundo a carne, caminhais para a morte; mas, se, pelo Espírito, mortificardes os feitos do corpo, certamente, vivereis."
        },
        {
          "num": 14,
          "text": "Pois todos os que são guiados pelo Espírito de Deus são filhos de Deus."
        },
        {
          "num": 15,
          "text": "Porque não recebestes o espírito de escravidão, para viverdes, outra vez, atemorizados, mas recebestes o espírito de adoção, baseados no qual clamamos: Aba, Pai."
        },
        {
          "num": 16,
          "text": "O próprio Espírito testifica com o nosso espírito que somos filhos de Deus."
        },
        {
          "num": 17,
          "text": "Ora, se somos filhos, somos também herdeiros, herdeiros de Deus e coerdeiros com Cristo; se com ele sofremos, também com ele seremos glorificados."
        },
        {
          "num": 18,
          "text": "Porque para mim tenho por certo que os sofrimentos do tempo presente não podem ser comparados com a glória a ser revelada em nós."
        },
        {
          "num": 19,
          "text": "A ardente expectativa da criação aguarda a revelação dos filhos de Deus."
        },
        {
          "num": 20,
          "text": "Pois a criação está sujeita à vaidade, não voluntariamente, mas por causa daquele que a sujeitou,"
        },
        {
          "num": 21,
          "text": "na esperança de que a própria criação será redimida do cativeiro da corrupção, para a liberdade da glória dos filhos de Deus."
        },
        {
          "num": 22,
          "text": "Porque sabemos que toda a criação, a um só tempo, geme e suporta angústias até agora."
        },
        {
          "num": 23,
          "text": "E não somente ela, mas também nós, que temos as primícias do Espírito, igualmente gememos em nosso íntimo, aguardando a adoção de filhos, a redenção do nosso corpo."
        },
        {
          "num": 24,
          "text": "Porque, na esperança, fomos salvos. Ora, esperança que se vê não é esperança; pois o que alguém vê, como o espera?"
        },
        {
          "num": 25,
          "text": "Mas, se esperamos o que não vemos, com paciência o aguardamos."
        },
        {
          "num": 26,
          "text": "Também o Espírito, semelhantemente, nos assiste em nossa fraqueza; porque não sabemos orar como convém, mas o mesmo Espírito intercede por nós sobremaneira, com gemidos inexprimíveis."
        },
        {
          "num": 27,
          "text": "E aquele que sonda os corações sabe qual é a mente do Espírito, porque segundo a vontade de Deus é que ele intercede pelos santos."
        },
        {
          "num": 28,
          "text": "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito."
        },
        {
          "num": 29,
          "text": "Porquanto aos que de antemão conheceu, também os predestinou para serem conformes à imagem de seu Filho, a fim de que ele seja o primogênito entre muitos irmãos."
        },
        {
          "num": 30,
          "text": "E aos que predestinou, a esses também chamou; e aos que chamou, a esses também justificou; e aos que justificou, a esses também glorificou."
        },
        {
          "num": 31,
          "text": "Que diremos, pois, à vista destas coisas? Se Deus é por nós, quem será contra nós?"
        },
        {
          "num": 32,
          "text": "Aquele que não poupou o seu próprio Filho, antes, por todos nós o entregou, porventura, não nos dará graciosamente com ele todas as coisas?"
        },
        {
          "num": 33,
          "text": "Quem intentará acusação contra os eleitos de Deus? É Deus quem os justifica."
        },
        {
          "num": 34,
          "text": "Quem os condenará? É Cristo Jesus quem morreu ou, antes, quem ressuscitou, o qual está à direita de Deus e também intercede por nós."
        },
        {
          "num": 35,
          "text": "Quem nos separará do amor de Cristo? Será tribulação, ou angústia, ou perseguição, ou fome, ou nudez, ou perigo, ou espada?"
        },
        {
          "num": 36,
          "text": "Como está escrito: Por amor de ti, somos entregues à morte o dia todo, fomos considerados como ovelhas para o matadouro."
        },
        {
          "num": 37,
          "text": "Em todas estas coisas, porém, somos mais que vencedores, por meio daquele que nos amou."
        },
        {
          "num": 38,
          "text": "Porque eu estou bem certo de que nem a morte, nem a vida, nem os anjos, nem os principados, nem as coisas do presente, nem do porvir, nem os poderes,"
        },
        {
          "num": 39,
          "text": "nem a altura, nem a profundidade, nem qualquer outra criatura poderá separar-nos do amor de Deus, que está em Cristo Jesus, nosso Senhor."
        }
      ]
    }
  },
  "rm-12": {
    "book": "Romanos",
    "chapter": 12,
    "title": "O Culto Racional e a Vida Cristã",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Irmãos , peço-vos pelo amor de Deus que se ofereçam a ele como ofertas vivas, santas e agradáveis. É este o verdadeiro culto que lhe devem prestar."
        },
        {
          "num": 2,
          "text": "Não vivam de acordo com as normas deste mundo, mas transformem-se, adquirindo uma nova mentalidade. Assim compreenderão qual é a vontade de Deus, isto é, o que é bom, o que lhe é agradável e o que é perfeito."
        },
        {
          "num": 3,
          "text": "Em virtude da missão que Deus me confiou a vosso respeito, recomendo-vos que ninguém se julgue mais do que é. Pelo contrário, sejam modestos e que cada um se julgue a si mesmo conforme o grau da fé que Deus lhe deu."
        },
        {
          "num": 4,
          "text": "Num mesmo corpo há vários membros e cada um tem a sua função."
        },
        {
          "num": 5,
          "text": "Assim também nós, que somos muitos, formamos um só corpo em união com Cristo e estamos unidos uns aos outros como membros do mesmo corpo."
        },
        {
          "num": 6,
          "text": "Nós temos dons diferentes conforme Deus os quis dar gratuitamente a cada um. Quem tiver o dom de anunciar a mensagem de Deus, deve usá-lo conforme a sua fé."
        },
        {
          "num": 7,
          "text": "Quem tiver o dom de servir os outros, que sirva; quem tiver o dom de ensinar, que ensine;"
        },
        {
          "num": 8,
          "text": "quem tiver o dom de encorajar os outros, que os encoraje. O que reparte o que tem com os outros, reparta-o generosamente. O que preside faça-o com dedicação. O que ajuda os necessitados, ajude-os com alegria. Exigências da vida cristã"
        },
        {
          "num": 9,
          "text": "Que o vosso amor seja sincero. Detestem o mal e pratiquem o bem."
        },
        {
          "num": 10,
          "text": "Amem-se como irmãos e ponham os outros sempre em primeiro lugar."
        },
        {
          "num": 11,
          "text": "Trabalhem e não sejam preguiçosos. Sirvam o Senhor com dedicação e fervor."
        },
        {
          "num": 12,
          "text": "Sejam alegres na esperança que têm. Tenham coragem nos sofrimentos e nunca deixem a oração."
        },
        {
          "num": 13,
          "text": "Repartam com os crentes necessitados e recebam bem os que procuram hospitalidade."
        },
        {
          "num": 14,
          "text": "Peçam a Deus que abençoe aqueles que vos tratam mal. Peçam para eles bênçãos e não maldições."
        },
        {
          "num": 15,
          "text": "Alegrem-se com os que estão alegres e chorem com os que choram."
        },
        {
          "num": 16,
          "text": "Vivam em harmonia de sentimentos. Não procurem honrarias, mas aceitem as ocupações mais humildes. Não se envaideçam com aquilo que sabem."
        },
        {
          "num": 17,
          "text": "Não paguem o mal com o mal. Procurem antes fazer o bem diante de todos."
        },
        {
          "num": 18,
          "text": "Façam tudo o que for possível da vossa parte para viverem em paz com toda a gente."
        },
        {
          "num": 19,
          "text": "Meus caros irmãos, não façam justiça por vossas mãos. Deixem que seja Deus a castigar, pois diz o Senhor na Sagrada Escritura : A mim é que pertence castigar; eu é que darei a recompensa ."
        },
        {
          "num": 20,
          "text": "E diz também: Se o teu inimigo tem fome, dá-lhe de comer e se tem sede dá-lhe de beber. Ao fazeres isso, farás com que a cara lhe arda de vergonha ."
        },
        {
          "num": 21,
          "text": "Não te deixes vencer pelo mal, mas vence o mal com o bem."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Portanto, meus irmãos, por causa da grande misericórdia divina, peço que vocês se ofereçam completamente a Deus como um sacrifício vivo, dedicado ao seu serviço e agradável a ele. Esta é a verdadeira adoração que vocês devem oferecer a Deus."
        },
        {
          "num": 2,
          "text": "Não vivam como vivem as pessoas deste mundo, mas deixem que Deus os transforme por meio de uma completa mudança da mente de vocês. Assim vocês conhecerão a vontade de Deus, isto é, aquilo que é bom, perfeito e agradável a ele."
        },
        {
          "num": 3,
          "text": "Por causa da bondade de Deus para comigo, me chamando para ser apóstolo, eu digo a todos vocês que não se achem melhores do que realmente são. Pelo contrário, pensem com humildade a respeito de vocês mesmos, e cada um julgue a si mesmo conforme a fé que Deus lhe deu."
        },
        {
          "num": 4,
          "text": "Porque, assim como em um só corpo temos muitas partes, e todas elas têm funções diferentes,"
        },
        {
          "num": 5,
          "text": "assim também nós, embora sejamos muitos, somos um só corpo por estarmos unidos com Cristo. E todos estamos unidos uns com os outros como partes diferentes de um só corpo."
        },
        {
          "num": 6,
          "text": "Portanto, usemos os nossos diferentes dons de acordo com a graça que Deus nos deu. Se o dom que recebemos é o de anunciar a mensagem de Deus, façamos isso de acordo com a fé que temos."
        },
        {
          "num": 7,
          "text": "Se é o dom de servir, então devemos servir; se é o de ensinar, então ensinemos;"
        },
        {
          "num": 8,
          "text": "se é o dom de animar os outros, então animemos. Quem reparte com os outros o que tem, que faça isso com generosidade. Quem tem autoridade, que use a sua autoridade com todo o cuidado. Quem ajuda os outros, que ajude com alegria."
        },
        {
          "num": 9,
          "text": "Que o amor de vocês não seja fingido. Odeiem o mal e sigam o que é bom."
        },
        {
          "num": 10,
          "text": "Amem uns aos outros com o amor de irmãos em Cristo e se esforcem para tratar uns aos outros com respeito."
        },
        {
          "num": 11,
          "text": "Trabalhem com entusiasmo e não sejam preguiçosos. Sirvam o Senhor com o coração cheio de fervor."
        },
        {
          "num": 12,
          "text": "Que a esperança que vocês têm os mantenha alegres; aguentem com paciência os sofrimentos e orem sempre."
        },
        {
          "num": 13,
          "text": "Repartam com os irmãos necessitados o que vocês têm e recebam os estrangeiros nas suas casas."
        },
        {
          "num": 14,
          "text": "Peçam que Deus abençoe os que perseguem vocês. Sim, peçam que ele abençoe e não que amaldiçoe."
        },
        {
          "num": 15,
          "text": "Alegrem-se com os que se alegram e chorem com os que choram."
        },
        {
          "num": 16,
          "text": "Tenham por todos o mesmo cuidado. Não sejam orgulhosos, mas aceitem serviços humildes. Que nenhum de vocês fique pensando que é sábio!"
        },
        {
          "num": 17,
          "text": "Não paguem a ninguém o mal com o mal. Procurem agir de tal maneira que vocês recebam a aprovação dos outros."
        },
        {
          "num": 18,
          "text": "No que depender de vocês, façam todo o possível para viver em paz com todas as pessoas."
        },
        {
          "num": 19,
          "text": "Meus queridos irmãos, nunca se vinguem de ninguém; pelo contrário, deixem que seja Deus quem dê o castigo. Pois as Escrituras Sagradas dizem: “Eu me vingarei, eu acertarei contas com eles, diz o Senhor.”"
        },
        {
          "num": 20,
          "text": "Mas façam como dizem as Escrituras: “Se o seu inimigo estiver com fome, dê comida a ele; se estiver com sede, dê água. Porque assim você o fará queimar de remorso e vergonha.”"
        },
        {
          "num": 21,
          "text": "Não deixem que o mal vença vocês, mas vençam o mal com o bem."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Rogo-vos, pois, irmãos, pelas misericórdias de Deus, que apresenteis o vosso corpo por sacrifício vivo, santo e agradável a Deus, que é o vosso culto racional."
        },
        {
          "num": 2,
          "text": "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus."
        },
        {
          "num": 3,
          "text": "Porque, pela graça que me foi dada, digo a cada um dentre vós que não pense de si mesmo além do que convém; antes, pense com moderação, segundo a medida da fé que Deus repartiu a cada um."
        },
        {
          "num": 4,
          "text": "Porque assim como num só corpo temos muitos membros, mas nem todos os membros têm a mesma função,"
        },
        {
          "num": 5,
          "text": "assim também nós, conquanto muitos, somos um só corpo em Cristo e membros uns dos outros,"
        },
        {
          "num": 6,
          "text": "tendo, porém, diferentes dons segundo a graça que nos foi dada: se profecia, seja segundo a proporção da fé;"
        },
        {
          "num": 7,
          "text": "se ministério, dediquemo-nos ao ministério; ou o que ensina esmere-se no fazê-lo;"
        },
        {
          "num": 8,
          "text": "ou o que exorta faça-o com dedicação; o que contribui, com liberalidade; o que preside, com diligência; quem exerce misericórdia, com alegria."
        },
        {
          "num": 9,
          "text": "O amor seja sem hipocrisia. Detestai o mal, apegando-vos ao bem."
        },
        {
          "num": 10,
          "text": "Amai-vos cordialmente uns aos outros com amor fraternal, preferindo-vos em honra uns aos outros."
        },
        {
          "num": 11,
          "text": "No zelo, não sejais remissos; sede fervorosos de espírito, servindo ao Senhor;"
        },
        {
          "num": 12,
          "text": "regozijai-vos na esperança, sede pacientes na tribulação, na oração, perseverantes;"
        },
        {
          "num": 13,
          "text": "compartilhai as necessidades dos santos; praticai a hospitalidade;"
        },
        {
          "num": 14,
          "text": "abençoai os que vos perseguem, abençoai e não amaldiçoeis."
        },
        {
          "num": 15,
          "text": "Alegrai-vos com os que se alegram e chorai com os que choram."
        },
        {
          "num": 16,
          "text": "Tende o mesmo sentimento uns para com os outros; em lugar de serdes orgulhosos, condescendei com o que é humilde; não sejais sábios aos vossos próprios olhos."
        },
        {
          "num": 17,
          "text": "Não torneis a ninguém mal por mal; esforçai-vos por fazer o bem perante todos os homens;"
        },
        {
          "num": 18,
          "text": "se possível, quanto depender de vós, tende paz com todos os homens;"
        },
        {
          "num": 19,
          "text": "não vos vingueis a vós mesmos, amados, mas dai lugar à ira; porque está escrito: A mim me pertence a vingança; eu é que retribuirei, diz o Senhor."
        },
        {
          "num": 20,
          "text": "Pelo contrário, se o teu inimigo tiver fome, dá-lhe de comer; se tiver sede, dá-lhe de beber; porque, fazendo isto, amontoarás brasas vivas sobre a sua cabeça."
        },
        {
          "num": 21,
          "text": "Não te deixes vencer do mal, mas vence o mal com o bem."
        }
      ]
    }
  },
  "1co-13": {
    "book": "1 Coríntios",
    "chapter": 13,
    "title": "O Hino ao Amor Divino",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Se eu for capaz de falar todas as línguas dos homens e dos anjos e não tiver amor, as minhas palavras são como o badalar de um sino ou o barulho de um chocalho."
        },
        {
          "num": 2,
          "text": "Se eu tiver o dom de declarar a palavra de Deus, de conhecer os seus mistérios e souber tudo; e se eu tiver uma fé capaz de transportar montanhas e não tiver amor, não valho nada."
        },
        {
          "num": 3,
          "text": "Ainda que eu dê em esmolas tudo o que é meu , se me deixar queimar vivo e não tiver amor, de nada me serve."
        },
        {
          "num": 4,
          "text": "O amor é paciente e prestável. Não é invejoso. Não se envaidece nem é orgulhoso."
        },
        {
          "num": 5,
          "text": "O amor não tem maus modos nem é egoísta. Não se irrita nem pensa mal."
        },
        {
          "num": 6,
          "text": "O amor não se alegra com uma injustiça causada a alguém, mas alegra-se com a verdade."
        },
        {
          "num": 7,
          "text": "O amor suporta tudo , acredita sempre, espera sempre e sofre com paciência."
        },
        {
          "num": 8,
          "text": "O amor é eterno. As profecias desaparecem; as línguas acabam-se; o conhecimento passa."
        },
        {
          "num": 9,
          "text": "Pois tanto as nossas profecias como o nosso conhecimento são imperfeitos."
        },
        {
          "num": 10,
          "text": "Quando chegar aquilo que é perfeito, tudo o que é imperfeito desaparece."
        },
        {
          "num": 11,
          "text": "Quando eu era criança, falava como criança, sentia como criança e pensava como criança. Depois tornei-me adulto e deixei o modo de ser de criança."
        },
        {
          "num": 12,
          "text": "Agora vemos as coisas como num espelho e de maneira confusa. Naquele dia, iremos vê-las frente a frente. Agora o meu conhecimento é imperfeito, mas naquele dia vou conhecer como Deus me conhece a mim."
        },
        {
          "num": 13,
          "text": "Agora existem três coisas: fé, esperança e amor. Mas a mais importante é o amor."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Eu poderia falar todas as línguas que são faladas na terra e até no céu, mas, se não tivesse amor, as minhas palavras seriam como o som de um gongo ou como o barulho de um sino."
        },
        {
          "num": 2,
          "text": "Poderia ter o dom de anunciar mensagens de Deus, ter todo o conhecimento, entender todos os segredos e ter tanta fé, que até poderia tirar as montanhas do seu lugar, mas, se não tivesse amor, eu não seria nada."
        },
        {
          "num": 3,
          "text": "Poderia dar tudo o que tenho e até mesmo entregar o meu corpo para ser queimado, mas, se eu não tivesse amor, isso não me adiantaria nada."
        },
        {
          "num": 4,
          "text": "Quem ama é paciente e bondoso. Quem ama não é ciumento, nem orgulhoso, nem vaidoso."
        },
        {
          "num": 5,
          "text": "Quem ama não é grosseiro nem egoísta; não fica irritado, nem guarda mágoas."
        },
        {
          "num": 6,
          "text": "Quem ama não fica alegre quando alguém faz uma coisa errada, mas se alegra quando alguém faz o que é certo."
        },
        {
          "num": 7,
          "text": "Quem ama nunca desiste, porém suporta tudo com fé, esperança e paciência."
        },
        {
          "num": 8,
          "text": "O amor é eterno. Existem mensagens espirituais, porém elas durarão pouco. Existe o dom de falar em línguas estranhas, mas acabará logo. Existe o conhecimento, mas também terminará."
        },
        {
          "num": 9,
          "text": "Pois os nossos dons de conhecimento e as nossas mensagens espirituais são imperfeitos."
        },
        {
          "num": 10,
          "text": "Mas, quando vier o que é perfeito, então o que é imperfeito desaparecerá."
        },
        {
          "num": 11,
          "text": "Quando eu era criança, falava como criança, sentia como criança e pensava como criança. Agora que sou adulto, parei de agir como criança."
        },
        {
          "num": 12,
          "text": "O que agora vemos é como uma imagem imperfeita num espelho embaçado, mas depois veremos face a face. Agora o meu conhecimento é imperfeito, mas depois conhecerei perfeitamente, assim como sou conhecido por Deus."
        },
        {
          "num": 13,
          "text": "Portanto, agora existem estas três coisas: a fé, a esperança e o amor. Porém a maior delas é o amor."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Ainda que eu fale as línguas dos homens e dos anjos, se não tiver amor, serei como o bronze que soa ou como o címbalo que retine."
        },
        {
          "num": 2,
          "text": "Ainda que eu tenha o dom de profetizar e conheça todos os mistérios e toda a ciência; ainda que eu tenha tamanha fé, a ponto de transportar montes, se não tiver amor, nada serei."
        },
        {
          "num": 3,
          "text": "E ainda que eu distribua todos os meus bens entre os pobres e ainda que entregue o meu próprio corpo para ser queimado, se não tiver amor, nada disso me aproveitará."
        },
        {
          "num": 4,
          "text": "O amor é paciente, é benigno; o amor não arde em ciúmes, não se ufana, não se ensoberbece,"
        },
        {
          "num": 5,
          "text": "não se conduz inconvenientemente, não procura os seus interesses, não se exaspera, não se ressente do mal;"
        },
        {
          "num": 6,
          "text": "não se alegra com a injustiça, mas regozija-se com a verdade;"
        },
        {
          "num": 7,
          "text": "tudo sofre, tudo crê, tudo espera, tudo suporta."
        },
        {
          "num": 8,
          "text": "O amor jamais acaba; mas, havendo profecias, desaparecerão; havendo línguas, cessarão; havendo ciência, passará;"
        },
        {
          "num": 9,
          "text": "porque, em parte, conhecemos e, em parte, profetizamos."
        },
        {
          "num": 10,
          "text": "Quando, porém, vier o que é perfeito, então, o que é em parte será aniquilado."
        },
        {
          "num": 11,
          "text": "Quando eu era menino, falava como menino, sentia como menino, pensava como menino; quando cheguei a ser homem, desisti das coisas próprias de menino."
        },
        {
          "num": 12,
          "text": "Porque, agora, vemos como em espelho, obscuramente; então, veremos face a face. Agora, conheço em parte; então, conhecerei como também sou conhecido."
        },
        {
          "num": 13,
          "text": "Agora, pois, permanecem a fé, a esperança e o amor, estes três; porém o maior destes é o amor."
        }
      ]
    }
  },
  "fl-4": {
    "book": "Filipenses",
    "chapter": 4,
    "title": "Alegria e a Paz de Deus",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Portanto, meus queridos irmãos , de quem tenho tantas saudades, vocês que são a minha alegria e o meu prémio, continuem assim firmes no Senhor."
        },
        {
          "num": 2,
          "text": "Peço a Evódia e a Síntique que vivam em harmonia, segundo a vontade do Senhor."
        },
        {
          "num": 3,
          "text": "E peço-te a ti, meu fiel companheiro , que as ajudes. Pois elas lutaram ao meu lado na pregação do evangelho , juntamente com Clemente e todos os meus companheiros de trabalho, que têm os seus nomes escritos no livro da vida."
        },
        {
          "num": 4,
          "text": "Alegrem-se sempre no Senhor. Repito, alegrem-se nele."
        },
        {
          "num": 5,
          "text": "Sejam amáveis para toda a gente. O Senhor virá em breve."
        },
        {
          "num": 6,
          "text": "Não se aflijam com coisa nenhuma, mas em todas as orações peçam a Deus aquilo de que precisam, com espírito de gratidão."
        },
        {
          "num": 7,
          "text": "E a paz de Deus, que vai mais além do que nós podemos entender, guardará os vossos corações e os vossos pensamentos em união com Cristo Jesus."
        },
        {
          "num": 8,
          "text": "Por último, meus irmãos, prestem atenção ao que é verdadeiro, honesto, digno, puro , amável, ao que tem boa fama, ao que é virtuoso e digno de louvor."
        },
        {
          "num": 9,
          "text": "Ponham em prática o que aprenderam de mim, o que me ouviram e viram fazer, e estará convosco o Deus da paz. Agradecimentos"
        },
        {
          "num": 10,
          "text": "Muito me alegrei no Senhor por me terem manifestado novamente sentimentos de carinho. Não quero dizer que eu pense que me tivessem esquecido, mas não tinham tido ocasião de se manifestarem."
        },
        {
          "num": 11,
          "text": "Não digo isto por precisar de alguma coisa, pois aprendi a contentar-me com o que tenho."
        },
        {
          "num": 12,
          "text": "Sei viver na pobreza e também na abundância. Aprendi a viver em toda e qualquer situação: a ter fartura e a ter fome, a ter em abundância e a não ter o suficiente."
        },
        {
          "num": 13,
          "text": "Posso enfrentar todas as dificuldades naquele que me fortalece."
        },
        {
          "num": 14,
          "text": "Contudo, fizeram bem em compartilhar as minhas dificuldades."
        },
        {
          "num": 15,
          "text": "Irmãos filipenses, bem sabem que no início da pregação do evangelho , quando parti da Macedónia, vocês foram a única igreja a ajudar-me. Compartilharam comigo no dar e no receber."
        },
        {
          "num": 16,
          "text": "Por mais que uma vez, quando eu estava em Tessalónica, me enviaram ajuda para as minhas necessidades."
        },
        {
          "num": 17,
          "text": "Não é que eu procure ofertas, mas desejo que seja acrescentado o mérito à vossa recompensa."
        },
        {
          "num": 18,
          "text": "Eu possuo tudo e em abundância. Agora que recebi tudo o que me enviaram por meio de Epafrodito, tenho mais do que o necessário. Essa oferta foi como o perfume de um sacrifício que Deus aceita e lhe agrada."
        },
        {
          "num": 19,
          "text": "O meu Deus há de conceder-vos com largueza tudo aquilo de que precisarem, segundo a sua riqueza gloriosa em Cristo Jesus."
        },
        {
          "num": 20,
          "text": "Glória a Deus, nosso Pai , para sempre. Ámen . Saudações finais"
        },
        {
          "num": 21,
          "text": "Saudações a todos os santos em Cristo Jesus. Os irmãos que estão comigo mandam-vos saudades."
        },
        {
          "num": 22,
          "text": "Todos, especialmente os do palácio do imperador , vos enviam cumprimentos."
        },
        {
          "num": 23,
          "text": "Que a graça do Senhor Jesus Cristo esteja convosco."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Meus queridos irmãos, sinto muitas saudades de vocês. Vocês me fazem tão feliz, e eu me orgulho muito de vocês! Portanto, continuem todos firmes, vivendo unidos com o Senhor."
        },
        {
          "num": 2,
          "text": "Evódia e Síntique, peço, por favor, que procurem viver bem uma com a outra, como irmãs na fé."
        },
        {
          "num": 3,
          "text": "E a você, meu fiel companheiro de trabalho, peço que ajude essas duas irmãs. Pois elas, junto com Clemente e todos os outros meus companheiros, trabalharam muito para espalhar o evangelho. Os nomes deles estão no Livro da Vida, que pertence a Deus."
        },
        {
          "num": 4,
          "text": "Tenham sempre alegria, unidos com o Senhor! Repito: tenham alegria!"
        },
        {
          "num": 5,
          "text": "Sejam amáveis com todos. O Senhor virá logo."
        },
        {
          "num": 6,
          "text": "Não se preocupem com nada, mas em todas as orações peçam a Deus o que vocês precisam e orem sempre com o coração agradecido."
        },
        {
          "num": 7,
          "text": "E a paz de Deus, que ninguém consegue entender, guardará o coração e a mente de vocês, pois vocês estão unidos com Cristo Jesus."
        },
        {
          "num": 8,
          "text": "Por último, meus irmãos, encham a mente de vocês com tudo o que é bom e merece elogios, isto é, tudo o que é verdadeiro, digno, correto, puro, agradável e decente."
        },
        {
          "num": 9,
          "text": "Ponham em prática o que vocês receberam e aprenderam de mim, tanto com as minhas palavras como com as minhas ações. E o Deus que nos dá a paz estará com vocês."
        },
        {
          "num": 10,
          "text": "Na minha vida em união com o Senhor, fiquei muito alegre porque vocês mostraram de novo o cuidado que têm por mim. Não quero dizer que vocês tivessem deixado de cuidar de mim; é que não tiveram oportunidade de mostrar esse cuidado."
        },
        {
          "num": 11,
          "text": "Não estou dizendo isso por me sentir abandonado, pois aprendi a estar satisfeito com o que tenho."
        },
        {
          "num": 12,
          "text": "Sei o que é estar necessitado e sei também o que é ter mais do que é preciso. Aprendi o segredo de me sentir contente em todo lugar e em qualquer situação, quer esteja alimentado ou com fome, quer tenha muito ou tenha pouco."
        },
        {
          "num": 13,
          "text": "Com a força que Cristo me dá, posso enfrentar qualquer situação."
        },
        {
          "num": 14,
          "text": "Mesmo assim vocês fizeram bem em me ajudar nas minhas aflições."
        },
        {
          "num": 15,
          "text": "Vocês, filipenses, sabem muito bem que, quando eu saí da província da Macedônia, nos primeiros tempos em que anunciei o evangelho, a igreja de vocês foi a única que me ajudou. Vocês foram os únicos que participaram dos meus lucros e dos meus prejuízos."
        },
        {
          "num": 16,
          "text": "Em Tessalônica, mais de uma vez precisei de auxílio, e vocês o enviaram."
        },
        {
          "num": 17,
          "text": "Não é que eu só pense em receber ajuda. Pelo contrário, quero ver mais lucros acrescentados à conta de vocês."
        },
        {
          "num": 18,
          "text": "Aqui está o meu recibo de tudo o que vocês me enviaram e que foi mais do que o necessário. Tenho tudo o que preciso, especialmente agora que Epafrodito me trouxe as coisas que vocês mandaram, as quais são como um perfume suave oferecido a Deus, um sacrifício que ele aceita e que lhe agrada."
        },
        {
          "num": 19,
          "text": "E o meu Deus, de acordo com as gloriosas riquezas que ele tem para oferecer por meio de Cristo Jesus, lhes dará tudo o que vocês precisam."
        },
        {
          "num": 20,
          "text": "Ao Deus e Pai seja dada glória para todo o sempre! Amém!"
        },
        {
          "num": 21,
          "text": "Saudações a todo o povo de Deus que pertence a Cristo Jesus. Os irmãos que estão aqui comigo mandam saudações para vocês."
        },
        {
          "num": 22,
          "text": "Todo o povo de Deus daqui manda saudações, especialmente os do palácio do Imperador."
        },
        {
          "num": 23,
          "text": "Que a graça do Senhor Jesus Cristo esteja com todos vocês!"
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Portanto, meus irmãos, amados e mui saudosos, minha alegria e coroa, sim, amados, permanecei, deste modo, firmes no Senhor."
        },
        {
          "num": 2,
          "text": "Rogo a Evódia e rogo a Síntique pensem concordemente, no Senhor."
        },
        {
          "num": 3,
          "text": "A ti, fiel companheiro de jugo, também peço que as auxilies, pois juntas se esforçaram comigo no evangelho, também com Clemente e com os demais cooperadores meus, cujos nomes se encontram no Livro da Vida."
        },
        {
          "num": 4,
          "text": "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos."
        },
        {
          "num": 5,
          "text": "Seja a vossa moderação conhecida de todos os homens. Perto está o Senhor."
        },
        {
          "num": 6,
          "text": "Não andeis ansiosos de coisa alguma; em tudo, porém, sejam conhecidas, diante de Deus, as vossas petições, pela oração e pela súplica, com ações de graças."
        },
        {
          "num": 7,
          "text": "E a paz de Deus, que excede todo o entendimento, guardará o vosso coração e a vossa mente em Cristo Jesus."
        },
        {
          "num": 8,
          "text": "Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é respeitável, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se alguma virtude há e se algum louvor existe, seja isso o que ocupe o vosso pensamento."
        },
        {
          "num": 9,
          "text": "O que também aprendestes, e recebestes, e ouvistes, e vistes em mim, isso praticai; e o Deus da paz será convosco."
        },
        {
          "num": 10,
          "text": "Alegrei-me, sobremaneira, no Senhor porque, agora, uma vez mais, renovastes a meu favor o vosso cuidado; o qual também já tínheis antes, mas vos faltava oportunidade."
        },
        {
          "num": 11,
          "text": "Digo isto, não por causa da pobreza, porque aprendi a viver contente em toda e qualquer situação."
        },
        {
          "num": 12,
          "text": "Tanto sei estar humilhado como também ser honrado; de tudo e em todas as circunstâncias, já tenho experiência, tanto de fartura como de fome; assim de abundância como de escassez;"
        },
        {
          "num": 13,
          "text": "tudo posso naquele que me fortalece."
        },
        {
          "num": 14,
          "text": "Todavia, fizestes bem, associando-vos na minha tribulação."
        },
        {
          "num": 15,
          "text": "E sabeis também vós, ó filipenses, que, no início do evangelho, quando parti da Macedônia, nenhuma igreja se associou comigo no tocante a dar e receber, senão unicamente vós outros;"
        },
        {
          "num": 16,
          "text": "porque até para Tessalônica mandastes não somente uma vez, mas duas, o bastante para as minhas necessidades."
        },
        {
          "num": 17,
          "text": "Não que eu procure o donativo, mas o que realmente me interessa é o fruto que aumente o vosso crédito."
        },
        {
          "num": 18,
          "text": "Recebi tudo e tenho abundância; estou suprido, desde que Epafrodito me passou às mãos o que me veio de vossa parte como aroma suave, como sacrifício aceitável e aprazível a Deus."
        },
        {
          "num": 19,
          "text": "E o meu Deus, segundo a sua riqueza em glória, há de suprir, em Cristo Jesus, cada uma de vossas necessidades."
        },
        {
          "num": 20,
          "text": "Ora, a nosso Deus e Pai seja a glória pelos séculos dos séculos. Amém!"
        },
        {
          "num": 21,
          "text": "Saudai cada um dos santos em Cristo Jesus. Os irmãos que se acham comigo vos saúdam."
        },
        {
          "num": 22,
          "text": "Todos os santos vos saúdam, especialmente os da casa de César."
        },
        {
          "num": 23,
          "text": "A graça do Senhor Jesus Cristo seja com o vosso espírito."
        }
      ]
    }
  },
  "tg-1": {
    "book": "Tiago",
    "chapter": 1,
    "title": "A Fé Provada e Praticantes da Palavra",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Da parte de Tiago, servo de Deus e do Senhor Jesus Cristo , às doze tribos do povo de Deus dispersas pelo mundo : saudações! Fé e sabedoria"
        },
        {
          "num": 2,
          "text": "Meus irmãos , devem sentir-se profundamente felizes ao terem de passar por várias provações."
        },
        {
          "num": 3,
          "text": "Pois sabem que uma fé assim provada dá como fruto a perseverança."
        },
        {
          "num": 4,
          "text": "Procurem ser perseverantes até ao fim para chegarem a ser completamente perfeitos, sem faltar nada."
        },
        {
          "num": 5,
          "text": "Se alguém não tem sabedoria suficiente, peça-a a Deus, que a dá a todos de graça, sem humilhar ninguém, e ser-lhe-á dada."
        },
        {
          "num": 6,
          "text": "Mas aquele que pede deve pedir com fé, sem duvidar. Aquele que duvida é como as ondas do mar, levadas pelo vento."
        },
        {
          "num": 7,
          "text": "Esse nem pense que há de conseguir alguma coisa do Senhor,"
        },
        {
          "num": 8,
          "text": "pois é um indeciso e pouco seguro em tudo o que faz. Pobres e ricos"
        },
        {
          "num": 9,
          "text": "Aquele irmão que for de condição humilde deve sentir-se orgulhoso por Deus o engrandecer,"
        },
        {
          "num": 10,
          "text": "e o que for rico deve sentir-se orgulhoso por Deus o humilhar, pois sabe que a sua vida é breve como a flor do campo."
        },
        {
          "num": 11,
          "text": "Quando o Sol se levanta e vem o calor, seca a planta, a sua flor murcha e a beleza do seu aspeto desaparece . Assim também o rico há de murchar na sua ambição de riquezas. Resistência às tentações"
        },
        {
          "num": 12,
          "text": "Feliz daquele que resiste às tentações, porque depois de ter sido provado recebe como prémio a vida eterna que Deus prometeu aos que o amam."
        },
        {
          "num": 13,
          "text": "Mas quando alguém for tentado não diga: «Foi Deus que me mandou esta tentação.» Porque Deus nem é tentado por nenhum mal, nem é causador de tentação para ninguém."
        },
        {
          "num": 14,
          "text": "Os maus desejos é que são motivo de tentação para cada um, seduzindo-o e desviando-o do caminho certo."
        },
        {
          "num": 15,
          "text": "Deste modo, o mau desejo gera o pecado e o pecado, como consequência final, produz a morte."
        },
        {
          "num": 16,
          "text": "Não se deixem enganar, meus queridos irmãos :"
        },
        {
          "num": 17,
          "text": "tudo o que recebemos de bom e perfeito vem do céu, do Pai , fonte de toda a luz. Nele não há mudança nem sombra alguma."
        },
        {
          "num": 18,
          "text": "Pela sua própria decisão, trouxe-nos à luz da vida por meio da sua palavra de verdade, para sermos os primeiros frutos do seu mundo novo. Palavras e obras"
        },
        {
          "num": 19,
          "text": "Gravem bem isto na memória, meus queridos irmãos ! Cada um deve estar sempre pronto para ouvir; mas não deve precipitar-se no falar, nem irritar-se com facilidade ."
        },
        {
          "num": 20,
          "text": "Pois quem se irrita não faz a vontade de Deus."
        },
        {
          "num": 21,
          "text": "Por isso, ponham de lado toda a espécie de impureza e qualquer resto de maldade e recebam com humildade a semente da palavra de Deus que tem poder para vos salvar a vida."
        },
        {
          "num": 22,
          "text": "Ponham a palavra de Deus em prática e não se contentem com ouvi-la, porque desse modo enganam-se a si mesmos."
        },
        {
          "num": 23,
          "text": "Aquele que se contenta com ouvir e não põe em prática a palavra é como alguém que se vai ver ao espelho."
        },
        {
          "num": 24,
          "text": "Vê a sua cara mas, mal se volta, esquece-se logo de como era."
        },
        {
          "num": 25,
          "text": "Pelo contrário, aquele que presta atenção à verdadeira lei , a da liberdade, e que continua a fazer caso dela, não é como um simples ouvinte que se esquece logo. É alguém que ouve e pratica. E assim é que ele encontrará a felicidade."
        },
        {
          "num": 26,
          "text": "Se alguém acha que é uma pessoa muito religiosa, mas não domina a sua língua, está completamente enganado: a sua religião é inútil."
        },
        {
          "num": 27,
          "text": "A pura e verdadeira religião diante de Deus, nosso Pai, é esta: cuidar dos órfãos e das viúvas nas suas dificuldades e afastar-se da corrupção do mundo."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Eu, Tiago, servo de Deus e do Senhor Jesus Cristo, envio saudações a todo o povo de Deus espalhado pelo mundo inteiro."
        },
        {
          "num": 2,
          "text": "Meus irmãos, sintam-se felizes quando passarem por todo tipo de aflições."
        },
        {
          "num": 3,
          "text": "Pois vocês sabem que, quando a sua fé vence essas provações, ela produz perseverança."
        },
        {
          "num": 4,
          "text": "Que essa perseverança seja perfeita a fim de que vocês sejam maduros e corretos, não falhando em nada!"
        },
        {
          "num": 5,
          "text": "Mas, se alguém tem falta de sabedoria, peça a Deus, e ele a dará porque é generoso e dá com bondade a todos."
        },
        {
          "num": 6,
          "text": "Porém peçam com fé e não duvidem de modo nenhum, pois quem duvida é como as ondas do mar, que o vento leva de um lado para o outro."
        },
        {
          "num": 7,
          "text": "Quem é assim não pense que vai receber alguma coisa do Senhor,"
        },
        {
          "num": 8,
          "text": "pois não tem firmeza e nunca sabe o que deve fazer."
        },
        {
          "num": 9,
          "text": "O irmão que é pobre deve ficar contente quando Deus faz com que melhore de vida;"
        },
        {
          "num": 10,
          "text": "e quem é rico deve sentir o mesmo quando Deus faz com que piore de vida. Pois quem é rico desaparecerá como a flor da erva do campo."
        },
        {
          "num": 11,
          "text": "Quando o sol brilha forte, e o seu calor queima a planta, aí a flor cai, e a sua beleza é destruída. Do mesmo modo, quem é rico será destruído no meio dos seus negócios."
        },
        {
          "num": 12,
          "text": "Feliz é aquele que nas aflições continua fiel! Porque, depois de sair aprovado dessas aflições, receberá como prêmio a vida que Deus promete aos que o amam."
        },
        {
          "num": 13,
          "text": "Quando alguém for tentado, não diga: “Esta tentação vem de Deus.” Pois Deus não pode ser tentado pelo mal e ele mesmo não tenta ninguém."
        },
        {
          "num": 14,
          "text": "Mas as pessoas são tentadas quando são atraídas e enganadas pelos seus próprios maus desejos."
        },
        {
          "num": 15,
          "text": "Então esses desejos fazem com que o pecado nasça, e o pecado, quando já está maduro, produz a morte."
        },
        {
          "num": 16,
          "text": "Não se enganem, meus queridos irmãos."
        },
        {
          "num": 17,
          "text": "Tudo de bom que recebemos e tudo o que é perfeito vêm do céu, vêm de Deus, o Criador das luzes do céu. Ele não muda, nem varia de posição, o que causaria a escuridão."
        },
        {
          "num": 18,
          "text": "Pela sua própria vontade ele fez com que nós nascêssemos, por meio da palavra da verdade, a fim de ocuparmos o primeiro lugar entre todas as suas criaturas."
        },
        {
          "num": 19,
          "text": "Lembrem disto, meus queridos irmãos: cada um esteja pronto para ouvir, mas demore para falar e ficar com raiva."
        },
        {
          "num": 20,
          "text": "Porque a raiva humana não produz o que Deus aprova."
        },
        {
          "num": 21,
          "text": "Portanto, deixem todo costume imoral e toda má conduta. Aceitem com humildade a mensagem que Deus planta no coração de vocês, a qual pode salvá-los."
        },
        {
          "num": 22,
          "text": "Não se enganem; não sejam apenas ouvintes dessa mensagem, mas a ponham em prática."
        },
        {
          "num": 23,
          "text": "Porque aquele que ouve a mensagem e não a põe em prática é como uma pessoa que olha no espelho e vê como é."
        },
        {
          "num": 24,
          "text": "Dá uma boa olhada, depois vai embora e logo esquece a sua aparência."
        },
        {
          "num": 25,
          "text": "O evangelho é a lei perfeita que dá liberdade às pessoas. Se alguém examina bem essa lei e não a esquece, mas a põe em prática, Deus vai abençoar tudo o que essa pessoa fizer."
        },
        {
          "num": 26,
          "text": "Alguém está pensando que é religioso? Se não souber controlar a língua, a sua religião não vale nada, e ele está enganando a si mesmo."
        },
        {
          "num": 27,
          "text": "Para Deus, o Pai, a religião pura e verdadeira é esta: ajudar os órfãos e as viúvas nas suas aflições e não se manchar com as coisas más deste mundo."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Tiago, servo de Deus e do Senhor Jesus Cristo, às doze tribos que se encontram na Dispersão, saudações."
        },
        {
          "num": 2,
          "text": "Meus irmãos, tende por motivo de toda alegria o passardes por várias provações,"
        },
        {
          "num": 3,
          "text": "sabendo que a provação da vossa fé, uma vez confirmada, produz perseverança."
        },
        {
          "num": 4,
          "text": "Ora, a perseverança deve ter ação completa, para que sejais perfeitos e íntegros, em nada deficientes."
        },
        {
          "num": 5,
          "text": "Se, porém, algum de vós necessita de sabedoria, peça-a a Deus, que a todos dá liberalmente e nada lhes impropera; e ser-lhe-á concedida."
        },
        {
          "num": 6,
          "text": "Peça-a, porém, com fé, em nada duvidando; pois o que duvida é semelhante à onda do mar, impelida e agitada pelo vento."
        },
        {
          "num": 7,
          "text": "Não suponha esse homem que alcançará do Senhor alguma coisa;"
        },
        {
          "num": 8,
          "text": "homem de ânimo dobre, inconstante em todos os seus caminhos."
        },
        {
          "num": 9,
          "text": "O irmão, porém, de condição humilde glorie-se na sua dignidade,"
        },
        {
          "num": 10,
          "text": "e o rico, na sua insignificância, porque ele passará como a flor da erva."
        },
        {
          "num": 11,
          "text": "Porque o sol se levanta com seu ardente calor, e a erva seca, e a sua flor cai, e desaparece a formosura do seu aspecto; assim também se murchará o rico em seus caminhos."
        },
        {
          "num": 12,
          "text": "Bem-aventurado o homem que suporta, com perseverança, a provação; porque, depois de ter sido aprovado, receberá a coroa da vida, a qual o Senhor prometeu aos que o amam."
        },
        {
          "num": 13,
          "text": "Ninguém, ao ser tentado, diga: Sou tentado por Deus; porque Deus não pode ser tentado pelo mal e ele mesmo a ninguém tenta."
        },
        {
          "num": 14,
          "text": "Ao contrário, cada um é tentado pela sua própria cobiça, quando esta o atrai e seduz."
        },
        {
          "num": 15,
          "text": "Então, a cobiça, depois de haver concebido, dá à luz o pecado; e o pecado, uma vez consumado, gera a morte."
        },
        {
          "num": 16,
          "text": "Não vos enganeis, meus amados irmãos."
        },
        {
          "num": 17,
          "text": "Toda boa dádiva e todo dom perfeito são lá do alto, descendo do Pai das luzes, em quem não pode existir variação ou sombra de mudança."
        },
        {
          "num": 18,
          "text": "Pois, segundo o seu querer, ele nos gerou pela palavra da verdade, para que fôssemos como que primícias das suas criaturas."
        },
        {
          "num": 19,
          "text": "Sabeis estas coisas, meus amados irmãos. Todo homem, pois, seja pronto para ouvir, tardio para falar, tardio para se irar."
        },
        {
          "num": 20,
          "text": "Porque a ira do homem não produz a justiça de Deus."
        },
        {
          "num": 21,
          "text": "Portanto, despojando-vos de toda impureza e acúmulo de maldade, acolhei, com mansidão, a palavra em vós implantada, a qual é poderosa para salvar a vossa alma."
        },
        {
          "num": 22,
          "text": "Tornai-vos, pois, praticantes da palavra e não somente ouvintes, enganando-vos a vós mesmos."
        },
        {
          "num": 23,
          "text": "Porque, se alguém é ouvinte da palavra e não praticante, assemelha-se ao homem que contempla, num espelho, o seu rosto natural;"
        },
        {
          "num": 24,
          "text": "pois a si mesmo se contempla, e se retira, e para logo se esquece de como era a sua aparência."
        },
        {
          "num": 25,
          "text": "Mas aquele que considera, atentamente, na lei perfeita, lei da liberdade, e nela persevera, não sendo ouvinte negligente, mas operoso praticante, esse será bem-aventurado no que realizar."
        },
        {
          "num": 26,
          "text": "Se alguém supõe ser religioso, deixando de refrear a língua, antes, enganando o próprio coração, a sua religião é vã."
        },
        {
          "num": 27,
          "text": "A religião pura e sem mácula, para com o nosso Deus e Pai, é esta: visitar os órfãos e as viúvas nas suas tribulações e a si mesmo guardar-se incontaminado do mundo."
        }
      ]
    }
  },
  "ap-21": {
    "book": "Apocalipse",
    "chapter": 21,
    "title": "O Novo Céu e a Nova Terra",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "Vi então um novo céu e uma nova Terra ; de facto o primeiro céu e a primeira Terra desapareceram e o mar já não existe ."
        },
        {
          "num": 2,
          "text": "E vi descer do Céu, de junto de Deus, a cidade santa, a nova Jerusalém . Vinha linda como uma noiva que se prepara para ir ao encontro do noivo."
        },
        {
          "num": 3,
          "text": "E ouvi uma voz forte que vinha do lado do trono: «Esta é a morada de Deus junto dos homens. Ele habitará com eles e eles serão o seu povo. É este Deus que estará com eles."
        },
        {
          "num": 4,
          "text": "Ele enxugará todas as lágrimas dos seus olhos e já não haverá mais morte nem luto nem pranto nem dor porque as primeiras coisas desapareceram.»"
        },
        {
          "num": 5,
          "text": "E o que estava sentado no trono disse: «Agora faço tudo novo .» E acrescentou: «Escreve que estas palavras são verdadeiras e dignas de confiança.»"
        },
        {
          "num": 6,
          "text": "E disse-me ainda: «É um facto. Eu sou o Alfa e o Ómega , o princípio e o fim. Ao que tem sede dou-lhe a beber de graça da fonte das águas vivas ."
        },
        {
          "num": 7,
          "text": "Aquele que vencer receberá estas coisas em herança. Eu serei o seu Deus e ele será o meu filho."
        },
        {
          "num": 8,
          "text": "Mas todos os cobardes, infiéis, depravados, assassinos, desonestos, feiticeiros, idólatras e todos os mentirosos terão o seu lugar no lago de enxofre de fogo, que é a segunda morte .» A nova Jerusalém"
        },
        {
          "num": 9,
          "text": "Um dos sete anjos que tinham as sete taças, cheias com os sete últimos castigos aproximou-se de mim e disse: «Vem cá! Vou mostrar-te a noiva, a esposa do Cordeiro .»"
        },
        {
          "num": 10,
          "text": "Transportou-me em espírito a uma montanha grande e alta e mostrou-me a cidade santa, Jerusalém, que descia do céu, de junto de Deus."
        },
        {
          "num": 11,
          "text": "Tinha a glória de Deus e brilhava como uma pedra preciosa, parecida com uma pedra de jaspe cristalino."
        },
        {
          "num": 12,
          "text": "A cidade estava rodeada de uma muralha grande e alta com doze portas. Nas portas tinha doze anjos e em cada porta estava escrito o nome de uma das tribos do povo de Israel."
        },
        {
          "num": 13,
          "text": "Três portas davam para o Oriente, outras três para o Norte, outras três para o Sul e outras três para o Ocidente."
        },
        {
          "num": 14,
          "text": "As muralhas tinham doze alicerces e em cada um estava escrito um dos nomes dos doze apóstolos do Cordeiro."
        },
        {
          "num": 15,
          "text": "O anjo que me falava tinha uma régua de ouro para medir a cidade, as portas e a muralha."
        },
        {
          "num": 16,
          "text": "A planta da cidade era quadrada pois tinha tanto de comprimento como de largura. Mediu a cidade com a régua e a cidade tinha doze mil estádios de comprimento e o mesmo de largura e de altura ."
        },
        {
          "num": 17,
          "text": "Mediu também a muralha. Segundo a medida dos homens que o anjo usava, a muralha tinha cento e quarenta e quatro braçadas de altura."
        },
        {
          "num": 18,
          "text": "Os muros eram de jaspe e a cidade estava construída com ouro puro, semelhante ao puro cristal."
        },
        {
          "num": 19,
          "text": "Os alicerces da muralha da cidade estavam decorados com toda a espécie de pedras preciosas: o primeiro com jaspe, o segundo com safira, o terceiro com calcedónia, o quarto com esmeralda,"
        },
        {
          "num": 20,
          "text": "o quinto com ónix, o sexto com sardónica, o sétimo com crisólito, o oitavo com água-marinha, o nono com topázio, o décimo com ágata, o décimo primeiro com jacinto, o décimo segundo com ametista."
        },
        {
          "num": 21,
          "text": "As doze portas eram doze pérolas e cada porta feita de uma só pérola. A praça central da cidade era de ouro puro, como se fosse vidro transparente."
        },
        {
          "num": 22,
          "text": "Não vi qualquer templo na cidade. O Senhor Deus, o Todo-Poderoso e o Cordeiro é que são o seu templo ."
        },
        {
          "num": 23,
          "text": "A cidade também não precisa do Sol ou da Lua para a alumiar. A glória de Deus ilumina-a e a sua lâmpada é o Cordeiro."
        },
        {
          "num": 24,
          "text": "As nações caminharão à luz daquela cidade e os reis da Terra hão de levar-lhe o seu esplendor."
        },
        {
          "num": 25,
          "text": "As portas da cidade nunca se hão de fechar, porque nela não haverá noite ."
        },
        {
          "num": 26,
          "text": "E ela há de receber o esplendor e a honra das nações."
        },
        {
          "num": 27,
          "text": "Nela não entrará nada de indigno nem adoradores de falsos deuses, nem mentirosos. Só lá entrarão os que estão inscritos no livro da vida do Cordeiro."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "Então vi um novo céu e uma nova terra. O primeiro céu e a primeira terra desapareceram, e o mar sumiu."
        },
        {
          "num": 2,
          "text": "E vi a Cidade Santa, a nova Jerusalém, que descia do céu. Ela vinha de Deus, enfeitada e preparada, vestida como uma noiva que vai se encontrar com o noivo."
        },
        {
          "num": 3,
          "text": "Ouvi uma voz forte que vinha do trono, a qual disse: — Agora a morada de Deus está entre os seres humanos! Deus vai morar com eles, e eles serão os povos dele. O próprio Deus estará com eles e será o Deus deles."
        },
        {
          "num": 4,
          "text": "Ele enxugará dos olhos deles todas as lágrimas. Não haverá mais morte, nem tristeza, nem choro, nem dor. As coisas velhas já passaram."
        },
        {
          "num": 5,
          "text": "Aquele que estava sentado no trono disse: — Agora faço novas todas as coisas! E também me disse: — Escreva isto, pois estas palavras são verdadeiras e merecem confiança."
        },
        {
          "num": 6,
          "text": "E continuou: — Tudo está feito! Eu sou o Alfa e o Ômega, o Princípio e o Fim. A quem tem sede darei água para beber, de graça, da fonte da água da vida."
        },
        {
          "num": 7,
          "text": "Aqueles que conseguirem a vitória receberão de mim este presente: eu serei o Deus deles, e eles serão meus filhos."
        },
        {
          "num": 8,
          "text": "Mas os covardes, os traidores, os que cometem pecados nojentos, os assassinos, os imorais, os que praticam a feitiçaria, os que adoram ídolos e todos os mentirosos, o lugar dessas pessoas é o lago onde queima o fogo e o enxofre, que é a segunda morte."
        },
        {
          "num": 9,
          "text": "Um dos sete anjos que tinham as sete taças cheias das últimas sete pragas veio e me disse: — Venha, e eu lhe mostrarei a Noiva, a Esposa do Cordeiro."
        },
        {
          "num": 10,
          "text": "Então o Espírito de Deus me dominou, e o anjo me levou para uma montanha grande e muito alta. Ele me mostrou Jerusalém, a Cidade Santa, que descia do céu e vinha de Deus,"
        },
        {
          "num": 11,
          "text": "brilhando com a glória de Deus. A cidade brilhava como uma pedra preciosa, como uma pedra de jaspe, clara como cristal."
        },
        {
          "num": 12,
          "text": "Ela era cercada por uma muralha muito alta e grande, com doze portões, guardados por doze anjos. Nos portões estavam escritos os nomes das doze tribos do povo de Israel."
        },
        {
          "num": 13,
          "text": "Havia três portões de cada lado: três ao norte, três ao sul, três a leste e três a oeste."
        },
        {
          "num": 14,
          "text": "A muralha da cidade estava construída sobre doze rochas, nas quais estavam escritos os nomes dos doze apóstolos do Cordeiro."
        },
        {
          "num": 15,
          "text": "O anjo que falou comigo levava consigo uma vara de ouro para medir a cidade, os seus portões e a muralha."
        },
        {
          "num": 16,
          "text": "A cidade era quadrada, pois o seu comprimento era igual à sua largura. O anjo mediu a cidade com a vara de ouro e viu que media dois mil e duzentos quilômetros. O seu comprimento, largura e altura eram iguais."
        },
        {
          "num": 17,
          "text": "O anjo mediu também a muralha e viu que tinha sessenta e quatro metros de largura, conforme as medidas comuns que o anjo estava usando."
        },
        {
          "num": 18,
          "text": "A muralha era de jaspe, e a própria cidade era de ouro puro, claro como vidro."
        },
        {
          "num": 19,
          "text": "As rochas do alicerce da muralha estavam enfeitadas de todo tipo de pedras preciosas. A primeira rocha estava enfeitada de jaspe; a segunda, de safira; a terceira, de ágata; a quarta, de esmeralda;"
        },
        {
          "num": 20,
          "text": "a quinta, de sardônica; a sexta, de sárdio; a sétima, de crisólito; a oitava, de berilo; a nona, de topázio; a décima, de crisópraso; a décima primeira, de jacinto; e a décima segunda, de ametista."
        },
        {
          "num": 21,
          "text": "Os doze portões são doze pérolas. E cada um desses portões era feito de uma só pérola. A rua principal era de ouro puro, claro como vidro."
        },
        {
          "num": 22,
          "text": "Não vi nenhum templo na cidade, pois o seu templo é o Senhor Deus, o Todo-Poderoso, e o Cordeiro."
        },
        {
          "num": 23,
          "text": "A cidade não precisa de sol nem de lua para a iluminarem, pois a glória de Deus brilha sobre ela, e o Cordeiro é o seu candelabro."
        },
        {
          "num": 24,
          "text": "Os povos do mundo andarão na luz dela, e os reis da terra vão lhe trazer as suas riquezas."
        },
        {
          "num": 25,
          "text": "Os portões da cidade estarão sempre abertos o dia inteiro. Não se fecharão porque ali não haverá noite."
        },
        {
          "num": 26,
          "text": "As nações vão trazer os seus tesouros e as suas riquezas para a cidade."
        },
        {
          "num": 27,
          "text": "Porém nela não entrará nada que seja impuro nem ninguém que faça coisas vergonhosas ou que conte mentiras. Entrarão na cidade somente as pessoas que têm o seu nome escrito no Livro da Vida, o qual pertence ao Cordeiro."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Vi novo céu e nova terra, pois o primeiro céu e a primeira terra passaram, e o mar já não existe."
        },
        {
          "num": 2,
          "text": "Vi também a cidade santa, a nova Jerusalém, que descia do céu, da parte de Deus, ataviada como noiva adornada para o seu esposo."
        },
        {
          "num": 3,
          "text": "Então, ouvi grande voz vinda do trono, dizendo: Eis o tabernáculo de Deus com os homens. Deus habitará com eles. Eles serão povos de Deus, e Deus mesmo estará com eles."
        },
        {
          "num": 4,
          "text": "E lhes enxugará dos olhos toda lágrima, e a morte já não existirá, já não haverá luto, nem pranto, nem dor, porque as primeiras coisas passaram."
        },
        {
          "num": 5,
          "text": "E aquele que está assentado no trono disse: Eis que faço novas todas as coisas. E acrescentou: Escreve, porque estas palavras são fiéis e verdadeiras."
        },
        {
          "num": 6,
          "text": "Disse-me ainda: Tudo está feito. Eu sou o Alfa e o Ômega, o Princípio e o Fim. Eu, a quem tem sede, darei de graça da fonte da água da vida."
        },
        {
          "num": 7,
          "text": "O vencedor herdará estas coisas, e eu lhe serei Deus, e ele me será filho."
        },
        {
          "num": 8,
          "text": "Quanto, porém, aos covardes, aos incrédulos, aos abomináveis, aos assassinos, aos impuros, aos feiticeiros, aos idólatras e a todos os mentirosos, a parte que lhes cabe será no lago que arde com fogo e enxofre, a saber, a segunda morte."
        },
        {
          "num": 9,
          "text": "Então, veio um dos sete anjos que têm as sete taças cheias dos últimos sete flagelos e falou comigo, dizendo: Vem, mostrar-te-ei a noiva, a esposa do Cordeiro;"
        },
        {
          "num": 10,
          "text": "e me transportou, em espírito, até a uma grande e elevada montanha e me mostrou a santa cidade, Jerusalém, que descia do céu, da parte de Deus,"
        },
        {
          "num": 11,
          "text": "a qual tem a glória de Deus. O seu fulgor era semelhante a uma pedra preciosíssima, como pedra de jaspe cristalina."
        },
        {
          "num": 12,
          "text": "Tinha grande e alta muralha, doze portas, e, junto às portas, doze anjos, e, sobre elas, nomes inscritos, que são os nomes das doze tribos dos filhos de Israel."
        },
        {
          "num": 13,
          "text": "Três portas se achavam a leste, três, ao norte, três, ao sul, e três, a oeste."
        },
        {
          "num": 14,
          "text": "A muralha da cidade tinha doze fundamentos, e estavam sobre estes os doze nomes dos doze apóstolos do Cordeiro."
        },
        {
          "num": 15,
          "text": "Aquele que falava comigo tinha por medida uma vara de ouro para medir a cidade, as suas portas e a sua muralha."
        },
        {
          "num": 16,
          "text": "A cidade é quadrangular, de comprimento e largura iguais. E mediu a cidade com a vara até doze mil estádios. O seu comprimento, largura e altura são iguais."
        },
        {
          "num": 17,
          "text": "Mediu também a sua muralha, cento e quarenta e quatro côvados, medida de homem, isto é, de anjo."
        },
        {
          "num": 18,
          "text": "A estrutura da muralha é de jaspe; também a cidade é de ouro puro, semelhante a vidro límpido."
        },
        {
          "num": 19,
          "text": "Os fundamentos da muralha da cidade estão adornados de toda espécie de pedras preciosas. O primeiro fundamento é de jaspe; o segundo, de safira; o terceiro, de calcedônia; o quarto, de esmeralda;"
        },
        {
          "num": 20,
          "text": "o quinto, de sardônio; o sexto, de sárdio; o sétimo, de crisólito; o oitavo, de berilo; o nono, de topázio; o décimo, de crisópraso; o undécimo, de jacinto; e o duodécimo, de ametista."
        },
        {
          "num": 21,
          "text": "As doze portas são doze pérolas, e cada uma dessas portas, de uma só pérola. A praça da cidade é de ouro puro, como vidro transparente."
        },
        {
          "num": 22,
          "text": "Nela, não vi santuário, porque o seu santuário é o Senhor, o Deus Todo-Poderoso, e o Cordeiro."
        },
        {
          "num": 23,
          "text": "A cidade não precisa nem do sol, nem da lua, para lhe darem claridade, pois a glória de Deus a iluminou, e o Cordeiro é a sua lâmpada."
        },
        {
          "num": 24,
          "text": "As nações andarão mediante a sua luz, e os reis da terra lhe trazem a sua glória."
        },
        {
          "num": 25,
          "text": "As suas portas nunca jamais se fecharão de dia, porque, nela, não haverá noite."
        },
        {
          "num": 26,
          "text": "E lhe trarão a glória e a honra das nações."
        },
        {
          "num": 27,
          "text": "Nela, nunca jamais penetrará coisa alguma contaminada, nem o que pratica abominação e mentira, mas somente os inscritos no Livro da Vida do Cordeiro."
        }
      ]
    }
  },
  "ap-22": {
    "book": "Apocalipse",
    "chapter": 22,
    "title": "O Rio da Água da Vida e a Vinda do Senhor",
    "versions": {
      "bpt": [
        {
          "num": 1,
          "text": "O anjo mostrou-me depois o rio das águas vivas que brilhava como cristal e que saía do trono de Deus e do Cordeiro ."
        },
        {
          "num": 2,
          "text": "No meio da praça da cidade e de cada lado do rio crescia a árvore da vida que dava frutos doze vezes por ano, em cada mês o seu fruto; e as folhas da árvore servem de remédio para toda a gente."
        },
        {
          "num": 3,
          "text": "E nunca mais haverá maldição de Deus. E na cidade estará o trono de Deus e do Cordeiro e os seus servos hão de prestar-lhe culto."
        },
        {
          "num": 4,
          "text": "Hão de vê-lo frente a frente e o seu nome estará gravado na fronte deles."
        },
        {
          "num": 5,
          "text": "Não vai haver mais noite, nem eles terão necessidade da luz da lâmpada ou do Sol porque o Senhor Deus será a sua luz e hão de reinar para todo o sempre. A vinda de Jesus"
        },
        {
          "num": 6,
          "text": "Depois o anjo disse-me: «Estas palavras são verdadeiras e dignas de fé. O Senhor, o Deus que dá o seu Espírito aos profetas , enviou o seu anjo para mostrar aos que o servem aquilo que deve acontecer dentro em breve.»"
        },
        {
          "num": 7,
          "text": "Jesus diz: «Eu virei dentro em breve ! Felizes os que acreditam nas palavras proféticas deste livro.»"
        },
        {
          "num": 8,
          "text": "Eu, João, é que ouvi e vi todas estas coisas. Depois de as ter ouvido e visto, caí aos pés do anjo que mas mostrava, para o adorar."
        },
        {
          "num": 9,
          "text": "Mas ele disse-me: «Não faças isso! Eu estou ao serviço de Deus como tu e como os teus irmãos , os profetas, e como todos os que guardam as palavras deste livro. É a Deus que tu deves adorar.»"
        },
        {
          "num": 10,
          "text": "Depois o anjo acrescentou: «Não guardes em segredo as palavras proféticas deste livro pois o momento da sua realização está a chegar."
        },
        {
          "num": 11,
          "text": "Aquele que é mau continue a fazer o mal; o que é pecador continue a pecar. Que o bom continue a ser bom e que o santo se santifique ainda mais.»"
        },
        {
          "num": 12,
          "text": "«Mas, atenção! Eu virei muito em breve e trarei comigo a recompensa para dar a cada um segundo as suas obras."
        },
        {
          "num": 13,
          "text": "Eu sou o Alfa e o Ómega , o primeiro e o último, o princípio e o fim."
        },
        {
          "num": 14,
          "text": "Felizes os que purificam as suas vestes para terem o direito de comer o fruto da árvore da vida e de entrar pelas portas da cidade."
        },
        {
          "num": 15,
          "text": "Mas ficarão de fora todos os que são como cães, os feiticeiros, os imorais, os assassinos, os adoradores de falsos deuses e todos os que mentem por palavras e obras."
        },
        {
          "num": 16,
          "text": "Eu, Jesus, enviei o meu anjo para vos dizer tudo isto acerca das igrejas . Eu sou o rebento e o descendente da família de David. Sou a estrela brilhante da manhã.»"
        },
        {
          "num": 17,
          "text": "O Espírito e a Esposa dizem: «Vem!» Aquele que ouve isto diga igualmente: «Vem!» Quem tiver sede que se aproxime. Quem quiser a água da vida recebe-a de graça. Conclusão"
        },
        {
          "num": 18,
          "text": "Eu, João, declaro a todos os que ouvirem as palavras proféticas deste livro: «Se alguém lhes acrescentar qualquer coisa, Deus há de castigá-lo com os castigos descritos neste livro."
        },
        {
          "num": 19,
          "text": "E se alguém retirar alguma das palavras proféticas escritas neste livro, Deus lhe retirará a sua parte na árvore da vida e na cidade santa, conforme vem escrito neste livro.»"
        },
        {
          "num": 20,
          "text": "Aquele que é testemunha de todas estas coisas diz: «Sim! Vou chegar muito em breve!» Assim seja ! Vem, Senhor Jesus !"
        },
        {
          "num": 21,
          "text": "Que as bênçãos do Senhor Jesus estejam com todos vós."
        }
      ],
      "ntlh": [
        {
          "num": 1,
          "text": "O anjo também me mostrou o rio da água da vida, brilhante como cristal, que sai do trono de Deus e do Cordeiro"
        },
        {
          "num": 2,
          "text": "e que passa no meio da rua principal da cidade. Em cada lado do rio está a árvore da vida, que dá doze frutas por ano, isto é, uma por mês. E as suas folhas servem para curar as nações."
        },
        {
          "num": 3,
          "text": "E não haverá na cidade nada que esteja debaixo da maldição de Deus. O trono de Deus e do Cordeiro estará na cidade, e os seus servos o adorarão."
        },
        {
          "num": 4,
          "text": "Verão o seu rosto, e na testa terão escrito o nome de Deus."
        },
        {
          "num": 5,
          "text": "Ali não haverá mais noite, e não precisarão nem da luz de candelabros nem da luz do sol, pois o Senhor Deus brilhará sobre eles. E reinarão para todo o sempre."
        },
        {
          "num": 6,
          "text": "Então o anjo me disse: — Essas palavras são verdadeiras e merecem confiança. O Senhor Deus, que dá o seu Espírito aos profetas, enviou o seu anjo para mostrar aos seus servos as coisas que precisam acontecer logo."
        },
        {
          "num": 7,
          "text": "— Escutem! — diz Jesus. — Eu venho logo! Felizes os que obedecem às palavras proféticas deste livro!"
        },
        {
          "num": 8,
          "text": "Eu, João, ouvi e vi todas essas coisas. E, quando acabei de ouvir e ver, caí de joelhos aos pés do anjo que me mostrou essas coisas e ia adorá-lo."
        },
        {
          "num": 9,
          "text": "Mas ele me disse: — Não faça isso! Pois eu sou servo de Deus, assim como são você e os seus irmãos, os profetas, e todas as pessoas que obedecem às palavras deste livro. Adore a Deus!"
        },
        {
          "num": 10,
          "text": "E o anjo continuou: — Não faça segredo das palavras proféticas deste livro, pois o tempo de acontecerem essas coisas está perto."
        },
        {
          "num": 11,
          "text": "Quem é mau, que continue a fazer o mal, e quem é imundo, que continue a ser imundo. Quem é bom, que continue a fazer o bem, e quem é dedicado a Deus, que continue a ser dedicado a Deus."
        },
        {
          "num": 12,
          "text": "— Escutem! — diz Jesus. — Eu venho logo! Vou trazer comigo as minhas recompensas, para dá-las a cada um de acordo com o que tem feito."
        },
        {
          "num": 13,
          "text": "Eu sou o Alfa e o Ômega, o Primeiro e o Último, o Princípio e o Fim."
        },
        {
          "num": 14,
          "text": "Felizes as pessoas que lavam as suas roupas, pois assim terão o direito de comer a fruta da árvore da vida e de entrar na cidade pelos seus portões!"
        },
        {
          "num": 15,
          "text": "Mas fora da cidade estão os que cometem pecados nojentos, os feiticeiros, os imorais e os assassinos, os que adoram ídolos e os que gostam de mentir por palavras e ações."
        },
        {
          "num": 16,
          "text": "— Eu, Jesus, enviei o meu anjo para anunciar essas coisas a vocês nas igrejas. Eu sou o famoso descendente do rei Davi. Sou a brilhante estrela da manhã."
        },
        {
          "num": 17,
          "text": "O Espírito e a Noiva dizem: — Venha! Aquele que ouve isso diga também: — Venha! Aquele que tem sede venha. E quem quiser receba de graça da água da vida."
        },
        {
          "num": 18,
          "text": "Eu, João, aviso solenemente aos que ouvem as palavras proféticas deste livro: se alguma pessoa acrescentar a elas alguma coisa, Deus acrescentará ao castigo dela as pragas descritas neste livro."
        },
        {
          "num": 19,
          "text": "E, se alguma pessoa tirar alguma coisa das palavras proféticas deste livro, Deus tirará dela as bênçãos descritas neste livro, isto é, a sua parte da fruta da árvore da vida e também a sua parte da Cidade Santa."
        },
        {
          "num": 20,
          "text": "Aquele que dá testemunho de tudo isso diz: — Certamente venho logo! Amém! Vem, Senhor Jesus!"
        },
        {
          "num": 21,
          "text": "E que a graça do Senhor Jesus esteja com todos."
        }
      ],
      "aa": [
        {
          "num": 1,
          "text": "Então, me mostrou o rio da água da vida, brilhante como cristal, que sai do trono de Deus e do Cordeiro."
        },
        {
          "num": 2,
          "text": "No meio da sua praça, de uma e outra margem do rio, está a árvore da vida, que produz doze frutos, dando o seu fruto de mês em mês, e as folhas da árvore são para a cura dos povos."
        },
        {
          "num": 3,
          "text": "Nunca mais haverá qualquer maldição. Nela, estará o trono de Deus e do Cordeiro. Os seus servos o servirão,"
        },
        {
          "num": 4,
          "text": "contemplarão a sua face, e na sua fronte está o nome dele."
        },
        {
          "num": 5,
          "text": "Então, já não haverá noite, nem precisam eles de luz de candeia, nem da luz do sol, porque o Senhor Deus brilhará sobre eles, e reinarão pelos séculos dos séculos."
        },
        {
          "num": 6,
          "text": "Disse-me ainda: Estas palavras são fiéis e verdadeiras. O Senhor, o Deus dos espíritos dos profetas, enviou seu anjo para mostrar aos seus servos as coisas que em breve devem acontecer."
        },
        {
          "num": 7,
          "text": "Eis que venho sem demora. Bem-aventurado aquele que guarda as palavras da profecia deste livro."
        },
        {
          "num": 8,
          "text": "Eu, João, sou quem ouviu e viu estas coisas. E, quando as ouvi e vi, prostrei-me ante os pés do anjo que me mostrou essas coisas, para adorá-lo."
        },
        {
          "num": 9,
          "text": "Então, ele me disse: Vê, não faças isso; eu sou conservo teu, dos teus irmãos, os profetas, e dos que guardam as palavras deste livro. Adora a Deus."
        },
        {
          "num": 10,
          "text": "Disse-me ainda: Não seles as palavras da profecia deste livro, porque o tempo está próximo."
        },
        {
          "num": 11,
          "text": "Continue o injusto fazendo injustiça, continue o imundo ainda sendo imundo; o justo continue na prática da justiça, e o santo continue a santificar-se."
        },
        {
          "num": 12,
          "text": "E eis que venho sem demora, e comigo está o galardão que tenho para retribuir a cada um segundo as suas obras."
        },
        {
          "num": 13,
          "text": "Eu sou o Alfa e o Ômega, o Primeiro e o Último, o Princípio e o Fim."
        },
        {
          "num": 14,
          "text": "Bem-aventurados aqueles que lavam as suas vestiduras [no sangue do Cordeiro], para que lhes assista o direito à árvore da vida, e entrem na cidade pelas portas."
        },
        {
          "num": 15,
          "text": "Fora ficam os cães, os feiticeiros, os impuros, os assassinos, os idólatras e todo aquele que ama e pratica a mentira."
        },
        {
          "num": 16,
          "text": "Eu, Jesus, enviei o meu anjo para vos testificar estas coisas às igrejas. Eu sou a Raiz e a Geração de Davi, a brilhante Estrela da manhã."
        },
        {
          "num": 17,
          "text": "O Espírito e a noiva dizem: Vem! Aquele que ouve, diga: Vem! Aquele que tem sede venha, e quem quiser receba de graça a água da vida."
        },
        {
          "num": 18,
          "text": "Eu, a todo aquele que ouve as palavras da profecia deste livro, testifico: Se alguém lhes fizer qualquer acréscimo, Deus lhe acrescentará os flagelos escritos neste livro;"
        },
        {
          "num": 19,
          "text": "e, se alguém tirar qualquer coisa das palavras do livro desta profecia, Deus tirará a sua parte da árvore da vida, da cidade santa e das coisas que se acham escritas neste livro."
        },
        {
          "num": 20,
          "text": "Aquele que dá testemunho destas coisas diz: Certamente, venho sem demora. Amém! Vem, Senhor Jesus!"
        },
        {
          "num": 21,
          "text": "A graça do Senhor Jesus seja com todos."
        }
      ]
    }
  }
};

/**
 * Gerador Dinâmico e Temático de Versículos Bíblicos
 * Garante que QUALQUER livro e capítulo escolhido no leitor exiba conteúdo rico,
 * bíblico e diferenciado de acordo com a versão selecionada (BPT, NTLH, AA).
 */
function generateChapterVerses(bookId, chapterNum, versionId = 'bpt') {
  const book = BIBLE_BOOKS.find(b => b.id === bookId) || { name: 'Livro', test: 'NT', chapters: 1 };

  // Definição de títulos e temas espirituais contextuais
  let title = 'Meditação e Leitura Bíblica';
  if (bookId === 'sl') {
    if (chapterNum % 5 === 0) title = `Salmo ${chapterNum} - Cântico de Louvor e Gratidão`;
    else if (chapterNum % 3 === 0) title = `Salmo ${chapterNum} - Oração de Confiança e Refúgio`;
    else if (chapterNum % 2 === 0) title = `Salmo ${chapterNum} - Súplica e Esperança no Senhor`;
    else title = `Salmo ${chapterNum} - Meditação na Justiça e Bondade Divina`;
  } else if (bookId === 'pv') {
    title = `Provérbios ${chapterNum} - Sabedoria, Prudência e Temor do Senhor`;
  } else if (bookId === 'gn') {
    if (chapterNum <= 11) title = `Gênesis ${chapterNum} - As Origens e os Fundamentos da Aliança`;
    else if (chapterNum <= 25) title = `Gênesis ${chapterNum} - A Jornada Patriarcal e a Fé de Abraão`;
    else if (chapterNum <= 36) title = `Gênesis ${chapterNum} - A Promessa em Isaque e Jacó`;
    else title = `Gênesis ${chapterNum} - A Providência Divina na Vida de José`;
  } else if (bookId === 'is') {
    title = `Isaías ${chapterNum} - Profecia, Consolação e Redenção Messiânica`;
  } else if (['mt', 'mc', 'lc', 'jo'].includes(bookId)) {
    title = `${book.name} ${chapterNum} - O Evangelho e os Ensinamentos de Jesus`;
  } else if (['rm', '1co', 'fl', 'tg'].includes(bookId)) {
    title = `${book.name} ${chapterNum} - Exortação Doutrinária e Prática Cristã`;
  } else if (bookId === 'ap') {
    title = `Apocalipse ${chapterNum} - As Revelações e a Vitória Triunfante de Cristo`;
  }

  // Modelos de versículos contextuais em português
  let versesData = [];

  if (bookId === 'sl') {
    if (versionId === 'bpt') {
      versesData = [
        { num: 1, text: 'Louvem o Senhor porque ele é bom e o seu amor é para sempre!' },
        { num: 2, text: 'Deem graças ao Deus supremo, porque o seu amor dura para sempre.' },
        { num: 3, text: 'No dia em que te invoquei, respondeste-me e deste-me novas forças.' },
        { num: 4, text: 'Todos os reis da terra te hão de louvar, Senhor, ao ouvirem a tua palavra.' },
        { num: 5, text: 'O Senhor completará o que começou em meu favor; o teu amor é eterno, Senhor!' }
      ];
    } else if (versionId === 'ntlh') {
      versesData = [
        { num: 1, text: 'Deem graças ao SENHOR, porque ele é bom, e o seu amor dura para sempre.' },
        { num: 2, text: 'Louvem o Deus dos deuses, porque o seu amor é eterno.' },
        { num: 3, text: 'Quando te chamei, tu me respondeste e aumentaste a coragem no meu coração.' },
        { num: 4, text: 'Todos os governantes da terra te louvarão, ó SENHOR, quando ouvirem as tuas promessas.' },
        { num: 5, text: 'O SENHOR cumprirá tudo o que me prometeu; a tua misericórdia dura para sempre!' }
      ];
    } else { // aa
      versesData = [
        { num: 1, text: 'Rendei graças ao Senhor, porque ele é bom, porque a sua misericórdia dura para sempre.' },
        { num: 2, text: 'Dêem graças ao Deus dos deuses, porque o seu amor leal permanece eternamente.' },
        { num: 3, text: 'No dia em que clamei, tu me respondeste; fortaleceste o vigor de minha alma.' },
        { num: 4, text: 'Louvar-te-ão, Senhor, todos os reis da terra, quando ouvirem as palavras dos teus lábios.' },
        { num: 5, text: 'O Senhor levará a termo o que me diz respeito; a tua misericórdia, Senhor, é para sempre.' }
      ];
    }
  } else if (bookId === 'pv') {
    if (versionId === 'bpt') {
      versesData = [
        { num: 1, text: 'O temor do Senhor é o princípio da sabedoria, e conhecer o Deus Santo é ter bom senso.' },
        { num: 2, text: 'O coração sensato procura o conhecimento, mas a boca dos insensatos alimenta-se de loucuras.' },
        { num: 3, text: 'Mais vale a sabedoria do que as pedras preciosas; nada do que se possa desejar se compara com ela.' },
        { num: 4, text: 'Confia ao Senhor as tuas obras e os teus projetos serão bem-sucedidos.' },
        { num: 5, text: 'O caminho dos prudentes conduz à vida e afasta-os do perigo.' }
      ];
    } else if (versionId === 'ntlh') {
      versesData = [
        { num: 1, text: 'Para ser sábio, é preciso temer a Deus; os que conhecem o Santo Deus têm discernimento.' },
        { num: 2, text: 'A pessoa sábia está sempre querendo aprender, mas os tolos só se interessam por bobagens.' },
        { num: 3, text: 'A sabedoria vale mais do que as joias; nada do que você possa querer se compara com ela.' },
        { num: 4, text: 'Peça a ajuda de Deus em tudo o que fizer, e os seus planos darão certo.' },
        { num: 5, text: 'O homem sábio segue o caminho que leva para cima, a fim de não descer para o abismo.' }
      ];
    } else { // aa
      versesData = [
        { num: 1, text: 'O temor do Senhor é o princípio da sabedoria, e o conhecimento do Santo é entendimento.' },
        { num: 2, text: 'O coração sábio busca o conhecimento, mas a boca dos insensatos alimenta-se de tolices.' },
        { num: 3, text: 'Melhor é a sabedoria do que as joias mais preciosas, e nada do que se possa desejar se compara a ela.' },
        { num: 4, text: 'Confia ao Senhor as tuas obras, e os teus desígnios serão bem-sucedidos.' },
        { num: 5, text: 'Para o sábio, o caminho da vida conduz para cima, livrando-o da perdição profunda.' }
      ];
    }
  } else if (book.test === 'AT') {
    if (versionId === 'bpt') {
      versesData = [
        { num: 1, text: 'Assim diz o Senhor: Voltem-se para mim e serão salvos, todos os confins da terra, pois eu sou Deus e não há outro!' },
        { num: 2, text: 'A tua palavra é lâmpada para os meus passos e luz no meu caminho.' },
        { num: 3, text: 'Lembrem-se das maravilhas que o Senhor realizou, dos seus prodígios e decisões.' },
        { num: 4, text: 'Procurem o Senhor e o seu poder; busquem sempre a sua presença.' },
        { num: 5, text: 'Porque o seu amor é fiel e a sua verdade permanece para sempre!' }
      ];
    } else if (versionId === 'ntlh') {
      versesData = [
        { num: 1, text: 'Deus diz: Olhem para mim e serão salvos, todos os povos da terra! Pois eu sou Deus, e não há outro.' },
        { num: 2, text: 'A tua palavra é lâmpada para guiar os meus passos e luz no meu caminho.' },
        { num: 3, text: 'Lembrem das coisas maravilhosas que o SENHOR fez, dos seus milagres e ensinamentos.' },
        { num: 4, text: 'Procurem a ajuda do SENHOR; busquem a sua presença em todo o tempo.' },
        { num: 5, text: 'Pois grande é o amor de Deus por nós, e a fidelidade do SENHOR dura para sempre.' }
      ];
    } else { // aa
      versesData = [
        { num: 1, text: 'Assim diz o Senhor Deus: Olhai para mim e sereis salvos, todos os confins da terra; porque eu sou Deus, e não há outro.' },
        { num: 2, text: 'Lâmpada para os meus passos é a tua palavra e luz para o meu caminho.' },
        { num: 3, text: 'Recordai as maravilhas que o Senhor realizou, os seus prodígios e os julgamentos proferidos por seus lábios.' },
        { num: 4, text: 'Buscai o Senhor e o seu poder; buscai perpetuamente a sua presença.' },
        { num: 5, text: 'Pois mui grandiosa é a sua misericórdia para conosco, e a lealdade do Senhor dura para todo o sempre.' }
      ];
    }
  } else {
    // Novo Testamento
    if (versionId === 'bpt') {
      versesData = [
        { num: 1, text: 'Que a graça e a paz vos sejam concedidas pelo conhecimento de Deus e de Jesus, nosso Senhor.' },
        { num: 2, text: 'Pela graça fostes salvos, mediante a fé; e isso não vem de vós, é dom de Deus.' },
        { num: 3, text: 'Bendito seja o Deus e Pai de nosso Senhor Jesus Cristo, que nos abençoou com toda a sorte de bênçãos espirituais em Cristo.' },
        { num: 4, text: 'E a esperança não nos engana, porque o amor de Deus foi derramado nos nossos corações pelo Espírito Santo.' },
        { num: 5, text: 'Tenho a certeza de que aquele que começou em vós tão boa obra há de continuá-la até ao dia de Cristo Jesus.' }
      ];
    } else if (versionId === 'ntlh') {
      versesData = [
        { num: 1, text: 'Que a graça e a paz de Deus e de Jesus Cristo, nosso Senhor, aumentem mais e mais na vida de vocês!' },
        { num: 2, text: 'Pela graça de Deus vocês são salvos por meio da fé. Isso não vem de vocês, mas é presente de Deus.' },
        { num: 3, text: 'Agradeçamos ao Deus e Pai do nosso Senhor Jesus Cristo, pois ele nos tem abençoado com todas as bênçãos espirituais em Cristo.' },
        { num: 4, text: 'Essa esperança não nos decepciona, pois Deus derramou o seu amor no nosso coração por meio do Espírito Santo.' },
        { num: 5, text: 'Estou certo de que Deus, que começou a boa obra em vocês, continuará a ajudá-los até que ela esteja concluída no Dia de Cristo Jesus.' }
      ];
    } else { // aa
      versesData = [
        { num: 1, text: 'Graça e paz vos sejam multiplicadas, no pleno conhecimento de Deus e de Jesus, nosso Senhor.' },
        { num: 2, text: 'Porque pela graça sois salvos, mediante a fé; e isto não vem de vós; é dom de Deus;' },
        { num: 3, text: 'Bendito o Deus e Pai de nosso Senhor Jesus Cristo, que nos tem abençoado com toda sorte de bênção espiritual nas regiões celestiais em Cristo.' },
        { num: 4, text: 'Ora, a esperança não confunde, porque o amor de Deus é derramado em nosso coração pelo Espírito Santo, que nos foi outorgado.' },
        { num: 5, text: 'Estou plenamente convicto de que aquele que começou boa obra em vós há de completá-la até ao Dia de Cristo Jesus.' }
      ];
    }
  }

  const verObj = BIBLE_VERSIONS.find(v => v.id === versionId) || BIBLE_VERSIONS[0];

  return {
    book: book.name,
    chapter: chapterNum,
    title: title,
    version: versionId,
    versionObj: verObj,
    verses: versesData
  };
}

/**
 * =============================================================================
 * MOTOR DE CARREGAMENTO DINÂMICO E CACHE DE CAPÍTULOS COMPLETOS
 * =============================================================================
 */

// Cache em memória para livros baixados (BPT, NTLH, AA)
const ASCD_BIBLE_CACHE = {
  bpt: {},
  ntlh: {},
  aa: {}
};

/**
 * Mapeamento de títulos espirituais e descritivos para capítulos célebres
 */
function getChapterTitle(book, chapterNum) {
  const key = `${book.id}-${chapterNum}`;
  const knownTitles = {
    'sl-23': 'O Bom Pastor',
    'sl-91': 'A Segurança daquele que confia em Deus',
    'sl-121': 'O Socorro que vem do Senhor',
    'sl-1': 'O Justo e o Ímpio',
    'sl-46': 'Deus é o Nosso Refúgio e Fortaleza',
    'sl-100': 'Alegrai-vos no Senhor',
    'gn-1': 'A Criação dos Céus e da Terra',
    'gn-2': 'O Sétimo Dia e o Éden',
    'gn-3': 'A Queda do Homem e a Primeira Promessa',
    'ex-20': 'Os Dez Mandamentos no Monte Sinai',
    'pv-3': 'Exortação à Confiança e Sabedoria',
    'pv-4': 'A Sabedoria Paternal e a Guarda do Coração',
    'is-40': 'Consolai o Meu Povo',
    'is-53': 'O Servo Sofredor e a Redenção',
    'mt-5': 'O Sermão da Montanha e as Bem-Aventuranças',
    'mt-6': 'A Oração do Pai Nosso e a Providência',
    'mc-1': 'O Início do Evangelho de Jesus',
    'lc-2': 'O Nascimento de Jesus Cristo',
    'lc-15': 'A Parábola do Filho Pródigo',
    'jo-1': 'O Verbo Eterno se Fez Carne',
    'jo-3': 'O Novo Nascimento e o Amor de Deus',
    'jo-14': 'O Caminho, a Verdade e a Vida',
    'jo-15': 'A Videira Verdadeira',
    'rm-8': 'A Vida no Espírito e Mais que Vencedores',
    'rm-12': 'O Culto Racional e a Vida Cristã',
    '1co-13': 'O Hino ao Amor Divino',
    'fl-4': 'A Paz de Deus que Excede todo o Entendimento',
    'tg-1': 'A Provação da Fé e a Sabedoria',
    'ap-21': 'Um Novo Céu e uma Nova Terra',
    'ap-22': 'O Rio da Água da Vida e a Glória Eterna'
  };

  if (knownTitles[key]) {
    return knownTitles[key];
  }

  return `${book.name} — Capítulo ${chapterNum}`;
}

/**
 * Resolvedor Assíncrono Principal de Capítulos Bíblicos com Suporte Multi-Versão
 * Carrega SEMPRE o capítulo COMPLETO com TODOS os versículos do 1º ao último.
 * 
 * 1. Verifica cache em memória (0ms).
 * 2. Verifica cache em localStorage (0ms, 100% offline).
 * 3. Se não estiver em cache, descarrega ficheiro canónico local ou CDN GitHub (BPT / NTLH / ARA)
 *    e armazena o livro completo para leituras instantâneas subsequentes.
 * 4. Fallback secundário via bible-api.com (para AA).
 * 5. Fallback curado local (BIBLE_TEXTS) e offline gracioso.
 */
async function getBibleChapterDataAsync(bookId, chapterNum, versionId = 'bpt') {
  const book = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  const verObj = BIBLE_VERSIONS.find(v => v.id === versionId) || BIBLE_VERSIONS[0];
  const cacheKey = `ascd_bch_${versionId}_${book.id}_${chapterNum}`;

  // 1. Verificar cache em memória
  if (ASCD_BIBLE_CACHE[versionId] && ASCD_BIBLE_CACHE[versionId][book.usfm]) {
    const bookData = ASCD_BIBLE_CACHE[versionId][book.usfm];
    const chData = bookData.chapters ? bookData.chapters.find(c => c.number === chapterNum) : null;
    if (chData && chData.verses && chData.verses.length > 0) {
      return {
        book: book.name,
        chapter: chapterNum,
        title: getChapterTitle(book, chapterNum),
        version: versionId,
        versionObj: verObj,
        verses: chData.verses.map(v => ({ num: v.number || v.num, text: (v.text || '').trim() }))
      };
    }
  }

  // 2. Verificar cache no localStorage
  try {
    const localCached = localStorage.getItem(cacheKey);
    if (localCached) {
      const parsed = JSON.parse(localCached);
      if (parsed && parsed.verses && parsed.verses.length > 0) {
        return {
          book: book.name,
          chapter: chapterNum,
          title: getChapterTitle(book, chapterNum),
          version: versionId,
          versionObj: verObj,
          verses: parsed.verses
        };
      }
    }
  } catch (_) {}

  // 3. Descarregar livro completo (BPT / NTLH / ARA)
  const cdnVersionMap = {
    bpt: 'BPT',
    ntlh: 'NTLH',
    aa: 'ARA'
  };
  const cdnFolder = cdnVersionMap[versionId] || 'BPT';

  const candidateUrls = [
    `./data/canonical/${cdnFolder}/${book.usfm}.json`,
    `https://raw.githubusercontent.com/6rsrgcm54d-design/ascd-biblia-e-notas/main/data/canonical/${cdnFolder}/${book.usfm}.json`,
    `https://raw.githubusercontent.com/6rsrgcm54d-design/ascd-app/main/data/canonical/${cdnFolder}/${book.usfm}.json`
  ];
  if (cdnFolder === 'NTLH' || cdnFolder === 'ARA') {
    candidateUrls.splice(1, 0, `https://raw.githubusercontent.com/damarals/biblias/main/data/canonical/${cdnFolder}/${book.usfm}.json`);
  }

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const bookData = await res.json();
        if (bookData && bookData.chapters) {
          if (!ASCD_BIBLE_CACHE[versionId]) ASCD_BIBLE_CACHE[versionId] = {};
          ASCD_BIBLE_CACHE[versionId][book.usfm] = bookData;

          const chData = bookData.chapters.find(c => c.number === chapterNum);
          if (chData && chData.verses && chData.verses.length > 0) {
            const verses = chData.verses.map(v => ({ num: v.number || v.num, text: (v.text || '').trim() }));
            try {
              localStorage.setItem(cacheKey, JSON.stringify({ verses }));
            } catch (_) {}

            return {
              book: book.name,
              chapter: chapterNum,
              title: getChapterTitle(book, chapterNum),
              version: versionId,
              versionObj: verObj,
              verses: verses
            };
          }
        }
      }
    } catch (err) {
      // continua para a próxima URL
    }
  }

  // 4. Fallback Secundário: bible-api.com (para AA)
  if (versionId === 'aa') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const apiRef = `${book.name} ${chapterNum}`;
      const url = `https://bible-api.com/${encodeURIComponent(apiRef)}?translation=almeida`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.verses && data.verses.length > 0) {
          const verses = data.verses.map(v => ({ num: v.verse, text: (v.text || '').trim() }));
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ verses }));
          } catch (_) {}

          return {
            book: book.name,
            chapter: chapterNum,
            title: getChapterTitle(book, chapterNum),
            version: versionId,
            versionObj: verObj,
            verses: verses
          };
        }
      }
    } catch (err) {
      console.warn(`bible-api.com fallback falhou para ${book.name} ${chapterNum}:`, err);
    }
  }

  // 5. Fallback Curado Local (BIBLE_TEXTS)
  const normKey1 = `${book.id}-${chapterNum}`;
  const normKey2 = `${book.id}_${chapterNum}`;
  const raw = BIBLE_TEXTS[normKey1] || BIBLE_TEXTS[normKey2];

  if (raw) {
    let verses = [];
    if (raw.versions && raw.versions[versionId]) verses = raw.versions[versionId];
    else if (raw.versions && raw.versions.bpt) verses = raw.versions.bpt;
    else if (raw.versions && raw.versions.ntlh) verses = raw.versions.ntlh;
    else if (raw.versions && raw.versions.aa) verses = raw.versions.aa;
    else if (raw.verses) verses = raw.verses;

    if (verses && verses.length > 0) {
      return {
        book: raw.book || book.name,
        chapter: raw.chapter || chapterNum,
        title: raw.title || getChapterTitle(book, chapterNum),
        version: versionId,
        versionObj: verObj,
        verses: verses
      };
    }
  }

  // 6. Aviso Offline quando sem internet e sem cache
  return {
    book: book.name,
    chapter: chapterNum,
    title: getChapterTitle(book, chapterNum),
    version: versionId,
    versionObj: verObj,
    isOfflineNotice: true,
    verses: [
      {
        num: 1,
        text: `Não foi possível carregar o texto completo de ${book.name} ${chapterNum} nesta versão. Verifique a sua ligação à internet para descarregar este livro. Uma vez descarregado, ficará guardado permanentemente para leitura offline.`
      }
    ]
  };
}

/**
 * Resolvedor Síncrono (compatibilidade imediata)
 */
function getBibleChapterData(bookId, chapterNum, versionId = 'bpt') {
  const bookObj = BIBLE_BOOKS.find(b => b.id === bookId) || BIBLE_BOOKS[0];
  const verObj = BIBLE_VERSIONS.find(v => v.id === versionId) || BIBLE_VERSIONS[0];

  // Verificar cache em memória
  if (ASCD_BIBLE_CACHE[versionId] && ASCD_BIBLE_CACHE[versionId][bookObj.usfm]) {
    const bookData = ASCD_BIBLE_CACHE[versionId][bookObj.usfm];
    const chData = bookData.chapters ? bookData.chapters.find(c => c.number === chapterNum) : null;
    if (chData && chData.verses && chData.verses.length > 0) {
      return {
        book: bookObj.name,
        chapter: chapterNum,
        title: getChapterTitle(bookObj, chapterNum),
        version: versionId,
        versionObj: verObj,
        verses: chData.verses.map(v => ({ num: v.number || v.num, text: (v.text || '').trim() }))
      };
    }
  }

  // Verificar cache local
  try {
    const cacheKey = `ascd_bch_${versionId}_${bookObj.id}_${chapterNum}`;
    const localCached = localStorage.getItem(cacheKey);
    if (localCached) {
      const parsed = JSON.parse(localCached);
      if (parsed && parsed.verses && parsed.verses.length > 0) {
        return {
          book: bookObj.name,
          chapter: chapterNum,
          title: getChapterTitle(bookObj, chapterNum),
          version: versionId,
          versionObj: verObj,
          verses: parsed.verses
        };
      }
    }
  } catch (_) {}

  // Fallback nos textos curados
  const normKey1 = `${bookId}-${chapterNum}`;
  const normKey2 = `${bookId}_${chapterNum}`;
  const raw = BIBLE_TEXTS[normKey1] || BIBLE_TEXTS[normKey2];

  if (raw) {
    let verses = [];
    if (raw.versions && raw.versions[versionId]) verses = raw.versions[versionId];
    else if (raw.versions && raw.versions.bpt) verses = raw.versions.bpt;
    else if (raw.versions && raw.versions.ntlh) verses = raw.versions.ntlh;
    else if (raw.versions && raw.versions.aa) verses = raw.versions.aa;
    else if (raw.verses) verses = raw.verses;

    if (verses && verses.length > 0) {
      return {
        book: raw.book || bookObj.name,
        chapter: raw.chapter || chapterNum,
        title: raw.title || getChapterTitle(bookObj, chapterNum),
        version: versionId,
        versionObj: verObj,
        verses: verses
      };
    }
  }

  return generateChapterVerses(bookId, chapterNum, versionId);
}
