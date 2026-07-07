/**
 * Playwright E2E 测试
 * 测试关键流程：开始 -> 预分堆 -> 强制分布 -> 提交 -> 结果页 -> 下载海报
 */

import { test, expect } from '@playwright/test';

test.describe('Q-sort 完整流程', () => {
  test('应该完成完整测评流程', async ({ page }) => {
    // 1. 进入首页
    await page.goto('/');

    // 等待页面加载
    await expect(page.locator('h1')).toContainText('边界感与讨好');

    // 2. 勾选免责声明
    await page.click('label:has-text("我已阅读并理解上述说明")');

    // 3. 点击开始测评
    await page.click('button:has-text("开始测评")');

    // 等待跳转到预分堆页面
    await expect(page).toHaveURL(/.*presort/);
    await expect(page.locator('text=待分类卡片')).toBeVisible();

    // 4. 预分堆阶段 - 快速分类所有卡片到 A 堆
    // 获取所有未分类卡片并拖拽到 A 堆
    const unsortedCards = page.locator('.q-card').first();
    if (await unsortedCards.count() > 0) {
      // 使用自动分类（如果有这个功能）或手动拖拽
      // 这里简化测试，直接点击"全部放入A"（如果有）
      // 或者模拟拖拽操作

      // 由于实际拖拽比较复杂，这里假设用户快速分类完成
      // 实际测试中需要更详细的拖拽逻辑
    }

    // 检查进度
    await expect(page.locator('text=已分类')).toBeVisible();

    // 5. 完成预分堆并进入强制分布
    // 等待所有卡片分类完成
    // 点击"进入精细排序"
    const nextButton = page.locator('button:has-text("进入精细排序")');
    // 如果按钮可用则点击
    if (await nextButton.isEnabled()) {
      await nextButton.click();
    }

    // 6. 强制分布阶段
    await expect(page).toHaveURL(/.*sorting/);

    // 使用自动填充完成排序
    await page.click('button:has-text("自动填充")');

    // 确认自动填充
    await page.click('button:has-text("确认填充")');

    // 等待分布完成
    await expect(page.locator('text=分布正确')).toBeVisible();

    // 7. 提交结果
    await page.click('button:has-text("查看结果")');

    // 填写标签（可选）
    const labelInput = page.locator('input[placeholder*="第一次测评"]');
    if (await labelInput.isVisible()) {
      await labelInput.fill('E2E测试');
    }

    await page.click('button:has-text("提交结果")');

    // 8. 结果页
    await expect(page).toHaveURL(/.*result/);
    await expect(page.locator('text=测评结果')).toBeVisible();

    // 检查核心发现
    await expect(page.locator('.bg-primary-50')).toBeVisible();

    // 9. 下载海报
    const downloadButton = page.locator('button:has-text("下载海报")');
    await expect(downloadButton).toBeVisible();

    // 点击下载（可能触发下载）
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;

    // 验证下载的文件
    expect(download.suggestedFilename()).toContain('.png');

    // 10. 复制小红书文案
    await page.click('button:has-text("复制文案")');
    await expect(page.locator('text=已复制')).toBeVisible();
  });

  test('应该处理刷新后恢复进度', async ({ page, context }) => {
    // 开始测评流程
    await page.goto('/');

    // 勾选免责声明
    await page.click('label:has-text("我已阅读并理解")');

    // 开始测评
    await page.click('button:has-text("开始测评")');

    // 进入预分堆
    await expect(page).toHaveURL(/.*presort/);

    // 模拟一些操作
    await page.waitForTimeout(1000);

    // 刷新页面
    await page.reload();

    // 检查是否恢复到正确的状态
    // 数据应该从 localStorage 恢复
    await expect(page.locator('text=已分类')).toBeVisible();
  });

  test('应该阻止非法状态提交', async ({ page }) => {
    // 开始测评流程
    await page.goto('/');

    // 勾选免责声明并开始
    await page.click('label:has-text("我已阅读并理解")');
    await page.click('button:has-text("开始测评")');

    // 快速跳过预分堆（不完全分类）
    await expect(page).toHaveURL(/.*presort/);

    // 尝试点击"进入精细排序"（应该在卡片未全分类时被禁用）
    const nextButton = page.locator('button:has-text("进入精细排序")');

    // 如果按钮被禁用，应该显示剩余卡片数
    const remainingText = page.locator('text=还有');
    if (await remainingText.isVisible()) {
      await expect(remainingText).toContainText('张卡片待分类');
    }

    // 进入强制分布阶段（假设通过了预分堆）
    await page.goto('/sorting');

    // 不使用自动填充，尝试直接提交
    const submitButton = page.locator('button:has-text("查看结果")');

    // 应该显示"还需放置 X 张"
    await expect(page.locator('text=还需放置')).toBeVisible();

    // 按钮应该被禁用
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('移动端体验', () => {
  test('移动端应该正常工作', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 812 });

    await page.goto('/');

    // 检查页面适配
    await expect(page.locator('h1')).toBeVisible();

    // 勾选免责声明
    await page.click('label:has-text("我已阅读")');

    // 开始测评
    await page.click('button:has-text("开始测评")');

    // 进入预分堆
    await expect(page).toHaveURL(/.*presort/);

    // 检查卡片可以拖拽
    const firstCard = page.locator('.q-card').first();
    await expect(firstCard).toBeVisible();
  });
});

test.describe('历史记录功能', () => {
  test('应该保存和查看历史记录', async ({ page }) => {
    // 先完成一次测评（使用之前的流程）
    await page.goto('/');

    // 设置 localStorage 模拟一个已完成的会话
    await page.evaluate(() => {
      const mockSession = {
        sessionId: 'test-history-session',
        themeId: 'boundary-pleasing',
        startTime: Date.now() - 600000,
        endTime: Date.now() - 300000,
        duration: 300,
        deviceInfo: {
          type: 'desktop',
          userAgent: 'test',
          screenWidth: 1920,
          screenHeight: 1080,
          language: 'zh-CN',
        },
        finalPlacement: {},
        interactions: {
          dragCount: 50,
          swapCount: 5,
          undoCount: 3,
          redoCount: 1,
          autoFillUsed: true,
          autoFillCount: 1,
          sessionResumed: false,
        },
        history: [],
        isComplete: true,
        completedAt: Date.now() - 300000,
        anonymousLabel: '测试记录',
      };

      localStorage.setItem('q-sort-storage', JSON.stringify({
        state: {
          allSessions: [mockSession],
        },
      }));
    });

    // 进入历史记录页面
    await page.goto('/history');

    // 检查历史记录显示
    await expect(page.locator('text=测试记录')).toBeVisible();
  });
});