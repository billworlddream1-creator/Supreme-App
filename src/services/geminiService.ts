export interface GeneratedAdContent {
  title: string;
  description: string;
  cta: string;
  style: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
}

export async function generateAdContent(prompt: string): Promise<GeneratedAdContent> {
  try {
    const response = await fetch('/api/ai/generate-ad-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error('Failed to generate ad content');
    return await response.json();
  } catch (error) {
    console.error("Error generating ad content:", error);
    throw error;
  }
}

export async function generateAdVideo(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('/api/ai/generate-ad-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error('Failed to generate ad video');
    const data = await response.json();
    return data.videoUrl || 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
  } catch (error) {
    console.error("Error generating ad video:", error);
    return 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';
  }
}

export interface DiscoveryInsight {
  title: string;
  insight: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'supreme';
  relatedSectors: string[];
}

export async function generateDiscoveryInsights(category: string): Promise<DiscoveryInsight[]> {
  try {
    const response = await fetch('/api/ai/discovery-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    if (!response.ok) throw new Error('Failed to generate insights');
    return await response.json();
  } catch (error) {
    console.error("Error generating discovery insights:", error);
    return [
      {
        title: "Market Volatility Buffer",
        insight: "Current trends suggest a shift towards decentralized assets as a hedge against currency fluctuation.",
        probability: 0.85,
        impact: "high",
        relatedSectors: ["Finance", "Crypto", "Global Trade"]
      }
    ];
  }
}

export interface TechInvention {
  id: string;
  name: string;
  category: 'Vehicles' | 'Devices' | 'Machines' | 'Computing';
  description: string;
  specifications: string[];
  status: 'Prototype' | 'Production' | 'Conceptual';
  impactScore: number;
  image: string;
}

export async function generateTechInventions(): Promise<TechInvention[]> {
  try {
    const response = await fetch('/api/ai/tech-inventions');
    if (!response.ok) throw new Error('Failed to generate tech inventions');
    return await response.json();
  } catch (error) {
    console.error("Error generating tech inventions:", error);
    return [
      {
        id: 'tech-1',
        name: 'Apex-Q Quantum Processor',
        category: 'Computing',
        description: 'Universal quantum computing architecture utilizing topologically protected qubits for unprecedented error correction.',
        specifications: ['10,240 Qubits', 'Cryogenic-Free Operation', 'Real-time Entanglement Mapping'],
        status: 'Production',
        impactScore: 98,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000'
      }
    ];
  }
}
