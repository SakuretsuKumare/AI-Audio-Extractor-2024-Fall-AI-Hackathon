import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formidable = require('formidable');
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'tmp');
    form.keepExtensions = true;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const inputFile = files.audio.filepath;
    const outputDir = path.join(process.cwd(), 'public', 'output');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const command = `spleeter separate -p spleeter:5stems-16kHz -o ${outputDir} ${inputFile}`;
    await execPromise(command);

    const stems = ['vocals', 'drums', 'bass', 'piano', 'other'];
    const outputFiles = stems.map(stem => `/output/${path.basename(inputFile, path.extname(inputFile))}/${stem}.wav`);

    res.status(200).json({ message: 'Audio processed successfully', outputFiles });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ message: 'Error processing audio' });
  }
}
