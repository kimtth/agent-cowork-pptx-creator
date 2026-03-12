# pptx-slide-agent

Electron desktop app for AI-powered PowerPoint slide generation using the GitHub Copilot SDK.

## Getting Started

Run the development server:
```
pnpm dev
```

## Github Copilot SDK

[Getting Started](https://github.com/github/copilot-sdk?tab=readme-ov-file#getting-started)  

All SDKs communicate with the Copilot CLI server via JSON-RPC:

```
Your Application
       ↓
  SDK Client
       ↓ JSON-RPC
  Copilot CLI (server mode)
```

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

## Python Environment

Datasource ingestion and PPTX generation use a local `uv`-managed Python environment so MarkItDown and `python-pptx` stay isolated from the system Python installation.

Set it up once from the repo root:

```bash
pnpm setup:python-env
```

This creates `.venv` and installs the dependencies declared in [pyproject.toml](pyproject.toml). The Electron app automatically prefers that interpreter for both content ingestion and PPTX generation.

If you need to override the interpreter manually, set `PPTX_SLIDE_AGENT_PYTHON`.

`pnpm setup:python-env` remains available as an alias for the same environment setup.

### python-pptx

https://python-pptx.readthedocs.io/

PPTX generation runs through a bundled Python runner at [scripts/pptx-python-runner.py](scripts/pptx-python-runner.py), which executes agent-generated `python-pptx` code with the runtime variables `OUTPUT_PATH`, `PPTX_TITLE`, and `PPTX_THEME`.

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

## Preview

The center preview panel renders local slide images from the generated PPTX.

- The app generates the deck through the existing Python runner and exports slide images locally for preview.
- Rendered preview assets are stored under `previews/` in the configured workspace directory.
- On Windows, local rendering requires Microsoft PowerPoint and the `pywin32` package in the managed Python environment.
- Preview rendering is local and does not require a public URL.

## Agentic Workflows

Repository-level Copilot workflow instructions live under [workflows/prestaging.md](workflows/prestaging.md) and [workflows/create-pptx.md](workflows/create-pptx.md).

- `prestaging.md` defines the planning workflow for understanding content, selecting a framework, and staging slide definitions.
- `create-pptx.md` defines the final PPTX workflow, including mandatory `slide-final-review` before python-pptx generation.
- `electron/ipc/copilot-runtime.ts` defines the root workflow instruction path used by the app when building Copilot prompts.
