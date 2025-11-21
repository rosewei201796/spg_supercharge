import React, { useState } from 'react';

interface GeneratedImage {
  prompt: string;
  imageUrl: string;
}

interface ApiResponse {
  results: GeneratedImage[];
}

interface ApiError {
  error: string;
  message?: string;
}

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or WebP)');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Convert file to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResults([]);

    // Validate inputs
    if (!imageFile) {
      setError('Please upload a theme image');
      return;
    }

    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setIsLoading(true);

      // Convert image to base64
      const imageData = await fileToBase64(imageFile);

      // Call API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPrompt: userPrompt.trim(),
          imageData,
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to generate images');
      }

      const data: ApiResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      console.error('Error generating images:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setImageFile(null);
    setImagePreview('');
    setUserPrompt('');
    setResults([]);
    setError('');
  };

  // Open image detail modal
  const handleImageClick = (image: GeneratedImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedIndex(-1);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-5xl md:text-6xl font-bold handwriting-title">
              Supercharge your gems!
            </h1>
          </div>
          <p className="text-gray-400 text-lg handwriting-subtitle">
            We get you — completely
          </p>
        </header>

        {/* Main Form Card */}
        <div className="card mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Theme Image *
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="input-field"
                  disabled={isLoading}
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Accepted formats: JPG, PNG, WebP
              </p>
            </div>

            {/* Prompt Input Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Prompt *
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe your channel theme, style, and subject... e.g., 'A cyberpunk character with neon aesthetics'"
                rows={4}
                className="input-field resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Describe the visual theme, subject, and style for your channel
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                <p className="text-sm font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading || !imageFile || !userPrompt.trim()}
                className="btn-primary flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '✨ Generate Channel'
                )}
              </button>
              {(results.length > 0 || imageFile || userPrompt) && !isLoading && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card text-center py-12">
            <div className="inline-block animate-pulse mb-4">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-400 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              Generating Your Channel...
            </h3>
          </div>
        )}

        {/* Results Gallery */}
        {results.length > 0 && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-100">
                Your Gems ({results.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="card hover:shadow-xl transition-all duration-200 cursor-pointer group"
                  onClick={() => handleImageClick(result, index)}
                >
                  <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden relative">
                    <img
                      src={result.imageUrl}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                        Click to view details
                      </span>
                    </div>
                  </div>
                  <div className="pt-3">
                    <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && !error && (
          <div className="card text-center py-12 text-gray-400">
            <p className="text-lg">
              Upload a theme image and enter your prompt to get started
            </p>
          </div>
        )}

        {/* Image Detail Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleCloseModal}
          >
            <div
              className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-100">
                    Image #{selectedIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-green-400 bg-green-900/30 px-3 py-1 rounded-full">
                    Generated
                  </span>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6 rounded-lg overflow-hidden bg-gray-900">
                  <img
                    src={selectedImage.imageUrl}
                    alt={`Generated ${selectedIndex + 1}`}
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      Generation Prompt
                    </h3>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {selectedImage.prompt}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 bg-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedImage.imageUrl;
                        link.download = `generated-image-${selectedIndex + 1}.png`;
                        link.click();
                      }}
                      className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Image
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

