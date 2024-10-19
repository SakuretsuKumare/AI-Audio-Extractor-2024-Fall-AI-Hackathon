'use client';

import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import WaveSurfer from 'wavesurfer.js';

export default function Home() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [outputFiles, setOutputFiles] = useState(null);
  const [wavesurfers, setWavesurfers] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('/api/process-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOutputFiles(response.data.outputFiles);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setProcessing(false);
    }
  };

  const playAudio = (stem) => {
    if (wavesurfers[stem]) {
      wavesurfers[stem].play();
    } else {
      const wavesurfer = WaveSurfer.create({
        container: `#waveform-${stem}`,
        waveColor: 'violet',
        progressColor: 'purple',
      });
      wavesurfer.load(outputFiles[stem]);
      wavesurfer.on('ready', () => {
        wavesurfer.play();
      });
      setWavesurfers({ ...wavesurfers, [stem]: wavesurfer });
    }
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-3xl font-bold">AI Audio Extractor</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="border border-gray-300 p-2 rounded"
          />
          <button
            type="submit"
            disabled={!file || processing}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {processing ? 'Processing...' : 'Process Audio'}
          </button>
        </form>

        {outputFiles && (
          <div className="w-full max-w-3xl">
            <h2 className="text-2xl font-semibold mb-4">Separated Tracks:</h2>
            {outputFiles.map((file, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-xl font-medium mb-2">{file.split('/').pop().split('.')[0]}</h3>
                <div id={`waveform-${index}`} className="w-full h-24"></div>
                <button
                  onClick={() => playAudio(index)}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                >
                  Play
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
