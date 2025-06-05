document.getElementById('careerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    // 显示加载状态
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');
    document.getElementById('submitBtn').disabled = true;
    
    try {
        // 修改API端点为Vercel格式
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('resultContent').textContent = result.career_advice;
            document.getElementById('result').classList.remove('hidden');
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        alert('分析过程中出现错误，请稍后重试: ' + error.message);
    } finally {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('submitBtn').disabled = false;
    }
});

