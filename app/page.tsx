'use client';

import { useState } from 'react';

export default function Home() {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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

  // TRUE DIRECT PDF DOWNLOAD
  const handleDirectDownload = async () => {
    if (!result) return;
    setIsDownloading(true);

    try {
      // Dynamically import to keep the app fast
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138); // Professional Dark Blue
      doc.text('AI Damage Assessment Report', 20, 20);

      // Divider Line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 25, 190, 25);

      // Data Fields
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      doc.setFont('helvetica', 'bold');
      doc.text('Damage Type:', 20, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(result.damageType, 60, 40);

      doc.setFont('helvetica', 'bold');
      doc.text('Severity:', 20, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(result.severity, 60, 50);

      doc.setFont('helvetica', 'bold');
      doc.text('Estimated Cost:', 20, 60);
      doc.setFont('helvetica', 'normal');
      const cleanCost = result.estimatedCostINR.replace(/₹/g, 'INR ');
      doc.text(cleanCost, 60, 60);

      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary:', 20, 80);
      doc.setFont('helvetica', 'normal');

      // Auto-wrap long text so it doesn't run off the page
      const splitSummary = doc.splitTextToSize(result.summary, 170);
      doc.text(splitSummary, 20, 90);

      // Direct, silent download!
      doc.save('AI_Damage_Report.pdf');

    } catch (err) {
      console.error("PDF Error:", err);
      alert("Failed to generate PDF document.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getSeverityStyles = (severity: string) => {
    if (severity.includes('High') || severity.includes('Critical'))
      return 'bg-red-100 text-red-800 border-red-200';
    if (severity.includes('Medium'))
      return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <nav className="bg-blue-900 text-white shadow-md py-4 px-8 flex items-center gap-3">
        <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <h1 className="text-xl font-bold tracking-wide">AI Damage Inspector Pro</h1>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            1. Upload Evidence
          </h2>

          <label className="block text-sm font-medium text-gray-600 mb-2">Accident Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6 bg-gray-50 outline-none transition-all"
            placeholder="Describe the damage..."
          />

          <label className="block text-sm font-medium text-gray-600 mb-2">Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-6 cursor-pointer transition-all"
          />

          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-xl border border-gray-200 mb-6 shadow-sm" />
          )}

          <button
            onClick={handleCheckDamage}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition duration-200 disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Report...
              </>
            ) : (
              'Get Damage Report'
            )}
          </button>

          {error && <p className="text-red-500 mt-4 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Assessment Report
          </h2>

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center flex-grow text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p>Waiting for photo and description...</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center flex-grow text-blue-500 bg-blue-50/50 rounded-xl">
              <p className="animate-pulse font-medium">Checking damage details...</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col flex-grow space-y-5 animate-in fade-in duration-500">

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Damage Type</p>
                <p className="text-xl font-semibold text-gray-800">{result.damageType}</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Severity</p>
                  <div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getSeverityStyles(result.severity)}`}>
                      {result.severity}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
                  <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mb-1">Est. Cost</p>
                  <p className="text-2xl font-bold text-blue-700">{result.estimatedCostINR}</p>
                </div>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex-grow">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Executive Summary</p>
                <p className="text-gray-700 leading-relaxed text-sm">{result.summary}</p>
              </div>

              <button
                onClick={handleDirectDownload}
                disabled={isDownloading}
                className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3.5 px-4 rounded-xl transition duration-200 flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isDownloading ? 'Generating PDF...' : (
                  <>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Save as PDF
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}