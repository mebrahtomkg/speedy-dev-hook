import sublime
import sublime_plugin
import time
from .api_client import call_api


class SpeedyDevHookListScriptsCommand(sublime_plugin.WindowCommand):
    def run(self, paths=[]):
        self.scripts = []
        # Get all folders in the current Sublime Text project
        folders = self.window.folders()

        if not folders:
            # If no project folders are open, inform the user and exit.
            sublime.error_message("No project folders open!")
            return

        try:
            start_time = int(time.time() * 1000)
            self.scripts = call_api(f"/scripts?folderpath={folders[0]}")
            end_time = int(time.time() * 1000)
            print(
                f"[speedy-dev-hook] Scripts list fetched successfully.({end_time-start_time}ms)"
            )
            self.window.show_quick_panel(self.scripts, self.on_script_selected)

        except Exception as e:
            sublime.error_message(str(e))

    def on_script_selected(self, index):
        print(f"[speedy-dev-hook] Selected script: {self.scripts[index]}")
