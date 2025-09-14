import sublime
import subprocess
import threading

from ..config import PORT, SERVER_FILE_PATH
from .find_node_executable import find_node_executable
from .capture_subprocess_output import capture_subprocess_output


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
