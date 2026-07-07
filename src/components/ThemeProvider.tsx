'use client';

import { useEffect, ReactNode } from 'react';
import { useQSortStore } from '@/store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const isDarkMode = useQSortStore((state) => state.isDarkMode);

  useEffect(() => {
    // 检查系统偏好和存储设置
    const storedDarkMode = localStorage.getItem('q-sort-storage');
    let shouldBeDark = isDarkMode;

    if (storedDarkMode) {
      try {
        const parsed = JSON.parse(storedDarkMode);
        if (parsed.state?.isDarkMode !== undefined) {
          shouldBeDark = parsed.state.isDarkMode;
        }
      } catch (e) {
        // 解析失败，使用系统偏好
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } else {
      // 没有存储，使用系统偏好
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}