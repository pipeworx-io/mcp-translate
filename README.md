# @pipeworx/mcp-translate

MCP server for language translation via [LibreTranslate](https://libretranslate.com/). Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `translate` | Translate text from a source language to a target language |
| `detect_language` | Detect the language of a text string |
| `list_languages` | List all supported language codes and names |

## Quickstart (Pipeworx Gateway)

Send a JSON-RPC request to the Pipeworx gateway:

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "translate",
      "arguments": {
        "text": "Hello, world!",
        "source": "en",
        "target": "es"
      }
    }
  }'
```

## License

MIT
