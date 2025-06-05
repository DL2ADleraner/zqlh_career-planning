from http.server import BaseHTTPRequestHandler
import json
import openai
import os
from datetime import datetime

# 从环境变量获取API密钥
openai.api_key = os.environ.get('OPENAI_API_KEY')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 设置CORS头
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # 读取请求数据
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # 构建提示词
            prompt = f"""
作为一名专业的职业规划师，请根据以下青少年的问卷回答，为他/她提供详细的职业规划建议：

问卷回答：
- 最喜欢的学科：{data.get('favorite_subject', '')}
- 兴趣爱好：{data.get('hobbies', '')}
- 个人优势：{data.get('strengths', '')}
- 理想工作环境：{data.get('work_environment', '')}
- 工作方式偏好：{data.get('work_style', '')}
- 收入期望：{data.get('salary_expectation', '')}
- 努力意愿：{data.get('effort_willingness', '')}

请提供以下内容：
1. 适合的职业方向（3-5个具体职业）
2. 每个职业的详细分析和发展前景
3. 需要培养的技能和知识
4. 学习路径建议
5. 短期和长期目标规划

请用温暖、鼓励的语调，给出实用且具有指导意义的建议。
"""
            
            # 调用OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "你是一位经验丰富的职业规划师，专门为青少年提供职业指导。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            career_advice = response.choices[0].message.content
            
            result = {
                'success': True,
                'career_advice': career_advice,
                'timestamp': datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            error_result = {
                'success': False,
                'error': str(e)
            }
            self.wfile.write(json.dumps(error_result, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

