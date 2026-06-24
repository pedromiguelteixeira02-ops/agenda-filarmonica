# 🎼 Agenda Filarmónica

App para bandas filarmónicas gerirem **calendário** (serviços/ensaios, valores recebidos) e
**assiduidade** (votação de presença por grupo/secção). Funciona offline como PWA e guarda os
dados no próprio dispositivo (`localStorage`).

## Como correr (desenvolvimento)

Precisas de ter o [Node.js](https://nodejs.org) instalado (versão 20+).

```bash
npm install      # instala as dependências (só na 1.ª vez)
npm run dev      # arranca em http://localhost:5173
```

## Outros comandos

```bash
npm run build      # gera a versão de produção em dist/ (corre também o typecheck)
npm run preview    # serve localmente a versão de produção
npm run typecheck  # só verifica os tipos TypeScript
```

## Estrutura

```
src/
├── main.tsx        # arranque da app + registo do service worker (PWA)
├── App.tsx         # layout, abas e estado de topo
├── types/          # tipos TypeScript (Event, Band, Group, ...)
├── data/           # constantes (bandas, meses) e dados iniciais (seed)
├── lib/            # utilitários: datas, ids, PDF, e a CAMADA DE DADOS
│   ├── storage.ts        # interface da camada de dados
│   └── localStorageRepo.ts  # implementação atual (localStorage)
├── hooks/          # useEvents, useGroup
├── styles/         # CSS global (variáveis + utilitários partilhados)
└── components/     # UI por área (agenda, next, groups, modal, header)
```

### Trocar localStorage por um servidor no futuro

Toda a UI fala com a interface `AgendaRepository` em [src/lib/storage.ts](src/lib/storage.ts).
Para passar a dados partilhados entre dispositivos (ex.: votos de grupo em tempo real), basta
criar uma nova implementação (ex.: `apiRepo.ts`) e trocá-la na linha `export const repo` — sem
mexer nos componentes.

## Deploy (GitHub Pages)

O workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) faz build e publica
automaticamente em cada push para `main`. No GitHub, em **Settings → Pages**, escolhe
**Source: GitHub Actions**. O `base` do site está configurado para `/agenda-filarmonica/` em
[vite.config.ts](vite.config.ts) — se o repositório tiver outro nome, ajusta aí.
