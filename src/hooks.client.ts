import { beforeNavigate, afterNavigate } from '$app/navigation';
import { isNavigating } from '$lib/stores';

beforeNavigate(() => isNavigating.set(true));
afterNavigate(() => isNavigating.set(false));
