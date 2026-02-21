export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page not found</p>
        <a href="/" className="text-blue-600 hover:underline">Go back home</a>
      </div>
    </div>
  );
}
