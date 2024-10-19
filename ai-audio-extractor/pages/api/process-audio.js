import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('API route hit');
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File uploaded:', req.file.path);

    try {
      const filePath = req.file.path;
      const outputDir = path.join(process.cwd(), 'output');
      const separateScript = path.join(process.cwd(), 'separate_audio.py');

      if (!fs.existsSync(outputDir)) {
        console.log('Output directory does not exist. Creating...');
        fs.mkdirSync(outputDir);
      }

      console.log('Executing separation script...');
      try {
        const separationOutput = execSync(`python ${separateScript} ${filePath} ${outputDir}`, { encoding: 'utf8' });
        console.log('Separation successful, stdout:', separationOutput);

        const stemPaths = ['vocals.wav', 'drums.wav', 'bass.wav', 'other.wav', 'piano.wav'].map(stem => path.join(outputDir, stem));
        console.log('Generated stem paths:', stemPaths);

        res.status(200).json({ stems: stemPaths });
      } catch (execError) {
        console.error('Error during script execution:', execError);
        return res.status(500).json({ error: 'Error during separation', details: execError.message, stdout: execError.stdout, stderr: execError.stderr });
      }
    } catch (error) {
      console.error('Unexpected error in API route:', error);
      res.status(500).json({ error: 'Unexpected error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
