"""qsort_backend URL Configuration"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # 主试端页面（/login/ /dashboard/）与实验 API（/api/...）均由 experiment.urls 提供
    path('', include('experiment.urls')),
]
