const menuItems = [
  { label: 'Introduce', link: '#' },
  { label: 'Projects', link: '#' },
  { label: 'Writing', link: '#' },
  { label: 'Preferences', link: '#' },
  { label: 'Contact', link: '#' },
];

const Header = () => {
  return (
    <header className="p-4">
      <div className="flex justify-end space-x-4">
        <button className="px-2 py-2 rounded-lg text-black hover:text-gray-500 md:hidden">
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
      </div>
    </header>
  );
};

export default Header;
