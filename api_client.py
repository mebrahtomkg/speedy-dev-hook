import http.client
import json
from typing import Union, Dict, Any

BASE_HOST = "localhost"
BASE_PORT = 3000
BASE_URL_PREFIX = f"http://{BASE_HOST}:{BASE_PORT}"


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
    conn = None
    response_body = ""
    full_path = endpoint  # Endpoint already includes the leading slash, e.g., '/format'

    try:
        conn = http.client.HTTPConnection(BASE_HOST, BASE_PORT)

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
