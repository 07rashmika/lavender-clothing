import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DesignSuggestion {
  colors: string[];
  fonts: string[];
  source: 'openai' | 'mock';
}

const MOCK_PALETTES: Record<string, { colors: string[]; fonts: string[] }> = {
  elegant: { colors: ['Soft Lavender', 'Charcoal', 'Cream'], fonts: ['Playfair Display', 'Cormorant Garamond'] },
  bold: { colors: ['Terracotta', 'Charcoal', 'Mustard'], fonts: ['Bebas Neue', 'Archivo Black'] },
  playful: { colors: ['Dusty Rose', 'Sage Green', 'Sunny Yellow'], fonts: ['Poppins', 'Fredoka'] },
  default: { colors: ['Soft Lavender', 'Dusty Rose', 'Sage Green'], fonts: ['Montserrat', 'Playfair Display'] },
};

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private readonly config: ConfigService) {}

  async getDesignSuggestions(description: string): Promise<DesignSuggestion> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set — returning mock recommendations');
      return this.getMockSuggestions(description);
    }

    return this.getOpenAiSuggestions(description, apiKey);
  }

  private getMockSuggestions(description: string): DesignSuggestion {
    const text = description.toLowerCase();
    let key = 'default';
    if (/elegant|classy|formal|sophisticated/.test(text)) key = 'elegant';
    else if (/bold|edgy|strong|dramatic/.test(text)) key = 'bold';
    else if (/playful|fun|cute|casual/.test(text)) key = 'playful';

    const palette = MOCK_PALETTES[key];
    return { colors: palette.colors, fonts: palette.fonts, source: 'mock' };
  }

  private async getOpenAiSuggestions(description: string, apiKey: string): Promise<DesignSuggestion> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a fashion design assistant for a clothing customization studio. Given a short description of a desired look, respond ONLY with JSON: {"colors": [3 to 5 color names], "fonts": [2 to 3 font style names]}. Colors should be evocative names suitable for fabric/print (e.g. "Dusty Rose", "Sage Green"), not hex codes.',
          },
          { role: 'user', content: description },
        ],
      }),
    });

    if (!res.ok) {
      this.logger.error(`OpenAI request failed: ${res.status} ${await res.text()}`);
      // Fail gracefully to mock rather than breaking the customization flow
      return this.getMockSuggestions(description);
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const parsed = JSON.parse(data.choices[0].message.content) as { colors: string[]; fonts: string[] };
    return { colors: parsed.colors, fonts: parsed.fonts, source: 'openai' };
  }
}