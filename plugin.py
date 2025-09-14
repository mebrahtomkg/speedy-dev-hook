from .config import IS_PRODUCTION
from .utils.start_server import start_server


def plugin_loaded():
    if IS_PRODUCTION:
        start_server()
    # In dev mode the developer is responsible to start the server via
    # `npm run dev` command in the server dir.
