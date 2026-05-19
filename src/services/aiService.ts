/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function generateContent(prompt: string, options: { model?: string, systemInstruction?: string, parts?: any[] } = {}): Promise<string> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: options.model,
        systemInstruction: options.systemInstruction,
        parts: options.parts
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI generation failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}
