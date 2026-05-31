# Dental Clinick Dashboard

Angular 20 dashboard starter with Angular Material, a global white-blue visual system, responsive landing route, and authentication pages.

## Setup

```bash
npm install
npm start
```

## Implemented routes

- `/` — responsive landing page with Login and Register actions.
- `/login` — responsive login page that validates user id/phone/password and submits `LoginCommand` to `/api/login`.
- `/register` — responsive registration page that validates user profile fields and submits to the `CreateUserCommand` API.
