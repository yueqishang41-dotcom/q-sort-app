"""
Django settings for qsort_backend project.

Q-Sort 实验数据后端。
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# 开发环境密钥 —— 生产环境请务必更换为一个随机值！
SECRET_KEY = 'django-insecure-#dev@qsort^2026$w!8h3kq2x7m0b9zc4v5n6p1s7u8t9y0e'

DEBUG = True

# 开发阶段放开所有 Host；生产环境请收紧为你的域名
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 第三方
    'corsheaders',
    # 本项目应用
    'experiment',
]

MIDDLEWARE = [
    # CORS 中间件要尽量放在最前面
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'qsort_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'qsort_backend.wsgi.application'
ASGI_APPLICATION = 'qsort_backend.asgi.application'

# 数据库：开发阶段使用 SQLite
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# 国际化：中文 + 中国时区
LANGUAGE_CODE = 'zh-hans'
TIME_ZONE = 'Asia/Shanghai'
USE_I18N = True
USE_TZ = True

# 静态文件
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==================== 登录相关（主试端） ====================
LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/login/'

# ==================== CORS 跨域配置 ====================
# 开发阶段：允许所有来源（包含 netlify.app 在内的任何部署域名都能请求）
CORS_ALLOW_ALL_ORIGINS = True

# 生产环境建议改为只放行你的 Netlify 站点（子域名通配）：
#   CORS_ALLOWED_ORIGIN_REGEXES = [r'^https://.*\.netlify\.app$']
#   CORS_ALLOW_ALL_ORIGINS = False

# 允许携带 Cookie 的跨域请求（如后续需要登录态）
CORS_ALLOW_CREDENTIALS = True

# 允许的请求方法（默认已含 GET/POST/OPTIONS 等，此处显式列出）
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
