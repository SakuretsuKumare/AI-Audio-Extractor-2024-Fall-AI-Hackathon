import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import nextConnect from 'next-connect';

const upload = multer({ dest: 'uploads/' });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post((req, res) => {
  const filePath = req.file.path;
  const outputDir = path.join(process.cwd(), 'output');
  const separateScript = path.join(process.cwd(), 'separate_audio.py');
  const detectScript = path.join(process.cwd(), 'note_detection.py');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  exec(`python ${separateScript} ${filePath} ${outputDir}`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error during separation:', stderr);
      return res.status(500).json({ error: 'Error during separation' });
    }

    exec(`python ${detectScript} ${path.join(outputDir, 'vocals.wav')}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error during note detection:', stderr);
        return res.status(500).json({ error: 'Error during note detection' });
      }

      res.status(200).json({ notes: stdout });
    });
  });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
