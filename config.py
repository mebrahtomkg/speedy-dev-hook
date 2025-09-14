import os

from .utils.find_free_port import find_free_port

IS_PRODUCTION = True

SERVER_FILE_PATH = os.path.join(
    os.path.dirname(__file__), "server", "dist", "server.cjs"
)


PORT = None

if IS_PRODUCTION:
    PORT = find_free_port()
else:
    PORT = 3000
