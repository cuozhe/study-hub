import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StudyHub - 智能学习助手',
  description: '整合费曼技巧、艾宾浩斯复习法、番茄工作法、康奈尔笔记法、西蒙学习法的学习助手',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
