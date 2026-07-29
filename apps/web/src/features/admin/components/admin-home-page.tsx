import { AdminDesktopHomeRedirect } from '@/features/admin/components/admin-desktop-home-redirect';

/**
 * Desktop `/admin` redirects to companies; mobile shows AdminMobileHub instead.
 */
export const AdminHomePage = () => {
  return (
    <>
      <AdminDesktopHomeRedirect />
      <div className="hidden md:block" aria-hidden />
    </>
  );
};
