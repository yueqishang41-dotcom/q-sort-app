from django.contrib import admin

from .models import QSortResult


@admin.register(QSortResult)
class QSortResultAdmin(admin.ModelAdmin):
    # 列表页显示的列：被试编号、姓名、年龄、性别、实验条件、用时、完成时间、提交时间
    list_display = (
        'subject_id',
        'subject_name',
        'age',
        'gender',
        'condition',
        'duration_display',
        'completed_at',
        'created_at',
    )
    list_filter = ('condition', 'gender', 'created_at')
    search_fields = ('subject_id', 'subject_name')
    # 自动生成的编号和提交时间不允许在编辑页手工修改
    readonly_fields = ('subject_id', 'created_at')
    ordering = ('-created_at',)
    list_per_page = 50

    @admin.display(description='用时')
    def duration_display(self, obj):
        if obj.duration_seconds is None:
            return '-'
        return f'{obj.duration_seconds} 秒'
