'use client';

import { useState, useEffect } from 'react';

// Helper type for our image state
type ImageData = { file: File; preview: string; base64: string };

export default function Home() {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('damage_reports_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
  }, []);

  // MULTIPLE IMAGE HANDLER
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        // Strip the data URL prefix to get the raw base64 string for the API
        const base64Data = previewUrl.split(',')[1];

        setImages(prev => [...prev, { file, preview: previewUrl, base64: base64Data }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCheckDamage = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Package all images for the API
      const payloadImages = images.map(img => ({
        mimeType: img.file.type,
        data: img.base64
      }));

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          images: payloadImages // Sending the array!
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to check damage');

      setResult(data);

      const newReport = { id: Date.now(), timestamp: new Date().toLocaleString(), description, ...data };
      const updatedHistory = [newReport, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('damage_reports_history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // TRUE DIRECT PDF DOWNLOAD
  const handleDirectDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138);
      doc.text('AI Damage Assessment Report', 20, 20);
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 25, 190, 25);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Damage Type:', 20, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(result.damageType || 'N/A', 60, 40);
      doc.setFont('helvetica', 'bold');
      doc.text('Severity:', 20, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(result.severity || 'N/A', 60, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('Estimated Cost:', 20, 60);
      doc.setFont('helvetica', 'normal');
      doc.text((result.estimatedCostINR || '').replace(/₹/g, 'INR '), 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary:', 20, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(result.summary || '', 170), 20, 90);
      doc.save('AI_Damage_Report.pdf');
    } catch (err: any) {
      alert('PDF Error: ' + (err.message || 'Check console.'));
    } finally {
      setIsDownloading(false);
    }
  };

  const getSeverityStyles = (severity: string = '') => {
    if (severity.includes('High') || severity.includes('Critical')) return 'bg-red-100 text-red-800 border-red-200';
    if (severity.includes('Medium')) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <nav className="bg-blue-900 text-white shadow-md py-4 px-8 flex items-center gap-3">
        <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <h1 className="text-xl font-bold tracking-wide">AI Damage Inspector Pro</h1>
      </nav>

      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              1. Upload Evidence
            </h2>

            <label className="block text-sm font-medium text-gray-600 mb-2">Accident Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6 bg-gray-50 outline-none transition-all"
              placeholder="Describe the damage..."
            />

            <label className="block text-sm font-medium text-gray-600 mb-3">Upload Photos</label>

            {/* MULTIPLE IMAGE UI GRID */}
            <div className="flex flex-wrap gap-4 mb-6">
              {images.map((img, index) => (
                <div key={index} className="relative w-24 h-24 group animate-in zoom-in duration-200">
                  <img src={img.preview} alt="upload" className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* The Styled '+' Button */}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-all">
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                <span className="text-xs font-medium">Add Photo</span>
                <input type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" />
              </label>
            </div>

            <button
              onClick={handleCheckDamage}
              disabled={loading || images.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-sm"
            >
              {loading ? 'Analyzing...' : 'Get Damage Report'}
            </button>
            {error && <p className="text-red-500 mt-4 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          </div>

          {/* Assessment Report */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Assessment Report
            </h2>
            {!loading && !result && <div className="flex-grow text-gray-400 bg-gray-50 flex items-center justify-center rounded-xl border border-dashed border-gray-200">Waiting for evidence...</div>}
            {loading && <div className="flex-grow text-blue-500 bg-blue-50/50 flex items-center justify-center rounded-xl animate-pulse font-medium">Inspecting damage details...</div>}

            {result && (
              <div className="flex flex-col flex-grow space-y-5 animate-in fade-in duration-500">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Damage Type</p>
                  <p className="text-xl font-semibold text-gray-800">{result.damageType}</p>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Severity</p>
                    <div><span className={`px-3 py-1 text-sm font-bold rounded-full border ${getSeverityStyles(result.severity)}`}>{result.severity}</span></div>
                  </div>
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs text-blue-500 uppercase font-bold mb-1">Est. Cost</p>
                    <p className="text-2xl font-bold text-blue-700">{result.estimatedCostINR}</p>
                  </div>
                </div>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex-grow">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-3">Executive Summary</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
                </div>
                <button onClick={handleDirectDownload} disabled={isDownloading} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3.5 px-4 rounded-xl transition duration-200 disabled:opacity-70 flex justify-center items-center gap-2">
                  {isDownloading ? 'Generating PDF...' : 'Save as PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Report History Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Report History
          </h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">No previous reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Damage Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cost (INR)</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.damageType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 py-1 text-xs font-bold rounded-full border ${getSeverityStyles(report.severity)}`}>{report.severity}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.estimatedCostINR}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setResult(report)} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">View Report</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}