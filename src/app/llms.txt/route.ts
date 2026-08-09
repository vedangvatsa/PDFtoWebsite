import { NextRequest } from 'next/server';
import { getLLMSIndex, llmsCachedResponse } from '@/lib/llms-directory';

export async function GET(request: NextRequest) {
  return llmsCachedResponse(request, () => getLLMSIndex());
}
