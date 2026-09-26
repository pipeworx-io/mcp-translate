# Translate — LibreTranslate-compatible machine translation

Translate text, detect a language, or list supported languages against any LibreTranslate-compatible instance.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1684+ live data sources.

**You need to bring an instance or a key.** For translation that works with no key of your own, use [`deepl`](../deepl) — `deepl_translate` covers the same languages and Pipeworx fronts the key.

## Tools

| Tool | What it does |
|---|---|
| `translate` | Translate text between two languages |
| `detect_language` | Detect the language of a string, with confidence |
| `list_languages` | Language codes the configured instance supports |

## Auth

Bring your own, one of:

- `_apiKey` — an API key from <https://portal.libretranslate.com> (libretranslate.com is now key-only)
- `_endpoint` — the base URL of a self-hosted instance (<https://github.com/LibreTranslate/LibreTranslate>)

Given neither, every tool returns `{found: false, reason: "requires_key_or_endpoint"}` with a pointer to `deepl_translate`. It does not attempt the call.

## Why it is gated

This pack used to hardcode `libretranslate.com` and call it with no key. That endpoint moved behind an API key, so every call returned the upstream's raw 400 — *"Visit portal.libretranslate.com to get an API key"* — which reads to a caller as Pipeworx being broken rather than as a source needing a key.

The obvious fallback was a free public mirror. There aren't any left. Checked 2026-08-06:

| Instance | Result |
|---|---|
| `translate.argosopentech.com` | does not resolve |
| `libretranslate.com` | 400, key required |
| `translate.terraprint.co` | 502 |
| `lt.vern.cc` | 502 |
| `translate.fedilab.app` | 403 |
| `libretranslate.eownerdead.dedyn.io` | 403 |
| `trans.zillyhuhn.com` | 403 |

So the pack is honestly BYO rather than quietly broken. It is registered in the gateway's `BYO_ONLY_KEY_PACKS`, which sinks it below `deepl_translate` in routing and labels it, so an agent asking to translate something reaches the tool that can answer.

## Data source

LibreTranslate API v1 — <https://github.com/LibreTranslate/LibreTranslate#api>

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "translate": {
      "url": "https://gateway.pipeworx.io/translate/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/translate/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1684+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

This pack takes your own API key (`_apiKey`) — we don't front one for it, so there's no curl here that would run without it. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/translate_translate`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "translate": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-translate"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-translate
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Translate data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
