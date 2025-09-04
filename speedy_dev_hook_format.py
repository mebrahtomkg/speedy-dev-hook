import sublime
import sublime_plugin
from .api_client import call_api


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
            formatted = call_api("/format", method="POST", data=data)
            if isinstance(formatted, str):
                self.view.replace(edit, region, formatted)
                print("[speedy-dev-hook] File formatted successfully.")
            else:
                raise Exception("[speedy-dev-hook] Invalid format response!")

        except Exception as e:
            sublime.error_message(str(e))
