import { NextRequest } from 'next/server';
import { getLLMSFull, llmsCachedResponse } from '@/lib/llms-directory';

export async function GET(request: NextRequest) {
  return llmsCachedResponse(request, () => getLLMSFull());
}
