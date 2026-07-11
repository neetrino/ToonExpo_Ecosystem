import { DEFAULT_LOCALE } from '@toonexpo/shared';
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
