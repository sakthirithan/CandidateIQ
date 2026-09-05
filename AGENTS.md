# AI AGENT INSTRUCTIONS — CANDIDATEIQ DEVELOPMENT

## Core Operating Guidelines

1. **Frontend-First Strategy**: Complete all visual styling, layout responsiveness, centralized mock data services, interactive CRUD operations, empty/loading states, and cross-module workflows BEFORE starting backend API development.
2. **Design System Adherence**: Use predefined SaaS design tokens (`.saas-card`, `.ai-card-glow`, `.btn-primary`, `.btn-ai`, `.input-saas`, `.badge-pill`, `Inter`, `Outfit` fonts). Maintain the dark slate/indigo/purple aesthetic.
3. **No Fake / Static UI**: Buttons must execute state actions, forms must submit/validate, tables must filter/sort, search must work, modals must toggle, and metrics must compute dynamically from the central mock data layer.
4. **Preserve Logic & Contracts**: Keep all existing API service calls, prop signatures, and parameters intact so that transition from Mock Services to Real Express/MongoDB API is seamless.
5. **Responsible AI**: Keep AI output explainable with clear evidence callouts. Do not use protected characteristics or make psychological diagnoses.
