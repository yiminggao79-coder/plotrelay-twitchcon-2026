# PlotRelay

A Twitch community story director built with Codex on 2026-10-26. The streamer writes a scene and 2–4 choices, viewers vote with `!vote N`, and the streamer locks each chapter into a shared story. An OBS browser source shows the current scene and live tallies.

## Run locally

Requires Node.js 24 or newer. No dependencies, accounts or model downloads are needed for the labeled local rehearsal.

```powershell
node server.mjs
```

Open http://127.0.0.1:4312 . Stream overlay: http://127.0.0.1:4312/overlay . Add that URL as an OBS browser source, width 960, height 650, when OBS is available.

Start chapter → send rehearsal votes from distinct viewer names → change a vote → lock chapter. `New chapter` closes an empty round; a round with votes must be locked to preserve its result. Story state lives in memory and resets when the server restarts. This is a single-streamer tool, not a multi-tenant service.

## Connect real Twitch chat

1. Create a Twitch developer application and obtain a **user access token** for it with `user:read:chat`. Follow [Twitch authentication](https://dev.twitch.tv/docs/authentication/) and [chat/EventSub authentication](https://dev.twitch.tv/docs/chat/authenticating/). An app-only token is insufficient for this WebSocket transport.
2. Use `setup-local.ps1` to enter client ID, user token and numeric broadcaster ID privately. The token stays in the process and is not written to a file. Alternatively populate a local `.env` based on `.env.example`; it is ignored by Git and Docker.
3. Run `node --env-file-if-exists=.env scripts/check.mjs` for a read-only readiness test. It validates scopes and attempts the chat subscription, without posting messages.
4. In the director, finish any rehearsal chapter, click **Connect Twitch**, wait for `connected to Twitch`, then start a **new live chapter**. Send votes in actual Twitch chat.

Each chapter is permanently marked rehearsal or live. The engine rejects votes from the other source, including while Twitch reconnects. Connecting or switching back requires the current chapter to be closed. No synthetic viewers can enter a live tally. One Twitch user ID holds one current vote; a new vote replaces the previous choice. Duplicate message IDs are ignored. Ties choose the earliest listed choice. Limits: 10,000 current voters, 10,000 remembered message IDs, 50 chapters in history. Exact vote commands only; chat content is rendered as text.

The adapter implements token validation, EventSub subscription, keepalive timeout, bounded reconnect delay and authorized reconnect URL validation. Expired/revoked tokens require reauthorization. It does not refresh OAuth tokens automatically. Live Twitch authorization and footage have **not** been tested with a user account in this delivery.

## Verify and deploy

```powershell
npm test
npm run check
```

Tests include one-vote fairness, duplicate delivery, closed rounds, invalid choices, live/rehearsal isolation, empty-round recovery, EventSub mapping and an actual local HTTP vote-to-overlay workflow. Local network checks may need permission to access loopback in a managed environment.

`Dockerfile` and `render.yaml` are prepared, not deployed. Off-loopback binding requires `ADMIN_KEY`; use Basic Auth user `admin` with that password for director access. Set `PUBLIC_BASE_URL` to the actual HTTPS origin. The stream overlay and its read-only state are public to anyone with the URL; they contain story text and vote counts, not tokens. Never expose an unreviewed story publicly. Cloud publishing, repository sharing and final submission require the user's decision.

## Competition materials

See `docs/progress.md`, `docs/rules-and-provenance.md`, and `docs/submission-draft.md`. These distinguish implemented behavior, local tests and still-missing live proof. The implementation was created by Codex under the user's authorized direction; it should not be represented as all manually written by the user.

Build thread: `01a17696-53e7-7572-af94-45322932bf75`. Parent orchestration session: `01a17695-3a3c-7e42-b48d-2c1b846b4bf5`. Provide the actual build thread with this delegation disclosure in the submission.
