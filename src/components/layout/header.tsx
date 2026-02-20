import { Suspense } from "react";
import { Paytone_One } from "next/font/google";
import Link from "next/link";

import { Loader } from "~/components/ui/loader";
import { UserProfile } from "~/components/auth/user-profile";
import { HeaderActions } from "~/components/layout/header-content";

const paytoneOne = Paytone_One({ subsets: ["latin"], weight: ["400"] });

export const Header = () => {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
      <Link href="/" className={`${paytoneOne.className} text-3xl`}>
        Link Ku
      </Link>
      <div className="flex items-center gap-2">
        <HeaderActions />
        <Suspense fallback={<Loader size="xl" />}>
          <UserProfile />
        </Suspense>
      </div>
    </header>
  );
};
