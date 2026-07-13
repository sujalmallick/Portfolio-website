# Sujal Mallick — Portfolio

Personal portfolio website for **Sujal Mallick**, Computer Engineering student at Thapar Institute of Engineering & Technology (TIET), Patiala. Showcases projects in full-stack development, AI engineering, GPU systems programming, and software testing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic, ARIA) |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (ES6, IntersectionObserver) |
| Fonts | DM Serif Display · Poppins (Google Fonts) |
| Hosting | GitHub Pages |

---

## Features

- **Light / Dark mode** — defaults to system preference (`prefers-color-scheme`), with a manual toggle in the nav that persists the choice for the session
- **Scroll reveal animations** — elements fade in as they enter the viewport (IntersectionObserver)
- **Scrollspy** — active nav link highlights based on scroll position
- **Responsive** — hamburger nav at ≤ 900px, single-column layouts at ≤ 600px
- **Contact form** — opens the visitor's mail client via `mailto:` with fields pre-filled

> **Note on the contact form:** The form uses a `mailto:` action, which depends on the visitor having a local mail client (e.g. Outlook, Apple Mail) configured. Visitors without one should email [sujalmallick123@gmail.com](mailto:sujalmallick123@gmail.com) directly. This is a known limitation of a static-only approach — no backend is required.

---

## Local Development

No build step needed.

**Option 1 — Open directly:**
Double-click `index.html` or drag it into a browser.

**Option 2 — VS Code Live Server (recommended):**
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **Open with Live Server**
3. The site auto-reloads on save at `http://127.0.0.1:5500`

---

## Project Structure

```
portfolio/
├── index.html          # Main page — all sections
├── style.css           # Design system (tokens, layout, components)
├── mediaqueries.css    # Responsive breakpoints (900px, 600px)
├── script.js           # Theme toggle, scroll reveal, scrollspy, form
└── assets/
    ├── profile-pic.png
    ├── resume.pdf
    ├── github.png
    ├── linkedin.png
    └── insta.png
```

All asset paths use relative `./assets/...` references so the site works whether served from the root (`username.github.io/`) or a sub-path (`username.github.io/portfolio/`).

---

## Deploy to GitHub Pages

### 1 — Initialize and push the repository

Run these commands from the project folder:

```bash
git init
git add .
git commit -m "feat: initial portfolio build"
git branch -M main
git remote add origin https://github.com/sujalmallick/portfolio.git
git push -u origin main
```

> Replace `portfolio` with your chosen repository name if different.

### 2 — Enable GitHub Pages

1. Open your repository on GitHub
2. Go to **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment → Source**, select **Deploy from a branch**
4. Set **Branch** to `main`, folder to `/ (root)`
5. Click **Save**

GitHub will build and publish the site. After ~60 seconds, visit:

```
https://sujalmallick.github.io/portfolio/
```

---

## Contact

| | |
|---|---|
| Email | [sujalmallick123@gmail.com](mailto:sujalmallick123@gmail.com) |
| Phone | +91 93487 01981 |
| GitHub | [github.com/sujalmallick](https://github.com/sujalmallick) |
| LinkedIn | [linkedin.com/in/sujal-mallick-9b9494289](https://www.linkedin.com/in/sujal-mallick-9b9494289) |
