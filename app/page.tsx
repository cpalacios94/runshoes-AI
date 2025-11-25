'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Chip,
  Progress
} from '@heroui/react'
import { analyzeShoes } from './actions/analyze'

// TypeScript interfaces for the analysis result
interface Recommendation {
  name: string
  reason: string
}

interface AnalysisResult {
  modelName: string
  wearScore: number
  status: string
  analysis: string
  recommendations: Recommendation[]
  error?: string
}

// Iconos simples (puedes usar lucide-react o heroicons)
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
    />
  </svg>
)

export default function Home() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  // Manejar la carga de imágenes
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // Create an array of promises for each file read operation
      const filePromises = Array.from(files).map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      try {
        // Wait for all files to be read
        const newImages = await Promise.all(filePromises)
        setImages((prev) => [...prev, ...newImages])
      } catch (error) {
        console.error('Error reading files:', error)
      }
    }
  }

  // Ejecutar análisis
  const handleAnalyze = async () => {
    if (images.length === 0) return
    setLoading(true)
    const response = await analyzeShoes(images)
    setResult(response)
    setLoading(false)
  }

  // Determinar color del estado
  const getStatusColor = (score: number) => {
    if (score < 40) return 'success'
    if (score < 70) return 'warning'
    return 'danger'
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 mb-2">
          RunAI Check
        </h1>
        <p className="text-gray-400">
          Sube fotos de la suela, costado y talón para verificar la vida útil de
          tus zapatillas.
        </p>
      </header>

      {/* Sección de Upload */}
      <section className="mb-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-800"
            >
              <img
                src={img}
                alt="Zapato"
                className="object-cover w-full h-full"
              />
            </div>
          ))}

          <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-gray-700 hover:border-blue-500 flex flex-col items-center justify-center transition-colors bg-gray-900/50">
            <CameraIcon />
            <span className="text-xs mt-2 text-gray-400">Añadir Foto</span>
            <input
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <div className="flex justify-center">
          <Button
            color="primary"
            size="lg"
            onPress={handleAnalyze}
            isDisabled={images.length === 0 || loading}
            isLoading={loading}
            className="w-full md:w-auto font-semibold"
          >
            {loading ? 'Analizando IA...' : 'Verificar Desgaste'}
          </Button>
        </div>
      </section>

      {/* Resultados */}
      {result && !result.error && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="bg-gray-900 border border-gray-800">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {result.modelName}
                </h2>
                <Chip
                  color={getStatusColor(result.wearScore)}
                  variant="flat"
                  className="mt-2"
                >
                  {result.status}
                </Chip>
              </div>
              <div className="w-full md:w-1/3 text-right">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">
                    Nivel de Desgaste
                  </span>
                  <span className="text-sm font-bold">{result.wearScore}%</span>
                </div>
                <Progress
                  value={result.wearScore}
                  color={getStatusColor(result.wearScore)}
                  className="h-3"
                />
              </div>
            </CardHeader>

            <CardBody className="px-6 py-2">
              <h3 className="font-semibold text-gray-300 mb-2">
                Análisis Técnico
              </h3>
              <p className="text-gray-400 leading-relaxed">{result.analysis}</p>
            </CardBody>

            <CardFooter className="px-6 py-6 flex flex-col items-start">
              <h3 className="font-semibold text-gray-300 mb-4 w-full border-b border-gray-800 pb-2">
                Modelos Recomendados
              </h3>
              <div className="grid md:grid-cols-2 gap-4 w-full">
                {result.recommendations.map(
                  (rec: Recommendation, i: number) => (
                    <div
                      key={i}
                      className="bg-black/40 p-4 rounded-lg border border-gray-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-blue-400">{rec.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {rec.reason}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" color="primary">
                        Ver
                      </Button>
                    </div>
                  )
                )}
              </div>
            </CardFooter>
          </Card>
        </section>
      )}
    </main>
  )
}
