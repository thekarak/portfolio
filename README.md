# Portfolio — Sourasis Karak

A minimalist, editorial personal portfolio website built with pure HTML5, CSS3, and JavaScript. Zero dependencies, no framework overhead, lightning fast load times.

Live at: [https://thekarak.github.io](https://thekarak.github.io) (or your custom domain)

---

## ✨ Features Added

- **Accurate Profile & Hackathon Achievements**:
  - **Analyticus**: Team Leader | IIT Guwahati PlayHack ML Track; leakage-free validation and calibrated injury-risk modeling.
  - **VARUNA**: Smart India Hackathon 2026 (ESRGAN + U-Net + FastAPI + Redis).
  - **RoastMeBuddy**: Solo Developer | Production LLM application ([roastmebuddy.vercel.app](https://roastmebuddy.vercel.app)).
  - **TruthScope (Reducing LLM Hallucinations)**: Evidence-first RAG evaluation app with a 60-question benchmark across 51 space-mission documents; the committed local simulator reports hallucination reducing from 96.7% to 6.7%.
- **Interactive Resume**:
  - In-browser **Resume Preview Modal** (accessible via Topbar or Hero).
  - Direct **PDF Download** button linked to high-res `assets/resume.pdf`.
- **Project Filtering**: Instant category switching (`All`, `Machine Learning`, `Computer Vision`, `Web & LLM`) with smooth animated transitions.
- **Copy to Clipboard**: Quick email copy button with animated "Copied! ✓" label and toast notification.
- **Dark / Light Mode**: System auto-detection with toggle and `localStorage` persistence.
- **Automated Deployment**: GitHub Actions workflow (`.github/workflows/deploy.yml`) ready for GitHub Pages.

---

## 📁 File Structure

```text
Selfwebsite/
├── index.html                  # Main portfolio markup
├── styles.css                  # Typography, themes (dark/light), layout & animations
├── script.js                   # Filter, clipboard, modal, and theme toggling logic
├── README.md                   # Documentation & guide
├── assets/
│   ├── resume.pdf              # Downloadable resume PDF
│   └── resume.png              # High-res preview image for modal
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Pages CI/CD workflow
```

---

## 🚀 How to Deploy to GitHub Pages (When Ready)

When you are ready to publish your website online:

1. **Commit your changes locally**:
   ```bash
   git add .
   git commit -m "feat: enhanced portfolio with resume modal, filters, and demo links"
   ```

2. **Push to your GitHub repository**:
   ```bash
   git push origin main
   ```

3. **Enable GitHub Actions Pages**:
   - Go to your repository on GitHub: `https://github.com/thekarak/<repo-name>`
   - Click **Settings** → **Pages** (in the left sidebar)
   - Under **Build and deployment** → **Source**, select **GitHub Actions**
   - That's it! GitHub Actions will automatically run `.github/workflows/deploy.yml` and publish your site at `https://thekarak.github.io/<repo-name>`

---

## 📝 Updating Your Resume & Projects

- **To update your resume**:
  Simply replace `assets/resume.pdf` (for download) and `assets/resume.png` (for the preview modal).
- **To update projects or bio**:
  Edit the clean plain-text sections in `index.html`.
