import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getProfile } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <>
      <Header name={profile.name} />
      <main id="main">{children}</main>
      <Footer profile={profile} />
    </>
  );
}
