import fs from 'fs';
import path from 'path';

export interface AiSettings {
  apiKey: string;
  model: string;
  isEnabled: boolean;
  groundingEnabled: boolean;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'untested';
  lastTestMessage?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PublicAiSettings {
  hasKey: boolean;
  maskedApiKey: string;
  model: string;
  isEnabled: boolean;
  groundingEnabled: boolean;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'untested';
  lastTestMessage?: string;
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_SYSTEM_PROMPT = 
  'You are Rajasthan Suchna AI Assistant (राजस्थान सूचना AI सहायक). You provide accurate, verified information about government recruitment, exams, eligibility, age limits, syllabus, and application deadlines strictly based on verified official notices. Answer concisely and politely in the language the user asked in (Hindi or English). Never hallucinate or invent dates or eligibility criteria.';

const DATA_DIR = path.join(process.cwd(), '.data');
const SETTINGS_FILE = path.join(DATA_DIR, 'ai-settings.json');

// Default initial state
const defaultSettings: AiSettings = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gemini-2.0-flash',
  isEnabled: true,
  groundingEnabled: true,
  temperature: 0.2,
  maxOutputTokens: 1024,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  lastTestStatus: 'untested',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Default',
};

// In-memory cache
let cachedSettings: AiSettings | null = null;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create .data directory for AI settings:', err);
  }
}

function loadFromFile(): AiSettings {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...defaultSettings, ...parsed };
    }
  } catch (err) {
    console.error('Error reading ai-settings.json:', err);
  }
  return { ...defaultSettings };
}

function saveToFile(settings: AiSettings) {
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing ai-settings.json:', err);
  }
}

export class AiSettingsService {
  static getSettings(): AiSettings {
    if (!cachedSettings) {
      cachedSettings = loadFromFile();
    }
    return cachedSettings;
  }

  static getPublicSettings(): PublicAiSettings {
    const s = this.getSettings();
    const key = s.apiKey.trim();
    let masked = '';
    if (key.length > 8) {
      masked = `${key.slice(0, 6)}...${key.slice(-4)}`;
    } else if (key.length > 0) {
      masked = '••••••••';
    }

    return {
      hasKey: Boolean(key),
      maskedApiKey: masked,
      model: s.model,
      isEnabled: s.isEnabled,
      groundingEnabled: s.groundingEnabled,
      temperature: s.temperature,
      maxOutputTokens: s.maxOutputTokens,
      systemPrompt: s.systemPrompt,
      lastTestedAt: s.lastTestedAt,
      lastTestStatus: s.lastTestStatus,
      lastTestMessage: s.lastTestMessage,
      updatedAt: s.updatedAt,
      updatedBy: s.updatedBy,
    };
  }

  static getRawApiKey(): string {
    const s = this.getSettings();
    return s.apiKey.trim();
  }

  static updateSettings(
    updates: Partial<AiSettings>,
    actorName: string = 'Admin'
  ): PublicAiSettings {
    const current = this.getSettings();
    
    // Only update apiKey if provided and not just placeholder
    let newApiKey = current.apiKey;
    if (updates.apiKey !== undefined && updates.apiKey.trim() !== '' && !updates.apiKey.includes('...')) {
      newApiKey = updates.apiKey.trim();
    }

    cachedSettings = {
      ...current,
      ...updates,
      apiKey: newApiKey,
      updatedAt: new Date().toISOString(),
      updatedBy: actorName,
    };

    saveToFile(cachedSettings);
    return this.getPublicSettings();
  }

  static async testConnection(apiKeyToTest?: string): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    modelsFound?: number;
  }> {
    const key = (apiKeyToTest && apiKeyToTest.trim() !== '' && !apiKeyToTest.includes('...'))
      ? apiKeyToTest.trim()
      : this.getRawApiKey();

    if (!key) {
      return {
        success: false,
        message: 'No API key provided. Please enter a valid Gemini API key.',
      };
    }

    const startTime = Date.now();
    try {
      // Query Google's Gemini models endpoint to verify key authorization
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const latencyMs = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `Google API error (${response.status})`;
        this.updateSettings({
          lastTestedAt: new Date().toISOString(),
          lastTestStatus: 'failed',
          lastTestMessage: errorMsg,
        });

        return {
          success: false,
          message: errorMsg,
          latencyMs,
        };
      }

      const modelsCount = Array.isArray(data?.models) ? data.models.length : 0;
      const successMsg = `Connected successfully! Found ${modelsCount} Gemini models.`;

      this.updateSettings({
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'success',
        lastTestMessage: `${successMsg} (${latencyMs}ms)`,
      });

      return {
        success: true,
        message: successMsg,
        latencyMs,
        modelsFound: modelsCount,
      };
    } catch (err: unknown) {
      const latencyMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : 'Network error connecting to Gemini API';
      
      this.updateSettings({
        lastTestedAt: new Date().toISOString(),
        lastTestStatus: 'failed',
        lastTestMessage: errorMsg,
      });

      return {
        success: false,
        message: errorMsg,
        latencyMs,
      };
    }
  }

  static async generateTestResponse(prompt: string): Promise<{
    success: boolean;
    text: string;
    model: string;
    latencyMs: number;
  }> {
    const settings = this.getSettings();
    const key = settings.apiKey.trim();
    if (!key) {
      throw new Error('Gemini API key is not configured.');
    }

    const model = settings.model || 'gemini-2.0-flash';
    const startTime = Date.now();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: settings.temperature,
            maxOutputTokens: settings.maxOutputTokens,
          },
          systemInstruction: {
            parts: [{ text: settings.systemPrompt }],
          },
        }),
      }
    );

    const latencyMs = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini API returned status ${response.status}`);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return {
      success: true,
      text,
      model,
      latencyMs,
    };
  }
}
