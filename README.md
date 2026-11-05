# Sourasis Karak — personal website

A responsive technical editorial portfolio with a personal masthead, a featured BioAgent-ST workflow schematic, a six-project index, and project-backed working principles. Built with HTML, CSS, and JavaScript. No package installation or build step is required.

## Preview

Run `python -m http.server 8000` from this directory and open http://localhost:8000. The existing `start.bat` also starts the preview.

## Features

- Warm white and charcoal themes, with system preference detection and a saved manual toggle.
- Subtle portrait tilt, a pointer-responsive 3D orbital study with inertial rotation, section reveals, and reading progress. Project-specific SVG symbols animate on hover; the closing arrow responds to pointer direction. Motion respects reduced-motion settings; the canvas pauses offscreen and in hidden tabs.
- A live Asia/Kolkata clock in the desktop header and mobile footer.
- Six filterable projects with expandable implementation notes, source links, and available live demos.
- Keyboard navigation, visible focus, email copying with failure feedback, and print styles.

## Content

The six selected projects and their order match https://soykarak.vercel.app, checked on 5 November 2026. Descriptions also reference their public repositories:

- https://github.com/thekarak/Bioagent-ST
- https://github.com/thekarak/Reducing-LLM-Hallucinations
- https://github.com/thekarak/VARUNA
- https://github.com/thekarak/Tokenlab
- https://github.com/thekarak/Winelens
- https://github.com/thekarak/RoastMeBuddy

Project limitations are retained in the expandable details. The field notes link to existing repository documentation; they do not claim to be independently published articles. Content is curated, not fetched from GitHub at runtime.

Edit `index.html` to update the biography, projects, and links. Replace `assets/resume.pdf` when the résumé changes. Google Fonts have local system fallbacks; interactions require no external services.

## Hosting

Existing portfolio: https://soykarak.vercel.app

The root is a static site, compatible with the existing GitHub Pages workflow and Vercel. Local changes do not update production until deployed through your hosting workflow.
