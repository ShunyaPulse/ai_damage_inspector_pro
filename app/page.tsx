'use client';

import { useState } from 'react';

export default function Home() {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCheckDamage = async () => {
    if (!imageFile) {
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            base64Image: base64String,
            mimeType: imageFile.type
          })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to check damage');

        setResult(data);
        setLoading(false);
      };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <nav className="bg-blue-900 text-white shadow-lg py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">AI Damage Inspector Pro</h1>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">1. Upload Evidence</h2>

          <label className="block text-sm font-medium text-gray-600 mb-2">Accident Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-6 bg-gray-50 outline-none"
            placeholder="Describe the damage..."
          />

          <label className="block text-sm font-medium text-gray-600 mb-2">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6 cursor-pointer"
          />

          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border mb-6 shadow-sm" />
          )}

          <button
            onClick={handleCheckDamage}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Report...' : 'Get Damage Report'}
          </button>

          {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">2. Assessment Report</h2>

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center flex-grow text-gray-400">
              <p>Waiting for photo and description...</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center flex-grow text-blue-500">
              <p className="animate-pulse font-semibold">Checking damage details...</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col flex-grow space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-gray-50 rounded border">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Damage Type</p>
                <p className="text-lg font-medium text-gray-800">{result.damageType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Severity</p>
                  <p className={`text-lg font-bold ${result.severity.includes('High') || result.severity.includes('Critical') ? 'text-red-600' : 'text-orange-500'}`}>
                    {result.severity}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded border border-blue-100 shadow-inner">
                  <p className="text-sm text-blue-500 uppercase tracking-wider font-semibold">Est. Cost (INR)</p>
                  <p className="text-lg font-bold text-blue-700">{result.estimatedCostINR}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded border flex-grow">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Executive Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}