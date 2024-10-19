import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createRouter } from 'next-connect';

const upload = multer({ dest: 'uploads/' });

const apiRoute = createRouter();

apiRoute.use(upload.single('file'));

apiRoute.post((req, res) => {
  console.log('API route hit'); // Add this line
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const filePath = req.file.path;
    const outputDir = path.join(process.cwd(), 'output');
    const separateScript = path.join(process.cwd(), 'separate_audio.py');
    const detectScript = path.join(process.cwd(), 'note_detection.py');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    exec(`python ${separateScript} ${filePath} ${outputDir}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error during separation:', error);
        console.error('Separation stderr:', stderr);
        return res.status(500).json({ error: 'Error during separation', details: stderr });
      }

      console.log('Separation successful, stdout:', stdout);

      exec(`python ${detectScript} ${path.join(outputDir, 'vocals.wav')}`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error during note detection:', error);
          console.error('Note detection stderr:', stderr);
          return res.status(500).json({ error: 'Error during note detection', details: stderr });
        }

        console.log('Note detection successful, stdout:', stdout);
        res.status(200).json({ notes: stdout });
      });
    });
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
});

export default function handler(req, res) {
  res.status(200).json({ message: 'API is working' });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
