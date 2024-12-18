import { FC, ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return <div className="bg-[url('/img/bg-marbre.png')] p-8">{children}</div>;
};

export default AuthLayout;