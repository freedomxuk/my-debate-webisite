// 用户认证模块
const AuthModule = (function() {
    // 用户数据存储（使用 localStorage）
    const STORAGE_KEY = 'debate_users';
    const SESSION_KEY = 'debate_current_user';

    // 获取所有用户
    function getUsers() {
        const users = localStorage.getItem(STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    }

    // 保存用户列表
    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    // 获取当前登录用户
    function getCurrentUser() {
        const user = localStorage.getItem(SESSION_KEY);
        return user ? JSON.parse(user) : null;
    }

    // 设置当前登录用户
    function setCurrentUser(user) {
        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }

    // 验证邮箱格式
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 查找用户
    function findUser(email) {
        const users = getUsers();
        return users.find(u => u.email === email);
    }

    // 注册
    function register(username, email, password) {
        const users = getUsers();

        // 检查邮箱是否已存在
        if (findUser(email)) {
            return { success: false, message: '该邮箱已注册' };
        }

        // 创建新用户
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // 注意：实际项目应该加密存储
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);

        return { success: true, message: '注册成功', user: newUser };
    }

    // 登录
    function login(email, password) {
        const user = findUser(email);

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        if (user.password !== password) {
            return { success: false, message: '密码错误' };
        }

        setCurrentUser(user);
        return { success: true, message: '登录成功', user };
    }

    // 登出
    function logout() {
        setCurrentUser(null);
        return { success: true, message: '已登出' };
    }

    // 检查是否已登录
    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    // 更新 UI 显示
    function updateAuthUI() {
        const user = getCurrentUser();
        const userAvatar = document.querySelector('.user-avatar span');

        if (user && userAvatar) {
            userAvatar.textContent = user.username.charAt(0).toUpperCase();
        }

        // 更新下拉菜单用户信息
        updateUserDropdown();
    }

    // 更新下拉菜单用户信息
    function updateUserDropdown() {
        const user = getCurrentUser();
        const dropdownName = document.querySelector('.user-dropdown-name');
        const dropdownAvatar = document.querySelector('.user-dropdown-avatar');

        if (user) {
            if (dropdownName) dropdownName.textContent = user.username;
            if (dropdownAvatar) dropdownAvatar.textContent = user.username.charAt(0).toUpperCase();
        }
    }

    // 公开 API
    return {
        register,
        login,
        logout,
        isLoggedIn,
        getCurrentUser,
        validateEmail,
        updateAuthUI
    };
})();

// DOM 操作
document.addEventListener('DOMContentLoaded', function() {
    const userAvatar = document.querySelector('.user-avatar');
    const modal = document.getElementById('authModal');
    const modalClose = document.getElementById('modalClose');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabBtns = document.querySelectorAll('.tab-btn');

    // 更新初始 UI
    AuthModule.updateAuthUI();

    // 打开/关闭用户菜单
    userAvatar.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('userDropdown');

        if (AuthModule.isLoggedIn()) {
            // 已登录，显示/隐藏用户菜单
            if (dropdown) dropdown.classList.toggle('show');
        } else {
            // 未登录，显示登录模态框
            modal.classList.add('show');
        }
    });

    // 关闭模态框
    modalClose.addEventListener('click', function() {
        modal.classList.remove('show');
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // 标签页切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // 更新标签按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 切换表单显示
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelector(`[id="${targetTab}Form"]`).classList.add('active');
        });
    });

    // 登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const email = formData.get('email');
        const password = formData.get('password');

        // 验证邮箱
        if (!AuthModule.validateEmail(email)) {
            showMessage(this, '请输入有效的邮箱地址', 'error');
            return;
        }

        const result = AuthModule.login(email, password);

        if (result.success) {
            showMessage(this, result.message, 'success');
            setTimeout(() => {
                modal.classList.remove('show');
                this.reset();
                AuthModule.updateAuthUI();
            }, 1000);
        } else {
            showMessage(this, result.message, 'error');
        }
    });

    // 注册表单提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // 验证邮箱
        if (!AuthModule.validateEmail(email)) {
            showMessage(this, '请输入有效的邮箱地址', 'error');
            return;
        }

        // 验证密码
        if (password.length < 6) {
            showMessage(this, '密码至少需要6位', 'error');
            return;
        }

        // 验证确认密码
        if (password !== confirmPassword) {
            showMessage(this, '两次输入的密码不一致', 'error');
            return;
        }

        const result = AuthModule.register(username, email, password);

        if (result.success) {
            showMessage(this, result.message, 'success');
            setTimeout(() => {
                modal.classList.remove('show');
                this.reset();
                AuthModule.updateAuthUI();
            }, 1000);
        } else {
            showMessage(this, result.message, 'error');
        }
    });

    // 显示表单消息
    function showMessage(form, message, type) {
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;

        form.insertBefore(messageEl, form.firstChild);
    }

    // 点击页面其他区域关闭下拉菜单
    document.addEventListener('click', function() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    });

    // 阻止下拉菜单内部点击关闭
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('确定要退出登录吗？')) {
                AuthModule.logout();
                AuthModule.updateAuthUI();
                document.getElementById('userDropdown')?.classList.remove('show');
            }
        });
    }

    // ESC 键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    });
});
