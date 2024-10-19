"use client";

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stems, setStems] = useState([]);

  // Updates the file state with the selected file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log('File selected:', e.target.files[0]);
  };

  // Handles the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      console.log('No file selected');
      return;
    }
    setLoading(true);
    setMessage('Processing...');
    console.log('Starting file upload and processing');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Response received:', data);
      if (response.ok) {
        if (data.stems && data.stems.length > 0) {
          setMessage('Processing complete!');
          console.log('Stems generated:', data.stems);

          const stemLinks = data.stems.map((stem, index) => (
            <div key={index}>
              <a href={stem} download>
                Download {stem.split('/').pop()}
              </a>
            </div>
          ));
          setStems(stemLinks);
        } else {
          setMessage('Processing failed: No stems were generated.');
          console.log('No stems were generated');
        }
      } else {
        setMessage(`Error: ${data.error}. Details: ${data.details}`);
        console.error('Error details:', data);
      }
    } catch (error) {
      setMessage(`An error occurred during processing: ${error.message}`);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
      console.log('Processing finished');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Audio Processor</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            disabled={loading || !file}
          >
            {loading ? 'Processing...' : 'Upload and Process'}
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
        {stems.length > 0 && <div className="mt-4">{stems}</div>}
      </div>
    </div>
  );
}
