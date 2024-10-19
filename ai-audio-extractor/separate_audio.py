from spleeter.separator import Separator
import sys
import os
import traceback

import sys
import traceback
from spleeter.separator import Separator

def separate_audio(file_path, output_dir):
    try:
        print(f"Separating audio: {file_path} into {output_dir}")
        separator = Separator('spleeter:5stems')
        separator.separate_to_file(file_path, output_dir)
        print(f"Files generated in {output_dir}")
    except Exception as e:
        print(f"Error in separate_audio: {str(e)}")
        print(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python separate_audio.py <input_file> <output_directory>")
        sys.exit(1)
    separate_audio(sys.argv[1], sys.argv[2])

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python separate_audio.py <input_file> <output_directory>")
    else:
        separate_audio(sys.argv[1], sys.argv[2])
