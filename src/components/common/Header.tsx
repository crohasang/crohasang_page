'use client';

import { useState } from 'react';

import { Drawer, DrawerClose, DrawerContent } from '../ui/drawer';

const menuItems = [
  { label: 'Introduce', link: '/introduce' },
  { label: 'Projects', link: '/projects' },
  { label: 'Writing', link: '/writing' },
  { label: 'Preferences', link: '/preferences' },
  { label: 'Contact', link: '/contact' },
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
            <a href="/writing">Writing</a>
            <a href="/preferences">Preferences</a>
            <a href="/contact">Contact</a>
            <DrawerClose onClick={handleDrawerToggle}>Close</DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
};

export default Header;
