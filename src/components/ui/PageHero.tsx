import type { CSSProperties, ReactNode } from 'react';
import Breadcrumb, { type BreadcrumbItem } from './Breadcrumb';

type Props = {
  title: ReactNode;
  highlight?: ReactNode;
  highlightOnNewLine?: boolean;
  description?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  breadcrumbPosition?: 'top' | 'bottom';
  children?: ReactNode;
  bottomSpace?: 'md' | 'lg' | 'xl';
  titleClassName?: string;
};

const BOTTOM = { md: 'pb-20 lg:pb-24', lg: 'pb-24 lg:pb-28', xl: 'pb-40 lg:pb-52' };

export default function PageHero({
  title,
  highlight,
  highlightOnNewLine = false,
  description,
  breadcrumb,
  breadcrumbPosition = 'top',
  children,
  bottomSpace = 'md',
  titleClassName = 'max-w-3xl text-[34px] sm:text-5xl',
}: Props) {
  const crumbs = breadcrumb && <Breadcrumb items={breadcrumb} />;

  return (
    <section className={`relative overflow-hidden bg-secondary ${BOTTOM[bottomSpace]}`}>
      <div className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[160px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-rose-500/20 blur-[160px]" />
      <div
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container-x relative z-10 pt-44 text-center lg:pt-48">
        <div data-reveal>
          {breadcrumbPosition === 'top' && crumbs}

          <h1
            className={`mx-auto font-bold leading-[1.3] text-white sm:leading-[1.3] ${breadcrumbPosition === 'top' && crumbs ? 'mt-6' : ''} ${titleClassName}`}
          >
            {title}
            {highlight && (
              <>
                {highlightOnNewLine ? null : ' '}
                <span
                  className={`bg-gradient-to-r from-primary via-violet-400 to-pink-500 bg-clip-text text-transparent ${
                    highlightOnNewLine ? 'block pb-1' : ''
                  }`}
                >
                  {highlight}
                </span>
              </>
            )}
          </h1>

          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">{description}</p>
          )}

          {breadcrumbPosition === 'bottom' && crumbs && <div className="mt-8">{crumbs}</div>}
        </div>

        {children && (
          <div data-reveal style={{ '--reveal-delay': '120ms' } as CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}