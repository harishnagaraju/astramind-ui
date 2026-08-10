import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';

type IconButtonProps = PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    label: string;
  }
>;

export function IconButton({ label, ...props }: IconButtonProps): React.ReactElement {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label} {...props} />
  );
}
