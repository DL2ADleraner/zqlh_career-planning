document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('careerForm');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const newTestBtn = document.getElementById('newTest');
    const resultContent = document.getElementById('resultContent');

    // 表单提交处理
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // 显示加载状态
        loading.classList.remove('hidden');
        result.classList.add('hidden');
        submitBtn.disabled = true;
        submitText.textContent = '🤖 DeepSeek AI分析中...';
        
        // 滚动到加载区域
        loading.scrollIntoView({ behavior: 'smooth' });
        
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || `HTTP错误: ${response.status}`);
            }
            
            if (responseData.success) {
                // 显示结果
                resultContent.textContent = responseData.career_advice;
                result.classList.remove('hidden');
                
                // 滚动到结果区域
                setTimeout(() => {
                    result.scrollIntoView({ behavior: 'smooth' });
                }, 300);
                
            } else {
                throw new Error(responseData.error || '未知错误');
            }
            
        } catch (error) {
            console.error('请求错误:', error);
            
            let errorMessage = '分析过程中出现错误，请稍后重试。';
            
            if (error.message.includes('API密钥')) {
                errorMessage = '服务配置错误，请联系管理员检查DeepSeek API配置。';
            } else if (error.message.includes('网络')) {
                errorMessage = '网络连接异常，请检查网络后重试。';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage = 'API调用次数已达上限，请稍后重试。';
            }
            
            alert('❌ ' + errorMessage + '\n\n详细信息: ' + error.message);
            
        } finally {
            // 恢复按钮状态
            loading.classList.add('hidden');
            submitBtn.disabled = false;
            submitText.textContent = '🚀 获取AI职业规划建议';
        }
    });

    // 其余JavaScript代码保持不变...
    newTestBtn.addEventListener('click', function() {
        form.reset();
        result.classList.add('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const firstInput = form.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    });
});
