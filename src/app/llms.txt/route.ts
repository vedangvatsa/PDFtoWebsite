import { getLLMSIndex, llmsResponse } from '@/lib/llms-directory';

export const revalidate = 21600; // 6 hours

export async function GET() {
  return llmsResponse(await getLLMSIndex());
}
