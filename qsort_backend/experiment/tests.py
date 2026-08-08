"""experiment 应用的基础测试：模型编号生成 + API 提交/查询/导出 + 主试端页面"""

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import QSortResult


class QSortResultModelTests(TestCase):
    def test_subject_id_auto_generation(self):
        r1 = QSortResult.objects.create(
            subject_name='张三', condition='control', sort_data={'card-001': 4}
        )
        r2 = QSortResult.objects.create(
            subject_name='李四', condition='experimental', sort_data={'card-001': -4}
        )
        self.assertEqual(r1.subject_id, 'S001')
        self.assertEqual(r2.subject_id, 'S002')

    def test_subject_id_continues_after_delete(self):
        QSortResult.objects.create(subject_name='张三', condition='control')
        # 删除掉第一条，编号不应复用 S001
        QSortResult.objects.all().delete()
        r = QSortResult.objects.create(subject_name='王五', condition='control')
        self.assertEqual(r.subject_id, 'S002')


class SubmitApiTests(TestCase):
    def test_submit_valid(self):
        resp = self.client.post(
            reverse('experiment:api_submit'),
            data={
                'subject_name': '赵六',
                'age': 22,
                'gender': 'female',
                'condition': 'experimental',
                'sort_data': {'card-001': 4, 'card-002': -3, 'card-003': 0},
                'duration_seconds': 480,
            },
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['subject_id'], 'S001')
        # 数据库里确实保存了一条记录
        self.assertEqual(QSortResult.objects.count(), 1)
        # 毫秒时间戳 completed_at 应被正确解析保存
        saved = QSortResult.objects.first()
        self.assertIsNotNone(saved.completed_at)
        # 1786000000 (秒) 对应 UTC 2026-08-04 23:06:40
        self.assertEqual(saved.completed_at.year, 2026)

    def test_submit_with_millisecond_completed_at(self):
        """提交毫秒时间戳的 completed_at 不应报错"""
        resp = self.client.post(
            reverse('experiment:api_submit'),
            data={
                'subject_name': '时间戳测试',
                'condition': 'control',
                'sort_data': {'a': 1},
                'completed_at': 1786000000000,  # 毫秒
            },
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)

    def test_submit_invalid_condition(self):
        resp = self.client.post(
            reverse('experiment:api_submit'),
            data={'condition': 'bad', 'sort_data': {}},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_submit_invalid_json(self):
        resp = self.client.post(
            reverse('experiment:api_submit'),
            data='not json',
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_list_results(self):
        QSortResult.objects.create(
            subject_name='测试', condition='control', sort_data={'a': 1}
        )
        resp = self.client.get(reverse('experiment:api_results'))
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertTrue(body['success'])
        self.assertEqual(body['count'], 1)
        self.assertEqual(body['results'][0]['subject_name'], '测试')

    def test_export_csv(self):
        QSortResult.objects.create(
            subject_name='导出测试', condition='control', sort_data={'a': 1}
        )
        resp = self.client.get(reverse('experiment:api_export'))
        self.assertEqual(resp.status_code, 200)
        self.assertIn('qsort_results', resp['Content-Disposition'])
        self.assertIn('导出测试', resp.content.decode('utf-8-sig'))


class DashboardTests(TestCase):
    """主试端页面：登录保护 + 渲染 + 条件筛选"""

    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pw12345')
        QSortResult.objects.create(
            subject_name='被试甲', condition='experimental',
            sort_data={'card-001': 4, 'card-002': -4},
            duration_seconds=300,
        )
        QSortResult.objects.create(
            subject_name='被试乙', condition='control',
            sort_data={'card-003': 0},
            duration_seconds=600,
        )

    def test_dashboard_redirects_when_not_logged_in(self):
        resp = self.client.get('/dashboard/')
        self.assertEqual(resp.status_code, 302)
        self.assertIn('/login/', resp.url)

    def test_login_page_renders(self):
        resp = self.client.get('/login/')
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Q-Sort 主试端')

    def test_dashboard_renders_when_logged_in(self):
        self.assertTrue(self.client.login(username='admin', password='pw12345'))
        resp = self.client.get('/dashboard/')
        self.assertEqual(resp.status_code, 200)
        # 顶部统计
        self.assertContains(resp, '总参与人数')
        self.assertContains(resp, '实验组人数')
        self.assertContains(resp, '对照组人数')
        self.assertContains(resp, '平均完成时间')
        # 两个被试都渲染出来
        self.assertContains(resp, '被试甲')
        self.assertContains(resp, '被试乙')

    def test_dashboard_filter_by_condition(self):
        self.client.login(username='admin', password='pw12345')
        resp = self.client.get('/dashboard/?condition=experimental')
        self.assertContains(resp, '被试甲')
        self.assertNotContains(resp, '被试乙')
