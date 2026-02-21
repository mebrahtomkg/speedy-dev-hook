# SpeedyDevHook

## 1. Introduction

**SpeedyDevHook** is a high-performance developer productivity suite designed to augment Sublime Text with IDE-grade intelligence. It bridges the gap between the lightweight agility of Sublime Text and the robust ecosystem of Node.js and the TypeScript Compiler API. By offloading heavy lifting—such as AST-based code navigation and formatting—to a dedicated background server, SpeedyDevHook ensures a fluid, lag-free editing experience while providing sophisticated features typically reserved for heavy IDEs.

## 2. Features

The platform provides a specialized toolset engineered to accelerate the development workflow within Sublime Text.

- **AST-Powered Smart Selection:** Intelligently expands text selection based on the code's structural hierarchy (functions, arrays, objects, and template strings) using the TypeScript Compiler API.

- **Code Formatting:** Seamlessly integrates **Prettier** to format documents. By running Prettier on a background Node.js instance, it avoids blocking the editor UI and supports a vast array of file extensions.

- **Integrated Task Runner:** A dynamic script explorer that scans your project for `package.json` files, allowing you to list and execute `npm` scripts directly in a new terminal window.

- **Cross-Platform Terminal Orchestration:** Robust support for launching native terminals across Windows (CMD), macOS (Terminal.app via AppleScript), and various Linux distributions (Gnome-terminal, Konsole, xterm, etc.).

- **Resource-Aware Server Lifecycle:** Features an intelligent "Auto-Shutdown" mechanism that terminates the background server after periods of inactivity to save system resources, managed by a Python-based heartbeat system.

- **Smart API Discovery:** Automatically handles port allocation to avoid conflicts, ensuring the Sublime Text plugin and the Node.js service communicate reliably on any machine.

## 3. Technologies Used

The technology stack was chosen to maximize performance and leverage the best-in-class tools for JavaScript/TypeScript static analysis.

- **`TypeScript`:** Used for the entire server-side logic to ensure strict type safety and to interface directly with the TypeScript Compiler API for AST traversal.

- **`Python`:** Powers the Sublime Text plugin component, handling the server process lifecycle, terminal spawning, and asynchronous API communication.

- **`Node.js & Express`:** Provides the high-performance runtime and RESTful interface for the background service.

- **`Rspack & SWC`:** A next-generation build pipeline used to bundle the server. Rspack provides lightning-fast compilation, ensuring the dev-hook remains "speedy" from source to execution.

- **`TypeScript Compiler API`:** The core engine for the "Smart Select" feature, allowing the tool to understand the semantic structure of the code.

- **`Prettier`:** Leveraged as the primary engine for high-fidelity code formatting across dozens of file formats.

- **`Sublime Text API`:** Utilized to manipulate the editor's buffer, manage selections, and provide a native UI feel through quick panels and command palettes.

## 4. Architectural Details

SpeedyDevHook is engineered with a focus on non-blocking I/O and deep code understanding.

- **AST-Driven Selection Engine:** Unlike regex-based expansion, the `calcSelection` logic generates a live SourceFile AST. It identifies the "Target Node" at the cursor position and recursively calculates the next logical boundary (e.g., from a variable to an object property, then to the whole object, then to the exported constant).

- **Hybrid Client-Server Lifecycle:** To minimize memory footprint, the server includes a `serverLifeManager` middleware. It tracks a `MAX_INACTIVE_TIME` (45s). The Python plugin implements a daemon thread that "pings" the server every 15 seconds while the editor is open, ensuring the server stays alive only when needed.

- **Transactional Terminal Spawning:** The `runCommandInTerminal` utility implements a detached process strategy. It identifies the host OS and available terminal emulators, then spawns the process independently of the parent Node process. This allows the terminal to persist even if the dev-hook server restarts or shuts down.

- **Zero-Config Port Negotiation:** The plugin utilizes a `find_free_port` utility in Python to dynamically bind to an available TCP port at runtime. This port is passed to the Node.js server via CLI arguments, eliminating "Port already in use" errors.

- **High-Performance Build Pipeline:** The server is bundled into a single CommonJS file (`server.cjs`) using Rspack. This reduces startup time significantly compared to loading hundreds of individual `node_modules` at runtime.

- **Viewport-Safe UI Interaction:** The Python layer translates complex JSON responses from the server into native Sublime Text `Region` objects, ensuring that selection updates are instantaneous and respect the editor's undo/redo stack.

## 5. Getting Started

### Prerequisites

- **Node.js:** Version `22.16.0` or higher.
- **Sublime Text:** Version 4.

### Installation

1.  **Clone the repository** into your Sublime Text `Packages` directory.

2.  **Install Server Dependencies:**
    Open your terminal, navigate into the `server` directory located inside the cloned repository, and install the necessary packages:

    ```bash
    npm install
    ```

3.  **Build the Server:**
    While still in the `server` directory, compile the TypeScript source into the optimized bundle:
    ```bash
    npm run build
    ```
4.  **Restart Sublime Text:**
    After the build process is complete, restart Sublime Text. The plugin will now work automatically, managing the background server lifecycle without further manual intervention.

### Running in Development

If you are modifying the server code, follow these steps to enable development mode:

1.  Set `IS_PRODUCTION = False` in `plugin.py`. **Note:** When this is set to `False`, the Python plugin will **not** start the Node.js server automatically.

2.  **Close Sublime Text** and wait for approximately one minute. This ensures that any existing background processes are fully terminated and the environment is clean.

3.  **Reopen Sublime Text** to begin development.

4.  **Start the Server Manually:** Navigate to the `server` directory in your terminal and run the server in watch mode:
    ```bash
    npm run dev
    ```

- The plugin will now communicate with your manually started server on the default development port.

## 6. Configuration

### 6.1 Server Configuration

The server's behavior is defined by `server/config.json` and constants within `server/src/config/index.ts`:

- **`MAX_INACTIVE_TIME`**: Default `45000` (45 seconds). The server will automatically shut down if no requests or heartbeats are received within this window.

- **`MAX_TXT_SIZE`**: Default `1MB`. The maximum file size the server will process to ensure performance stability.

- **`supportedExtensions`**: Located in `server/config.json`. This list determines which file types the Prettier engine will attempt to format.

### 6.2 Plugin Environment

In `plugin.py`, you can toggle the execution mode:

- **`IS_PRODUCTION`**:

  - When `True` (default), the plugin uses `find_free_port()` to dynamically allocate an available TCP port and passes it to the Node.js server.
  - When `False`, it defaults to port `3000` for easier debugging.

### 6.3 Keybindings

To enable keyboard shortcuts, add the following to your `Default.sublime-keymap` file (Preferences > Key Bindings). The commands mapped below correspond to the internal Python class names:

```json
[
  { "keys": ["ctrl+shift+f"], "command": "speedy_dev_hook_format" },
  { "keys": ["ctrl+shift+l"], "command": "speedy_dev_hook_list_scripts" },
  { "keys": ["ctrl+shift+d"], "command": "speedy_dev_hook_smart_select" }
]
```

### 6.4 Context Menu

The plugin integrates into the Sublime Text context menu. Right-clicking in any view will reveal the **Speedy-Dev-Hook** menu, providing quick access to:

- **Format Code**: Formats the current file.
- **Smart Select**: Expands selection based on AST.
- **List NPM Scripts**: Opens a quick panel to run scripts from the project root.
