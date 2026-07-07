# GITHUB_PAGES_3D_AGENT_DESIGN.md

> Инструкция для coding agents / Codex / Copilot / Claude Code по реализации статического сайта на GitHub Pages с премиальным 3D-визуалом.  
> Цель: получить реалистичный, производительный, не-шаблонный сайт с 3D-скульптурой, который можно безопасно деплоить на GitHub Pages.

---

## 0. Как использовать этот файл

Этот файл должен лежать в репозитории и быть подключен из `AGENTS.md` или аналогичного файла инструкций для агента.

Рекомендуемая структура:

```txt
/project-root
  AGENTS.md
  GITHUB_PAGES_3D_AGENT_DESIGN.md
  package.json
  vite.config.ts
  index.html
  /src
    /components
    /styles
    /three
  /public
    /models
      sculpture.glb
    /images
      sculpture-poster.webp
    /textures
```

Добавить в `AGENTS.md`:

```md
# UI / Design / GitHub Pages Rules

- Before changing UI, layout, animation, assets, routing, or deployment, read `GITHUB_PAGES_3D_AGENT_DESIGN.md`.
- This project deploys to GitHub Pages. Treat it as a static frontend deployment.
- Do not add backend-only features, server secrets, SSR-only logic, database writes, or server API routes.
- Build static-first: content and layout must work before 3D loads.
- Implement the premium 3D sculpture direction from the design guide. Do not produce a generic SaaS template.
- Respect performance budgets, mobile fallback, accessibility, reduced-motion, and GitHub Pages path rules.
- After UI work, run build, preview the production bundle, and check that asset paths work under GitHub Pages base path.
```

---

## 1. Реалистичная модель GitHub Pages

### 1.1 Что GitHub Pages реально подходит делать

GitHub Pages подходит для:

- статического сайта: HTML, CSS, JavaScript, изображения, шрифты, GLB/GLTF/текстуры;
- клиентского React/Vite-приложения;
- клиентского WebGL/Three.js/React Three Fiber;
- одностраничного лендинга;
- статической документации, портфолио, промо-сайта, демо-страницы;
- деплоя через GitHub Actions после `npm run build`;
- кастомного домена;
- статических JSON-файлов в репозитории;
- внешних публичных API, если они вызываются напрямую из браузера и не требуют секретов.

### 1.2 Что GitHub Pages не должен делать

Не реализовывать на GitHub Pages напрямую:

- backend runtime: Node.js server, Express, FastAPI, PHP, Python server;
- server-side rendering как runtime-функцию;
- API routes, которые должны выполняться на сервере;
- авторизацию с секретами на сервере;
- хранение private API keys;
- платежи или sensitive transactions;
- формы, которые требуют серверной обработки без внешнего сервиса;
- realtime WebSocket server;
- базу данных;
- защищенный dashboard с приватными данными;
- heavy e-commerce или SaaS как основной коммерческий runtime.

### 1.3 Что делать, если нужна серверная логика

Использовать внешний backend, а GitHub Pages оставить только как frontend:

```txt
GitHub Pages frontend
  → Cloudflare Worker / Vercel Function / Netlify Function / Supabase Edge Function
  → external API / database / auth provider
```

Правило для агента:

> Никогда не помещать secret keys в frontend-код, `.env`, который попадает в build, или публичный репозиторий. Все секреты должны жить только на внешнем backend/serverless-слое.

---

## 2. Выбор стека

### 2.1 Рекомендуемый стек для этого проекта

Использовать:

```txt
Vite
React
TypeScript
CSS Modules или Tailwind CSS
Three.js
@react-three/fiber
@react-three/drei
GLB/glTF assets
GitHub Actions deployment
```

Почему именно так:

- Vite проще и надежнее для GitHub Pages, чем full-stack Next.js.
- GitHub Pages отдает статические файлы, а Vite собирает именно статический `dist`.
- React Three Fiber позволяет описывать Three.js-сцену как React-компоненты.
- Drei сокращает boilerplate для загрузки GLB, окружения, камер, helpers.
- GLB/glTF — нормальный runtime-формат для 3D-моделей в браузере.

### 2.2 Допустимые альтернативы

#### Вариант A — самый простой 3D

```txt
Vite + React + <model-viewer>
```

Использовать, если нужен просто интерактивный объект без сложных кастомных shaders, scroll choreography и продвинутой сцены.

#### Вариант B — быстрый визуальный прототип

```txt
Spline → embed/export → статическая страница
```

Использовать для прототипа или проверки арт-дирекшена. Для production не полагаться на тяжелый embed, если можно экспортировать/пересобрать сцену как GLB и контролировать загрузку.

#### Вариант C — Astro

```txt
Astro static site + React island для 3D
```

Хороший вариант для performance-first сайта, если проект уже на Astro. Не выбирать без причины, если проект уже React/Vite.

### 2.3 Чего избегать

Не выбирать по умолчанию:

- Next.js с runtime SSR/API routes: GitHub Pages это не выполнит;
- hosted 3D embed без fallback и performance-контроля;
- WebGL-сцену, которая блокирует первый рендер текста;
- тяжелые видеофоны вместо оптимизированного 3D;
- роутинг, который ломается при прямом открытии `/page` на GitHub Pages.

---

## 3. Дизайн-направление

### 3.1 Основная идея

Сайт должен ощущаться как:

```txt
premium static digital artifact
dark editorial interface
3D sculpture gallery
technical but not overloaded
calm, expensive, controlled
```

Не делать “обычный SaaS лендинг с градиентными blob-ами”. Главный визуальный якорь — **3D-скульптура**, но текст, CTA и структура должны оставаться первыми по смыслу.

### 3.2 Визуальная метафора

> Темная кинематографичная сцена с абстрактной вертикальной 3D-скульптурой: обсидиановое стекло, графитовый металл, слабое emerald-свечение внутри, мягкий studio light, аккуратный parallax.

### 3.3 Цветовая система

Использовать CSS variables:

```css
:root {
  --bg: #050608;
  --bg-elevated: #090c10;
  --surface: #0d1117;
  --surface-soft: #131922;
  --line: rgba(255, 255, 255, 0.09);
  --line-strong: rgba(255, 255, 255, 0.16);

  --text: #f4f7fb;
  --text-muted: #a3adb9;
  --text-faint: #6f7a87;

  --accent: #35f2a3;
  --accent-soft: rgba(53, 242, 163, 0.16);
  --accent-line: rgba(53, 242, 163, 0.34);

  --danger: #ff5c7a;
  --warning: #ffc86b;

  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-xl: 40px;

  --max-width: 1180px;
}
```

Допустимые акценты:

```txt
primary: emerald / mint
secondary: muted cyan only in tiny details
forbidden: rainbow gradients, purple-pink crypto neon, toy colors
```

### 3.4 Типографика

Использовать системный стек, чтобы не зависеть от внешних font CDN:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Тон:

```txt
Headlines: sharp, direct, confident
Body: restrained, readable, not marketing fluff
Labels: uppercase or small caps, but sparingly
```

Размеры:

```css
.hero-title {
  font-size: clamp(3rem, 8vw, 7.5rem);
  line-height: 0.92;
  letter-spacing: -0.07em;
}

.section-title {
  font-size: clamp(2rem, 4vw, 4.25rem);
  line-height: 0.98;
  letter-spacing: -0.055em;
}

.body-large {
  font-size: clamp(1.05rem, 1.6vw, 1.35rem);
  line-height: 1.55;
}
```

---

## 4. Структура сайта

### 4.1 Рекомендуемый формат

Один page/static landing:

```txt
1. Header
2. Hero with 3D sculpture
3. Problem / positioning
4. Capabilities / feature grid
5. Process / flow
6. Visual proof / screenshots / modules
7. Final CTA
8. Footer
```

### 4.2 Hero section

Desktop:

```txt
Left / center-left:
- eyebrow label
- strong headline
- short subheadline
- primary CTA
- secondary CTA
- trust/status strip

Right / center-right:
- 3D sculpture canvas
- subtle radial lighting
- thin grid / depth lines
- optional floating metadata chips
```

Mobile:

```txt
1. headline
2. subheadline
3. CTAs
4. poster image or simplified 3D
5. proof/status strip
```

Hero requirements:

- Text must render immediately even if 3D fails.
- 3D canvas must never block the main CTA.
- Header must remain readable on top of dark background.
- The sculpture must feel integrated with layout, not pasted as a random object.

### 4.3 Sections

#### Problem / positioning

Use editorial layout:

```txt
Large statement on left
Short supporting paragraph on right
Subtle divider lines
No icon spam
```

#### Capability cards

Cards should feel like glass/graphite panels:

```txt
- 3 or 4 cards max
- thin borders
- soft gradient only at edges
- tiny accent line
- concise title
- 2–3 lines description
```

#### Process / flow

Use a vertical or horizontal sequence:

```txt
01 — Static composition
02 — Progressive 3D load
03 — Interaction / scroll states
04 — Deploy to GitHub Pages
```

#### Proof / modules

Can include:

- UI screenshots;
- static mock terminal cards;
- code/metrics cards;
- visual asset preview;
- performance badges.

Do not invent fake customer logos unless provided.

#### CTA

Final CTA must be minimal:

```txt
One headline
One sentence
One primary action
Optional secondary link
```

---

## 5. 3D implementation rules

### 5.1 3D must be progressive enhancement

Baseline site must work as static HTML/CSS/JS without WebGL:

```txt
1. First render readable content.
2. Show optimized poster image immediately.
3. Lazy-load Three.js/R3F only after hero is visible or after idle.
4. If WebGL fails, keep poster image.
5. If prefers-reduced-motion is enabled, reduce or disable animation.
```

### 5.2 3D sculpture asset

Expected file:

```txt
/public/models/sculpture.glb
/public/images/sculpture-poster.webp
```

Asset requirements:

```txt
Format: GLB preferred
Target compressed GLB size: <= 2.5 MB
Absolute max GLB size for first version: 5 MB
Texture size: 1024px preferred, 2048px max unless justified
Polygon count: reasonable for mobile; avoid dense sculpt meshes without decimation
Draco/Meshopt compression: preferred after testing
Poster image: <= 250 KB WebP/AVIF
```

### 5.3 Scene requirements

Default scene:

```txt
Canvas camera:
- perspective camera
- FOV 28–38
- sculpture framed vertically
- no uncontrolled orbit UI by default

Lighting:
- soft key light upper-left
- weak fill light
- emerald rim light
- optional environment map, optimized

Motion:
- idle rotation extremely slow
- cursor parallax subtle
- scroll shift subtle
- no aggressive spinning
- no bouncing
```

### 5.4 Suggested React component split

```txt
/src/components/Hero.tsx
/src/components/Layout/Header.tsx
/src/components/Layout/Footer.tsx
/src/components/sections/ProblemSection.tsx
/src/components/sections/Capabilities.tsx
/src/components/sections/Process.tsx
/src/components/sections/FinalCta.tsx

/src/three/ThreeHeroCanvas.tsx
/src/three/Sculpture.tsx
/src/three/CameraRig.tsx
/src/three/useReducedMotion.ts
/src/three/webglSupport.ts
```

### 5.5 Example behavior contract

```txt
ThreeHeroCanvas:
- client-only component
- dynamically imported from Hero
- has Suspense/fallback
- does not render on unsupported devices
- does not break layout while loading

Sculpture:
- loads /models/sculpture.glb
- centers and scales model
- applies controlled idle rotation
- never contains page text

CameraRig:
- maps pointer/scroll to small camera changes
- clamps values
- respects reduced motion
```

---

## 6. GitHub Pages routing and paths

### 6.1 Base path rule

GitHub Pages project sites are usually served from:

```txt
https://<username>.github.io/<repo>/
```

Therefore static assets and router paths must respect `/<repo>/`.

For Vite, set `base`:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // For a project page: https://username.github.io/repo-name/
  base: '/REPO_NAME/',
});
```

For a user/org site:

```txt
https://<username>.github.io/
```

then:

```ts
base: '/'
```

Agent rule:

> Do not hardcode `/assets/...` or `/models/...` in a way that breaks under `/<repo>/`. Use Vite public paths correctly, or derive URLs from `import.meta.env.BASE_URL`.

Recommended model URL:

```ts
const modelUrl = `${import.meta.env.BASE_URL}models/sculpture.glb`;
```

### 6.2 Routing rule

Preferred:

```txt
Single-page landing, anchor links only: #features, #process, #contact
```

If React Router is required:

```txt
Use HashRouter, or configure static generation/404 fallback carefully.
```

Avoid assuming server rewrite support for `/about`, `/contact`, etc.

---

## 7. GitHub Actions deployment

### 7.1 Required package scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 7.2 Recommended workflow

Create:

```txt
.github/workflows/deploy.yml
```

Example:

```yml
name: Deploy static site to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v6

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

If an action version is unavailable in the target repository environment, use the latest officially supported major version from GitHub/Vite docs and update this file.

---

## 8. Performance budgets

### 8.1 Hard requirements

Agent must not merge UI changes that violate these without explicit approval:

```txt
Initial readable content: must appear without waiting for 3D model
Hero text and CTA: visible before WebGL initialization
No layout shift when 3D loads
Mobile must have fallback path
Reduced motion must be respected
No frontend secrets
No broken GitHub Pages base paths
```

### 8.2 Target budgets

```txt
Initial non-3D JS gzip: <= 250–350 KB target
3D chunk gzip: <= 900 KB target
GLB compressed: <= 2.5 MB target, <= 5 MB max first version
Poster image: <= 250 KB
Hero LCP target: poster/text, not GLB
Total blocking time: keep low; avoid heavy startup shader compilation
```

### 8.3 Loading policy

```txt
- Lazy-load ThreeHeroCanvas.
- Do not import three/r3f into the main app bundle if avoidable.
- Use dynamic import for 3D components.
- Show poster while 3D loads.
- On mobile, prefer poster or simplified model unless performance is verified.
- Avoid multiple WebGL canvases.
```

### 8.4 Testing commands

Agent should run:

```bash
npm run build
npm run preview
```

Optional but recommended:

```bash
npx vite-bundle-visualizer
npx lighthouse http://localhost:4173
```

If Lighthouse tooling is not installed, do not add heavy dependencies automatically unless requested. Provide manual notes instead.

---

## 9. Accessibility and UX rules

### 9.1 Content accessibility

- All important text must be real DOM text, not rendered only inside canvas.
- Canvas should be decorative unless the 3D object communicates essential information.
- Buttons and links must be keyboard accessible.
- Focus states must be visible.
- Color contrast must be sufficient on dark backgrounds.
- Do not rely only on green accent color to communicate state.

### 9.2 Motion accessibility

Respect:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto;
  }
}
```

In JS:

```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

If enabled:

```txt
- disable scroll choreography
- disable idle rotation or reduce it heavily
- disable aggressive parallax
- keep fade/opacity transitions minimal
```

### 9.3 Mobile UX

Mobile behavior:

```txt
- no horizontal overflow
- no tiny text
- no huge WebGL canvas pushing content below the fold unnecessarily
- CTA visible early
- fallback image acceptable
- no hover-only interactions
```

---

## 10. Copywriting direction

Default copy style:

```txt
Confident
Short
Technical
Not hype-heavy
No fake metrics
No vague “revolutionary platform” language
```

Example hero copy placeholder:

```txt
Eyebrow:
STATIC 3D INTERFACE / GITHUB PAGES READY

Headline:
A sculptural web presence that loads like a static site.

Subheadline:
A dark, cinematic landing page built around a lightweight 3D object, progressive loading, and GitHub Pages-safe deployment.

Primary CTA:
View system

Secondary CTA:
Read implementation
```

Agent can adapt the copy to the actual product, but must keep the tone precise and not overmarketed.

---

## 11. Implementation sequence for agents

Follow this order strictly:

### Phase 1 — Audit

```txt
- Inspect current project structure.
- Identify framework: Vite/React/plain HTML/etc.
- Identify deployment target: user site or project site.
- Identify repo name and required Vite base path.
- Identify whether 3D asset exists.
```

### Phase 2 — Static design foundation

```txt
- Build layout, sections, typography, colors.
- Add responsive behavior.
- Add poster placeholder for sculpture.
- Ensure page is usable without 3D.
```

### Phase 3 — 3D integration

```txt
- Add ThreeHeroCanvas as lazy-loaded component.
- Load GLB from public/models.
- Add fallback if WebGL unavailable.
- Add reduced-motion support.
```

### Phase 4 — Motion polish

```txt
- Add subtle DOM transitions.
- Add small pointer parallax.
- Add optional scroll-linked camera states.
- Keep motion restrained.
```

### Phase 5 — GitHub Pages deployment

```txt
- Configure vite.config.ts base.
- Add deploy workflow if missing.
- Build locally.
- Check generated asset paths.
- Document deployment steps in README if needed.
```

### Phase 6 — Final checks

```txt
- Desktop layout check.
- Mobile layout check.
- No console errors.
- No broken asset paths.
- No server-only code.
- No secrets.
- Build passes.
```

---

## 12. What the agent must not do

Do not:

```txt
- Build a generic SaaS template.
- Add random gradient blobs as the main design idea.
- Make 3D required for reading content.
- Add backend/API routes inside a GitHub Pages project.
- Put API keys into frontend code.
- Use BrowserRouter without handling GitHub Pages direct URL behavior.
- Hardcode root-relative asset paths that break under /repo/.
- Add huge model files without optimization.
- Use multiple large WebGL canvases.
- Add fake logos, fake testimonials, or fake metrics.
- Ignore mobile fallback.
- Ignore reduced motion.
```

---

## 13. Acceptance criteria

A task is complete only when all are true:

```txt
Design:
[ ] The page visually follows dark premium 3D sculpture direction.
[ ] It does not look like a generic SaaS template.
[ ] Hero has strong composition and readable copy.
[ ] 3D object supports the page instead of dominating it.

Static behavior:
[ ] Site works without backend.
[ ] Content is readable before 3D loads.
[ ] Poster fallback exists.
[ ] No frontend secrets exist.

GitHub Pages:
[ ] vite.config.ts base matches the target deployment path.
[ ] npm run build passes.
[ ] dist output is deployable.
[ ] GitHub Actions workflow is present or deployment instructions are documented.
[ ] Asset paths work under /repo/ if this is a project page.

Performance:
[ ] 3D is lazy-loaded or isolated from critical render.
[ ] GLB is optimized or a TODO is documented if no asset exists yet.
[ ] Mobile fallback exists.
[ ] Reduced-motion behavior exists.

Accessibility:
[ ] Important text is DOM text.
[ ] Links/buttons are keyboard accessible.
[ ] Focus states are visible.
[ ] Canvas is not the only carrier of meaning.
```

---

## 14. Ready-to-use prompt for a coding agent

Use this prompt when assigning the implementation:

```txt
Implement a GitHub Pages-compatible premium 3D sculpture landing page using the rules in `GITHUB_PAGES_3D_AGENT_DESIGN.md`.

Start by auditing the current repo structure and identifying the framework, deployment path, and whether this is a GitHub Pages user site or project site. Then implement the design static-first: layout, typography, colors, sections, responsive behavior, and a poster fallback. Only after the static version works, add the 3D hero as a lazy-loaded progressive enhancement.

Do not add backend/server/API-route functionality. Do not place secrets in frontend code. Do not hardcode asset paths that break under GitHub Pages project paths. Use `import.meta.env.BASE_URL` for public asset URLs when appropriate. Respect reduced motion and mobile fallback.

After implementation, run `npm run build`, check that the generated asset paths are correct for GitHub Pages, and summarize any remaining asset/performance TODOs.
```

---

## 15. Asset creation brief for Spline/Blender

Use this as the art direction for creating `sculpture.glb`:

```txt
Create an abstract vertical 3D sculpture for a premium dark website.

Shape:
- vertical monolith / twisting column
- asymmetrical but balanced
- carved cavities or layered surfaces
- no text, no logo, no mascot

Material:
- black obsidian glass
- brushed graphite metal
- subtle emerald emissive core or thin internal veins
- not plastic, not cartoon

Lighting reference:
- soft studio key light from upper-left
- emerald rim light from rear-right
- dark graphite background

Motion expectation:
- slow idle rotation
- subtle pointer parallax
- no fast spinning

Export:
- GLB
- optimized mesh
- compressed textures
- target <= 2.5 MB if possible
```

---

## 16. Source references for agents

Use these as implementation references, not as design excuses:

```txt
GitHub Pages overview:
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

GitHub Pages limits:
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

GitHub Pages custom workflows:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Vite static deployment to GitHub Pages:
https://vite.dev/guide/static-deploy#github-pages

React Three Fiber:
https://r3f.docs.pmnd.rs/getting-started/introduction

Drei:
https://drei.docs.pmnd.rs/

glTF / GLB:
https://www.khronos.org/gltf/

model-viewer:
https://modelviewer.dev/docs/index.html

Spline:
https://spline.design/
```

---

## 17. Final implementation principle

> Build the site as a strong static composition first. Then make the 3D sculpture enhance it. Never make the site dependent on WebGL, server runtime, or a heavy asset that GitHub Pages cannot comfortably serve.
