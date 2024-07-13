'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Drawer, DrawerClose, DrawerContent } from '../ui/drawer';

import logoImage from '../../../public/image/logo/crohasang_logo.png';

const menuItems = [
  { label: 'Introduce', link: '/introduce' },
  { label: 'Projects', link: '/projects' },
  { label: 'Preferences', link: '/preferences' },
];

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  return (
    <header className="p-4">
      <div className="flex justify-between items-center">
        <Link href="/">
          <Image
            src={logoImage}
            alt="logo"
            width={50}
            height={50}
            className="cursor-pointer"
          />
        </Link>
        <div className="flex justify-end space-x-4">
          <button
            className="px-2 py-2 rounded-lg text-black hover:text-gray-500 md:hidden"
            onClick={handleDrawerToggle}
          >
            Menu
          </button>
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.link}
              className="px-2 py-2 rounded-lg text-black hover:text-gray-500 hidden md:block"
            >
              {item.label}
            </a>
          ))}
          <Drawer
            open={isDrawerOpen}
            onClose={handleDrawerToggle}
            direction="right"
          >
            <DrawerContent>
              <a href="/introduce">Introduce</a>
              <a href="/projects">Projects</a>
              <a href="/preferences">Preferences</a>
              <DrawerClose onClick={handleDrawerToggle}>Close</DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
};

export default Header;
