import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat, cats, demos, servicesByCategory } from './catalog';
import { digest } from './sha256';
export type { Cat } from './catalog';
export type Route =
  | { page: 'welcome' | 'signin' | 'register' | 'home' | 'restore' }
  | { page: 'category'; cat: Cat }
  | {
      page: 'provider';
      cat: Cat;
      service: string;
      phase: 'loading' | 'ready' | 'error';
    };
export type PanelName = 'demo' | 'account' | 'provider' | null;
export type RestoreState =
  | ''
  | 'progress'
  | 'success'
  | 'expired'
  | 'unsupported'
  | 'missing'
  | 'offline';
export type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
  auth?: string;
};
type Data = {
  accounts: Record<string, { salt: string; hash: string }>;
  sessions: Record<string, string>;
  games: Record<string, unknown>;
  device: 'D1' | 'D2';
  user: string | null;
  guest: boolean;
};
type Outcome = 'success' | 'expired' | 'unsupported';
type Held = '' | 'loading' | 'empty' | 'error';
const fresh = (): Data => ({
  accounts: {},
  sessions: {},
  games: {},
  device: 'D1',
  user: null,
  guest: false,
});
const key = 'aiohub-pocket-v1';
function createStore(notify: () => void) {
  let ready = false,
    data = fresh(),
    route: Route = { page: 'welcome' },
    stack: Route[] = [],
    held: Held = '',
    offline = false,
    notice = '',
    sheetNotice = '',
    prefill = '',
    chosenDemo: 'a' | 'b' = 'a',
    outcome: Outcome = 'success',
    restoreState: RestoreState = '',
    panel: PanelName = null,
    demoCat: Cat = 'News';
  let timer: ReturnType<typeof setTimeout> | undefined,
    ticket = 0,
    writes = Promise.resolve();
  const update = () => notify();
  const setPanel = (name: PanelName) => {
    panel = name;
    sheetNotice = '';
  };
  const save = () => {
    const snapshot = JSON.stringify(data);
    writes = writes
      .then(() => AsyncStorage.setItem(key, snapshot))
      .catch(() => {});
  };
  const cancel = () => {
    clearTimeout(timer);
    ticket++;
    if (restoreState === 'progress') restoreState = '';
  };
  const serviceKey = (cat: Cat, service = cats[cat]) =>
    service === cats[cat] ? cat : cat + ':' + service;
  const restorable = (Object.keys(cats) as Cat[])
    .filter(c => c !== 'Game')
    .flatMap(cat =>
      servicesByCategory[cat].map(({ name }) => ({
        cat,
        service: name,
        key: serviceKey(cat, name),
      })),
    );
  const sessionKey = (cat: string, device = data.device) =>
    JSON.stringify([device, data.user, cat]);
  const session = (cat: string, device?: 'D1' | 'D2') =>
    data.sessions[sessionKey(cat, device)];
  const who = () =>
    Object.values(demos).find(d => d.email === data.user)?.name ||
    (data.user || 'Guest').split('@')[0] ||
    'Guest';
  const guard = () => {
    if (
      !data.user &&
      !data.guest &&
      !['welcome', 'signin', 'register'].includes(route.page)
    ) {
      route = { page: 'welcome' };
      stack = [];
    }
  };
  const navigate = (next: Route, replace = false) => {
    cancel();
    if (next.page === 'welcome' && data.guest) {
      data.guest = false;
      save();
    }
    if (!replace) stack.push(route);
    route = next;
    guard();
    update();
  };
  const back = () => {
    cancel();
    route = stack.pop() || {
      page: data.user || data.guest ? 'home' : 'welcome',
    };
    if (route.page === 'welcome' && data.guest) {
      data.guest = false;
      save();
    }
    guard();
    if (
      route.page === 'provider' &&
      route.phase === 'loading' &&
      held !== 'loading'
    )
      route = { ...route, phase: offline ? 'error' : 'ready' };
    update();
    return true;
  };
  const startUser = (email: string) => {
    prefill = '';
    data.user = email;
    data.guest = false;
    save();
    stack = [];
    notice = '';
    navigate({ page: 'home' }, true);
  };
  const logout = () => {
    data.user = null;
    data.guest = false;
    prefill = '';
    save();
    stack = [];
    held = '';
    notice = '';
    restoreState = '';
    setPanel(null);
    navigate({ page: 'signin' }, true);
  };
  const goCategory = (cat: Cat) => {
    held = '';
    navigate({ page: 'category', cat });
  };
  const openService = (
    cat: Cat,
    service = cats[cat],
    sticky: '' | 'loading' | 'error' = '',
  ) => {
    held = sticky;
    navigate({ page: 'provider', cat, service, phase: 'loading' });
    if (route.page !== 'provider' || sticky === 'loading') return;
    const current = ticket;
    timer = setTimeout(() => {
      if (ticket !== current) return;
      route = {
        page: 'provider',
        cat,
        service,
        phase: offline || sticky === 'error' ? 'error' : 'ready',
      };
      update();
    }, 450);
  };
  const auth = async (
    emailInput: string,
    pw: string,
    confirm?: string,
  ): Promise<FieldErrors | null> => {
    const email = emailInput.trim().toLowerCase(),
      errors: FieldErrors = {},
      registering = confirm !== undefined;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Enter a valid email address.';
    if (!pw) errors.password = 'Enter a password.';
    if (registering) {
      if (!confirm || confirm !== pw)
        errors.confirm = 'Enter the same password in both fields.';
      if (
        Object.hasOwn(data.accounts, email) ||
        Object.values(demos).some(d => d.email === email)
      )
        errors.email = 'This email already has an account.';
    }
    if (Object.keys(errors).length) return errors;
    if (offline) return { auth: 'You are offline. Reconnect and try again.' };
    try {
      if (registering) {
        const salt = Array.from({ length: 16 }, () =>
          Math.floor(Math.random() * 256)
            .toString(16)
            .padStart(2, '0'),
        ).join('');
        data.accounts[email] = { salt, hash: await digest(pw, salt) };
        save();
        prefill = email;
        notice = 'Account created. Sign in to open your hub.';
        navigate({ page: 'signin' });
      } else {
        const record = data.accounts[email];
        if (!record || (await digest(pw, record.salt)) !== record.hash)
          return { auth: 'Email or password is incorrect. Please try again.' };
        startUser(email);
      }
      return null;
    } catch {
      return { auth: 'Couldn’t complete this request. Please try again.' };
    }
  };
  const api = {
    get state() {
      return {
        ready,
        data: { ...data },
        route,
        canGoBack: stack.length > 0,
        held,
        offline,
        notice,
        sheetNotice,
        prefill,
        chosenDemo,
        outcome,
        restoreState,
        panel,
        demoCat,
      };
    },
    async hydrate() {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            parsed.accounts !== null &&
            Object.getPrototypeOf(parsed.accounts) === Object.prototype &&
            parsed.sessions !== null &&
            Object.getPrototypeOf(parsed.sessions) === Object.prototype &&
            (typeof parsed.user === 'string' || parsed.user === null) &&
            ['D1', 'D2'].includes(parsed.device)
          )
            data = {
              ...fresh(),
              ...parsed,
              guest: parsed.user === null && parsed.guest === true,
            };
        }
      } catch {}
      route = { page: data.user || data.guest ? 'home' : 'welcome' };
      ready = true;
      update();
    },
    dispose() {
      cancel();
    },
    navigate,
    back,
    startGuest() {
      data.user = null;
      data.guest = true;
      save();
      stack = [];
      notice = '';
      navigate({ page: 'home' }, true);
    },
    leaveGuest() {
      data.guest = false;
      save();
      stack = [];
      setPanel(null);
      navigate({ page: 'welcome' }, true);
    },
    openAuthPage(page: 'welcome' | 'signin' | 'register') {
      setPanel(null);
      notice = '';
      if (page === 'welcome' && data.guest) {
        data.guest = false;
        save();
        stack = [];
      }
      navigate({ page });
    },
    openRestore() {
      setPanel(null);
      restoreState = '';
      navigate({ page: 'restore' });
    },
    goHome() {
      held = '';
      navigate({ page: 'home' });
    },
    goCategory,
    openService,
    finishLoad() {
      if (route.page === 'provider') {
        cancel();
        held = '';
        route = { ...route, phase: offline ? 'error' : 'ready' };
        update();
      }
    },
    retry() {
      if (route.page === 'provider') openService(route.cat, route.service);
    },
    register(email: string, pw: string, confirm: string) {
      return auth(email, pw, confirm);
    },
    signIn(email: string, pw: string) {
      return auth(email, pw);
    },
    demoLogin() {
      setPanel(null);
      startUser(demos[chosenDemo].email);
    },
    logout,
    openPanel(name: PanelName) {
      setPanel(name);
      if (name === 'demo') demoCat = 'cat' in route ? route.cat : 'News';
      update();
    },
    closePanel() {
      setPanel(null);
      update();
    },
    chooseDemo(v: 'a' | 'b') {
      chosenDemo = v;
      sheetNotice = '';
      update();
    },
    setDemoCat(cat: Cat) {
      demoCat = cat;
      update();
    },
    hold(v: 'loading' | 'empty' | 'error') {
      setPanel(null);
      if (!data.user) {
        data.user = demos[chosenDemo].email;
        data.guest = false;
        save();
        stack = [];
      }
      offline = false;
      if (v === 'empty') {
        held = v;
        navigate({ page: 'category', cat: demoCat });
      } else if (v === 'error') {
        held = v;
        navigate({
          page: 'provider',
          cat: demoCat,
          service: cats[demoCat],
          phase: 'error',
        });
      } else openService(demoCat, cats[demoCat], 'loading');
    },
    toggleOffline() {
      setPanel(null);
      offline = !offline;
      if (offline && route.page === 'provider') {
        cancel();
        route = { ...route, phase: 'error' };
      }
      update();
      AccessibilityInfo.announceForAccessibility(
        offline ? 'Offline mode enabled.' : 'Back online.',
      );
    },
    startDevice2() {
      setPanel(null);
      data.device = 'D2';
      data.user = null;
      data.guest = false;
      prefill = '';
      for (const k of Object.keys(data.sessions)) {
        try {
          if (JSON.parse(k)[0] === 'D2') delete data.sessions[k];
        } catch {}
      }
      save();
      stack = [];
      held = '';
      offline = false;
      restoreState = '';
      notice = 'Device 2 is ready. Sign in with the same AIOHub account.';
      navigate({ page: 'signin' }, true);
    },
    returnDevice1() {
      data.device = 'D1';
      offline = false;
      logout();
      notice = 'Back on Device 1.';
      update();
    },
    seedSession() {
      if (demoCat === 'Game') {
        setPanel('demo');
        sheetNotice = 'Games do not use provider sessions.';
        update();
        AccessibilityInfo.announceForAccessibility(sheetNotice);
        return;
      }
      data.sessions[sessionKey(demoCat, 'D1')] = who() + ' · ' + cats[demoCat];
      save();
      setPanel('demo');
      sheetNotice =
        'Prepared ' + cats[demoCat] + ' for ' + who() + ' on Device 1.';
      update();
      AccessibilityInfo.announceForAccessibility(
        'Prepared ' + cats[demoCat] + ' on Device 1.',
      );
    },
    providerSignIn() {
      if (route.page === 'provider' && route.cat !== 'Game') {
        data.sessions[sessionKey(serviceKey(route.cat, route.service))] =
          who() + ' · ' + route.service;
        save();
        setPanel(null);
        update();
        AccessibilityInfo.announceForAccessibility('Provider signed in.');
      }
    },
    providerSignOut() {
      if (route.page === 'provider') {
        delete data.sessions[sessionKey(serviceKey(route.cat, route.service))];
        save();
        setPanel(null);
        update();
      }
    },
    session,
    serviceKey,
    who,
    setOutcome(v: Outcome) {
      outcome = v;
      restoreState = '';
      update();
    },
    runRestore() {
      cancel();
      restoreState = 'progress';
      update();
      const current = ticket;
      timer = setTimeout(() => {
        if (ticket !== current) return;
        const eligible = restorable.filter(({ key: k }) => session(k, 'D1'));
        restoreState = offline
          ? 'offline'
          : outcome === 'success'
          ? eligible.length
            ? 'success'
            : 'missing'
          : outcome;
        if (restoreState === 'success')
          eligible.forEach(({ key: k }) => {
            data.sessions[sessionKey(k)] = session(k, 'D1');
          });
        else if (restoreState === 'expired' || restoreState === 'unsupported')
          eligible.forEach(({ key: k }) => {
            delete data.sessions[sessionKey(k)];
          });
        save();
        update();
      }, 850);
    },
    restoredOpen() {
      const found = restorable.find(
        ({ key: k }) => session(k, 'D1') && session(k),
      );
      if (found) openService(found.cat, found.service);
    },
    restoreManual() {
      const found = restorable.find(({ key: k }) => session(k, 'D1')) || {
        cat: 'Music' as Cat,
        service: cats.Music,
      };
      if (offline) openService(found.cat, found.service);
      else {
        navigate({
          page: 'provider',
          cat: found.cat,
          service: found.service,
          phase: 'ready',
        });
        setPanel('provider');
        update();
      }
    },
    resetDemo() {
      cancel();
      data = fresh();
      save();
      stack = [];
      held = '';
      offline = false;
      outcome = 'success';
      restoreState = '';
      notice = '';
      prefill = '';
      chosenDemo = 'a';
      setPanel(null);
      navigate({ page: 'welcome' }, true);
    },
  };
  return api;
}
type Store = ReturnType<typeof createStore>;
type AppContext = Store['state'] & Omit<Store, 'state' | 'hydrate' | 'dispose'>;
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [, render] = useState(0);
  const ref = useRef<Store | null>(null);
  if (!ref.current) ref.current = createStore(() => render(n => n + 1));
  const store = ref.current;
  useEffect(() => {
    store.hydrate();
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (store.state.panel) {
        store.closePanel();
        return true;
      }
      const { data, route, canGoBack } = store.state;
      if (!canGoBack) {
        if (data.user || (route.page === 'welcome' && !data.guest))
          return false;
        store.navigate({ page: 'welcome' }, true);
        return true;
      }
      return store.back();
    });
    return () => {
      sub.remove();
      store.dispose();
    };
  }, [store]);
  return (
    <Context.Provider value={{ ...store, ...store.state }}>
      {children}
    </Context.Provider>
  );
}
export function useApp(): AppContext {
  const value = useContext(Context);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}
