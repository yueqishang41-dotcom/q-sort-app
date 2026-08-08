"""experiment 应用的 URL 路由：主试端页面 + 实验 API"""

from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

app_name = 'experiment'

urlpatterns = [
    # ---- 主试端认证 ----
    # GET  /login/   登录页；POST 提交登录
    path(
        'login/',
        auth_views.LoginView.as_view(template_name='experiment/login.html'),
        name='login',
    ),
    # POST /logout/  登出（Django 5 的 LogoutView 只接受 POST）
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    # GET  /dashboard/  主试端管理页面（需登录）
    path('dashboard/', views.dashboard, name='dashboard'),

    # ---- 实验 API ----
    # POST /api/submit/  提交一份测评结果
    path('api/submit/', views.submit_result, name='api_submit'),
    # GET  /api/results/ 查看所有结果
    path('api/results/', views.list_results, name='api_results'),
    # GET  /api/export/  导出 CSV
    path('api/export/', views.export_csv, name='api_export'),
]
