import shutil
import os
import subprocess

image_full_paths = [
    "C:\\Users\\USER\\.cursor\\projects\\c-Users\\USER\\-OneDrive\\Documents\\e-commerce-store/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_24b87b90564b302f70092948a4595d2b_images_ChatGPT_Image_Jun_17__2026__10_01_00_PM-b07257f8-65cf-4fde-9407-09f447f84027.png",
    "C:\\Users\\USER\\.cursor\\projects\\c-Users\\USER\\-OneDrive\\Documents\\e-commerce-store/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_24b87b90564b302f70092948a4595d2b_images_ChatGPT_Image_Jun_17__2026__10_01_29_PM-7c127a4d-6d90-4468-999e-1d61691355b9.png",
    "C:\\Users\\USER\\.cursor\\projects\\c-Users\\USER\\-OneDrive\\Documents\\e-commerce-store/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_24b87b90564b302f70092948a4595d2b_images_ChatGPT_Image_Jun_17__2026__10_05_45_PM-db2776f1-c8ba-44e4-9445-b92b6c14d1e4.png",
    "C:\\Users\\USER\\.cursor\\projects\\c-Users\\USER\\-OneDrive\\Documents\\e-commerce-store/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_24b87b90564b302f70092948a4595d2b_images_ChatGPT_Image_Jun_17__2026__10_08_11_PM-2808c838-df7d-42a1-bd5e-8a5e1b173930.png",
    "C:\\Users\\USER\\.cursor\\projects\\c-Users\\USER\\-OneDrive\\Documents\\e-commerce-store/assets/c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_24b87b90564b302f70092948a4595d2b_images_ChatGPT_Image_Jun_17__2026__10_08_04_PM-287a9ec9-d8f4-4a7b-b178-2d499d79633f.png"
]

new_names = [
    "sauvage.png",
    "oud-eternal.png",
    "noir-absolu.png",
    "valentino-donna.png",
    "eclat-noir.png"
]

public_images_dir = "C:\\Users\\USER\\OneDrive\\Documents\\e-commerce store\\luxora\\public\\images"
assets_dir = "C:\\Users\\USER\\.cursor\\projects\\c-Users\\USER\\-OneDrive\\Documents\\e-commerce-store\\assets"

os.makedirs(public_images_dir, exist_ok=True)

for i, full_path_from_user in enumerate(image_full_paths):
    original_filename = os.path.basename(full_path_from_user)
    dest_filename = new_names[i]
    dest_path = os.path.join(public_images_dir, dest_filename)

    # Use Get-ChildItem to find the actual path that PowerShell can interpret
    powershell_command_find_source = f"Get-ChildItem -Path \"{assets_dir}\" -Recurse -Filter \"{original_filename}\" | Select-Object -ExpandProperty FullName"
    try:
        result = subprocess.run(['powershell.exe', '-Command', powershell_command_find_source], capture_output=True, text=True, check=True)
        source_path = result.stdout.strip()

        if source_path:
            # Copy the file using the resolved source_path
            shutil.copy(source_path, dest_path)
            print(f"Successfully copied {original_filename} to {dest_path}")
        else:
            print(f"Error: Source file not found using Get-ChildItem for {original_filename}")

    except subprocess.CalledProcessError as e:
        print(f"PowerShell command failed for {original_filename}: {e.stderr}")
    except FileNotFoundError:
        print(f"Error: Python shutil.copy could not find the resolved source file: {source_path}")
    except Exception as e:
        print(f"An unexpected error occurred while processing {original_filename}: {e}")

print("Finished copying images.")
