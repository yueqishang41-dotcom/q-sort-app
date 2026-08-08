"""Q-Sort 实验 API 视图"""

import csv
import json
from datetime import datetime, timezone as dt_timezone

from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import QSortResult

VALID_CONDITIONS = {'control', 'experimental'}


def _parse_timestamp(value, default=None):
    """把前端传来的时间解析成 datetime。

    兼容三种格式：
    - 毫秒时间戳（JS Date.now()，如 1786000000000）
    - 秒时间戳（如 1786000000）
    - ISO 字符串（如 "2026-08-05T12:00:00Z"）
    """
    if value is None:
        return default
    if isinstance(value, (int, float)):
        # 大于 1e12 视为毫秒时间戳
        if value > 1e12:
            value = value / 1000
        return timezone.datetime.fromtimestamp(value, tz=dt_timezone.utc)
    if isinstance(value, str):
        try:
            return timezone.datetime.fromisoformat(value.replace('Z', '+00:00'))
        except ValueError:
            return default
    return default


@csrf_exempt  # 纯 API 接口，前端不带 CSRF token，跳过 CSRF 校验
@require_http_methods(['POST'])
def submit_result(request):
    """POST /api/submit/

    接收前端提交的 JSON 数据并保存，返回生成/成功信息。
    请求体示例：
    {
        "subject_name": "张三",
        "age": 22,
        "gender": "female",
        "condition": "experimental",
        "sort_data": {"card-001": 4, "card-002": -3, "...": 0},
        "duration_seconds": 480,
        "completed_at": 1786000000000
    }
    """
    # 1. 解析请求体
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {'success': False, 'error': '请求体不是合法的 JSON'}, status=400
        )

    if not isinstance(payload, dict):
        return JsonResponse(
            {'success': False, 'error': 'JSON 数据必须是一个对象'}, status=400
        )

    # 2. 校验实验条件
    condition = payload.get('condition', '')
    if condition not in VALID_CONDITIONS:
        return JsonResponse(
            {'success': False, 'error': 'condition 必须是 control 或 experimental'},
            status=400,
        )

    # 3. 校验排序结果
    sort_data = payload.get('sort_data')
    if not isinstance(sort_data, dict):
        return JsonResponse(
            {'success': False, 'error': 'sort_data 必须是一个对象（cardId -> 档位分数）'},
            status=400,
        )

    # 4. 宽容地处理可空字段
    def _to_int(value):
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    duration = _to_int(payload.get('duration_seconds'))
    age = _to_int(payload.get('age'))

    # 5. 保存到数据库
    try:
        result = QSortResult.objects.create(
            subject_name=(payload.get('subject_name') or '').strip() or '匿名被试',
            age=age,
            gender=payload.get('gender') or '',
            condition=condition,
            sort_data=sort_data,
            duration_seconds=duration,
            completed_at=_parse_timestamp(payload.get('completed_at'), default=timezone.now()),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        )
    except Exception as exc:
        return JsonResponse({'success': False, 'error': f'保存失败：{exc}'}, status=500)

    return JsonResponse(
        {
            'success': True,
            'message': '提交成功',
            'subject_id': result.subject_id,
            'created_at': result.created_at.isoformat(),
        },
        status=201,
    )


@require_http_methods(['GET'])
def list_results(request):
    """GET /api/results/

    返回所有被试的结果数据（JSON），供主试端查看。
    """
    results = QSortResult.objects.all()
    data = [
        {
            'subject_id': r.subject_id,
            'subject_name': r.subject_name,
            'age': r.age,
            'gender': r.gender,
            'condition': r.condition,
            'sort_data': r.sort_data,
            'duration_seconds': r.duration_seconds,
            'completed_at': r.completed_at.isoformat() if r.completed_at else None,
            'created_at': r.created_at.isoformat() if r.created_at else None,
            'user_agent': r.user_agent,
        }
        for r in results
    ]
    return JsonResponse({'success': True, 'count': len(data), 'results': data})


@require_http_methods(['GET'])
def export_csv(request):
    """GET /api/export/

    导出所有数据为 CSV 文件下载（带 BOM，Excel 打开中文不乱码）。
    """
    results = QSortResult.objects.all()

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="qsort_results.csv"'
    # 添加 UTF-8 BOM，保证用 Excel 打开时中文正常显示
    response.write('﻿')

    writer = csv.writer(response)
    writer.writerow([
        'subject_id', 'subject_name', 'age', 'gender', 'condition',
        'duration_seconds', 'completed_at', 'created_at', 'user_agent',
        'sort_data',
    ])
    for r in results:
        writer.writerow([
            r.subject_id,
            r.subject_name,
            r.age,
            r.gender,
            r.condition,
            r.duration_seconds,
            r.completed_at.isoformat() if r.completed_at else '',
            r.created_at.isoformat() if r.created_at else '',
            r.user_agent,
            json.dumps(r.sort_data, ensure_ascii=False),
        ])
    return response


# ============ 主试端管理页面 ============


def _format_seconds(seconds):
    """把秒数格式化为「X 分 Y 秒」，便于在统计卡片上阅读"""
    if not seconds:
        return '—'
    seconds = int(seconds)
    minutes, secs = divmod(seconds, 60)
    if minutes == 0:
        return f'{secs} 秒'
    return f'{minutes} 分 {secs} 秒'


@login_required
def dashboard(request):
    """GET /dashboard/  主试端管理页面（需要登录）

    统计卡片 + 数据表格（可按实验条件筛选）+ 平均用时柱状图。
    """
    # ---- 顶部统计（全局数据，不受筛选影响）----
    total = QSortResult.objects.count()
    exp_count = QSortResult.objects.filter(condition='experimental').count()
    ctrl_count = QSortResult.objects.filter(condition='control').count()

    avg_agg = QSortResult.objects.aggregate(avg=Avg('duration_seconds'))['avg']
    avg_duration = round(avg_agg) if avg_agg else 0

    # ---- 柱状图数据：实验组 vs 对照组平均完成时间（秒）----
    exp_agg = QSortResult.objects.filter(condition='experimental').aggregate(
        avg=Avg('duration_seconds'))['avg']
    ctrl_agg = QSortResult.objects.filter(condition='control').aggregate(
        avg=Avg('duration_seconds'))['avg']
    exp_avg = round(exp_agg) if exp_agg else 0
    ctrl_avg = round(ctrl_agg) if ctrl_agg else 0

    # ---- 表格数据（支持 ?condition=experimental|control 筛选）----
    condition = request.GET.get('condition', '')
    if condition not in VALID_CONDITIONS:
        condition = ''

    qs = QSortResult.objects.all()
    if condition:
        qs = qs.filter(condition=condition)

    subjects = [
        {
            'subject_id': r.subject_id,
            'subject_name': r.subject_name,
            'gender': r.get_gender_display() or '—',
            'age': r.age if r.age is not None else '—',
            'condition': r.get_condition_display(),
            'condition_key': r.condition,
            'duration': r.duration_seconds if r.duration_seconds is not None else '—',
            'created_at': r.created_at,
            'completed_at': r.completed_at,
            'user_agent': r.user_agent,
            'sort_data': r.sort_data,
        }
        for r in qs
    ]

    # JS 侧使用的副本：把 datetime 转成 ISO 字符串，交给 json_script 输出
    subjects_js = [
        {
            **s,
            'created_at': s['created_at'].isoformat() if s['created_at'] else None,
            'completed_at': s['completed_at'].isoformat() if s['completed_at'] else None,
        }
        for s in subjects
    ]

    context = {
        'total': total,
        'exp_count': exp_count,
        'ctrl_count': ctrl_count,
        'avg_duration_text': _format_seconds(avg_duration),
        'exp_avg': exp_avg,
        'ctrl_avg': ctrl_avg,
        'subjects': subjects,
        'subjects_js': subjects_js,
        'condition_filter': condition,
    }
    return render(request, 'experiment/dashboard.html', context)
