const TopNavBar = () => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 lg:px-10 py-3 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center gap-8">
        <label className="flex flex-col min-w-40 h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-slate-600 flex border-none bg-slate-100 items-center justify-center pl-4 rounded-l-xl border-r-0">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 focus:outline-0 focus:ring-0 border-none bg-slate-100 focus:border-none h-full placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder="Search..."
              defaultValue=""
            />
          </div>
        </label>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 w-10 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHZwNnLvTNo4dgOWNi958tH9rGfiYDy1F_VwxrCMELhBoeLHHBeXdPYzHrkjbJzsN0b5ku8aampuarIt48Iz29zWjEqAoE5euu1tbM8Km6BfstHgjD1JUcWUAQtX0TsBp0FvHvkk50K2-8fovfpl4m_h58isHwVHufPuL71l3CCaW_CwUU4HiPP2GuFl_SFEaO-b-4PnqJyxqkf01wU2YyH7D_x0GgF_QP4CePjyJZI5j_FvKE1BBHYmE9AcYbg8LQqNNh3obOb4k')",
          }}
          role="img"
          aria-label="John Doe's profile picture"
        ></div>
      </div>
    </header>
  );
};

export default TopNavBar;
