import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type AuthFormSwitchProps = {
  prompt: string;
  href: '/auth/login' | '/auth/register';
  linkLabel: string;
};

/**
 * Footer switch under auth submit — accent rule + prompt + link (no line-mask hack).
 */
export const AuthFormSwitch = ({ prompt, href, linkLabel }: AuthFormSwitchProps) => {
  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <div className="h-px w-10 bg-accent/55" aria-hidden />
      <p className="text-center text-sm leading-relaxed text-ink-secondary">
        <span>{prompt}</span>{' '}
        <Link
          href={href}
          className={cn(
            'font-semibold text-brand underline-offset-[3px]',
            'transition-[color,text-decoration-color] duration-[var(--duration-fast)]',
            'hover:text-brand-hover hover:underline',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          )}
        >
          {linkLabel}
        </Link>
      </p>
    </div>
  );
};
