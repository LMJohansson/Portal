/**
 * Module Federation REQUIRES a dynamic import here so that all shared
 * modules are initialized before the application boots.  The actual app
 * entry is in bootstrap.tsx.
 */
import('./bootstrap')
