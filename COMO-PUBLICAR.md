# Como publicar o site no HostGator (cPanel)

Site institucional da Bellus Eventos. É 100% estático (HTML, CSS, JS): não precisa de Node, banco nem build. É só enviar os arquivos para o `public_html`.

## Arquivos que sobem (mantendo a estrutura)

```
index.html
styles.css
script.js
robots.txt
sitemap.xml
assets/
  logo_bellus.png
```

## Passo a passo

1. **Faça um backup do site atual** (importante): no cPanel, em *Gerenciador de Arquivos* > `public_html`, selecione tudo o que já existe e compacte em um `.zip` (ou baixe), para poder voltar se precisar.
2. Ainda no *Gerenciador de Arquivos*, entre em **`public_html`** (a pasta do domínio `belluseventos.com.br`).
3. Apague (ou mova para uma subpasta `antigo/`) os arquivos do site atual.
4. **Envie os arquivos novos.** Duas formas:
   - Arraste os arquivos e a pasta `assets/` direto na janela de upload, **ou**
   - Compacte esta pasta inteira em um `.zip`, envie o `.zip` para o `public_html` e use **Extrair** no próprio cPanel. Confira que `index.html` ficou na raiz do `public_html` (e não dentro de uma subpasta).
5. Confirme que existe a pasta `assets/` com o `logo_bellus.png` dentro.
6. Acesse **https://belluseventos.com.br** e teste. Se já houver SSL (cadeado), ótimo; se não, ative o **AutoSSL** em *SSL/TLS Status*.

## O formulário já funciona sozinho

O formulário de "Consultar disponibilidade" já está ligado ao seu Supabase (função `create-lead-bellus`). Assim que o site estiver no ar, todo envio cai na tabela `leads` com `origem = 'site-bellus'`, junto com os leads do Noiva dos Sonhos. **Não precisa configurar nada.**

> Teste real: depois de publicar, preencha o formulário uma vez com seus dados e confirme que o lead apareceu no Supabase.

## Editar depois

- **Textos:** abra o `index.html` e edite o texto entre as tags. Salve e reenvie o arquivo.
- **Logo:** troque o arquivo `assets/logo_bellus.png` por outro com o mesmo nome.
- **Cores/estilo:** ficam todas no topo do `styles.css` (bloco `:root`).
- **WhatsApp / redes:** estão no rodapé do `index.html` (procure por `wa.me` e `instagram`).

## Detalhe técnico (caso precise)

A função do formulário e a chave pública estão no topo do `script.js`. A chave é *publishable* (feita para o navegador); ela não dá acesso de leitura aos leads, apenas permite o envio pela função. Não exponha nunca a *service role key* (essa fica só dentro do Supabase).
