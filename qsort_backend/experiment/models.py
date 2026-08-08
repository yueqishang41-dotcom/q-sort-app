"""Q-Sort 实验数据模型"""

from django.db import models
from django.db import transaction
from django.utils import timezone


class SubjectSequence(models.Model):
    """被试编号计数器（单行表）。

    用于生成单调递增的被试编号，保证即使记录被删除也不会复用编号——
    实验中被试编号必须唯一且不重复使用。
    """

    last_number = models.PositiveIntegerField('当前最大编号', default=0)

    class Meta:
        verbose_name = '被试编号计数器'
        verbose_name_plural = '被试编号计数器'


class QSortResult(models.Model):
    """一条被试的 Q-Sort 测评结果"""

    CONDITION_CHOICES = [
        ('control', '对照组'),
        ('experimental', '实验组'),
    ]

    GENDER_CHOICES = [
        ('male', '男'),
        ('female', '女'),
        ('other', '其他'),
        ('prefer_not_to_say', '不愿透露'),
    ]

    # 被试编号：自动生成，格式如 S001、S002
    subject_id = models.CharField(
        '被试编号', max_length=20, unique=True, editable=False
    )
    subject_name = models.CharField('被试姓名', max_length=100)
    age = models.IntegerField('年龄', null=True, blank=True)
    gender = models.CharField(
        '性别', max_length=20, choices=GENDER_CHOICES, blank=True
    )
    condition = models.CharField('实验条件', max_length=20, choices=CONDITION_CHOICES)
    # Q 分类最终结果：{ "card-001": 4, "card-002": -3, ... }，每张卡片对应的档位分数
    sort_data = models.JSONField('排序结果', default=dict)
    duration_seconds = models.IntegerField('用时（秒）', null=True, blank=True)
    # 完成排序的时刻（区别于提交时间 created_at）
    completed_at = models.DateTimeField('完成时间', null=True, blank=True)
    created_at = models.DateTimeField('提交时间', auto_now_add=True)
    user_agent = models.CharField('浏览器信息', max_length=500, blank=True, default='')

    class Meta:
        verbose_name = 'Q-Sort 结果'
        verbose_name_plural = 'Q-Sort 结果'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.subject_id} | {self.subject_name or "匿名被试"}'

    @classmethod
    def generate_subject_id(cls):
        """基于独立计数器生成下一个被试编号：S001、S002、…（删除记录也不会复用）"""
        with transaction.atomic():
            seq, _ = SubjectSequence.objects.select_for_update().get_or_create(pk=1)
            seq.last_number += 1
            seq.save(update_fields=['last_number'])
            return f'S{seq.last_number:03d}'

    def save(self, *args, **kwargs):
        if not self.subject_id:
            self.subject_id = self.generate_subject_id()
        if not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)
