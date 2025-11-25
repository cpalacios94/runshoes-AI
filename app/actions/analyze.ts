'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

// Inicializamos el cliente
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function analyzeShoes(imagesBase64: string[]) {
  try {
    // Usamos el modelo 'gemini-1.5-flash' que es rápido y barato/gratis
    // Configuramos 'responseMimeType' para asegurar que devuelva JSON
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })

    // Preparar las imágenes para Gemini
    // Gemini espera un objeto con 'inlineData' sin el prefijo 'data:image/...'
    const imageParts = imagesBase64.map((img) => {
      // Extraemos el tipo (jpeg/png) y la data pura en base64
      const match = img.match(/^data:(image\/\w+);base64,(.+)$/)
      const mimeType = match ? match[1] : 'image/jpeg'
      const data = match ? match[2] : img

      return {
        inlineData: {
          data: data,
          mimeType: mimeType
        }
      }
    })

    const prompt = `
      Eres un experto en biomecánica y zapatillas de running.
      Analiza las imágenes proporcionadas (suela, talón, upper).
      
      Responde estrictamente con este esquema JSON:
      {
        "modelName": "Nombre del modelo identificado o 'Desconocido'",
        "wearScore": (número 0-100, donde 100 es inservible),
        "status": "Buen estado" | "Desgaste medio" | "Reemplazo urgente",
        "analysis": "Explicación detallada del estado de la espuma, suela y tela.",
        "recommendations": [
          { "name": "Modelo similar 1", "reason": "Por qué es similar" },
          { "name": "Modelo similar 2", "reason": "Por qué es similar" }
        ]
      }
    `

    // Enviamos el prompt y las imágenes
    const result = await model.generateContent([prompt, ...imageParts])
    const response = await result.response
    const text = response.text()

    // Devolvemos el objeto parseado
    return JSON.parse(text)
  } catch (error) {
    console.error('Error con Google Gemini:', error)
    return {
      error:
        'No pudimos analizar tus zapatillas. Intenta con una imagen más clara.'
    }
  }
}
