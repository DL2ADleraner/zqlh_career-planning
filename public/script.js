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
        submitText.textContent = '🤖 AI分析中...';
        
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
                errorMessage = '服务配置错误，请联系管理员。';
            } else if (error.message.includes('网络')) {
                errorMessage = '网络连接异常，请检查网络后重试。';
            }
            
            alert('❌ ' + errorMessage + '\n\n详细信息: ' + error.message);
            
        } finally {
            // 恢复按钮状态
            loading.classList.add('hidden');
            submitBtn.disabled = false;
            submitText.textContent = '🚀 获取职业规划建议';
        }
    });

    // 重新测试按钮
    newTestBtn.addEventListener('click', function() {
        // 清空表单
        form.reset();
        
        // 隐藏结果
        result.classList.add('hidden');
        
        // 滚动到表单顶部
        form.scrollIntoView({ behavior: 'smooth' });
        
        // 聚焦到第一个输入框
        setTimeout(() => {
            const firstInput = form.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    });

    // 添加表单验证提示
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            
            const questionGroup = this.closest('.question-group');
            questionGroup.style.borderLeftColor = '#dc3545';
            questionGroup.style.backgroundColor = '#fff5f5';
            
            setTimeout(() => {
                questionGroup.style.borderLeftColor = '#667eea';
                questionGroup.style.backgroundColor = '#f8f9fa';
            }, 3000);
            
            this.focus();
        });
        
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                const questionGroup = this.closest('.question-group');
                questionGroup.style.borderLeftColor = '#28a745';
                
                setTimeout(() => {
                    questionGroup.style.borderLeftColor = '#667eea';
                }, 1000);
            }
        });
    });

    // 添加平滑滚动效果
    const questionGroups = document.querySelectorAll('.question-group');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    questionGroups.forEach(group => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(group);
    });
});

// 添加一些实用的辅助函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '300px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    if (type === 'success') {
        notification.style.background = '#28a745';
    } else if (type === 'error') {
        notification.style.background = '#dc3545';
    } else {
        notification.style.background = '#667eea';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter 提交表单
    if (e.ctrlKey && e.key === 'Enter') {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn.disabled) {
            submitBtn.click();
        }
    }
    
    // Escape 键清除结果
    if (e.key === 'Escape') {
        const result = document.getElementById('result');
        if (!result.classList.contains('hidden')) {
            document.getElementById('newTest').click();
        }
    }
});
