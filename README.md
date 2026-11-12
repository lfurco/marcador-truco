# Marcador de Truco

Marcador de truco simples, feito para usar na mesa pelo celular. Sem instalação, sem cadastro: abriu, jogou.

**Use aqui:** https://lfurco.github.io/marcador-truco/

<!-- Depois de publicar, tire um print do celular, salve como print.png e descomente a linha abaixo -->
<!-- ![Marcador de Truco no celular](print.png) -->

## O que faz

- Placar de dois times, com nomes editáveis (toque no nome).
- Botões de **+1**, **truco (+3)**, **seis (+6)**, **nove (+9)** e **doze (+12)**.
- Botão de **−1** para ajustar o placar de cada time, sem deixar os pontos abaixo de zero.
- Cada ponto acende um palito de fósforo, como no caderninho de truco.
- Vitória ao chegar a **15 pontos**, com opção de corrigir o placar diminuindo um ponto ou iniciar a próxima partida.
- Contagem de partidas ganhas, com opção para zerar as vitórias.
- O placar fica salvo no navegador (`localStorage`), então não se perde se a página recarregar.
- Mantém a tela acesa durante o jogo, nos navegadores que permitem.

## Como rodar no seu computador

Não precisa de build nem de dependências. Baixe o repositório e abra o `index.html` no navegador.

## Como publicar no GitHub Pages

1. Crie um repositório público chamado `marcador-truco` no GitHub.
2. Envie os arquivos:

   ```bash
   git init
   git add .
   git commit -m "Primeira versão do marcador de truco"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/marcador-truco.git
   git push -u origin main
   ```

3. No repositório, vá em **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**, selecione a branch `main` e a pasta `/ (root)`, e clique em **Save**.
5. Espere um ou dois minutos. O site fica em `https://SEU-USUARIO.github.io/marcador-truco/`.

## Estrutura

```
index.html   estrutura da página
style.css    visual
script.js    placar, ajustes de pontos, vitórias e salvamento
```

## Ideias para as próximas versões

- Modo escuro/claro à escolha.
- Instalar como app no celular (PWA), funcionando sem internet.
- Histórico das últimas partidas.
- Regra da "mão de onze".

## Licença

MIT
