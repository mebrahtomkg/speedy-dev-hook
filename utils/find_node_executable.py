import shutil
import platform
import os


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
