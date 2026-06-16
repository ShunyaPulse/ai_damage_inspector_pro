import Link from 'next/link';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
        
        <p className="text-gray-600 leading-relaxed">
          We would love to hear from you! Whether you have a question about how our AI calculates local repair costs, found a bug in the PDF generator, or have suggestions to make the app better for Indian car owners, please reach out.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Get in Touch</h2>
          <p className="text-blue-800">
            <strong>Email:</strong> techanics6174@gmail.com <br/>
          </p>
        </div>

        <p className="text-sm text-gray-500 italic">
          Please note: Because this is an independently maintained tool, please allow 24-48 hours for a response.
        </p>

        <div className="pt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}