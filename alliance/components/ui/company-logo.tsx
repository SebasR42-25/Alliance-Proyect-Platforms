import Image from 'next/image';

const LOGO_DEV_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY ?? 'pk_LjNjFs4cQeKpU2apVf1fSA';

interface CompanyLogoProps {
  name: string;
  domain?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}

export default function CompanyLogo({ name, domain, logoUrl, size = 48, className = '' }: CompanyLogoProps) {
  const initial = name.charAt(0).toUpperCase();

  if (domain) {
    return (
      <Image
        src={`https://img.logo.dev/${domain}?token=${LOGO_DEV_KEY}&size=128`}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        unoptimized
      />
    );
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        style={{ width: size, height: size }}
        className={`object-contain ${className}`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`flex items-center justify-center text-gray-400 font-black text-xl ${className}`}
    >
      {initial}
    </span>
  );
}
