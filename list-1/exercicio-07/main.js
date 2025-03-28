// Seleção de elementos DOM
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultsScreen = document.getElementById('results-screen');
const startQuizBtn = document.getElementById('start-quiz');
const nextQuestionBtn = document.getElementById('next-question');
const restartQuizBtn = document.getElementById('restart-quiz');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers-container');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const totalQuestionsResultSpan = document.getElementById('total-questions-result');
const scoreSpan = document.getElementById('score');
const correctAnswersSpan = document.getElementById('correct-answers');
const finalScoreSpan = document.getElementById('final-score');
const performanceMessage = document.getElementById('performance-message');
const timerSpan = document.getElementById('timer');
const timerBar = document.getElementById('timer-bar');
const toggleThemeBtn = document.getElementById('toggle-theme');
const toggleAudioBtn = document.getElementById('toggle-audio');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const notification = document.getElementById('notification');
const bgMusic = document.getElementById('background-music');

// Variáveis de estado do quiz
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let selectedDifficulty = 'medium';
let timePerQuestion = 30; // Tempo em segundos
let timerInterval;
let selectedAnswer = null;
let isQuizEnded = false;

// Verificar se há tema salvo no localStorage
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-theme');
  toggleThemeBtn.innerText = '🌞';
}

// Verificar se o áudio deve estar ativado
const audioEnabled = localStorage.getItem('audio') !== 'muted';
updateAudioButton(audioEnabled);

// Event Listeners
toggleThemeBtn.addEventListener('click', toggleTheme);
toggleAudioBtn.addEventListener('click', toggleAudio);
startQuizBtn.addEventListener('click', startQuiz);
nextQuestionBtn.addEventListener('click', showNextQuestion);
restartQuizBtn.addEventListener('click', restartQuiz);

// Event listener para botões de dificuldade
difficultyBtns.forEach(button => {
  button.addEventListener('click', () => {
    difficultyBtns.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    selectedDifficulty = button.dataset.difficulty;
    
    // Ajustar tempo com base na dificuldade
    switch (selectedDifficulty) {
      case 'easy':
        timePerQuestion = 45;
        break;
      case 'medium':
        timePerQuestion = 30;
        break;
      case 'hard':
        timePerQuestion = 20;
        break;
      default:
        timePerQuestion = 30;
    }
  });
});

/**
 * Alterna entre os temas claro e escuro
 */
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  toggleThemeBtn.innerText = isDark ? '🌞' : '🌓';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  showNotification(`Tema ${isDark ? 'escuro' : 'claro'} ativado`);
}

/**
 * Ativa ou desativa o áudio de fundo
 */
function toggleAudio() {
  if (bgMusic.paused) {
    bgMusic.play().catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
    });
    localStorage.setItem('audio', 'enabled');
    updateAudioButton(true);
    showNotification('Música ativada');
  } else {
    bgMusic.pause();
    localStorage.setItem('audio', 'muted');
    updateAudioButton(false);
    showNotification('Música desativada');
  }
}

/**
 * Atualiza o botão de áudio com base no estado atual
 * @param {boolean} enabled - Se o áudio está ativado
 */
function updateAudioButton(enabled) {
  toggleAudioBtn.innerText = enabled ? '🔊' : '🔇';
}

/**
 * Carrega as perguntas do quiz com base na dificuldade selecionada
 */
function loadQuestions() {
  // Retorna uma promessa que será resolvida quando as perguntas forem carregadas
  return new Promise((resolve) => {
    // Perguntas por nível de dificuldade
    const questionsByDifficulty = {
      easy: [
        {
          question: "O que significa a sigla HTML?",
          answers: [
            { text: "Hyper Text Markup Language", correct: true },
            { text: "Hyper Transfer Markup Language", correct: false },
            { text: "High Tech Modern Language", correct: false },
            { text: "Hyperlink and Text Markup Language", correct: false }
          ]
        },
        {
          question: "Qual dessas linguagens é usada para estilizar páginas web?",
          answers: [
            { text: "JavaScript", correct: false },
            { text: "Python", correct: false },
            { text: "CSS", correct: true },
            { text: "PHP", correct: false }
          ]
        },
        {
          question: "Qual é o comando para listar arquivos em um diretório no Linux?",
          answers: [
            { text: "dir", correct: false },
            { text: "ls", correct: true },
            { text: "show", correct: false },
            { text: "list", correct: false }
          ]
        },
        {
          question: "Qual destas não é uma linguagem de programação?",
          answers: [
            { text: "Java", correct: false },
            { text: "Python", correct: false },
            { text: "HTML", correct: true },
            { text: "Ruby", correct: false }
          ]
        },
        {
          question: "O que é um algoritmo?",
          answers: [
            { text: "Um tipo de vírus de computador", correct: false },
            { text: "Uma sequência finita de instruções para resolver um problema", correct: true },
            { text: "Um componente físico do computador", correct: false },
            { text: "Um tipo de linguagem de programação", correct: false }
          ]
        },
        {
          question: "Qual desses é um sistema operacional?",
          answers: [
            { text: "Microsoft Word", correct: false },
            { text: "Adobe Photoshop", correct: false },
            { text: "Windows 10", correct: true },
            { text: "Google Chrome", correct: false }
          ]
        },
        {
          question: "O que significa a sigla USB?",
          answers: [
            { text: "Universal Serial Bus", correct: true },
            { text: "Unified System Block", correct: false },
            { text: "Ultra Speed Bandwidth", correct: false },
            { text: "Universal System Backup", correct: false }
          ]
        },
        {
          question: "O que é um navegador web?",
          answers: [
            { text: "Um programa para editar textos", correct: false },
            { text: "Um programa para navegar na internet", correct: true },
            { text: "Um antivírus", correct: false },
            { text: "Um sistema operacional", correct: false }
          ]
        },
        {
          question: "Qual dessas é uma unidade de armazenamento?",
          answers: [
            { text: "MHz", correct: false },
            { text: "GB", correct: true },
            { text: "DPI", correct: false },
            { text: "Mbps", correct: false }
          ]
        },
        {
          question: "O que é um pixel?",
          answers: [
            { text: "Um tipo de vírus", correct: false },
            { text: "O menor elemento de uma imagem digital", correct: true },
            { text: "Um dispositivo de entrada", correct: false },
            { text: "Uma linguagem de programação", correct: false }
          ]
        }
      ],
      medium: [
        {
          question: "Qual estrutura de dados opera no princípio LIFO (Last In, First Out)?",
          answers: [
            { text: "Fila", correct: false },
            { text: "Pilha", correct: true },
            { text: "Árvore Binária", correct: false },
            { text: "Lista Encadeada", correct: false }
          ]
        },
        {
          question: "Qual protocolo é usado para enviar e-mails?",
          answers: [
            { text: "FTP", correct: false },
            { text: "HTTP", correct: false },
            { text: "SMTP", correct: true },
            { text: "SSH", correct: false }
          ]
        },
        {
          question: "O que é um endereço IP?",
          answers: [
            { text: "Um identificador único para computadores em uma rede", correct: true },
            { text: "Um programa antivírus", correct: false },
            { text: "Um tipo de conexão de internet", correct: false },
            { text: "Um domínio de website", correct: false }
          ]
        },
        {
          question: "Qual é o principal componente de um computador onde ocorre o processamento de dados?",
          answers: [
            { text: "Memória RAM", correct: false },
            { text: "Disco Rígido", correct: false },
            { text: "Placa de Vídeo", correct: false },
            { text: "CPU", correct: true }
          ]
        },
        {
          question: "Qual dessas linguagens de programação é fortemente tipada?",
          answers: [
            { text: "JavaScript", correct: false },
            { text: "Python", correct: false },
            { text: "Java", correct: true },
            { text: "PHP", correct: false }
          ]
        },
        {
          question: "O que é SQL?",
          answers: [
            { text: "Uma linguagem de estilização", correct: false },
            { text: "Um sistema operacional", correct: false },
            { text: "Uma linguagem para consultas em bancos de dados", correct: true },
            { text: "Um protocolo de internet", correct: false }
          ]
        },
        {
          question: "Qual destes é um exemplo de memória não-volátil?",
          answers: [
            { text: "RAM", correct: false },
            { text: "Cache", correct: false },
            { text: "SSD", correct: true },
            { text: "Registradores da CPU", correct: false }
          ]
        },
        {
          question: "O que significa API?",
          answers: [
            { text: "Application Programming Interface", correct: true },
            { text: "Advanced Programming Interface", correct: false },
            { text: "Automated Program Installation", correct: false },
            { text: "Application Process Integration", correct: false }
          ]
        },
        {
          question: "Qual é o propósito de uma VPN?",
          answers: [
            { text: "Aumentar a velocidade da internet", correct: false },
            { text: "Criar uma conexão segura e privada", correct: true },
            { text: "Compartilhar arquivos entre computadores", correct: false },
            { text: "Eliminar vírus e malwares", correct: false }
          ]
        },
        {
          question: "O que é um framework em programação?",
          answers: [
            { text: "Um código malicioso", correct: false },
            { text: "Uma estrutura que serve de base para desenvolvimento de software", correct: true },
            { text: "Um componente físico do computador", correct: false },
            { text: "Um tipo de linguagem de baixo nível", correct: false }
          ]
        }
      ],
      hard: [
        {
          question: "Qual algoritmo de ordenação tem complexidade média O(n log n) e é estável?",
          answers: [
            { text: "Quick Sort", correct: false },
            { text: "Bubble Sort", correct: false },
            { text: "Merge Sort", correct: true },
            { text: "Selection Sort", correct: false }
          ]
        },
        {
          question: "Em redes de computadores, qual camada do modelo OSI é responsável pelo roteamento?",
          answers: [
            { text: "Camada de Rede", correct: true },
            { text: "Camada de Enlace", correct: false },
            { text: "Camada de Transporte", correct: false },
            { text: "Camada de Aplicação", correct: false }
          ]
        },
        {
          question: "O que é um deadlock em sistemas operacionais?",
          answers: [
            { text: "Um tipo de ataque cibernético", correct: false },
            { text: "Uma situação onde dois ou mais processos esperam por recursos que estão bloqueados entre si", correct: true },
            { text: "Um erro no código-fonte que impede a compilação", correct: false },
            { text: "Um vírus que bloqueia o sistema operacional", correct: false }
          ]
        },
        {
          question: "Qual técnica permite que múltiplos sistemas operacionais sejam executados simultaneamente em um mesmo computador?",
          answers: [
            { text: "Multiprocessamento", correct: false },
            { text: "Virtualização", correct: true },
            { text: "Multithreading", correct: false },
            { text: "Paginação", correct: false }
          ]
        },
        {
          question: "O que é uma árvore B+ em banco de dados?",
          answers: [
            { text: "Um algoritmo de criptografia", correct: false },
            { text: "Um tipo de diagrama de modelagem", correct: false },
            { text: "Uma estrutura de dados para indexação", correct: true },
            { text: "Um método de normalização", correct: false }
          ]
        },
        {
          question: "Qual dessas não é uma característica do paradigma de programação funcional?",
          answers: [
            { text: "Funções de primeira classe", correct: false },
            { text: "Imutabilidade", correct: false },
            { text: "Herança", correct: true },
            { text: "Transparência referencial", correct: false }
          ]
        },
        {
          question: "Qual o propósito do protocolo HTTPS?",
          answers: [
            { text: "Aumentar a velocidade de carregamento de páginas", correct: false },
            { text: "Comprimir arquivos para transferência", correct: false },
            { text: "Fornecer uma camada de segurança para comunicação na web", correct: true },
            { text: "Melhorar a indexação de páginas em motores de busca", correct: false }
          ]
        },
        {
          question: "O que é um ataque de injeção SQL?",
          answers: [
            { text: "Um ataque que sobrecarrega servidores com múltiplas requisições", correct: false },
            { text: "Uma técnica que explora vulnerabilidades em bancos de dados através de inputs maliciosos", correct: true },
            { text: "Um método para roubar cookies de sessão", correct: false },
            { text: "Um ataque que modifica o código-fonte de uma página web", correct: false }
          ]
        },
        {
          question: "Qual destes é um exemplo de um algoritmo de criptografia assimétrica?",
          answers: [
            { text: "AES", correct: false },
            { text: "DES", correct: false },
            { text: "RSA", correct: true },
            { text: "MD5", correct: false }
          ]
        },
        {
          question: "Em programação paralela, o que é uma condição de corrida (race condition)?",
          answers: [
            { text: "Um bug que faz o processador superaquecer", correct: false },
            { text: "Uma técnica para otimizar a velocidade de execução", correct: false },
            { text: "Uma situação onde duas threads competem por um mesmo recurso", correct: true },
            { text: "Um método para detectar deadlocks", correct: false }
          ]
        }
      ]
    };
    
    // Atualiza a quantidade total de perguntas na tela
    const questionsForCurrentDifficulty = questionsByDifficulty[selectedDifficulty];
    totalQuestionsSpan.innerText = questionsForCurrentDifficulty.length;
    totalQuestionsResultSpan.innerText = questionsForCurrentDifficulty.length;
    
    // Retorna as perguntas embaralhadas para a dificuldade selecionada
    resolve(shuffleArray(questionsForCurrentDifficulty));
  });
}

/**
 * Inicia o quiz
 */
function startQuiz() {
  // Carrega as perguntas e inicia o quiz
  loadQuestions().then((loadedQuestions) => {
    questions = loadedQuestions;
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    isQuizEnded = false;
    
    // Atualiza a pontuação e o contador de perguntas
    updateScore();
    updateQuestionCounter();
    
    // Esconde a tela inicial e mostra a tela de perguntas
    showScreen(questionScreen);
    
    // Exibe a primeira pergunta
    displayQuestion();
    
    // Inicia a música de fundo se estiver habilitada
    if (localStorage.getItem('audio') !== 'muted') {
      bgMusic.play().catch(error => {
        console.error('Erro ao reproduzir áudio:', error);
      });
    }
  });
}

/**
 * Exibe a pergunta atual
 */
function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionText.innerText = currentQuestion.question;
  
  // Limpa o container de respostas
  answersContainer.innerHTML = '';
  
  // Adiciona as respostas
  currentQuestion.answers.forEach((answer, index) => {
    const answerButton = document.createElement('button');
    answerButton.classList.add('answer-btn');
    answerButton.innerText = answer.text;
    answerButton.dataset.index = index;
    answerButton.setAttribute('aria-label', `Alternativa ${index + 1}: ${answer.text}`);
    
    // Adiciona event listener para selecionar a resposta
    answerButton.addEventListener('click', () => selectAnswer(index));
    
    answersContainer.appendChild(answerButton);
  });
  
  // Reseta o estado da resposta selecionada
  selectedAnswer = null;
  
  // Oculta o botão de próxima pergunta
  nextQuestionBtn.classList.add('hidden');
  
  // Inicia o timer
  startTimer();
}

/**
 * Seleciona uma resposta
 * @param {number} index - O índice da resposta selecionada
 */
function selectAnswer(index) {
  // Ignora se o quiz terminou
  if (isQuizEnded) return;
  
  // Limpa o timer
  clearInterval(timerInterval);
  
  const currentQuestion = questions[currentQuestionIndex];
  const answerButtons = document.querySelectorAll('.answer-btn');
  
  // Remove a classe 'selected' de todos os botões
  answerButtons.forEach(button => button.classList.remove('selected'));
  
  // Adiciona a classe 'selected' ao botão selecionado
  answerButtons[index].classList.add('selected');
  
  // Verifica se a resposta está correta
  const isCorrect = currentQuestion.answers[index].correct;
  
  // Marca a resposta como correta ou incorreta
  answerButtons.forEach((button, i) => {
    const buttonAnswer = currentQuestion.answers[i];
    if (buttonAnswer.correct) {
      button.classList.add('correct');
    } else if (i === index && !isCorrect) {
      button.classList.add('incorrect');
    }
    
    // Desabilita todos os botões após a seleção
    button.disabled = true;
  });
  
  // Atualiza a pontuação se a resposta estiver correta
  if (isCorrect) {
    correctAnswers++;
    
    // Calcula a pontuação com base no tempo restante
    const timeBonus = parseInt(timerSpan.innerText);
    const difficultyMultiplier = getDifficultyMultiplier();
    const pointsForQuestion = 10 + (timeBonus * difficultyMultiplier);
    
    score += pointsForQuestion;
    updateScore();
    
    showNotification(`Correto! +${pointsForQuestion} pontos`);
  } else {
    showNotification('Incorreto! Tente na próxima.');
  }
  
  // Mostra o botão de próxima pergunta
  nextQuestionBtn.classList.remove('hidden');
  selectedAnswer = index;
}

/**
 * Retorna o multiplicador de pontos com base na dificuldade
 */
function getDifficultyMultiplier() {
  switch (selectedDifficulty) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'hard': return 3;
    default: return 1;
  }
}

/**
 * Mostra a próxima pergunta ou finaliza o quiz se for a última
 */
function showNextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    updateQuestionCounter();
    displayQuestion();
  } else {
    endQuiz();
  }
}

/**
 * Finaliza o quiz e mostra a tela de resultados
 */
function endQuiz() {
  isQuizEnded = true;
  
  // Para o cronômetro se ele estiver rodando
  clearInterval(timerInterval);
  
  // Configura a tela de resultados
  finalScoreSpan.innerText = score;
  correctAnswersSpan.innerText = correctAnswers;
  
  // Exibe mensagem de desempenho com base na porcentagem de acertos
  const percentage = (correctAnswers / questions.length) * 100;
  let message = '';
  
  if (percentage >= 90) {
    message = '<div class="success-message">Excelente! Você é um especialista em computação!</div>';
  } else if (percentage >= 70) {
    message = '<div class="good-message">Muito bom! Você tem um conhecimento sólido em computação.</div>';
  } else if (percentage >= 50) {
    message = '<div class="average-message">Bom trabalho! Você tem um conhecimento básico em computação.</div>';
  } else {
    message = '<div class="improvement-message">Continue estudando! Você está no caminho certo para melhorar seus conhecimentos.</div>';
  }
  
  performanceMessage.innerHTML = message;
  
  // Exibe a tela de resultados
  showScreen(resultsScreen);
}

/**
 * Reinicia o quiz
 */
function restartQuiz() {
  showScreen(startScreen);
}

/**
 * Inicia o cronômetro para a pergunta atual
 */
function startTimer() {
  // Reseta o timer para o tempo definido
  let timeLeft = timePerQuestion;
  timerSpan.innerText = timeLeft;
  
  // Remove classes de alerta do timer
  timerSpan.classList.remove('timer-warning');
  
  // Configura o timer bar para iniciar em 100%
  timerBar.style.setProperty('--timer-width', '100%');
  
  // Inicia o cronômetro
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerSpan.innerText = timeLeft;
    
    // Atualiza a largura da barra de tempo
    const percentage = (timeLeft / timePerQuestion) * 100;
    timerBar.style.setProperty('--timer-width', `${percentage}%`);
    
    // Adiciona classe de alerta quando o tempo estiver acabando
    if (timeLeft <= 5) {
      timerSpan.classList.add('timer-warning');
    }
    
    // Encerra o tempo quando chegar a zero
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timeUp();
    }
  }, 1000);
}

/**
 * Função chamada quando o tempo acaba
 */
function timeUp() {
  // Marca todas as respostas com as cores corretas
  const currentQuestion = questions[currentQuestionIndex];
  const answerButtons = document.querySelectorAll('.answer-btn');
  
  answerButtons.forEach((button, i) => {
    if (currentQuestion.answers[i].correct) {
      button.classList.add('correct');
    }
    button.disabled = true;
  });
  
  showNotification('Tempo esgotado!');
  nextQuestionBtn.classList.remove('hidden');
}

/**
 * Atualiza o contador de perguntas
 */
function updateQuestionCounter() {
  currentQuestionSpan.innerText = currentQuestionIndex + 1;
}

/**
 * Atualiza a pontuação
 */
function updateScore() {
  scoreSpan.innerText = score;
}

/**
 * Exibe uma tela específica e esconde as outras
 * @param {HTMLElement} screen - A tela a ser exibida
 */
function showScreen(screen) {
  // Esconde todas as telas
  startScreen.classList.add('hidden');
  questionScreen.classList.add('hidden');
  resultsScreen.classList.add('hidden');
  
  // Mostra apenas a tela especificada
  screen.classList.remove('hidden');
}

/**
 * Exibe uma notificação temporária
 * @param {string} message - A mensagem a ser exibida
 */
function showNotification(message) {
  notification.innerText = message;
  notification.classList.remove('hidden');
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

/**
 * Embaralha um array (Algoritmo de Fisher-Yates)
 * @param {Array} array - O array a ser embaralhado
 * @returns {Array} - O array embaralhado
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Seleciona a dificuldade média por padrão
document.querySelector('[data-difficulty="medium"]').classList.add('selected');
