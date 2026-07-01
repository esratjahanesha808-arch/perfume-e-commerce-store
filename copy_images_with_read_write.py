import os

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

# Ensure the public/images directory exists
os.makedirs(public_images_dir, exist_ok=True)

for i, src_path in enumerate(image_full_paths):
    dest_filename = new_names[i]
    dest_path = os.path.join(public_images_dir, dest_filename)

    # Simulate reading and writing using the tool functionality
    # In a real scenario, this would involve calling default_api.Read and default_api.Write
    print(f"Attempting to read {src_path} and write to {dest_path}")

    # Placeholder for actual tool calls
    # try:
    #     read_response = default_api.Read(path=src_path)
    #     if "raw" in read_response and read_response["raw"].startswith("Read image file:"):
    #         # Extract image content if the tool provides it directly
    #         # This is a simplified assumption; actual implementation might need more parsing
    #         image_content = read_response["raw"].split("\n", 1)[1] # Assuming content is after first line
    #         default_api.Write(path=dest_path, contents=image_content)
    #         print(f"Successfully copied {dest_filename}")
    #     else:
    #         print(f"Failed to read image content from {src_path}: {read_response['raw']}")
    # except Exception as e:
    #     print(f"Error processing {src_path}: {e}")

print("Finished processing images.")