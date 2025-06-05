export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    // 从环境变量获取DeepSeek API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      throw new Error('DeepSeek API密钥未配置，请在Vercel环境变量中设置DEEPSEEK_API_KEY');
    }

    const data = req.body;
    
    // 构建提示词
    const prompt = `作为一名专业的职业规划师，请根据以下青少年的问卷回答，为他/她提供详细的职业规划建议：

问卷回答：
- 最喜欢的学科：${data.favorite_subject || '未填写'}
- 兴趣爱好：${data.hobbies || '未填写'}
- 个人优势：${data.strengths || '未填写'}
- 理想工作环境：${data.work_environment || '未填写'}
- 工作方式偏好：${data.work_style || '未填写'}
- 收入期望：${data.salary_expectation || '未填写'}
- 努力意愿：${data.effort_willingness || '未填写'}

请提供以下内容：
1. 适合的职业方向（3-5个具体职业）
2. 每个职业的详细分析和发展前景
3. 需要培养的技能和知识
4. 学习路径建议
5. 短期和长期目标规划

请用温暖、鼓励的语调，给出实用且具有指导意义的建议，回复请控制在800字以内。`;

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',  // DeepSeek的模型名称
        messages: [
          {
            role: 'system',
            content: '你是一位经验丰富的职业规划师，专门为青少年提供职业指导。请用中文回答，语言要温暖、专业、有指导性。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        stream: false
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('DeepSeek API Error:', result);
      throw new Error(result.error?.message || `API请求失败: ${response.status} - ${result.message || '未知错误'}`);
    }

    // 检查返回结果格式
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('Unexpected API response:', result);
      throw new Error('API返回格式异常');
    }

    // 返回成功结果
    res.status(200).json({
      success: true,
      career_advice: result.choices[0].message.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // 更详细的错误处理
    let errorMessage = '处理请求时出现错误';
    
    if (error.message.includes('API密钥')) {
      errorMessage = 'DeepSeek API密钥配置错误';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'API调用次数已达上限，请稍后重试';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = '网络连接错误，请检查网络后重试';
    } else if (error.message.includes('401')) {
      errorMessage = 'API密钥无效，请检查配置';
    } else if (error.message.includes('429')) {
      errorMessage = 'API调用频率过高，请稍后重试';
    }
    
    res.status(500).json({
      success: false,
      error: `${errorMessage}: ${error.message}`
    });
  }
}
