# Devpost draft — not submitted

## Project name
PlotRelay

## Elevator pitch
Let Twitch chat write the next chapter together, while the streamer stays in the director's chair.

## Problem and audience
Small storytelling and creative streams need a visible way for viewers to shape what happens next without losing narrative control to chat spam. PlotRelay turns scene choices into a shared story that both the streamer and audience can follow.

## What it does
The director writes a scene and up to four choices. Chat sends `!vote 1`, `!vote 2`, and so on. Each Twitch user has one current vote and may change it. The director locks a result, then uses it as the next scene's starting point. An OBS browser source shows the current scene, counts and explicit live/rehearsal label. Locked choices become the stream's story history. Rehearsal identities cannot enter live chapters, even during reconnects.

## Built with Codex
Codex proposed and implemented the story engine, EventSub adapter, local director UI, overlay, tests and instructions under the entrant's authorization. Actual delegated build thread: `01a17696-53e7-7572-af94-45322932bf75`; orchestration session: `01a17695-3a3c-7e42-b48d-2c1b846b4bf5`. The entrant reviews and accepts the result. Do not claim the entrant manually authored every line.

## Current evidence boundary
Local engine, HTTP and browser flows are verified. Actual Twitch account authorization, live chat delivery and on-stream footage are pending. Remove this pending statement only after recording real evidence. Repository URL and public YouTube URL are not yet available; never invent them.

## Video script — target 2:40

- 0:00–0:15: “PlotRelay lets your community write a story with you, one chapter at a time.” Show the director and the real Twitch channel.
- 0:15–0:50: Start a live chapter. Send real votes from authorized Twitch accounts, show counts update on the stream overlay.
- 0:50–1:15: Change one viewer's vote; demonstrate that a viewer counts once.
- 1:15–1:40: Lock a chapter and carry the winning choice into the next scene. Show history and readable overlay.
- 1:40–2:10: Show a short actual Codex build/thread clip and the source isolation test. Avoid showing keys or unrelated chat data.
- 2:10–2:40: Explain who it helps, how to run, and a clear current limitation. End on a real running chapter.

The current local rehearsal is useful for practicing this sequence; it is not a substitute for Twitch footage. Use only owned/authorized channel content and no background music requiring another license.
