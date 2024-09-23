# DesenWebI-lista-2024 - Lista 1

Lista de exercícios para os alunos praticarem programação web na disciplina Desenvolvimento Web I no curso de ciência da computação do IFC Videira. A lista contém exercícios práticos para serem resolvidos com HTML, CSS e JavaScript.

## Estrutura de diretórios

Crie a estrutura de diretórios abaixo para organizar os exercícios:

```
DesenWebI-lista-2024
│   README.md
│
└───exercicios
│   │
│   └───exercicio-xx
│   │   │   index.html
│   │   │   style.css
│   │   │   main.js
│   │   │   ...
│   │
```

## Instruções

Para cada exercício, crie um diretório `exercicio-xx` onde `xx` é o número do exercício. Dentro do diretório, crie os arquivos `index.html`, `style.css`, `main.js` e demais recursos para a solução do exercício. O aluno pode fazer um `fork` deste repositório para resolver os exercícios ou criar um repositório próprio.

Além disso, siga essas boas práticas em todos os exercícios:
   - [x] Adicionar meta tags para a codificação do documento (UTF-8), viewport.
   - [x] Adicionar responsividade ao sistema para ser acessível em dispositivos móveis.
   - [x] Normalizar o estilo do sistema com CSS. Pode usar uma biblioteca externa para isso ou normalizar pelo menos os espaçamentos e tamanhos de fonte.
   - [x] Usar tags semânticas no HTML.
   - [x] Adicionar favicon.
   - [x] Usar [funções puras no JavaScript]([https://](https://medium.com/@allangrds/o-que-%C3%A9-uma-fun%C3%A7%C3%A3o-pura-em-javascript-2b34edcad8e2)) sempre que possível.
   - [x] Não usar frameworks ou bibliotecas externas, apenas HTML, CSS e JavaScript puro. Caso seja necessário, justificar o uso.

## Lista de Exercícios 1

1. Use o conteúdo HTML abaixo contém a estrutura base para uma página com barra de navegação (logotipo a esquerda e menu a direita), cabeçalho, conteúdo principal dividido em três colunas e rodapé. Adicione o estilo CSS para organizar os elementos. Use 3 estilos diferentes para organizar o conteúdo:
   - [x] Estilo 1: use `display: block` com `float`.
   - [x] Estilo 2: use `display: flex` com `flex-direction`, `justify-content`, `align-items`, etc
   - [x] Estilo 3: use `display: grid` com `grid-template-columns`, `grid-template-areas`, etc

```html
<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TITULO AQUI</title>
    <meta name="description" content="DESCRICAO AQUI" />
    <meta name="author" content="SEU_NOME" />

    <link rel="stylesheet" href="style.css" />
  </head>

  <body>
    <nav class="navbar clearfix">
      <a href="#" class="logo">Logotipo</a>
      <div id="menu">
        <ul>
          <li class="menu-item">
            <a class="menu-link" href="#">Parceiros</a>
          </li>
          <li class="menu-item">
            <a class="menu-link" href="#">Contato</a>
          </li>
          <li class="menu-item">
            <a class="menu-link" href="#">Sobre</a>
          </li>
        </ul>
      </div>
    </nav>

    <main>
      <div class="jumbotron">
        <div class="container clearfix">
          <h1>Hello, world!</h1>
          <p>
            This is a template for a simple marketing or informational website.
            It includes a large callout called a jumbotron and three supporting
            pieces of content. Use it as a starting point to create something
            more unique.
          </p>
          <p>
            <a class="btn btn-primary">Learn more</a>
          </p>
        </div>
      </div>

      <div class="container clearfix">
        <div class="linha">
          <div class="coluna">
            <h2>Heading</h2>
            <p>
              Donec id elit non mi porta gravida at eget metus. Fusce dapibus,
              tellus ac cursus commodo, tortor mauris condimentum nibh, ut
              fermentum massa justo sit amet risus. Etiam porta sem malesuada
              magna mollis euismod. Donec sed odio dui.
            </p>
            <p>
              <a class="btn btn-small btn-secondary">View details</a>
            </p>
          </div>
          <div class="coluna">
            <h2>Heading</h2>
            <p>
              Donec id elit non mi porta gravida at eget metus. Fusce dapibus,
              tellus ac cursus commodo, tortor mauris condimentum nibh, ut
              fermentum massa justo sit amet risus. Etiam porta sem malesuada
              magna mollis euismod. Donec sed odio dui.
            </p>
            <p>
              <a class="btn btn-small btn-secondary">View details</a>
            </p>
          </div>
          <div class="coluna">
            <h2>Heading</h2>
            <p>
              Donec id elit non mi porta gravida at eget metus. Fusce dapibus,
              tellus ac cursus commodo, tortor mauris condimentum nibh, ut
              fermentum massa justo sit amet risus. Etiam porta sem malesuada
              magna mollis euismod. Donec sed odio dui.
            </p>
            <p>
              <a class="btn btn-small btn-secondary">View details</a>
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer>
      <p>© SEU_NOME 2024</p>
    </footer>
  </body>
</html>
```

2. Criar um sistema web para uma lista de tarefas. O sistema deve permitir adicionar, remover e marcar como concluída uma tarefa. Além disso, faça:
   - [x] Adicionar um campo de texto para filtrar as tarefas por nome.
   - [x] Armazenar as tarefas no `localStorage` para que elas não sejam perdidas ao recarregar a página.
   - [x] Popular a lista de tarefas com alguns dados fictícios, caso o `localStorage` esteja vazio.
   - [x] Identificar as tarefas concluídas de alguma maneira.
   - [x] Adicionar uma família de fonte externa ao sistema. Pode ser do Google Fonts ou de outra fonte de sua escolha.
   - [x] Adicionar a opção de escolher entre temas claro e escuro. Salvar a escolha no `localStorage`.
   - [x] **Acessibilidade**: respeitar o critério 1.3.1 sobre informações e relações da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 2.1.1 sobre teclado da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [ ] (opcional): Adicionar animações de transição ao adicionar, remover e marcar como concluída uma tarefa.

3. A página picsum.photos contém uma API que retorna imagens aleatórias. Crie um sistema web que tenha um formulário para o usuário informar a largura e a altura da imagem que deseja e a quantidade de imagens (escolher entre 3, 5, 10 ou 20). Ao clicar em um botão, o sistema deve exibir as imagens retornadas pela API. O resultado deve ser organizado como um grid de imagens. Permita que o usuário possa baixar a imagem que desejar em tamanho Full HD. As imagens precisam estar no formato `webp`. Leia a documentação da API para saber como fazer a requisição: [https://picsum.photos/](https://picsum.photos/). Além disso, faça:
   - [x] Adicionar validação de formulário para os campos de largura, altura e quantidade de imagens. Caso o usuário informe um valor inválido, exibir uma mensagem de erro. Use html5 e/ou JavaScript para fazer a validação. Traga valores padrões para os campos.
   - [x] Adicionar um botão/link para copiar o link da imagem. Use a API `navigator.clipboard` para fazer isso.
   - [x] Adicionar um botão/link para compartilhar a imagem no WhatsApp, por e-mail ou outra rede social.
   - [x] **Acessibilidade**: respeitar o critério 1.1.1 sobre conteúdo não textual da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 1.4.3 sobre contraste mínimo da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 2.4.4 sobre foco visível da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).

4. Criar um sistema web que permita ao usuário tirar uma foto com a câmera do dispositivo e marcar a localização da foto em um mapa. O sistema deve exibir a foto tirada e a localização no mapa. Além disso, faça:
   - [x] Adicionar um botão para tirar a foto. Use a API `navigator.mediaDevices.getUserMedia` para acessar a câmera do dispositivo. Caso o dispositivo não tenha câmera, permitir que o usuário faça o upload de uma foto.
   - [x] Adicionar um botão para marcar a localização da foto no mapa. Use a API `navigator.geolocation` para acessar a localização do dispositivo. Caso o dispositivo não tenha GPS, permitir que o usuário informe a localização manualmente.
   - [x] Adicionar um campo de texto para o usuário informar título (obrigatório) e descrição (opcional) da foto.
   - [x] Armazenar a foto e a localização no `localStorage` para que elas não sejam perdidas ao recarregar a página.
   - [x] Criar uma tabela para exibir id, título, descrição, localização e data da foto. Adicionar um botão para visualizar detalhes da foto em uma modal ou em outra página. Para a localização, exibir um mapa com a localização marcada.
   - [x] Adicionar um botão para excluir o registro. Exibir um modal de confirmação antes de excluir a foto.
   - [x] Adicionar um botão para editar o registro. Exibir um formulário com os campos preenchidos para que o usuário possa editar o registro.
   - [ ] (opcional) Adicionar um botão para compartilhar a foto e a localização em redes sociais.

5. Criar uma SinglePageApplication (SPA) para exibir informações básicas sobre você como estudante. A SPA deve conter as seguintes páginas:
   - [x] Home: exibir uma foto sua, seu nome, curso, semestre, e-mail e uma rede social para contato.
   - [x] Sobre: exibir um texto curto sobre você, alguns hobbies, habilidades, projetos desenvolvidos, etc.
   - [x] Contato: exibir um formulário para o usuário enviar uma mensagem para você. O formulário deve conter os campos nome, e-mail, assunto e mensagem. Adicionar validação de formulário para os campos obrigatórios. Use html5 e/ou JavaScript para fazer a validação. Adicionar também algumas redes sociais para contato.
   - [x] Adicionar um menu de navegação para alternar entre as páginas. Use a API `history.pushState` para navegar entre as páginas sem recarregar a página.
   - [x] Adicionar um botão para alternar entre os temas claro e escuro. Salvar a escolha no `localStorage`.
   - [x] **Acessibilidade**: respeitar o critério 1.4.4 sobre redimensionamento de texto da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 3.3.2 sobre rótulos ou instruções da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 4.1.2 sobre nome, função e valor da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [ ] (opcional) Implementar o envio de e-mail (SMTP) para o seu e-mail pessoal ao enviar o formulário de contato.

6. Criar um site de e-commerce para uma loja de informática ou outro tema. O site deve conter as seguintes páginas:
   - [x] Página Inicial: exibir todos os produtos disponíveis para venda. Adicionar filtros para pesquisar produtos por categoria e marca. Adicione um campo de busca para pesquisar produtos por nome.
   - [x] Detalhes do produto: exibir informações detalhadas sobre o produto, como nome, descrição, preço, fotos, etc.
   - [x] Carrinho de compras: exibir os produtos adicionados ao carrinho, quantidade, preço total, etc. Permitir adicionar, remover e alterar a quantidade de produtos no carrinho.
   - [x] Checkout: exibir um formulário para o usuário informar os dados de entrega e pagamento.
   - [x] Navegação: adicionar um menu de navegação para alternar entre as páginas. Escolha um menu de navegação que seja acessível e responsivo em dispositivos móveis. 
   - [x] Rodapé: exibir informações sobre a loja, formas de pagamento, redes sociais, etc.
   - [x] Adicionar um botão para adicionar o produto ao carrinho. Use a API `localStorage` para armazenar os produtos no carrinho.
   - [x] Adicionar um botão para remover o produto do carrinho. Exibir uma página ou modal de confirmação antes de remover o produto.
   - [x] Adicionar um botão para finalizar a compra. Exibir uma página ou modal de confirmação antes de finalizar a compra.
   - [x] **Acessibilidade**: respeitar o critério 2.4.3 sobre foco do alvo da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 3.3.1 sobre identificação de erros da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 4.1.1 sobre nome, função e valor da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [ ] (opcional) Adicionar um sistema de avaliação de produtos com estrelas. Permitir que o usuário possa avaliar e comentar sobre o produto.
   - [ ] (opcional) Usar uma API de pagamento, como o PayPal ou Stripe, para simular o pagamento.
   - [ ] (opcional) Adicionar um sistema de recomendação de produtos baseado nas preferências do usuário.

Os produtos podem estar disponíveis em um arquivo JSON (Exemplo abaixo) ou em uma API externa como [https://dummyjson.com/docs/products](https://dummyjson.com/docs/products).

```json
[
  {
    "id": 1,
    "name": "Notebook",
    "description": "Notebook Dell Inspiron 15 3000",
    "price": 2999.99,
    "category": "Notebook",
    "brand": "Dell",
    "images": ["notebook-dell.jpg", "notebook-dell-2.jpg"]
  },
  {
    "id": 2,
    "name": "Monitor",
    "description": "Monitor LG 24' LED Full HD",
    "price": 899.99,
    "category": "Monitor",
    "brand": "LG",
    "images": ["monitor-lg.jpg", "monitor-lg-2.jpg"]
  },
  {
    "id": 3,
    "name": "Teclado",
    "description": "Teclado Mecânico Gamer HyperX Alloy FPS",
    "price": 299.99,
    "category": "Teclado",
    "brand": "HyperX",
    "images": ["teclado-hyperx.jpg", "teclado-hyperx-2.jpg"]
  }
]
```

7. Criar um jogo estilo quiz para testar os conhecimentos dos usuários sobre um determinado tema relacionado a computação. O jogo deve conter as seguintes funcionalidades:
   - [x] Página inicial: exibir uma breve descrição do jogo e um botão para iniciar o quiz.
   - [x] Perguntas: exibir uma pergunta por vez com 4 alternativas de resposta. Adicionar um cronômetro para limitar o tempo de resposta. Adicionar um botão para avançar para a próxima pergunta.
   - [x] Resultado: exibir a pontuação final do usuário e um botão para reiniciar o quiz.
   - [x] Adicionar um botão para iniciar o quiz. Use a API `fetch` para carregar as perguntas de um arquivo JSON.
   - [x] Adicionar um botão para avançar para a próxima pergunta. Use a API `fetch` para carregar a próxima pergunta.
   - [x] Adicionar um cronômetro para limitar o tempo de resposta. Use a API `setInterval` para atualizar o cronômetro a cada segundo. Exibir uma mensagem de tempo esgotado caso o usuário não responda a tempo e finalizar o quiz.
   - [x] Adicionar um botão para reiniciar o quiz. Use a API `fetch` para carregar as perguntas novamente.
   - [x] Adicionar transições de animação ao exibir as perguntas e o resultado.
   - [x] Adicionar uma pontuação para cada pergunta respondida corretamente. Exibir a pontuação final do usuário ao final do quiz.
   - [x] Adicionar uma opção para o usuário escolher o nível de dificuldade do quiz (fácil, médio, difícil).
   - [x] Adicionar uma música de fundo ao jogo. Permitir que o usuário possa mutar a música.
   - [x] **Acessibilidade**: respeitar o critério 2.4.7 sobre foco visível da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 3.3.3 sobre sugestão de erro da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] **Acessibilidade**: respeitar o critério 4.1.3 sobre status ou erros da WCAG disponível em: [https://www.guia-wcag.com/](https://www.guia-wcag.com/).
   - [x] *(opcional)* Inteligência Artificial: adicionar integração com uma API de IA para gerar perguntas automaticamente. Use a API `fetch` para carregar as perguntas da IA.

8. Usar uma estratégia de `web scrapping` para coletar informações sobre o corpo docente do curso (disponível em: [https://videira.ifc.edu.br/ciencia-da-computacao/corpo-docente/](https://videira.ifc.edu.br/ciencia-da-computacao/corpo-docente/)). O sistema deve conter as seguintes funcionalidades:
   - [x] Adicionar um campo de busca para filtrar professores por nome.
   - [x] Exibir as informações coletadas em uma tabela ou cards.
   - [x] Adicione um "loading" enquanto as informações são carregadas.
   - [x] Adicionar um botão para exportar as informações para um arquivo CSV ou JSON.