# Supabase chat wiring (example)

This document explains a simple way to wire the local chat widget to Supabase Realtime (or the Realtime extension) so messages can be synced across clients.

Requirements

1. A Supabase project.
2. A table to store messages. Example schema:

```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  username text,
  message text,
  created_at timestamptz default now()
);
```

Client example (JavaScript)

1. Install the Supabase client:

```bash
npm install @supabase/supabase-js
```

2. Initialize and subscribe to new messages:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'public-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Listen for inserted messages
supabase
  .from('messages')
  .on('INSERT', payload => {
    const msg = payload.new
    // append msg to your UI, for example push to localStorage-backed chat
  })
  .subscribe()

// Send a message
async function sendMessage(username, message) {
  await supabase.from('messages').insert({ username, message })
}
```

Notes

- Use Row Level Security (RLS) and policies to restrict who may insert messages in a production app.
- The example uses the public anon key to receive realtime updates; writes can be restricted via RLS and authenticated requests.
- For small projects, the public anon key and a simple policy may be sufficient. For larger or sensitive deployments, require authenticated sessions.
Supabase Realtime chat wiring

This document shows a minimal setup to receive/persist chat messages from the client using Supabase Realtime (or Postgres + supabase-realtime).
# Supabase chat wiring (example)

This document explains a simple way to wire the local chat widget to Supabase Realtime so messages can be synced across clients.

## Requirements

1. A Supabase project.
2. A table to store messages. Example schema:

```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  username text,
  message text,
  created_at timestamptz default now()
);
```

## Client example (JavaScript)

1. Install the Supabase client:

```bash
npm install @supabase/supabase-js
```

2. Initialize and subscribe to new messages:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'public-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

// Listen for inserted messages
supabase
  .from('messages')
  .on('INSERT', payload => {
    const msg = payload.new
    // append msg to your UI, for example push to localStorage-backed chat
  })
  .subscribe()

// Send a message
async function sendMessage(username, message) {
  await supabase.from('messages').insert({ username, message })
}
```

## Notes

- Use Row Level Security (RLS) and policies to restrict who may insert messages in a production app.
- The example uses the public anon key to receive realtime updates; writes can be restricted via RLS and authenticated requests.
- For small projects, the public anon key and a simple policy may be sufficient. For larger or sensitive deployments, require authenticated sessions.

## Realtime chat wiring (alternate)

1. Supabase setup

- Create a Supabase project and a table `chats` with columns: id (uuid, default gen_random_uuid()), created_at (timestamp), room (text), author (text), text (text).
- Enable Realtime for the `chats` table.
- Create an API key (anon for client, service_role for server tasks if needed).

2. Client snippet (vanilla JS)

- Use the `@supabase/supabase-js` client to subscribe and insert rows. See the code examples above (no inline <script> tags in this doc).

3. Security & moderation

- Use Row Level Security (RLS) policies to limit inserts/reads per room.
- For moderation, consider a separate `reports` table and a small admin UI to remove offensive messages.

4. Server-side forwarding (optional)

- If you want to forward verified payments or other events to Supabase, use a server with the service_role key and call the REST or JS API to insert rows.

This is a minimal example. I can produce a fuller sample with RLS policies and a small Node server if you want to deploy a managed chat backend.

## Adding friends and browser-to-browser video chat (WebRTC)

You can extend the realtime chat to support friend lists and browser-to-browser video using WebRTC for media and Supabase Realtime (or another signaling channel) to exchange SDP offers/answers and ICE candidates.

High-level contract

- Inputs: friend requests (userA -> userB), presence updates, signaling messages (offer/answer/ice).
- Outputs: friend list UI, presence indicators, active peer connections, remote video streams.
- Error modes: network disconnected (queue signaling), failed ICE (retry), permission denied for camera/mic.

Edge cases

- Users behind restrictive NATs: ensure STUN servers are configured; add TURN for robust connectivity.
- Users with multiple tabs/devices: show device presence or allow per-device sessions.
- Privacy: only forward signaling messages to intended peer(s); use RLS/policies to restrict access.

Example approach (client-only):

1. Friend list storage: store an array of friend objects in a table (or client-localStorage for a demo). Each friend row: {id, username, displayName, status}.
2. Presence: store presence rows or use Realtime presence channels (Supabase presence plugin) to notify online/offline state.
3. Signaling channel: use a Supabase Realtime channel (or a table 'webrtc_signals' with INSERT events) where each message includes {from, to, type, payload} and is filtered server-side via RLS so only the recipient can read it.

Client signaling flow (simplified):

- Caller (A): create RTCPeerConnection, getUserMedia, add local tracks, createOffer(), setLocalDescription(offer), send offer via signaling ({type:'offer', sdp}) to userB.
- Callee (B): receive offer from userA via signaling, create RTCPeerConnection, getUserMedia (or wait until accepted), setRemoteDescription(offer), createAnswer(), setLocalDescription(answer), send answer back via signaling.
- Both sides: exchange ICE candidates as they are gathered.

Security notes

- Use Row Level Security (RLS) so only the intended recipient can read signaling rows. For example, a policy that allows SELECT on `webrtc_signals` where `to = auth.uid`.
- Avoid storing raw media in the DB. Keep only ephemeral signaling messages.
- Consider encrypting signaling payloads if privacy is required.

Try-it example

The repository includes a minimal demo page at `docs/examples/video_chat.html` that demonstrates a friend list UI, presence, and WebRTC signaling using Supabase Realtime. It's a client-only demo and uses the public anon key for subscriptions; for production require authentication and strong RLS policies.