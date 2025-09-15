import socket
import os
import shutil
import platform
import sublime
import subprocess
import threading
import http.client
import json
import sublime_plugin
import time

from typing import Union, Dict, Any

IS_PRODUCTION = False

SERVER_FILE_PATH = os.path.join(
    os.path.dirname(__file__), "server", "dist", "server.cjs"
)

PORT = None


################################################################################################
def find_free_port():
    """
    Finds an available TCP port by binding to port 0 and immediately closing the socket.
    Returns the port number.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("localhost", 0))  # Bind to localhost and let the OS assign a free port
        port = s.getsockname()[1]  # Get the assigned port number
    return port


################################################################################################


if IS_PRODUCTION:
    PORT = find_free_port()
else:
    PORT = 3000


################################################################################################
def find_node_executable():
    """Finds the Node.js executable in a cross-platform manner."""
    # First, try to find Node.js in the system's PATH
    node_binary = shutil.which("node")
    if node_binary:
        return node_binary

    # If not found, check known default paths based on OS
    possible_paths = []
    if platform.system() == "Windows":
        # Common Windows installation paths
        possible_paths.append(
            os.path.join(
                os.environ.get("PROGRAMFILES", "C:\\Program Files"),
                "nodejs",
                "node.exe",
            )
        )
        possible_paths.append(
            os.path.join(
                os.environ.get(
                    "LOCALAPPDATA",
                    os.path.join(os.environ["USERPROFILE"], "AppData", "Local"),
                ),
                "Programs",
                "nodejs",
                "node.exe",
            )
        )
    elif platform.system() == "Darwin":  # macOS
        possible_paths.append("/usr/local/bin/node")
        possible_paths.append("/usr/bin/node")
        possible_paths.append("/opt/homebrew/bin/node")  # For Homebrew installations
    else:  # Linux
        possible_paths.append("/usr/local/bin/node")
        possible_paths.append("/usr/bin/node")
        possible_paths.append("/opt/node/bin/node")
        # Check for nvm installations
        nvm_path = os.path.join(os.environ.get("HOME", ""), ".nvm", "node")
        if os.path.exists(nvm_path):
            possible_paths.append(nvm_path)

    # Check each possible path
    for path in possible_paths:
        if os.path.exists(path):
            return path

    # If still not found, return None
    return None


################################################################################################
def capture_subprocess_output(pipe, prefix):
    """Capture output from subprocess and print to Sublime console"""
    for line in iter(pipe.readline, ""):
        print(f"[SpeedyDevHook {prefix}] {line.strip()}")
    pipe.close()


################################################################################################
def start_server():
    service_process = None

    node_path = find_node_executable()
    if not node_path:
        print(
            "[SpeedyDevHook] Node.js not found. Please install Node.js and ensure it's in the system PATH."
        )
        return

    try:
        service_process = subprocess.Popen(
            [node_path, SERVER_FILE_PATH, "--port", str(PORT)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            bufsize=1,
        )

        # Start threads to capture output
        threading.Thread(
            target=capture_subprocess_output,
            args=(service_process.stdout, "STDOUT"),
            daemon=True,
        ).start()

        threading.Thread(
            target=capture_subprocess_output,
            args=(service_process.stderr, "STDERR"),
            daemon=True,
        ).start()

    except Exception as e:
        print("[SpeedyDevHook] Failed to start server: {}".format(str(e)))
        sublime.error_message(
            "[SpeedyDevHook] Failed to start server: {}".format(str(e))
        )


################################################################################################
def call_api(
    endpoint: str, method: str = "GET", data: Union[Dict[str, Any], None] = None
) -> Union[str, Dict[str, Any]]:
    """
    Calls a specified API endpoint with given data and HTTP method.

    Args:
        endpoint (str): The API endpoint (e.g., '/format').
                        This will be appended to BASE_URL_PREFIX
        method (str): The HTTP method to use ('GET', 'POST', 'PUT', 'DELETE', etc.).
                      Defaults to 'GET'.
        data (dict, optional): A dictionary to be sent as JSON in the request body.
                               Only applicable for methods like 'POST' or 'PUT'.
                               Defaults to None.

    Returns:
        Union[str, dict]: The API response. If the response is valid JSON, it returns
                          a dictionary. Otherwise, it returns the raw response body as a string.

    Raises:
        Exception: For any network-related errors, or unsuccessful
                   HTTP status codes (4xx or 5xx).
    """
    BASE_HOST = "localhost"

    conn = None
    response_body = ""
    full_path = endpoint  # Endpoint already includes the leading slash, e.g., '/format'

    try:
        conn = http.client.HTTPConnection(BASE_HOST, PORT)

        headers = {
            "Accept": "application/json, text/plain, */*"  # Indicate preference for JSON
        }

        body_bytes = None

        if data:
            if method.upper() in ["POST", "PUT", "PATCH"]:
                headers["Content-Type"] = "application/json"
                body_bytes = json.dumps(data).encode("utf-8")

        conn.request(method.upper(), full_path, body=body_bytes, headers=headers)
        response = conn.getresponse()

        response_body = response.read().decode("utf-8")

        # Check for HTTP status codes indicating errors (4xx or 5xx)
        if 400 <= response.status < 600:
            error_message = (
                f"API Error: {response.status} {response.reason}\n"
                f"Endpoint: {endpoint}\n"
                f"Method: {method}\n"
                f"Response Body: {response_body}"
            )
            raise Exception(error_message)

        # Try to parse the response as JSON
        try:
            return json.loads(response_body)
        except json.JSONDecodeError:
            return response_body

    except http.client.HTTPException as e:
        print(f"HTTP Client Error occurred: {e}")
        raise
    except ConnectionRefusedError as e:
        print(
            f"Connection Refused: Ensure speedy-dev-hook server is running and accessible. {e}"
        )
        raise
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise
    finally:
        if conn:
            conn.close()


################################################################################################
class SpeedyDevHookFormatCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        region = sublime.Region(0, self.view.size())
        code = self.view.substr(region)

        file_path = self.view.file_name()

        data = {
            "filepath": file_path,
            "content": code,
        }

        try:
            start_time = int(time.time() * 1000)
            formatted = call_api("/format", method="POST", data=data)
            end_time = int(time.time() * 1000)
            if isinstance(formatted, str):
                self.view.replace(edit, region, formatted)
                print(
                    f"[speedy-dev-hook] File formatted successfully.({end_time-start_time}ms)"
                )
            else:
                raise Exception("[speedy-dev-hook] Invalid format response!")

        except Exception as e:
            sublime.error_message(str(e))


################################################################################################
class SpeedyDevHookListScriptsCommand(sublime_plugin.WindowCommand):
    def run(self, paths=[]):
        self.scripts = []

        # Get all folders in the current Sublime Text project
        self.folders = self.window.folders()

        if not self.folders:
            # If no project folders are open, inform the user and exit.
            sublime.error_message("No project folders open!")
            return

        try:
            start_time = int(time.time() * 1000)
            self.scripts = call_api(f"/scripts?folderpath={self.folders[0]}")
            end_time = int(time.time() * 1000)
            print(
                f"[speedy-dev-hook] Scripts list fetched successfully.({end_time-start_time}ms)"
            )
            self.window.show_quick_panel(self.scripts, self.on_script_selected)

        except Exception as e:
            sublime.error_message(str(e))

    def on_script_selected(self, index):
        call_api(
            f"/run-script?folderpath={self.folders[0]}&script={self.scripts[index]}"
        )


################################################################################################
class SpeedyDevHookSmartSelectCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        # Get the entire source text from the current view
        region = sublime.Region(0, self.view.size())
        sourceText = self.view.substr(region)

        # Get the current cursor position (or start of the first selection)
        # Sublime Text always has at least one region in view.sel(),
        # even if it's an empty region representing the cursor.
        current_selection_region = self.view.sel()[0]

        # This is the start of the first region. [2, 6]
        cursorPosition = current_selection_region.begin()

        selection_start = -1
        selection_end = -1

        # Check if there is an actual selection (not just an empty cursor region). [6]
        if not current_selection_region.empty():
            selection_start = current_selection_region.begin()
            selection_end = current_selection_region.end()

        data = {
            "cursorPosition": cursorPosition,
            "sourceText": sourceText,
            "selectionStart": selection_start,
            "selectionEnd": selection_end,
        }

        try:
            start_time = int(time.time() * 1000)
            result = call_api("/smart-select", method="POST", data=data)
            end_time = int(time.time() * 1000)

            if not isinstance(result, dict):
                raise Exception("Invalid smart selection response format!")

            print(
                f"[speedy-dev-hook] Smart select info fetched.({end_time-start_time}ms)"
            )

            selection = result.get("selection")

            if not selection:
                raise Exception("Invalid or null selection!")

            if not isinstance(selection, dict):
                raise Exception("Invalid selection format!")

            start = selection.get("start")
            end = selection.get("end")

            if not isinstance(start, int):
                raise Exception("Invalid selection start type!")

            if not isinstance(end, int):
                raise Exception("Invalid selection end type!")

            # Clear existing selections
            self.view.sel().clear()

            # Add the new selection based on the API response
            self.view.sel().add(sublime.Region(start, end))

        except Exception as e:
            sublime.error_message(f"[speedy-dev-hook] Error: {str(e)}")


################################################################################################
def ping_server_periodically():
    """
    Continuously pings the server's '/ping' endpoint every 15 seconds.
    This function is intended to be run in a separate daemon thread.
    """
    while True:
        try:
            call_api("/ping")
        except Exception as e:
            # Log the error but don't stop the loop, as the server might
            # temporarily be down or unresponsive.
            print(f"[SpeedyDevHook] Ping failed: {e}")
        time.sleep(15)  # Wait for 15 seconds before the next ping


################################################################################################
def plugin_loaded():
    # In dev mode the developer is responsible to start the server via
    # `npm run dev` command in the server dir.
    if IS_PRODUCTION:
        start_server()

    # Start the ping loop in a separate daemon thread
    ping_thread = threading.Thread(target=ping_server_periodically, daemon=True)
    ping_thread.start()
