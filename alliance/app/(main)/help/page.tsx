import Link from 'next/link';

const HELP_CARDS = [
  { label: 'Find Jobs',   href: '/jobs'        },
  { label: 'Companies',   href: '/companies'   },
  { label: 'Networking',  href: '/networking'  },
  { label: 'Chat',        href: '/chat'        },
  { label: 'Reels',       href: '/reels'       },
  { label: 'Profile',     href: '/profile'     },
  { label: 'Posts',       href: '/'            },
  { label: 'Help',        href: '/help'        },
];

export default function HelpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-orange flex flex-col items-center justify-center px-6 py-16">
      {/* Title */}
      <h1 className="text-6xl font-black text-gray-900 mb-3 text-center">
        Help Center
      </h1>
      <p className="text-sm text-gray-700 mb-12 text-center max-w-md">
        Here you Can Found Our Principal Sections Designed Just For You
      </p>

      {/* 4 × 2 grid of yellow cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 w-full max-w-3xl">
        {HELP_CARDS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-brand-yellow text-gray-900 font-bold text-sm rounded-2xl flex items-center justify-center py-8 px-4 text-center hover:brightness-95 hover:shadow-lg transition-all"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
