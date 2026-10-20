# Sujal Mallick — Portfolio

Personal portfolio website for Sujal Mallick, Computer Engineering undergraduate at Thapar Institute of Engineering and Technology (TIET), Patiala. Showcases production projects across full-stack engineering, multi-agent AI pipelines, GPU systems programming, and high-performance cloud architectures.

The site is built as an interactive, vertical sci-fi odyssey designed in an editorial monochrome style with warm charcoal surfaces, cream typography, and muted terracotta accents.

---

## Spatial Narrative: The Vertical Odyssey

The portfolio is structured as an ascending vertical space expedition that connects each section into an unbroken narrative environment:

- Elevation 0 KM (Footer — Earth's Industrial Surface): A dystopian cyber-industrial wasteland where autonomous combat cyborgs have conquered the planet, patrolling desolate factories, refineries, and communication towers.
- Elevation 384,400 KM (Contacts — Lunar Gateway): The threshold of space marked by the ancient pixel moon, housing the interactive Lunar Archive Codex.
- Elevation 36,000 KM (Projects and Education — Orbit): A zone of shattered orbital habitats and lost astronaut relics from humanity's evacuation, where a lone astronaut developer sits on the orbital divide coding on a cyberdeck in the void.
- Deep Space (About — Ionized Nebula): Volumetric purple and cyan cosmic clouds discharging continuous ionized plasma lightning.
- Apex (Hero — Cosmic Singularity): A supermassive spinning black hole with fluid accretion disk turbulence and relativistic flare ejection, framed by humanity's distant emissary, the historical NASA Voyager 1 probe.

---

## Lunar Archive Codex

Accessible by clicking or focusing the Ancient Moon in the Contacts section:

- Native Modal Architecture: Built on standard HTML5 <dialog> with backdrop blur, keyboard dismissal (Escape), and focus management.
- Interactive Collapsible Cards: All 26 lore cards are compact by default with one-click story disclosure, keeping the modal tidy and fast to navigate.
- High-Performance Scroll Engine: Native touch and trackpad scrolling optimized with CSS layout containment (contain: content), background starfield pause while open, and zero composite scanline overhead for fluid 60 to 120 FPS scrolling.
- Accessible Storytelling: Simple, clear lore written in easy-to-understand words explaining every environmental prop, celestial body, interactive mascot, and structural relic.
- Lore Elements:
  - Combat Cyborg Gunner: The supreme mechanical ruler patrolling the scorched surface after the synthetic uprising overthrew human civilization.
  - Lost Astronaut Helmet: A cracked EVA helmet drifting through the vacuum, commemorating an explorer who perished during the evacuation from Earth.
  - Abandoned Orbital Research Station: A breached scientific habitat crippled when autonomous AI swarms reached space defenses.
  - Spacesuit Astronaut Programmer: The last surviving human engineer in the cosmos, compiling neural code and CUDA kernels into the starlight.
- Design Integration: Styled to match the website's warm charcoal (#0F0F0E, #1A1A18), DM Serif Display headings, Poppins body text, and terracotta (#B85C38) accents.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5, WAI-ARIA 1.2 accessibility standards |
| Styling | Modern CSS3 (Custom properties, CSS Grid, Flexbox, scroll-driven fallbacks) |
| Core Logic | Vanilla JavaScript (ES6+, zero external runtime dependencies) |
| Graphics and Canvas | HTML5 2D Canvas (procedural starfield, cyborg kinematics) |
| Typography | DM Serif Display, Poppins, Space Mono (Google Fonts) |
| Testing and Verification | Playwright (multi-viewport visual and interaction test suites) |
| Hosting | GitHub Pages (custom domain ready, zero-build deployment) |

---

## Key Features and Engineering

### 1. Projects Section and Mobile Collapsible Pipelines
- Featured Flagship (BugMind AI): An AI QA platform on Azure with 131 REST endpoints, 411 automated tests, and 8 LangGraph LLM agents.
- Collapsible Architecture Disclosures: To prevent excessive vertical scrolling on mobile viewports, architecture pipeline diagrams collapse into an interactive dropdown button on screens 768px and below, reducing vertical scroll height by over 800px to 1,300px.
- Search-Integrated Content: Built using hidden="until-found" and the native beforematch event, ensuring collapsed pipeline nodes remain searchable via browser "Find in page" (Ctrl+F) and automatically expand when matched.

### 2. Autonomous Pixel Mascots
- Education Ledge Programmer: 14-frame animated spacesuit mascot featuring active coding sprints, deep-space stargazing pauses, ledge scooting with cubic easing, hover glance awareness, and interactive status bubble bursts.
- Contact Form Tux Penguin: An interactive Linux Tux companion traversing the contact form input dividers with smooth waddling cycles, boundary collision reflection, parabolic hop arcs, and landing squash physics.
- AI Companions: Autonomous floating ChatGPT drone beside project repositories, Claude divider line walker across experience timelines, and orbiting Gemini cosmonaut near verified certifications.
- Ground Patrol Enforcers: Canvas-rendered 12-frame combat cyborg enforcer with boundary turn kinematics and patrolling scout droids across the wasteland.

### 3. Cosmic Atmosphere and Physics
- Volumetric Emission Nebula: Continuous 60 FPS fluid cross-fade animation with dual-harmonic drift and real-time ionized lightning strikes.
- Relativistic Black Hole: Dynamic accretion disk plasma turbulence and coronal flare ejection.
- Procedural Starfield and Asteroid Belt: Dual-layer 2D canvas starfield combined with 3D CSS tumbling asteroid physics, complete with collision avoidance boundaries.

### 4. Accessibility and Performance
- Reduced Motion: Full compliance with prefers-reduced-motion: reduce. Disables continuous motion, freezes animated sprites into resting poses, pauses canvas rendering loops, and replaces transitions with instant layout updates.
- Pixel-Art Integrity: Universal integer coordinate scaling and strict image-rendering: pixelated across all retro game sprites.
- Battery and CPU Optimization: Screen visibility listeners and IntersectionObserver controllers automatically halt canvas rendering and timers when off-screen.
- Responsive Layout: Optimized across five device breakpoints: 900px, 768px, 600px, 480px, and 360px.

---

## Project Structure

```
portfolio/
|-- index.html               # Main single-page application and all sections
|-- style.css                # Design system tokens, component layouts, retro HUDs
|-- mediaqueries.css         # Responsive rules and mobile disclosure optimizations
|-- wasteland.css            # Scoped styles for the footer industrial surface world
|-- script.js                # Core controller, mascot state machines, canvas engines
|-- package.json             # Dev dependencies (Playwright testing engine)
|-- assets/                  # Pixel-art sprites, audio-free textures, and icons
|   |-- sprites/             # High-density sprite sheets (programmer, cyborg, nebula)
|   |-- wasteland/           # Industrial props (citadel tower, factory, refinery)
|   `-- ...
`-- tools/                   # Multi-viewport verification scripts and test suites
```

---

## Local Development

No build tools or bundlers are required.

Option 1 — Local Static Server (Recommended):
```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve .
```
Visit http://localhost:3000 in your web browser.

Option 2 — VS Code Live Server:
1. Install the Live Server extension in VS Code.
2. Right-click index.html and select "Open with Live Server".

---

## Verification and Testing

End-to-end multi-viewport verification suites are located in the tools directory.

Run verification suites with Playwright:
```bash
# Run pipeline dropdown test suite
node tools/verify_pipeline_dropdown.js

# Run lunar codex theme and lore test suite
node tools/verify_codex_theme_and_lore.js
```

---

## Contact

- Email: sujalmallick123@gmail.com
- Phone: +91 93487 01981
- GitHub: https://github.com/sujalmallick
- LinkedIn: https://www.linkedin.com/in/sujal-mallick-9b9494289
