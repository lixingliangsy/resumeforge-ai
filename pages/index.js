import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [optimized, setOptimized] = useState(null)

  const handleOptimize = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume }),
      })
      
      const result = await response.json()
      setOptimized(result)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>ResumeForge AI - AI Resume Optimizer</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow h-16 flex items-center justify-between px-8">
          <span className="text-2xl font-bold">ResumeForge AI</span>
          <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Dashboard</a>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-4">ResumeForge AI</h1>
          <p className="text-xl text-gray-600 text-center mb-8">AI-powered resume optimizer</p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Optimize Your Resume</h2>
            <form onSubmit={handleOptimize} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Your Resume
                </label>
                <textarea
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your resume content here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={10}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Optimizing...' : 'Optimize Resume'}
              </button>
            </form>

            {optimized && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Optimized Resume</h3>
                <pre className="whitespace-pre-wrap text-sm text-green-800">
                  {JSON.stringify(optimized, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
              <p className="text-gray-600">ATS-friendly formatting</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">Optimize in seconds</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
              <p className="text-gray-600">PDF, DOCX, TXT</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
