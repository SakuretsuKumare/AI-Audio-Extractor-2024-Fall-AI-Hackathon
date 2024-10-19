import librosa
import numpy as np
import sys

def detect_notes(file_path):
    # Load the separated audio file
    y, sr = librosa.load(file_path)

    # Detect pitches
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)

    # Extract the pitches
    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:
            print(f"Time {t/sr:.2f}s: Pitch {pitch:.2f} Hz")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python note_detection.py <input_file>")
    else:
        detect_notes(sys.argv[1])
