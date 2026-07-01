import { type NextRequest, NextResponse } from 'next/server';

// Mock 数据（无 API Key 时使用）
const MOCK_RESULT = {
  optimized_resume: `EXPERIENCE
Software Engineer | AI Company | 2022 - Present
• Optimized model inference speed by 40% through model quantization and pruning techniques
• Led a team of 5 engineers to deliver 3 major AI products on schedule
• Improved system reliability from 99.5% to 99.9% uptime

SKILLS
• Programming: Python, TypeScript, Go
• AI/ML: PyTorch, TensorFlow, LLM fine-tuning
• Cloud: AWS, GCP, Docker, Kubernetes`,
  changes: [
    'Added quantifiable achievements (40% speed improvement)',
    'Used strong action verbs (Optimized, Led, Improved)',
    'Matched keywords from job description',
    'Improved ATS compatibility with standard formatting',
  ],
  ats_score: 92,
  keywords_matched: ['Python', 'TypeScript', 'AI/ML', 'AWS', 'Kubernetes'],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, job_description } = body;

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    // 如果没有 API Key，使用 mock 数据
    if (!process.env.OPENAI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
      console.log('⚠️ No API key found, returning mock data');
      return NextResponse.json({
        success: true,
        ...MOCK_RESULT,
        warning: 'Using mock data. Please configure OPENAI_API_KEY for production use.',
        timestamp: new Date().toISOString(),
      });
    }

    // 有 API Key，正常调用
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : undefined,
    });

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
- keywords_matched: array of keywords matched from job description`;

    if (job_description) {
      systemPrompt += `\n\nJob Description:\n${job_description}`;
    }

    const response = await openai.chat.completions.create({
      model: process.env.DEEPSEEK_API_KEY ? 'deepseek-chat' : 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Resume:\n${resume}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Resume optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize resume', details: error.message },
      { status: 500 }
    );
  }
}
