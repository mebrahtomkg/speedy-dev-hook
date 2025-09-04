import sublime
import sublime_plugin
import time
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
            start_time = int(time.time() * 1000)
            formatted = call_api("/format", method="POST", data=data)
            end_time = int(time.time() * 1000)
            if isinstance(formatted, str):
                self.view.replace(edit, region, formatted)
                print(
                    f"[speedy-dev-hook] File formatted successfully.({end_time-start_time}ms)"
                )
            else:
                raise Exception("[speedy-dev-hook] Invalid format response!")

        except Exception as e:
            sublime.error_message(str(e))
