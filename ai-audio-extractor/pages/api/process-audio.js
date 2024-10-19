import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { filePath } = req.body;

    // Define paths for output and scripts
    const outputDir = path.join(process.cwd(), 'output');
    const separateScript = path.join(process.cwd(), 'separate_audio.py');
    const detectScript = path.join(process.cwd(), 'note_detection.py');

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Run the separation script
    exec(`python ${separateScript} ${filePath} ${outputDir}`, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: stderr });
      }

      // Run the note detection script
      exec(`python ${detectScript} ${path.join(outputDir, 'vocals.wav')}`, (error, stdout, stderr) => {
        if (error) {
          return res.status(500).json({ error: stderr });
        }

        res.status(200).json({ notes: stdout });
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
