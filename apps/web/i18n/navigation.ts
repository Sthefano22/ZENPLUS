import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Link, useRouter y usePathname que conservan el idioma activo al navegar
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
