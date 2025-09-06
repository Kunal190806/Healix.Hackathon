import * as React from 'react';
import Image from 'next/image';
import {cn} from '@/lib/utils';

interface LogoProps extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> {
  // Allow other Image props to be passed
}

function Logo({className, ...props}: LogoProps) {
  return (
    <Image
      src="/healix-logo.png"
      alt="Healix Logo"
      width={40}
      height={40}
      className={cn('w-10 h-10', className)} // Default size which can be overridden
      {...props}
    />
  );
}

export default Logo;
