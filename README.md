# Goal Tracker UI - Angular Project

The **Goal Tracker UI** is the frontend interface for the Goal Tracker application, built with Angular 20 and designed to provide a responsive, user-friendly way for users to create, manage, and track their goals.

---

## 📦 Tech Stack Summary

* **Framework**: Angular 20 — Modern, component-based architecture.
* **Language**: TypeScript — Strong typing and maintainable code.
* **Styling**: Vanilla CSS — Lightweight, no extra CSS framework dependencies.
* **State Management**: Angular Signals (and built-in RxJS when needed).
* **HTTP Client**: Angular `HttpClient` — API communication with backend.
* **Routing**: Angular Router — Client-side navigation and route guards.

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/goal-tracker-ui.git
cd goal-tracker-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

In `src/environments/environment.ts`, set your API base URL:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Nest backend URL
};
```

### 4. Start development server

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

---

## 🗝️ Key Decisions and Trade-offs

* **Angular over React/Vue**
  Chosen for its opinionated structure, CLI tooling, and built-in DI.
  *Trade-off*: Steeper learning curve compared to lighter frameworks.

* **Vanilla CSS**
  Provides full control over styles with minimal overhead.
  *Trade-off*: No prebuilt utility classes or components; more manual styling.

* **Signals for State Management**
  Used for local and shared state without introducing extra libraries.
  *Trade-off*: May require hybrid use with RxJS for complex async flows.

---

## 🚧 Known Limitations / Pending Features

* Public goals page.
* Pagination, filtering, and sorting in goal lists.
* Mobile responsiveness fine-tuning.
* Unit and integration tests.
* Dark mode toggle.

---

## 📂 Project Structure

```plaintext
src/
 ├── app/
 │   ├── core/         # Services, interceptors, guards
 │   ├── features/     # Feature modules (goals, auth, etc.)
 │   ├── shared/       # Shared components, directives, pipes
 │   ├── app.routes.ts # App routing configuration
 │   └── app.component.*
 ├── assets/           # Static assets
 ├── styles.css        # Global styles
 └── environments/     # Environment configs
```

---
