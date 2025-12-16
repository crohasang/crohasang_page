'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const crohasangLogoUrl = 'https://d1faf0kcj4x8qr.cloudfront.net/logo/crohasang_logo.png';

interface HeaderProps {
  hideOnHome?: boolean;
}

export default function Header({ hideOnHome = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 홈페이지에서 헤더 숨기기
  if (hideOnHome && pathname === '/') {
    return null;
  }

  return (
    <header className="fixed bg-transparent top-0 z-50 w-full">
      <div className="mx-auto px-4 py-4 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src={crohasangLogoUrl}
            alt="Crohasang Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* 햄버거 메뉴 */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 [&>button]:hidden">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <nav className="flex flex-col gap-4 mt-8">
              <Link 
                href="/" 
                onClick={() => setIsOpen(false)}
                className="text-lg font-semibold hover:text-blue-600 transition-colors"
              >
                HOME
              </Link>
              <Link 
                href="/post" 
                onClick={() => setIsOpen(false)}
                className="text-lg font-semibold hover:text-blue-600 transition-colors"
              >
                POST
              </Link>
              <Link 
                href="/fediverse" 
                onClick={() => setIsOpen(false)}
                className="text-lg font-semibold hover:text-blue-600 transition-colors"
              >
                FEDIVERSE
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}