import {
    Link as ReactRouterLink,
    type LinkProps as ReactRouterLinkProps,
    NavLink as ReactRouterNavLink,
    type NavLinkProps as ReactRouterNavLinkProps
} from "react-router"

interface LinkProps extends ReactRouterLinkProps {
}

interface NavLinkProps extends ReactRouterNavLinkProps {
}

export const Link = ({prefetch = "intent", viewTransition = true, ...props}: LinkProps) => {
    return <ReactRouterLink prefetch={prefetch} viewTransition={viewTransition} {...props} />
}

export const NavLink = ({prefetch = "intent", viewTransition = true, ...props}: NavLinkProps) => {
    return <ReactRouterNavLink prefetch={prefetch} viewTransition={viewTransition} {...props} />
}