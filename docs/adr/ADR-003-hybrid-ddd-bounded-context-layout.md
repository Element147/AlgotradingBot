# ADR-003 Hybrid DDD Bounded Context Layout

## Status

Accepted on April 8, 2026.

## Context

The repository had outgrown a flat backend structure built around global folders such as `controller`, `service`, `repository`, and `entity`. That layout made it harder to understand which files belonged to the same business workflow, and it encouraged API DTOs, persistence models, and orchestration logic to mix more freely than intended.

The frontend already followed a feature-first structure, but it still allowed isolated root-level feature outliers that weakened domain ownership and made cross-feature boundaries less obvious.

## Decision

The repository now defaults to a hybrid Domain-Driven Development layout.

Backend rules:

- Organize business code by bounded context first.
- Use `api`, `application`, `domain`, and `infrastructure` inside each business context.
- Keep HTTP DTOs inside `api`.
- Keep JPA entities and Spring Data repositories inside `infrastructure`.
- Keep business rules and strategy logic out of `infrastructure`.
- Reserve top-level packages such as `config`, `migration`, `repair`, `shared`, `validation`, and `websocket` for truly cross-cutting technical concerns.

Frontend rules:

- Keep the top-level feature-first structure under `frontend/src/features/`.
- For larger features, prefer internal `api`, `components`, `models`, `state`, and `utils` folders.
- Avoid root-level feature outliers when a file clearly belongs to one feature.
- Prefer feature boundary exports for cross-feature imports.

## Consequences

Positive:

- Files that support the same operator workflow now live together.
- API boundaries are easier to audit because DTOs stay near controllers.
- Persistence and infrastructure details are easier to isolate from business rules.
- Frontend features have clearer ownership and fewer ambiguous shared entry points.

Trade-offs:

- Package names and imports are more verbose.
- Mechanical refactors touch many files at once and require stronger verification.
- Some small contexts will look slightly heavier than a flat package until they grow into the structure.

## Follow-On Rules

- New work should extend an existing bounded context before creating a new one.
- If a new cross-cutting helper is added to `shared`, it must be truly reusable across multiple contexts.
- Contract changes still require OpenAPI and frontend verification; package refactors are not allowed to change public behavior silently.
