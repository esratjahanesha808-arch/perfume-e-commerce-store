import shutil
import os

image_files = [
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

os.makedirs(public_images_dir, exist_ok=True)

for i, src_path in enumerate(image_files):
    dest_path = os.path.join(public_images_dir, new_names[i])
    try:
        shutil.copy(src_path, dest_path)
        print(f"Successfully copied {os.path.basename(src_path)} to {dest_path}")
    except FileNotFoundError:
        print(f"Error: Source file not found: {src_path}")
    except Exception as e:
        print(f"Error copying {src_path}: {e}")

print("Finished copying images.")