def capture_subprocess_output(pipe, prefix):
    """Capture output from subprocess and print to Sublime console"""
    for line in iter(pipe.readline, ""):
        print(f"[SpeedyDevHook {prefix}] {line.strip()}")
    pipe.close()
