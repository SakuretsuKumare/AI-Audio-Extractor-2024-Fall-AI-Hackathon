"use client";

import { useState } from 'react';

export default function Home() {
  // State variables to manage file, loading status, messages, and processed stems
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stems, setStems] = useState([]);

  // Handler for file input changes
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    console.log('File selected:', e.target.files[0]);
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if a file is selected
    if (!file) {
      setMessage('Please select a file first.');
      console.log('No file selected');
      return;
    }
    
    // Set loading state and update message
    setLoading(true);
    setMessage('Processing...');
    console.log('Starting file upload and processing');

    // Create FormData object to send file to the server
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send POST request to the API route
      const response = await fetch('/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Response received:', data);
      
      // Handle successful response
      if (response.ok) {
        if (data.stems && data.stems.length > 0) {
          setMessage('Processing complete!');
          console.log('Stems generated:', data.stems);

          // Create download links for each stem
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
        // Handle error response
        setMessage(`Error: ${data.error}. Details: ${data.details}`);
        console.error('Error details:', data);
      }
    } catch (error) {
      // Handle network or other errors
      setMessage(`An error occurred during processing: ${error.message}`);
      console.error('Fetch error:', error);
    } finally {
      // Reset loading state
      setLoading(false);
      console.log('Processing finished');
    }
  };

  // Render the component
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Audio Processor</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* File input */}
          <input
            type="file"
            onChange={handleFileChange}
            className="border border-gray-300 p-2 rounded"
          />
          {/* Submit button */}
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            disabled={loading || !file}
          >
            {loading ? 'Processing...' : 'Upload and Process'}
          </button>
        </form>
        {/* Display messages and stem download links */}
        {message && <p className="mt-4 text-center">{message}</p>}
        {stems.length > 0 && <div className="mt-4">{stems}</div>}
      </div>
    </div>
  );
}
