// Debug inicial para confirmar que o script está sendo carregado
console.log('🔍 Script main.js carregado');

// Elementos do DOM
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadDataButton = document.getElementById('load-data-button');
const updateDataButton = document.getElementById('update-data');
const exportCsvButton = document.getElementById('export-csv');
const exportJsonButton = document.getElementById('export-json');
const loadingElement = document.getElementById('loading');
const loadingStatus = document.getElementById('loading-status');
const errorMessageElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const retryButton = document.getElementById('retry-button');
const useCachedButton = document.getElementById('use-cached-button');
const useStaticButton = document.getElementById('use-static-button');
const professorsContainer = document.getElementById('professors-container');
const professorsList = document.getElementById('professors-list');
const professorsCards = document.getElementById('professors-cards');
const tableView = document.getElementById('table-view');
const cardView = document.getElementById('card-view');
const tableContainer = document.getElementById('table-container');
const cardsContainer = document.getElementById('cards-container');
const dataSourceText = document.getElementById('data-source-text');
const dataTimestamp = document.getElementById('data-timestamp');

// Estado da aplicação
let allProfessors = [];
let displayedProfessors = [];
let currentView = 'table';
let isLoading = false;
let currentProxyIndex = 0;
let abortController = null;

// URL do corpo docente
const FACULTY_URL = 'https://videira.ifc.edu.br/ciencia-da-computacao/corpo-docente/';

// Lista de serviços de proxy CORS para tentar
const corsProxies = [
  { name: 'allorigins', url: 'https://api.allorigins.win/raw?url=' },
  { name: 'corsproxy', url: 'https://corsproxy.io/?' },
  { name: 'cors-anywhere', url: 'https://cors-anywhere.herokuapp.com/' },
  { name: 'thingproxy', url: 'https://thingproxy.freeboard.io/fetch/' },
  // Adicione mais proxies conforme necessário
];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOMContentLoaded: Inicializando aplicação');
  
  // Ocultar controles e mostra a mensagem intro
  const controlsElement = document.querySelector('.controls');
  if (controlsElement) controlsElement.classList.add('hidden');
  
  // Event listeners
  loadDataButton.addEventListener('click', handleLoadData);
  searchButton.addEventListener('click', filterProfessors);
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      filterProfessors();
    }
  });
  
  updateDataButton.addEventListener('click', () => {
    console.log('🔄 Botão Atualizar Dados clicado');
    fetchProfessorsData(true);
  });
  
  exportCsvButton.addEventListener('click', exportAsCSV);
  exportJsonButton.addEventListener('click', exportAsJSON);
  retryButton.addEventListener('click', () => fetchProfessorsData());
  useCachedButton.addEventListener('click', loadFromCache);
  useStaticButton.addEventListener('click', loadStaticData);
  tableView.addEventListener('click', () => changeView('table'));
  cardView.addEventListener('click', () => changeView('cards'));
});

/**
 * Lida com o clique no botão "Carregar Dados"
 */
async function handleLoadData() {
  console.log('🔄 Botão Carregar Dados do Corpo Docente clicado');
  loadDataButton.disabled = true;
  loadDataButton.textContent = 'Carregando...';
  
  const introMessage = document.querySelector('.intro-message');
  if (introMessage) introMessage.classList.add('hidden');
  
  const controlsElement = document.querySelector('.controls');
  if (controlsElement) controlsElement.classList.remove('hidden');
  
  // Verificar dados em cache primeiro
  const cachedData = loadCachedData();
  if (cachedData) {
    console.log('📦 Encontrados dados em cache, verificando validade...');
    const cachedTimestamp = localStorage.getItem('professors_timestamp');
    const now = new Date();
    
    // Verifica se os dados em cache têm menos de 24 horas
    if (cachedTimestamp && (now - new Date(cachedTimestamp)) < 24 * 60 * 60 * 1000) {
      console.log('✅ Cache válido, usando dados em cache');
      allProfessors = cachedData;
      displayedProfessors = [...allProfessors];
      
      // Atualiza a fonte dos dados
      dataSourceText.textContent = 'Cache (menos de 24h)';
      dataTimestamp.textContent = `Atualizado em: ${new Date(cachedTimestamp).toLocaleString()}`;
      
      renderProfessors();
      return;
    }
  }
  
  // Se não há cache válido, busca novos dados
  fetchProfessorsData();
}

// Carregar dados do localStorage se existirem
const loadCachedData = () => {
  const cachedData = localStorage.getItem('professors');
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Erro ao carregar dados do cache:', error);
      return null;
    }
  }
  return null;
};

/**
 * Carrega os dados do cache se disponível
 */
function loadFromCache() {
  console.log('🔄 Carregando dados do cache');
  const cachedData = loadCachedData();
  
  if (cachedData) {
    allProfessors = cachedData;
    displayedProfessors = [...allProfessors];
    
    const cachedTimestamp = localStorage.getItem('professors_timestamp') || 'data desconhecida';
    dataSourceText.textContent = 'Cache local';
    dataTimestamp.textContent = `Atualizado em: ${new Date(cachedTimestamp).toLocaleString()}`;
    
    hideLoading();
    hideError();
    renderProfessors();
  } else {
    // Se não houver cache, mostra mensagem e carrega dados estáticos
    errorText.textContent = 'Não há dados em cache disponíveis. Usando dados estáticos.';
    showError();
    loadStaticData();
  }
}

/**
 * Carrega dados estáticos pré-definidos
 */
function loadStaticData() {
  console.log('🔄 Carregando dados estáticos');
  allProfessors = getStaticProfessorsData();
  displayedProfessors = [...allProfessors];
  
  dataSourceText.textContent = 'Dados estáticos';
  dataTimestamp.textContent = 'Dados fixos (não atualizados)';
  
  hideLoading();
  hideError();
  renderProfessors();
}

/**
 * Faz o web scraping dos dados dos professores
 * @param {boolean} forceRefresh - Se verdadeiro, ignora o cache e força nova consulta
 */
async function fetchProfessorsData(forceRefresh = false) {
  console.log('🔍 Iniciando fetchProfessorsData - forceRefresh:', forceRefresh);
  showLoading();
  
  if (isLoading) {
    console.log('⚠️ Já existe um carregamento em andamento');
    return;
  }
  
  // Cancelar qualquer requisição em andamento
  if (abortController) {
    abortController.abort();
  }
  
  // Criar novo controller para esta requisição
  abortController = new AbortController();
  isLoading = true;
  currentProxyIndex = 0;
  
  try {
    console.log('📊 URL de origem:', FACULTY_URL);
    
    // Tentar cada proxy em sequência
    let html = null;
    let successfulProxy = null;
    
    for (let i = 0; i < corsProxies.length; i++) {
      const proxy = corsProxies[i];
      currentProxyIndex = i;
      
      try {
        loadingStatus.textContent = `Tentando proxy ${i + 1} de ${corsProxies.length}: ${proxy.name}...`;
        console.log(`⏳ Tentando proxy ${i + 1} de ${corsProxies.length}: ${proxy.name}`);
        
        const fullUrl = proxy.url + encodeURIComponent(FACULTY_URL);
        console.log('📡 URL completa:', fullUrl);
        
        // Configurar timeout para cada requisição
        const timeoutId = setTimeout(() => {
          if (abortController) {
            abortController.abort();
          }
        }, 10000); // 10 segundos de timeout
        
        const response = await fetch(fullUrl, { 
          signal: abortController.signal,
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (compatible; WebScraper)'
          }
        });
        
        // Limpar o timeout se a requisição for bem-sucedida
        clearTimeout(timeoutId);
        
        console.log(`✅ Resposta de ${proxy.name}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (response.ok) {
          html = await response.text();
          successfulProxy = proxy.name;
          console.log(`✅ Proxy ${proxy.name} retornou HTML com tamanho:`, html.length);
          break;
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log(`⏱️ Timeout ao tentar proxy ${proxy.name}`);
        } else {
          console.log(`❌ Falha ao usar proxy ${proxy.name}:`, err.message);
        }
      }
    }
    
    if (!html) {
      throw new Error(`Nenhum proxy CORS funcionou. Tente usar dados em cache ou estáticos.`);
    }
    
    // Verificando se o HTML contém termos específicos que indicam que é a página correta
    const containsKeyTerms = html.includes('corpo-docente') || 
                           html.includes('professor') || 
                           html.includes('IFC');
    
    console.log('🔍 HTML contém termos-chave esperados?', containsKeyTerms);
    if (!containsKeyTerms) {
      console.warn('⚠️ O HTML retornado pode não ser da página correta!');
      loadingStatus.textContent = 'O conteúdo recebido pode não ser da página correta. Tentando extrair dados mesmo assim...';
    }
    
    // Criando um DOM parser para analisar o HTML
    loadingStatus.textContent = 'Analisando dados recebidos...';
    console.log('⏳ Iniciando parsing do HTML...');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Log do título da página para verificar se estamos recebendo a página correta
    console.log('📄 Título da página:', doc.title);
    
    // Tentando diferentes seletores para encontrar os professores
    const seletores = [
      '.elementor-widget-wrap', 
      '.docente-item',
      '.professor',
      '.team-member',
      '.elementor-column',
      '.elementor-element'
    ];
    
    let professorElements = [];
    
    for (const seletor of seletores) {
      const elementos = doc.querySelectorAll(seletor);
      console.log(`Encontrados ${elementos.length} elementos com seletor "${seletor}"`);
      
      if (elementos.length > 0) {
        professorElements = elementos;
        console.log(`✅ Usando seletor "${seletor}" que encontrou ${elementos.length} elementos`);
        break;
      }
    }
    
    // Amostra dos 3 primeiros elementos para verificação
    if (professorElements.length > 0) {
      console.log('📝 Verificando os primeiros 3 elementos:');
      for (let i = 0; i < Math.min(3, professorElements.length); i++) {
        const el = professorElements[i];
        console.log(`Elemento ${i + 1}:`, {
          temH2ouH3ouH4: !!el.querySelector('h2, h3, h4'),
          textoDeCabecalho: el.querySelector('h2, h3, h4')?.textContent.trim() || 'Nenhum',
          temImg: !!el.querySelector('img'),
          temParagrafos: el.querySelectorAll('p').length
        });
      }
    }
    
    // Extraindo os dados dos professores
    loadingStatus.textContent = 'Extraindo dados dos professores...';
    console.log('⏳ Iniciando extração dos dados dos professores...');
    
    // Tenta primeiro com a função especializada para o formato do IFC Videira
    allProfessors = extractIFCDocente(doc);
    
    // Se não encontrou professores, tenta com a função genérica
    if (allProfessors.length === 0) {
      console.log('⚠️ Extração específica não encontrou professores, tentando método genérico...');
      allProfessors = extractProfessorsData(doc, professorElements);
      
      // Se ainda não encontrou, tenta o método alternativo
      if (allProfessors.length === 0) {
        console.warn('⚠️ Nenhum professor encontrado. Tentando método alternativo de extração...');
        loadingStatus.textContent = 'Tentando método alternativo de extração...';
        allProfessors = extractProfessorsAlternative(doc);
        console.log('✅ Extração alternativa encontrou:', allProfessors.length, 'professores');
      }
    } else {
      console.log('✅ Extração específica para IFC Videira bem-sucedida!');
    }
    
    if (allProfessors.length > 0) {
      console.log('📋 Amostra do primeiro professor encontrado:', allProfessors[0]);
      
      // Cache os dados para uso futuro
      const timestamp = new Date().toISOString();
      localStorage.setItem('professors', JSON.stringify(allProfessors));
      localStorage.setItem('professors_timestamp', timestamp);
      
      // Exibe todos os professores inicialmente
      displayedProfessors = [...allProfessors];
      
      // Atualiza a fonte dos dados
      dataSourceText.textContent = `Web Scraping via ${successfulProxy}`;
      dataTimestamp.textContent = `Atualizado em: ${new Date(timestamp).toLocaleString()}`;
      
      // Renderiza os professores na interface
      renderProfessors();
    } else {
      console.error('❌ Nenhum professor encontrado após tentativas alternativas');
      errorText.textContent = 'Não foi possível extrair os dados dos professores. Tente usar dados em cache ou estáticos.';
      showError();
    }
  } catch (error) {
    console.error('❌ Erro ao buscar dados dos professores:', error);
    console.error('Detalhes do erro:', {
      mensagem: error.message,
      stack: error.stack,
      nome: error.name
    });
    
    errorText.textContent = `Erro ao carregar os dados: ${error.message}`;
    showError();
  } finally {
    isLoading = false;
    abortController = null;
  }
}

/**
 * Extrai os dados dos professores do documento HTML
 * @param {Document} doc - O documento HTML parseado
 * @param {NodeList} elements - Elementos que contêm informações dos professores
 * @returns {Array} - Array de objetos com os dados dos professores
 */
function extractProfessorsData(doc, elements) {
  const professors = [];
  
  console.log('🔍 Iniciando extractProfessorsData');
  
  // Tenta encontrar as seções onde estão os dados dos professores
  // Usa uma variedade de seletores específicos para o site do IFC Videira
  const seletoresEspecificos = [
    // Seletores específicos para a página do IFC
    '.corpo-docente-container .docente-item',
    '.elementor-widget-wrap.elementor-element-populated',
    '.elementor-column-wrap.elementor-element-populated',
    '.elementor-text-editor',
    // Seletores mais específicos baseados na estrutura observada no Edge
    '.entry-content .elementor-section',
    '.elementor-container .elementor-row',
    '.elementor-section-wrap > section',
    // Tentativa para estrutura típica de conteúdo WordPress
    '.entry-content > *',
    // Seletores genéricos para qualquer seção que possa conter dados
    'section',
    'article',
    'div > div'
  ];
  
  // Tenta cada seletor específico
  let professorElements = [];
  let seletorUsado = '';
  
  for (const seletor of seletoresEspecificos) {
    const elementos = doc.querySelectorAll(seletor);
    console.log(`Testando seletor "${seletor}": encontrados ${elementos.length} elementos`);
    
    // Se encontrou elementos, verifica se eles contêm dados de professores
    if (elementos.length > 0) {
      // Verifica se algum desses elementos contém texto relacionado a professores
      const elementosComDados = Array.from(elementos).filter(el => {
        const texto = el.textContent.toLowerCase();
        return texto.includes('professor') || 
               texto.includes('doutor') || 
               texto.includes('mestre') ||
               texto.includes('titulação') || 
               texto.includes('área') ||
               texto.includes('lattes') ||
               texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/); // padrão de email
      });
      
      console.log(`Seletor "${seletor}": ${elementosComDados.length} elementos com possíveis dados de professores`);
      
      if (elementosComDados.length > 0) {
        professorElements = elementosComDados;
        seletorUsado = seletor;
        console.log(`✅ Usando seletor "${seletor}" que encontrou ${elementosComDados.length} elementos com dados potenciais`);
        break;
      }
    }
  }
  
  // Se não encontrou elementos com os seletores específicos, usa os elementos passados por parâmetro
  if (professorElements.length === 0) {
    console.log('⚠️ Nenhum elemento encontrado com os seletores específicos. Usando elementos passados por parâmetro.');
    professorElements = elements && elements.length > 0 ? Array.from(elements) : [];
  }
  
  // Última alternativa: procura qualquer elemento que possa conter dados de professores
  if (professorElements.length === 0) {
    console.log('⚠️ Nenhum elemento com dados encontrado. Procurando em todo o documento...');
    
    const todosElementos = doc.querySelectorAll('*');
    console.log(`Analisando ${todosElementos.length} elementos em todo o documento...`);
    
    const elementosComDados = Array.from(todosElementos).filter(el => {
      const texto = el.textContent.toLowerCase();
      // Verifica se o elemento tem texto suficiente e contém termos relacionados a professores
      return texto.length > 100 && (
        texto.includes('professor') || 
        texto.includes('doutor') || 
        texto.includes('mestre') ||
        texto.includes('titulação') || 
        texto.includes('área') ||
        texto.includes('lattes')
      );
    });
    
    console.log(`Encontrados ${elementosComDados.length} elementos potenciais em todo o documento`);
    
    if (elementosComDados.length > 0) {
      professorElements = elementosComDados;
    }
  }
  
  console.log(`Processando ${professorElements.length} elementos para extração de dados`);
  
  // Percorre os elementos encontrados para extrair dados
  professorElements.forEach((element, index) => {
    console.log(`Analisando elemento ${index + 1}/${professorElements.length}`);
    
    // Primeiro tenta encontrar o nome do professor em cabeçalhos
    const possiveisNomeElementos = element.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b');
    let name = '';
    
    // Verifica cada possível elemento de nome
    for (const el of possiveisNomeElementos) {
      const texto = el.textContent.trim();
      // Um nome válido deve ter pelo menos 5 caracteres e incluir espaço (nome e sobrenome)
      if (texto.length > 5 && texto.includes(' ')) {
        name = texto;
        console.log(`Encontrou possível nome: "${name}"`);
        break;
      }
    }
    
    // Se não encontrou nome nos cabeçalhos, pode estar no texto
    if (!name) {
      const textoCompleto = element.textContent.trim();
      const linhas = textoCompleto.split('\n');
      
      // Procura por uma linha que pareça ser um nome (primeira linha não vazia com mais de 5 caracteres)
      for (const linha of linhas) {
        const textoLinha = linha.trim();
        if (textoLinha.length > 5 && textoLinha.includes(' ') && !textoLinha.includes(':')) {
          name = textoLinha;
          console.log(`Encontrou possível nome no texto: "${name}"`);
          break;
        }
      }
    }
    
    // Se ainda não encontrou nome, este elemento pode não conter dados válidos
    if (!name) {
      console.log('⚠️ Não foi possível encontrar o nome neste elemento, pulando...');
      return;
    }
    
    // Extrai os outros dados
    const imgElement = element.querySelector('img');
    const imgSrc = imgElement ? imgElement.src : null;
    
    let title = '';
    let area = '';
    let email = '';
    let lattes = '';
    
    // Texto completo do elemento para análise
    const fullText = element.textContent;
    
    // Encontra os parágrafos com informações
    const paragraphs = element.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      
      if (text.includes('Titulação:')) {
        title = text.replace('Titulação:', '').trim();
      } else if (text.includes('Área:')) {
        area = text.replace('Área:', '').trim();
      } else if (text.toLowerCase().match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
        email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)[0].trim();
      }
    });
    
    // Verifica no texto completo também
    if (!title) {
      const titleMatch = fullText.match(/titula[çc][aã]o:?\s*([^,;\r\n]+)/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else if (fullText.match(/doutor[a]?/i)) {
        title = fullText.match(/doutor[a]?/i)[0].trim();
      } else if (fullText.match(/mestre/i)) {
        title = 'Mestre';
      }
    }
    
    if (!area) {
      const areaMatch = fullText.match(/[aá]rea:?\s*([^,;\r\n]+)/i);
      if (areaMatch) {
        area = areaMatch[1].trim();
      }
    }
    
    if (!email) {
      const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        email = emailMatch[0];
      }
    }
    
    // Encontra o link para o Lattes
    const links = element.querySelectorAll('a');
    links.forEach((link) => {
      if (link.href && link.href.includes('lattes.cnpq.br')) {
        lattes = link.href;
      } else if (link.textContent.toLowerCase().includes('lattes') || 
                link.textContent.toLowerCase().includes('currículo')) {
        lattes = link.href;
      }
    });
    
    console.log(`Dados extraídos para ${name}:`, {
      titulo: title || 'Não encontrado',
      area: area || 'Não encontrada', 
      email: email || 'Não encontrado',
      lattes: lattes || 'Não encontrado'
    });
    
    professors.push({
      name,
      title,
      area,
      email,
      lattes,
      image: imgSrc || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f3f4"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%23808080" text-anchor="middle" dy=".3em">Sem Foto</text></svg>'
    });
  });
  
  console.log(`Total de ${professors.length} professores extraídos antes da filtragem`);
  
  // Filtra entradas vazias ou duplicadas
  return professors.filter((professor, index, self) => 
    professor.name && 
    self.findIndex(p => p.name === professor.name) === index
  );
}

/**
 * Método alternativo para extrair dados de professores quando o método padrão falha
 * @param {Document} doc - O documento HTML parseado
 * @returns {Array} - Array de objetos com os dados dos professores
 */
function extractProfessorsAlternative(doc) {
  const professors = [];
  
  // Tentativa 1: Procurar por elementos que contêm textos relacionados a professores
  const allElements = doc.querySelectorAll('*');
  console.log(`Procurando em ${allElements.length} elementos pelo método alternativo`);
  
  // Procurar elementos que contêm textos como "Professor", "Doutor", "Mestre" etc.
  const professorWords = ['professor', 'doutor', 'mestre', 'dr.', 'dra.', 'titulação', 'área', 'lattes'];
  
  const potentialElements = Array.from(allElements).filter(el => {
    const text = el.textContent.toLowerCase();
    return professorWords.some(word => text.includes(word));
  });
  
  console.log(`Encontrados ${potentialElements.length} elementos potenciais com texto relacionado`);
  
  // Para cada elemento potencial, tenta extrair dados subindo na hierarquia do DOM
  // para encontrar o elemento pai que contém todos os dados do professor
  potentialElements.forEach(el => {
    // Tenta subir até 3 níveis na hierarquia para encontrar o elemento pai
    let parent = el;
    for (let i = 0; i < 3; i++) {
      if (parent.parentElement) {
        parent = parent.parentElement;
      }
    }
    
    // Agora tenta extrair os dados do professor deste elemento pai
    const nameElement = parent.querySelector('h1, h2, h3, h4, h5, h6, strong');
    if (!nameElement) return;
    
    const name = nameElement.textContent.trim();
    if (!name || name.length < 3) return; // Nome muito curto provavelmente não é um nome
    
    // Verifica se este professor já foi adicionado
    if (professors.some(p => p.name === name)) return;
    
    // Extrai outros dados
    const imgElement = parent.querySelector('img');
    const imgSrc = imgElement ? imgElement.src : null;
    
    // Busca por parágrafos e textos que possam conter informações
    const allText = parent.textContent;
    
    let title = '';
    let area = '';
    let email = '';
    let lattes = '';
    
    // Tenta encontrar título (Doutor/Mestre/etc)
    if (allText.includes('Doutor')) title = 'Doutor';
    else if (allText.includes('Doutora')) title = 'Doutora';
    else if (allText.includes('Mestre')) title = 'Mestre';
    else if (allText.includes('Especialista')) title = 'Especialista';
    
    // Tenta encontrar área
    const areaMatch = allText.match(/Área:([^,;.\r\n]+)/i);
    if (areaMatch) {
      area = areaMatch[1].trim();
    }
    
    // Tenta encontrar email - qualquer coisa com @ no meio
    const emailMatch = allText.match(/\S+@\S+\.\S+/);
    if (emailMatch) {
      email = emailMatch[0].trim();
    }
    
    // Tenta encontrar link para o Lattes
    const links = parent.querySelectorAll('a');
    links.forEach(link => {
      if (link.href && link.href.includes('lattes.cnpq.br')) {
        lattes = link.href;
      }
    });
    
    professors.push({
      name,
      title,
      area,
      email,
      lattes,
      image: imgSrc || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f3f4"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%23808080" text-anchor="middle" dy=".3em">?</text></svg>'
    });
  });
  
  // Remove duplicatas
  return professors.filter((professor, index, self) => 
    self.findIndex(p => p.name === professor.name) === index
  );
}

/**
 * Extrai dados específicos do corpo docente do IFC Videira
 * @param {Document} doc - O documento HTML parseado
 * @returns {Array} - Array de objetos com os dados dos professores
 */
function extractIFCDocente(doc) {
  console.log('🔍 Iniciando extração específica para o corpo docente do IFC Videira');
  
  const professors = [];
  
  // Tenta encontrar o conteúdo principal usando vários seletores possíveis
  let mainContent = null;
  const possibleSelectors = [
    '.col-sm-9',
    '.entry-content',
    '#content',
    '.main-content',
    'main',
    'article',
    'body'
  ];
  
  for (const selector of possibleSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      // Verifica se o elemento contém dados relevantes
      const text = element.textContent.toLowerCase();
      if (text.includes('corpo docente') || text.includes('professor') || text.includes('@ifc.edu.br')) {
        mainContent = element;
        console.log(`✅ Encontrado container de conteúdo usando seletor: ${selector}`);
        break;
      }
    }
  }
  
  if (!mainContent) {
    console.warn('⚠️ Não foi encontrado o container principal com dados dos professores');
    return [];
  }
  
  // Obtém todos os parágrafos do conteúdo principal
  const paragraphs = mainContent.querySelectorAll('p');
  console.log(`Encontrados ${paragraphs.length} parágrafos no conteúdo principal`);
  
  if (paragraphs.length === 0) {
    console.warn('⚠️ Não foram encontrados parágrafos com dados dos professores');
    return [];
  }
  
  // Processa os parágrafos para extrair informações dos professores
  let currentProfessor = {};
  let professorParagraphs = []; // Armazena todos os parágrafos associados ao professor atual
  let inProfessorSection = false;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    const text = paragraph.textContent.trim();
    
    if (!text) continue; // Pula parágrafos vazios
    
    // Verifica se é o início de um novo professor (texto em negrito/strong)
    const strongElement = paragraph.querySelector('strong');
    if (strongElement && strongElement.textContent.trim().length > 5) {
      // Se já estava processando um professor, processa e salva o anterior
      if (inProfessorSection && currentProfessor.name) {
        processProfessorData(currentProfessor, professorParagraphs);
        professors.push({...currentProfessor});
        console.log(`Professor processado: ${currentProfessor.name}`);
        professorParagraphs = []; // Limpa para o próximo professor
      }
      
      // Inicia o processamento de um novo professor
      const name = strongElement.textContent.trim();
      
      // Gera iniciais para a imagem (avatar)
      const initials = name.split(' ')
          .filter(part => part.length > 0)
          .map(part => part[0])
          .join('');
      
      currentProfessor = {
        name: name,
        title: '',
        area: '',
        email: '',
        lattes: '',
        image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f1f3f4"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="%23808080" text-anchor="middle" dy=".3em">${initials}</text></svg>`
      };
      professorParagraphs.push(text); // Adiciona este parágrafo à coleção
      inProfessorSection = true;
      console.log(`Novo professor encontrado: ${name}`);
      continue;
    }
    
    // Se não estamos processando um professor, pula este parágrafo
    if (!inProfessorSection) continue;
    
    // Adiciona este parágrafo à coleção do professor atual
    professorParagraphs.push(text);
    
    // Verifica se o parágrafo contém um email
    const emailLinks = paragraph.querySelectorAll('a');
    for (const link of emailLinks) {
      // Verifica se é um link de email
      if (link.href && link.href.toLowerCase().includes('mailto:')) {
        currentProfessor.email = link.textContent.trim();
        break;
      } 
      // Se não for mailto mas o texto contiver um email
      else if (link.textContent.includes('@ifc.edu.br')) {
        currentProfessor.email = link.textContent.trim();
        break;
      }
    }
    
    // Se não encontrou email em links, procura no texto do parágrafo
    if (!currentProfessor.email && text.includes('@ifc.edu.br')) {
      const emailMatch = text.match(/\S+@ifc\.edu\.br/i);
      if (emailMatch) {
        currentProfessor.email = emailMatch[0].trim();
      }
    }
    
    // Verifica se o parágrafo contém um link para o Lattes
    const lattesLinks = paragraph.querySelectorAll('a');
    for (const link of lattesLinks) {
      if (link.href && link.href.includes('lattes.cnpq.br')) {
        currentProfessor.lattes = link.href;
        break;
      }
    }
    
    // Processa informações de formação para determinar titulação e área
    processFormationInfo(text, currentProfessor);
  }
  
  // Adiciona o último professor processado
  if (inProfessorSection && currentProfessor.name) {
    processProfessorData(currentProfessor, professorParagraphs);
    professors.push({...currentProfessor});
    console.log(`Professor processado: ${currentProfessor.name}`);
  }
  
  // Faz uma última verificação para garantir dados completos
  professors.forEach(professor => {
    // Corrige titulação com base no gênero do nome
    correctTitleGender(professor);
  });
  
  console.log(`Total de ${professors.length} professores extraídos do corpo docente do IFC`);
  return professors;
}

/**
 * Corrige o gênero da titulação com base no nome do professor
 * @param {Object} professor - Objeto com dados do professor
 */
function correctTitleGender(professor) {
  // Lista de nomes tipicamente masculinos (primeiros nomes)
  const maleFirstNames = [
    'carlos', 'davi', 'diego', 'fábio', 'fabio', 'fabrício', 
    'fabricio', 'gabriel', 'manassés', 'manasses', 'pablo', 
    'rafael', 'wagner', 'wanderson'
  ];
  
  // Verifica se o primeiro nome está na lista de nomes masculinos
  const firstName = professor.name.split(' ')[0].toLowerCase();
  const isMale = maleFirstNames.includes(firstName);
  
  // Corrige o título com base no gênero
  if (isMale) {
    if (professor.title === 'Doutora') {
      professor.title = 'Doutor';
    } else if (professor.title === 'Mestra') {
      professor.title = 'Mestre';
    }
  } else {
    // Para nomes femininos
    if (professor.title === 'Doutor') {
      professor.title = 'Doutora';
    } else if (professor.title === 'Mestre') {
      professor.title = 'Mestra';
    }
  }
}

/**
 * Processa informações de formação acadêmica
 * @param {string} text - Texto do parágrafo
 * @param {Object} professor - Objeto com dados do professor
 */
function processFormationInfo(text, professor) {
  const lowerText = text.toLowerCase();
  
  // Determina a titulação mais alta (prioridade: Doutor > Mestre > Especialista > Graduado)
  if (lowerText.includes('doutorado') && (!professor.title || !professor.title.toLowerCase().includes('doutor'))) {
    professor.title = lowerText.includes('doutora') ? 'Doutora' : 'Doutor';
    
    // Extrai a área de especialização
    const areaMatch = text.match(/Doutorado\s+(?:em|na|no)?\s+([^\.]+?)(?:\.|\,|por|pela|pelo|\d|$)/i);
    if (areaMatch && areaMatch[1].trim().length > 3) {
      professor.area = areaMatch[1].trim();
    }
  } 
  else if (lowerText.includes('mestrado') && (!professor.title || 
            (professor.title.toLowerCase() !== 'doutor' && 
             professor.title.toLowerCase() !== 'doutora'))) {
    professor.title = 'Mestre';
    
    // Extrai a área de especialização se não tiver uma área de doutorado
    if (!professor.area || professor.area.length < 3) {
      const areaMatch = text.match(/Mestrado\s+(?:em|na|no)?\s+([^\.]+?)(?:\.|\,|por|pela|pelo|\d|$)/i);
      if (areaMatch && areaMatch[1].trim().length > 3) {
        professor.area = areaMatch[1].trim();
      }
    }
  }
  else if (lowerText.includes('especialização') && (!professor.title || 
            (professor.title.toLowerCase() !== 'doutor' && 
             professor.title.toLowerCase() !== 'doutora' &&
             professor.title.toLowerCase() !== 'mestre'))) {
    professor.title = 'Especialista';
    
    // Extrai a área de especialização se não tiver uma área de doutorado/mestrado
    if (!professor.area || professor.area.length < 3) {
      const areaMatch = text.match(/Especialização\s+(?:em|na|no)?\s+([^\.]+?)(?:\.|\,|por|pela|pelo|\d|$)/i);
      if (areaMatch && areaMatch[1].trim().length > 3) {
        professor.area = areaMatch[1].trim();
      }
    }
  }
  else if (lowerText.includes('graduação') && (!professor.title || professor.title === '')) {
    professor.title = 'Graduado';
    
    // Extrai a área de especialização se não tiver uma área melhor
    if (!professor.area || professor.area.length < 3) {
      const areaMatch = text.match(/Graduação\s+(?:em|na|no)?\s+([^\.]+?)(?:\.|\,|por|pela|pelo|\d|$)/i);
      if (areaMatch && areaMatch[1].trim().length > 3) {
        professor.area = areaMatch[1].trim();
      }
    }
  }
}

/**
 * Processa todos os dados coletados de um professor para extrair/refinar informações adicionais
 * @param {Object} professor - Objeto com dados do professor
 * @param {Array<string>} paragraphs - Array com textos de todos os parágrafos do professor
 */
function processProfessorData(professor, paragraphs) {
  // Junta todos os parágrafos para análise completa
  const fullText = paragraphs.join(' ');
  
  // Se ainda não tiver email, tenta encontrar no texto completo
  if (!professor.email) {
    const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      professor.email = emailMatch[0];
    }
  }
  
  // Se ainda não tiver lattes, tenta encontrar no texto completo
  if (!professor.lattes) {
    const lattesMatch = fullText.match(/https?:\/\/lattes\.cnpq\.br\/\d+/);
    if (lattesMatch) {
      professor.lattes = lattesMatch[0];
    }
  }
  
  // Remove qualquer formatação desnecessária nas propriedades de texto
  for (const prop in professor) {
    if (typeof professor[prop] === 'string') {
      professor[prop] = professor[prop].trim().replace(/\s+/g, ' ');
    }
  }
  
  // Se não tiver área definida mas tiver título, tenta definir uma área genérica
  if ((!professor.area || professor.area.length < 3) && professor.title) {
    // Procura por áreas comuns no texto completo
    const possibleAreas = [
      'Ciência da Computação', 'Sistemas de Informação', 'Engenharia', 
      'Matemática', 'Física', 'Direito', 'Administração', 'Letras'
    ];
    
    for (const area of possibleAreas) {
      if (fullText.includes(area)) {
        professor.area = area;
        break;
      }
    }
  }
  
  // Log para debug
  console.log('Dados processados:', { 
    nome: professor.name,
    titulo: professor.title || 'Não encontrado', 
    area: professor.area || 'Não encontrada',
    email: professor.email || 'Não encontrado',
    lattes: professor.lattes || 'Não encontrado'
  });
}

/**
 * Renderiza os professores na interface
 */
function renderProfessors() {
  // Atualiza a tabela de professores
  professorsList.innerHTML = '';
  displayedProfessors.forEach(professor => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td><img src="${professor.image}" alt="Foto de ${professor.name}" class="professor-img"></td>
      <td>${professor.name}</td>
      <td>${professor.title || 'Não informado'}</td>
      <td>${professor.area || 'Não informado'}</td>
      <td>${professor.email || 'Não informado'}</td>
      <td>${professor.lattes ? `<a href="${professor.lattes}" target="_blank" rel="noopener noreferrer">Currículo Lattes</a>` : 'Não informado'}</td>
    `;
    
    professorsList.appendChild(row);
  });
  
  // Atualiza os cartões de professores
  professorsCards.innerHTML = '';
  displayedProfessors.forEach(professor => {
    const card = document.createElement('div');
    card.className = 'professor-card';
    
    card.innerHTML = `
      <div class="card-img-container">
        <img src="${professor.image}" alt="Foto de ${professor.name}" class="card-img">
      </div>
      <div class="card-content">
        <h3 class="card-name">${professor.name}</h3>
        <p class="card-title">${professor.title || 'Titulação não informada'}</p>
        
        <p class="card-detail">
          <strong>Área:</strong> ${professor.area || 'Não informada'}
        </p>
        
        <p class="card-detail">
          <strong>Email:</strong> ${professor.email || 'Não informado'}
        </p>
        
        ${professor.lattes ? `
          <p class="card-detail">
            <strong>Currículo:</strong>
            <a href="${professor.lattes}" target="_blank" rel="noopener noreferrer" class="card-link">Lattes</a>
          </p>
        ` : ''}
      </div>
    `;
    
    professorsCards.appendChild(card);
  });
  
  // Exibe a mensagem de "Nenhum professor encontrado" se não houver resultados
  if (displayedProfessors.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Nenhum professor encontrado com os critérios de busca.';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '2rem';
    
    if (currentView === 'table') {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.colSpan = 6; // Número de colunas na tabela
      emptyCell.appendChild(emptyMessage);
      emptyRow.appendChild(emptyCell);
      professorsList.appendChild(emptyRow);
    } else {
      professorsCards.appendChild(emptyMessage);
    }
  }
  
  hideLoading();
  professorsContainer.classList.remove('hidden');
}

/**
 * Filtra os professores com base no termo de busca
 */
function filterProfessors() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm === '') {
    displayedProfessors = [...allProfessors];
  } else {
    displayedProfessors = allProfessors.filter(professor => {
      return (
        professor.name.toLowerCase().includes(searchTerm) ||
        (professor.title && professor.title.toLowerCase().includes(searchTerm)) ||
        (professor.area && professor.area.toLowerCase().includes(searchTerm)) ||
        (professor.email && professor.email.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  renderProfessors();
}

/**
 * Muda a visualização entre tabela e cartões
 * @param {string} view - O tipo de visualização ('table' ou 'cards')
 */
function changeView(view) {
  currentView = view;
  
  if (view === 'table') {
    tableView.classList.add('active');
    cardView.classList.remove('active');
    tableContainer.classList.remove('hidden');
    cardsContainer.classList.add('hidden');
  } else {
    tableView.classList.remove('active');
    cardView.classList.add('active');
    tableContainer.classList.add('hidden');
    cardsContainer.classList.remove('hidden');
  }
}

/**
 * Exporta os dados dos professores em formato CSV
 */
function exportAsCSV() {
  // Cabeçalho do CSV
  let csv = 'Nome,Titulação,Área,Email,Lattes\n';
  
  // Adiciona os dados de cada professor
  displayedProfessors.forEach(professor => {
    const row = [
      `"${professor.name || ''}"`,
      `"${professor.title || ''}"`,
      `"${professor.area || ''}"`,
      `"${professor.email || ''}"`,
      `"${professor.lattes || ''}"`
    ].join(',');
    
    csv += row + '\n';
  });
  
  // Cria um blob com o conteúdo CSV
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Cria um link para download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'professores_ciencia_computacao.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta os dados dos professores em formato JSON
 */
function exportAsJSON() {
  // Cria um blob com o conteúdo JSON
  const data = JSON.stringify(displayedProfessors, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  
  // Cria um link para download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'professores_ciencia_computacao.json');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exibe o indicador de carregamento e esconde os outros elementos
 */
function showLoading() {
  loadingElement.classList.remove('hidden');
  errorMessageElement.classList.add('hidden');
  professorsContainer.classList.add('hidden');
}

/**
 * Esconde o indicador de carregamento
 */
function hideLoading() {
  loadingElement.classList.add('hidden');
}

/**
 * Exibe a mensagem de erro
 */
function showError() {
  loadingElement.classList.add('hidden');
  errorMessageElement.classList.remove('hidden');
  professorsContainer.classList.add('hidden');
}

/**
 * Retorna dados mockados de professores para quando não for possível fazer o web scraping
 * @returns {Array} - Array de objetos com os dados dos professores
 */
function getMockProfessorsData() {
  return [
    {
      name: "Dr. Daniel Anderle",
      title: "Doutor em Ciência da Computação",
      area: "Algoritmos e Estruturas de Dados",
      email: "daniel.anderle@ifc.edu.br",
      lattes: "http://lattes.cnpq.br/",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f3f4'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='%23808080' text-anchor='middle' dy='.3em'>DA</text></svg>"
    },
    {
      name: "Prof. Angela Ribeiro",
      title: "Mestre em Ciência da Computação",
      area: "Banco de Dados e Sistemas Distribuídos",
      email: "angela.ribeiro@ifc.edu.br",
      lattes: "http://lattes.cnpq.br/",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f3f4'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='%23808080' text-anchor='middle' dy='.3em'>AR</text></svg>"
    },
    {
      name: "Dr. Leandro Mondini",
      title: "Doutor em Engenharia de Software",
      area: "Desenvolvimento Web e Dispositivos Móveis",
      email: "leandro.mondini@ifc.edu.br",
      lattes: "http://lattes.cnpq.br/",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f3f4'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='%23808080' text-anchor='middle' dy='.3em'>LM</text></svg>"
    },
    {
      name: "Dra. Manuela Santos",
      title: "Doutora em Sistemas de Informação",
      area: "Inteligência Artificial e Machine Learning",
      email: "manuela.santos@ifc.edu.br",
      lattes: "http://lattes.cnpq.br/",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f3f4'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='%23808080' text-anchor='middle' dy='.3em'>MS</text></svg>"
    },
    {
      name: "Prof. Roberto Silva",
      title: "Mestre em Computação",
      area: "Segurança da Informação",
      email: "roberto.silva@ifc.edu.br",
      lattes: "http://lattes.cnpq.br/",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f3f4'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='%23808080' text-anchor='middle' dy='.3em'>RS</text></svg>"
    },
    {
      name: "Dra. Carla Oliveira",
      title: "Doutora em Redes de Computadores",
      area: "Sistemas Operacionais e Redes",
      email: "carla.oliveira@ifc.edu.br",
      lattes: "http://lattes.cnpq.br/",
      image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f1f3f4'/><text x='50%' y='50%' font-family='Arial' font-size='24' fill='%23808080' text-anchor='middle' dy='.3em'>CO</text></svg>"
    }
  ];
}

