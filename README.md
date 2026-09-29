# Beyond the Pitch — Akash Ram

A separate, interactive football locker-room portfolio. The existing scroll portfolio has not been replaced.

## Run

From this folder:

- `npm ci` — install dependencies if needed.
- `npm run dev` — development preview on http://localhost:3001.
- `npm run build` — production compilation.
- `npm start` — serve the production build on port 3001.
- `npm run typecheck` — TypeScript validation.
- `npm run verify` — browser checks against the built files; no listening server required. Build first.
- `node scripts/preview-built-room.mjs --inspect` — render production screenshots without starting a server.

The preview tools use installed Google Chrome and intercept requests inside the test browser to read local production assets. They do not expose a network server.

## Explore

Enter the room, then click its markers or use About / Projects / Skills / Contact in the header. Each destination moves the camera to an actual object. The laptop opens all five projects with live and source links; the tactics board presents the skill groups; the named locker contains the player profile and résumé; the desk phone opens contact details.

Ronaldo is the supplied animated model, placed in the room with matching illumination and shadows. Click his marker or open Meet the inspiration to start/pause juggling. The animation remains idle until requested. Camera motion respects reduced motion, and looping playback stops updating in background tabs. Ambient room sound is synthesized low-level ventilation and is off by default.

Panels support Escape, focus containment, and focus restoration. Mobile uses a scene above a readable bottom sheet. If the model or WebGL fails, every content section stays accessible through the normal navigation.

## Visual construction

The room is rendered as real Three.js geometry: beveled timber lockers, cloth-shaped jerseys, hanging rails, shelving, boots, towels, benches, a laptop and keyboard, tactics board, desk phone, lighting fixtures, a ceiling, and a recessed tunnel. Materials use photographic wood and concrete maps, with color and roughness adjustment. The floor has restrained reflection on larger screens. No AI-generated room image is used.

Asset credits and licenses are in `public/room/CREDITS.md` and `public/fonts`.

The Ronaldo mesh and original textures limit close-up facial detail; this implementation frames him within the room rather than claiming newly reconstructed facial detail. The room is a custom modeled interpretation, not a scan of an existing locker room.

## Main files

- `components/room/locker-room-scene.tsx`: geometry, materials, lighting, camera destinations, object markers, Ronaldo.
- `components/room/room-experience.tsx`: loading, navigation, accessible content panels, projects, contact, optional sound.
- `app/room.css`: responsive interface and mobile sheet layout.
- `lib/portfolio-data.ts`: the existing five projects, unchanged.
- `scripts/verify-room.mjs`: desktop/tablet/mobile interaction, fallback, reduced-motion and animation checks.

## Preserved version

The original remains at `../scroll_portfolio`.
A separate complete backup is at `../scroll_portfolio_preserved_2026-09-21`, including source, assets, conversion inputs and artifacts. Generated `node_modules` and `.next` were excluded; reinstall dependencies to run that backup. The original app, components, lib and public files were hash-checked against the backup: 47 files matched.

This redesign is independent and can be discarded without altering either preserved copy. Do not replace or deploy the original until the new version has been reviewed and approved.

## Pitch challenge and celebration

Click **To the pitch** at the tunnel or in the room toolbar. This opens the stadium with the supplied juggling model. The room canvas unmounts during the game, so two WebGL scenes are not running together.

- **Start challenge:** a three-second countdown, then 33 contact cues per loop, measured from the supplied 25 fps capture. Tap the moving foot, thigh or head ring when it lights up. Left/right are Ronaldo's anatomical sides.
- **Neck balance:** press and hold from frame 310 through 334, then release. Letting go early, choosing the wrong target, tapping early/twice or missing a contact ends the run.
- The pace starts at 0.35x and increases by 0.025x every ten successful contacts, capped at 0.8x. Completing the clip starts another round. Personal best is saved locally, with storage failures tolerated.
- Keyboard: 1/2 = left/right foot, 3/4 = left/right thigh, 5 = head, Space = neck hold, Escape = pause. Mouse and touch targets follow the animated bones.
- Losing focus pauses the challenge. Reduced-motion visitors explicitly enable animation before play. A missing model shows a return path to the portfolio.
- **Celebration:** reuses `ronaldo-portugal.glb` and the original Siuu camera sequence, plays automatically with a Replay button; scrolling does not control the capture. Both supplied models retain their respective original kits.

Implementation: `components/room/pitch-experience.tsx`, `lib/pitch-game.ts`, `app/pitch.css`. `scripts/analyze-pitch.mjs` samples the real GLB transforms; the contact table is versioned with the game. Re-measure it if the animation asset changes.

Validation:

- `npm run test:pitch`: deterministic scoring, two full rounds, all contact types, speed, misses, incorrect/early/duplicate inputs, neck release, pause and restart.
- `npm run verify:pitch`: browser checks on desktop and mobile, actual on-model click, complete round and acceleration, celebration replay, keyboard play, motion consent, focus-loss pause and asset-error recovery. Build first.
- If a running app locks `.next`, set `$env:PORTFOLIO_BUILD_DIR='.next-pitch'` before both `npm run build` and browser verification. This only changes the output directory; it does not start or stop a server.

The pitch uses the existing CC0 Stadium 01 panorama and the existing modeled turf. No generated image or replacement Ronaldo asset was introduced.


### Celebration playback

Entering the celebration starts an 8.75-second sequence with the existing camera path. There is one slow airborne turn; the rest moves continuously. Replay celebration restarts the sequence and crowd audio. Scrolling and arrow keys do not seek or interrupt playback. Escape or losing focus pauses it.

`lib/celebration.ts` defines timing. `npm run verify:celebration` checks autoplay, scroll/key independence, completed sound, replay, pause and return to the game on desktop and mobile.

## Clubhouse UI refresh

The opening behavior and contact content are preserved. One two-compartment locker holds the clickable host jersey and a Hobbies equipment display. Hovering an item shows its sport name; keyboard focus and touch are supported. There is no separate sports panel. The nine sports use custom modeled geometry, not downloaded scans.

The Game Plan board has 4-3-3, 4-4-2 and 3-4-3 formation controls. All twenty skills remain grouped as Technologies, Tools and Backend & AI; each formation changes their respective column counts.

The game lobby has a compact heading, Start Game button and expandable rules icon. Next stop starts the celebration. White letters appear progressively from the head-tracked mouth position. Playback starts the Siu cue once at normal speed, without seeking. Audio attribution is in public/audio/CREDITS.md.

Validation: build first, then npm run verify for desktop/mobile story cards, projects, formations, tour, contact and celebration replay. npm run verify:celebration covers playback behavior; npm run test:pitch covers deterministic gameplay.

All four story panels use a light matchday-programme style with editorial headings, inset cards, badges and grouped items. Local components follow composition references from shadcn/ui Card and Item documentation; no component-library dependency was added. The left stadium frame sits on plain wall, the rear host poster is removed, and the right wall has a Portugal fan collage and framed shirt display. Photo attribution is in public/room/posters/credits.html.

Host and Game Plan panels reserve a separate scene area so hobbies and board controls stay accessible. The room header shows Developer / Student; only the stories-explored counter remains at the bottom.

## Silent door opening

The entry uses the supplied public/models/opening_video.mp4, preserved unchanged. Derived portrait (1080 x 1920) and widescreen (1920 x 1080) MP4s are in public/videos/opening-door-*.mp4. Both have their audio tracks removed, fast-start metadata, and restrained sharpening. The widescreen version extends the portrait footage with a blurred background; it does not reconstruct new source detail.

OpeningGate shows real room-load progress and a brief door-rise/ring animation. Step Inside plays the supplied door opening, then a white transition reveals the locker room. The rise is rendered in the website, not baked into the video. Reduced motion, rejected video playback, and video-load failure provide direct entry; visitors can also skip the clip. The original invitation screen is replaced.

After a production build, npm run verify:opening checks desktop/mobile playback, full viewport coverage, mute, direct entry, reduced motion and missing-video recovery. Use PORTFOLIO_BUILD_DIR=.next-pitch if the main dev build is in use.


## Reference-based glass UI and warm lighting

The four story panels and room markers use smoked glass, ivory typography and warm metallic outlines. The host card includes artwork rendered from the existing user-supplied Ronaldo mesh (not a generated photograph). The lettering is projected onto the cloth. The interactive hanging shirt has denser folded geometry, collar/hem detail and a woven bump material.

`scripts/bake-room-warm.py` bakes the room's walnut materials and warm shelf/ceiling lighting into its 3072px atlas. Runtime object lights match this baked lighting. `scripts/render-story-player.py` reproduces the decorative player artwork. Use Blender 4.4 with `--background --factory-startup --python` to rebuild either asset. Source and model rollback copies from before this change are in `artifacts/pre-reference-ui`.


### Celebration temporarily closed

`CELEBRATION_ENABLED` in `components/room/pitch-experience.tsx` is false. The next-stop link is hidden, the mode transition is guarded, and crowd audio is not loaded. The juggling game remains accessible. Animation code and assets are retained; restoring the flag reopens the entry. The standalone celebration browser suite applies only when this feature is enabled; `npm run verify` checks the closed visitor path.
