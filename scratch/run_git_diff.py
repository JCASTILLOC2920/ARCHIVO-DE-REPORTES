import subprocess

try:
    res = subprocess.run(["git", "diff", "--stat"], capture_output=True, text=True)
    print("--- GIT DIFF STAT ---")
    print(res.stdout)
except Exception as e:
    print("Error running git:", e)
