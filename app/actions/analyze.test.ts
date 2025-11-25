import { describe, it, expect, vi, beforeEach } from 'vitest';

// Define the mock functions that will be used in the tests.
const mockGenerateContent = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
}));

// Use vi.doMock which is not hoisted. This ensures that the mock functions are defined
// before the mock factory is executed. The mock implementation for GoogleGenerativeAI
// uses a standard 'function' to ensure it can be instantiated with 'new'.
vi.doMock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function() {
    return {
      getGenerativeModel: mockGetGenerativeModel,
    };
  }),
}));

// Dynamically import the modules under test AFTER the mocks are configured.
const { analyzeShoes } = await import('./analyze');
const { GoogleGenerativeAI } = await import('@google/generative-ai');

describe('analyzeShoes', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation.
    mockGenerateContent.mockClear();
    mockGetGenerativeModel.mockClear();
    (GoogleGenerativeAI as vi.Mock).mockClear();
  });

  it('should return a valid analysis for a successful API call', async () => {
    const mockResponse = {
      modelName: 'Test Model',
      wearScore: 50,
      status: 'Desgaste medio',
      analysis: 'The shoes are okay.',
      recommendations: [],
    };
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockResponse),
      },
    });

    const result = await analyzeShoes(['data:image/jpeg;base64,sample']);

    expect(result).toEqual(mockResponse);
    expect(GoogleGenerativeAI).toHaveBeenCalledTimes(1);
    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  });

  it('should return an error message for a failed API call', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));

    const result = await analyzeShoes(['data:image/jpeg;base64,sample']);

    expect(result).toEqual({
      error:
        'No pudimos analizar tus zapatillas. Intenta con una imagen más clara.',
    });
  });

  it('should correctly parse the image data from a base64 string', async () => {
    const mockResponse = { modelName: 'Parsed' };
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(mockResponse),
      },
    });
    const base64Image = 'test-base64-data';
    const mimeType = 'image/png';
    const fullImageData = `data:${mimeType};base64,${base64Image}`;

    await analyzeShoes([fullImageData]);

    const sentContent = mockGenerateContent.mock.calls[0][0];
    const imagePart = sentContent[1];

    expect(imagePart).toEqual({
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    });
  });
});
