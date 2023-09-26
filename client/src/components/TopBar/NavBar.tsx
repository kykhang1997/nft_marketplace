'use client';
import classNames from 'classnames';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const NavBar = () => {
	return (
		<nav className="absolute bottom-1/2 right-1/2 flex translate-y-1/2 translate-x-1/2 transform justify-center">
			<NavBarItem href="/">Home</NavBarItem>
			<NavBarItem href="/owned">Owned</NavBarItem>
			<NavBarItem href="/create">Create</NavBarItem>
		</nav>
	);
};

type NavbarItemProps = {
	href: string;
	children: ReactNode;
};

const NavBarItem = (props: NavbarItemProps) => {
	const { href, children } = props;
	const activeRoute = usePathname()?.split('/')[1];
	const isActive = href == `/${activeRoute}`;

	return (
		<Link href={href} legacyBehavior>
			<a
				className={classNames('rounded-lg px-4 py-2 font-semibold', {
					'bg-black text-white': isActive,
				})}
			>
				{children}
			</a>
		</Link>
	);
};

export default NavBar;
