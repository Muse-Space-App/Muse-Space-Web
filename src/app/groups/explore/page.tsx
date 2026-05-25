"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function GroupsExplore() {
  const [groups, setGroups] = useState([
    { id: 1, name: "Digital Pioneers", description: "A community for 3D and digital artists pushing boundaries.", members: 1204, isMember: false, iconUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=60" },
    { id: 2, name: "Abstract Visionaries", description: "Exploring the depths of non-representational art forms.", members: 856, isMember: false, iconUrl: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=150&auto=format&fit=crop&q=60" },
    { id: 3, name: "Pixel Perfect", description: "Retro aesthetics, pixel art, and low-res wonders.", members: 2100, isMember: false, iconUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=60" },
    { id: 4, name: "Concept Artists Hub", description: "World building, character design, and environment art.", members: 3450, isMember: true, icon: "brush" },
    { id: 5, name: "UI/UX Innovators", description: "Designing the future of interfaces and experiences.", members: 512, isMember: false, icon: "web" },
    { id: 6, name: "Animation Studios", description: "Bringing static art to life with motion.", members: 890, isMember: false, icon: "animation" },
    { id: 7, name: "Voxel Builders", description: "Creating intricate worlds block by block.", members: 154, isMember: false, icon: "view_in_ar" },
    { id: 8, name: "Generative Art", description: "Code and algorithms meets artistic expression.", members: 2200, isMember: false, icon: "memory" }
  ]);

  const handleJoin = (id: number) => {
    setGroups(groups.map(g => {
      if (g.id === id) {
        return { ...g, isMember: true, members: g.members + 1 };
      }
      return g;
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2 font-['Space_Grotesk']">Explore Groups</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Find communities that share your creative passion.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 overflow-hidden">
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">{group.icon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg truncate">{group.name}</h3>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span>
                  {group.members.toLocaleString()} Members
                </div>
              </div>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm flex-1">{group.description}</p>

            <div className="mt-auto">
              {group.isMember ? (
                <Link href={`/groups/${group.id}`}
                  className="w-full py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/30 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/50"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span> View Workspace
                </Link>
              ) : (
                <button
                  onClick={() => handleJoin(group.id)}
                  className="w-full py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  <span className="material-symbols-outlined text-[18px]">group_add</span> Join Group
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


