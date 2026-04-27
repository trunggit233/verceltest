// File: js/auth.js

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LOGIC CHO FORM ĐĂNG NHẬP (LOGIN)
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    
    // NẾU tìm thấy loginForm trên màn hình thì mới chạy code bên trong
    if (loginForm) { 
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMessage');
            const loginBtn = document.getElementById('loginBtn');

            try {
                loginBtn.textContent = 'Đang đăng nhập...';
                loginBtn.disabled = true;

                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    localStorage.setItem('token', result.accessToken);
                    localStorage.setItem('user', JSON.stringify(result.data))

                    const user = result.data;

                    if (user.role === 'ADMIN') {
                        window.location.href = '/frontend/views/admin/dashboard.html';
                    } else {
                        window.location.href = '/frontend/index.html';
                    }
                } else {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = result.message || 'Sai email hoặc mật khẩu!';
                }
            } catch (error) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Lỗi kết nối đến máy chủ!';
            } finally {
                loginBtn.textContent = 'Đăng Nhập';
                loginBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // 2. LOGIC CHO FORM ĐĂNG KÝ (REGISTER)
    // ==========================================
    const registerForm = document.getElementById('registerForm');
    
    // NẾU tìm thấy registerForm trên màn hình thì mới chạy code bên trong
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const errorMsg = document.getElementById('errorMessage');
            const registerBtn = document.getElementById('registerBtn'); 
            
            const emailValue = document.getElementById('email').value;
            const passwordValue = document.getElementById('password').value;
            const confirmPasswordValue = document.getElementById('confirmPassword').value;

            // Lấy tên tạm từ email
            const autoFullName = emailValue.split('@')[0]; 

            // Validate Mật khẩu
            if (passwordValue !== confirmPasswordValue) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Mật khẩu xác nhận không khớp!';
                return; 
            }
            if (passwordValue.length < 6) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
                return;
            }

            try {
                registerBtn.textContent = 'Đang xử lý...';
                registerBtn.disabled = true;
                errorMsg.style.display = 'none';

                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: emailValue, 
                        password: passwordValue, 
                        fullName: autoFullName 
                    }) 
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
                    window.location.href = './login.html';
                } else {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = result.message || 'Đăng ký thất bại!';
                }
            } catch (error) {
                console.error('Lỗi:', error);
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Lỗi kết nối đến máy chủ!';
            } finally {
                registerBtn.textContent = 'Đăng ký';
                registerBtn.disabled = false;
            }
        });
    }

});