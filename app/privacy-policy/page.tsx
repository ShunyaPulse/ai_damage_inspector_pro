import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Effective Date: {new Date().toLocaleDateString()}</p>
        
        <p className="text-gray-600 leading-relaxed">
          At AI Damage Inspector Pro, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by us and how we use it.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6">1. Data Processing and Storage</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li><strong>Image and Text Processing:</strong> When you upload photos and text descriptions of damage, this data is temporarily transmitted securely via API to our AI processing partner solely for the purpose of generating your repair estimate.</li>
          <li><strong>Local Storage:</strong> To ensure your privacy, we do not currently store your generated reports, images, or personal details on any external database. Your 10 most recent reports are saved locally inside your own browser's storage. If you clear your browser cache, this history is permanently deleted.</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-800 mt-6">2. Google AdSense & Cookies</h2>
        <p className="text-gray-600 leading-relaxed">
          We use Google AdSense to display advertisements to our users. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Google's Ads Settings.
        </p>

        <div className="pt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}