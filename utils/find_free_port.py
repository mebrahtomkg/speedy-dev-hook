import socket


def find_free_port():
    """
    Finds an available TCP port by binding to port 0 and immediately closing the socket.
    Returns the port number.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("localhost", 0))  # Bind to localhost and let the OS assign a free port
        port = s.getsockname()[1]  # Get the assigned port number
    return port
