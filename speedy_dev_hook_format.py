import sublime
import sublime_plugin
import urllib.request
import urllib.error


class SpeedyDevHookFormatCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        url = f"http://localhost:{3000}/format"
