# Import necessary libraries
from spleeter.separator import Separator #Trouble importing with 'pip install spleeter'
import sys
import os
import traceback

def separate_audio(file_path, output_dir):
    """
    Separate the audio file into different stems using Spleeter.
    
    Args:
    file_path (str): Path to the input audio file
    output_dir (str): Directory to save the separated audio files
    """
    try:
        print(f"Separating audio: {file_path} into {output_dir}")
        # Initialize the Spleeter separator with 5 stems
        separator = Separator('spleeter:5stems')
        # Perform the separation and save the results
        separator.separate_to_file(file_path, output_dir)
        print(f"Files generated in {output_dir}")
    except Exception as e:
        # Handle any errors that occur during separation
        print(f"Error in separate_audio: {str(e)}")
        print(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    # Check if the correct number of command-line arguments is provided
    if len(sys.argv) != 3:
        print("Usage: python separate_audio.py <input_file> <output_directory>")
        sys.exit(1)
    # Call the separate_audio function with the provided arguments
    separate_audio(sys.argv[1], sys.argv[2])
