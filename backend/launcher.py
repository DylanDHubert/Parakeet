import os
import tkinter as tk
from tkinter import filedialog, messagebox
import subprocess


def select_directory():
    # Open a folder selection dialog
    folder_selected = filedialog.askdirectory(title="Select Directory")
    if folder_selected:
        # Set the selected directory as the CWD
        os.chdir(folder_selected)
        messagebox.showinfo("Directory Selected", f"Working directory set to: {folder_selected}")

        # Start the main application (Flask backend)
        try:
            subprocess.Popen(['python', 'app.py'])
        except Exception as e:
            messagebox.showerror("Error", f"Failed to start the application:\n{e}")
    else:
        messagebox.showwarning("No Directory Selected", "Please select a directory to continue.")


# Launch GUI
if __name__ == "__main__":
    root = tk.Tk()
    root.title("App Launcher")
    root.geometry("400x200")

    label = tk.Label(root, text="Select a directory to launch the application within:", font=("Arial", 12))
    label.pack(pady=20)

    button = tk.Button(root, text="Select Directory", command=select_directory, font=("Arial", 14))
    button.pack(pady=20)

    root.mainloop()
