# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build (output to `dist/`)
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint over the project
- `npm test` — run Vitest test suite
- `npx vitest run src/pages/ModulAjarGenerator.test.jsx` — run a single test file
- `npx vitest run -t "test name"` — run a single test by name

Vitest is configured in [vite.config.js](vite.config.js) with `environment: 'jsdom'` and setup file `src/setupTests.js` (jest-dom matchers).

## Environment

- `VITE_GROQ_API_KEY` — required in `.env` for the Groq provider (default AI backend).
- `VITE_GEMINI_API_KEY` — optional, used when a form selects the Gemini provider (`data.aiProvider === 'gemini'`).

## Architecture

This is a single-page React app (Vite + Tailwind v4, no TypeScript) that generates Indonesian K-12 lesson-planning documents ("Modul Ajar" and "RPM/Rencana Pembelajaran Mendalam") for Kurikulum Merdeka, using an LLM to fill out a large structured JSON document, then rendering and exporting that document.

Routing is a flat `HashRouter` in [src/App.jsx](src/App.jsx) with three routes: Dashboard, RPM generator, and Modul Ajar generator (`src/pages/`).

Each generator page follows the same Form → AI call → Display pattern:
- `*Form.jsx` collects structured teacher/lesson input (subject, grade, duration, meetings, pedagogical practice, Profil Pelajar Pancasila / deep learning dimensions, etc.) and calls an `onGenerate` prop with the raw form data.
- The page (`ModulAjarGenerator.jsx` / `RPMGenerator.jsx`) owns state (`moduleContent`, `isGenerating`, `error`), calls into `src/lib/groq.js`, strips any ```json fences from the LLM response, and `JSON.parse`s the result into a fixed schema.
- `*Display.jsx` renders the parsed JSON as a formatted document and handles export (DOCX via `html-docx-js-typescript` + `file-saver`, PDF via `html2pdf.js`).

All AI prompt construction and provider selection lives in [src/lib/groq.js](src/lib/groq.js):
- `generateModule` — deep learning ("Pembelajaran Mendalam") RPM schema.
- `generateStandardModule` — standard Kurikulum Merdeka Modul Ajar schema.
- Both build a single large prompt string that specifies an exact JSON schema the model must return (informasiUmum, identifikasi/kompetensiInti, desainPembelajaran, pengalamanBelajar/rincianKegiatanPembelajaran, penutup/asesmen, rubrik/lampiran, etc.), embedding lookup tables (e.g. `DIMENSION_DESCRIPTIONS`, `PEDAGOGICAL_SYNTAX`) to keep model output consistent with the selected pedagogical model/dimensions.
- Both branch on `data.aiProvider`: `'gemini'` uses `@google/genai` (`gemini-2.5-flash`, `responseMimeType: 'application/json'`); otherwise Groq (`groq-sdk`, model `llama-3.3-70b-versatile`, `response_format: json_object`). The Groq client is instantiated client-side with `dangerouslyAllowBrowser: true` — this app calls LLM APIs directly from the browser, no backend.

When changing the JSON schema produced by a prompt in `groq.js`, the corresponding `*Display.jsx` component must be updated to match (the schema is duplicated as a rendering contract, not shared/validated by a schema library).

`models.json` at the repo root is reference data (available Groq models), not imported at runtime by the app — check before assuming it's live config.
