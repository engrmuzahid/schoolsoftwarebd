/**
 * খালি / error / "কিছু পাওয়া যায়নি" অবস্থার বক্স — সব module-এ একই রকম
 *   <StateBox icon={<FileSearch />} title="কোনো লেখা পাওয়া যায়নি" text="…" action={<Link …/>} />
 *   <StateBox tone="error" … />
 */
import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: string;
  text?: ReactNode;
  action?: ReactNode;
  tone?: 'default' | 'error';
  className?: string;
};

export default function StateBox({ icon, title, text, action, tone = 'default', className = '' }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={`mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center ${className}`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-2xl [&>svg]:h-8 [&>svg]:w-8 ${
          tone === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </span>
      <h2 className="mt-5 text-xl font-bold text-secondary">{title}</h2>
      {text && <p className="mt-2 max-w-md text-[15px] leading-7 text-body">{text}</p>}
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
