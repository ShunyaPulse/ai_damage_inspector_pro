import Link from 'next/link';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
        
        <h2 className="text-xl font-semibold text-gray-800 mt-6">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          Dealing with unexpected vehicle dents or property damage is stressful enough without the anxiety of getting overcharged at the repair shop. We built AI Damage Inspector Pro to bring transparency to the Indian repair market. Whether you are a daily commuter with a scraped hatchback, a buyer evaluating a second-hand car, or a local garage owner looking to provide professional estimates, our tool is designed to give you an unbiased, data-driven baseline.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6">How It Works</h2>
        <p className="text-gray-600 leading-relaxed">
          We leverage advanced Vision AI models calibrated specifically for the Indian mass market (Maruti, Hyundai, Tata, etc.) and standard local construction costs. By analyzing your uploaded photos and incident descriptions, our system generates a localized breakdown of parts, labor, and GST—bridging the gap between guesswork and professional surveying.
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mt-6">Built for Transparency</h2>
        <p className="text-gray-600 leading-relaxed">
          This tool was built by an independent developer passionate about solving real-world problems through artificial intelligence. We believe that everyone deserves a fair estimate before walking into a garage.
        </p>
        
        <div className="pt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}