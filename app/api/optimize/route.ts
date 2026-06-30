import { type NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined,
})

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resume, job_description } = body

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      )
    }

    // 构建优化提示词
    let systemPrompt = `You are an expert resume optimizer. Improve the provided resume to:
1. Pass ATS (Applicant Tracking System) filters
2. Use strong action verbs and quantifiable achievements
3. Match keywords from the job description (if provided)
4. Keep formatting clean and professional

Return JSON with:
- optimized_resume: improved resume text
- changes: array of key changes made
- ats_score: estimated ATS compatibility score (0-100)
- keywords_matched: array of keywords matched from job description`

    if (job_description) {
      systemPrompt += `\n\nJob Description:\n${job_description}`
    }

    const response = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Resume:\n${resume}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('Resume optimization error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize resume', details: error.message },
      { status: 500 }
    )
  }
}
