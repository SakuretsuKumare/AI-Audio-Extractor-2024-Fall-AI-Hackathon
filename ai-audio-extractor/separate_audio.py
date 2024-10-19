from spleeter.separator import Separator
import sys

def separate_audio(file_path, output_dir):
    # Initialize Spleeter with the 5stems model
    separator = Separator('spleeter:5stems')

    # Separate the audio file
    separator.separate_to_file(file_path, output_dir)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python separate_audio.py <input_file> <output_directory>")
    else:
        separate_audio(sys.argv[1], sys.argv[2])
