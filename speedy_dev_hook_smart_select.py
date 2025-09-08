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
