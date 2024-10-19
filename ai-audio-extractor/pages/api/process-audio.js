import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createRouter } from 'next-connect';

const upload = multer({ dest: 'uploads/' });

const apiRoute = createRouter();

apiRoute.use(upload.single('file'));

apiRoute.post((req, res) => {
  console.log('API route hit');
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log('File uploaded:', req.file.path);

  try {
    const filePath = req.file.path;
    const outputDir = path.join(process.cwd(), 'output');
    const separateScript = path.join(process.cwd(), 'separate_audio.py');
    const detectScript = path.join(process.cwd(), 'note_detection.py');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    console.log('Executing separation script...');
    try {
      const separationOutput = execSync(`python ${separateScript} ${filePath} ${outputDir}`);
      console.log('Separation successful, stdout:', separationOutput.toString());

      try {
        const noteDetectionOutput = execSync(`python ${detectScript} ${path.join(outputDir, 'vocals.wav')}`);
        console.log('Note detection successful, stdout:', noteDetectionOutput.toString());
      } catch (error) {
        console.error('Error during note detection:', error);
        return res.status(500).json({ error: 'Error during note detection', details: error.message });
      }

      res.status(200).json({ notes: noteDetectionOutput.toString() });
    } catch (error) {
      console.error('Error during separation:', error);
      return res.status(500).json({ error: 'Error during separation', details: error.message });
    }
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
