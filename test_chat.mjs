import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/ANTHROPIC_API_KEY="?([^"\r\n]+)"?/)[1];
const anthropic = createAnthropic({ apiKey: key, baseURL: 'https://api.anthropic.com/v1' });

async function test() {
  console.log('Testing claude-haiku-4-5-20251001:');
  try {
    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: 'You are SubDz, an AI assistant.',
      messages: [{ role: 'user', content: 'Say hello in Algerian Darija!' }],
      maxOutputTokens: 100,
    });

    for await (const text of result.textStream) {
      process.stdout.write(text);
    }
    console.log('\n--- SUCCESS! ---');
  } catch (err) {
    console.error('Error:', err);
  }
}

test();


