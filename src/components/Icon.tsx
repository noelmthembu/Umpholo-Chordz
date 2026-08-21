import type { SVGProps } from 'react';

export type IconName =
  | 'library'
  | 'keys'
  | 'spark'
  | 'download'
  | 'play'
  | 'stop'
  | 'search'
  | 'close'
  | 'add'
  | 'arrowRight';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  title?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  library: (
    <>
      <path d="M5 4.75h10.5a2 2 0 0 1 2 2v11.5H7a2 2 0 0 1-2-2V4.75Z" />
      <path d="M5 7.75H3.75a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 1.5 1.5H7" />
      <path d="M8.5 8.25h5.5M8.5 11.5h5.5M8.5 14.75h3" />
    </>
  ),
  keys: (
    <>
      <path d="M3 4.75h18v14.5H3z" />
      <path d="M6 4.75v9m3 0v-9m3 0v9m3 0v-9m3 0v9" />
      <path d="M4.5 18.25h15" />
    </>
  ),
  spark: (
    <path d="m12 2 1.55 6.45L20 10l-6.45 1.55L12 18l-1.55-6.45L4 10l6.45-1.55L12 2Z" />
  ),
  download: (
    <>
      <path d="M12 3v11.5" />
      <path d="m7.5 10 4.5 4.5 4.5-4.5" />
      <path d="M4 19.5h16" />
    </>
  ),
  play: <path d="m8.5 5.5 9 6.5-9 6.5v-13Z" fill="currentColor" stroke="none" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" stroke="none" />,
  search: (
    <>
      <circle cx="10.75" cy="10.75" r="5.75" />
      <path d="m15.1 15.1 4.4 4.4" />
    </>
  ),
  close: <path d="m6.5 6.5 11 11m0-11-11 11" />,
  add: <path d="M12 5v14M5 12h14" />,
  arrowRight: <path d="M4 12h15m-5.5-5.5L19 12l-5.5 5.5" />,
};

export function Icon({ name, title, className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
