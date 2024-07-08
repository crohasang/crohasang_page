'use client';

import { useState } from 'react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';

const menuItems = [
  { label: 'Introduce', link: '#' },
  { label: 'Projects', link: '#' },
  { label: 'Writing', link: '#' },
  { label: 'Preferences', link: '#' },
  { label: 'Contact', link: '#' },
];

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  return (
    <header className="p-4">
      <div className="flex justify-end space-x-4">
        <button
          className="px-2 py-2 rounded-lg text-black hover:text-gray-500 md:hidden"
          onClick={handleDrawerToggle}
        >
          Menu
        </button>
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="px-2 py-2 rounded-lg text-black hover:text-gray-500 hidden md:block"
          >
            {item.label}
          </button>
        ))}
        <Drawer
          open={isDrawerOpen}
          onClose={handleDrawerToggle}
          direction="right"
        >
          <DrawerContent>
            <a href="#">Introduce</a>
            <a href="#">Projects</a>
            <a href="#">Writing</a>
            <a href="#">Preferences</a>
            <a href="#">Contact</a>
            <DrawerClose onClick={handleDrawerToggle}>Close</DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
};

export default Header;
