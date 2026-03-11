# pptx-slide-agent

Electron desktop app for AI-powered PowerPoint slide generation using the GitHub Copilot SDK.

## Github Copilot SDK

[Getting Started](https://github.com/github/copilot-sdk?tab=readme-ov-file#getting-started)  

All SDKs communicate with the Copilot CLI server via JSON-RPC:

Your Application
       ↓
  SDK Client
       ↓ JSON-RPC
  Copilot CLI (server mode)

## Settings

**GitHub PAT permissions:**
- **Classic PAT** — no specific scope needed; the account must have an active Copilot subscription.
- **Fine-grained PAT** — Under "Permissions," click Add permissions and select **Copilot Requests**.

```env
# Required: GitHub PAT with Copilot access
GITHUB_TOKEN=your_github_token

# Required for Azure OpenAI (omit to use GitHub-hosted models)
MODEL_PROVIDER=azure
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com

# Optional: override the default model/deployment
MODEL_NAME=gpt-5
```

## MarkItDown Ingestion

Datasource ingestion uses a local `uv`-managed Python environment so MarkItDown stays isolated from the system Python installation.

Set it up once from the repo root:

```bash
pnpm setup:markitdown
```

This creates `.venv-markitdown` and installs the dependencies from [requirements-markitdown.txt](requirements-markitdown.txt). The Electron app automatically prefers that interpreter when converting files and URLs into Markdown summaries.

If you need to override the interpreter manually, set `PPTX_SLIDE_AGENT_PYTHON`.

## Persistent Storage

App data is stored in the Electron `userData` directory:

| File | Path (Windows) | Description |
|------|----------------|-------------|
| `settings.json` | `%APPDATA%\pptx-slide-agent\settings.json` | API keys, model settings, and other preferences |
| `workspace.json` | `%APPDATA%\pptx-slide-agent\workspace.json` | Last-used workspace directory |

On macOS the equivalent path is `~/Library/Application Support/pptx-slide-agent/`.

### Project Files

Work can be saved and loaded as `.pptapp` project files (JSON). A project snapshot includes:
- Slide outline / story content
- Chat message history
- Full palette configuration (theme slots and tokens)