import sublime
import sublime_plugin
import time
from .api_client import call_api


class SpeedyDevHookSmartSelectCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        # Get the entire source text from the current view
        region = sublime.Region(0, self.view.size())
        sourceText = self.view.substr(region)

        # Get the current cursor position (or start of the first selection)
        # If there's no selection, sel()[0].begin() gives the cursor position.
        cursorPosition = self.view.sel()[0].begin()

        data = {
            "cursorPosition": cursorPosition,
            "sourceText": sourceText,
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

            selected_node = result.get("selectedNode")

            if not selected_node:
                raise Exception("Invalid or null selected node!")

            if not isinstance(selected_node, dict):
                raise Exception("Invalid selected node format!")

            start = selected_node.get("start")
            end = selected_node.get("end")

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
